import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { HKLogo } from "@/components/hk-logo";
import { ShieldCheck, Loader2 } from "lucide-react";

// The Supabase `auth.oauth` namespace is beta; type it locally so this route
// compiles regardless of the @supabase/supabase-js version shipped.
type AuthorizationDetails = {
  client?: { name?: string; redirect_uri?: string } | null;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};
type OAuthResult<T> = { data: T | null; error: { message: string } | null };
type AuthOAuth = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult<AuthorizationDetails>>;
  approveAuthorization: (id: string) => Promise<OAuthResult<AuthorizationDetails>>;
  denyAuthorization: (id: string) => Promise<OAuthResult<AuthorizationDetails>>;
};
const authOAuth = () =>
  (supabase.auth as unknown as { oauth: AuthOAuth }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  // Browser-only: the Supabase client reads its session from localStorage,
  // absent on the SSR pass. Without this, getSession() is null on the server.
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { redirect: next } as never });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await authOAuth().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-xl font-semibold">تعذّر تحميل طلب الوصول</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? "التطبيق الخارجي";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const oauth = authOAuth();
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorization_id)
      : await oauth.denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("لم يُرجع خادم المصادقة عنوان إعادة توجيه.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-10">
      <div className="w-full rounded-2xl border border-white/10 bg-[color:var(--surface,#0b0f19)]/80 p-8 shadow-xl backdrop-blur">
        <div className="flex flex-col items-center text-center">
          <HKLogo className="h-10 w-auto" />
          <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-widest text-gold">
            <ShieldCheck className="h-4 w-4" />
            <span>ربط تطبيق خارجي</span>
          </div>
          <h1 className="mt-3 font-display text-2xl font-semibold">
            السماح لـ {clientName} بالوصول إلى حسابك؟
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            سيتمكّن {clientName} من استدعاء أدوات هذا التطبيق نيابة عنك أثناء
            تسجيل دخولك. لن يتجاوز ذلك صلاحيات حسابك أو سياسات الأمان في HKEX
            Invest.
          </p>
          {details?.client?.redirect_uri && (
            <p className="mt-3 text-[11px] text-muted-foreground">
              عنوان إعادة التوجيه: <code className="font-mono">{details.client.redirect_uri}</code>
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-md bg-red-500/10 p-3 text-center text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <Button
            variant="outline"
            className="flex-1"
            disabled={busy}
            onClick={() => decide(false)}
          >
            إلغاء
          </Button>
          <Button
            className="flex-1 bg-[var(--gradient-brand)] text-white shadow-[var(--shadow-glow)]"
            disabled={busy}
            onClick={() => decide(true)}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "الموافقة والاتصال"}
          </Button>
        </div>
      </div>
    </main>
  );
}