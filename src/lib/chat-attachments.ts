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

// Upload a file for the given ticket. Path convention: "<ticket_id>/<uuid>-<name>".
export async function uploadChatAttachment(
  ticketId: string,
  file: File,
): Promise<ChatAttachmentMeta> {
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error("حجم الملف يتجاوز 25 ميغابايت");
  }
  const id =
    (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const path = `${ticketId}/${id}-${safeName(file.name)}`;
  const { error } = await supabase.storage
    .from(CHAT_BUCKET)
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (error) throw error;
  return {
    attachment_path: path,
    attachment_name: file.name,
    attachment_mime: file.type || "application/octet-stream",
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