import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = { symbol: string; name: string; price: number; change: number };

const SEED: Row[] = [
  { symbol: "BTC/USD", name: "Bitcoin", price: 71284.5, change: 1.42 },
  { symbol: "ETH/USD", name: "Ethereum", price: 3865.1, change: 2.18 },
  { symbol: "XAU/USD", name: "Gold", price: 2384.2, change: 0.62 },
  { symbol: "EUR/USD", name: "Euro / Dollar", price: 1.0842, change: -0.14 },
  { symbol: "GBP/USD", name: "Cable", price: 1.2681, change: -0.22 },
  { symbol: "USD/JPY", name: "Yen", price: 156.42, change: 0.31 },
  { symbol: "US30", name: "Dow Jones", price: 39158, change: 0.48 },
  { symbol: "SPX500", name: "S&P 500", price: 5321, change: 0.71 },
  { symbol: "NAS100", name: "Nasdaq", price: 18712, change: 1.05 },
  { symbol: "OIL", name: "Brent Crude", price: 82.14, change: -0.34 },
  { symbol: "AAPL", name: "Apple", price: 214.28, change: 0.92 },
  { symbol: "TSLA", name: "Tesla", price: 178.51, change: -1.12 },
];

function jitter(v: number, pct = 0.0015) {
  return v * (1 + (Math.random() - 0.5) * pct);
}

export function MarketTicker() {
  const [rows, setRows] = useState(SEED);
  useEffect(() => {
    const id = setInterval(() => {
      setRows((prev) =>
        prev.map((r) => {
          const next = jitter(r.price);
          const change = r.change + (Math.random() - 0.5) * 0.05;
          return { ...r, price: next, change };
        }),
      );
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const loop = [...rows, ...rows];
  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-white/[0.02] py-3">
      <div className="flex animate-ticker gap-8 whitespace-nowrap will-change-transform">
        {loop.map((r, i) => {
          const up = r.change >= 0;
          return (
            <div key={`${r.symbol}-${i}`} className="flex items-center gap-2.5 px-2">
              <span className="font-display text-sm font-semibold tracking-wide">{r.symbol}</span>
              <span className="tabular-nums text-sm text-muted-foreground">
                {r.price < 10 ? r.price.toFixed(4) : r.price.toFixed(2)}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs tabular-nums",
                  up ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear",
                )}
              >
                {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {up ? "+" : ""}
                {r.change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}