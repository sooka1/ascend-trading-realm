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
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

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
        toast.success("Email confirmed");
        navigate({ to: "/dashboard", replace: true });
      }
    });
    // Fallback poll in case storage events don't fire (e.g. different browser).
    const interval = setInterval(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        clearInterval(interval);
        clearCooldown();
        toast.success("Email confirmed");
        navigate({ to: "/dashboard", replace: true });
      }
    }, 5000);
    return () => {
      sub.subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [pendingEmail, navigate]);

  const loginSchema = z.object({
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email").max(255),
    password: z.string().min(6, "Password must be at least 6 characters").max(72, "Password is too long"),
  });
  const registerSchema = loginSchema.extend({
    fullName: z.string().trim().min(2, "Please enter your full name").max(100, "Name is too long"),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .max(72, "Password is too long")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/[0-9]/, "Include at least one number"),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
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
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: fullName },
          },
        });
        if (error) throw error;
        // When email confirmation is enabled, no session is returned.
        if (data.session) {
          clearCooldown();
          toast.success("Account created");
          navigate({ to: "/dashboard", replace: true });
        } else {
          setPendingEmail(email);
          setResendState({ loading: false, cooldown: 30 });
          saveCooldown(email, 30);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
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
      toast.success("Confirmation email sent");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't resend the email";
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
        toast.error(result.error.message ?? "Google sign-in failed");
        return;
      }
      if (result.redirected) return; // browser navigates away
      // Popup / web_message flow: session is set — go to dashboard
      navigate({ to: "/dashboard", replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-10 px-4 py-6 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-8">
        <div className="hidden flex-col justify-between lg:flex">
          <Link to="/"><HKLogo size="lg" /></Link>
          <div>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
              Welcome to the <span className="text-gradient">global trading floor.</span>
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              One account. Every market. Real prize pools. Join more than 2 million traders competing on HK.
            </p>
            <div className="mt-8 grid gap-3">
              {[
                { icon: Zap, label: "Sub-20ms execution across 10,000+ instruments" },
                { icon: Trophy, label: "Enter live competitions from your dashboard" },
                { icon: ShieldCheck, label: "Segregated funds, multi-jurisdiction regulation" },
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
              <Link to="/" aria-label="Back to home" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
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
                {mode === "login" ? "Welcome back" : "Open your account"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "login"
                  ? "Sign in to access your trading terminal."
                  : "Join in under 5 minutes. No commitment."}
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
                  {m === "login" ? "Log in" : "Open account"}
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
                  <Label htmlFor="fullname">Full name</Label>
                  <Input
                    id="fullname"
                    placeholder="Alex Rivera"
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  placeholder="you@example.com"
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
                <Label htmlFor="pw">Password</Label>
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
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p id="pw-error" className="mt-1.5 text-xs text-destructive">{errors.password}</p>
                ) : mode === "register" ? (
                  <p id="pw-hint" className="mt-1.5 text-xs text-muted-foreground">
                    Use 8+ characters with a mix of letters and numbers.
                  </p>
                ) : null}
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full bg-[var(--gradient-brand)] text-base text-white shadow-[var(--shadow-glow)] sm:h-10 sm:text-sm"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "login" ? "Log in" : "Create account"}
              </Button>

              {mode === "login" && (
                <div className="text-center">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              )}

              <div className="relative py-2 text-center text-xs text-muted-foreground">
                <span className="relative z-10 bg-transparent px-2">or continue with</span>
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
                Continue with Google
              </Button>

              <p className="pt-2 text-center text-xs text-muted-foreground">
                By continuing you agree to our Terms and Privacy Policy.
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
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--gradient-brand)] shadow-[var(--shadow-glow)]">
          <MailCheck className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold leading-tight sm:text-3xl">
          Confirm your email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a confirmation link to
          <br />
          <span className="font-medium text-foreground">{email}</span>
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Click the link in that email to activate your account. It expires in 24 hours.
        </p>
      </div>

      {state.sent && (
        <div
          role="status"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-xs text-emerald-200"
        >
          A new confirmation email is on the way.
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
          {state.cooldown > 0 ? `Resend in ${state.cooldown}s` : "Resend confirmation email"}
        </Button>
        {state.cooldown > 0 && (
          <p
            role="timer"
            aria-live="polite"
            className="text-center text-xs text-muted-foreground"
          >
            You can request another email in{" "}
            <span className="font-medium text-foreground tabular-nums">{state.cooldown}s</span>.
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onChangeEmail}
          className="h-12 w-full border-white/15 bg-white/5 text-base sm:h-10 sm:text-sm"
        >
          Change email address
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-12 w-full border-white/15 bg-white/5 text-base sm:h-10 sm:text-sm"
        >
          Back to sign in
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Wrong email?{" "}
        <button type="button" onClick={onChangeEmail} className="text-foreground underline-offset-4 hover:underline">
          Use a different address
        </button>
      </p>
    </div>
  );
}