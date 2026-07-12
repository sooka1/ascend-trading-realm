import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Static invariants for the "already confirmed → sign in" UI recovery.
// Guards against regressions of the cross-origin stale-panel fix.

const authSrc = readFileSync(join(import.meta.dir, "auth.tsx"), "utf8");
const verifySrc = readFileSync(join(import.meta.dir, "verify-email.tsx"), "utf8");
const i18nSrc = readFileSync(join(import.meta.dir, "..", "lib", "i18n.tsx"), "utf8");

describe("already-confirmed recovery — i18n coverage", () => {
  for (const locale of [
    "أكدت بريدي بالفعل؟ تسجيل الدخول",
    "Already confirmed? Sign in",
    "Déjà confirmé\u00a0? Se connecter",
    "¿Ya lo confirmaste? Inicia sesión",
    "E-postanızı zaten onayladınız mı? Giriş yapın",
  ]) {
    test(`i18n contains: ${locale.slice(0, 24)}…`, () => {
      expect(i18nSrc).toContain(locale);
    });
  }
  test("i18n key auth.confirm.already_confirmed is declared", () => {
    const matches = i18nSrc.match(/"auth\.confirm\.already_confirmed"/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(5);
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
    expect(authSrc).toMatch(/p\.get\("email"\)/);
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
    expect(fn).toMatch(/\/auth\?email=/);
  });
  test("both branches render the already-confirmed button", () => {
    const occurrences = verifySrc.match(/auth\.confirm\.already_confirmed/g) ?? [];
    expect(occurrences.length).toBeGreaterThanOrEqual(2);
  });
});
