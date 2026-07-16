import { useEffect, useMemo, useRef, useState } from "react";
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
      <div className="p-2 border-b border-[#2a2e39] bg-[#131722]">
        <div className="relative">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث عن أداة…" className="h-8 pr-7 text-xs bg-[#1e222d] border-[#2a2e39] focus-visible:ring-[#d4af37]/40" />
        </div>
        <div className="mt-2 flex gap-1 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => setCat(c.key)}
              className={cn("px-2 py-0.5 rounded-md text-[10px] whitespace-nowrap border transition-colors",
                cat === c.key
                  ? "border-[#d4af37]/60 bg-[#d4af37]/10 text-[#d4af37] shadow-[0_0_10px_-4px_rgba(212,175,55,0.6)]"
                  : "border-[#2a2e39] text-white/60 hover:bg-[#1e222d] hover:text-white/85")}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-[#131722]">
        {filtered.map((i) => {
          const isSel = selected === i.symbol;
          return (
            <WatchRow
              key={i.symbol}
              inst={i}
              quote={quotes[i.symbol]}
              isSel={isSel}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </div>
  );
}

function WatchRow({ inst, quote, isSel, onSelect }: {
  inst: Instrument;
  quote: Quote | undefined;
  isSel: boolean;
  onSelect: (s: string) => void;
}) {
  const prev = useRef<number | undefined>(quote?.bid);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  useEffect(() => {
    if (quote?.bid == null) return;
    if (prev.current != null && quote.bid !== prev.current) {
      setFlash(quote.bid > prev.current ? "up" : "down");
      const t = window.setTimeout(() => setFlash(null), 600);
      prev.current = quote.bid;
      return () => window.clearTimeout(t);
    }
    prev.current = quote.bid;
  }, [quote?.bid]);

  const spread = quote ? (quote.ask - quote.bid) : 0;
  const chg = quote?.changePct24h;

  return (
    <button onClick={() => onSelect(inst.symbol)}
      className={cn(
        "group relative w-full flex items-center justify-between gap-2 px-3 py-2.5 border-b border-[#2a2e39]/50 text-right transition-colors",
        isSel ? "bg-[#1e222d]" : "hover:bg-[#1e222d]/70",
        flash === "up" && "price-flash-up",
        flash === "down" && "price-flash-down",
      )}>
      {isSel && <span aria-hidden className="absolute inset-y-0 right-0 w-[2px] bg-[#d4af37] shadow-[0_0_8px_0_rgba(212,175,55,0.7)]" />}
      <div className="flex min-w-0 items-center gap-2">
        <Star className={cn("h-3 w-3 shrink-0", isSel ? "text-[#d4af37] fill-[#d4af37]/70" : "text-white/25 group-hover:text-white/40")} />
        <span className={cn("truncate text-xs font-semibold tracking-wide", isSel ? "text-[#d4af37]" : "text-white/85")}>{inst.symbol}</span>
      </div>
      <div className="flex shrink-0 flex-col items-end leading-tight">
        <div className="flex items-baseline gap-2 font-mono tabular-nums text-[11px]">
          <span className="text-rose-500">{quote ? quote.bid.toFixed(inst.price_precision) : "—"}</span>
          <span className="text-emerald-500">{quote ? quote.ask.toFixed(inst.price_precision) : "—"}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[9px]">
          {typeof chg === "number" && (
            <span className={cn("font-mono tabular-nums", chg >= 0 ? "text-emerald-500" : "text-rose-500")}>
              {chg >= 0 ? "▲" : "▼"} {Math.abs(chg).toFixed(2)}%
            </span>
          )}
          <span className="text-white/40">فارق {quote ? (spread / (inst.pip_size || 1)).toFixed(1) : "—"}</span>
        </div>
      </div>
    </button>
  );
}