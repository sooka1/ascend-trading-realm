import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Super-admin only: send a notification to every registered user.
export const broadcastNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { title: string; body?: string }) => {
    const title = (data?.title ?? "").trim();
    if (!title) throw new Error("العنوان مطلوب");
    if (title.length > 200) throw new Error("العنوان طويل جدًا");
    const body = (data?.body ?? "").trim();
    if (body.length > 2000) throw new Error("النص طويل جدًا");
    return { title, body, sendEmail: (data as any)?.sendEmail !== false };
  })
  .handler(async ({ data, context }) => {
    const { data: isSuper } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isSuper) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: logRow, error: logErr } = await supabaseAdmin
      .from("notification_broadcasts")
      .insert({
        sender_id: context.userId,
        title: data.title,
        body: data.body || null,
        status: "pending",
      })
      .select("id")
      .single();
    if (logErr) throw new Error(logErr.message);
    const logId = logRow.id as string;

    try {
      const { data: users, error: uerr } = await supabaseAdmin
        .from("profiles")
        .select("id");
      if (uerr) throw new Error(uerr.message);
      const rows = (users ?? []).map((u) => ({
        user_id: u.id,
        title: data.title,
        body: data.body || null,
      }));
      const chunkSize = 500;
      let sent = 0;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const { error } = await supabaseAdmin.from("notifications").insert(chunk);
        if (error) throw new Error(error.message);
        sent += chunk.length;
      }
      await supabaseAdmin
        .from("notification_broadcasts")
        .update({ status: "sent", recipients_count: sent })
        .eq("id", logId);

      // Fire browser/phone push notifications to all registered devices.
      try {
        const { data: subs } = await supabaseAdmin
          .from("push_subscriptions")
          .select("id, endpoint, p256dh, auth");
        if (subs && subs.length > 0) {
          const { sendPushToRows } = await import("@/lib/push.server");
          const res = await sendPushToRows(subs as any, {
            title: data.title,
            body: data.body || undefined,
            url: "/portal/notifications",
            tag: `broadcast-${logId}`,
          });
          if (res.staleIds.length > 0) {
            await supabaseAdmin
              .from("push_subscriptions")
              .delete()
              .in("id", res.staleIds);
          }
        }
      } catch {
        // Push failures should not roll back the DB notifications.
      }

      // Send the same-branded email to every registered user's inbox.
      if (data.sendEmail) {
        try {
          const { sendTemplateEmail } = await import(
            "@/lib/email-templates/send-email"
          );
          let page = 1;
          const perPage = 200;
          for (;;) {
            const { data: list, error } =
              await supabaseAdmin.auth.admin.listUsers({ page, perPage });
            if (error) break;
            const users = list?.users ?? [];
            if (users.length === 0) break;
            await Promise.allSettled(
              users
                .filter((u) => !!u.email)
                .map((u) =>
                  sendTemplateEmail("broadcast", u.email!, {
                    templateData: {
                      title: data.title,
                      body: data.body || undefined,
                      ctaLabel: "Open HKEX Invest",
                      ctaUrl: "https://hkexinvest.com/app",
                    },
                    idempotencyKey: `broadcast-${logId}-${u.id}`,
                  }),
                ),
            );
            if (users.length < perPage) break;
            page += 1;
          }
        } catch {
          // Email failures should not roll back the DB notifications.
        }
      }

      return { sent };
    } catch (e: any) {
      await supabaseAdmin
        .from("notification_broadcasts")
        .update({ status: "failed", error: String(e?.message ?? e) })
        .eq("id", logId);
      throw e;
    }
  });

// Super-admin only: list past broadcasts.
export const listBroadcasts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isSuper } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isSuper) throw new Error("Forbidden");
    const { data, error } = await context.supabase
      .from("notification_broadcasts")
      .select("id,title,body,recipients_count,status,error,created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });