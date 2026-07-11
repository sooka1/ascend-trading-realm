// Unified price-feed engine.
//
// Every price source — the Binance WebSocket for crypto, the server-fn
// poller for traditional markets, and any future provider — plugs in here.
// The engine batches ticks per animation frame and emits identically-shaped
// updates and per-source status so consumers stay agnostic of the transport.

export type FeedStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

export type PriceTick = {
  /** Canonical instrument symbol used by the UI (e.g. "BTC/USD"). */
  symbol: string;
  price: number;
  /** 24h change percent. */
  change: number;
  /** Epoch ms when the tick was received. */
  updatedAt: number;
  /** Source id that produced the tick. */
  source: string;
};

export type SourceStatus = { id: string; status: FeedStatus; attempt: number };

export interface FeedSourceContext {
  emit(tick: Omit<PriceTick, "source" | "updatedAt"> & { updatedAt?: number }): void;
  setStatus(status: FeedStatus, attempt?: number): void;
  /** Capped exponential-backoff scheduler shared by all sources. */
  scheduleReconnect(run: () => void, opts?: { onGiveUp?: () => void }): void;
  resetAttempts(): void;
}

export interface FeedSource {
  id: string;
  start(ctx: FeedSourceContext): { stop: () => void; retry: () => void };
}

const MAX_ATTEMPTS = 8;
const BASE_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;

export type MarketFeed = {
  subscribe(onBatch: (ticks: PriceTick[]) => void): () => void;
  subscribeStatus(onChange: (statuses: Record<string, SourceStatus>) => void): () => void;
  retry(sourceId: string): void;
  stop(): void;
};

export function createMarketFeed(sources: FeedSource[]): MarketFeed {
  const tickSubs = new Set<(ticks: PriceTick[]) => void>();
  const statusSubs = new Set<(s: Record<string, SourceStatus>) => void>();
  const statuses: Record<string, SourceStatus> = {};
  const handles = new Map<string, { stop: () => void; retry: () => void }>();

  // rAF batching — one flush per frame regardless of tick volume.
  const pending = new Map<string, PriceTick>();
  let raf: number | null = null;
  const flush = () => {
    raf = null;
    if (pending.size === 0) return;
    const batch = Array.from(pending.values());
    pending.clear();
    for (const cb of tickSubs) cb(batch);
  };
  const scheduleFlush = () => {
    if (raf != null) return;
    raf = typeof requestAnimationFrame !== "undefined"
      ? requestAnimationFrame(flush)
      : (setTimeout(flush, 16) as unknown as number);
  };

  const emitStatus = () => {
    const snap = { ...statuses };
    for (const cb of statusSubs) cb(snap);
  };

  const startSource = (src: FeedSource) => {
    statuses[src.id] = { id: src.id, status: "connecting", attempt: 0 };
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const ctx: FeedSourceContext = {
      emit(t) {
        pending.set(t.symbol, {
          symbol: t.symbol,
          price: t.price,
          change: t.change,
          updatedAt: t.updatedAt ?? Date.now(),
          source: src.id,
        });
        scheduleFlush();
      },
      setStatus(status, a) {
        if (a != null) attempt = a;
        if (status === "connected") attempt = 0;
        statuses[src.id] = { id: src.id, status, attempt };
        emitStatus();
      },
      resetAttempts() {
        attempt = 0;
      },
      scheduleReconnect(run, opts) {
        attempt += 1;
        if (attempt > MAX_ATTEMPTS) {
          statuses[src.id] = { id: src.id, status: "disconnected", attempt };
          emitStatus();
          opts?.onGiveUp?.();
          return;
        }
        statuses[src.id] = { id: src.id, status: "reconnecting", attempt };
        emitStatus();
        const raw = BASE_BACKOFF_MS * 2 ** (attempt - 1);
        const capped = Math.min(raw, MAX_BACKOFF_MS);
        const jittered = capped * (0.8 + Math.random() * 0.4);
        timer = setTimeout(run, jittered);
      },
    };
    const inner = src.start(ctx);
    emitStatus();
    handles.set(src.id, {
      stop: () => {
        if (timer) clearTimeout(timer);
        inner.stop();
      },
      retry: () => {
        if (timer) clearTimeout(timer);
        attempt = 0;
        inner.retry();
      },
    });
  };

  for (const src of sources) startSource(src);

  return {
    subscribe(cb) {
      tickSubs.add(cb);
      return () => tickSubs.delete(cb);
    },
    subscribeStatus(cb) {
      statusSubs.add(cb);
      cb({ ...statuses });
      return () => statusSubs.delete(cb);
    },
    retry(id) {
      handles.get(id)?.retry();
    },
    stop() {
      for (const h of handles.values()) h.stop();
      handles.clear();
      if (raf != null && typeof cancelAnimationFrame !== "undefined") cancelAnimationFrame(raf);
      raf = null;
      pending.clear();
    },
  };
}

