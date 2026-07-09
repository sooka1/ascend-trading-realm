import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, PortalCard } from "@/components/portal-shell";
import { Button } from "@/components/ui/button";
import { Download, LineChart as LineIcon, Printer, TrendingDown, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/performance")({
  head: () => ({
    meta: [
      { title: "تقارير الأداء — بوابة العميل" },
      { name: "description", content: "تقارير أداء تفاعلية، KPIs ومخطط تاريخي." },
    ],
  }),
  component: PerformancePage,
});

type Snap = { id: string; as_of_date: string; equity: number; pnl: number };

const RANGES = [
  { key: "7d", label: "7ي", days: 7 },
  { key: "30d", label: "30ي", days: 30 },
  { key: "90d", label: "90ي", days: 90 },
  { key: "ytd", label: "YTD", days: 0 },
  { key: "all", label: "الكل", days: -1 },
] as const;

const fmt = (n: number, d = 2) => new Intl.NumberFormat("en-US", { maximumFractionDigits: d }).format(n);

function PerformancePage() {
  const [rows, setRows] = useState<Snap[]>([]);
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("90d");

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from("portfolio_snapshots").select("id,as_of_date,equity,pnl").order("as_of_date", { ascending: true }).limit(1000);
      setRows((data ?? []) as Snap[]);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (rows.length === 0) return [] as Snap[];
    const r = RANGES.find((x) => x.key === range)!;
    if (r.days === -1) return rows;
    const cutoff = new Date();
    if (range === "ytd") cutoff.setMonth(0, 1);
    else cutoff.setDate(cutoff.getDate() - r.days);
    return rows.filter((s) => new Date(s.as_of_date) >= cutoff);
  }, [rows, range]);

  const stats = useMemo(() => {
    if (filtered.length < 2) return null;
    const first = filtered[0];
    const last = filtered[filtered.length - 1];
    const ret = last.equity - first.equity;
    const retPct = first.equity ? (ret / first.equity) * 100 : 0;
    const vals = filtered.map((f) => f.equity);
    const high = Math.max(...vals);
    const low = Math.min(...vals);
    // daily returns
    const returns: number[] = [];
    for (let i = 1; i < filtered.length; i++) {
      const prev = filtered[i - 1].equity;
      if (prev) returns.push((filtered[i].equity - prev) / prev);
    }
    const mean = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
    const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length || 1);
    const vol = Math.sqrt(variance) * Math.sqrt(252) * 100;
    // max drawdown
    let peak = -Infinity;
    let maxDd = 0;
    for (const v of vals) {
      peak = Math.max(peak, v);
      const dd = peak ? (v - peak) / peak : 0;
      if (dd < maxDd) maxDd = dd;
    }
    return { ret, retPct, high, low, vol, maxDd: maxDd * 100, days: filtered.length };
  }, [filtered]);

  const exportCsv = () => {
    const header = ["as_of_date", "equity", "pnl"];
    const csv = [header.join(","), ...filtered.map((r) => [r.as_of_date, r.equity, r.pnl].join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PortalShell
      eyebrow="التقارير"
      title="تقارير الأداء"
      subtitle="مؤشرات الأداء الرئيسية، التقلّب، والسحب الأقصى — قابلة للتصدير والطباعة."
      actions={
        <>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="me-1.5 h-3.5 w-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="me-1.5 h-3.5 w-3.5" /> طباعة
          </Button>
        </>
      }
    >
      {/* Range filter */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition ${
              range === r.key
                ? "border-gold/50 bg-gold/[0.08] text-foreground"
                : "border-white/10 text-muted-foreground hover:border-gold/40 hover:text-foreground"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="العائد الفترة" value={stats ? `${stats.retPct >= 0 ? "+" : ""}${fmt(stats.retPct)}%` : "—"} sub={stats ? `${stats.ret >= 0 ? "+" : ""}${fmt(stats.ret)} USD` : ""} positive={(stats?.ret ?? 0) >= 0} />
        <Kpi label="التقلّب السنوي" value={stats ? `${fmt(stats.vol)}%` : "—"} sub="Annualized σ" />
        <Kpi label="السحب الأقصى" value={stats ? `${fmt(stats.maxDd)}%` : "—"} sub="Max drawdown" positive={false} />
        <Kpi label="High / Low" value={stats ? `${fmt(stats.high, 0)} / ${fmt(stats.low, 0)}` : "—"} sub={stats ? `${stats.days} pts` : ""} />
      </div>

      <PortalCard title="منحنى الأداء" icon={LineIcon}>
        {filtered.length < 2 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">لا توجد بيانات كافية لهذا النطاق.</p>
        ) : (
          <EquityChart data={filtered} />
        )}
      </PortalCard>

      <div className="mt-6">
        <PortalCard title="التفاصيل" icon={stats && stats.ret >= 0 ? TrendingUp : TrendingDown}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-start font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pe-4 text-start">التاريخ</th>
                  <th className="py-2 pe-4 text-end">القيمة</th>
                  <th className="py-2 pe-4 text-end">P&L</th>
                  <th className="py-2 text-end">التغيّر اليومي</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice().reverse().slice(0, 30).map((r, i, arr) => {
                  const next = arr[i + 1];
                  const chg = next ? ((r.equity - next.equity) / next.equity) * 100 : 0;
                  return (
                    <tr key={r.id} className="border-b border-white/5">
                      <td className="py-2 pe-4 font-mono text-xs text-muted-foreground">{r.as_of_date}</td>
                      <td className="py-2 pe-4 text-end font-mono tabular-nums">{fmt(r.equity)}</td>
                      <td className={`py-2 pe-4 text-end font-mono tabular-nums ${r.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{r.pnl >= 0 ? "+" : ""}{fmt(r.pnl)}</td>
                      <td className={`py-2 text-end font-mono tabular-nums ${chg >= 0 ? "text-emerald-400" : "text-red-400"}`}>{next ? `${chg >= 0 ? "+" : ""}${fmt(chg)}%` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </PortalCard>
      </div>
    </PortalShell>
  );
}

function Kpi({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  const tone = positive === undefined ? "text-foreground" : positive ? "text-emerald-400" : "text-red-400";
  return (
    <div className="rounded-xl border border-white/10 bg-card/50 p-4 backdrop-blur-xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold/80">{label}</p>
      <p className={`mt-2 font-display text-2xl font-semibold tabular-nums ${tone}`}>{value}</p>
      {sub && <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{sub}</p>}
    </div>
  );
}

function EquityChart({ data }: { data: Snap[] }) {
  const w = 900;
  const h = 260;
  const pad = 32;
  const vals = data.map((d) => Number(d.equity));
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const step = (w - pad * 2) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => `${pad + i * step},${h - pad - ((Number(d.equity) - min) / range) * (h - pad * 2)}`).join(" ");
  const area = `${pad},${h - pad} ${points} ${pad + (data.length - 1) * step},${h - pad}`;
  const gridY = [0, 0.25, 0.5, 0.75, 1].map((r) => h - pad - r * (h - pad * 2));
  return (
    <div className="overflow-hidden rounded-md border border-white/10 bg-white/[0.02] p-2">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-72 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="perf-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridY.map((y, i) => <line key={i} x1={pad} x2={w - pad} y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 3" />)}
        <polygon points={area} fill="url(#perf-g)" />
        <polyline points={points} fill="none" stroke="#d4af37" strokeWidth="1.75" />
      </svg>
      <div className="mt-1 flex items-center justify-between px-2 font-mono text-[10px] text-muted-foreground">
        <span>{data[0]?.as_of_date}</span>
        <span className="tabular-nums">min {fmt(min)} · max {fmt(max)}</span>
        <span>{data[data.length - 1]?.as_of_date}</span>
      </div>
    </div>
  );
}