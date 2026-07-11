import type { Candle, ConnectionStatus, MarketDataProvider, Quote, Timeframe } from "./types";
import { fetchLiveCandles, fetchLiveQuotes } from "@/lib/market-data.functions";

// Symbols routed to Binance WebSocket (free, no key, real-time).
const BINANCE_MAP: Record<string, string> = {
  BTCUSD: "btcusdt",
  ETHUSD: "ethusdt",
};
const BINANCE_INTERVAL: Record<Timeframe, string> = {
  "1m": "1m", "5m": "5m", "15m": "15m", "30m": "30m",
  "1h": "1h", "4h": "4h", "1d": "1d", "1w": "1w", "1M": "1M",
};
const TF_SEC: Record<Timeframe, number> = {
  "1m": 60, "5m": 300, "15m": 900, "30m": 1800, "1h": 3600, "4h": 14400,
  "1d": 86400, "1w": 604800, "1M": 2592000,
};
const SPREAD_BP: Record<string, number> = {
  XAUUSD: 0.00015, XAGUSD: 0.0005, EURUSD: 0.00008, GBPUSD: 0.0001, USDJPY: 0.00008,
  BTCUSD: 0.0002, ETHUSD: 0.0003, US500: 0.0003, NAS100: 0.0003, WTI: 0.0004,
};
// Per-tick volatility (fraction of price) used to synthesise realistic
// intra-poll movement between real Twelve Data updates. Tuned per asset class.
const TICK_VOL: Record<string, number> = {
  XAUUSD: 0.00012, XAGUSD: 0.0003, WTI: 0.0004,
  EURUSD: 0.00006, GBPUSD: 0.00008, USDJPY: 0.00006, USDCHF: 0.00007,
  AUDUSD: 0.00008, NZDUSD: 0.00009, USDCAD: 0.00007,
  US500: 0.00015, NAS100: 0.0002, US30: 0.00012, GER40: 0.00018, UK100: 0.00012,
};
const DEFAULT_TICK_VOL = 0.0001;

function isBinance(sym: string) { return sym in BINANCE_MAP; }
function toQuote(sym: string, price: number, changePct = 0): Quote {
  const half = price * (SPREAD_BP[sym] ?? 0.0002);
  return { symbol: sym, bid: price - half, ask: price + half, last: price, time: Date.now(), changePct24h: changePct, volume24h: 0 };
}

