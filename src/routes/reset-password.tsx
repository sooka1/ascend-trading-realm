import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { HKLogo } from "@/components/hk-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password | HKEX" },
      { name: "description", content: "Choose a new password for your HKEX account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { t } = useI18n();
  const schema = z
    .object({
      password: z
        .string()
        .min(8, t("auth.err.password.min8"))
        .max(72, t("auth.err.password.long"))
        .regex(/[A-Za-z]/, t("auth.err.password.letter"))
        .regex(/[0-9]/, t("auth.err.password.number")),
      confirm: z.string(),
    })
    .refine((d) => d.password === d.confirm, {
      path: ["confirm"],
      message: t("auth.err.password.mismatch"),
    });
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState<"pending" | "ok" | "invalid">("pending");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase can send the recovery credentials in three shapes:
    // 1) PKCE:      ?code=...
    // 2) OTP link:  ?token_hash=...&type=recovery
    // 3) Legacy:    #access_token=...&refresh_token=...&type=recovery
    let cancelled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady("ok");
      }
    });

    (async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type");
        const errorDescription =
          url.searchParams.get("error_description") ||
          new URLSearchParams(window.location.hash.slice(1)).get("error_description");

        if (errorDescription) {
          if (!cancelled) setReady("invalid");
          return;
        }

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!cancelled) setReady(!error && data.session ? "ok" : "invalid");
          return;
        }

        if (tokenHash) {
          const { data, error } = await supabase.auth.verifyOtp({
            type: (type as "recovery") || "recovery",
            token_hash: tokenHash,
          });
          if (!cancelled) setReady(!error && data.session ? "ok" : "invalid");
          return;
        }

        // Legacy hash flow — supabase-js parses it automatically.
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          if (!cancelled) setReady("ok");
          return;
        }
        setTimeout(async () => {
          if (cancelled) return;
          const { data: d2 } = await supabase.auth.getSession();
          setReady(d2.session ? "ok" : "invalid");
        }, 800);
      } catch {
        if (!cancelled) setReady("invalid");
      }
    })();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      const fe: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof typeof fe;
        if (key && !fe[key]) fe[key] = issue.message;
      }
      setErrors(fe);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success(t("auth.reset.toast"));
      await supabase.auth.signOut();
      setTimeout(() => navigate({ to: "/auth", replace: true }), 1600);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("auth.reset.err.generic");
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col px-4 py-6 sm:px-6 sm:py-16">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <Link
            to="/auth"
            aria-label={t("auth.forgot.back_aria")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link to="/"><HKLogo /></Link>
          <span className="h-10 w-10" aria-hidden />
        </div>

        <div className="w-full rounded-none border-0 bg-transparent p-0 sm:glass-strong sm:rounded-3xl sm:border sm:p-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
              {t("auth.reset.title")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("auth.reset.sub")}
            </p>
          </div>

          {ready === "pending" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("auth.reset.verifying")}
            </div>
          )}

          {ready === "invalid" && (
            <div className="space-y-4">
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{t("auth.reset.invalid")}</span>
              </div>
              <Button asChild className="h-12 w-full bg-[var(--gradient-brand)] text-base text-white sm:h-10 sm:text-sm">
                <Link to="/forgot-password">{t("auth.reset.request_new")}</Link>
              </Button>
            </div>
          )}

          {ready === "ok" && !done && (
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {errors.form && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errors.form}</span>
                </div>
              )}
              <div>
                <Label htmlFor="pw">{t("auth.field.password.new")}</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="pw"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(
                      "h-12 bg-white/5 pr-11 text-base sm:h-10 sm:text-sm",
                      errors.password && "border-destructive focus-visible:ring-destructive",
                    )}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "pw-error" : "pw-hint"}
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
                ) : (
                  <p id="pw-hint" className="mt-1.5 text-xs text-muted-foreground">
                    {t("auth.hint.password")}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="pw2">{t("auth.field.password.confirm")}</Label>
                <Input
                  id="pw2"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={cn(
                    "mt-1.5 h-12 bg-white/5 text-base sm:h-10 sm:text-sm",
                    errors.confirm && "border-destructive focus-visible:ring-destructive",
                  )}
                  aria-invalid={!!errors.confirm}
                  aria-describedby={errors.confirm ? "pw2-error" : undefined}
                />
                {errors.confirm && (
                  <p id="pw2-error" className="mt-1.5 text-xs text-destructive">{errors.confirm}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full bg-[var(--gradient-brand)] text-base text-white shadow-[var(--shadow-glow)] sm:h-10 sm:text-sm"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("auth.reset.update")}
              </Button>
            </form>
          )}

          {done && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium text-emerald-100">{t("auth.reset.updated.title")}</p>
                <p className="mt-1 text-emerald-200/90">{t("auth.reset.updated.body")}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}