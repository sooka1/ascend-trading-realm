import { Capacitor } from "@capacitor/core";

// Wraps @capacitor/camera. Handles front/back source, resolution, permission,
// EXIF orientation (plugin returns already-rotated JPEG) and returns a Blob.
// On web, falls back to <input type="file" capture>.
export type CaptureSource = "camera" | "gallery" | "prompt";
export type CaptureSide = "front" | "back";

export type CaptureResult = {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  mimeType: string;
  size: number;
};

export async function capturePhoto(opts: {
  source?: CaptureSource;
  side?: CaptureSide;
  maxWidth?: number;   // default 1600
  maxHeight?: number;  // default 1600
  quality?: number;    // 0-100, default 82
  allowEdit?: boolean; // native auto-crop
} = {}): Promise<CaptureResult | null> {
  const width = opts.maxWidth ?? 1600;
  const height = opts.maxHeight ?? 1600;
  const quality = opts.quality ?? 82;

  if (Capacitor.isNativePlatform()) {
    const { Camera, CameraResultType, CameraSource, CameraDirection } =
      await import("@capacitor/camera");
    const perm = await Camera.checkPermissions();
    if (perm.camera !== "granted" || perm.photos !== "granted") {
      await Camera.requestPermissions({ permissions: ["camera", "photos"] });
    }
    const source =
      opts.source === "camera" ? CameraSource.Camera :
      opts.source === "gallery" ? CameraSource.Photos :
      CameraSource.Prompt;
    const photo = await Camera.getPhoto({
      source,
      direction: opts.side === "front" ? CameraDirection.Front : CameraDirection.Rear,
      quality,
      width, height,
      allowEditing: opts.allowEdit ?? false,
      correctOrientation: true,
      resultType: CameraResultType.DataUrl,
      saveToGallery: false,
    });
    if (!photo.dataUrl) return null;
    const blob = dataUrlToBlob(photo.dataUrl);
    const dims = await readImageDims(photo.dataUrl);
    return { blob, dataUrl: photo.dataUrl, width: dims.w, height: dims.h,
             mimeType: blob.type, size: blob.size };
  }

  // Web fallback
  const file = await pickFileWeb({ accept: "image/*", capture: opts.source === "camera" ? (opts.side === "front" ? "user" : "environment") : undefined });
  if (!file) return null;
  return await compressImage(file, { maxWidth: width, maxHeight: height, quality });
}

export async function pickImages(opts: { multiple?: boolean; max?: number } = {}): Promise<CaptureResult[]> {
  if (Capacitor.isNativePlatform()) {
    const { Camera } = await import("@capacitor/camera");
    const perm = await Camera.checkPermissions();
    if (perm.photos !== "granted") await Camera.requestPermissions({ permissions: ["photos"] });
    const res = await Camera.pickImages({ limit: opts.multiple ? (opts.max ?? 10) : 1, quality: 82 });
    const out: CaptureResult[] = [];
    for (const p of res.photos) {
      const resp = await fetch(p.webPath ?? p.path ?? "");
      const blob = await resp.blob();
      const dataUrl = await blobToDataUrl(blob);
      const dims = await readImageDims(dataUrl);
      out.push({ blob, dataUrl, width: dims.w, height: dims.h, mimeType: blob.type, size: blob.size });
    }
    return out;
  }
  const files = await pickFileWeb({ accept: "image/*", multiple: opts.multiple });
  if (!files) return [];
  const arr = Array.isArray(files) ? files : [files];
  return Promise.all(arr.map((f) => compressImage(f, { maxWidth: 1600, maxHeight: 1600, quality: 82 })));
}

// ---------- helpers ----------

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(meta)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}

function readImageDims(src: string): Promise<{ w: number; h: number }> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => res({ w: 0, h: 0 });
    img.src = src;
  });
}

function pickFileWeb(opts: { accept: string; multiple?: boolean; capture?: "user" | "environment" }): Promise<File | File[] | null> {
  return new Promise((res) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = opts.accept;
    if (opts.multiple) input.multiple = true;
    if (opts.capture) (input as HTMLInputElement).setAttribute("capture", opts.capture);
    input.onchange = () => {
      const files = Array.from(input.files ?? []);
      if (!files.length) return res(null);
      res(opts.multiple ? files : files[0]);
    };
    input.click();
  });
}

export async function compressImage(file: Blob, opts: { maxWidth: number; maxHeight: number; quality: number }): Promise<CaptureResult> {
  const dataUrl = await blobToDataUrl(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });
  const ratio = Math.min(1, opts.maxWidth / img.naturalWidth, opts.maxHeight / img.naturalHeight);
  const w = Math.round(img.naturalWidth * ratio);
  const h = Math.round(img.naturalHeight * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  const outDataUrl = canvas.toDataURL("image/jpeg", opts.quality / 100);
  const blob = dataUrlToBlob(outDataUrl);
  return { blob, dataUrl: outDataUrl, width: w, height: h, mimeType: "image/jpeg", size: blob.size };
}