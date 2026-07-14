import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  kind: z.enum(["complaint", "suggestion", "contact"]),
  name: z.string().trim().min(1, "الاسم مطلوب").max(120),
  email: z.string().trim().email("بريد غير صالح").max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(5, "الرسالة قصيرة جداً").max(4000),
  source: z.string().trim().max(80).optional(),
});

export const sendSupportInquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    // Kept inside handler so it never ships to the client bundle.
    // Public-facing address is arabic.support@hkex.com (shown in UI/emails),
    // but delivery is routed to the super-admin inbox below.
    const SUPPORT_INBOX =
      process.env.SUPPORT_INBOX_EMAIL || "hkex.investment@gmail.com";
    const { sendTemplateEmail } = await import(
      "@/lib/email-templates/send-email"
    );
    const idempotencyKey = `support-${data.kind}-${data.email}-${Date.now()}`;
    const res = await sendTemplateEmail("support-inquiry", SUPPORT_INBOX, {
      templateData: {
        kind: data.kind,
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        source: data.source,
      },
      idempotencyKey,
      replyTo: data.email,
    });
    return { ok: res.sent === true };
  });