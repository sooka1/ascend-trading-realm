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