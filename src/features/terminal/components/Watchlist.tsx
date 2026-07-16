import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Instrument } from "../services/risk-engine";
import type { Quote } from "../adapters/market-data/types";

const CATEGORIES = [
  { key: "all", label: "الكل" },
  { key: "forex", label: "فوركس" },
  { key: "metals", label: "معادن" },
  { key: "crypto", label: "كريبتو" },
  { key: "indices", label: "مؤشرات" },
  { key: "commodities", label: "سلع" },
];

export function Watchlist({ instruments, quotes, selected, onSelect }: {
  instruments: Instrument[];
  quotes: Record<string, Quote>;
  selected: string;
  onSelect: (symbol: string) => void;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const filtered = useMemo(() => instruments.filter((i) => {
    if (cat !== "all" && i.category !== cat) return false;
    if (q && !i.symbol.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [instruments, cat, q]);

  return (
    <div className="flex h-full flex-col">
      <div className="p-2 border-b border-white/10 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="relative">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث عن أداة…" className="h-8 pr-7 text-xs bg-black/40 border-white/10 focus-visible:ring-amber-400/30" />
        </div>
        <div className="mt-2 flex gap-1 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => setCat(c.key)}
              className={cn("px-2 py-0.5 rounded-md text-[10px] whitespace-nowrap border transition-colors",
                cat === c.key
                  ? "border-amber-400/50 bg-amber-400/15 text-amber-200 shadow-[0_0_10px_-4px_rgba(251,191,36,0.6)]"
                  : "border-white/10 text-white/60 hover:bg-white/[0.05] hover:text-white/80")}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((i) => {
          const q = quotes[i.symbol];
          const spread = q ? (q.ask - q.bid) : 0;
          const chg = q?.changePct24h;
          const isSel = selected === i.symbol;
          return (
            <button key={i.symbol} onClick={() => onSelect(i.symbol)}
              className={cn(
                "group relative w-full flex items-center justify-between gap-2 px-3 py-2.5 border-b border-white/[0.04] hover:bg-white/[0.035] text-right transition-colors",
                isSel && "bg-gradient-to-l from-amber-400/[0.10] to-transparent",
              )}>
              {isSel && <span aria-hidden className="absolute inset-y-1 right-0 w-[2px] rounded-l bg-amber-400 shadow-[0_0_8px_0_rgba(251,191,36,0.7)]" />}
              <div className="flex min-w-0 items-center gap-2">
                <Star className={cn("h-3 w-3 shrink-0", isSel ? "text-amber-300 fill-amber-300/70" : "text-white/25 group-hover:text-white/40")} />
                <span className={cn("truncate text-xs font-semibold tracking-wide", isSel ? "text-white" : "text-white/85")}>{i.symbol}</span>
              </div>
              <div className="flex shrink-0 flex-col items-end leading-tight">
                <div className="flex items-baseline gap-2 font-mono tabular-nums text-[11px]">
                  <span className="text-red-400">{q ? q.bid.toFixed(i.price_precision) : "—"}</span>
                  <span className="text-emerald-400">{q ? q.ask.toFixed(i.price_precision) : "—"}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[9px]">
                  {typeof chg === "number" && (
                    <span className={cn("font-mono tabular-nums", chg >= 0 ? "text-emerald-400/90" : "text-red-400/90")}>
                      {chg >= 0 ? "▲" : "▼"} {Math.abs(chg).toFixed(2)}%
                    </span>
                  )}
                  <span className="text-white/40">فارق {q ? (spread / (i.pip_size || 1)).toFixed(1) : "—"}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}