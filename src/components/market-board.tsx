import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Circle, RotateCw, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { getQuotes } from "@/lib/quotes.functions";
import { MarketDetailDialog, type DetailInstrument } from "@/components/market-detail-dialog";
import { useWatchlist } from "@/hooks/use-watchlist";
import {
  createMarketFeed,
  binanceTickerSource,
  pollingSource,
  FEED_MAX_ATTEMPTS,
  type FeedStatus,
  type SourceStatus,
} from "@/lib/market-feed";

type Category = "all" | "watchlist" | "crypto" | "fx" | "metals" | "indices" | "stocks" | "energy";

type Item = {
  symbol: string;
  name: string;
  yahoo: string;
  category: Exclude<Category, "all">;
  fallback: { price: number; change: number };
};

const FEED: Item[] = [
  // Forex majors
  { symbol: "EUR/USD", name: "Euro / Dollar",       yahoo: "EURUSD=X", category: "fx",      fallback: { price: 1.0842, change: -0.14 } },
  { symbol: "GBP/USD", name: "Cable",               yahoo: "GBPUSD=X", category: "fx",      fallback: { price: 1.2681, change: -0.22 } },
  { symbol: "USD/JPY", name: "Dollar / Yen",        yahoo: "JPY=X",    category: "fx",      fallback: { price: 156.42, change: 0.31 } },
  { symbol: "USD/CHF", name: "Dollar / Franc",      yahoo: "CHF=X",    category: "fx",      fallback: { price: 0.9042, change: 0.11 } },
  { symbol: "AUD/USD", name: "Aussie",              yahoo: "AUDUSD=X", category: "fx",      fallback: { price: 0.6612, change: -0.18 } },
  { symbol: "USD/CAD", name: "Loonie",              yahoo: "CAD=X",    category: "fx",      fallback: { price: 1.3712, change: 0.09 } },
  { symbol: "NZD/USD", name: "Kiwi",                yahoo: "NZDUSD=X", category: "fx",      fallback: { price: 0.6084, change: -0.12 } },
  // Metals
  { symbol: "XAU/USD", name: "Gold",                yahoo: "GC=F",     category: "metals",  fallback: { price: 2384.2, change: 0.62 } },
  { symbol: "XAG/USD", name: "Silver",              yahoo: "SI=F",     category: "metals",  fallback: { price: 29.42,  change: 1.12 } },
  { symbol: "XPT/USD", name: "Platinum",            yahoo: "PL=F",     category: "metals",  fallback: { price: 1024.5, change: 0.38 } },
  { symbol: "XPD/USD", name: "Palladium",           yahoo: "PA=F",     category: "metals",  fallback: { price: 968.4,  change: -0.28 } },
  { symbol: "HG",      name: "Copper",              yahoo: "HG=F",     category: "metals",  fallback: { price: 4.52,   change: 0.44 } },
  // Crypto
  { symbol: "BTC/USD", name: "Bitcoin",             yahoo: "BTC-USD",  category: "crypto",  fallback: { price: 71284.5, change: 1.42 } },
  { symbol: "ETH/USD", name: "Ethereum",            yahoo: "ETH-USD",  category: "crypto",  fallback: { price: 3865.1,  change: 2.18 } },
  { symbol: "SOL/USD", name: "Solana",              yahoo: "SOL-USD",  category: "crypto",  fallback: { price: 168.4,   change: 3.24 } },
  { symbol: "XRP/USD", name: "XRP",                 yahoo: "XRP-USD",  category: "crypto",  fallback: { price: 0.512,   change: 0.88 } },
  { symbol: "ADA/USD", name: "Cardano",             yahoo: "ADA-USD",  category: "crypto",  fallback: { price: 0.442,   change: -0.42 } },
  { symbol: "DOGE/USD",name: "Dogecoin",            yahoo: "DOGE-USD", category: "crypto",  fallback: { price: 0.148,   change: 1.21 } },
  // Indices
  { symbol: "US30",    name: "Dow Jones",           yahoo: "^DJI",     category: "indices", fallback: { price: 39158, change: 0.48 } },
  { symbol: "SPX500",  name: "S&P 500",             yahoo: "^GSPC",    category: "indices", fallback: { price: 5321,  change: 0.71 } },
  { symbol: "NAS100",  name: "Nasdaq 100",          yahoo: "^IXIC",    category: "indices", fallback: { price: 18712, change: 1.05 } },
  { symbol: "UK100",   name: "FTSE 100",            yahoo: "^FTSE",    category: "indices", fallback: { price: 8264,  change: 0.22 } },
  { symbol: "GER40",   name: "DAX",                 yahoo: "^GDAXI",   category: "indices", fallback: { price: 18514, change: 0.34 } },
  { symbol: "JPN225",  name: "Nikkei 225",          yahoo: "^N225",    category: "indices", fallback: { price: 38921, change: -0.18 } },
  // Energy
  { symbol: "BRENT",   name: "Brent Crude",         yahoo: "BZ=F",     category: "energy",  fallback: { price: 82.14, change: -0.34 } },
  { symbol: "WTI",     name: "WTI Crude",           yahoo: "CL=F",     category: "energy",  fallback: { price: 78.42, change: -0.28 } },
  { symbol: "NGAS",    name: "Natural Gas",         yahoo: "NG=F",     category: "energy",  fallback: { price: 2.68,  change: 1.62 } },
  // Stocks
  { symbol: "AAPL",    name: "Apple",               yahoo: "AAPL",     category: "stocks",  fallback: { price: 214.28, change: 0.92 } },
  { symbol: "MSFT",    name: "Microsoft",           yahoo: "MSFT",     category: "stocks",  fallback: { price: 441.5,  change: 0.54 } },
  { symbol: "NVDA",    name: "NVIDIA",              yahoo: "NVDA",     category: "stocks",  fallback: { price: 118.4,  change: 2.14 } },
  { symbol: "TSLA",    name: "Tesla",               yahoo: "TSLA",     category: "stocks",  fallback: { price: 178.51, change: -1.12 } },
  { symbol: "AMZN",    name: "Amazon",              yahoo: "AMZN",     category: "stocks",  fallback: { price: 189.4,  change: 0.68 } },
  { symbol: "META",    name: "Meta",                yahoo: "META",     category: "stocks",  fallback: { price: 498.2,  change: 0.88 } },
  { symbol: "GOOGL",   name: "Alphabet",            yahoo: "GOOGL",    category: "stocks",  fallback: { price: 178.9,  change: 0.42 } },
];

