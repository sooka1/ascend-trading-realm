import { useEffect, useRef, useState } from "react";
import { X, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import {
  isImageMime,
  isVideoMime,
  isAudioMime,
  formatBytes,
} from "@/lib/chat-attachments";

export type UploadStatus = "idle" | "uploading" | "done" | "error";

// Local preview of a file the user is about to send. Uses an object URL so
// the preview shows instantly with no upload/round-trip.
export function ChatAttachmentPreview({
  file,
  onRemove,
  status = "idle",
  progress = 0,
  error,
}: {
  file: File;
  onRemove: () => void;
  status?: UploadStatus;
  progress?: number;
  error?: string | null;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const mime = file.type;
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));

  // Track upload speed (bytes/sec) by sampling progress deltas over time.
  const sampleRef = useRef<{ t: number; loaded: number } | null>(null);
  const [speed, setSpeed] = useState<number>(0);
  useEffect(() => {
    if (status !== "uploading") {
      sampleRef.current = null;
      setSpeed(0);
      return;
    }
    const loaded = progress * file.size;
    const now = performance.now();
    const prev = sampleRef.current;
    if (prev && now - prev.t > 150) {
      const dt = (now - prev.t) / 1000;
      const db = Math.max(0, loaded - prev.loaded);
      const inst = db / dt;
      // Smooth with EMA to avoid jitter.
      setSpeed((s) => (s === 0 ? inst : s * 0.6 + inst * 0.4));
      sampleRef.current = { t: now, loaded };
    } else if (!prev) {
      sampleRef.current = { t: now, loaded };
    }
  }, [progress, status, file.size]);

  const remaining =
    status === "uploading" && speed > 0
      ? Math.max(0, Math.round(((1 - progress) * file.size) / speed))
      : 0;

  return (
    <div className="mb-1 flex items-start gap-2 rounded-md border border-white/10 bg-white/[0.04] p-2 text-[11px]">
      <div className="flex-1 min-w-0">
        {url && isImageMime(mime) && (
          <img
            src={url}
            alt={file.name}
            className="max-h-32 max-w-full rounded-md border border-white/10 object-contain"
          />
        )}
        {url && isVideoMime(mime) && (
          <video
            src={url}
            controls
            className="max-h-32 max-w-full rounded-md border border-white/10"
          />
        )}
        {url && isAudioMime(mime) && <audio src={url} controls className="w-full" />}
        {!isImageMime(mime) && !isVideoMime(mime) && !isAudioMime(mime) && (
          <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span className="max-w-[180px] truncate">{file.name}</span>
          </div>
        )}
        <p className="mt-1 truncate opacity-70">
          {file.name} <span className="opacity-60">({formatBytes(file.size)})</span>
        </p>
        {status !== "idle" && (
          <div className="mt-1.5 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px]">
              {status === "uploading" && (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-gold" />
                  <span>
                    جارٍ الرفع… {pct}%
                    {speed > 0 && (
                      <span className="opacity-70">
                        {" "}
                        · {formatBytes(speed)}/ث
                        {remaining > 0 ? ` · ${remaining}ث متبقية` : ""}
                      </span>
                    )}
                  </span>
                </>
              )}
              {status === "done" && (
                <>
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">تم الرفع</span>
                </>
              )}
              {status === "error" && (
                <>
                  <AlertCircle className="h-3 w-3 text-red-400" />
                  <span className="text-red-400 truncate">
                    فشل الرفع{error ? ` — ${error}` : ""}
                  </span>
                </>
              )}
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full transition-all duration-200 ${
                  status === "error"
                    ? "bg-red-500"
                    : status === "done"
                      ? "bg-emerald-500"
                      : "bg-gold"
                }`}
                style={{ width: `${status === "done" ? 100 : pct}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        className="rounded-full p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"
        onClick={onRemove}
        aria-label="إزالة المرفق"
        disabled={status === "uploading"}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}