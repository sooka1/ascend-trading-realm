import { createServerFn } from "@tanstack/react-start";

export type Quote = { symbol: string; price: number; change: number; source: "yahoo" | "stooq" | "fallback" };

// Map Yahoo symbol -> Stooq symbol for fallback.
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

async function fetchWithRetry(url: string, attempts = 2): Promise<Response | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": UA, accept: "*/*" } });
      if (res.ok) return res;
      console.warn(`[quotes] ${url} -> HTTP ${res.status} (attempt ${i + 1})`);
    } catch (e) {
      console.warn(`[quotes] ${url} threw`, e instanceof Error ? e.message : e, `(attempt ${i + 1})`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return null;
}

async function fromYahoo(sym: string): Promise<Omit<Quote, "symbol"> | null> {
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

async function fromStooq(yahooSym: string): Promise<Omit<Quote, "symbol"> | null> {
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
    const iClose = header.indexOf("close");
    const iPrev = header.indexOf("prevclose");
    const price = Number(row[iClose]);
    const prev = Number(row[iPrev]);
    if (!isFinite(price) || !isFinite(prev) || prev === 0) return null;
    return { price, change: ((price - prev) / prev) * 100, source: "stooq" };
  } catch (e) {
    console.warn("[quotes] stooq parse failed", yahooSym, e);
    return null;
  }
}

export const getQuotes = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => {
    const arr = Array.isArray((data as any)?.symbols) ? ((data as any).symbols as unknown[]) : [];
    return { symbols: arr.filter((s): s is string => typeof s === "string").slice(0, 32) };
  })
  .handler(async ({ data }) => {
    const results = await Promise.all(
      data.symbols.map(async (sym): Promise<Quote> => {
        const y = await fromYahoo(sym);
        if (y) return { symbol: sym, ...y };
        console.warn(`[quotes] yahoo failed for ${sym}, trying stooq`);
        const s = await fromStooq(sym);
        if (s) return { symbol: sym, ...s };
        console.error(`[quotes] all providers failed for ${sym}`);
        return { symbol: sym, price: 0, change: 0, source: "fallback" };
      }),
    );
    return { quotes: results };
  });
