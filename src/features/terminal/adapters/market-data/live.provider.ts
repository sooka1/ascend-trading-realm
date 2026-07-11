import type { Candle, ConnectionStatus, MarketDataProvider, Quote, Timeframe } from "./types";
import { fetchLiveCandles, fetchLiveQuotes } from "@/lib/market-data.functions";

// Symbols routed to Binance WebSocket (free, no key, real-time).
// The map is hydrated at runtime from Binance /api/v3/exchangeInfo so every
// spot pair against USDT/USDC/FDUSD is tradeable without a hard-coded list.
// A short bootstrap set keeps the top majors resolvable before the fetch
// completes on a cold page load.
const BINANCE_MAP: Record<string, string> = {
  BTCUSD: "btcusdt", ETHUSD: "ethusdt", BNBUSD: "bnbusdt", SOLUSD: "solusdt",
};
// Quote assets we accept, in preference order. First match wins per base.
const BINANCE_QUOTE_PREF = ["USDT", "FDUSD", "USDC"] as const;
let exchangeInfoPromise: Promise<void> | null = null;
function loadBinanceExchangeInfo(): Promise<void> {
  if (exchangeInfoPromise) return exchangeInfoPromise;
  exchangeInfoPromise = (async () => {
    try {
      const res = await fetch("https://api.binance.com/api/v3/exchangeInfo");
      const body = await res.json() as {
        symbols?: Array<{ symbol: string; status: string; baseAsset: string; quoteAsset: string; isSpotTradingAllowed?: boolean }>;
      };
      const rows = body?.symbols ?? [];
      // Pick the best quote per base asset following BINANCE_QUOTE_PREF.
      const bestQuote = new Map<string, string>();
      for (const r of rows) {
        if (r.status !== "TRADING" || r.isSpotTradingAllowed === false) continue;
        const idx = BINANCE_QUOTE_PREF.indexOf(r.quoteAsset as typeof BINANCE_QUOTE_PREF[number]);
        if (idx < 0) continue;
        const cur = bestQuote.get(r.baseAsset);
        const curIdx = cur ? BINANCE_QUOTE_PREF.indexOf(cur as typeof BINANCE_QUOTE_PREF[number]) : 999;
        if (idx < curIdx) bestQuote.set(r.baseAsset, r.quoteAsset);
      }
      for (const [base, quote] of bestQuote) {
        const internal = `${base}USD`;
        // Never override an existing explicit mapping.
        if (!(internal in BINANCE_MAP)) {
          BINANCE_MAP[internal] = `${base}${quote}`.toLowerCase();
        }
      }
    } catch {
      // Cold fallback: keep the bootstrap map only.
    }
  })();
  return exchangeInfoPromise;
}
// Kick off immediately at module load so the first UI interactions see a
// hydrated map. Non-blocking; failures fall back to the bootstrap entries.
if (typeof window !== "undefined") { void loadBinanceExchangeInfo(); }
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
  // Live OHLC state per (symbol|tf) so ticks build realistic candles.
  const liveCandle = new Map<string, Candle>();
  // In-memory candle cache keyed by `${symbol}|${tf}`. TTL scales with the
  // timeframe (short bars refresh often, high bars rarely) so repeat opens of
  // the market page and TF-switching skip redundant Binance/Twelve Data calls.
  const candleCache = new Map<string, { at: number; ttl: number; candles: Candle[] }>();
  const CANDLE_TTL_MS: Record<Timeframe, number> = {
    "1m": 10_000, "5m": 30_000, "15m": 60_000, "30m": 90_000,
    "1h": 120_000, "4h": 300_000, "1d": 900_000, "1w": 3_600_000, "1M": 6 * 3_600_000,
  };

  // Seed anchor prices so synthetic history/ticks look believable even before
  // the first real quote lands (weekend FX, cold start, rate limits).
  const SEED_PRICE: Record<string, number> = {
    XAUUSD: 2650, XAGUSD: 31, WTI: 78,
    EURUSD: 1.085, GBPUSD: 1.27, USDJPY: 154, USDCHF: 0.9, USDCAD: 1.36,
    AUDUSD: 0.66, NZDUSD: 0.6,
    US500: 5800, NAS100: 20500, US30: 43000, GER40: 19500, UK100: 8200,
    BTCUSD: 95000, ETHUSD: 3300,
  };

  // Build a realistic random-walk OHLC history ending at `now` using anchor
  // price + per-tick volatility. Used as a fallback when the real provider
  // returns no data (weekend, missing key, rate-limited).
  function synthHistory(sym: string, tf: Timeframe, count: number): Candle[] {
    const anchor = anchorPrice.get(sym) ?? lastPrice.get(sym) ?? SEED_PRICE[sym] ?? 100;
    const step = TF_SEC[tf];
    const nowBucket = Math.floor(Date.now() / 1000 / step) * step;
    const vol = (TICK_VOL[sym] ?? DEFAULT_TICK_VOL) * 8; // per-bar σ ~ 8 ticks
    const out: Candle[] = new Array(count);
    // Walk backward from anchor, then flip so oldest is first.
    let close = anchor;
    for (let i = count - 1; i >= 0; i--) {
      const drift = (Math.random() - 0.5) * anchor * vol;
      const open = close - drift;
      const wick = anchor * vol * 0.6;
      const high = Math.max(open, close) + Math.random() * wick;
      const low = Math.min(open, close) - Math.random() * wick;
      out[i] = { time: nowBucket - (count - 1 - i) * step, open, high, low, close };
      close = open + (anchor - open) * 0.01; // gentle mean reversion for next-older bar
    }
    return out;
  }

  // Align a historical series' tail with the current bucket for the given
  // timeframe so live tick updates extend the last bar seamlessly (no gap,
  // no overlap) when the user switches timeframes.
  function alignTail(candles: Candle[], tf: Timeframe): Candle[] {
    if (candles.length === 0) return candles;
    const step = TF_SEC[tf];
    const nowBucket = Math.floor(Date.now() / 1000 / step) * step;
    const last = candles[candles.length - 1];
    // Drop any bar whose bucket is ahead of "now" (clock skew / provider quirk).
    while (candles.length > 0 && candles[candles.length - 1].time > nowBucket) {
      candles.pop();
    }
    const tail = candles[candles.length - 1] ?? last;
    if (tail.time === nowBucket) return candles; // in-progress bar already present
    // Historical tail is a closed bar. Append a fresh in-progress bar at the
    // current bucket so live ticks build directly on top without a gap.
    candles.push({
      time: nowBucket, open: tail.close, high: tail.close, low: tail.close, close: tail.close,
    });
    return candles;
  }

  function setStatus(s: ConnectionStatus) { status = s; statusSubs.forEach((cb) => cb(s)); }

  // After exchangeInfo lands, sweep any already-subscribed symbols that
  // now match a Binance pair and route them through the WebSocket.
  void loadBinanceExchangeInfo().then(() => {
    let added = false;
    for (const sym of quoteSubs.keys()) {
      if (isBinance(sym) && !binanceSymbols.has(sym)) { binanceSymbols.add(sym); added = true; }
    }
    if (added) ensureBinanceWs();
  });

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
      const prev = liveCandle.get(key);
      const c: Candle = prev && prev.time === bucket
        ? { time: bucket, open: prev.open, high: Math.max(prev.high, price), low: Math.min(prev.low, price), close: price }
        : { time: bucket, open: prev?.close ?? price, high: price, low: price, close: price };
      liveCandle.set(key, c);
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
      const cacheKey = `${symbol}|${tf}`;
      const cached = candleCache.get(cacheKey);
      if (cached && Date.now() - cached.at < cached.ttl && cached.candles.length >= count * 0.8) {
        // Re-align the tail against "now" — a cached in-progress bar from a
        // previous bucket must not leak into the new one.
        const aligned = alignTail(cached.candles.map((c) => ({ ...c })), tf);
        const last = aligned[aligned.length - 1];
        anchorPrice.set(symbol, last.close);
        syntheticPrice.set(symbol, last.close);
        lastPrice.set(symbol, last.close);
        liveCandle.set(cacheKey, { ...last });
        return aligned;
      }
      if (isBinance(symbol)) {
        // Binance klines REST (free, no key)
        const url = `https://api.binance.com/api/v3/klines?symbol=${BINANCE_MAP[symbol].toUpperCase()}&interval=${BINANCE_INTERVAL[tf]}&limit=${Math.min(count, 1000)}`;
        let out: Candle[] = [];
        try {
          const res = await fetch(url);
          const rows: unknown[][] = await res.json();
          out = rows.map((r) => ({
            time: Math.floor(Number(r[0]) / 1000),
            open: Number(r[1]), high: Number(r[2]), low: Number(r[3]), close: Number(r[4]),
            volume: Number(r[5]),
          })).filter((c) => isFinite(c.close));
        } catch { /* fall through to synth */ }
        if (out.length === 0) out = synthHistory(symbol, tf, count);
        out = alignTail(out, tf);
        const last = out[out.length - 1];
        anchorPrice.set(symbol, last.close);
        syntheticPrice.set(symbol, last.close);
        lastPrice.set(symbol, last.close);
        liveCandle.set(`${symbol}|${tf}`, { ...last });
        candleCache.set(cacheKey, { at: Date.now(), ttl: CANDLE_TTL_MS[tf] ?? 60_000, candles: out });
        return out;
      }
      const res = await fetchLiveCandles({ data: { symbol, tf, count } });
      let candles = res.candles as Candle[];
      if (!candles || candles.length === 0) candles = synthHistory(symbol, tf, count);
      candles = alignTail(candles, tf);
      const last = candles[candles.length - 1];
      anchorPrice.set(symbol, last.close);
      syntheticPrice.set(symbol, last.close);
      lastPrice.set(symbol, last.close);
      liveCandle.set(`${symbol}|${tf}`, { ...last });
      candleCache.set(cacheKey, { at: Date.now(), ttl: CANDLE_TTL_MS[tf] ?? 60_000, candles });
      return candles;
    },
    onCandle(symbol, tf, cb) {
      const key = `${symbol}|${tf}`;
      if (!candleSubs.has(key)) candleSubs.set(key, new Set());
      candleSubs.get(key)!.add(cb);
      return () => {
        candleSubs.get(key)?.delete(cb);
        if (candleSubs.get(key)?.size === 0) { candleSubs.delete(key); liveCandle.delete(key); }
      };
    },
  };
}