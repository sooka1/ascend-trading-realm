import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Loader2, MailCheck, WifiOff } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { HKLogo } from "@/components/hk-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { useI18n } from "@/lib/i18n";
import { useServerFn } from "@tanstack/react-start";
import { requestVerificationResend } from "@/lib/auth-resend.functions";
import {
  parseVerificationError,
  scrubVerificationErrorFromUrl,
  type VerifyErrorCode,
} from "@/lib/auth-hash-errors";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "Verify your email | HKEX" },
      { name: "description", content: "Confirm your HKEX account by opening the link we emailed to you." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: VerifyEmailPage,
});

const PENDING_KEY = "hk.auth.pendingConfirm";

function loadPending(): { email: string; until: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { email?: unknown; until?: unknown };
    if (typeof parsed.email !== "string" || typeof parsed.until !== "number") return null;
    return { email: parsed.email, until: parsed.until };
  } catch {
    return null;
  }
}

function savePending(email: string, cooldownSeconds: number) {
  try {
    localStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ email, until: Date.now() + cooldownSeconds * 1000 }),
    );
  } catch {
    /* ignore */
  }
}

function VerifyEmailPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(true);
  const [errorCode, setErrorCode] = useState<VerifyErrorCode | null>(null);

  const resend = useServerFn(requestVerificationResend);

  // Parse & scrub any Supabase error fragment on first paint.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const code = parseVerificationError(window.location.hash, window.location.search);
    if (code) setErrorCode(code);
    scrubVerificationErrorFromUrl();
  }, []);

  // Hydrate pending state from local storage (same device path).
  useEffect(() => {
    const pending = loadPending();
    if (pending) {
      setEmail(pending.email);
      const remaining = Math.max(0, Math.ceil((pending.until - Date.now()) / 1000));
      setCooldown(remaining);
    }
  }, []);

  // Cooldown tick.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  // Online/offline.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const emailSchema = useMemo(
    () =>
      z
        .string()
        .trim()
        .min(1, t("auth.err.email.required"))
        .max(255)
        .email(t("auth.err.email.invalid")),
    [t],
  );

  async function callResend(addr: string) {
    if (!online) {
      toast.error(t("auth.confirm.offline"));
      return;
    }
    setBusy(true);
    try {
      await resend({ data: { email: addr } });
      // Enumeration-safe: same generic feedback no matter the real outcome.
      toast.success(t("auth.confirm.resent"));
      savePending(addr, 60);
      setCooldown(60);
    } catch {
      toast.error(t("auth.confirm.generic_error"));
    } finally {
      setBusy(false);
    }
  }

  function handleSubmitEmail(e: React.FormEvent) {
    e.preventDefault();
    setInputError(null);
    const parsed = emailSchema.safeParse(emailInput);
    if (!parsed.success) {
      setInputError(parsed.error.issues[0]?.message ?? t("auth.err.email.invalid"));
      return;
    }
    setEmail(parsed.data.toLowerCase());
    void callResend(parsed.data.toLowerCase());
  }

  const errorText = errorCode
    ? errorCode === "expired"
      ? t("auth.verify.error.expired")
      : errorCode === "used"
        ? t("auth.verify.error.used")
        : errorCode === "invalid"
          ? t("auth.verify.error.invalid")
          : t("auth.verify.error.generic")
    : null;

  return (
    <PageShell>
      <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <Link
            to="/auth"
            aria-label={t("auth.confirm.back")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link to="/"><HKLogo /></Link>
          <span className="h-10 w-10" aria-hidden />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          {!online && (
            <div
              role="status"
              className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200"
            >
              <WifiOff className="h-4 w-4" />
              {t("auth.confirm.offline")}
            </div>
          )}

          {errorText && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          <div className="flex flex-col items-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--gradient-brand)] shadow-[var(--shadow-glow)]">
              <MailCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold leading-tight sm:text-3xl">
              {t("auth.confirm.title")}
            </h1>
            {email ? (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("auth.confirm.sent")}
                  <br />
                  <span className="font-medium text-foreground">{email}</span>
                </p>
                <p className="mt-3 text-xs text-muted-foreground">{t("auth.confirm.expires")}</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {t("auth.verify.enter_email")}
              </p>
            )}
          </div>

          <div className="mt-6 space-y-3">
            {email ? (
              <>
                <Button
                  type="button"
                  onClick={() => void callResend(email)}
                  disabled={busy || cooldown > 0 || !online}
                  className="h-12 w-full bg-[var(--gradient-brand)] text-base text-white shadow-[var(--shadow-glow)] sm:h-10 sm:text-sm"
                >
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {cooldown > 0
                    ? t("auth.confirm.resend_in").replace("{n}", String(cooldown))
                    : t("auth.confirm.resend")}
                </Button>
                {cooldown > 0 && (
                  <p role="timer" aria-live="polite" className="text-center text-xs text-muted-foreground">
                    {t("auth.confirm.timer_a")}{" "}
                    <span className="font-medium text-foreground tabular-nums">
                      {cooldown}
                      {t("auth.confirm.timer_b")}
                    </span>
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEmail(null);
                    setEmailInput("");
                    setCooldown(0);
                  }}
                  className="h-12 w-full border-white/15 bg-white/5 text-base sm:h-10 sm:text-sm"
                >
                  {t("auth.confirm.change_email")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/auth" })}
                  className="h-12 w-full border-white/15 bg-white/5 text-base sm:h-10 sm:text-sm"
                >
                  {t("auth.confirm.back")}
                </Button>
              </>
            ) : (
              <form onSubmit={handleSubmitEmail} className="space-y-3" noValidate>
                <div>
                  <Label htmlFor="verify-email-input">{t("auth.field.email")}</Label>
                  <Input
                    id="verify-email-input"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className="mt-1.5 h-12 bg-white/5 text-base sm:h-10 sm:text-sm"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    aria-invalid={!!inputError}
                    aria-describedby={inputError ? "verify-email-error" : undefined}
                    placeholder={t("auth.field.email.ph")}
                  />
                  {inputError && (
                    <p id="verify-email-error" className="mt-1.5 text-xs text-destructive">
                      {inputError}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={busy || !online}
                  className="h-12 w-full bg-[var(--gradient-brand)] text-base text-white shadow-[var(--shadow-glow)] sm:h-10 sm:text-sm"
                >
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("auth.confirm.resend")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/auth" })}
                  className="h-12 w-full border-white/15 bg-white/5 text-base sm:h-10 sm:text-sm"
                >
                  {t("auth.confirm.back")}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}