// Small helpers to alert both parties on a new chat message:
// a short WebAudio beep + a sonner toast. No asset files required.
import { toast } from "sonner";

let ctx: AudioContext | null = null;
let swRegPromise: Promise<ServiceWorkerRegistration | null> | null = null;
let audioUnlocked = false;
let unlockBound = false;

function getCtx(): AudioContext | null {
  const AC =
    (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
      .AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = ctx ?? new AC();
  return ctx;
}

export function primeChatAudio() {
  if (typeof window === "undefined" || unlockBound) return;
  unlockBound = true;
  const unlock = () => {
    try {
      const c = getCtx();
      if (!c) return;
      if (c.state === "suspended") void c.resume();
      // Play a silent buffer to fully unlock on iOS/Safari.
      const buffer = c.createBuffer(1, 1, 22050);
      const src = c.createBufferSource();
      src.buffer = buffer;
      src.connect(c.destination);
      src.start(0);
      audioUnlocked = true;
    } catch {
      /* ignore */
    }
  };
  const opts: AddEventListenerOptions = { once: true, capture: true };
  window.addEventListener("pointerdown", unlock, opts);
  window.addEventListener("keydown", unlock, opts);
  window.addEventListener("touchstart", unlock, opts);
}

function isPreviewHost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return (
    h.startsWith("id-preview--") ||
    h.startsWith("preview--") ||
    h === "lovableproject.com" ||
    h.endsWith(".lovableproject.com") ||
    h === "lovableproject-dev.com" ||
    h.endsWith(".lovableproject-dev.com") ||
    h === "beta.lovable.dev" ||
    h.endsWith(".beta.lovable.dev") ||
    window.self !== window.top
  );
}

export function canUseChatNotifications(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "Notification" in window &&
    !isPreviewHost()
  );
}

export function registerChatNotificationSW(): Promise<ServiceWorkerRegistration | null> {
  if (!canUseChatNotifications()) return Promise.resolve(null);
  if (!swRegPromise) {
    swRegPromise = navigator.serviceWorker
      .register("/chat-notification-sw.js", { scope: "/" })
      .catch(() => null);
  }
  return swRegPromise;
}

export async function ensureChatNotificationPermission(): Promise<NotificationPermission> {
  if (!canUseChatNotifications()) return "denied";
  if (Notification.permission === "default") {
    try { return await Notification.requestPermission(); } catch { return "denied"; }
  }
  return Notification.permission;
}

async function showSystemNotification(title: string, body?: string, url?: string) {
  if (!canUseChatNotifications()) return;
  if (Notification.permission !== "granted") return;
  const reg = await registerChatNotificationSW();
  const payload = { type: "chat-notify", title, body: body ?? "", url: url ?? window.location.pathname, tag: "hk-chat" };
  if (reg && reg.active) {
    reg.active.postMessage(payload);
    return;
  }
  try {
    const r = reg ?? (await navigator.serviceWorker.ready);
    await r.showNotification(title, {
      body: body ?? "",
      tag: "hk-chat",
      icon: "/android-chrome-192x192.png",
      data: { url: url ?? window.location.pathname },
    });
  } catch { /* ignore */ }
}

export function playChatChime() {
  try {
    const c = getCtx();
    if (!c) return;
    if (c.state === "suspended") void c.resume();
    const now = c.currentTime;
    const notes = [880, 1320];
    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.12;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(start + 0.24);
    });
    audioUnlocked = true;
  } catch {
    /* ignore audio failures */
  }
}

export function notifyIncomingMessage(title: string, description?: string, url?: string) {
  playChatChime();
  toast(title, description ? { description } : undefined);
  // Show OS/browser notification when the tab is hidden or unfocused,
  // so the other party is alerted even without the chat tab open.
  if (typeof document !== "undefined" && (document.hidden || !document.hasFocus())) {
    void showSystemNotification(title, description, url);
  }
}