import { Capacitor } from "@capacitor/core";

// Thin secure key/value store. On native uses @capacitor/preferences
// (backed by Keychain on iOS and EncryptedSharedPreferences on Android).
// On web falls back to localStorage — Sprint 1 does not target web-native
// crypto; biometric/PIN gate is native-only.
export const secureStore = {
  async set(key: string, value: string) {
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.set({ key, value });
      return;
    }
    try { localStorage.setItem(key, value); } catch {}
  },
  async get(key: string): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import("@capacitor/preferences");
      const { value } = await Preferences.get({ key });
      return value ?? null;
    }
    try { return localStorage.getItem(key); } catch { return null; }
  },
  async remove(key: string) {
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.remove({ key });
      return;
    }
    try { localStorage.removeItem(key); } catch {}
  },
};