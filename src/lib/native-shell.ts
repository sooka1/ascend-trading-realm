// Capacitor native mobile shell: status bar, splash screen, hardware back
// button, keyboard, network monitor, haptics. All calls are guarded with
// Capacitor.isNativePlatform() so the same bundle runs safely on web.
import { Capacitor } from "@capacitor/core";
import { initPushNotifications, revokeCurrentPushToken } from "@/lib/native/push";
import { initDeepLinks } from "@/lib/native/deep-links";
import { initAppLockActivity } from "@/lib/native/biometric";
import { initAppResumeSync } from "@/lib/native/app-resume";
import { initNetworkRecovery } from "@/lib/native/network-queue";
import { initCrashHandler } from "@/lib/native/crash-handler";
import { supabase } from "@/integrations/supabase/client";

let initialized = false;

export async function initNativeShell(opts: {
  onBack?: () => boolean; // return true if handled, false to let system pop
}) {
  if (initialized) return;
  if (typeof window === "undefined") return;
  initialized = true;

  // Cross-platform Sprint 1 wiring — safe on web too.
  initCrashHandler();
  initAppLockActivity();
  initAppResumeSync();
  void initNetworkRecovery();
  void initDeepLinks();

  // Revoke this device's FCM token on sign-out.
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") void revokeCurrentPushToken();
    if (event === "SIGNED_IN") void initPushNotifications();
  });

  if (!Capacitor.isNativePlatform()) return;

  // Native-only: push registration, status bar, splash, keyboard, back button, app state.
  void initPushNotifications();

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({ color: "#0b0b0f" }).catch(() => {});
  } catch {}

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide({ fadeOutDuration: 250 });
  } catch {}

  try {
    const { Keyboard } = await import("@capacitor/keyboard");
    Keyboard.setAccessoryBarVisible({ isVisible: false }).catch(() => {});
  } catch {}

  try {
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", ({ canGoBack }: { canGoBack: boolean }) => {
      const handled = opts.onBack?.();
      if (handled) return;
      if (canGoBack) window.history.back();
      else App.exitApp();
    });
    // Background/foreground resume — invalidate caches on resume.
    App.addListener("appStateChange", (state: { isActive: boolean }) => {
      if (state.isActive) {
        window.dispatchEvent(new CustomEvent("app:resume"));
      }
    });
  } catch {}

  try {
    const { Network } = await import("@capacitor/network");
    Network.addListener("networkStatusChange", (s: unknown) => {
      window.dispatchEvent(new CustomEvent("app:network", { detail: s }));
    });
  } catch {}
}

export async function hapticImpact(style: "light" | "medium" | "heavy" = "light") {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
    await Haptics.impact({ style: map[style] });
  } catch {}
}

export async function nativeShare(data: { title?: string; text?: string; url?: string }) {
  try {
    if (Capacitor.isNativePlatform()) {
      const { Share } = await import("@capacitor/share");
      await Share.share(data);
      return true;
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share(data);
      return true;
    }
  } catch {}
  return false;
}

export const isNative = () => Capacitor.isNativePlatform();
export const nativePlatform = () => Capacitor.getPlatform();