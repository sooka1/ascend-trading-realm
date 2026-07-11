import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Impact = "low" | "medium" | "high";
type Event = { id: string; time: string; country: string; currency: string; title: string; impact: Impact; forecast?: string; previous?: string };

// Deterministic mock generator — replaced later by a real provider (Finnhub / TradingEconomics).
// IDs stay stable across refreshes so React reconciles without flicker.
function generateEvents(seed: number): Event[] {
  const rows: Omit<Event, "id" | "time">[] = [
    { country: "🇺🇸 USA", currency: "USD", title: "Non-Farm Payrolls", impact: "high", forecast: "180K", previous: "175K" },
    { country: "🇺🇸 USA", currency: "USD", title: "CPI m/m", impact: "high", forecast: "0.3%", previous: "0.2%" },
    { country: "🇪🇺 EUR", currency: "EUR", title: "ECB Interest Rate Decision", impact: "high", forecast: "4.25%", previous: "4.25%" },
    { country: "🇬🇧 UK", currency: "GBP", title: "BoE Governor Speech", impact: "medium" },
    { country: "🇯🇵 JP", currency: "JPY", title: "BoJ Monetary Policy Statement", impact: "high" },
    { country: "🇺🇸 USA", currency: "USD", title: "Retail Sales m/m", impact: "medium", forecast: "0.4%", previous: "0.6%" },
    { country: "🇩🇪 DE", currency: "EUR", title: "German ZEW Economic Sentiment", impact: "medium", forecast: "12.4", previous: "9.8" },
    { country: "🇦🇺 AU", currency: "AUD", title: "RBA Rate Statement", impact: "medium" },
    { country: "🇨🇦 CA", currency: "CAD", title: "Employment Change", impact: "medium", forecast: "20K", previous: "15K" },
    { country: "🇨🇭 CH", currency: "CHF", title: "SNB Chairman Speech", impact: "low" },
  ];
  const base = new Date();
  return rows.map((r, i) => {
    const dayOffset = (i + seed) % 7; // spread across the current week
    const t = new Date(base);
    t.setDate(base.getDate() + dayOffset);
    t.setHours(9 + ((i + seed) % 10), (i * 13 + seed) % 60, 0, 0);
    return { ...r, id: `${i}-${r.title}`, time: t.toISOString() };
  }).sort((a, b) => a.time.localeCompare(b.time));
}

const IMPACT_COLOR: Record<Impact, string> = {
  high: "bg-red-500/20 text-red-300 border-red-500/40",
  medium: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  low: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
};
const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF"] as const;
type TimeRange = "today" | "week";

export function EconomicCalendar() {
  const [seed, setSeed] = useState(0);
  const [highOnly, setHighOnly] = useState(false);
  const [range, setRange] = useState<TimeRange>("today");
  const [currencies, setCurrencies] = useState<Set<string>>(new Set());
  const events = useMemo(() => generateEvents(seed), [seed]);

  useEffect(() => {
    const id = window.setInterval(() => setSeed((s) => s + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
    const endToday = new Date(startToday); endToday.setDate(startToday.getDate() + 1);
    const endWeek = new Date(startToday); endWeek.setDate(startToday.getDate() + 7);
    return events.filter((e) => {
      if (highOnly && e.impact !== "high") return false;
      if (currencies.size && !currencies.has(e.currency)) return false;
      const t = new Date(e.time).getTime();
      if (range === "today" && (t < startToday.getTime() || t >= endToday.getTime())) return false;
      if (range === "week" && (t < startToday.getTime() || t >= endWeek.getTime())) return false;
      return true;
    });
  }, [events, highOnly, range, currencies]);

  const toggleCurrency = (c: string) =>
    setCurrencies((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c); else next.add(c);
      return next;
    });

  return (
    <div className="flex h-full flex-col p-3 text-xs">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <div className="text-white/70 font-semibold">أحداث اقتصادية</div>
        <div className="inline-flex overflow-hidden rounded-md border border-white/10 text-[11px]">
          <button type="button" onClick={() => setRange("today")}
            className={`px-2 py-1 ${range === "today" ? "bg-gold/20 text-gold" : "text-white/60 hover:bg-white/5"}`}>اليوم</button>
          <button type="button" onClick={() => setRange("week")}
            className={`px-2 py-1 ${range === "week" ? "bg-gold/20 text-gold" : "text-white/60 hover:bg-white/5"}`}>هذا الأسبوع</button>
        </div>
        <label className="flex items-center gap-1 text-[11px] text-white/60">
          <input type="checkbox" checked={highOnly} onChange={(e) => setHighOnly(e.target.checked)} /> High Impact فقط
        </label>
        <Button size="sm" variant="outline" className="h-7 mr-auto text-[10px]" onClick={() => setSeed((s) => s + 1)}>
          <RefreshCw className="h-3 w-3 mr-1" /> تحديث
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-1 mb-2">
        <span className="text-[10px] text-white/50 mr-1">العملة:</span>
        <button type="button" onClick={() => setCurrencies(new Set())}
          className={`rounded-md border px-2 py-0.5 text-[10px] ${currencies.size === 0 ? "border-gold/50 bg-gold/15 text-gold" : "border-white/10 text-white/60 hover:bg-white/5"}`}>
          الكل
        </button>
        {CURRENCIES.map((c) => {
          const on = currencies.has(c);
          return (
            <button key={c} type="button" onClick={() => toggleCurrency(c)}
              className={`rounded-md border px-2 py-0.5 text-[10px] font-mono ${on ? "border-gold/50 bg-gold/15 text-gold" : "border-white/10 text-white/60 hover:bg-white/5"}`}>
              {c}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-auto rounded-md border border-white/10">
        <table className="w-full text-[11px]">
          <thead className="text-white/50 text-right sticky top-0 bg-slate-950/80 backdrop-blur">
            <tr><th className="px-2 py-2">الوقت</th><th className="px-2 py-2">الدولة</th><th className="px-2 py-2">العملة</th><th className="px-2 py-2">الحدث</th><th className="px-2 py-2">التأثير</th><th className="px-2 py-2">توقع</th><th className="px-2 py-2">سابق</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-6 text-white/40">لا توجد أحداث ضمن الفلاتر الحالية</td></tr>}
            {filtered.map((e) => (
              <tr key={e.id} className={`border-t border-white/[0.04] hover:bg-white/[0.02] ${e.impact === "high" ? "bg-red-500/[0.06] border-l-2 border-l-red-500/60" : ""}`}>
                <td className="px-2 py-2 font-mono text-white/70">
                  {range === "week"
                    ? new Date(e.time).toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" })
                    : new Date(e.time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-2 py-2">{e.country}</td>
                <td className="px-2 py-2 font-mono">{e.currency}</td>
                <td className={`px-2 py-2 ${e.impact === "high" ? "text-white font-medium" : "text-white/90"}`}>{e.title}</td>
                <td className="px-2 py-2"><span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] uppercase ${IMPACT_COLOR[e.impact]}`}>{e.impact}</span></td>
                <td className="px-2 py-2 font-mono text-white/70">{e.forecast ?? "—"}</td>
                <td className="px-2 py-2 font-mono text-white/50">{e.previous ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}