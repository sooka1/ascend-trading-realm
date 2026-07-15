import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const schema = z.object({
  kind: z.enum(["complaint", "suggestion", "contact"]),
  name: z.string().trim().min(1, "الاسم مطلوب").max(120),
  email: z.string().trim().email("بريد غير صالح").max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(5, "الرسالة قصيرة جداً").max(4000),
  source: z.string().trim().max(80).optional(),
  // Anti-spam signals (all optional so older clients don't break, but
  // filled by the current form).
  website: z.string().max(0).optional(), // honeypot: must be empty
  elapsedMs: z.number().int().nonnegative().optional(),
});

// In-memory rate limiter (per worker instance). Keeps 3 messages / hour per
// email or IP. Good enough to blunt drive-by spam without external deps.
const RL_WINDOW_MS = 60 * 60 * 1000;
const RL_MAX = 3;
const rlBuckets = new Map<string, number[]>();
function rlHit(key: string): boolean {
  const now = Date.now();
  const arr = (rlBuckets.get(key) ?? []).filter((t) => now - t < RL_WINDOW_MS);
  if (arr.length >= RL_MAX) {
    rlBuckets.set(key, arr);
    return false;
  }
  arr.push(now);
  rlBuckets.set(key, arr);
  return true;
}

// Simple content-shape heuristics catch common spam payloads.
function looksLikeSpam(text: string): boolean {
  const t = text.toLowerCase();
  const linkCount = (t.match(/https?:\/\//g) ?? []).length;
  if (linkCount >= 4) return true;
  if (/\[url=|<a\s+href|bit\.ly|tinyurl|t\.me\//i.test(text)) return true;
  // Repeated character spam (e.g. "aaaaaaaa...")
  if (/(.)\1{20,}/.test(text)) return true;
  return false;
}

export const sendSupportInquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    // 1) Honeypot — bots almost always fill hidden inputs. Return "ok"
    //    silently so spammers don't learn they were blocked.
    if (data.website && data.website.length > 0) {
      return { ok: true };
    }
    // 2) Minimum time-on-form. Real users take longer than ~3s.
    if (typeof data.elapsedMs === "number" && data.elapsedMs < 3000) {
      return { ok: true };
    }
    // 3) Content heuristics.
    if (looksLikeSpam(`${data.subject ?? ""}\n${data.message}`)) {
      return { ok: true };
    }
    // 4) Rate limit by email + IP.
    const headers = getRequest()?.headers ?? new Headers();
    const ip = (headers.get("cf-connecting-ip") ?? "").trim().slice(0, 45);
    const emailKey = `support:email:${data.email.toLowerCase()}`;
    const ipKey = ip ? `support:ip:${ip}` : null;
    if (!rlHit(emailKey) || (ipKey && !rlHit(ipKey))) {
      throw new Error("لقد أرسلت رسائل كثيرة مؤخراً. يرجى المحاولة لاحقاً.");
    }

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