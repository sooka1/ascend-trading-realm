import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, PortalCard } from "@/components/portal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Copy, Share2, Wallet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/portal/referrals")({
  head: () => ({ meta: [{ title: "الإحالة — بوابة العميل" }] }),
  component: ReferralsPage,
});

type Earning = { id: string; referee_id: string; amount: number; currency: string; created_at: string; deposit_id: string | null };

function ReferralsPage() {
  const [code, setCode] = useState<string>("");
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [refCount, setRefCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const [{ data: prof }, { data: es }, { count }] = await Promise.all([
        supabase.from("profiles").select("referral_code").eq("id", u.user.id).maybeSingle(),
        supabase.from("referral_earnings").select("id,referee_id,amount,currency,created_at,deposit_id").eq("referrer_id", u.user.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("referred_by", u.user.id),
      ]);
      setCode((prof?.referral_code as string) ?? "");
      setEarnings((es ?? []) as Earning[]);
      setRefCount(count ?? 0);
      setLoading(false);
    })();
  }, []);

  const link = typeof window !== "undefined" && code ? `${window.location.origin}/auth?ref=${code}` : "";
  const total = earnings.reduce((s, e) => s + Number(e.amount), 0);

  async function copyLink() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    toast.success("تم نسخ رابط الإحالة");
  }

  async function share() {
    if (!link) return;
    if (navigator.share) {
      try { await navigator.share({ title: "انضم إلى HK", url: link }); } catch { /* ignore */ }
    } else {
      void copyLink();
    }
  }

  return (
    <PortalShell eyebrow="الإحالة" title="ادعُ صديقًا واربح 10%" subtitle="احصل على 10% من قيمة أول إيداع لكل مستثمر جديد يسجّل عبر رابطك.">
      <div className="grid gap-6 lg:grid-cols-2">
        <PortalCard title="رابط الإحالة الخاص بك" icon={Share2}>
          {loading ? (
            <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-gold/80">الكود</p>
                <div className="flex items-center gap-2">
                  <Input readOnly value={code} className="bg-white/[0.03] font-mono text-lg tracking-widest" />
                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(code); toast.success("تم النسخ"); }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-gold/80">الرابط</p>
                <div className="flex items-center gap-2">
                  <Input readOnly value={link} className="bg-white/[0.03] text-xs" />
                  <Button variant="outline" size="sm" onClick={copyLink}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
              <Button onClick={share} className="w-full bg-gold font-semibold text-background hover:bg-[oklch(0.88_0.11_90)]">
                <Share2 className="ml-2 h-4 w-4" /> مشاركة الرابط
              </Button>
              <p className="rounded-md border border-white/5 bg-white/[0.02] p-3 text-xs text-muted-foreground">
                عند تسجيل مستخدم جديد عبر رابطك وتأكيد أول إيداع، تُضاف عمولة 10% تلقائيًا إلى رصيد إحالاتك.
              </p>
            </div>
          )}
        </PortalCard>

        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Kpi label="المُحالون" value={String(refCount)} icon={Users} />
            <Kpi label="إجمالي العمولات" value={`${total.toFixed(2)} USD`} icon={Wallet} />
          </div>
          <PortalCard title="سجل العمولات" icon={Wallet}>
            {earnings.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">لا توجد عمولات بعد.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {earnings.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 py-2.5 text-xs">
                    <div className="min-w-0">
                      <p className="truncate font-medium">إيداع مُحال</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{new Date(e.created_at).toLocaleString("ar")}</p>
                    </div>
                    <span className="font-mono text-sm font-semibold text-gold">+{Number(e.amount).toFixed(2)} {e.currency}</span>
                  </li>
                ))}
              </ul>
            )}
          </PortalCard>
        </div>
      </div>
    </PortalShell>
  );
}

function Kpi({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Users }) {
  return (
    <div className="rounded-xl border border-white/10 bg-card/50 p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gold/20 bg-gold/[0.06]"><Icon className="h-4 w-4 text-gold" /></span>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}