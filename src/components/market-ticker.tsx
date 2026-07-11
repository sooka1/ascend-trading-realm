import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = { symbol: string; name: string; price: number; change: number };

// Display symbol → Yahoo Finance symbol used for live pricing.
const FEED: { symbol: string; name: string; yahoo: string; fallback: { price: number; change: number } }[] = [
  { symbol: "BTC/USD", name: "Bitcoin",       yahoo: "BTC-USD",   fallback: { price: 71284.5, change: 1.42 } },
  { symbol: "ETH/USD", name: "Ethereum",      yahoo: "ETH-USD",   fallback: { price: 3865.1,  change: 2.18 } },
  { symbol: "XAU/USD", name: "Gold",          yahoo: "GC=F",      fallback: { price: 2384.2,  change: 0.62 } },
  { symbol: "EUR/USD", name: "Euro / Dollar", yahoo: "EURUSD=X",  fallback: { price: 1.0842,  change: -0.14 } },
  { symbol: "GBP/USD", name: "Cable",         yahoo: "GBPUSD=X",  fallback: { price: 1.2681,  change: -0.22 } },
  { symbol: "USD/JPY", name: "Yen",           yahoo: "JPY=X",     fallback: { price: 156.42,  change: 0.31 } },
  { symbol: "US30",    name: "Dow Jones",     yahoo: "^DJI",      fallback: { price: 39158,   change: 0.48 } },
  { symbol: "SPX500",  name: "S&P 500",       yahoo: "^GSPC",     fallback: { price: 5321,    change: 0.71 } },
  { symbol: "NAS100",  name: "Nasdaq",        yahoo: "^IXIC",     fallback: { price: 18712,   change: 1.05 } },
  { symbol: "OIL",     name: "Brent Crude",   yahoo: "BZ=F",      fallback: { price: 82.14,   change: -0.34 } },
  { symbol: "AAPL",    name: "Apple",         yahoo: "AAPL",      fallback: { price: 214.28,  change: 0.92 } },
  { symbol: "TSLA",    name: "Tesla",         yahoo: "TSLA",      fallback: { price: 178.51,  change: -1.12 } },
];

const SEED: Row[] = FEED.map((f) => ({ symbol: f.symbol, name: f.name, ...f.fallback }));

async function fetchQuote(yahooSym: string): Promise<{ price: number; change: number } | null> {
  // Yahoo Finance chart endpoint — public, CORS-friendly, no auth required.
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?interval=1d&range=1d`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const price = Number(meta.regularMarketPrice);
    const prev = Number(meta.chartPreviousClose ?? meta.previousClose);
    if (!isFinite(price) || !isFinite(prev) || prev === 0) return null;
    const change = ((price - prev) / prev) * 100;
    return { price, change };
  } catch {
    return null;
  }
}

export function MarketTicker() {
  const [rows, setRows] = useState(SEED);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const results = await Promise.all(
        FEED.map(async (f) => {
          const q = await fetchQuote(f.yahoo);
          return { symbol: f.symbol, name: f.name, price: q?.price ?? f.fallback.price, change: q?.change ?? f.fallback.change };
        }),
      );
      if (!cancelled) setRows(results);
    };
    void load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
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