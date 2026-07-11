import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { getQuotes } from "@/lib/quotes.functions";

type Category = "all" | "crypto" | "fx" | "indices" | "stocks";
type Ccy = "USD" | "EUR";

type FeedItem = {
  symbol: string;
  name: string;
  yahoo: string;
  category: Exclude<Category, "all">;
  fallback: { price: number; change: number };
};

const FEED: FeedItem[] = [
  { symbol: "BTC/USD", name: "Bitcoin",       yahoo: "BTC-USD",   category: "crypto",  fallback: { price: 71284.5, change: 1.42 } },
  { symbol: "ETH/USD", name: "Ethereum",      yahoo: "ETH-USD",   category: "crypto",  fallback: { price: 3865.1,  change: 2.18 } },
  { symbol: "XAU/USD", name: "Gold",          yahoo: "GC=F",      category: "fx",      fallback: { price: 2384.2,  change: 0.62 } },
  { symbol: "EUR/USD", name: "Euro / Dollar", yahoo: "EURUSD=X",  category: "fx",      fallback: { price: 1.0842,  change: -0.14 } },
  { symbol: "GBP/USD", name: "Cable",         yahoo: "GBPUSD=X",  category: "fx",      fallback: { price: 1.2681,  change: -0.22 } },
  { symbol: "USD/JPY", name: "Yen",           yahoo: "JPY=X",     category: "fx",      fallback: { price: 156.42,  change: 0.31 } },
  { symbol: "US30",    name: "Dow Jones",     yahoo: "^DJI",      category: "indices", fallback: { price: 39158,   change: 0.48 } },
  { symbol: "SPX500",  name: "S&P 500",       yahoo: "^GSPC",     category: "indices", fallback: { price: 5321,    change: 0.71 } },
  { symbol: "NAS100",  name: "Nasdaq",        yahoo: "^IXIC",     category: "indices", fallback: { price: 18712,   change: 1.05 } },
  { symbol: "OIL",     name: "Brent Crude",   yahoo: "BZ=F",      category: "indices", fallback: { price: 82.14,   change: -0.34 } },
  { symbol: "AAPL",    name: "Apple",         yahoo: "AAPL",      category: "stocks",  fallback: { price: 214.28,  change: 0.92 } },
  { symbol: "TSLA",    name: "Tesla",         yahoo: "TSLA",      category: "stocks",  fallback: { price: 178.51,  change: -1.12 } },
];

// EUR/USD is always fetched; the client uses its price to convert USD → EUR
// so the currency picker never triggers a second network round-trip.
const EUR_YAHOO = "EURUSD=X";

type Row = { symbol: string; name: string; category: FeedItem["category"]; price: number; change: number; updatedAt: number };

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "crypto", label: "عملات رقمية" },
  { key: "fx", label: "فوركس" },
  { key: "indices", label: "مؤشرات" },
  { key: "stocks", label: "أسهم" },
];

const POLL_MS = 5_000; // near-realtime; server-side cache absorbs the load

function formatTime(ts: number) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatPrice(v: number) {
  if (!isFinite(v) || v === 0) return "—";
  return v < 10 ? v.toFixed(4) : v.toFixed(2);
}

export function MarketTicker() {
  const [rows, setRows] = useState<Row[]>(() =>
    FEED.map((f) => ({ symbol: f.symbol, name: f.name, category: f.category, ...f.fallback, updatedAt: 0 })),
  );
  const [eurUsd, setEurUsd] = useState<number | null>(null);
  const [category, setCategory] = useState<Category>("all");
  const [ccy, setCcy] = useState<Ccy>("USD");
  const fetchQuotes = useServerFn(getQuotes);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const load = async () => {
      try {
        const { quotes } = await fetchQuotes({ data: { symbols: FEED.map((f) => f.yahoo) } });
        if (cancelled) return;
        const byYahoo = new Map(quotes.map((q) => [q.symbol, q]));
        const eur = byYahoo.get(EUR_YAHOO);
        if (eur && eur.source !== "fallback" && eur.price > 0) setEurUsd(eur.price);
        setRows(
          FEED.map((f) => {
            const q = byYahoo.get(f.yahoo);
            const ok = q && q.source !== "fallback";
            return {
              symbol: f.symbol,
              name: f.name,
              category: f.category,
              price: ok ? q!.price : f.fallback.price,
              change: ok ? q!.change : f.fallback.change,
              updatedAt: q?.updatedAt ?? 0,
            };
          }),
        );
      } catch (e) {
        console.warn("[market-ticker] quote fetch failed", e);
      } finally {
        if (!cancelled) timer = setTimeout(load, POLL_MS);
      }
    };
    void load();

    // Pause polling when tab is hidden — saves bandwidth, avoids piling up in-flight requests.
    const onVis = () => {
      if (document.visibilityState === "hidden" && timer) {
        clearTimeout(timer);
        timer = null;
      } else if (document.visibilityState === "visible" && !timer) {
        void load();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [fetchQuotes]);

  const displayed = useMemo(() => {
    const filtered = category === "all" ? rows : rows.filter((r) => r.category === category);
    if (ccy === "USD" || !eurUsd) return filtered;
    // Convert USD-quoted prices to EUR. Skip pairs where USD isn't the quote currency.
    return filtered.map((r) => {
      const quoteIsUsd = r.symbol.endsWith("/USD") || ["US30", "SPX500", "NAS100", "OIL", "AAPL", "TSLA"].includes(r.symbol);
      if (!quoteIsUsd) return r;
      return { ...r, price: r.price / eurUsd };
    });
  }, [rows, category, ccy, eurUsd]);

  const loop = [...displayed, ...displayed];

  return (
    <div className="border-y border-white/5 bg-white/[0.02]">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs">
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={cn(
                "rounded-full border px-3 py-1 transition",
                category === c.key
                  ? "border-gold/60 bg-gold/10 text-foreground"
                  : "border-white/10 text-muted-foreground hover:text-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {(["USD", "EUR"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCcy(c)}
              className={cn(
                "rounded-md border px-2 py-0.5 text-[11px] font-medium transition",
                ccy === c ? "border-gold/60 bg-gold/10 text-foreground" : "border-white/10 text-muted-foreground",
              )}
              disabled={c === "EUR" && !eurUsd}
              title={c === "EUR" && !eurUsd ? "لا يتوفر سعر EUR/USD" : undefined}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="px-4 py-3 text-xs text-muted-foreground">لا توجد أدوات في هذا التصنيف.</div>
      ) : (
        <div className="relative overflow-hidden py-3">
          <div className="flex animate-ticker gap-8 whitespace-nowrap will-change-transform">
            {loop.map((r, i) => {
              const up = r.change >= 0;
              return (
                <div key={`${r.symbol}-${i}`} className="flex items-center gap-2.5 px-2">
                  <span className="font-display text-sm font-semibold tracking-wide">{r.symbol}</span>
                  <span className="tabular-nums text-sm text-muted-foreground">{formatPrice(r.price)}</span>
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
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70 tabular-nums">
                    <Clock className="h-3 w-3" />
                    {formatTime(r.updatedAt)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
