import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceMeta } from "./device-id";

// Firebase Cloud Messaging via @capacitor/push-notifications.
// The plugin uses APNs on iOS and FCM on Android when
// google-services.json / GoogleService-Info.plist are bundled.
let initialized = false;
let currentDeviceId: string | null = null;

export async function initPushNotifications() {
  if (initialized) return;
  if (!Capacitor.isNativePlatform()) return;
  initialized = true;

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    const perm = await PushNotifications.checkPermissions();
    let granted = perm.receive === "granted";
    if (!granted) {
      const req = await PushNotifications.requestPermissions();
      granted = req.receive === "granted";
    }
    if (!granted) return;

    // Token registration — fires on install and on every refresh.
    PushNotifications.addListener("registration", async (t) => {
      await saveToken(t.value);
    });

    PushNotifications.addListener("registrationError", (err) => {
      // Non-fatal — surfaces to console for triage, never crashes app.
      console.warn("[push] registration error", err);
    });

    // Foreground receipt — hand to the notifications-listener via event.
    PushNotifications.addListener("pushNotificationReceived", (n) => {
      window.dispatchEvent(new CustomEvent("push:received", { detail: n }));
    });

    // Tapped notification — deep-link via handleDeepLink.
    PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      const data = action.notification?.data ?? {};
      const url = (data as any).url || (data as any).deep_link;
      if (typeof url === "string") {
        window.dispatchEvent(new CustomEvent("app:deeplink", { detail: url }));
      }
    });

    await PushNotifications.register();
  } catch (e) {
    console.warn("[push] init failed", e);
  }
}

async function saveToken(token: string) {
  try {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) return; // register after login
    const meta = await getDeviceMeta();
    currentDeviceId = meta.deviceId;
    const { registerDeviceToken } = await import("@/lib/device-tokens.functions");
    await registerDeviceToken({
      data: {
        deviceId: meta.deviceId,
        platform: meta.platform,
        fcmToken: token,
        appVersion: meta.appVersion,
        osVersion: meta.osVersion,
        model: meta.model,
        locale: meta.locale,
      },
    });
  } catch (e) {
    console.warn("[push] saveToken failed", e);
  }
}

// Called on logout — revokes this device's token so no further pushes are sent.
export async function revokeCurrentPushToken() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const meta = await getDeviceMeta();
    const { revokeDeviceToken } = await import("@/lib/device-tokens.functions");
    await revokeDeviceToken({ data: { deviceId: currentDeviceId ?? meta.deviceId } });
  } catch {}
}