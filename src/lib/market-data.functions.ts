import { createServerFn } from "@tanstack/react-start";

// Twelve Data symbol mapping for our internal tickers.
const TD_SYMBOL: Record<string, string> = {
  XAUUSD: "XAU/USD",
  XAGUSD: "XAG/USD",
  EURUSD: "EUR/USD",
  GBPUSD: "GBP/USD",
  USDJPY: "USD/JPY",
  US500: "SPX",
  NAS100: "NDX",
  WTI: "WTI/USD",
};

const TD_INTERVAL: Record<string, string> = {
  "1m": "1min", "5m": "5min", "15m": "15min", "30m": "30min",
  "1h": "1h", "4h": "4h", "1d": "1day", "1w": "1week", "1M": "1month",
};

function toTd(sym: string) {
  return TD_SYMBOL[sym] ?? sym;
}

export type LiveQuote = {
  symbol: string;
  price: number;
  bid?: number;
  ask?: number;
  changePct?: number;
  time: number;
};

export type LiveCandle = {
  time: number; open: number; high: number; low: number; close: number; volume?: number;
};

// Batch quote for non-crypto symbols. Uses Twelve Data /quote (comma-separated).
export const fetchLiveQuotes = createServerFn({ method: "POST" })
  .inputValidator((input: { symbols: string[] }) => ({
    symbols: Array.isArray(input?.symbols) ? input.symbols.filter((s) => typeof s === "string").slice(0, 20) : [],
  }))
  .handler(async ({ data }): Promise<{ quotes: LiveQuote[]; error?: string }> => {
    const key = process.env.TWELVE_DATA_API_KEY;
    if (!key) return { quotes: [], error: "missing_api_key" };
    if (data.symbols.length === 0) return { quotes: [] };

    const mapped = data.symbols.map(toTd);
    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(mapped.join(","))}&apikey=${key}`;
    try {
      const res = await fetch(url);
      const body = await res.json();
      // Response is keyed by symbol when multiple, or a single object when one.
      const single = data.symbols.length === 1;
      const quotes: LiveQuote[] = [];
      const entries = single ? [[mapped[0], body]] : Object.entries(body);
      for (const [tdSym, raw] of entries as Array<[string, Record<string, unknown>]>) {
        if (!raw || typeof raw !== "object" || (raw as { code?: number }).code) continue;
        const price = Number((raw as { close?: string }).close);
        if (!isFinite(price)) continue;
        // find our internal symbol
        const internal = data.symbols.find((s) => toTd(s) === tdSym) ?? tdSym;
        quotes.push({
          symbol: internal,
          price,
          changePct: Number((raw as { percent_change?: string }).percent_change) || 0,
          time: Date.now(),
        });
      }
      return { quotes };
    } catch (e) {
      console.error("fetchLiveQuotes error", e);
      return { quotes: [], error: "provider_error" };
    }
  });

export const fetchLiveCandles = createServerFn({ method: "POST" })
  .inputValidator((input: { symbol: string; tf: string; count?: number }) => ({
    symbol: String(input?.symbol ?? ""),
    tf: String(input?.tf ?? "1h"),
    count: Math.min(Math.max(Number(input?.count ?? 300), 30), 1000),
  }))
  .handler(async ({ data }): Promise<{ candles: LiveCandle[]; error?: string }> => {
    const key = process.env.TWELVE_DATA_API_KEY;
    if (!key) return { candles: [], error: "missing_api_key" };
    const interval = TD_INTERVAL[data.tf] ?? "1h";
    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(toTd(data.symbol))}&interval=${interval}&outputsize=${data.count}&apikey=${key}`;
    try {
      const res = await fetch(url);
      const body = await res.json() as { values?: Array<Record<string, string>>; code?: number; message?: string };
      if (!body?.values) return { candles: [], error: body?.message ?? "no_data" };
      const candles: LiveCandle[] = body.values.map((v) => ({
        time: Math.floor(new Date(v.datetime).getTime() / 1000),
        open: Number(v.open), high: Number(v.high), low: Number(v.low), close: Number(v.close),
        volume: v.volume ? Number(v.volume) : undefined,
      })).filter((c) => isFinite(c.close)).reverse();
      return { candles };
    } catch (e) {
      console.error("fetchLiveCandles error", e);
      return { candles: [], error: "provider_error" };
    }
  });