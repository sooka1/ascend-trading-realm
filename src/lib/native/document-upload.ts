import { compressImage, capturePhoto, type CaptureResult } from "./camera";

// Client-side document validation. Backend still validates on ingest —
// this is a fast UX guard, not a security boundary.
export type DocumentKind =
  | "passport"
  | "national_id"
  | "driving_license"
  | "proof_of_address"
  | "selfie";

export const ACCEPTED_MIME = ["image/jpeg", "image/png", "application/pdf"] as const;
const MAX_BYTES = 12 * 1024 * 1024; // 12 MB pre-compression
const MIN_IMG_W = 600;
const MIN_IMG_H = 400;

export type ValidationResult =
  | { ok: true; file: Blob; kind: DocumentKind; mimeType: string; size: number; width?: number; height?: number }
  | { ok: false; error: string };

export async function validateDocument(input: Blob | CaptureResult, kind: DocumentKind): Promise<ValidationResult> {
  const blob = "blob" in input ? input.blob : input;
  const mime = blob.type || "application/octet-stream";
  if (!ACCEPTED_MIME.includes(mime as any)) {
    return { ok: false, error: "Only JPG, PNG or PDF files are allowed" };
  }
  if (blob.size > MAX_BYTES) {
    return { ok: false, error: "File must be under 12 MB" };
  }
  // PDFs skip pixel checks.
  if (mime === "application/pdf") {
    return { ok: true, file: blob, kind, mimeType: mime, size: blob.size };
  }
  // Compress + ensure minimum resolution for readability.
  const compressed = "blob" in input && input.width
    ? input
    : await compressImage(blob, { maxWidth: 2000, maxHeight: 2000, quality: 85 });
  if (compressed.width < MIN_IMG_W || compressed.height < MIN_IMG_H) {
    return { ok: false, error: `Image resolution too low (min ${MIN_IMG_W}x${MIN_IMG_H})` };
  }
  return {
    ok: true, file: compressed.blob, kind,
    mimeType: compressed.mimeType, size: compressed.size,
    width: compressed.width, height: compressed.height,
  };
}

// Convenience: capture + validate in one step.
export async function captureDocument(kind: DocumentKind): Promise<ValidationResult> {
  const isSelfie = kind === "selfie";
  const res = await capturePhoto({
    source: isSelfie ? "camera" : "prompt",
    side: isSelfie ? "front" : "back",
    maxWidth: 2000, maxHeight: 2000, quality: 85,
    allowEdit: !isSelfie,
  });
  if (!res) return { ok: false, error: "Capture cancelled" };
  return validateDocument(res, kind);
}