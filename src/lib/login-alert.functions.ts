import { createServerFn } from "@tanstack/react-start";
import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendTemplateEmail } from "@/lib/email-templates/send-email";

export const notifyLoginAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: userRes } = await supabase.auth.getUser();
    const email = userRes.user?.email;
    if (!email) return { sent: false as const };

    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    const ua = getRequestHeader("user-agent") ?? "unknown device";
    const when = new Date().toUTCString();

    try {
      await sendTemplateEmail("security-alert", email, {
        templateData: {
          event: "New sign-in to your account",
          ip,
          device: ua,
          when,
        },
        idempotencyKey: `login-alert-${userId}-${Date.now()}`,
      });
    } catch {
      // non-fatal
    }
    return { sent: true as const };
  });