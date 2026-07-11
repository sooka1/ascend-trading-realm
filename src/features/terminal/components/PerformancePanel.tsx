import { useMemo, useState } from "react";
import { performanceMetrics } from "../lib/indicators";

type Trade = {
  id: string;
  symbol: string;
  profit: number | string;
  swap?: number | string | null;
  commission?: number | string | null;
  closed_at: string;
};

export function PerformancePanel({ history }: { history: Trade[] }) {
  const [range, setRange] = useState<"7d" | "30d" | "all">("30d");
  const filtered = useMemo(() => {
    if (range === "all") return history;
    const days = range === "7d" ? 7 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return history.filter((h) => new Date(h.closed_at).getTime() >= cutoff);
  }, [history, range]);
  const profits = useMemo(() => filtered.map((h) => Number(h.profit) + Number(h.swap ?? 0) - Number(h.commission ?? 0)), [filtered]);
  const m = useMemo(() => performanceMetrics(profits), [profits]);

  const equityCurve = useMemo(() => {
    let eq = 0; return profits.slice().reverse().map((p) => (eq += p));
  }, [profits]);

  const bySymbol = useMemo(() => {
    const map = new Map<string, { count: number; profit: number }>();
    filtered.forEach((h) => {
      const cur = map.get(h.symbol) ?? { count: 0, profit: 0 };
      cur.count += 1;
      cur.profit += Number(h.profit) + Number(h.swap ?? 0) - Number(h.commission ?? 0);
      map.set(h.symbol, cur);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].profit - a[1].profit);
  }, [filtered]);

  const w = 480, h = 120;
  const min = Math.min(0, ...equityCurve);
  const max = Math.max(0, ...equityCurve);
  const range = max - min || 1;
  const points = equityCurve.map((v, i) => `${(i / Math.max(1, equityCurve.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");

  return (
    <div className="flex h-full flex-col gap-3 p-3 text-xs overflow-auto">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] text-white/50">
          {filtered.length} صفقة · نطاق {range === "7d" ? "آخر 7 أيام" : range === "30d" ? "آخر 30 يومًا" : "كل الوقت"}
        </div>
        <div className="inline-flex overflow-hidden rounded-md border border-white/10 text-[11px]">
          {([
            ["7d", "7 أيام"],
            ["30d", "30 يوم"],
            ["all", "الكل"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setRange(id)}
              className={`px-2 py-1 transition ${range === id ? "bg-gold/20 text-gold" : "text-white/60 hover:bg-white/5"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Metric label="Win Rate" value={`${m.winRate.toFixed(1)}%`} tone={m.winRate >= 50 ? "pos" : "neg"} sub={`${m.wins} فوز / ${m.losses} خسارة`} />
        <Metric label="Profit Factor" value={isFinite(m.profitFactor) ? m.profitFactor.toFixed(2) : "∞"} tone={m.profitFactor >= 1 ? "pos" : "neg"} sub={`متوسط الربح $${m.avgWin.toFixed(2)}`} />
        <Metric label="Max Drawdown" value={`$${m.maxDrawdown.toFixed(2)}`} tone="neg" sub={`متوسط الخسارة $${m.avgLoss.toFixed(2)}`} />
        <Metric label="Sharpe Ratio" value={m.sharpe.toFixed(2)} tone={m.sharpe > 0 ? "pos" : "neg"} sub={`الصافي $${m.total.toFixed(2)}`} />
      </div>

      <div className="rounded-md border border-white/10 bg-white/[0.02] p-3">
        <div className="text-white/60 text-[11px] mb-1">منحنى حقوق الملكية</div>
        {equityCurve.length === 0 ? (
          <div className="text-white/40 text-center py-6">لا توجد صفقات مغلقة</div>
        ) : (
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24">
            <defs>
              <linearGradient id="eqGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#F5C542" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#F5C542" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline fill="none" stroke="#F5C542" strokeWidth="1.5" points={points} />
            <polygon fill="url(#eqGrad)" points={`0,${h} ${points} ${w},${h}`} />
          </svg>
        )}
      </div>

      <div className="rounded-md border border-white/10">
        <div className="px-3 py-2 border-b border-white/10 text-white/60 text-[11px]">حسب الأداة</div>
        <table className="w-full text-[11px]">
          <thead className="text-white/50 text-right">
            <tr><th className="px-2 py-2">الأداة</th><th className="px-2 py-2">عدد</th><th className="px-2 py-2">إجمالي الربح</th></tr>
          </thead>
          <tbody>
            {bySymbol.length === 0 && <tr><td colSpan={3} className="text-center py-4 text-white/40">—</td></tr>}
            {bySymbol.map(([sym, v]) => (
              <tr key={sym} className="border-t border-white/[0.04]">
                <td className="px-2 py-2">{sym}</td>
                <td className="px-2 py-2 font-mono">{v.count}</td>
                <td className={`px-2 py-2 font-mono ${v.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>${v.profit.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metric({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone: "pos" | "neg" }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.02] p-3">
      <div className="text-[10px] uppercase tracking-wide text-white/50">{label}</div>
      <div className={`text-lg font-semibold font-mono ${tone === "pos" ? "text-emerald-400" : "text-red-400"}`}>{value}</div>
      {sub && <div className="text-[10px] text-white/40 mt-0.5">{sub}</div>}
    </div>
  );
}