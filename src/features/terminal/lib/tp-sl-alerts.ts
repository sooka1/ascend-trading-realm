// Persistent TP/SL alert log + settings (localStorage-backed).
export type AlertKind = "TP" | "SL";
export type AlertEntry = {
  key: string;          // `${posId}:${kind}` — used for dedupe
  posId: string;
  symbol: string;
  kind: AlertKind;
  side: "buy" | "sell";
  price: number;
  entry: number;
  volume: number;
  at: number;           // ms epoch
  result: "hit";
};
export type AlertSettings = {
  sound: boolean;
  flash: boolean;
  toastMs: number;
};

const LOG_KEY = "hk.tpsl.alerts.v1";
const SEEN_KEY = "hk.tpsl.seen.v1";
const SETTINGS_KEY = "hk.tpsl.settings.v1";
const MAX_LOG = 200;

export const DEFAULT_ALERT_SETTINGS: AlertSettings = {
  sound: true, flash: true, toastMs: 5000,
};

function safeRead<T>(k: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function safeWrite(k: string, v: unknown) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(k, JSON.stringify(v));
  } catch { /* noop */ }
}

export function loadAlertLog(): AlertEntry[] {
  return safeRead<AlertEntry[]>(LOG_KEY, []);
}
export function saveAlertLog(log: AlertEntry[]) {
  safeWrite(LOG_KEY, log.slice(0, MAX_LOG));
}
export function loadSeen(): Set<string> {
  return new Set(safeRead<string[]>(SEEN_KEY, []));
}
export function saveSeen(seen: Set<string>) {
  safeWrite(SEEN_KEY, Array.from(seen));
}
export function loadAlertSettings(): AlertSettings {
  return { ...DEFAULT_ALERT_SETTINGS, ...safeRead<Partial<AlertSettings>>(SETTINGS_KEY, {}) };
}
export function saveAlertSettings(s: AlertSettings) {
  safeWrite(SETTINGS_KEY, s);
}

let audioCtx: AudioContext | null = null;
export function playAlertSound(kind: AlertKind) {
  if (typeof window === "undefined") return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.value = kind === "TP" ? 880 : 440;
    g.gain.value = 0.06;
    o.connect(g).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + 0.18);
  } catch { /* noop */ }
}
