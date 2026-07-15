import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Trophy, Timer, Users, Wallet, Target, Medal, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { subscribeCompetition } from "@/lib/actions.functions";
import { useAuth } from "@/hooks/use-auth";
import { useAvailableBalance } from "@/hooks/use-balance";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/competitions")({
  head: () => ({
    meta: [
      { title: "المسابقات — HKEX Invest" },
      { name: "description", content: "مسابقات تداول دورية برسم اشتراك رمزي وحساب تجريبي. حقق أعلى عائد واحصل على جائزة نقدية حقيقية حسب باقة اشتراكك." },
      { property: "og:title", content: "مسابقات التداول — HK" },
      { property: "og:description", content: "اشترك بـ 10$ ونافس على جائزة 1000$، أو ارفع الاشتراك لمضاعفة الجائزة." },
    ],
  }),
  component: CompetitionsPage,
});

type Tier = { fee: number; demo: number; prize: number; popular?: boolean };

const TIERS: Tier[] = [
  { fee: 10, demo: 1000, prize: 1000 },
  { fee: 20, demo: 1000, prize: 2000, popular: true },
  { fee: 50, demo: 1000, prize: 5000 },
  { fee: 100, demo: 1000, prize: 10000 },
];

type Comp = {
  id: string;
  name: string;
  tagline: string;
  start: string;
  end: string;
  status: "upcoming" | "live" | "ended";
  participants: number;
  topReturn: number;
  market: string;
};

const COMPS: Comp[] = [
  { id: "fx-nov", name: "Forex Masters", tagline: "أزواج العملات الكبرى — أسبوعان من التحدي", start: "2026-07-15", end: "2026-07-29", status: "live", participants: 1842, topReturn: 138.4, market: "فوركس" },
  { id: "crypto-q3", name: "Crypto Cup", tagline: "BTC / ETH وأشهر العملات الرقمية", start: "2026-08-01", end: "2026-08-15", status: "upcoming", participants: 612, topReturn: 0, market: "كريبتو" },
  { id: "gold-classic", name: "Gold Classic", tagline: "تداول الذهب والمعادن — سباق 10 أيام", start: "2026-08-05", end: "2026-08-15", status: "upcoming", participants: 340, topReturn: 0, market: "معادن" },
  { id: "indices-june", name: "Indices Championship", tagline: "مؤشرات عالمية — سباق أسبوعي", start: "2026-06-20", end: "2026-06-27", status: "ended", participants: 2104, topReturn: 89.7, market: "مؤشرات" },
];

