import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Static invariants for the "already confirmed → sign in" UI recovery.
// Guards against regressions of the cross-origin stale-panel fix.

const authSrc = readFileSync(join(import.meta.dir, "auth.tsx"), "utf8");
const verifySrc = readFileSync(join(import.meta.dir, "verify-email.tsx"), "utf8");
const i18nSrc = readFileSync(join(import.meta.dir, "..", "lib", "i18n.tsx"), "utf8");

describe("already-confirmed recovery — i18n coverage", () => {
  test("i18n key auth.confirm.already_confirmed is declared for all 5 locales", () => {
    const matches = i18nSrc.match(/"auth\.confirm\.already_confirmed"/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(5);
  });
  test("i18n arabic value present (raw utf-8 in source)", () => {
    expect(i18nSrc).toContain("أكدت بريدي بالفعل؟ تسجيل الدخول");
  });
  test("i18n english value present", () => {
    expect(i18nSrc).toContain("Already confirmed? Sign in");
  });
});

describe("/auth pending panel — recovery affordance", () => {
  test("panel accepts onAlreadyConfirmed prop and renders the button", () => {
    expect(authSrc).toMatch(/onAlreadyConfirmed:\s*\(\)\s*=>\s*void/);
    expect(authSrc).toMatch(/onClick=\{onAlreadyConfirmed\}/);
    expect(authSrc).toMatch(/auth\.confirm\.already_confirmed/);
  });
  test("handler clears pending state, returns to login, prefills email", () => {
    const fn = authSrc.match(/function handleAlreadyConfirmed\([\s\S]*?\n  \}/)?.[0] ?? "";
    expect(fn).toMatch(/clearCooldown\(\)/);
    expect(fn).toMatch(/setPendingEmail\(null\)/);
    expect(fn).toMatch(/setResendState\(\{\s*loading:\s*false,\s*cooldown:\s*0/);
    expect(fn).toMatch(/setMode\("login"\)/);
    expect(fn).toMatch(/setEmail\(prefill\)/);
    expect(fn).toMatch(/getElementById\("pw"\)/);
  });
  test("?email= query param prefills login form", () => {
    // Security: email must NEVER travel through the URL.
    expect(authSrc).not.toMatch(/\?email=/);
    expect(authSrc).not.toMatch(/p\.get\("email"\)/);
    expect(authSrc).not.toMatch(/searchParams[\s\S]{0,40}email/);
  });
  test("prefill is a one-time sessionStorage read-and-delete", () => {
    expect(authSrc).toMatch(/sessionStorage\.getItem\("hk\.auth\.loginPrefill"\)/);
    expect(authSrc).toMatch(/sessionStorage\.removeItem\("hk\.auth\.loginPrefill"\)/);
    // The removeItem must be reachable from the getItem branch (same block).
    const block =
      authSrc.match(/getItem\("hk\.auth\.loginPrefill"\)[\s\S]{0,400}?removeItem\("hk\.auth\.loginPrefill"\)/) ??
      [];
    expect(block.length).toBeGreaterThan(0);
  });
  test("prefill read is wrapped so missing storage falls through silently", () => {
    const block =
      authSrc.match(/try\s*\{[\s\S]{0,600}?hk\.auth\.loginPrefill[\s\S]{0,600}?\}\s*catch/) ?? [];
    expect(block.length).toBeGreaterThan(0);
  });
  test("resend button disable predicate is unchanged (no `sent` gate)", () => {
    expect(authSrc).toMatch(/disabled=\{state\.loading \|\| state\.cooldown > 0\}/);
  });
});

describe("/verify-email — recovery affordance", () => {
  test("clears pending storage and hands off to /auth with email", () => {
    expect(verifySrc).toMatch(/function clearPending\(\)/);
    const fn = verifySrc.match(/function goToLoginPrefilled\([\s\S]*?\n  \}/)?.[0] ?? "";
    expect(fn).toMatch(/clearPending\(\)/);
    // Security: no query-param email handoff anywhere.
    expect(fn).not.toMatch(/\?email=/);
    expect(fn).not.toMatch(/encodeURIComponent/);
    expect(fn).toMatch(/sessionStorage\.setItem\("hk\.auth\.loginPrefill"/);
    expect(fn).toMatch(/navigate\(\{\s*to:\s*"\/auth"\s*\}\)/);
  });
  test("sessionStorage failure falls through to plain navigate", () => {
    const fn = verifySrc.match(/function goToLoginPrefilled\([\s\S]*?\n  \}/)?.[0] ?? "";
    expect(fn).toMatch(/try\s*\{[\s\S]*?setItem[\s\S]*?\}\s*catch/);
  });
  test("no ?email= URL construction anywhere in verify-email.tsx", () => {
    expect(verifySrc).not.toMatch(/\?email=/);
  });
  test("both branches render the already-confirmed button", () => {
    const occurrences = verifySrc.match(/auth\.confirm\.already_confirmed/g) ?? [];
    expect(occurrences.length).toBeGreaterThanOrEqual(2);
  });
});
