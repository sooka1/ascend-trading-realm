import { Capacitor } from "@capacitor/core";

// Stable device id (persists across app launches; regenerated after uninstall).
// On native uses @capacitor/device; on web falls back to a stored UUID.
const KEY = "hkex.device_id";
let cached: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  try {
    if (Capacitor.isNativePlatform()) {
      const { Device } = await import("@capacitor/device");
      const info = await Device.getId();
      cached = info.identifier;
      return cached;
    }
  } catch {}
  try {
    const existing = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    if (existing) return (cached = existing);
    const generated = crypto.randomUUID();
    localStorage.setItem(KEY, generated);
    return (cached = generated);
  } catch {
    return (cached = "web-" + Math.random().toString(36).slice(2));
  }
}

export async function getDeviceMeta() {
  const out = {
    deviceId: await getDeviceId(),
    platform: (Capacitor.getPlatform() as "ios" | "android" | "web"),
    osVersion: undefined as string | undefined,
    model: undefined as string | undefined,
    appVersion: undefined as string | undefined,
    locale: typeof navigator !== "undefined" ? navigator.language : undefined,
  };
  try {
    if (Capacitor.isNativePlatform()) {
      const { Device } = await import("@capacitor/device");
      const info = await Device.getInfo();
      out.osVersion = info.osVersion;
      out.model = info.model;
      const { App } = await import("@capacitor/app");
      const appInfo = await App.getInfo();
      out.appVersion = appInfo.version;
    }
  } catch {}
  return out;
}