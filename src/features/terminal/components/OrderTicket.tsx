import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { getBroker } from "../adapters/broker";
import { estimateMargin, estimatedPnl, riskReward, validateOrder } from "../services/risk-engine";
import type { Instrument } from "../services/risk-engine";
import { useQueryClient } from "@tanstack/react-query";
import { formatAssetPrice, formatUsd } from "../lib/format";

type OrderType = "market" | "limit" | "stop" | "stop_limit";

export function OrderTicket({ instrument, bid, ask, balance, leverage }: {
  instrument: Instrument | undefined;
  bid: number; ask: number;
  balance: number; leverage: number;
}) {
  const qc = useQueryClient();
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [volume, setVolume] = useState("0.10");
  const [price, setPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [busy, setBusy] = useState(false);

  const vol = Number(volume) || 0;
  const entryBuy = orderType === "market" ? ask : Number(price) || ask;
  const entrySell = orderType === "market" ? bid : Number(price) || bid;
  const tpNum = tp ? Number(tp) : null;
  const slNum = sl ? Number(sl) : null;

  const marginBuy = useMemo(() => instrument ? estimateMargin(instrument, vol, entryBuy, leverage) : 0, [instrument, vol, entryBuy, leverage]);
  const rrBuy = instrument ? riskReward(entryBuy, slNum, tpNum, "buy") : null;
  const rrSell = instrument ? riskReward(entrySell, slNum, tpNum, "sell") : null;
  const estProfitBuy = instrument && tpNum ? estimatedPnl(instrument, "buy", entryBuy, tpNum, vol) : null;
  const estLossBuy = instrument && slNum ? estimatedPnl(instrument, "buy", entryBuy, slNum, vol) : null;

  async function submit(side: "buy" | "sell") {
    if (!instrument) return;
    const entry = side === "buy" ? entryBuy : entrySell;
    const err = validateOrder(instrument, vol, balance, marginBuy);
    if (err) { toast.error(err); return; }
    setBusy(true);
    try {
      const res = await getBroker().placeOrder({
        symbol: instrument.symbol, side, order_type: orderType, volume: vol,
        price: orderType === "market" ? null : Number(price) || null,
        stop_price: stopPrice ? Number(stopPrice) : null,
        take_profit: tpNum, stop_loss: slNum,
      }, entry);
      if (!res.ok) { toast.error(res.error ?? "فشل الأمر"); return; }
      toast.success(orderType === "market" ? `تم فتح ${side === "buy" ? "شراء" : "بيع"} ${vol}` : "تم إنشاء أمر معلّق");
      qc.invalidateQueries({ queryKey: ["trading-positions"] });
      qc.invalidateQueries({ queryKey: ["trading-pending"] });
      qc.invalidateQueries({ queryKey: ["trading-account"] });
    } finally { setBusy(false); }
  }

  if (!instrument) return <div className="text-sm text-white/50 p-4">اختر أداة من قائمة المتابعة</div>;

  return (
    <div dir="rtl" className="space-y-3 p-3 text-right">
      <Tabs value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
        <TabsList className="grid grid-cols-4 h-8">
          <TabsTrigger value="market" className="text-xs">سوق</TabsTrigger>
          <TabsTrigger value="limit" className="text-xs">Limit</TabsTrigger>
          <TabsTrigger value="stop" className="text-xs">Stop</TabsTrigger>
          <TabsTrigger value="stop_limit" className="text-xs">S-Limit</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-2 gap-2">
        <div className="min-w-0 rounded-md border border-white/10 bg-white/[0.02] p-2 text-start">
          <div className="text-xs font-medium leading-tight text-white/50">Bid</div>
          <div className="truncate font-mono text-sm font-semibold leading-tight tabular-nums text-red-400" dir="ltr">{formatAssetPrice(instrument.symbol, bid, instrument.price_precision)}</div>
        </div>
        <div className="min-w-0 rounded-md border border-white/10 bg-white/[0.02] p-2 text-start">
          <div className="text-xs font-medium leading-tight text-white/50">Ask</div>
          <div className="truncate font-mono text-sm font-semibold leading-tight tabular-nums text-emerald-400" dir="ltr">{formatAssetPrice(instrument.symbol, ask, instrument.price_precision)}</div>
        </div>
      </div>

      <div className="text-start">
        <Label className="text-xs font-medium leading-tight">الحجم (Lot)</Label>
        <Input dir="ltr" value={volume} onChange={(e) => setVolume(e.target.value)} className="mt-1 h-8 text-right font-mono text-sm font-semibold tabular-nums" />
      </div>

      {orderType !== "market" && (
        <div className="text-start">
          <Label className="text-xs font-medium leading-tight">سعر التنفيذ</Label>
          <Input dir="ltr" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={String(ask.toFixed(instrument.price_precision))} className="mt-1 h-8 text-right font-mono text-sm font-semibold tabular-nums" />
        </div>
      )}
      {orderType === "stop_limit" && (
        <div className="text-start">
          <Label className="text-xs font-medium leading-tight">Stop Price</Label>
          <Input dir="ltr" value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} className="mt-1 h-8 text-right font-mono text-sm font-semibold tabular-nums" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="min-w-0 text-start">
          <Label className="text-xs font-medium leading-tight">جني الأرباح</Label>
          <Input dir="ltr" value={tp} onChange={(e) => setTp(e.target.value)} className="mt-1 h-8 text-right font-mono text-sm font-semibold tabular-nums" />
        </div>
        <div className="min-w-0 text-start">
          <Label className="text-xs font-medium leading-tight">وقف الخسارة</Label>
          <Input dir="ltr" value={sl} onChange={(e) => setSl(e.target.value)} className="mt-1 h-8 text-right font-mono text-sm font-semibold tabular-nums" />
        </div>
      </div>

      <div className="space-y-1 rounded-md border border-white/10 bg-white/[0.02] p-2">
        <Row label="الهامش المطلوب" value={formatUsd(marginBuy)} />
        <Row label="R/R (شراء)" value={rrBuy ? `1 : ${rrBuy.toFixed(2)}` : "—"} />
        <Row label="R/R (بيع)" value={rrSell ? `1 : ${rrSell.toFixed(2)}` : "—"} />
        <Row label="ربح متوقع" value={estProfitBuy !== null ? formatUsd(estProfitBuy) : "—"} valueClass="text-emerald-400" />
        <Row label="خسارة متوقعة" value={estLossBuy !== null ? formatUsd(estLossBuy) : "—"} valueClass="text-red-400" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => submit("sell")}
          disabled={busy}
          className="group relative flex h-14 min-w-0 flex-col items-stretch justify-center overflow-hidden rounded-md border border-red-400/40 bg-gradient-to-b from-red-500/95 to-red-600 px-3 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset,0_6px_16px_-8px_rgba(239,68,68,0.55)] ring-1 ring-inset ring-white/5 transition-all hover:from-red-500 hover:to-red-700 active:translate-y-px disabled:opacity-60"
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
              <ArrowDown className="h-3 w-3" strokeWidth={2.5} />
              SELL
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/70">بيع</span>
          </div>
          <div dir="ltr" className="mt-0.5 truncate text-start font-mono text-sm font-bold leading-none tabular-nums">
            {formatAssetPrice(instrument.symbol, bid, instrument.price_precision)}
          </div>
        </button>
        <button
          type="button"
          onClick={() => submit("buy")}
          disabled={busy}
          className="group relative flex h-14 min-w-0 flex-col items-stretch justify-center overflow-hidden rounded-md border border-emerald-400/40 bg-gradient-to-b from-emerald-500/95 to-emerald-600 px-3 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset,0_6px_16px_-8px_rgba(16,185,129,0.55)] ring-1 ring-inset ring-white/5 transition-all hover:from-emerald-500 hover:to-emerald-700 active:translate-y-px disabled:opacity-60"
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
              <ArrowUp className="h-3 w-3" strokeWidth={2.5} />
              BUY
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/70">شراء</span>
          </div>
          <div dir="ltr" className="mt-0.5 truncate text-start font-mono text-sm font-bold leading-none tabular-nums">
            {formatAssetPrice(instrument.symbol, ask, instrument.price_precision)}
          </div>
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 leading-tight">
      <span className="min-w-0 truncate text-xs font-medium text-white/50">{label}</span>
      <span dir="ltr" className={`shrink-0 font-mono text-xs font-semibold tabular-nums ${valueClass ?? "text-white/80"}`}>{value}</span>
    </div>
  );
}