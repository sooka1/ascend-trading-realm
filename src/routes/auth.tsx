import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { HKLogo } from "@/components/hk-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ShieldCheck, Trophy, Zap, Loader2, Eye, EyeOff, AlertCircle, ArrowLeft, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { z } from "zod";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or open an account | HK Global Trading" },
      { name: "description", content: "Log in to your HK Global Trading account or open a new one in under 5 minutes." },
      { property: "og:title", content: "HK Global Trading — Sign in" },
      { property: "og:description", content: "Access your trading terminal and competitions dashboard." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const { t } = useI18n();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string; form?: string }>({});
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendState, setResendState] = useState<{ loading: boolean; cooldown: number; error?: string; sent?: boolean }>({
    loading: false,
    cooldown: 0,
  });
  const navigate = useNavigate();

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
  }, []);

  // Route super_admin → /admin, everyone else → /dashboard.
  async function goPostLogin(userId: string) {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "super_admin")
        .maybeSingle();
      navigate({ to: data ? "/admin" : "/dashboard", replace: true });
    } catch {
      navigate({ to: "/dashboard", replace: true });
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    // Client-side rate limit: 5 attempts per minute per email.
    const key = `auth:${mode}:${email.toLowerCase().trim()}`;
    const { rateLimit } = await import("@/lib/rate-limit");
    const limiter = rateLimit(key, { max: 5, windowMs: 60_000 });
    if (!limiter.tryConsume()) {
      const secs = Math.ceil(limiter.resetIn() / 1000);
      toast.error(`محاولات كثيرة. حاول بعد ${secs} ثانية.`);
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
        else navigate({ to: "/dashboard", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
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
          setResendState({ loading: false, cooldown: 30 });
          saveCooldown(email, 30);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t("auth.err.generic");
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!pendingEmail || resendState.loading || resendState.cooldown > 0) return;
    setResendState((s) => ({ ...s, loading: true, error: undefined, sent: false }));
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: pendingEmail,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
      setResendState({ loading: false, cooldown: 30, sent: true });
      saveCooldown(pendingEmail, 30);
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
      else navigate({ to: "/dashboard", replace: true });
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
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} HK Global Trading</p>
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
                state={resendState}
              />
            ) : (
            <>
            <div className="mb-4 lg:hidden">
              <h1 className="font-display text-2xl font-bold leading-tight">
                {mode === "login" ? t("auth.mobile.welcome") : t("auth.mobile.open")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "login" ? t("auth.mobile.welcome.sub") : t("auth.mobile.open.sub")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-white/[0.03] p-1">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setErrors({}); }}
                  className={cn(
                    "rounded-md py-2.5 text-sm font-medium capitalize transition",
                    mode === m ? "bg-[var(--gradient-brand)] text-white" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "login" ? t("auth.tab.login") : t("auth.tab.register")}
                </button>
              ))}
            </div>

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
  state,
}: {
  email: string;
  onResend: () => void;
  onBack: () => void;
  onChangeEmail: () => void;
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