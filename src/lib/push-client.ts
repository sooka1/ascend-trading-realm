import { supabase } from "@/integrations/supabase/client";
import { getVapidPublicKey, savePushSubscription } from "@/lib/push.functions";

function urlB64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

function bufToB64(buf: ArrayBuffer | null): string {
  if (!buf) return "";
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function canUsePush(): boolean {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;
  if (!("PushManager" in window)) return false;
  if (window.self !== window.top) return false; // no push in Lovable preview iframe
  const h = window.location.hostname;
  if (
    h.startsWith("id-preview--") ||
    h.startsWith("preview--") ||
    h.endsWith(".lovableproject.com") ||
    h.endsWith(".lovableproject-dev.com") ||
    h.endsWith(".beta.lovable.dev")
  )
    return false;
  return true;
}

// Registers a push subscription for the current user (if permission is
// granted). Safe to call multiple times — it upserts by endpoint.
export async function ensurePushSubscription(): Promise<boolean> {
  if (!canUsePush()) return false;
  if (Notification.permission !== "granted") return false;
  try {
    const reg = await navigator.serviceWorker.register("/chat-notification-sw.js", {
      scope: "/",
    });
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) return false;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const { publicKey } = await getVapidPublicKey();
      if (!publicKey) return false;
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(publicKey).buffer as ArrayBuffer,
      });
    }
    const json = sub.toJSON();
    const p256dh = json.keys?.p256dh ?? bufToB64(sub.getKey("p256dh"));
    const auth = json.keys?.auth ?? bufToB64(sub.getKey("auth"));
    await savePushSubscription({
      data: {
        endpoint: sub.endpoint,
        p256dh,
        auth,
        userAgent: navigator.userAgent,
      },
    });
    return true;
  } catch {
    return false;
  }
}