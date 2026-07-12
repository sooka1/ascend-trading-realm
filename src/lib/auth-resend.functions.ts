// Public, enumeration-safe verification-email resend endpoint.
//
// Contract:
// - Always returns { ok: true } regardless of internal outcome (unknown
//   email, throttled, provider failure, config error). No status, timing,
//   or shape leaks the account state.
// - Enforces atomic rate limits in Postgres:
//     * 1 request / 60 s per email
//     * 5 / hour per email
//     * 20 / hour per IP (CF-Connecting-IP only)
//   via `public.consume_auth_resend_attempt(_email text, _ip text)`.
// - Identifier HMACs are computed INSIDE Postgres using a secret held in
//   Supabase Vault (`auth_rate_limit_hmac_key`). Raw email/IP are passed
//   only to the service-role RPC over the internal Data API; they are not
//   persisted and are never written by application logging.
// - Total response time is padded to a 500–800 ms range so throttling,
//   unknown accounts, and successful sends are indistinguishable.
// - Logs contain only { operation, code, status }. No email/IP/hash/token.
// - Sends errors to Sentry with tags feature=auth_verification,
//   operation=resend. No PII or provider strings attached.

import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { captureServerException } from "@/lib/sentry.server";

const REDIRECT_HOST_ALLOWLIST = new Set<string>([
  "hkexinvest.com",
  "www.hkexinvest.com",
  "hkexinvest-com.lovable.app",
  "project--5d06956d-0893-4e53-8e16-f9255052df0e.lovable.app",
  "project--5d06956d-0893-4e53-8e16-f9255052df0e-dev.lovable.app",
  "id-preview--5d06956d-0893-4e53-8e16-f9255052df0e.lovable.app",
]);
const DEFAULT_REDIRECT = "https://www.hkexinvest.com/portal";

const inputSchema = z.object({
  email: z
    .string()
    .trim()
    .max(255)
    .transform((v) => v.toLowerCase())
    .pipe(z.string().email()),
});

type LogTag = "ok" | "throttled" | "config_error" | "provider_error" | "internal_error";

function logOp(tag: LogTag, extra?: { code?: string | number; status?: number }) {
  // Allow-listed fields only. No email/IP/hash/token.
  const payload: Record<string, unknown> = { op: "auth_resend", tag };
  if (extra?.code !== undefined) payload.code = String(extra.code).slice(0, 40);
  if (extra?.status !== undefined) payload.status = extra.status;
  console.log(JSON.stringify(payload));
}

function reportSentry(err: unknown, tag: LogTag) {
  captureServerException(err, {
    tags: { feature: "auth_verification", operation: "resend", outcome: tag },
  });
}

function pickCfIp(headers: Headers): string | null {
  // Trust CF-Connecting-IP ONLY. Never X-Forwarded-For.
  const raw = headers.get("cf-connecting-ip");
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > 45) return null;
  return trimmed;
}

function safeEmailRedirect(requestUrl: string): string {
  try {
    const host = new URL(requestUrl).hostname.toLowerCase();
    if (REDIRECT_HOST_ALLOWLIST.has(host)) {
      return `https://${host}/portal`;
    }
  } catch {
    // fall through
  }
  return DEFAULT_REDIRECT;
}

function randomDelayMs(): number {
  // 500–800 ms
  return 500 + Math.floor(Math.random() * 301);
}

async function padTo(startedAt: number, minMs: number, maxMs: number) {
  const target = minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
  const elapsed = Date.now() - startedAt;
  const wait = Math.max(0, target - elapsed);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
}

export const requestVerificationResend = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const startedAt = Date.now();
    try {
      const req = getRequest();
      const headers = req?.headers ?? new Headers();

      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
      const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
        logOp("config_error", { code: "supabase_env_missing" });
        reportSentry(new Error("Supabase env vars missing"), "config_error");
        await padTo(startedAt, 500, 800);
        return { ok: true as const };
      }

      const ip = pickCfIp(headers);

      // Rate-limit RPC uses the service-role client (private RPC, EXECUTE
      // granted only to service_role). HMACs are computed inside Postgres
      // using the Vault-held secret; raw email/IP travel only over the
      // internal Data API and are not persisted.
      const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      });

      // NOTE: never log RPC parameters — they contain the raw email/IP.
      const rpc = await admin.rpc("consume_auth_resend_attempt", {
        _email: data.email,
        _ip: ip,
      });

      if (rpc.error) {
        logOp("internal_error", { code: rpc.error.code ?? "rpc_error" });
        reportSentry(rpc.error, "internal_error");
        await padTo(startedAt, 500, 800);
        return { ok: true as const };
      }

      const row = Array.isArray(rpc.data) ? rpc.data[0] : rpc.data;
      const configOk: boolean = row?.config_ok !== false;
      const allowed: boolean = !!row?.allowed;

      if (!configOk) {
        logOp("config_error", { code: "vault_secret_missing" });
        reportSentry(new Error("Vault secret auth_rate_limit_hmac_key unavailable"), "config_error");
        await padTo(startedAt, 500, 800);
        return { ok: true as const };
      }

      if (!allowed) {
        logOp("throttled");
        await padTo(startedAt, 500, 800);
        return { ok: true as const };
      }

      // Auth resend uses the public/publishable-key client — the documented
      // supabase.auth.resend method. Service role is used ONLY for the RPC.
      const authClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      });

      const emailRedirectTo = safeEmailRedirect(req?.url ?? "");

      const { error } = await authClient.auth.resend({
        type: "signup",
        email: data.email,
        options: { emailRedirectTo },
      });

      if (error) {
        logOp("provider_error", { code: error.code ?? error.name, status: error.status });
        reportSentry(error, "provider_error");
      } else {
        logOp("ok");
      }

      await padTo(startedAt, 500, 800);
      return { ok: true as const };
    } catch (err) {
      logOp("internal_error", { code: "throw" });
      reportSentry(err, "internal_error");
      await padTo(startedAt, 500, 800);
      return { ok: true as const };
    }
  });