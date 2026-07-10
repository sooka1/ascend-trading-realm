import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { HKLogo } from "@/components/hk-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password | HK Global Trading" },
      { name: "description", content: "Request a secure password reset link for your HK Global Trading account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const { t } = useI18n();
  const schema = z.object({
    email: z.string().trim().min(1, t("auth.err.email.required")).email(t("auth.err.email.invalid")).max(255),
  });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? t("auth.forgot.err.invalid"));
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const match = raw.match(/only request this after (\d+) seconds?/i);
      if (match) {
        setError(`لأسباب أمنية، يمكنك طلب رابط جديد بعد ${match[1]} ثانية. تحقّق من صندوق الوارد ومجلد الرسائل غير المرغوب فيها.`);
      } else {
        setError(raw || t("auth.forgot.err.generic"));
      }
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
              {t("auth.forgot.title")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("auth.forgot.sub")}
            </p>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium text-emerald-100">{t("auth.forgot.sent.title")}</p>
                  <p className="mt-1 text-emerald-200/90">
                    {t("auth.forgot.sent.body_a")} <span className="font-medium">{email}</span>, {t("auth.forgot.sent.body_b")}
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>{t("auth.forgot.spam")}</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSent(false)}
                    className="h-12 w-full border-white/15 bg-white/5 text-base sm:h-10 sm:text-sm"
                  >
                    {t("auth.forgot.again")}
                  </Button>
                  <Button asChild className="h-12 w-full bg-[var(--gradient-brand)] text-base text-white sm:h-10 sm:text-sm">
                    <Link to="/auth">{t("auth.forgot.back_signin")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <Label htmlFor="email">{t("auth.field.email")}</Label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder={t("auth.field.email.ph")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "h-12 bg-white/5 pl-10 text-base sm:h-10 sm:text-sm",
                      fieldError && "border-destructive focus-visible:ring-destructive",
                    )}
                    aria-invalid={!!fieldError}
                    aria-describedby={fieldError ? "email-error" : undefined}
                  />
                </div>
                {fieldError && (
                  <p id="email-error" className="mt-1.5 text-xs text-destructive">{fieldError}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full bg-[var(--gradient-brand)] text-base text-white shadow-[var(--shadow-glow)] sm:h-10 sm:text-sm"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("auth.forgot.send")}
              </Button>
              <p className="pt-2 text-center text-sm text-muted-foreground">
                {t("auth.forgot.back_login")}{" "}
                <Link to="/auth" className="text-foreground underline-offset-4 hover:underline">
                  {t("auth.forgot.signin")}
                </Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </PageShell>
  );
}