type Row = { symbol: string; name: string; category: Item["category"]; price: number; change: number; updatedAt: number; flashing: "up" | "down" | null };

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "fx", label: "فوركس" },
  { key: "metals", label: "معادن" },
  { key: "crypto", label: "عملات رقمية" },
  { key: "indices", label: "مؤشرات" },
  { key: "energy", label: "طاقة" },
  { key: "stocks", label: "أسهم" },
];

const POLL_MS = 5_000;
// Traditional-market providers have no free WebSocket feed — crypto streams
// live via Binance WS; everything else refreshes slower via the server fn.
const NON_CRYPTO_POLL_MS = 15_000;
const SOURCE_CRYPTO = "crypto";
const SOURCE_TRADITIONAL = "traditional";

// Binance uses USDT pairs; treat them as USD equivalents for the board.
const BINANCE_STREAM: Record<string, string> = {
  "BTC/USD": "btcusdt",
  "ETH/USD": "ethusdt",
  "SOL/USD": "solusdt",
  "XRP/USD": "xrpusdt",
  "ADA/USD": "adausdt",
  "DOGE/USD": "dogeusdt",
};
const BINANCE_STREAM_TO_SYMBOL: Record<string, string> = Object.fromEntries(
  Object.entries(BINANCE_STREAM).map(([k, v]) => [v, k]),
);

