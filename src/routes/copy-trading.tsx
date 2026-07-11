import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Copy, TrendingUp, TrendingDown, Users, Wallet, Percent, Award, Lock } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/copy-trading")({
  head: () => ({
    meta: [
      { title: "نسخ الصفقات — HK Investment Management" },
      { name: "description", content: "انسخ صفقات نخبة من المتداولين العالميين. باقات بأسماء متداولين أجانب، نتائج شهرية موثقة على مدى سنتين، حد أدنى للإيداع ونسبة أرباح واضحة." },
      { property: "og:title", content: "نسخ الصفقات — HK Investment Management" },
      { property: "og:description", content: "باقات نسخ صفقات لمتداولين عالميين، مع سجل أداء شهري على مدى 24 شهراً." },
    ],
  }),
  component: CopyTradingPage,
});

type Trader = {
  id: string;
  name: string;
  country: string;
  flag: string;
  strategy: string;
  minDeposit: number;
  profitShare: number; // % taken by trader
  followers: number;
  winRate: number;
  seed: number;
};

const TRADERS: Trader[] = [
  { id: "sw", name: "Sebastian Weber", country: "ألمانيا", flag: "🇩🇪", strategy: "DAX & مؤشرات أوروبية", minDeposit: 500, profitShare: 20, followers: 1284, winRate: 68, seed: 11 },
  { id: "ln", name: "Lucas Nakamura", country: "اليابان", flag: "🇯🇵", strategy: "فوركس آسيوي — Swing", minDeposit: 750, profitShare: 22, followers: 2145, winRate: 71, seed: 23 },
  { id: "ap", name: "Alessandro Prati", country: "إيطاليا", flag: "🇮🇹", strategy: "ذهب ومعادن", minDeposit: 1000, profitShare: 25, followers: 968, winRate: 64, seed: 37 },
  { id: "or", name: "Olivia Reynolds", country: "المملكة المتحدة", flag: "🇬🇧", strategy: "GBP/USD — Scalping", minDeposit: 1500, profitShare: 25, followers: 1732, winRate: 66, seed: 51 },
  { id: "mk", name: "Mateo Kovač", country: "كرواتيا", flag: "🇭🇷", strategy: "عقود نفط وطاقة", minDeposit: 2000, profitShare: 28, followers: 612, winRate: 62, seed: 67 },
  { id: "et", name: "Elena Tavares", country: "البرتغال", flag: "🇵🇹", strategy: "أسهم أمريكية — Growth", minDeposit: 2500, profitShare: 28, followers: 1420, winRate: 69, seed: 79 },
  { id: "hj", name: "Henrik Johansson", country: "السويد", flag: "🇸🇪", strategy: "كريبتو — BTC/ETH", minDeposit: 3000, profitShare: 30, followers: 3208, winRate: 73, seed: 89 },
  { id: "rd", name: "Rafael Duarte", country: "البرازيل", flag: "🇧🇷", strategy: "سلع زراعية", minDeposit: 5000, profitShare: 30, followers: 845, winRate: 65, seed: 103 },
];

// deterministic pseudo-random in a bounded range
function seeded(seed: number, i: number, min: number, max: number) {
  const x = Math.sin(seed * 9301 + i * 49297) * 233280;
  const r = x - Math.floor(x);
  return min + r * (max - min);
}

function buildHistory(t: Trader) {
  // 24 monthly returns %, mostly positive but with drawdowns
  const months: { label: string; pct: number }[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("ar", { month: "short", year: "2-digit" });
    const base = seeded(t.seed, i + 1, -4, 12); // -4% to +12%
    // occasional stronger months
    const boost = seeded(t.seed, i + 100, 0, 1) > 0.85 ? seeded(t.seed, i + 200, 4, 8) : 0;
    const pct = Number((base + boost).toFixed(2));
    months.push({ label, pct });
  }
  return months;
}

const fmtMoney = (n: number) => new Intl.NumberFormat("en-US").format(n);

