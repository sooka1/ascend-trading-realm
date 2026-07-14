// Biometric preferences shared between the app-lock gate and sensitive-action
// confirmations. Stored in localStorage per-device (biometrics are always
// device-scoped) so they survive sign-outs but never leave the device.

import { Capacitor } from "@capacitor/core";
import { biometricAuthenticate, isBiometricAvailable } from "./biometric";

const APP_LOCK_KEY = "hkex.biometric.appLock";
const SENSITIVE_KEY = "hkex.biometric.sensitive";

function read(key: string): boolean {
  if (typeof window === "undefined") return false;
  try { return window.localStorage.getItem(key) === "1"; } catch { return false; }
}
function write(key: string, on: boolean) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, on ? "1" : "0"); } catch { /* ignore */ }
}

export const biometricPrefs = {
  appLockEnabled: () => read(APP_LOCK_KEY),
  sensitiveEnabled: () => read(SENSITIVE_KEY),
  setAppLock: (on: boolean) => write(APP_LOCK_KEY, on),
  setSensitive: (on: boolean) => write(SENSITIVE_KEY, on),
};

// Gate a sensitive operation (withdrawal, transfer, password change …) behind
// biometric verification. On non-native platforms or when the user hasn't
// enabled the setting this resolves `true` immediately so the flow is not
// blocked in the web preview.
export async function requireBiometricForSensitive(reason: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;
  if (!biometricPrefs.sensitiveEnabled()) return true;
  const { available } = await isBiometricAvailable();
  if (!available) return true;
  return biometricAuthenticate(reason);
}