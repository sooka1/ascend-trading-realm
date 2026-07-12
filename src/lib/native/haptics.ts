// Lightweight haptic feedback shim. Uses Capacitor Haptics when available,
// falls back to navigator.vibrate on web/Android browsers, and no-ops
// everywhere else. Safe to call from any UI handler.
type Intensity = "light" | "medium" | "heavy" | "success" | "warning" | "error";

export async function haptic(kind: Intensity = "light"): Promise<void> {
  try {
    const cap = (globalThis as any).Capacitor;
    if (cap?.isNativePlatform?.()) {
      const mod: any = await import(/* @vite-ignore */ "@capacitor/haptics").catch(() => null);
      if (mod?.Haptics) {
        if (kind === "success" || kind === "warning" || kind === "error") {
          await mod.Haptics.notification({ type: kind });
        } else {
          await mod.Haptics.impact({ style: kind });
        }
        return;
      }
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      const ms = kind === "heavy" ? 30 : kind === "medium" ? 15 : 8;
      navigator.vibrate?.(ms);
    }
  } catch {
    // silently ignore
  }
}