function CopyTradingPage() {
  const { user, loading } = useAuth();
  return (
    <PageShell>
      <PageHero
        eyebrow="نسخ الصفقات"
        title={<>انسخ صفقات <span className="text-gold">نخبة المتداولين العالميين</span></>}
        subtitle={"باقات مختارة يديرها متداولون محترفون حول العالم. تصفّح النتائج الشهرية على مدى 24 شهراً،\nواختر الباقة المناسبة لحدّك الأدنى للإيداع ونسبة أرباح واضحة."}
      />
      {!loading && !user && (
        <div className="mx-auto mt-6 max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-gold">
              <Lock className="h-4 w-4" />
              <span>يجب تسجيل الدخول لاختيار متداول أو طلب نسخ الصفقات.</span>
            </div>
            <Link to="/auth" className="rounded-lg bg-gold px-3 py-1.5 font-semibold text-background hover:bg-gold/90">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      )}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
          {TRADERS.map((t) => (
            <TraderCard key={t.id} trader={t} isAuthed={!!user} />
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-muted-foreground">
          العوائد المعروضة هي نتائج تاريخية تقريبية لأغراض العرض ولا تشكّل ضماناً لأي أرباح مستقبلية. الأداء الماضي لا يُعدّ مؤشراً على النتائج القادمة.
        </p>
      </section>
    </PageShell>
  );
}

function TraderCard({ trader, isAuthed }: { trader: Trader; isAuthed: boolean }) {
  const history = useMemo(() => buildHistory(trader), [trader]);
  const navigate = useNavigate();
  const lastMonth = history[history.length - 1];
  const total = useMemo(() => history.reduce((s, m) => s + m.pct, 0), [history]);
  const positiveMonths = history.filter((m) => m.pct > 0).length;
  const best = history.reduce((a, b) => (b.pct > a.pct ? b : a));
  const worst = history.reduce((a, b) => (b.pct < a.pct ? b : a));

  const [tab, setTab] = useState<"chart" | "table">("chart");

  return (
    <article className="glass-strong rounded-3xl p-5 md:p-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-2xl">{trader.flag}</div>
          <div>
            <h3 className="font-display text-lg font-semibold">{trader.name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{trader.country} · {trader.strategy}</p>
          </div>
        </div>
        <div className={`text-end ${lastMonth.pct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">آخر شهر</p>
          <p className="mt-0.5 font-display text-2xl font-bold tabular-nums">
            {lastMonth.pct >= 0 ? "+" : ""}{lastMonth.pct.toFixed(2)}%
          </p>
        </div>
      </header>

      {/* KPI strip */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi icon={Wallet} label="حد أدنى" value={`$${fmtMoney(trader.minDeposit)}`} />
        <Kpi icon={Percent} label="نسبة المتداول" value={`${trader.profitShare}%`} />
        <Kpi icon={Users} label="متابعون" value={fmtMoney(trader.followers)} />
        <Kpi icon={Award} label="نجاح" value={`${trader.winRate}%`} />
      </div>

      {/* Tabs */}
      <div className="mt-5 flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1 text-xs w-fit">
        <button
          onClick={() => setTab("chart")}
          className={`rounded-md px-3 py-1.5 font-mono uppercase tracking-wider transition ${tab === "chart" ? "bg-gold/15 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          الرسم
        </button>
        <button
          onClick={() => setTab("table")}
          className={`rounded-md px-3 py-1.5 font-mono uppercase tracking-wider transition ${tab === "table" ? "bg-gold/15 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          الجدول
        </button>
      </div>

      {tab === "chart" ? (
        <HistoryChart data={history} />
      ) : (
        <HistoryTable data={history} />
      )}

      {/* Summary */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <MiniStat label="إجمالي 24 شهر" value={`${total >= 0 ? "+" : ""}${total.toFixed(1)}%`} positive={total >= 0} />
        <MiniStat label="شهور رابحة" value={`${positiveMonths}/24`} positive={positiveMonths >= 12} />
        <MiniStat label="أعلى / أدنى" value={`${best.pct.toFixed(1)}% / ${worst.pct.toFixed(1)}%`} />
      </div>

      <button
        onClick={() => {
          if (!isAuthed) {
            toast.error("سجّل الدخول أولاً لطلب نسخ الصفقات.");
            navigate({ to: "/auth" });
            return;
          }
          toast.success(`تم إرسال طلب نسخ صفقات ${trader.name}.`);
        }}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold transition hover:bg-gold/20"
      >
        {isAuthed ? <Copy className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        {isAuthed ? `نسخ صفقات ${trader.name.split(" ")[0]}` : "سجّل الدخول للنسخ"}
      </button>
    </article>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-card/40 px-3 py-2">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span className="font-mono text-[9px] uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-1 font-display text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function MiniStat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  const tone = positive === undefined ? "text-foreground" : positive ? "text-emerald-400" : "text-red-400";
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-2 py-2">
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-xs font-semibold tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}

function HistoryChart({ data }: { data: { label: string; pct: number }[] }) {
  const max = Math.max(...data.map((d) => Math.abs(d.pct)), 1);
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="flex h-40 items-end gap-[3px]">
        {data.map((m, i) => {
          const h = (Math.abs(m.pct) / max) * 100;
          const up = m.pct >= 0;
          return (
            <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
              <div
                className={`w-full rounded-sm transition ${up ? "bg-emerald-400/70 group-hover:bg-emerald-400" : "bg-red-400/70 group-hover:bg-red-400"}`}
                style={{ height: `${Math.max(h, 4)}%` }}
                title={`${m.label}: ${m.pct >= 0 ? "+" : ""}${m.pct}%`}
              />
              <span className="pointer-events-none absolute -top-7 whitespace-nowrap rounded bg-background/90 px-1.5 py-0.5 font-mono text-[9px] opacity-0 shadow group-hover:opacity-100">
                {m.label} {m.pct >= 0 ? "+" : ""}{m.pct}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground">
        <span>{data[0].label}</span>
        <span>{data[Math.floor(data.length / 2)].label}</span>
        <span>{data[data.length - 1].label}</span>
      </div>
    </div>
  );
}

function HistoryTable({ data }: { data: { label: string; pct: number }[] }) {
  return (
    <div className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02]">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-background/80 backdrop-blur">
          <tr className="text-muted-foreground">
            <th className="px-3 py-2 text-start font-mono text-[9px] uppercase tracking-widest">الشهر</th>
            <th className="px-3 py-2 text-end font-mono text-[9px] uppercase tracking-widest">العائد</th>
            <th className="px-3 py-2 text-end font-mono text-[9px] uppercase tracking-widest">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {[...data].reverse().map((m, i) => (
            <tr key={i} className="border-t border-white/5">
              <td className="px-3 py-1.5 font-mono text-[11px] text-muted-foreground">{m.label}</td>
              <td className={`px-3 py-1.5 text-end font-mono tabular-nums ${m.pct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {m.pct >= 0 ? "+" : ""}{m.pct.toFixed(2)}%
              </td>
              <td className="px-3 py-1.5 text-end">
                {m.pct >= 0 ? (
                  <TrendingUp className="ms-auto h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="ms-auto h-3.5 w-3.5 text-red-400" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}