export function createLiveProvider(): MarketDataProvider {
  const quoteSubs = new Map<string, Set<(q: Quote) => void>>();
  const candleSubs = new Map<string, Set<(c: Candle) => void>>();
  const statusSubs = new Set<(s: ConnectionStatus) => void>();
  let status: ConnectionStatus = "connecting";
  const lastPrice = new Map<string, number>();
  // Latest synthetic mid used to build ticks between real polls. Reset when a
  // real quote lands so drift never diverges from the real market.
  const syntheticPrice = new Map<string, number>();
  const anchorPrice = new Map<string, number>();
  const changePct = new Map<string, number>();

  function setStatus(s: ConnectionStatus) { status = s; statusSubs.forEach((cb) => cb(s)); }

  // ============ Binance WebSocket for crypto (real-time) ============
  let binanceWs: WebSocket | null = null;
  const binanceSymbols = new Set<string>();
  let reconnectAttempts = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let lastMessageAt = 0;
  const MAX_BACKOFF_MS = 30_000;
  const STALE_MS = 60_000; // Binance sends ticker updates every ~1s; 60s silence = dead

  function clearTimers() {
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;
    if (binanceSymbols.size === 0) return;
    // Exponential backoff with jitter: 1s, 2s, 4s, 8s, 16s, 30s (cap)
    const base = Math.min(1000 * 2 ** reconnectAttempts, MAX_BACKOFF_MS);
    const delay = base / 2 + Math.random() * (base / 2);
    reconnectAttempts = Math.min(reconnectAttempts + 1, 6);
    setStatus("connecting");
    reconnectTimer = setTimeout(() => { reconnectTimer = null; ensureBinanceWs(); }, delay);
  }

  function ensureBinanceWs() {
    if (typeof window === "undefined") return;
    clearTimers();
    // Close any prior socket without triggering our reconnect handler.
    if (binanceWs) {
      try { binanceWs.onclose = null; binanceWs.close(); } catch { /* ignore */ }
      binanceWs = null;
    }
    if (binanceSymbols.size === 0) { setStatus("closed"); return; }

    const streams = [...binanceSymbols].map((s) => `${BINANCE_MAP[s]}@ticker`).join("/");
    let ws: WebSocket;
    try {
      ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    } catch {
      scheduleReconnect();
      return;
    }
    binanceWs = ws;
    setStatus("connecting");

    ws.onopen = () => {
      reconnectAttempts = 0;
      lastMessageAt = Date.now();
      setStatus("open");
      // Watchdog: if no message arrives for STALE_MS, force reconnect.
      heartbeatTimer = setInterval(() => {
        if (Date.now() - lastMessageAt > STALE_MS) {
          try { ws.close(); } catch { /* ignore */ }
        }
      }, 15_000);
    };
    ws.onerror = () => { setStatus("error"); };
    ws.onclose = () => {
      if (binanceWs !== ws) return; // superseded by a newer socket
      clearTimers();
      binanceWs = null;
      setStatus("closed");
      scheduleReconnect();
    };
    ws.onmessage = (ev) => {
      lastMessageAt = Date.now();
      try {
        const msg = JSON.parse(ev.data);
        const d = msg?.data; if (!d?.s) return;
        const internal = Object.keys(BINANCE_MAP).find((k) => BINANCE_MAP[k] === d.s.toLowerCase());
        if (!internal) return;
        const price = Number(d.c); if (!isFinite(price)) return;
        lastPrice.set(internal, price);
        const q = toQuote(internal, price, Number(d.P) || 0);
        quoteSubs.get(internal)?.forEach((cb) => cb(q));
        emitCandleUpdate(internal, price);
      } catch { /* ignore */ }
    };
  }

  // Reconnect proactively when the tab becomes visible or the network returns.
  if (typeof window !== "undefined") {
    const kick = () => {
      if (binanceSymbols.size === 0) return;
      if (!binanceWs || binanceWs.readyState === WebSocket.CLOSED || binanceWs.readyState === WebSocket.CLOSING) {
        reconnectAttempts = 0;
        ensureBinanceWs();
      }
    };
    window.addEventListener("online", kick);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") kick(); });
  }

  function emitCandleUpdate(sym: string, price: number) {
    for (const [key, subs] of candleSubs.entries()) {
      const [s, tf] = key.split("|") as [string, Timeframe];
      if (s !== sym) continue;
      const bucket = Math.floor(Date.now() / 1000 / TF_SEC[tf]) * TF_SEC[tf];
      const c: Candle = { time: bucket, open: price, high: price, low: price, close: price };
      subs.forEach((cb) => cb(c));
    }
  }

  // ============ Synthetic tick loop (non-Binance symbols) ============
  // Random-walk mean-reverting to the last real price so the chart feels
  // alive between 60s polls without drifting away from reality.
  let tickTimer: ReturnType<typeof setInterval> | null = null;
  function ensureTickLoop() {
    if (tickTimer) return;
    tickTimer = setInterval(() => {
      for (const sym of quoteSubs.keys()) {
        if (isBinance(sym)) continue;
        const anchor = anchorPrice.get(sym);
        if (!anchor) continue;
        const prev = syntheticPrice.get(sym) ?? anchor;
        const vol = TICK_VOL[sym] ?? DEFAULT_TICK_VOL;
        // Ornstein–Uhlenbeck-ish: pull back to anchor + gaussian-ish noise.
        const pull = (anchor - prev) * 0.05;
        const noise = (Math.random() + Math.random() + Math.random() - 1.5) * anchor * vol;
        const next = prev + pull + noise;
        syntheticPrice.set(sym, next);
        lastPrice.set(sym, next);
        const q = toQuote(sym, next, changePct.get(sym) ?? 0);
        quoteSubs.get(sym)?.forEach((cb) => cb(q));
        emitCandleUpdate(sym, next);
      }
    }, 700);
  }
  function stopTickLoopIfIdle() {
    const anyNonBinance = [...quoteSubs.keys()].some((s) => !isBinance(s));
    if (!anyNonBinance && tickTimer) { clearInterval(tickTimer); tickTimer = null; }
  }

  // ============ Twelve Data polling for FX/metals/indices ============
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let pollDelayMs = 60_000; // Free tier: 8 credits/min. Each symbol = 1 credit per call.
  function ensurePolling() {
    const tdSyms = [...quoteSubs.keys()].filter((s) => !isBinance(s));
    if (tdSyms.length === 0) { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } return; }
    if (pollTimer) return;
    const poll = async () => {
      const symbols = [...quoteSubs.keys()].filter((s) => !isBinance(s));
      if (symbols.length === 0) return;
      try {
        const res = await fetchLiveQuotes({ data: { symbols } });
        if (res.error === "rate_limited") {
          // Back off to 90s and retry; keep last-known prices visible.
          pollDelayMs = 90_000;
          reschedule();
          return;
        }
        if (res.quotes.length > 0) {
          pollDelayMs = 60_000; // recover normal cadence
          setStatus("open");
          for (const q of res.quotes) {
            lastPrice.set(q.symbol, q.price);
            anchorPrice.set(q.symbol, q.price);
            syntheticPrice.set(q.symbol, q.price);
            changePct.set(q.symbol, q.changePct ?? 0);
            const quote = toQuote(q.symbol, q.price, q.changePct ?? 0);
            quoteSubs.get(q.symbol)?.forEach((cb) => cb(quote));
            emitCandleUpdate(q.symbol, q.price);
          }
          ensureTickLoop();
        }
      } catch {
        setStatus("error");
      }
    };
    const reschedule = () => {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(poll, pollDelayMs);
    };
    poll();
    reschedule();
  }

  return {
    name: "live",
    status: () => status,
    onStatus(cb) { statusSubs.add(cb); cb(status); return () => statusSubs.delete(cb); },
    subscribe(symbols, onQuote) {
      const list: Array<() => void> = [];
      for (const s of symbols) {
        if (!quoteSubs.has(s)) quoteSubs.set(s, new Set());
        quoteSubs.get(s)!.add(onQuote);
        if (isBinance(s)) binanceSymbols.add(s);
        // seed with cached price
        const p = lastPrice.get(s);
        if (p) setTimeout(() => onQuote(toQuote(s, p)), 0);
        list.push(() => {
          quoteSubs.get(s)?.delete(onQuote);
          if (quoteSubs.get(s)?.size === 0) {
            quoteSubs.delete(s);
            if (isBinance(s)) binanceSymbols.delete(s);
          }
        });
      }
      ensureBinanceWs();
      ensurePolling();
      ensureTickLoop();
      return () => { list.forEach((u) => u()); ensureBinanceWs(); ensurePolling(); stopTickLoopIfIdle(); };
    },
    async getCandles(symbol, tf, count = 300) {
      if (isBinance(symbol)) {
        // Binance klines REST (free, no key)
        const url = `https://api.binance.com/api/v3/klines?symbol=${BINANCE_MAP[symbol].toUpperCase()}&interval=${BINANCE_INTERVAL[tf]}&limit=${Math.min(count, 1000)}`;
        const res = await fetch(url);
        const rows: unknown[][] = await res.json();
        return rows.map((r) => ({
          time: Math.floor(Number(r[0]) / 1000),
          open: Number(r[1]), high: Number(r[2]), low: Number(r[3]), close: Number(r[4]),
          volume: Number(r[5]),
        }));
      }
      const res = await fetchLiveCandles({ data: { symbol, tf, count } });
      const candles = res.candles as Candle[];
      if (candles.length > 0) {
        const last = candles[candles.length - 1];
        anchorPrice.set(symbol, last.close);
        syntheticPrice.set(symbol, last.close);
        lastPrice.set(symbol, last.close);
      }
      return candles;
    },
    onCandle(symbol, tf, cb) {
      const key = `${symbol}|${tf}`;
      if (!candleSubs.has(key)) candleSubs.set(key, new Set());
      candleSubs.get(key)!.add(cb);
      return () => candleSubs.get(key)?.delete(cb);
    },
  };
}