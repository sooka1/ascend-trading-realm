// Provider-agnostic email port. Current default adapter: Lovable managed email.
// Alternate future adapters: Resend, SendGrid, SMTP.

export type SendEmailResult =
  | { sent: true }
  | { sent: false; reason: "recipient_suppressed" | "rate_limited" | "unknown" };

export interface SendTemplateEmailOptions {
  templateData?: Record<string, unknown>;
  idempotencyKey?: string;
  replyTo?: string;
}

export interface EmailService {
  /**
   * Send a registered template to a recipient. The recipient may be overridden
   * by the template itself (fixed-address notification templates).
   */
  sendTemplate(
    templateName: string,
    to: string,
    options?: SendTemplateEmailOptions,
  ): Promise<SendEmailResult>;
}