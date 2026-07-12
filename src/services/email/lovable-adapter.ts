// Default adapter — delegates to the existing Lovable managed email helper.
// Server-only. Do not import from client bundles.
import type { EmailService, SendTemplateEmailOptions } from "./types";

export const lovableEmailService: EmailService = {
  async sendTemplate(
    templateName: string,
    to: string,
    options?: SendTemplateEmailOptions,
  ) {
    const { sendTemplateEmail } = await import(
      "@/lib/email-templates/send-email"
    );
    const res = await sendTemplateEmail(templateName, to, options as any);
    return res.sent === true
      ? { sent: true as const }
      : { sent: false as const, reason: "recipient_suppressed" as const };
  },
};