function fmt(v: number) {
  if (!isFinite(v) || v === 0) return "—";
  if (v < 1) return v.toFixed(4);
  if (v < 100) return v.toFixed(3);
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function fmtTime(ts: number) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function MarketBoard() {
  const [rows, setRows] = useState<Row[]>(() =>
    FEED.map((f) => ({ symbol: f.symbol, name: f.name, category: f.category, ...f.fallback, updatedAt: 0, flashing: null })),
  );
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<Record<string, SourceStatus>>({});
  const feedRef = useRef<ReturnType<typeof createMarketFeed> | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const fetchQuotes = useServerFn(getQuotes);
  const { list: watchlist, has: inWatchlist, remove: removeWatch } = useWatchlist();

  // Single feed engine wires every price source into one uniform stream.
  // Sources push { symbol, price, change } ticks; the engine batches per
  // frame and this effect applies them to `rows` identically for all.
  useEffect(() => {
    let flashTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleFlashClear = () => {
      if (flashTimer) clearTimeout(flashTimer);
      flashTimer = setTimeout(() => setRows((rs) => rs.map((r) => ({ ...r, flashing: null }))), 700);
    };

    const feed = createMarketFeed([
      binanceTickerSource({ id: SOURCE_CRYPTO, streams: BINANCE_STREAM }),
      pollingSource({
        id: SOURCE_TRADITIONAL,
        intervalMs: NON_CRYPTO_POLL_MS,
        fetch: async () => {
          const nonCrypto = FEED.filter((f) => f.category !== "crypto");
          const { quotes } = await fetchQuotes({ data: { symbols: nonCrypto.map((f) => f.yahoo) } });
          const byYahoo = new Map(quotes.map((q) => [q.symbol, q]));
          return nonCrypto
            .map((f) => {
              const q = byYahoo.get(f.yahoo);
              if (!q || q.source === "fallback") return null;
              return { symbol: f.symbol, price: q.price, change: q.change, updatedAt: q.updatedAt };
            })
            .filter((t): t is { symbol: string; price: number; change: number; updatedAt: number } => !!t);
        },
      }),
    ]);
    feedRef.current = feed;

    const unsubTicks = feed.subscribe((ticks) => {
      setRows((prev) => {
        const byIdx = new Map(ticks.map((t) => [t.symbol, t]));
        return prev.map((r) => {
          const t = byIdx.get(r.symbol);
          if (!t) return r;
          const flashing: Row["flashing"] = t.price > r.price ? "up" : t.price < r.price ? "down" : r.flashing;
          return { ...r, price: t.price, change: t.change, updatedAt: t.updatedAt, flashing };
        });
      });
      scheduleFlashClear();
    });
    const unsubStatus = feed.subscribeStatus(setStatuses);

    return () => {
      unsubTicks();
      unsubStatus();
      if (flashTimer) clearTimeout(flashTimer);
      feed.stop();
      feedRef.current = null;
    };
  }, [fetchQuotes]);

  const retry = (id: string) => feedRef.current?.retry(id);
  const cryptoStatus = statuses[SOURCE_CRYPTO] ?? { id: SOURCE_CRYPTO, status: "connecting" as FeedStatus, attempt: 0 };
  const tradStatus = statuses[SOURCE_TRADITIONAL] ?? { id: SOURCE_TRADITIONAL, status: "connecting" as FeedStatus, attempt: 0 };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (category === "watchlist") {
        if (!watchlist.includes(r.symbol)) return false;
      } else if (category !== "all" && r.category !== category) return false;
      if (!q) return true;
      return r.symbol.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
    });
  }, [rows, category, query, watchlist]);

  const watchRows = useMemo(
    () => watchlist.map((s) => rows.find((r) => r.symbol === s)).filter((r): r is Row => !!r),
    [watchlist, rows],
  );

  const selectedItem: DetailInstrument | null = useMemo(() => {
    if (!selected) return null;
    const r = rows.find((x) => x.symbol === selected);
    if (!r) return null;
    return {
      symbol: r.symbol,
      name: r.name,
      category: r.category,
      price: r.price,
      change: r.change,
      updatedAt: r.updatedAt,
      binanceStream: BINANCE_STREAM[r.symbol],
    };
  }, [selected, rows]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FeedStatusBadge label="عملات رقمية" status={cryptoStatus.status} attempt={cryptoStatus.attempt} onRetry={() => retry(SOURCE_CRYPTO)} />
          <FeedStatusBadge label="أسواق تقليدية" status={tradStatus.status} attempt={tradStatus.attempt} onRetry={() => retry(SOURCE_TRADITIONAL)} />
          <h2 className="font-display text-xl font-semibold">شاشة الأسواق الحيّة</h2>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن رمز أو اسم…"
          className="w-full max-w-xs rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-gold/40"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition",
              category === c.key ? "border-gold/60 bg-gold/10 text-foreground" : "border-white/10 text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
        <button
          onClick={() => setCategory("watchlist")}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition",
            category === "watchlist"
              ? "border-gold/60 bg-gold/10 text-foreground"
              : "border-white/10 text-muted-foreground hover:text-foreground",
          )}
        >
          <Star className={cn("h-3 w-3", category === "watchlist" && "fill-current text-gold")} />
          المفضلة {watchlist.length > 0 && <span className="tabular-nums">({watchlist.length})</span>}
        </button>
      </div>

      {watchRows.length > 0 && (
        <div className="mb-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            <Star className="h-3 w-3 fill-current text-gold" /> قائمة سريعة
          </div>
          <div className="flex flex-wrap gap-2">
            {watchRows.map((r) => {
              const up = r.change >= 0;
              return (
                <div
                  key={r.symbol}
                  className={cn(
                    "glass group inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs transition hover:border-gold/40",
                    r.flashing === "up" && "bg-bull/10",
                    r.flashing === "down" && "bg-bear/10",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelected(r.symbol)}
                    className="inline-flex items-center gap-2"
                  >
                    <span className="font-display font-semibold">{r.symbol}</span>
                    <span className="tabular-nums">{fmt(r.price)}</span>
                    <span className={cn("inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 tabular-nums", up ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear")}>
                      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {up ? "+" : ""}{r.change.toFixed(2)}%
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeWatch(r.symbol)}
                    className="text-muted-foreground/60 hover:text-bear"
                    aria-label={`إزالة ${r.symbol} من المفضلة`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="glass overflow-hidden rounded-2xl">
        <div className="grid grid-cols-12 gap-2 border-b border-white/5 bg-white/[0.02] px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          <div className="col-span-4 sm:col-span-3">الرمز</div>
          <div className="col-span-4 hidden sm:block">الاسم</div>
          <div className="col-span-3 sm:col-span-2 text-left tabular-nums">السعر</div>
          <div className="col-span-3 sm:col-span-2 text-left tabular-nums">التغيّر</div>
          <div className="col-span-2 sm:col-span-1 hidden sm:block text-left">التحديث</div>
        </div>
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">لا توجد نتائج.</div>
        ) : (
          <ul className="divide-y divide-white/5">
            {filtered.map((r) => {
              const up = r.change >= 0;
              return (
              <li
                  key={r.symbol}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(r.symbol)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(r.symbol); } }}
                  className={cn(
                    "grid cursor-pointer grid-cols-12 items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-white/[0.03] focus:bg-white/[0.03] focus:outline-none",
                    r.flashing === "up" && "bg-bull/10",
                    r.flashing === "down" && "bg-bear/10",
                  )}
                >
                  <div className="col-span-4 sm:col-span-3 font-display font-semibold tracking-wide">{r.symbol}</div>
                  <div className="col-span-4 hidden truncate text-muted-foreground sm:block">{r.name}</div>
                  <div className="col-span-3 sm:col-span-2 text-left tabular-nums">{fmt(r.price)}</div>
                  <div className="col-span-3 sm:col-span-2 text-left">
                    <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs tabular-nums", up ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear")}>
                      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {up ? "+" : ""}{r.change.toFixed(2)}%
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 hidden text-left text-[11px] tabular-nums text-muted-foreground/70 sm:block">{fmtTime(r.updatedAt)}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <FeedStatusBanner label="بث العملات الرقمية"        status={cryptoStatus.status} attempt={cryptoStatus.attempt} onRetry={() => retry(SOURCE_CRYPTO)} />
      <FeedStatusBanner label="مزوّد الأسواق التقليدية"   status={tradStatus.status}   attempt={tradStatus.attempt}   onRetry={() => retry(SOURCE_TRADITIONAL)} />
      <p className="mt-3 text-[11px] text-muted-foreground/70">تحديث تلقائي كل {POLL_MS / 1000} ثوانٍ. الأسعار للاسترشاد فقط.</p>
      <MarketDetailDialog item={selectedItem} open={!!selected} onOpenChange={(v) => !v && setSelected(null)} />
    </section>
  );
}

function FeedStatusBadge({ label, status, attempt, onRetry }: { label: string; status: FeedStatus; attempt: number; onRetry: () => void }) {
  const map = {
    connecting:   { text: "جارٍ الاتصال…",                              cls: "border-white/10 text-muted-foreground",              dot: "fill-muted-foreground animate-pulse" },
    connected:    { text: "مباشر",                                       cls: "border-bull/40 bg-bull/10 text-bull",                dot: "fill-bull text-bull animate-pulse" },
    reconnecting: { text: `إعادة اتصال (${attempt}/${FEED_MAX_ATTEMPTS})`, cls: "border-amber-500/40 bg-amber-500/10 text-amber-200", dot: "fill-amber-300 animate-pulse" },
    disconnected: { text: "غير متصل",                                    cls: "border-bear/40 bg-bear/10 text-bear",                dot: "fill-bear" },
  }[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs", map.cls)}>
      <Circle className={cn("h-2 w-2", map.dot)} />
      <span className="text-muted-foreground/80">{label}:</span>
      <span>{map.text}</span>
      {status === "disconnected" && (
        <button onClick={onRetry} className="ml-1 inline-flex items-center gap-1 rounded-md border border-bear/40 px-1.5 py-0.5 text-[10px] hover:bg-bear/20" aria-label="إعادة المحاولة">
          <RotateCw className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

function FeedStatusBanner({ label, status, attempt, onRetry }: { label: string; status: FeedStatus; attempt: number; onRetry: () => void }) {
  if (status === "reconnecting") {
    return (
      <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
        انقطع {label}. جارٍ إعادة المحاولة… ({attempt}/{FEED_MAX_ATTEMPTS})
      </div>
    );
  }
  if (status === "disconnected") {
    return (
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-bear/30 bg-bear/10 px-4 py-2 text-xs text-bear">
        <span>تعذّر الاتصال بـ{label} بعد {FEED_MAX_ATTEMPTS} محاولات. الأسعار المعروضة هي آخر قيمة مستلمة.</span>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1 rounded-md border border-bear/40 px-2 py-1 font-medium hover:bg-bear/20"
        >
          <RotateCw className="h-3 w-3" /> إعادة المحاولة
        </button>
      </div>
    );
  }
  return null;
}