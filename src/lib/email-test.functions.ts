import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const sendTestEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { to: string; title?: string; body?: string }) => {
    const to = (data?.to ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error("عنوان بريد غير صالح");
    const title = (data?.title ?? "بريد اختبار من HKEX").trim().slice(0, 200);
    const body = (data?.body ?? "هذا بريد اختبار للتحقق من الإرسال.").trim().slice(0, 2000);
    return { to, title, body };
  })
  .handler(async ({ data, context }) => {
    const { data: isSuper } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isSuper) throw new Error("Forbidden");

    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    try {
      const res = await sendTemplateEmail("broadcast", data.to, {
        templateData: {
          title: data.title,
          body: data.body,
          ctaLabel: "Open HKEX Invest",
          ctaUrl: "https://hkexinvest.com/app",
        },
        idempotencyKey: `test-${Date.now()}-${data.to}`,
      });
      if (res.sent) return { ok: true as const, message: `تم الإرسال إلى ${data.to}` };
      return { ok: false as const, message: `المستلم محظور: ${res.reason}` };
    } catch (e: any) {
      return {
        ok: false as const,
        message: e?.message ?? "فشل الإرسال",
        code: e?.code,
        status: e?.status,
      };
    }
  });