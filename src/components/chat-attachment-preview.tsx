import { useEffect, useState } from "react";
import { X, FileText } from "lucide-react";
import {
  isImageMime,
  isVideoMime,
  isAudioMime,
  formatBytes,
} from "@/lib/chat-attachments";

// Local preview of a file the user is about to send. Uses an object URL so
// the preview shows instantly with no upload/round-trip.
export function ChatAttachmentPreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const mime = file.type;

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
      </div>
      <button
        type="button"
        className="rounded-full p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"
        onClick={onRemove}
        aria-label="إزالة المرفق"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}