const STATUS_STYLE: Record<Comp["status"], { label: string; cls: string }> = {
  live: { label: "جارية الآن", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-400" },
  upcoming: { label: "قادمة", cls: "border-gold/40 bg-gold/10 text-gold" },
  ended: { label: "انتهت", cls: "border-white/10 bg-white/5 text-muted-foreground" },
};

const fmtMoney = (n: number) => "$" + new Intl.NumberFormat("en-US").format(n);

function CompetitionsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const submitSubscribe = useServerFn(subscribeCompetition);
  const [pending, setPending] = useState<string | null>(null);
  const { available, reload: reloadBalance } = useAvailableBalance();

  async function handleSubscribe(fee: number, competitionId?: string) {
    if (!loading && !user) {
      toast.error("سجّل الدخول أولاً للاشتراك في المسابقة.");
      navigate({ to: "/auth", search: { redirect: "/competitions" } as never });
      return;
    }
    const key = competitionId ?? `tier-${fee}`;
    setPending(key);
    try {
      if (available < fee) {
        toast.error(
          `رصيدك المتاح $${available.toFixed(2)} لا يكفي لرسم اشتراك $${fee}. أعد التوجيه إلى صفحة الإيداع.`,
        );
        navigate({ to: "/investor", hash: "deposit" });
        return;
      }
      // Atomic deduct + insert via SECURITY DEFINER RPC; prevents
      // double-click duplicates and race conditions on the wallet balance.
      const { error: rpcErr } = await supabase.rpc("enter_competition", {
        _competition_id: competitionId ?? "",
        _tier_fee: fee,
      });
      if (rpcErr) {
        if (/Insufficient balance/i.test(rpcErr.message)) {
          toast.error("الرصيد غير كافٍ. توجّه إلى صفحة الإيداع.");
          navigate({ to: "/investor", hash: "deposit" });
        } else if (/Duplicate/i.test(rpcErr.message)) {
          toast.error("هذا الاشتراك تم للتو — لا تكرار.");
        } else {
          toast.error("تعذّر إتمام الاشتراك. حاول مجدداً.");
        }
        return;
      }
      // Server-side guarded — rejects unauthenticated callers with 401.
      await submitSubscribe({ data: { tierFee: fee, competitionId } });
      toast.success(`تم خصم $${fee} من محفظتك وتسجيل اشتراكك.`);
      await reloadBalance();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (/unauthor/i.test(msg) || /401/.test(msg)) {
        toast.error("انتهت الجلسة. سجّل الدخول مجدداً.");
        navigate({ to: "/auth", search: { redirect: "/competitions" } as never });
      } else {
        toast.error("تعذّر إتمام الاشتراك. حاول لاحقاً.");
      }
    } finally {
      setPending(null);
    }
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="مسابقات التداول"
        title={<>نافس وارْبح — <span className="text-gold">حساب تجريبي، جائزة حقيقية</span></>}
        subtitle={"اشترك برسم رمزي، تداول على حساب تجريبي، وإذا كنت من الخمسة الأوائل بأعلى عائد\nستحصل على جائزة نقدية قابلة للسحب."}
      />

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { icon: Wallet, t: "اشترك", b: "ادفع رسم اشتراك يبدأ من 10$ فقط." },
            { icon: Sparkles, t: "احصل على رأسمال تجريبي", b: "يودَع في حسابك 1000$ تجريبية لجميع الباقات." },
            { icon: Target, t: "تداول ونافس", b: "كبّر رأس مالك خلال فترة المسابقة." },
            { icon: Medal, t: "اربح", b: "أول 5 مراكز يحصلون على جوائز نقدية حقيقية." },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-5 text-center">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-gold/30 bg-gold/10">
                <s.icon className="h-5 w-5 text-gold" />
              </div>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">خطوة {i + 1}</p>
              <h3 className="mt-1 font-display text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TIERS */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">الباقات</p>
            <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">اختر مستوى المنافسة</h2>
          </div>
          <p className="hidden max-w-md text-xs text-muted-foreground sm:block">
            رأس المال التجريبي موحّد 1000$ لجميع الباقات، وكل زيادة في رسم الاشتراك ترفع قيمة الجائزة القابلة للسحب.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier) => (
            <div
              key={tier.fee}
              className={`relative rounded-2xl border p-5 backdrop-blur-xl ${tier.popular ? "border-gold/50 bg-gold/[0.06]" : "border-white/10 bg-card/40"}`}
            >
              {tier.popular && (
                <span className="absolute -top-3 start-4 rounded-full border border-gold/40 bg-gold px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-background">
                  الأكثر شعبية
                </span>
              )}
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">رسم الاشتراك</p>
              <p className="mt-1 font-display text-3xl font-bold text-gold">{fmtMoney(tier.fee)}</p>
              <div className="mt-4 space-y-2 text-sm">
                <Row label="رأس المال التجريبي" value={fmtMoney(tier.demo)} />
                <Row label="الجائزة القابلة للسحب" value={fmtMoney(tier.prize)} highlight />
                <Row label="شرط الفوز" value="ضمن الخمسة الأوائل" />
              </div>
              <Button
                className="mt-5 w-full"
                variant={tier.popular ? "default" : "outline"}
                disabled={pending === `tier-${tier.fee}`}
                onClick={() => handleSubscribe(tier.fee)}
              >
                اشترك بـ {fmtMoney(tier.fee)}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* COMPETITIONS LIST */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">المسابقات المتاحة</p>
          <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">جدول المسابقات</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {COMPS.map((c) => (
            <CompetitionCard
              key={c.id}
              comp={c}
              pending={pending === c.id}
              onJoin={() => handleSubscribe(TIERS[0].fee, c.id)}
            />
          ))}
        </div>
      </section>

      {/* RULES */}
      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="glass-strong rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-2 text-gold">
            <Trophy className="h-5 w-5" />
            <h3 className="font-display text-xl font-bold">شروط الجوائز</h3>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {[
              "لكل مسابقة تاريخ بداية وتاريخ نهاية محددان — أي صفقة خارج هذه النافذة لا تُحتسب.",
              "يجب أن تكون ضمن أعلى 5 متسابقين من حيث نسبة العائد المحققة على رأس المال التجريبي.",
              "رأس المال التجريبي موحّد 1000$ لجميع الباقات. الجائزة القابلة للسحب تتضاعف حسب رسم الاشتراك (10$ → 1000$ ، 20$ → 2000$ ، 50$ → 5000$ ، 100$ → 10000$).",
              "التداول يتم على حساب تجريبي بأدوات حقيقية بأسعار السوق — لا مخاطرة على أموالك الشخصية.",
              "في حال التعادل، يُرجَّح المتسابق الذي حقق العائد في فترة زمنية أقصر.",
            ].map((r, i) => (
              <li key={i} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-400" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            التداول ينطوي على مخاطر. المسابقات مخصّصة لأغراض تعليمية وترفيهية ولا تشكّل استشارة استثمارية.
          </p>
        </div>
      </section>
    </PageShell>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-b border-white/5 pb-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`font-mono tabular-nums ${highlight ? "text-emerald-400 font-semibold" : ""}`}>{value}</span>
    </div>
  );
}

