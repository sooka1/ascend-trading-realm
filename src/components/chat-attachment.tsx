import { useEffect, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import {
  getChatAttachmentUrl,
  isImageMime,
  isVideoMime,
  isAudioMime,
  formatBytes,
} from "@/lib/chat-attachments";

type Props = {
  path: string;
  name: string;
  mime: string;
  size: number;
};

// Renders a chat attachment (image/video/audio inline, other files as a
// download link). Fetches a short-lived signed URL from the private bucket.
export function ChatAttachment({ path, name, mime, size }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void getChatAttachmentUrl(path).then((u) => {
      if (cancelled) return;
      setUrl(u);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (loading) {
    return (
      <div className="mt-1 flex items-center gap-2 text-[11px] opacity-70">
        <Loader2 className="h-3 w-3 animate-spin" /> جارٍ تحميل المرفق…
      </div>
    );
  }
  if (!url) {
    return <div className="mt-1 text-[11px] text-red-300/80">تعذّر تحميل المرفق</div>;
  }

  if (isImageMime(mime)) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="mt-1 block">
        <img
          src={url}
          alt={name}
          className="max-h-64 max-w-full rounded-lg border border-white/10 object-contain"
        />
      </a>
    );
  }
  if (isVideoMime(mime)) {
    return (
      <video
        controls
        src={url}
        className="mt-1 max-h-64 max-w-full rounded-lg border border-white/10"
      />
    );
  }
  if (isAudioMime(mime)) {
    return <audio controls src={url} className="mt-1 w-full" />;
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      download={name}
      className="mt-1 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs hover:bg-white/[0.08]"
    >
      <FileText className="h-3.5 w-3.5" />
      <span className="max-w-[180px] truncate">{name}</span>
      <span className="opacity-60">{formatBytes(size)}</span>
      <Download className="h-3.5 w-3.5 opacity-70" />
    </a>
  );
}