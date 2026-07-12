import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DevicePlatform = "ios" | "android" | "web";

// Register or refresh an FCM token for the current user on this device.
// One row per (user_id, device_id) — supports multiple devices per user.
export const registerDeviceToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    deviceId: string;
    platform: DevicePlatform;
    fcmToken: string;
    appVersion?: string;
    osVersion?: string;
    model?: string;
    locale?: string;
  }) => {
    if (!data?.deviceId || !data?.fcmToken || !data?.platform) {
      throw new Error("Invalid device token payload");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("device_tokens").upsert(
      {
        user_id: context.userId,
        device_id: data.deviceId,
        platform: data.platform,
        fcm_token: data.fcmToken,
        app_version: data.appVersion ?? null,
        os_version: data.osVersion ?? null,
        model: data.model ?? null,
        locale: data.locale ?? null,
        last_seen_at: new Date().toISOString(),
        revoked_at: null,
      },
      { onConflict: "user_id,device_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Revoke this device's token — call on logout / permission revoked.
export const revokeDeviceToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { deviceId: string }) => data)
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("device_tokens")
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", context.userId)
      .eq("device_id", data.deviceId);
    return { ok: true };
  });

// Heartbeat — updates last_seen_at, used on app resume.
export const pingDeviceToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { deviceId: string }) => data)
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("device_tokens")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("user_id", context.userId)
      .eq("device_id", data.deviceId);
    return { ok: true };
  });