/** Binance ticker WebSocket source: maps stream keys → UI symbols. */
export function binanceTickerSource(opts: { id: string; streams: Record<string, string> }): FeedSource {
  const streamToSymbol: Record<string, string> = Object.fromEntries(
    Object.entries(opts.streams).map(([sym, stream]) => [stream, sym]),
  );
  const url = `wss://stream.binance.com:9443/stream?streams=${Object.values(opts.streams).map((s) => `${s}@ticker`).join("/")}`;

  return {
    id: opts.id,
    start(ctx) {
      let ws: WebSocket | null = null;
      let closedByUs = false;

      const connect = () => {
        ctx.setStatus(ws ? "reconnecting" : "connecting");
        try {
          ws = new WebSocket(url);
        } catch (e) {
          console.warn(`[feed:${opts.id}] ws init failed`, e);
          ctx.scheduleReconnect(connect);
          return;
        }
        ws.onopen = () => {
          ctx.resetAttempts();
          ctx.setStatus("connected", 0);
        };
        ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data as string);
            const streamKey = String(msg?.stream ?? "").split("@")[0];
            const sym = streamToSymbol[streamKey];
            if (!sym) return;
            const price = Number(msg?.data?.c);
            const change = Number(msg?.data?.P);
            if (!isFinite(price) || !isFinite(change)) return;
            ctx.emit({ symbol: sym, price, change });
          } catch {
            /* ignore malformed frames */
          }
        };
        ws.onclose = () => {
          if (closedByUs) return;
          ctx.scheduleReconnect(connect);
        };
        ws.onerror = () => { try { ws?.close(); } catch { /* noop */ } };
      };

      const onVis = () => {
        if (typeof document === "undefined") return;
        if (document.visibilityState === "hidden") {
          closedByUs = true;
          try { ws?.close(); } catch { /* noop */ }
        } else if (!ws || ws.readyState === WebSocket.CLOSED) {
          closedByUs = false;
          ctx.resetAttempts();
          connect();
        }
      };
      if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVis);

      connect();

      return {
        stop() {
          closedByUs = true;
          if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVis);
          try { ws?.close(); } catch { /* noop */ }
        },
        retry() {
          closedByUs = true;
          try { ws?.close(); } catch { /* noop */ }
          closedByUs = false;
          connect();
        },
      };
    },
  };
}

/** Polling source: repeatedly calls `fetch()` and emits mapped ticks. */
export function pollingSource(opts: {
  id: string;
  intervalMs: number;
  fetch: () => Promise<Array<{ symbol: string; price: number; change: number; updatedAt?: number }>>;
}): FeedSource {
  return {
    id: opts.id,
    start(ctx) {
      let cancelled = false;
      let timer: ReturnType<typeof setTimeout> | null = null;

      const tick = async () => {
        try {
          const rows = await opts.fetch();
          if (cancelled) return;
          for (const r of rows) ctx.emit(r);
          ctx.setStatus("connected", 0);
          timer = setTimeout(tick, opts.intervalMs);
        } catch (e) {
          console.warn(`[feed:${opts.id}] poll failed`, e);
          if (cancelled) return;
          ctx.scheduleReconnect(tick);
        }
      };

      ctx.setStatus("connecting");
      void tick();

      const onVis = () => {
        if (typeof document === "undefined") return;
        if (document.visibilityState === "hidden") {
          if (timer) { clearTimeout(timer); timer = null; }
        } else if (!timer) {
          void tick();
        }
      };
      if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVis);

      return {
        stop() {
          cancelled = true;
          if (timer) clearTimeout(timer);
          if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVis);
        },
        retry() {
          if (timer) clearTimeout(timer);
          ctx.resetAttempts();
          void tick();
        },
      };
    },
  };
}

export const FEED_MAX_ATTEMPTS = MAX_ATTEMPTS;