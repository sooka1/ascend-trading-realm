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
    return { title, body };
  })
  .handler(async ({ data, context }) => {
    const { data: isSuper } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isSuper) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users, error: uerr } = await supabaseAdmin
      .from("profiles")
      .select("id");
    if (uerr) throw new Error(uerr.message);
    const rows = (users ?? []).map((u) => ({
      user_id: u.id,
      title: data.title,
      body: data.body || null,
    }));
    if (rows.length === 0) return { sent: 0 };
    // Insert in chunks to keep payloads reasonable.
    const chunkSize = 500;
    let sent = 0;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabaseAdmin.from("notifications").insert(chunk);
      if (error) throw new Error(error.message);
      sent += chunk.length;
    }
    return { sent };
  });