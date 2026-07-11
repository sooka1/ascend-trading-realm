import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createChart,
  AreaSeries,
  HistogramSeries,
  ColorType,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, PortalCard } from "@/components/portal-shell";
import {
  Wallet,
  PieChart,
  TrendingUp,
  Layers,
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  Activity,
  Gauge,
  ShieldAlert,
  CalendarDays,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/_authenticated/portal/portfolio")({
  head: () => ({
    meta: [
      { title: "المحفظة — بوابة العميل" },
      { name: "description", content: "تحليلات المحفظة، العوائد، تراجع رأس المال وتوزيع الأصول." },
    ],
  }),
  component: PortfolioPage,
});

type Snapshot = {
  id: string;
  as_of_date: string;
  equity: number;
  pnl: number;
  allocation: Record<string, number> | null;
};

type Subscription = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  started_at: string | null;
  packages: { name: string; risk_level: string | null; target_return_pct: number | null } | null;
};

type Withdrawal = {
  id: string;
  amount: number;
  currency: string;
  destination: string;
  status: string;
  created_at: string;
  updated_at: string | null;
};

const fmt = (n: number, d = 2) => new Intl.NumberFormat("en-US", { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);
const fmtInt = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));
const pct = (n: number) => `${n >= 0 ? "+" : ""}${fmt(n, 2)}%`;

