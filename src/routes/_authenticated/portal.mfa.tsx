import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShieldCheck, Trash2, KeyRound, Smartphone, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/mfa")({
  head: () => ({
    meta: [
      { title: "المصادقة الثنائية | HK Investment Management" },
      { name: "description", content: "تفعيل وإدارة المصادقة الثنائية عبر تطبيق TOTP." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MfaPage,
});

type Factor = { id: string; friendly_name: string | null; status: string; factor_type: string };

function MfaPage() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enroll, setEnroll] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) toast.error(error.message);
    setFactors(((data?.all ?? []) as Factor[]));
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function startEnroll() {
    setBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Authenticator ${new Date().toLocaleDateString()}`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setEnroll({
      factorId: data.id,
      qr: data.totp.qr_code,
      secret: data.totp.secret,
    });
  }

  async function verify() {
    if (!enroll || code.length < 6) return;
    setBusy(true);
    const { data: ch, error: e1 } = await supabase.auth.mfa.challenge({ factorId: enroll.factorId });
    if (e1 || !ch) {
      setBusy(false);
      return toast.error(e1?.message ?? "تعذّر التحدي");
    }
    const { error: e2 } = await supabase.auth.mfa.verify({
      factorId: enroll.factorId,
      challengeId: ch.id,
      code,
    });
    setBusy(false);
    if (e2) return toast.error(e2.message);
    toast.success("تم تفعيل المصادقة الثنائية");
    setEnroll(null);
    setCode("");
    await refresh();
  }

  async function remove(id: string) {
    if (!confirm("هل تريد فعلاً إزالة هذا العامل؟")) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) return toast.error(error.message);
    toast.success("تمت الإزالة");
    refresh();
  }

  return (
    <PageShell bare>
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          to="/portal"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-gold/40 hover:text-foreground"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          <span>رجوع</span>
        </Link>
        <p className="mt-4 text-xs uppercase tracking-widest text-gold">Security</p>
        <h1 className="mt-1 flex items-center gap-2 font-display text-3xl font-semibold md:text-4xl">
          <ShieldCheck className="h-7 w-7 text-gold" /> المصادقة الثنائية (MFA)
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          أضف طبقة حماية إضافية باستخدام تطبيق موثوق مثل Google Authenticator أو 1Password.
        </p>

        <div className="glass mt-6 rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold">العوامل النشطة</h2>
          {loading ? (
            <p className="mt-3 text-sm text-muted-foreground">جارٍ التحميل…</p>
          ) : factors.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">لا توجد عوامل مسجّلة بعد.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {factors.map((f) => (
                <li key={f.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-gold" />
                    <span className="font-medium">{f.friendly_name ?? f.factor_type}</span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                      {f.status}
                    </span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => remove(f.id)} className="text-red-300 hover:bg-red-500/10">
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> إزالة
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {!enroll ? (
            <Button className="mt-4" onClick={startEnroll} disabled={busy}>
              <KeyRound className="mr-1 h-4 w-4" /> إضافة عامل TOTP جديد
            </Button>
          ) : (
            <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
              <p className="text-sm text-muted-foreground">
                امسح رمز QR في تطبيق المصادقة، ثم أدخل الرمز المكوّن من 6 أرقام لتأكيد التفعيل.
              </p>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                <img src={enroll.qr} alt="QR Code TOTP" className="h-40 w-40 rounded-xl bg-white p-2" />
                <div className="flex-1 space-y-2">
                  <div className="text-xs text-muted-foreground">أو أدخل هذا المفتاح يدويًا:</div>
                  <code className="block break-all rounded-lg bg-white/5 px-3 py-2 text-xs">{enroll.secret}</code>
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    aria-label="رمز التحقق"
                  />
                  <div className="flex gap-2">
                    <Button onClick={verify} disabled={busy || code.length < 6}>تأكيد</Button>
                    <Button variant="ghost" onClick={() => { setEnroll(null); setCode(""); }}>
                      إلغاء
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          يوصى بتفعيل MFA لجميع الحسابات ذات صلاحيات مالية أو إدارية.
        </p>
      </section>
    </PageShell>
  );
}