function CompetitionCard({ comp, pending, onJoin }: { comp: Comp; pending: boolean; onJoin: () => void }) {
  const s = STATUS_STYLE[comp.status];
  const countdown = useCountdown(comp.status === "live" ? comp.end : comp.start);
  return (
    <article className="glass-strong rounded-2xl p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${s.cls}`}>{s.label}</span>
            <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{comp.market}</span>
          </div>
          <h3 className="mt-2 font-display text-lg font-bold">{comp.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{comp.tagline}</p>
        </div>
        <Trophy className="h-6 w-6 flex-none text-gold/70" />
      </header>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <Stat icon={Timer} label={comp.status === "live" ? "تنتهي خلال" : comp.status === "upcoming" ? "تبدأ خلال" : "انتهت"} value={countdown} />
        <Stat icon={Users} label="مشاركون" value={new Intl.NumberFormat("en-US").format(comp.participants)} />
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
        <span className="text-muted-foreground">
          {new Date(comp.start).toLocaleDateString("ar")} → {new Date(comp.end).toLocaleDateString("ar")}
        </span>
        {comp.topReturn > 0 && (
          <span className="font-mono tabular-nums text-emerald-400">أعلى عائد: +{comp.topReturn}%</span>
        )}
      </div>

      <div className="mt-4 grid gap-2">
        <Button className="w-full" disabled={comp.status === "ended" || pending} onClick={onJoin}>
          {comp.status === "ended" ? "انتهت المسابقة" : comp.status === "live" ? "انضم الآن" : "احجز مقعدك"}
        </Button>
        {comp.status !== "ended" && (
          <Button asChild variant="outline" className="w-full border-gold/40 text-gold hover:bg-gold/10">
            <Link to="/competitions/$id/trade" params={{ id: comp.id }}>ابدأ التداول التجريبي</Link>
          </Button>
        )}
      </div>
    </article>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Timer; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
      <div className="flex items-center gap-1 text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span className="font-mono text-[9px] uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function useCountdown(target: string) {
  const [text, setText] = useState("—");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) return setText("—");
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setText(`${d}ي ${h}س ${m}د`);
    };
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, [target]);
  return text;
}