function PortfolioPage() {
  const [snaps, setSnaps] = useState<Snapshot[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [wds, setWds] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const [{ data: s }, { data: p }, { data: w }] = await Promise.all([
        supabase.from("portfolio_snapshots").select("*").order("as_of_date", { ascending: true }).limit(3650),
        supabase.from("subscriptions").select("*, packages(name,risk_level,target_return_pct)").order("started_at", { ascending: false }),
        supabase
          .from("withdrawals")
          .select("id,amount,currency,destination,status,created_at,updated_at")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      setSnaps((s ?? []) as Snapshot[]);
      setSubs((p ?? []) as unknown as Subscription[]);
      setWds((w ?? []) as Withdrawal[]);
      setLoading(false);
    })();
  }, []);

  const latest = snaps[snaps.length - 1];
  const prev = snaps[snaps.length - 2];
  const first = snaps[0];

  // Daily returns
  const dailyReturns = useMemo(() => {
    const out: { date: string; ret: number; equity: number }[] = [];
    for (let i = 1; i < snaps.length; i++) {
      const prevEq = Number(snaps[i - 1].equity);
      const cur = Number(snaps[i].equity);
      if (prevEq > 0) out.push({ date: snaps[i].as_of_date, ret: (cur - prevEq) / prevEq, equity: cur });
    }
    return out;
  }, [snaps]);

  // Drawdown series (percent below running peak)
  const drawdown = useMemo(() => {
    let peak = 0;
    return snaps.map((s) => {
      const eq = Number(s.equity);
      peak = Math.max(peak, eq);
      const dd = peak > 0 ? ((eq - peak) / peak) * 100 : 0;
      return { date: s.as_of_date, dd };
    });
  }, [snaps]);
  const maxDrawdown = drawdown.reduce((m, x) => (x.dd < m ? x.dd : m), 0);

  // Aggregated metrics
  const totalReturnPct = latest && first && Number(first.equity) > 0
    ? ((Number(latest.equity) - Number(first.equity)) / Number(first.equity)) * 100
    : 0;
  const dailyDelta = latest && prev ? Number(latest.equity) - Number(prev.equity) : 0;
  const dailyDeltaPct = latest && prev && Number(prev.equity) > 0 ? (dailyDelta / Number(prev.equity)) * 100 : 0;

  const mean = dailyReturns.length ? dailyReturns.reduce((a, b) => a + b.ret, 0) / dailyReturns.length : 0;
  const variance = dailyReturns.length
    ? dailyReturns.reduce((a, b) => a + Math.pow(b.ret - mean, 2), 0) / dailyReturns.length
    : 0;
  const stdev = Math.sqrt(variance);
  const annVol = stdev * Math.sqrt(252) * 100;
  const annReturn = mean * 252 * 100;
  const sharpe = stdev > 0 ? (mean * 252) / (stdev * Math.sqrt(252)) : 0;
  const winDays = dailyReturns.filter((d) => d.ret > 0).length;
  const winRate = dailyReturns.length ? (winDays / dailyReturns.length) * 100 : 0;
  const bestDay = dailyReturns.reduce((m, x) => (x.ret > m ? x.ret : m), 0) * 100;
  const worstDay = dailyReturns.reduce((m, x) => (x.ret < m ? x.ret : m), 0) * 100;

  // Monthly & annual returns (compounded)
  const monthly = useMemo(() => {
    const byMonth = new Map<string, { first: number; last: number }>();
    for (const s of snaps) {
      const k = s.as_of_date.slice(0, 7); // YYYY-MM
      const eq = Number(s.equity);
      const entry = byMonth.get(k);
      if (!entry) byMonth.set(k, { first: eq, last: eq });
      else entry.last = eq;
    }
    return Array.from(byMonth.entries())
      .map(([k, v]) => ({ month: k, ret: v.first > 0 ? ((v.last - v.first) / v.first) * 100 : 0 }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [snaps]);

  const annual = useMemo(() => {
    const byYear = new Map<string, { first: number; last: number }>();
    for (const s of snaps) {
      const y = s.as_of_date.slice(0, 4);
      const eq = Number(s.equity);
      const entry = byYear.get(y);
      if (!entry) byYear.set(y, { first: eq, last: eq });
      else entry.last = eq;
    }
    return Array.from(byYear.entries())
      .map(([y, v]) => ({ year: y, ret: v.first > 0 ? ((v.last - v.first) / v.first) * 100 : 0 }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [snaps]);

  // Allocation
  const allocation = useMemo(() => {
    const alloc = latest?.allocation ?? {};
    const entries = Object.entries(alloc).map(([k, v]) => ({ label: k, value: Number(v) || 0 }));
    const total = entries.reduce((a, b) => a + b.value, 0) || 1;
    return entries.map((e) => ({ ...e, pct: (e.value / total) * 100 })).sort((a, b) => b.pct - a.pct);
  }, [latest]);

  // Diversification (Herfindahl–Hirschman inverted, 0..100)
  const diversification = useMemo(() => {
    if (allocation.length === 0) return 0;
    const hhi = allocation.reduce((a, b) => a + Math.pow(b.pct / 100, 2), 0);
    const n = allocation.length;
    const norm = n > 1 ? (1 - hhi) / (1 - 1 / n) : 0;
    return Math.max(0, Math.min(1, norm)) * 100;
  }, [allocation]);

  // Risk score 0..100 (higher = riskier). Combines annualized vol and max DD.
  const riskScore = Math.max(
    0,
    Math.min(100, Math.round(Math.min(80, annVol) + Math.min(20, Math.abs(maxDrawdown) / 2))),
  );

  const totalInvested = subs.filter((s) => s.status === "active").reduce((a, b) => a + Number(b.amount || 0), 0);
  const cancelledCount = subs.filter((s) => s.status === "cancelled").length;

  return (
    <PortalShell eyebrow="نظرة عامة" title="المحفظة" subtitle="تحليلات مؤسسية للأداء والمخاطر وتوزيع الأصول.">
      {/* KPI grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Kpi label="القيمة الحالية" value={latest ? fmt(Number(latest.equity)) : "—"} unit="USD" icon={Wallet} />
        <Kpi
          label="التغيّر اليومي"
          value={latest && prev ? `${dailyDelta >= 0 ? "+" : ""}${fmt(dailyDelta)}` : "—"}
          unit={latest && prev ? pct(dailyDeltaPct) : ""}
          positive={dailyDelta >= 0}
          icon={Activity}
        />
        <Kpi label="إجمالي العائد" value={pct(totalReturnPct)} positive={totalReturnPct >= 0} unit="من البداية" icon={TrendingUp} />
        <Kpi label="أقصى تراجع" value={pct(maxDrawdown)} positive={false} unit="Max Drawdown" icon={ShieldAlert} />
        <Kpi label="التذبذب السنوي" value={`${fmt(annVol)}%`} unit="Ann. Volatility" icon={BarChart3} />
        <Kpi label="نسبة شارب" value={fmt(sharpe, 2)} unit={`Win ${fmt(winRate, 1)}%`} positive={sharpe >= 0} icon={Gauge} />
      </div>

      {/* Equity + drawdown charts */}
      <div className="mb-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <PortalCard title="منحنى رأس المال" icon={TrendingUp}>
          {loading ? (
            <ChartSkeleton />
          ) : snaps.length < 2 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">لا توجد لقطات كافية.</p>
          ) : (
            <EquityChart snaps={snaps} />
          )}
        </PortalCard>
        <PortalCard title="تراجع رأس المال" icon={ShieldAlert}>
          {loading ? (
            <ChartSkeleton />
          ) : drawdown.length < 2 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">—</p>
          ) : (
            <DrawdownChart series={drawdown} />
          )}
        </PortalCard>
      </div>

      {/* Monthly heatmap + annual returns */}
      <div className="mb-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <PortalCard title="العوائد الشهرية" icon={CalendarDays}>
          <MonthlyHeatmap months={monthly} />
        </PortalCard>
        <PortalCard title="العوائد السنوية" icon={BarChart3}>
          <AnnualBars years={annual} />
        </PortalCard>
      </div>

      {/* Allocation + risk gauges */}
      <div className="mb-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <PortalCard title="توزيع الأصول" icon={PieChart}>
          {allocation.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">لا توجد بيانات توزيع بعد.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-[minmax(0,180px)_1fr] md:items-center">
              <AllocationDonut data={allocation} />
              <ul className="space-y-2.5">
                {allocation.map((a, i) => (
                  <li key={a.label} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} aria-hidden />
                    <span className="flex-1 text-sm">{a.label}</span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">{fmt(a.value)}</span>
                    <span className="w-16 text-end font-mono text-xs tabular-nums text-foreground">{fmt(a.pct, 1)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </PortalCard>
        <PortalCard title="مؤشرات المخاطرة" icon={Gauge}>
          <div className="grid gap-4">
            <Gauge2 label="نقاط المخاطرة" value={riskScore} suffix="/100" tone={riskScore < 40 ? "good" : riskScore < 70 ? "warn" : "bad"} />
            <Gauge2 label="مؤشر التنويع" value={diversification} suffix="%" tone={diversification > 60 ? "good" : diversification > 30 ? "warn" : "bad"} />
            <div className="grid grid-cols-2 gap-3 pt-1">
              <MiniStat label="أفضل يوم" value={pct(bestDay)} positive />
              <MiniStat label="أسوأ يوم" value={pct(worstDay)} positive={false} />
              <MiniStat label="نسبة الأيام الرابحة" value={`${fmt(winRate, 1)}%`} />
              <MiniStat label="العائد السنوي التقديري" value={pct(annReturn)} positive={annReturn >= 0} />
            </div>
          </div>
        </PortalCard>
      </div>

      {/* Active subs */}
      <div className="mb-6">
        <PortalCard title="الحسابات النشطة" icon={Layers}>
          {subs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">لا توجد اشتراكات نشطة.</p>
          ) : (
            <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {subs.slice(0, 9).map((s) => (
                <li key={s.id} className="rounded-md border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{s.packages?.name ?? "—"}</p>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {s.packages?.risk_level ?? "—"} · {s.status}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-mono text-sm tabular-nums">
                        {fmt(Number(s.amount))} {s.currency}
                      </p>
                      {s.packages?.target_return_pct != null && (
                        <p className="font-mono text-[10px] text-gold/80">weekly {fmt(Number(s.packages.target_return_pct))}%</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            رأس المال المستثمر النشط: <span className="text-foreground">{fmt(totalInvested)}</span> USD
          </p>
        </PortalCard>
      </div>

      {/* Deposits / withdrawals */}
      <div className="mb-6">
        <PortalCard title="الإيداع والسحب" icon={Wallet}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              asChild
              className="h-auto justify-start rounded-md bg-gold py-3 font-semibold text-background hover:bg-[oklch(0.88_0.11_90)]"
            >
              <Link to="/investor">
                <ArrowDownToLine className="ml-2 h-4 w-4" />
                <span className="flex flex-col items-start">
                  <span>إيداع أموال</span>
                  <span className="font-mono text-[10px] font-normal opacity-80">Binance Pay · USDT TRC20</span>
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto justify-start rounded-md border-white/15 py-3 hover:border-gold/60"
            >
              <Link to="/investor">
                <ArrowUpFromLine className="ml-2 h-4 w-4" />
                <span className="flex flex-col items-start">
                  <span>سحب الأموال</span>
                  <span className="font-mono text-[10px] font-normal text-muted-foreground">يتطلب المصادقة الثنائية</span>
                </span>
              </Link>
            </Button>
          </div>
        </PortalCard>
      </div>

      <div className="mb-6">
        <PortalCard title="طلبات السحب الأخيرة" icon={Clock}>
          {wds.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">لا توجد طلبات سحب بعد.</p>
          ) : (
            <ul className="space-y-2.5">
              {wds.map((w) => (
                <li key={w.id} className="rounded-md border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm tabular-nums">
                        {fmt(Number(w.amount))} {w.currency}
                      </p>
                      <p className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {w.destination}
                      </p>
                    </div>
                    <StatusBadge status={w.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          {cancelledCount > 0 && (
            <p className="mt-3 rounded-md border border-amber-400/30 bg-amber-400/10 p-2 font-mono text-[10px] text-amber-200">
              تم إلغاء {cancelledCount} اشتراك تلقائيًا لانخفاض رأس المال تحت الحد الأدنى للباقة.
            </p>
          )}
        </PortalCard>
      </div>

      {snaps.length === 0 && !loading && (
        <div className="mt-6 flex items-center gap-3 rounded-md border border-white/10 bg-card/40 p-4 text-sm text-muted-foreground">
          <Wallet className="h-4 w-4 text-gold" />
          لا توجد لقطات لمحفظتك بعد. سيتم إنشاء أول لقطة عند بدء الاستثمار.
        </div>
      )}
    </PortalShell>
  );
}

/* ------- charts + widgets ------- */

const DONUT_COLORS = ["#d4af37", "#66b2ff", "#5eead4", "#f97316", "#a78bfa", "#f472b6", "#facc15", "#22d3ee"];

function toTs(d: string): UTCTimestamp {
  return Math.floor(new Date(d + "T00:00:00Z").getTime() / 1000) as UTCTimestamp;
}

function useThemeChartColors() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  return {
    text: isLight ? "#334155" : "#cbd5e1",
    grid: isLight ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.06)",
    border: isLight ? "rgba(15,23,42,0.10)" : "rgba(255,255,255,0.10)",
    up: "#0ea5b7",
    down: "#f43f5e",
    accent: "#d4af37",
  };
}

function EquityChart({ snaps }: { snaps: Snapshot[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const colors = useThemeChartColors();

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: colors.text, fontFamily: "IBM Plex Mono, monospace" },
      rightPriceScale: { borderColor: colors.border },
      timeScale: { borderColor: colors.border, timeVisible: false, secondsVisible: false },
      grid: { vertLines: { color: colors.grid }, horzLines: { color: colors.grid } },
      handleScroll: false,
      handleScale: false,
      crosshair: { mode: 1 },
    });
    const series = chart.addSeries(AreaSeries, {
      lineColor: colors.accent,
      topColor: "rgba(212, 175, 55, 0.35)",
      bottomColor: "rgba(212, 175, 55, 0.02)",
      lineWidth: 2,
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
    });
    series.setData(snaps.map((s) => ({ time: toTs(s.as_of_date), value: Number(s.equity) })));
    chart.timeScale().fitContent();
    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [snaps, colors.text, colors.grid, colors.border, colors.accent]);

  return <div ref={ref} className="h-64 w-full sm:h-72" />;
}

function DrawdownChart({ series }: { series: { date: string; dd: number }[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const colors = useThemeChartColors();

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: colors.text, fontFamily: "IBM Plex Mono, monospace" },
      rightPriceScale: { borderColor: colors.border },
      timeScale: { borderColor: colors.border, timeVisible: false },
      grid: { vertLines: { color: colors.grid }, horzLines: { color: colors.grid } },
      handleScroll: false,
      handleScale: false,
      crosshair: { mode: 1 },
    });
    const area = chart.addSeries(AreaSeries, {
      lineColor: colors.down,
      topColor: "rgba(244, 63, 94, 0.02)",
      bottomColor: "rgba(244, 63, 94, 0.30)",
      lineWidth: 2,
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
    });
    area.setData(series.map((s) => ({ time: toTs(s.date), value: s.dd })));
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [series, colors.text, colors.grid, colors.border, colors.down]);

  return <div ref={ref} className="h-64 w-full sm:h-72" />;
}

function MonthlyHeatmap({ months }: { months: { month: string; ret: number }[] }) {
  if (months.length === 0) return <p className="py-6 text-center text-sm text-muted-foreground">لا توجد بيانات شهرية.</p>;
  const years = Array.from(new Set(months.map((m) => m.month.slice(0, 4)))).sort();
  const byKey = new Map(months.map((m) => [m.month, m.ret]));
  const maxAbs = Math.max(0.5, ...months.map((m) => Math.abs(m.ret)));
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr>
            <th className="p-1 text-start font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Year</th>
            {monthLabels.map((m) => (
              <th key={m} className="p-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {years.map((y) => (
            <tr key={y}>
              <td className="p-1 pe-3 font-mono text-[11px] text-muted-foreground">{y}</td>
              {monthLabels.map((_, i) => {
                const key = `${y}-${String(i + 1).padStart(2, "0")}`;
                const v = byKey.get(key);
                const has = typeof v === "number";
                const intensity = has ? Math.min(1, Math.abs(v!) / maxAbs) : 0;
                const bg = !has
                  ? "transparent"
                  : v! >= 0
                    ? `rgba(14, 165, 183, ${0.12 + intensity * 0.55})`
                    : `rgba(244, 63, 94, ${0.12 + intensity * 0.55})`;
                return (
                  <td
                    key={key}
                    className="p-0.5"
                    title={has ? `${key}: ${pct(v!)}` : `${key}: —`}
                  >
                    <div
                      className="grid h-8 min-w-[38px] place-items-center rounded-sm border border-white/5 font-mono text-[10px] tabular-nums"
                      style={{ background: bg, color: has ? undefined : "var(--color-muted-foreground)" }}
                    >
                      {has ? `${v! >= 0 ? "+" : ""}${fmt(v!, 1)}` : "—"}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnnualBars({ years }: { years: { year: string; ret: number }[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const colors = useThemeChartColors();

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: colors.text, fontFamily: "IBM Plex Mono, monospace" },
      rightPriceScale: { borderColor: colors.border },
      timeScale: { borderColor: colors.border, timeVisible: false },
      grid: { vertLines: { color: colors.grid }, horzLines: { color: colors.grid } },
      handleScroll: false,
      handleScale: false,
    });
    const hist = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
    });
    hist.setData(
      years.map((y) => ({
        time: Math.floor(new Date(`${y.year}-06-30T00:00:00Z`).getTime() / 1000) as UTCTimestamp,
        value: y.ret,
        color: y.ret >= 0 ? colors.up : colors.down,
      })),
    );
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [years, colors.text, colors.grid, colors.border, colors.up, colors.down]);

  if (years.length === 0) return <p className="py-6 text-center text-sm text-muted-foreground">لا توجد بيانات سنوية بعد.</p>;
  return <div ref={ref} className="h-56 w-full" />;
}

function AllocationDonut({ data }: { data: { label: string; pct: number }[] }) {
  const size = 160;
  const r = 62;
  const stroke = 26;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="mx-auto">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth={stroke} />
        {data.map((d, i) => {
          const len = (d.pct / 100) * C;
          const el = (
            <circle
              key={d.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-acc}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          );
          acc += len;
          return el;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-current" style={{ fontFamily: "IBM Plex Mono", fontSize: 11, opacity: 0.7 }}>
          Assets
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-current" style={{ fontFamily: "IBM Plex Mono", fontSize: 18, fontWeight: 600 }}>
          {fmtInt(data.length)}
        </text>
      </svg>
    </div>
  );
}

function Gauge2({ label, value, suffix, tone }: { label: string; value: number; suffix: string; tone: "good" | "warn" | "bad" }) {
  const clamped = Math.max(0, Math.min(100, value));
  const color = tone === "good" ? "oklch(0.75 0.14 190)" : tone === "warn" ? "oklch(0.80 0.14 85)" : "oklch(0.62 0.20 25)";
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="font-mono text-sm tabular-nums">
          {fmt(clamped, 0)}
          <span className="text-muted-foreground">{suffix}</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">
        <div style={{ width: `${clamped}%`, background: color, height: "100%" }} />
      </div>
    </div>
  );
}

function MiniStat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  const tone = positive === undefined ? "text-foreground" : positive ? "text-emerald-400" : "text-red-400";
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.02] p-2.5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-sm tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  positive,
  icon: Icon,
}: {
  label: string;
  value: string;
  unit?: string;
  positive?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const tone = positive === undefined ? "text-foreground" : positive ? "text-emerald-400" : "text-red-400";
  return (
    <div className="rounded-xl border border-white/10 bg-card/60 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold/80">{label}</p>
        {Icon && <Icon className="h-3.5 w-3.5 text-gold/70" />}
      </div>
      <p className={`mt-2 font-display text-2xl font-semibold tabular-nums ${tone}`}>{value}</p>
      {unit && <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{unit}</p>}
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-64 w-full animate-pulse rounded-md border border-white/10 bg-white/[0.02]" />;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    pending: { cls: "border-amber-400/40 text-amber-300 bg-amber-400/10", label: "قيد المعالجة" },
    approved: { cls: "border-emerald-400/40 text-emerald-300 bg-emerald-400/10", label: "تم الخصم" },
    completed: { cls: "border-emerald-400/40 text-emerald-300 bg-emerald-400/10", label: "مكتمل" },
    rejected: { cls: "border-red-400/40 text-red-300 bg-red-400/10", label: "مرفوض" },
    cancelled: { cls: "border-white/15 text-muted-foreground bg-white/[0.03]", label: "ملغى" },
    canceled: { cls: "border-white/15 text-muted-foreground bg-white/[0.03]", label: "ملغى" },
  };
  const info = map[status] ?? { cls: "border-white/15 text-muted-foreground bg-white/[0.03]", label: status };
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider ${info.cls}`}>
      {info.label}
    </span>
  );
}
