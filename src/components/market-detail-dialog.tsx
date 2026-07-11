import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Circle, AlertTriangle, Loader2, RotateCw, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PriceSparkline } from "@/components/price-sparkline";
import { useWatchlist } from "@/hooks/use-watchlist";
type DepthStatus = "loading" | "connected" | "reconnecting" | "error";

// Warn the user when live ticks stall (network issue, market close, etc.).
const STALE_MS = 8_000;
const MAX_DEPTH_ATTEMPTS = 6;
// Fee tiers per asset category (%). Tune later to match real product tiers.
const FEE_BY_CATEGORY: Record<string, number> = {
  crypto: 0.15,
  fx: 0.03,
  metals: 0.05,
  indices: 0.05,
  stocks: 0.1,
  energy: 0.05,
};

export type DetailInstrument = {
  symbol: string;
  name: string;
  category: string;
  price: number;
  change: number;
  updatedAt: number;
  /** Binance stream key (e.g. "btcusdt"). If set, opens a live depth WS. */
  binanceStream?: string;
};

type Level = { price: number; qty: number };

function fmtPrice(v: number) {
  if (!isFinite(v) || v === 0) return "—";
  if (v < 1) return v.toFixed(4);
  if (v < 100) return v.toFixed(3);
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function fmtQty(v: number) {
  if (!isFinite(v)) return "—";
  if (v < 1) return v.toFixed(4);
  if (v < 1000) return v.toFixed(3);
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/** Synthetic depth ladder for markets without a public WebSocket order book. */
function synthDepth(price: number, levels = 10): { bids: Level[]; asks: Level[] } {
  if (!isFinite(price) || price <= 0) return { bids: [], asks: [] };
  const tick = Math.max(price * 0.0001, 0.0001);
  const bids: Level[] = [];
  const asks: Level[] = [];
  for (let i = 1; i <= levels; i++) {
    const noise = 0.6 + Math.random() * 0.8;
    bids.push({ price: price - tick * i, qty: (levels - i + 2) * noise });
    asks.push({ price: price + tick * i, qty: (levels - i + 2) * noise });
  }
  return { bids, asks };
}

export function MarketDetailDialog({
  item,
  open,
  onOpenChange,
}: {
  item: DetailInstrument | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [depth, setDepth] = useState<{ bids: Level[]; asks: Level[] }>({ bids: [], asks: [] });
  const [depthStatus, setDepthStatus] = useState<DepthStatus>("loading");
  const [attempt, setAttempt] = useState(0);
  const [lastTickAt, setLastTickAt] = useState(0);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!open || !item) return;
    setDepth({ bids: [], asks: [] });
    setDepthStatus("loading");
    setAttempt(0);
    setLastTickAt(0);

    // Non-crypto: no public order-book WS — synthesize a visual depth ladder
    // around the live price and refresh it whenever the price ticks.
    if (!item.binanceStream) {
      setDepth(synthDepth(item.price));
      setDepthStatus("connected");
      setLastTickAt(Date.now());
      return;
    }

    let ws: WebSocket | null = null;
    let closedByUs = false;
    let localAttempt = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      setDepthStatus(localAttempt === 0 ? "loading" : "reconnecting");
      try {
        ws = new WebSocket(`wss://stream.binance.com:9443/ws/${item.binanceStream}@depth20@100ms`);
      } catch (e) {
        console.warn("[market-detail] ws init failed", e);
        scheduleReconnect();
        return;
      }
      ws.onopen = () => {
        localAttempt = 0;
        setAttempt(0);
        setDepthStatus("connected");
      };
      ws.onmessage = (ev) => {
        try {
          const d = JSON.parse(ev.data as string);
          const bids: Level[] = (d?.bids ?? []).slice(0, 12).map((r: [string, string]) => ({ price: +r[0], qty: +r[1] }));
          const asks: Level[] = (d?.asks ?? []).slice(0, 12).map((r: [string, string]) => ({ price: +r[0], qty: +r[1] }));
          setDepth({ bids, asks });
          setLastTickAt(Date.now());
        } catch { /* ignore */ }
      };
      ws.onclose = () => {
        if (closedByUs) return;
        scheduleReconnect();
      };
      ws.onerror = () => { try { ws?.close(); } catch { /* noop */ } };
    };

    const scheduleReconnect = () => {
      localAttempt += 1;
      setAttempt(localAttempt);
      if (localAttempt > MAX_DEPTH_ATTEMPTS) {
        setDepthStatus("error");
        return;
      }
      setDepthStatus("reconnecting");
      const delay = Math.min(1_000 * 2 ** (localAttempt - 1), 15_000);
      const jitter = delay * (0.8 + Math.random() * 0.4);
      reconnectTimer = setTimeout(connect, jitter);
    };

    connect();

    return () => {
      closedByUs = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try { ws?.close(); } catch { /* noop */ }
    };
  }, [open, item?.symbol, item?.binanceStream, retryToken]);

  // Detect stall: no ticks in STALE_MS while dialog is open → surface warning.
  const [isStale, setIsStale] = useState(false);
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      setIsStale(depthStatus === "connected" && lastTickAt > 0 && Date.now() - lastTickAt > STALE_MS);
    }, 1_000);
    return () => clearInterval(id);
  }, [open, depthStatus, lastTickAt]);

  // Refresh synthesized depth whenever the parent-driven price changes.
  useEffect(() => {
    if (!open || !item || item.binanceStream) return;
    setDepth(synthDepth(item.price));
  }, [open, item?.price, item?.binanceStream, item?.symbol]);

  const maxQty = useMemo(() => {
    const all = [...depth.bids, ...depth.asks].map((l) => l.qty);
    return all.length ? Math.max(...all) : 1;
  }, [depth]);

  if (!item) return null;
  const up = item.change >= 0;
  const bestBid = depth.bids[0]?.price ?? 0;
  const bestAsk = depth.asks[0]?.price ?? 0;
  const spread = bestAsk && bestBid ? bestAsk - bestBid : 0;
  const spreadPct = bestAsk && bestBid ? (spread / bestAsk) * 100 : 0;
  const hasDepth = depth.bids.length > 0 && depth.asks.length > 0;
  const feePct = FEE_BY_CATEGORY[item.category] ?? 0.1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-3 font-display">
            <span className="text-gradient">{item.symbol}</span>
            <span className="text-sm font-normal text-muted-foreground">{item.name}</span>
            <StatusChip status={depthStatus} attempt={attempt} isBinance={!!item.binanceStream} />
            <WatchlistToggle symbol={item.symbol} />
          </DialogTitle>
          <DialogDescription>آخر سعر، تغيّر 24س، وعمق السوق (أفضل الطلبات والعروض).</DialogDescription>
        </DialogHeader>

        {depthStatus === "reconnecting" && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            انقطع البث المباشر. جارٍ إعادة الاتصال… (المحاولة {attempt}/{MAX_DEPTH_ATTEMPTS})
          </div>
        )}
        {depthStatus === "error" && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-bear/30 bg-bear/10 px-3 py-2 text-xs text-bear">
            <span className="inline-flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> تعذّر استلام دفتر الأوامر المباشر. تحقق من الاتصال.</span>
            <button
              onClick={() => setRetryToken((v) => v + 1)}
              className="inline-flex items-center gap-1 rounded-md border border-bear/40 px-2 py-1 font-medium hover:bg-bear/20"
            >
              <RotateCw className="h-3 w-3" /> إعادة المحاولة
            </button>
          </div>
        )}
        {isStale && depthStatus === "connected" && (
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            لا توجد تحديثات جديدة منذ أكثر من {Math.round(STALE_MS / 1000)} ثوانٍ. قد يكون السوق بطيئاً أو مغلقاً.
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="glass rounded-xl p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">آخر سعر</div>
            <div className="mt-1 font-display text-2xl font-semibold tabular-nums">{fmtPrice(item.price)}</div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">تغيّر 24س</div>
            <div className={cn("mt-1 inline-flex items-center gap-1 font-display text-2xl font-semibold tabular-nums", up ? "text-bull" : "text-bear")}>
              {up ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
              {up ? "+" : ""}{item.change.toFixed(2)}%
            </div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">السبريد</div>
            <div className="mt-1 font-display text-2xl font-semibold tabular-nums">
              {spread > 0 ? spreadPct.toFixed(3) + "%" : "—"}
            </div>
          </div>
        </div>

        <PriceSparkline
          symbol={item.symbol}
          price={item.price}
          changePct={item.change}
          binanceStream={item.binanceStream}
          className="mt-3"
        />

        {depthStatus === "loading" && !hasDepth ? (
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <DepthSkeleton />
            <DepthSkeleton />
          </div>
        ) : (
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <DepthSide title="طلبات الشراء (Bids)" tone="bull" levels={depth.bids} maxQty={maxQty} />
            <DepthSide title="عروض البيع (Asks)" tone="bear" levels={depth.asks} maxQty={maxQty} />
          </div>
        )}

        <OrderSimulator
          symbol={item.symbol}
          lastPrice={item.price}
          bestBid={bestBid || item.price}
          bestAsk={bestAsk || item.price}
          feePct={feePct}
        />

        <p className="mt-1 text-[11px] text-muted-foreground/70">
          {item.binanceStream
            ? "دفتر أوامر Binance عبر WebSocket، يُحدَّث كل 100مللي‌ثانية."
            : "عمق السوق للأسواق التقليدية تقريبي لأغراض العرض؛ الأسعار للاسترشاد فقط."}
        </p>
      </DialogContent>
    </Dialog>
  );
}

function StatusChip({ status, attempt, isBinance }: { status: DepthStatus; attempt: number; isBinance: boolean }) {
  const map: Record<DepthStatus, { label: string; cls: string; dot: string }> = {
    loading:      { label: isBinance ? "جارٍ الاتصال…" : "عمق تقريبي", cls: "border-white/10 text-muted-foreground", dot: "fill-muted-foreground animate-pulse" },
    connected:    { label: isBinance ? "دفتر أوامر مباشر" : "عمق تقريبي", cls: "border-bull/40 bg-bull/10 text-bull", dot: "fill-bull text-bull animate-pulse" },
    reconnecting: { label: `إعادة اتصال (${attempt}/${MAX_DEPTH_ATTEMPTS})`, cls: "border-amber-500/40 bg-amber-500/10 text-amber-200", dot: "fill-amber-300 animate-pulse" },
    error:        { label: "غير متصل", cls: "border-bear/40 bg-bear/10 text-bear", dot: "fill-bear" },
  };
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]", m.cls)}>
      <Circle className={cn("h-2 w-2", m.dot)} />
      {m.label}
    </span>
  );
}

function DepthSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-xl">
      <div className="border-b border-white/5 bg-white/[0.02] px-3 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">جارٍ التحميل…</div>
      <ul className="divide-y divide-white/5">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i} className="flex items-center justify-between gap-2 px-3 py-2">
            <span className="h-3 w-16 animate-pulse rounded bg-white/10" />
            <span className="h-3 w-12 animate-pulse rounded bg-white/10" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function OrderSimulator({
  symbol,
  lastPrice,
  bestBid,
  bestAsk,
  feePct,
}: {
  symbol: string;
  lastPrice: number;
  bestBid: number;
  bestAsk: number;
  feePct: number;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [qtyStr, setQtyStr] = useState("1");

  // Sanitize numeric input — non-negative finite decimals only.
  const qty = useMemo(() => {
    const parsed = Number.parseFloat(qtyStr);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return Math.min(parsed, 1_000_000_000);
  }, [qtyStr]);

  const price = side === "buy" ? (bestAsk || lastPrice) : (bestBid || lastPrice);
  const notional = qty * price;
  const fee = notional * (feePct / 100);
  const total = side === "buy" ? notional + fee : notional - fee;
  const invalid = qtyStr.trim() !== "" && (!Number.isFinite(Number.parseFloat(qtyStr)) || Number.parseFloat(qtyStr) < 0);

  return (
    <div className="mt-3 glass rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold">محاكاة أمر — {symbol}</h3>
        <div className="inline-flex rounded-lg border border-white/10 p-0.5 text-xs">
          <button
            onClick={() => setSide("buy")}
            className={cn("rounded-md px-3 py-1 font-medium transition", side === "buy" ? "bg-bull/20 text-bull" : "text-muted-foreground hover:text-foreground")}
          >
            شراء
          </button>
          <button
            onClick={() => setSide("sell")}
            className={cn("rounded-md px-3 py-1 font-medium transition", side === "sell" ? "bg-bear/20 text-bear" : "text-muted-foreground hover:text-foreground")}
          >
            بيع
          </button>
        </div>
      </div>

      <label className="block text-[11px] uppercase tracking-wider text-muted-foreground">الكمية</label>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        value={qtyStr}
        onChange={(e) => setQtyStr(e.target.value)}
        className={cn(
          "mt-1 w-full rounded-lg border bg-white/[0.03] px-3 py-2 text-sm tabular-nums outline-none",
          invalid ? "border-bear/50 focus:border-bear" : "border-white/10 focus:border-gold/40",
        )}
        placeholder="0.00"
      />
      {invalid && <p className="mt-1 text-[11px] text-bear">أدخل قيمة رقمية موجبة.</p>}

      <dl className="mt-3 space-y-1.5 text-xs">
        <Row label={side === "buy" ? "أفضل عرض بيع (Ask)" : "أفضل طلب شراء (Bid)"} value={fmtPrice(price)} />
        <Row label="القيمة الإجمالية" value={fmtPrice(notional)} />
        <Row label={`الرسوم التقديرية (${feePct.toFixed(2)}%)`} value={fmtPrice(fee)} />
        <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 text-sm">
          <span className="text-muted-foreground">{side === "buy" ? "الإجمالي المستحق" : "الصافي المستلم"}</span>
          <span className={cn("font-display font-semibold tabular-nums", side === "buy" ? "text-bear" : "text-bull")}>{fmtPrice(total)}</span>
        </div>
      </dl>
      <p className="mt-2 text-[10px] text-muted-foreground/70">محاكاة توضيحية فقط — لا تُنفَّذ صفقة حقيقية.</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function DepthSide({ title, tone, levels, maxQty }: { title: string; tone: "bull" | "bear"; levels: Level[]; maxQty: number }) {
  const barBg = tone === "bull" ? "bg-bull/15" : "bg-bear/15";
  const priceColor = tone === "bull" ? "text-bull" : "text-bear";
  const rows = levels.slice(0, 10);
  return (
    <div className="glass overflow-hidden rounded-xl">
      <div className="border-b border-white/5 bg-white/[0.02] px-3 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">{title}</div>
      {rows.length === 0 ? (
        <div className="px-3 py-4 text-center text-xs text-muted-foreground">—</div>
      ) : (
        <ul className="divide-y divide-white/5 text-xs">
          {rows.map((l, i) => {
            const pct = maxQty > 0 ? (l.qty / maxQty) * 100 : 0;
            return (
              <li key={i} className="relative grid grid-cols-2 gap-2 px-3 py-1.5 tabular-nums">
                <span className={cn("absolute inset-y-0 left-0", barBg)} style={{ width: `${pct}%` }} aria-hidden />
                <span className={cn("relative font-medium", priceColor)}>{fmtPrice(l.price)}</span>
                <span className="relative text-left text-muted-foreground">{fmtQty(l.qty)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}