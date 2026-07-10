import { supabase } from "@/integrations/supabase/client";

export const CHAT_BUCKET = "chat-attachments";
export const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024; // 25 MB

export type ChatAttachmentMeta = {
  attachment_path: string;
  attachment_name: string;
  attachment_mime: string;
  attachment_size: number;
};

function safeName(name: string): string {
  return name.replace(/[^\w.\-]+/g, "_").slice(0, 120);
}

// Upload a file for the given ticket, streaming progress updates via XHR so
// the UI can show a real progress bar (Supabase JS client doesn't expose
// upload progress). Path convention: "<ticket_id>/<uuid>-<name>".
export async function uploadChatAttachment(
  ticketId: string,
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<ChatAttachmentMeta> {
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error("حجم الملف يتجاوز 25 ميغابايت");
  }
  const id =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${ticketId}/${id}-${safeName(file.name)}`;
  const contentType = file.type || "application/octet-stream";

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  if (!supabaseUrl || !anonKey || !accessToken) {
    // Fallback to the JS client (no progress) if config is missing.
    const { error } = await supabase.storage
      .from(CHAT_BUCKET)
      .upload(path, file, { contentType, upsert: false });
    if (error) throw error;
    onProgress?.(1);
    return {
      attachment_path: path,
      attachment_name: file.name,
      attachment_mime: contentType,
      attachment_size: file.size,
    };
  }

  const url = `${supabaseUrl}/storage/v1/object/${CHAT_BUCKET}/${path}`;
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("apikey", anonKey);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1);
        resolve();
      } else {
        reject(new Error(xhr.responseText || `فشل الرفع (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("خطأ في الشبكة أثناء الرفع"));
    xhr.onabort = () => reject(new Error("أُلغي الرفع"));
    xhr.send(file);
  });

  return {
    attachment_path: path,
    attachment_name: file.name,
    attachment_mime: contentType,
    attachment_size: file.size,
  };
}

export async function getChatAttachmentUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(CHAT_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}

export function isImageMime(m: string | null | undefined): boolean {
  return !!m && m.startsWith("image/");
}
export function isVideoMime(m: string | null | undefined): boolean {
  return !!m && m.startsWith("video/");
}
export function isAudioMime(m: string | null | undefined): boolean {
  return !!m && m.startsWith("audio/");
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}