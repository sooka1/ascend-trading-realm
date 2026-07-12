import { supabase } from "@/integrations/supabase/client";

// Coordinates app-resume synchronization. Consumers (screens) subscribe to
// the "app:sync" event, which fires when:
//   - the app returns to foreground (Capacitor App.appStateChange isActive)
//   - the browser tab becomes visible again
//   - the network transitions back to online
//
// A debounce prevents thrashing when multiple triggers fire simultaneously
// (resume + network-back typically fire within a few hundred ms). Realtime
// channels are reconnected via supabase.realtime.connect().

const DEBOUNCE_MS = 750;
const MIN_INTERVAL_MS = 3_000; // never re-sync more than every 3s
let lastSync = 0;
let timer: ReturnType<typeof setTimeout> | null = null;

export type SyncReason = "resume" | "visibility" | "network" | "manual";

function schedule(reason: SyncReason) {
  const now = Date.now();
  if (now - lastSync < MIN_INTERVAL_MS && reason !== "manual") return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    lastSync = Date.now();
    // Reconnect Supabase realtime — safe no-op when already connected.
    try { supabase.realtime.connect(); } catch {}
    window.dispatchEvent(new CustomEvent("app:sync", { detail: { reason, at: lastSync } }));
  }, DEBOUNCE_MS);
}

export function initAppResumeSync() {
  if (typeof window === "undefined") return;

  window.addEventListener("app:resume", () => schedule("resume"));
  window.addEventListener("app:network", (e) => {
    const s = (e as CustomEvent<{ connected: boolean }>).detail;
    if (s?.connected) schedule("network");
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") schedule("visibility");
  });
  window.addEventListener("online", () => schedule("network"));
}

export function requestAppSync(reason: SyncReason = "manual") {
  schedule(reason);
}