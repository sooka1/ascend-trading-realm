import type { Candle, ConnectionStatus, MarketDataProvider, Quote, Timeframe } from "./types";

// Realistic random-walk price feed. Used until a real provider key is configured.
const BASE: Record<string, number> = {
  XAUUSD: 2380, XAGUSD: 29.5, EURUSD: 1.085, GBPUSD: 1.27, USDJPY: 156.2,
  BTCUSD: 63200, ETHUSD: 3100, US500: 5250, NAS100: 18400, WTI: 78.5,
};
const SPREAD_BP: Record<string, number> = {
  XAUUSD: 0.00015, XAGUSD: 0.0005, EURUSD: 0.00008, GBPUSD: 0.0001, USDJPY: 0.00008,
  BTCUSD: 0.0006, ETHUSD: 0.0006, US500: 0.0003, NAS100: 0.0003, WTI: 0.0004,
};
const TF_SEC: Record<Timeframe, number> = {
  "1m": 60, "5m": 300, "15m": 900, "30m": 1800, "1h": 3600, "4h": 14400,
  "1d": 86400, "1w": 604800, "1M": 2592000,
};

function volatility(sym: string) {
  const base = BASE[sym] ?? 100;
  if (sym.startsWith("BTC") || sym.startsWith("ETH")) return base * 0.0015;
  if (sym === "XAUUSD" || sym === "XAGUSD") return base * 0.0006;
  if (sym === "US500" || sym === "NAS100") return base * 0.0004;
  return base * 0.0003;
}

export function createMockProvider(): MarketDataProvider {
  const prices = new Map<string, number>();
  const quoteSubs = new Map<string, Set<(q: Quote) => void>>();
  const candleSubs = new Map<string, Set<(c: Candle) => void>>();
  const statusSubs = new Set<(s: ConnectionStatus) => void>();
  let status: ConnectionStatus = "open";

  function priceOf(sym: string) {
    if (!prices.has(sym)) prices.set(sym, BASE[sym] ?? 100);
    return prices.get(sym)!;
  }

  function tick(sym: string) {
    const p = priceOf(sym);
    const v = volatility(sym);
    const next = Math.max(0.0001, p + (Math.random() - 0.5) * v * 2);
    prices.set(sym, next);
    const half = next * (SPREAD_BP[sym] ?? 0.0002);
    const q: Quote = { symbol: sym, bid: next - half, ask: next + half, last: next, time: Date.now(), changePct24h: 0, volume24h: 0 };
    quoteSubs.get(sym)?.forEach((cb) => cb(q));
    // update live candle for every subscribed timeframe
    for (const [key, subs] of candleSubs.entries()) {
      const [s, tf] = key.split("|") as [string, Timeframe];
      if (s !== sym) continue;
      const bucket = Math.floor(Date.now() / 1000 / TF_SEC[tf]) * TF_SEC[tf];
      const c: Candle = { time: bucket, open: next, high: next, low: next, close: next };
      subs.forEach((cb) => cb(c));
    }
  }

  const interval = setInterval(() => {
    for (const sym of quoteSubs.keys()) tick(sym);
  }, 1000);
  if (typeof window !== "undefined") window.addEventListener("beforeunload", () => clearInterval(interval));

  return {
    name: "mock",
    status: () => status,
    onStatus(cb) { statusSubs.add(cb); cb(status); return () => statusSubs.delete(cb); },
    subscribe(symbols, onQuote) {
      const list: Array<() => void> = [];
      for (const s of symbols) {
        if (!quoteSubs.has(s)) quoteSubs.set(s, new Set());
        quoteSubs.get(s)!.add(onQuote);
        // seed immediately
        setTimeout(() => tick(s), 0);
        list.push(() => quoteSubs.get(s)!.delete(onQuote));
      }
      return () => list.forEach((u) => u());
    },
    async getCandles(symbol, tf, count = 300) {
      const sec = TF_SEC[tf];
      const now = Math.floor(Date.now() / 1000 / sec) * sec;
      const out: Candle[] = [];
      let price = BASE[symbol] ?? 100;
      const vol = volatility(symbol);
      for (let i = count - 1; i >= 0; i--) {
        const t = now - i * sec;
        const open = price;
        const drift = (Math.random() - 0.5) * vol * 3;
        const close = Math.max(0.0001, open + drift);
        const high = Math.max(open, close) + Math.random() * vol;
        const low = Math.min(open, close) - Math.random() * vol;
        out.push({ time: t, open, high, low, close, volume: Math.floor(Math.random() * 1000) });
        price = close;
      }
      prices.set(symbol, price);
      return out;
    },
    onCandle(symbol, tf, cb) {
      const key = `${symbol}|${tf}`;
      if (!candleSubs.has(key)) candleSubs.set(key, new Set());
      candleSubs.get(key)!.add(cb);
      return () => candleSubs.get(key)!.delete(cb);
    },
  };
}