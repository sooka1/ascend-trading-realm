import { Capacitor } from "@capacitor/core";

// Offline-aware action queue.
// Producers call `enqueue({ id, kind, payload, run })` when they know the
// action is safe to retry (idempotent by id). If the network is up the
// action runs immediately; otherwise it is stored and retried automatically
// on the next online event.
//
// Weak-connection detection: repeated failures within a short window mark
// the network as "weak" and back off exponentially, up to 30 s.

export type NetStatus = "online" | "offline" | "weak";

type QueuedAction = {
  id: string;
  kind: string;
  createdAt: number;
  attempts: number;
  payload: unknown;
};

const STORAGE_KEY = "hkex.action_queue";
const runners = new Map<string, (payload: any) => Promise<void>>();
let status: NetStatus = "online";
let listeners = new Set<(s: NetStatus) => void>();
let backoffMs = 0;
let flushing = false;

function load(): QueuedAction[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function save(list: QueuedAction[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

export function registerRunner(kind: string, run: (payload: any) => Promise<void>) {
  runners.set(kind, run);
}

export async function enqueue(action: {
  id: string;
  kind: string;
  payload: unknown;
  run: (payload: any) => Promise<void>;
}) {
  runners.set(action.kind, action.run);
  const list = load();
  if (!list.find((a) => a.id === action.id)) {
    list.push({ id: action.id, kind: action.kind, payload: action.payload, createdAt: Date.now(), attempts: 0 });
    save(list);
  }
  if (status !== "offline") void flush();
}

export async function flush(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    const list = load();
    if (!list.length) return;
    const remaining: QueuedAction[] = [];
    let failures = 0;
    for (const a of list) {
      const run = runners.get(a.kind);
      if (!run) { remaining.push(a); continue; }
      try {
        await run(a.payload);
      } catch {
        a.attempts++;
        failures++;
        if (a.attempts < 10) remaining.push(a);
      }
    }
    save(remaining);
    if (failures > 0 && remaining.length > 0) {
      backoffMs = Math.min(30_000, Math.max(1_000, backoffMs * 2 || 1_000));
      setStatus("weak");
      setTimeout(() => void flush(), backoffMs);
    } else {
      backoffMs = 0;
      setStatus(status === "offline" ? "offline" : "online");
    }
  } finally {
    flushing = false;
  }
}

function setStatus(next: NetStatus) {
  if (status === next) return;
  status = next;
  listeners.forEach((cb) => cb(next));
  window.dispatchEvent(new CustomEvent("app:netstatus", { detail: next }));
}

export function getNetStatus(): NetStatus { return status; }
export function onNetStatus(cb: (s: NetStatus) => void) { listeners.add(cb); return () => listeners.delete(cb); }

export async function initNetworkRecovery() {
  if (typeof window === "undefined") return;

  const applyStatus = (connected: boolean) => {
    setStatus(connected ? "online" : "offline");
    if (connected) void flush();
  };

  if (Capacitor.isNativePlatform()) {
    try {
      const { Network } = await import("@capacitor/network");
      const s = await Network.getStatus();
      applyStatus(s.connected);
      Network.addListener("networkStatusChange", (n) => applyStatus(n.connected));
    } catch {}
  } else {
    applyStatus(typeof navigator === "undefined" ? true : navigator.onLine);
    window.addEventListener("online", () => applyStatus(true));
    window.addEventListener("offline", () => applyStatus(false));
  }
}