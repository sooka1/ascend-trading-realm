import { Capacitor } from "@capacitor/core";
import { secureStore } from "./secure-store";

// Native app-lock:
// - Biometric (Face ID / Touch ID / Fingerprint) via capacitor-native-biometric.
// - PIN code fallback stored as sha256 in secure storage.
// - Auto-lock after configurable inactivity (default 5 min).
// - Session recovery: does NOT sign the user out — only gates the UI.
//
// This module exposes primitives. The UI (lock screen) is Sprint 2+.

const PIN_KEY = "hkex.pin.hash";
const LAST_ACTIVE_KEY = "hkex.last_active";
const AUTO_LOCK_MS = 5 * 60 * 1000;

async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function isBiometricAvailable(): Promise<{ available: boolean; kind?: string }> {
  if (!Capacitor.isNativePlatform()) return { available: false };
  try {
    const mod = await import("capacitor-native-biometric");
    const res = await mod.NativeBiometric.isAvailable();
    return { available: res.isAvailable, kind: String((res as any).biometryType ?? "") };
  } catch { return { available: false }; }
}

export async function biometricAuthenticate(reason = "Unlock HKEX"): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const mod = await import("capacitor-native-biometric");
    await mod.NativeBiometric.verifyIdentity({
      reason,
      title: "HKEX",
      subtitle: "Authenticate to continue",
      description: reason,
    });
    return true;
  } catch { return false; }
}

export async function setPin(pin: string) {
  if (!/^\d{4,8}$/.test(pin)) throw new Error("PIN must be 4-8 digits");
  await secureStore.set(PIN_KEY, await sha256(pin));
}
export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await secureStore.get(PIN_KEY);
  if (!stored) return false;
  return stored === (await sha256(pin));
}
export async function hasPin(): Promise<boolean> {
  return !!(await secureStore.get(PIN_KEY));
}
export async function clearPin() { await secureStore.remove(PIN_KEY); }

// Activity tracking — call markActivity() on user interaction; call shouldLock()
// on app resume / route change to decide whether to render the lock screen.
export async function markActivity() {
  await secureStore.set(LAST_ACTIVE_KEY, String(Date.now()));
}
export async function shouldAutoLock(now = Date.now()): Promise<boolean> {
  const last = await secureStore.get(LAST_ACTIVE_KEY);
  if (!last) return true;
  return now - Number(last) > AUTO_LOCK_MS;
}

// Wire browser events to auto-track activity. Idempotent.
let wired = false;
export function initAppLockActivity() {
  if (wired || typeof window === "undefined") return;
  wired = true;
  const evts = ["pointerdown", "keydown", "touchstart", "focus"];
  evts.forEach((e) => window.addEventListener(e, () => void markActivity(), { passive: true }));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void markActivity();
  });
}