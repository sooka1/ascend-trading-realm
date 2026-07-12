import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Design invariants for the resend flow. These are static checks that fail
// loudly if a future edit re-introduces Worker-side HMAC handling, logs raw
// input, or reads the deleted AUTH_RATE_LIMIT_HMAC_KEY secret.

const src = readFileSync(join(import.meta.dir, "auth-resend.functions.ts"), "utf8");

describe("auth-resend server function invariants", () => {
  test("no Worker-side HMAC or Cloudflare env binding for rate-limit key", () => {
    expect(src).not.toMatch(/AUTH_RATE_LIMIT_HMAC_KEY/);
    expect(src).not.toMatch(/readHmacKey/);
    expect(src).not.toMatch(/hmacSha256/);
    expect(src).not.toMatch(/cloudflare:workers/);
    expect(src).not.toMatch(/crypto\.subtle/);
  });

  test("calls the text-input Vault-backed RPC", () => {
    expect(src).toMatch(/rpc\(\s*"consume_auth_resend_attempt"/);
    expect(src).toMatch(/_email:\s*data\.email/);
    expect(src).toMatch(/_ip:\s*ip/);
  });

  test("handles fail-closed config_error path from RPC", () => {
    expect(src).toMatch(/config_ok/);
    expect(src).toMatch(/config_error/);
  });

  test("uses only CF-Connecting-IP, never X-Forwarded-For", () => {
    expect(src).toMatch(/cf-connecting-ip/i);
    expect(src).not.toMatch(/x-forwarded-for/i);
  });

  test("logs only allow-listed fields (op, tag, code, status)", () => {
    // logOp payload must not include email, ip, or any raw request field.
    const logFn = src.match(/function logOp[\s\S]*?\n\}/)?.[0] ?? "";
    expect(logFn).toMatch(/op:\s*"auth_resend"/);
    expect(logFn).not.toMatch(/email/i);
    expect(logFn).not.toMatch(/\bip\b/i);
    expect(logFn).not.toMatch(/data\./);
  });

  test("always returns enumeration-safe { ok: true }", () => {
    // Every return in the handler returns the same shape.
    const returns = src.match(/return\s*\{\s*ok:\s*true\s*as\s*const\s*\};/g) ?? [];
    expect(returns.length).toBeGreaterThanOrEqual(4);
    expect(src).not.toMatch(/return\s*\{\s*ok:\s*false/);
  });
});

describe("src/server.ts globalThis.env leak removed", () => {
  const server = readFileSync(join(import.meta.dir, "..", "server.ts"), "utf8");
  test("no globalThis.env assignment", () => {
    expect(server).not.toMatch(/globalThis[^\n]*\.env\s*=/);
    expect(server).not.toMatch(/AUTH_RATE_LIMIT_HMAC_KEY/);
  });
});
