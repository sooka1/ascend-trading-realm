import { createServerFn } from "@tanstack/react-start";

export type Quote = {
  symbol: string;
  price: number;
  change: number;
  source: "yahoo" | "stooq" | "fallback" | "cache";
  updatedAt: number; // epoch ms
};

const STOOQ_MAP: Record<string, string> = {
  "BTC-USD": "btcusd",
  "ETH-USD": "ethusd",
  "GC=F": "xauusd",
  "EURUSD=X": "eurusd",
  "GBPUSD=X": "gbpusd",
  "JPY=X": "usdjpy",
  "^DJI": "^dji",
  "^GSPC": "^spx",
  "^IXIC": "^ndx",
  "BZ=F": "cb.f",
  AAPL: "aapl.us",
  TSLA: "tsla.us",
};

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// In-memory server cache. Protects providers from rate limits when many
// clients poll fast: at most one upstream call per symbol per TTL, and a
// single in-flight promise per symbol coalesces concurrent callers.
const CACHE_TTL_MS = 4_000;
const cache = new Map<string, Quote>();
const inflight = new Map<string, Promise<Quote>>();

async function fetchWithRetry(url: string, attempts = 2): Promise<Response | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": UA, accept: "*/*" } });
      if (res.ok) return res;
      if (res.status === 429) return null; // don't hammer on rate limit
      console.warn(`[quotes] ${url} -> HTTP ${res.status} (attempt ${i + 1})`);
    } catch (e) {
      console.warn(`[quotes] ${url} threw`, e instanceof Error ? e.message : e, `(attempt ${i + 1})`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return null;
}

async function fromYahoo(sym: string): Promise<Pick<Quote, "price" | "change" | "source"> | null> {
  const res = await fetchWithRetry(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1d`,
  );
  if (!res) return null;
  try {
    const j: any = await res.json();
    const meta = j?.chart?.result?.[0]?.meta;
    const price = Number(meta?.regularMarketPrice);
    const prev = Number(meta?.chartPreviousClose ?? meta?.previousClose);
    if (!isFinite(price) || !isFinite(prev) || prev === 0) return null;
    return { price, change: ((price - prev) / prev) * 100, source: "yahoo" };
  } catch (e) {
    console.warn("[quotes] yahoo parse failed", sym, e);
    return null;
  }
}

async function fromStooq(yahooSym: string): Promise<Pick<Quote, "price" | "change" | "source"> | null> {
  const s = STOOQ_MAP[yahooSym];
  if (!s) return null;
  const res = await fetchWithRetry(`https://stooq.com/q/l/?s=${encodeURIComponent(s)}&f=sd2t2ohlcp&h&e=csv`);
  if (!res) return null;
  try {
    const csv = await res.text();
    const lines = csv.trim().split(/\r?\n/);
    if (lines.length < 2) return null;
    const header = lines[0].toLowerCase().split(",");
    const row = lines[1].split(",");
    const price = Number(row[header.indexOf("close")]);
    const prev = Number(row[header.indexOf("prevclose")]);
    if (!isFinite(price) || !isFinite(prev) || prev === 0) return null;
    return { price, change: ((price - prev) / prev) * 100, source: "stooq" };
  } catch (e) {
    console.warn("[quotes] stooq parse failed", yahooSym, e);
    return null;
  }
}

async function fetchOne(sym: string): Promise<Quote> {
  const cached = cache.get(sym);
  if (cached && Date.now() - cached.updatedAt < CACHE_TTL_MS) {
    return { ...cached, source: "cache" };
  }
  const existing = inflight.get(sym);
  if (existing) return existing;

  const p = (async () => {
    const y = await fromYahoo(sym);
    const got = y ?? (await fromStooq(sym));
    if (got) {
      const q: Quote = { symbol: sym, ...got, updatedAt: Date.now() };
      cache.set(sym, q);
      return q;
    }
    console.error(`[quotes] all providers failed for ${sym}`);
    if (cached) return { ...cached, source: "cache" as const };
    return { symbol: sym, price: 0, change: 0, source: "fallback", updatedAt: Date.now() };
  })().finally(() => inflight.delete(sym));

  inflight.set(sym, p);
  return p;
}

export const getQuotes = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => {
    const arr = Array.isArray((data as any)?.symbols) ? ((data as any).symbols as unknown[]) : [];
    return { symbols: arr.filter((s): s is string => typeof s === "string").slice(0, 32) };
  })
  .handler(async ({ data }) => ({ quotes: await Promise.all(data.symbols.map(fetchOne)) }));
