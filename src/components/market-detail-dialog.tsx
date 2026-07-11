import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Circle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
  const [depthLive, setDepthLive] = useState(false);

  useEffect(() => {
    if (!open || !item) return;

    // Non-crypto: no public order-book WS — synthesize a visual depth ladder
    // around the live price and refresh it whenever the price ticks.
    if (!item.binanceStream) {
      setDepthLive(false);
      setDepth(synthDepth(item.price));
      return;
    }

    let ws: WebSocket | null = null;
    let closedByUs = false;
    let backoff = 1_000;

    const connect = () => {
      try {
        ws = new WebSocket(`wss://stream.binance.com:9443/ws/${item.binanceStream}@depth20@100ms`);
      } catch (e) {
        console.warn("[market-detail] ws init failed", e);
        return;
      }
      ws.onopen = () => { backoff = 1_000; setDepthLive(true); };
      ws.onmessage = (ev) => {
        try {
          const d = JSON.parse(ev.data as string);
          const bids: Level[] = (d?.bids ?? []).slice(0, 12).map((r: [string, string]) => ({ price: +r[0], qty: +r[1] }));
          const asks: Level[] = (d?.asks ?? []).slice(0, 12).map((r: [string, string]) => ({ price: +r[0], qty: +r[1] }));
          setDepth({ bids, asks });
        } catch { /* ignore */ }
      };
      ws.onclose = () => {
        setDepthLive(false);
        if (closedByUs) return;
        setTimeout(connect, backoff);
        backoff = Math.min(backoff * 2, 15_000);
      };
      ws.onerror = () => { try { ws?.close(); } catch { /* noop */ } };
    };
    connect();

    return () => {
      closedByUs = true;
      try { ws?.close(); } catch { /* noop */ }
    };
  }, [open, item?.symbol, item?.binanceStream]);

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
  const spread = depth.asks[0] && depth.bids[0] ? depth.asks[0].price - depth.bids[0].price : 0;
  const spreadPct = depth.asks[0] && depth.bids[0] ? (spread / depth.asks[0].price) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-3 font-display">
            <span className="text-gradient">{item.symbol}</span>
            <span className="text-sm font-normal text-muted-foreground">{item.name}</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-muted-foreground">
              <Circle className={cn("h-2 w-2", (item.binanceStream ? depthLive : true) ? "fill-bull text-bull animate-pulse" : "fill-muted-foreground")} />
              {item.binanceStream ? (depthLive ? "دفتر أوامر مباشر" : "جارٍ الاتصال…") : "عمق تقريبي"}
            </span>
          </DialogTitle>
          <DialogDescription>آخر سعر، تغيّر 24س، وعمق السوق (أفضل الطلبات والعروض).</DialogDescription>
        </DialogHeader>

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

        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <DepthSide title="طلبات الشراء (Bids)" tone="bull" levels={depth.bids} maxQty={maxQty} />
          <DepthSide title="عروض البيع (Asks)" tone="bear" levels={depth.asks} maxQty={maxQty} />
        </div>

        <p className="mt-1 text-[11px] text-muted-foreground/70">
          {item.binanceStream
            ? "دفتر أوامر Binance عبر WebSocket، يُحدَّث كل 100مللي‌ثانية."
            : "عمق السوق للأسواق التقليدية تقريبي لأغراض العرض؛ الأسعار للاسترشاد فقط."}
        </p>
      </DialogContent>
    </Dialog>
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