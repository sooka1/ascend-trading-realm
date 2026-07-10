import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Returns the VAPID public key so the browser can create a subscription.
export const getVapidPublicKey = createServerFn({ method: "GET" }).handler(
  async () => {
    return { publicKey: process.env.VAPID_PUBLIC_KEY ?? "" };
  },
);

// Saves (upsert by endpoint) the current user's push subscription.
export const savePushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { endpoint: string; p256dh: string; auth: string; userAgent?: string }) => {
      if (!data?.endpoint || !data?.p256dh || !data?.auth) {
        throw new Error("Invalid subscription");
      }
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("push_subscriptions")
      .upsert(
        {
          user_id: context.userId,
          endpoint: data.endpoint,
          p256dh: data.p256dh,
          auth: data.auth,
          user_agent: data.userAgent ?? null,
        },
        { onConflict: "endpoint" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Removes a subscription (called on unsubscribe or when browser rotates it).
export const deletePushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { endpoint: string }) => data)
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", data.endpoint)
      .eq("user_id", context.userId);
    return { ok: true };
  });

// Sends a test push to the current user's own subscriptions only.
export const sendTestPushToSelf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data?: { title?: string; body?: string }) => data ?? {})
  .handler(async ({ data, context }) => {
    const { data: subs, error } = await context.supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    if (!subs || subs.length === 0) {
      return { sent: 0, failed: 0, subscriptions: 0 };
    }
    const { sendPushToRows } = await import("@/lib/push.server");
    const res = await sendPushToRows(subs as any, {
      title: data.title ?? "إشعار تجريبي",
      body: data.body ?? "يعمل الإشعار على هذا الجهاز ✓",
      url: "/portal/notifications",
      tag: "test-push",
    });
    if (res.staleIds.length > 0) {
      await context.supabase
        .from("push_subscriptions")
        .delete()
        .in("id", res.staleIds);
    }
    return { sent: res.sent, failed: res.failed, subscriptions: subs.length };
  });