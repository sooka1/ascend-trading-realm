import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { HKLogo } from "@/components/hk-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ShieldCheck, Trophy, Zap, Loader2, Eye, EyeOff, AlertCircle, ArrowLeft, MailCheck, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { z } from "zod";
import { useI18n } from "@/lib/i18n";
import { useServerFn } from "@tanstack/react-start";
import { requestVerificationResend } from "@/lib/auth-resend.functions";
import { parseVerificationError, scrubVerificationErrorFromUrl } from "@/lib/auth-hash-errors";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or open an account | HKEX" },
      { name: "description", content: "Log in to your HKEX account or open a new one in under 5 minutes." },
      { property: "og:title", content: "HKEX — Sign in" },
      { property: "og:description", content: "Access your trading terminal and competitions dashboard." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const { t } = useI18n();
  const [mode, setMode] = useState<"login" | "register" | "otp">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string; form?: string }>({});
  // OTP (email code) sign-in state. Kept independent from the register-flow
  // pending panel so switching tabs never leaks one flow's state into the other.
  const [otpPhase, setOtpPhase] = useState<"email" | "code">("email");
  const [otpCode, setOtpCode] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);
  // Verification-attempt lockout: after 5 failed attempts within 5 min for
  // the same email, disable input and count down to retry.
  const [otpLockRemaining, setOtpLockRemaining] = useState(0);
  // Timestamp of the most recently issued OTP for the current email. Used to
  // show a "latest code only" hint after a resend.
  const [otpIssuedAt, setOtpIssuedAt] = useState<number | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendState, setResendState] = useState<{ loading: boolean; cooldown: number; error?: string; sent?: boolean }>({
    loading: false,
    cooldown: 0,
  });
  const navigate = useNavigate();
  const resendServerFn = useServerFn(requestVerificationResend);

  // Scrub any Supabase error fragment landed on /auth and route to /verify-email.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const code = parseVerificationError(window.location.hash, window.location.search);
    scrubVerificationErrorFromUrl();
    if (code) {
      navigate({ to: "/verify-email", replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Capture ?redirect=<path> so we can bounce back after login.
  // Only same-origin relative paths are accepted; ignore anything else.
  function readRedirectTarget(): string | null {
    if (typeof window === "undefined") return null;
    const raw = new URLSearchParams(window.location.search).get("redirect");
    if (!raw) return null;
    if (!raw.startsWith("/") || raw.startsWith("//")) return null;
    return raw;
  }

  // Capture ?ref=CODE from the URL (persists across register/login toggle)
  const [refCode, setRefCode] = useState<string>("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const r = p.get("ref");
    if (r) {
      const clean = r.trim().toUpperCase().slice(0, 16);
      setRefCode(clean);
      try { sessionStorage.setItem("hk.refCode", clean); } catch { /* ignore */ }
      setMode("register");
    } else {
      try {
        const saved = sessionStorage.getItem("hk.refCode");
        if (saved) setRefCode(saved);
      } catch { /* ignore */ }
    }
    // One-time same-origin handoff from the /verify-email recovery flow.
    // The email never travels through the URL, router search state, logs,
    // or analytics — only sessionStorage on this origin.
    try {
      const prefill = sessionStorage.getItem("hk.auth.loginPrefill");
      if (prefill) {
        sessionStorage.removeItem("hk.auth.loginPrefill");
        const trimmed = prefill.trim().slice(0, 255);
        if (trimmed) {
          setEmail(trimmed);
          setMode("login");
        }
      }
    } catch {
      /* sessionStorage unavailable → no prefill, no error */
    }
  }, []);

  // Route super_admin → /admin, everyone else → /portal.
  async function goPostLogin(userId: string) {
    const redirectTo = readRedirectTarget();
    if (redirectTo) {
      navigate({ to: redirectTo, replace: true });
      return;
    }
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "super_admin")
        .maybeSingle();
      navigate({ to: data ? "/admin" : "/portal", replace: true });
    } catch {
      navigate({ to: "/portal", replace: true });
    }
  }

  // Persist confirm-email state across refreshes / tab reconnects.
  const STORAGE_KEY = "hk.auth.pendingConfirm";

  function saveCooldown(emailAddr: string, seconds: number) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ email: emailAddr, until: Date.now() + seconds * 1000 }),
      );
    } catch {}
  }

  function clearCooldown() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  // Hydrate pending email + remaining cooldown on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const { email: savedEmail, until } = JSON.parse(raw) as { email?: string; until?: number };
      if (!savedEmail || typeof until !== "number") return;
      setPendingEmail(savedEmail);
      const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setResendState({ loading: false, cooldown: remaining });
    } catch {}
  }, []);

  // Re-sync remaining cooldown when the tab regains focus or visibility.
  useEffect(() => {
    function resync() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const { until } = JSON.parse(raw) as { until?: number };
        if (typeof until !== "number") return;
        const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
        setResendState((s) => ({ ...s, cooldown: remaining }));
      } catch {}
    }
    window.addEventListener("focus", resync);
    document.addEventListener("visibilitychange", resync);
    return () => {
      window.removeEventListener("focus", resync);
      document.removeEventListener("visibilitychange", resync);
    };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) goPostLogin(data.session.user.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resendState.cooldown <= 0) return;
    const t = setTimeout(() => setResendState((s) => ({ ...s, cooldown: s.cooldown - 1 })), 1000);
    return () => clearTimeout(t);
  }, [resendState.cooldown]);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setTimeout(() => setOtpCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCooldown]);

  useEffect(() => {
    if (otpLockRemaining <= 0) return;
    const t = setTimeout(() => setOtpLockRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [otpLockRemaining]);

  // While the confirm-email screen is showing, watch for the user completing
  // confirmation in another tab and route them straight to the dashboard.
  useEffect(() => {
    if (!pendingEmail) return;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED")) {
        clearCooldown();
        toast.success(t("auth.toast.email_confirmed"));
        goPostLogin(session.user.id);
      }
    });
    // Fallback poll in case storage events don't fire (e.g. different browser).
    const interval = setInterval(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        clearInterval(interval);
        clearCooldown();
        toast.success(t("auth.toast.email_confirmed"));
        goPostLogin(data.session.user.id);
      }
    }, 5000);
    return () => {
      sub.subscription.unsubscribe();
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingEmail, t]);

  const loginSchema = z.object({
    email: z.string().trim().min(1, t("auth.err.email.required")).email(t("auth.err.email.invalid")).max(255),
    password: z.string().min(6, t("auth.err.password.min")).max(72, t("auth.err.password.long")),
  });
  const registerSchema = loginSchema.extend({
    fullName: z.string().trim().min(2, t("auth.err.fullname.min")).max(100, t("auth.err.fullname.long")),
    password: z
      .string()
      .min(8, t("auth.err.password.min8"))
      .max(72, t("auth.err.password.long"))
      .regex(/[A-Za-z]/, t("auth.err.password.letter"))
      .regex(/[0-9]/, t("auth.err.password.number")),
  });

  async function sendOtpCode(opts?: { isResend?: boolean }) {
    const isResend = opts?.isResend === true;
    setErrors({});
    // On resend, clear any code the user may have typed so the old (now
    // invalidated) token can't accidentally be submitted after a new one
    // is generated on the server.
    if (isResend) setOtpCode("");
    const parsed = z
      .object({ email: z.string().trim().email(t("auth.err.email.invalid")).max(255) })
      .safeParse({ email });
    if (!parsed.success) {
      setErrors({ email: parsed.error.issues[0]?.message });
      return;
    }
    // Same client-side limiter as password login — 5/min per email.
    const normalizedEmail = parsed.data.email.toLowerCase();
    setEmail(normalizedEmail);
    const key = `auth:otp:${normalizedEmail}`;
    const { rateLimit } = await import("@/lib/rate-limit");
    const limiter = rateLimit(key, { max: 5, windowMs: 60_000 });
    if (!limiter.tryConsume()) {
      const secs = Math.ceil(limiter.resetIn() / 1000);
      toast.error(t("auth.err.rate_limit").replace("{seconds}", String(secs)));
      return;
    }
    setLoading(true);
    try {
      // shouldCreateUser=false → don't silently sign someone up via the code
      // path; if they don't have an account, we still show a generic success
      // to keep the response enumeration-safe.
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error && !/user.*not.*found|no.*user/i.test(error.message)) throw error;
      setOtpPhase("code");
      setOtpCooldown(60);
      // A new OTP has been issued. Supabase invalidates any previously issued
      // code for the same email server-side (only the latest one verifies),
      // so mirror that on the client: bump the issued-at marker, wipe any
      // typed code, and — on resend only — clear the verify-attempt counter
      // and unlock the input, since prior failures were against a token that
      // no longer exists.
      const verifyKey = `auth:otpverify:${normalizedEmail}`;
      const verifyLimiter = rateLimit(verifyKey, { max: 5, windowMs: 5 * 60_000 });
      if (isResend) {
        verifyLimiter.reset();
        setOtpLockRemaining(0);
        setOtpCode("");
        setOtpIssuedAt(Date.now());
      } else {
        setOtpLockRemaining(verifyLimiter.remaining() <= 0 ? Math.ceil(verifyLimiter.resetIn() / 1000) : 0);
        setOtpIssuedAt(Date.now());
      }
      toast.success(isResend ? t("auth.otp.resent") : t("auth.otp.sent"));
    } catch (err) {
      const message = err instanceof Error ? err.message : t("auth.err.generic");
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpRequest(e: React.FormEvent) {
    e.preventDefault();
    await sendOtpCode();
  }

  async function handleOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const token = otpCode.replace(/\D/g, "");
    if (token.length !== 6) {
      setErrors({ form: t("auth.otp.err_length") });
      return;
    }
    // Local attempt limit: 5 verifications per 5 minutes per email. Server
    // still enforces its own limits; this prevents brute-force from the
    // client and gives clear feedback when the ceiling is hit.
    const normalizedEmail = email.toLowerCase().trim();
    const verifyKey = `auth:otpverify:${normalizedEmail}`;
    const { rateLimit } = await import("@/lib/rate-limit");
    const limiter = rateLimit(verifyKey, { max: 5, windowMs: 5 * 60_000 });
    if (!limiter.tryConsume()) {
      const secs = Math.ceil(limiter.resetIn() / 1000);
      setOtpLockRemaining(secs);
      const msg = t("auth.otp.err_locked").replace("{seconds}", String(secs));
      setErrors({ form: msg });
      toast.error(msg);
      return;
    }
    setLoading(true);
    try {
      // Try 'email' first (6-digit OTP for existing users via signInWithOtp).
      // If that path returns "token expired/invalid" for a fresh code, fall
      // back to 'magiclink' — Supabase accepts either type name for the same
      // OTP depending on how the auth email template was scaffolded.
      let { data, error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token,
        type: "email",
      });
      if (error) {
        const retry = await supabase.auth.verifyOtp({
          email: normalizedEmail,
          token,
          type: "magiclink",
        });
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }
      if (error) throw error;
      limiter.reset();
      setOtpLockRemaining(0);
      toast.success(t("auth.toast.signed_in"));
      if (data.user) await goPostLogin(data.user.id);
      else navigate({ to: "/portal", replace: true });
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const message = /expired|invalid|otp/i.test(raw) ? t("auth.otp.err_invalid") : raw || t("auth.otp.err_invalid");
      setErrors({ form: message });
      toast.error(message);
      // If this attempt exhausted the bucket, lock the input immediately.
      if (limiter.remaining() <= 0) {
        setOtpLockRemaining(Math.ceil(limiter.resetIn() / 1000));
      }
    } finally {
      setLoading(false);
    }
  }

  function resetOtp() {
    setOtpPhase("email");
    setOtpCode("");
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    // Client-side rate limit: 5 attempts per minute per email.
    const key = `auth:${mode}:${email.toLowerCase().trim()}`;
    const { rateLimit } = await import("@/lib/rate-limit");
    const limiter = rateLimit(key, { max: 5, windowMs: 60_000 });
    if (!limiter.tryConsume()) {
      const secs = Math.ceil(limiter.resetIn() / 1000);
      toast.error(t("auth.err.rate_limit").replace("{seconds}", String(secs)));
      return;
    }
    const parsed =
      mode === "login"
        ? loginSchema.safeParse({ email, password })
        : registerSchema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof typeof fieldErrors;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        const { data: signIn, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("auth.toast.signed_in"));
        if (signIn.user) await goPostLogin(signIn.user.id);
        else navigate({ to: "/portal", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/portal`,
            data: { display_name: fullName, ref_code: refCode || undefined },
          },
        });
        if (error) throw error;
        // When email confirmation is enabled, no session is returned.
        if (data.session) {
          clearCooldown();
          toast.success(t("auth.toast.created"));
          await goPostLogin(data.session.user.id);
        } else {
          setPendingEmail(email);
          setResendState({ loading: false, cooldown: 60 });
          saveCooldown(email, 60);
        }
      }
    } catch (err) {
      // Detect unconfirmed-email login and pivot into the pending panel
      // instead of leaking a distinct error (enumeration-safe).
      const errAny = err as { code?: string; name?: string; message?: string } | null;
      const code = errAny?.code ?? "";
      const msg = errAny?.message ?? "";
      const isUnconfirmed =
        code === "email_not_confirmed" || /email.*not.*confirm/i.test(msg);
      if (mode === "login" && isUnconfirmed) {
        setPendingEmail(email);
        setResendState({ loading: false, cooldown: 60 });
        saveCooldown(email, 60);
        // Fire a resend so a fresh link arrives — outcome is generic.
        void resendServerFn({ data: { email } }).catch(() => {});
        return;
      }
      const message = err instanceof Error ? err.message : t("auth.err.generic");
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!pendingEmail || resendState.loading || resendState.cooldown > 0) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setResendState((s) => ({ ...s, error: t("auth.confirm.offline") }));
      return;
    }
    setResendState((s) => ({ ...s, loading: true, error: undefined, sent: false }));
    try {
      // Server fn returns { ok: true } regardless of internal outcome
      // (enumeration-safe). Client shows a generic success either way.
      await resendServerFn({ data: { email: pendingEmail } });
      setResendState({ loading: false, cooldown: 60, sent: true });
      saveCooldown(pendingEmail, 60);
      toast.success(t("auth.toast.resent"));
    } catch (err) {
      const message = err instanceof Error ? err.message : t("auth.confirm.resend_error");
      setResendState({ loading: false, cooldown: 0, error: message });
    }
  }

  function resetToLogin() {
    setPendingEmail(null);
    setPassword("");
    setMode("login");
    setErrors({});
    clearCooldown();
  }

  function changeEmail() {
    setPendingEmail(null);
    setEmail("");
    setPassword("");
    setMode("register");
    setErrors({});
    setResendState({ loading: false, cooldown: 0 });
    clearCooldown();
  }

  // Cross-origin recovery: user confirmed the emailed link on a different
  // origin (e.g. www.hkexinvest.com) and this tab's Supabase client cannot
  // observe that session. This affordance clears the local pending state,
  // prefills the login form, and focuses the password field.
  function handleAlreadyConfirmed() {
    const prefill = pendingEmail ?? email ?? "";
    clearCooldown();
    setPendingEmail(null);
    setResendState({ loading: false, cooldown: 0, error: undefined, sent: false });
    setErrors({});
    setMode("login");
    setPassword("");
    if (prefill) setEmail(prefill);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        const el = document.getElementById("pw") as HTMLInputElement | null;
        el?.focus();
      });
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message ?? t("auth.toast.google_fail"));
        return;
      }
      if (result.redirected) return; // browser navigates away
      // Popup / web_message flow: session is set — route by role
      const { data: u } = await supabase.auth.getUser();
      if (u.user) await goPostLogin(u.user.id);
      else navigate({ to: "/portal", replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-10 px-4 py-6 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-8">
        <Link
          to="/"
          className="absolute top-2 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur transition hover:border-gold/40 hover:text-foreground"
          style={{ insetInlineStart: "0.5rem" }}
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          <span>الرجوع للرئيسية</span>
        </Link>
        <div className="hidden flex-col justify-between lg:flex">
          <Link to="/"><HKLogo size="lg" /></Link>
          <div>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
              {t("auth.welcome.title")} <span className="text-gradient">{t("auth.welcome.brand")}</span>
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              {t("auth.welcome.sub")}
            </p>
            <div className="mt-8 grid gap-3">
              {[
                { icon: Zap, label: t("auth.feat.execution") },
                { icon: Trophy, label: t("auth.feat.competitions") },
                { icon: ShieldCheck, label: t("auth.feat.regulation") },
              ].map((f) => (
                <div key={f.label} className="glass flex items-center gap-3 rounded-xl p-3 text-sm">
                  <f.icon className="h-4 w-4 text-gold" />
                  {f.label}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} HKEX</p>
        </div>

        <div className="mx-auto flex w-full max-w-md items-center">
          <div className="w-full rounded-none border-0 bg-transparent p-0 sm:glass-strong sm:rounded-3xl sm:border sm:p-8">
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <Link to="/" aria-label={t("auth.back_home")} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link to="/"><HKLogo /></Link>
              <span className="h-10 w-10" aria-hidden />
            </div>
            {pendingEmail ? (
              <ConfirmEmailPanel
                email={pendingEmail}
                onResend={handleResend}
                onBack={resetToLogin}
                onChangeEmail={changeEmail}
                onAlreadyConfirmed={handleAlreadyConfirmed}
                state={resendState}
              />
            ) : (
            <>
            <div className="mb-4 lg:hidden">
              <h1 className="font-display text-2xl font-bold leading-tight">
                {mode === "register" ? t("auth.mobile.open") : t("auth.mobile.welcome")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "register" ? t("auth.mobile.open.sub") : t("auth.mobile.welcome.sub")}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-white/[0.03] p-1">
              {(["login", "otp", "register"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setErrors({}); if (m !== "otp") resetOtp(); }}
                  className={cn(
                    "rounded-md py-2.5 text-xs font-medium capitalize transition sm:text-sm",
                    mode === m ? "bg-[var(--gradient-brand)] text-white" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "login" ? t("auth.tab.login") : m === "otp" ? t("auth.tab.otp") : t("auth.tab.register")}
                </button>
              ))}
            </div>

            {mode === "otp" ? (
            <form
              className="mt-6 space-y-4"
              onSubmit={otpPhase === "email" ? handleOtpRequest : handleOtpVerify}
              noValidate
            >
              {errors.form && (
                <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errors.form}</span>
                </div>
              )}
              <div className="flex items-start gap-2 rounded-lg border border-gold/20 bg-gold/5 p-3 text-xs text-muted-foreground">
                <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{t("auth.otp.desc")}</span>
              </div>
              {otpPhase === "email" ? (
                <div>
                  <Label htmlFor="otp-email">{t("auth.field.email")}</Label>
                  <Input
                    id="otp-email"
                    type="email"
                    inputMode="email"
                    placeholder={t("auth.field.email.ph")}
                    className={cn("mt-1.5 h-12 bg-white/5 text-base sm:h-10 sm:text-sm", errors.email && "border-destructive focus-visible:ring-destructive")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>}
                </div>
              ) : (
                <div>
                  <Label htmlFor="otp-code">{t("auth.otp.code_label")}</Label>
                  <Input
                    id="otp-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="••••••"
                    className="mt-1.5 h-12 bg-white/5 text-center text-lg tracking-[0.5em] tabular-nums sm:h-11"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    disabled={otpLockRemaining > 0}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {t("auth.otp.sent_to")} <span className="font-medium text-foreground">{email}</span>
                  </p>
                  {otpIssuedAt && (
                    <p className="mt-1 text-[11px] text-muted-foreground/80">
                      {t("auth.otp.latest_only")}
                    </p>
                  )}
                  {otpLockRemaining > 0 && (
                    <p className="mt-2 text-xs text-destructive">
                      {t("auth.otp.locked_in").replace("{seconds}", String(otpLockRemaining))}
                    </p>
                  )}
                </div>
              )}
              <Button
                type="submit"
                disabled={loading || (otpPhase === "code" && (otpCode.length !== 6 || otpLockRemaining > 0))}
                className="h-12 w-full bg-[var(--gradient-brand)] text-base text-white shadow-[var(--shadow-glow)] sm:h-10 sm:text-sm"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {otpPhase === "email" ? t("auth.otp.send_btn") : t("auth.otp.verify_btn")}
              </Button>
              {otpPhase === "code" && (
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={resetOtp}
                    className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {t("auth.otp.change_email")}
                  </button>
                  <button
                    type="button"
                    disabled={otpCooldown > 0 || loading}
                    onClick={() => void sendOtpCode({ isResend: true })}
                    className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
                  >
                    {otpCooldown > 0
                      ? t("auth.otp.resend_in").replace("{n}", String(otpCooldown))
                      : t("auth.otp.resend")}
                  </button>
                </div>
              )}
            </form>
            ) : (
            <form
              className="mt-6 space-y-4"
              onSubmit={handleSubmit}
              noValidate
            >
              {errors.form && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errors.form}</span>
                </div>
              )}
              {mode === "register" && (
                <div>
                  <Label htmlFor="fullname">{t("auth.field.fullname")}</Label>
                  <Input
                    id="fullname"
                    placeholder={t("auth.field.fullname.ph")}
                    className={cn("mt-1.5 h-12 bg-white/5 text-base sm:h-10 sm:text-sm", errors.fullName && "border-destructive focus-visible:ring-destructive")}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? "fullname-error" : undefined}
                  />
                  {errors.fullName && (
                    <p id="fullname-error" className="mt-1.5 text-xs text-destructive">{errors.fullName}</p>
                  )}
                </div>
              )}
              <div>
                <Label htmlFor="email">{t("auth.field.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  placeholder={t("auth.field.email.ph")}
                  className={cn("mt-1.5 h-12 bg-white/5 text-base sm:h-10 sm:text-sm", errors.email && "border-destructive focus-visible:ring-destructive")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-xs text-destructive">{errors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="pw">{t("auth.field.password")}</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="pw"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn("h-12 bg-white/5 pr-11 text-base sm:h-10 sm:text-sm", errors.password && "border-destructive focus-visible:ring-destructive")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "pw-error" : mode === "register" ? "pw-hint" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? t("auth.field.password.hide") : t("auth.field.password.show")}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p id="pw-error" className="mt-1.5 text-xs text-destructive">{errors.password}</p>
                ) : mode === "register" ? (
                  <p id="pw-hint" className="mt-1.5 text-xs text-muted-foreground">
                    {t("auth.hint.password")}
                  </p>
                ) : null}
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full bg-[var(--gradient-brand)] text-base text-white shadow-[var(--shadow-glow)] sm:h-10 sm:text-sm"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "login" ? t("auth.btn.login") : t("auth.btn.register")}
              </Button>

              {mode === "login" && (
                <div className="text-center">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {t("auth.forgot")}
                  </Link>
                </div>
              )}

              <div className="relative py-2 text-center text-xs text-muted-foreground">
                <span className="relative z-10 bg-transparent px-2">{t("auth.or")}</span>
                <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" aria-hidden />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogle}
                disabled={loading}
                className="h-12 w-full border-white/15 bg-white/5 text-base sm:h-10 sm:text-sm"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.24 1.4-1.66 4.1-5.4 4.1-3.25 0-5.9-2.7-5.9-6s2.65-6 5.9-6c1.85 0 3.09.79 3.8 1.47l2.6-2.5C16.83 3.7 14.7 2.7 12 2.7 6.9 2.7 2.8 6.8 2.8 12s4.1 9.3 9.2 9.3c5.31 0 8.83-3.73 8.83-8.99 0-.6-.07-1.06-.15-1.51H12z"/>
                </svg>
                {t("auth.google")}
              </Button>

              <p className="pt-2 text-center text-xs text-muted-foreground">
                {t("auth.terms")}
              </p>
            </form>
            )}
            </>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function ConfirmEmailPanel({
  email,
  onResend,
  onBack,
  onChangeEmail,
  onAlreadyConfirmed,
  state,
}: {
  email: string;
  onResend: () => void;
  onBack: () => void;
  onChangeEmail: () => void;
  onAlreadyConfirmed: () => void;
  state: { loading: boolean; cooldown: number; error?: string; sent?: boolean };
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--gradient-brand)] shadow-[var(--shadow-glow)]">
          <MailCheck className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold leading-tight sm:text-3xl">
          {t("auth.confirm.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("auth.confirm.sent")}
          <br />
          <span className="font-medium text-foreground">{email}</span>
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          {t("auth.confirm.expires")}
        </p>
      </div>

      {state.sent && (
        <div
          role="status"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-xs text-emerald-200"
        >
          {t("auth.confirm.resent")}
        </div>
      )}
      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-3">
        <Button
          type="button"
          onClick={onResend}
          disabled={state.loading || state.cooldown > 0}
          className="h-12 w-full bg-[var(--gradient-brand)] text-base text-white shadow-[var(--shadow-glow)] sm:h-10 sm:text-sm"
        >
          {state.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {state.cooldown > 0
            ? t("auth.confirm.resend_in").replace("{n}", String(state.cooldown))
            : t("auth.confirm.resend")}
        </Button>
        {state.cooldown > 0 && (
          <p
            role="timer"
            aria-live="polite"
            className="text-center text-xs text-muted-foreground"
          >
            {t("auth.confirm.timer_a")}{" "}
            <span className="font-medium text-foreground tabular-nums">{state.cooldown}{t("auth.confirm.timer_b")}</span>
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onChangeEmail}
          className="h-12 w-full border-white/15 bg-white/5 text-base sm:h-10 sm:text-sm"
        >
          {t("auth.confirm.change_email")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onAlreadyConfirmed}
          className="h-12 w-full border-gold/40 bg-gold/10 text-base font-medium text-foreground hover:bg-gold/20 sm:h-10 sm:text-sm"
        >
          {t("auth.confirm.already_confirmed")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-12 w-full border-white/15 bg-white/5 text-base sm:h-10 sm:text-sm"
        >
          {t("auth.confirm.back")}
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {t("auth.confirm.wrong_email")}{" "}
        <button type="button" onClick={onChangeEmail} className="text-foreground underline-offset-4 hover:underline">
          {t("auth.confirm.use_diff")}
        </button>
      </p>
    </div>
  );
}