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
      <div className="p-2 border-b border-white/10">
        <div className="relative">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث…" className="h-8 pr-7 text-xs" />
        </div>
        <div className="mt-2 flex gap-1 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => setCat(c.key)}
              className={cn("px-2 py-0.5 rounded-md text-[10px] whitespace-nowrap border",
                cat === c.key ? "border-amber-400/40 bg-amber-400/10 text-amber-200" : "border-white/10 text-white/60 hover:bg-white/[0.04]")}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((i) => {
          const q = quotes[i.symbol];
          const spread = q ? (q.ask - q.bid) : 0;
          return (
            <button key={i.symbol} onClick={() => onSelect(i.symbol)}
              className={cn("w-full flex items-center justify-between px-3 py-2 border-b border-white/[0.04] hover:bg-white/[0.03] text-right",
                selected === i.symbol && "bg-amber-400/[0.06]")}>
              <div className="flex items-center gap-2">
                <Star className="h-3 w-3 text-white/30" />
                <span className="font-medium text-xs">{i.symbol}</span>
              </div>
              <div className="text-left">
                <div className="flex gap-2 font-mono text-[11px]">
                  <span className="text-red-400">{q ? q.bid.toFixed(i.price_precision) : "—"}</span>
                  <span className="text-emerald-400">{q ? q.ask.toFixed(i.price_precision) : "—"}</span>
                </div>
                <div className="text-[9px] text-white/40">فارق {q ? (spread / (i.pip_size || 1)).toFixed(1) : "—"}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}