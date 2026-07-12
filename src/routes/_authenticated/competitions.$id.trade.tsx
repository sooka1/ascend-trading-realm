import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowUpRight, Bell, Camera, Clock, Flame, Layers, LineChart,
  Maximize2, Plus, Search, Settings2, Sparkles, User as UserIcon, X, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/competitions/$id/trade")({
  head: () => ({
    meta: [
      { title: "منصة تداول المسابقة — HK" },
      { name: "description", content: "منصة تداول تجريبية للمشاركة في المسابقة." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CompetitionTradePage,
});

type Instrument = {
  code: string;
  name: string;
  flag: string;
  tv: string;              // TradingView symbol
  initial: number;         // starting price
  digits: number;          // price precision
  pip: number;             // 1 pip in price units
  spreadPips: number;      // spread in pips
  sigma: number;           // GBM volatility per tick
  contract: number;        // units per lot
  quote: "USD" | "JPY" | "CAD"; // quote currency; used for USD conversion
};

const INSTRUMENTS: Instrument[] = [
  { code: "GOLD",      name: "Gold Spot",             flag: "🥇", tv: "OANDA:XAUUSD",     initial: 4119.52,  digits: 2, pip: 0.01,   spreadPips: 30,  sigma: 0.00035, contract: 100,    quote: "USD" },
  { code: "BTCUSD",    name: "Bitcoin vs US Dollar",  flag: "₿",  tv: "BITSTAMP:BTCUSD",  initial: 64112.75, digits: 2, pip: 1,      spreadPips: 5,   sigma: 0.00075, contract: 1,      quote: "USD" },
  { code: "USDJPY",    name: "USD / JPY",             flag: "🇺🇸", tv: "FX:USDJPY",       initial: 161.664,  digits: 3, pip: 0.01,   spreadPips: 1.2, sigma: 0.00015, contract: 100000, quote: "JPY" },
  { code: "EURUSD",    name: "EUR / USD",             flag: "🇪🇺", tv: "FX:EURUSD",       initial: 1.14139,  digits: 5, pip: 0.0001, spreadPips: 0.6, sigma: 0.00012, contract: 100000, quote: "USD" },
  { code: "JP225Cash", name: "Nikkei 225",            flag: "🇯🇵", tv: "TVC:NI225",       initial: 69219,    digits: 0, pip: 1,      spreadPips: 5,   sigma: 0.00025, contract: 1,      quote: "USD" },
  { code: "US100Cash", name: "Nasdaq 100",            flag: "🇺🇸", tv: "NASDAQ:NDX",      initial: 29852.03, digits: 2, pip: 0.25,   spreadPips: 2,   sigma: 0.00030, contract: 1,      quote: "USD" },
  { code: "ETHUSD",    name: "Ethereum vs US Dollar", flag: "Ξ",  tv: "BITSTAMP:ETHUSD",  initial: 1792.26,  digits: 2, pip: 0.5,    spreadPips: 3,   sigma: 0.00080, contract: 1,      quote: "USD" },
  { code: "SILVER",    name: "Silver Spot",           flag: "🥈", tv: "OANDA:XAGUSD",     initial: 59.793,   digits: 3, pip: 0.005,  spreadPips: 3,   sigma: 0.00040, contract: 5000,   quote: "USD" },
  { code: "GBPUSD",    name: "GBP / USD",             flag: "🇬🇧", tv: "FX:GBPUSD",       initial: 1.33992,  digits: 5, pip: 0.0001, spreadPips: 0.9, sigma: 0.00013, contract: 100000, quote: "USD" },
];

const LEVERAGE = 100;
const START_BALANCE = 5000;

type Tick = { price: number; open: number; prev: number };
type PriceMap = Record<string, Tick>;

type Position = {
  id: string;
  code: string;
  side: "buy" | "sell";
  lots: number;
  entry: number;
  ts: number;
};

type ClosedTrade = {
  id: string;
  code: string;
  side: "buy" | "sell";
  lots: number;
  entry: number;
  exit: number;
  pnl: number;
  closedAt: number;
};

// Standard normal via Box–Muller
function gauss() {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const fmt = (n: number, d = 2) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);

function bidOf(inst: Instrument, price: number) {
  return +(price - inst.spreadPips * inst.pip * 0.5).toFixed(inst.digits);
}
function askOf(inst: Instrument, price: number) {
  return +(price + inst.spreadPips * inst.pip * 0.5).toFixed(inst.digits);
}

// USD profit for a position given current price map (for USDJPY etc convert via current price)
function pnlUsd(pos: Position, prices: PriceMap): number {
  const inst = INSTRUMENTS.find((i) => i.code === pos.code)!;
  const cur = prices[pos.code]?.price ?? inst.initial;
  const exit = pos.side === "buy" ? bidOf(inst, cur) : askOf(inst, cur);
  const delta = pos.side === "buy" ? exit - pos.entry : pos.entry - exit;
  const gross = delta * inst.contract * pos.lots;
  if (inst.quote === "USD") return gross;
  // Quote is JPY/CAD → convert to USD using current price of USD/quote pair (e.g. USD/JPY)
  return gross / cur;
}

function marginUsd(pos: Position, prices: PriceMap): number {
  const inst = INSTRUMENTS.find((i) => i.code === pos.code)!;
  const cur = prices[pos.code]?.price ?? pos.entry;
  // Notional in USD:
  //  - USD-quoted (xxxUSD, metals, indices, crypto): contract * price * lots
  //  - USD-base (USDJPY, USDCAD): contract * lots (already in USD)
  const notional = inst.quote === "USD" ? cur * inst.contract * pos.lots : inst.contract * pos.lots;
  return notional / LEVERAGE;
}

function CompetitionTradePage() {
  const { id } = useParams({ from: "/_authenticated/competitions/$id/trade" });
  const [entryStatus, setEntryStatus] = useState<"loading" | "entered" | "denied">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) { if (!cancelled) setEntryStatus("denied"); return; }
      const { data } = await supabase
        .from("competition_entries")
        .select("id,status")
        .eq("user_id", uid)
        .eq("competition_id", id)
        .maybeSingle();
      if (cancelled) return;
      const ok =
        !!data &&
        (data.status === "confirmed" || data.status === "active" || data.status === "pending");
      setEntryStatus(ok ? "entered" : "denied");
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (entryStatus !== "entered") {
    return <CompetitionEntryGate id={id} status={entryStatus} />;
  }
  return <TradingTerminal id={id} />;
}

function TradingTerminal({ id }: { id: string }) {
  const [active, setActive] = useState<Instrument>(INSTRUMENTS[1]);
  const [qtyMode, setQtyMode] = useState<"lots" | "units">("lots");
  const [lotsInput, setLotsInput] = useState("0.01");
  const [oneClick, setOneClick] = useState(true);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [tpsl, setTpsl] = useState(false);
  const [priceAlert, setPriceAlert] = useState(false);
  const [watchOpen, setWatchOpen] = useState(true);
  const [historyTab, setHistoryTab] = useState<"open" | "history">("open");

  const [prices, setPrices] = useState<PriceMap>(() =>
    Object.fromEntries(
      INSTRUMENTS.map((i) => [i.code, { price: i.initial, open: i.initial, prev: i.initial } as Tick]),
    ),
  );
  const [positions, setPositions] = useState<Position[]>([]);
  const [history, setHistory] = useState<ClosedTrade[]>([]);
  const [loaded, setLoaded] = useState(false);

  const balance = useMemo(
    () => +(START_BALANCE + history.reduce((s, h) => s + h.pnl, 0)).toFixed(2),
    [history],
  );

  // Load persisted trades on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) { setLoaded(true); return; }
      const { data, error } = await supabase
        .from("competition_trades")
        .select("id, code, side, lots, entry, exit, pnl, status, opened_at, closed_at")
        .eq("user_id", uid)
        .eq("competition_id", id)
        .order("opened_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        toast.error("تعذر تحميل الصفقات المحفوظة");
        setLoaded(true);
        return;
      }
      const open: Position[] = [];
      const closed: ClosedTrade[] = [];
      for (const r of data ?? []) {
        if (r.status === "open") {
          open.push({
            id: r.id,
            code: r.code,
            side: r.side as "buy" | "sell",
            lots: Number(r.lots),
            entry: Number(r.entry),
            ts: r.opened_at ? new Date(r.opened_at).getTime() : Date.now(),
          });
        } else {
          closed.push({
            id: r.id,
            code: r.code,
            side: r.side as "buy" | "sell",
            lots: Number(r.lots),
            entry: Number(r.entry),
            exit: Number(r.exit ?? 0),
            pnl: Number(r.pnl ?? 0),
            closedAt: r.closed_at ? new Date(r.closed_at).getTime() : Date.now(),
          });
        }
      }
      setPositions(open);
      setHistory(closed);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [id]);

  // Live price simulator — GBM step every 450ms
  useEffect(() => {
    const id = window.setInterval(() => {
      setPrices((prev) => {
        const next: PriceMap = {};
        for (const inst of INSTRUMENTS) {
          const t = prev[inst.code];
          const shock = Math.exp(inst.sigma * gauss() - 0.5 * inst.sigma * inst.sigma);
          const raw = t.price * shock;
          const price = +raw.toFixed(inst.digits);
          next[inst.code] = { price, open: t.open, prev: t.price };
        }
        return next;
      });
    }, 450);
    return () => window.clearInterval(id);
  }, []);

  const activeTick = prices[active.code];
  const bid = bidOf(active, activeTick.price);
  const ask = askOf(active, activeTick.price);
  const changeAbs = activeTick.price - activeTick.open;
  const changePct = (changeAbs / activeTick.open) * 100;

  const lots = Math.max(0, parseFloat(lotsInput) || 0);
  const previewMargin = marginUsd(
    { id: "_", code: active.code, side, lots, entry: side === "buy" ? ask : bid, ts: 0 },
    prices,
  );

  const openPnL = useMemo(
    () => positions.reduce((s, p) => s + pnlUsd(p, prices), 0),
    [positions, prices],
  );
  const usedMargin = useMemo(
    () => positions.reduce((s, p) => s + marginUsd(p, prices), 0),
    [positions, prices],
  );
  const equity = balance + openPnL;
  const freeMargin = equity - usedMargin;
  const marginLevel = usedMargin > 0 ? (equity / usedMargin) * 100 : 0;

  async function placeOrder() {
    if (lots <= 0) {
      toast.error("أدخل حجمًا صالحًا");
      return;
    }
    const entry = side === "buy" ? ask : bid;
    if (previewMargin > freeMargin) {
      toast.error("رأس مال حر غير كافٍ للهامش المطلوب");
      return;
    }
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) {
      toast.error("يجب تسجيل الدخول");
      return;
    }
    const { data, error } = await supabase
      .from("competition_trades")
      .insert({
        user_id: uid,
        competition_id: id,
        code: active.code,
        side,
        lots,
        entry,
        status: "open",
      })
      .select("id, opened_at")
      .single();
    if (error || !data) {
      toast.error("تعذر حفظ الصفقة");
      return;
    }
    const pos: Position = {
      id: data.id,
      code: active.code,
      side,
      lots,
      entry,
      ts: data.opened_at ? new Date(data.opened_at).getTime() : Date.now(),
    };
    setPositions((p) => [pos, ...p]);
    toast.success(
      `${side === "buy" ? "شراء" : "بيع"} ${lots} ${active.code} @ ${fmt(entry, active.digits)}`,
    );
  }

  async function closePosition(posId: string) {
    const p = positions.find((x) => x.id === posId);
    if (!p) return;
    const inst = INSTRUMENTS.find((i) => i.code === p.code)!;
    const cur = prices[p.code]?.price ?? inst.initial;
    const exit = p.side === "buy" ? bidOf(inst, cur) : askOf(inst, cur);
    const pnl = +pnlUsd(p, prices).toFixed(2);
    const closedAt = new Date();
    const { error } = await supabase
      .from("competition_trades")
      .update({
        status: "closed",
        exit,
        pnl,
        closed_at: closedAt.toISOString(),
      })
      .eq("id", posId);
    if (error) {
      toast.error("تعذر إغلاق الصفقة");
      return;
    }
    setPositions((prev) => prev.filter((x) => x.id !== posId));
    setHistory((prev) => [
      { id: posId, code: p.code, side: p.side, lots: p.lots, entry: p.entry, exit, pnl, closedAt: closedAt.getTime() },
      ...prev,
    ]);
    toast[pnl >= 0 ? "success" : "error"](
      `أُغلقت ${p.code} — ${pnl >= 0 ? "ربح" : "خسارة"} $${fmt(Math.abs(pnl))}`,
    );
  }

  const tvSrc =
    `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(active.tv)}` +
    `&interval=1&hidesidetoolbar=0&hidetoptoolbar=0&symboledit=1&saveimage=1&toolbarbg=0f172a` +
    `&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideas=1&locale=ar`;

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#050914] text-foreground" dir="rtl">
      {/* TOP BAR */}
      <header className="flex items-center justify-between gap-2 border-b border-white/5 bg-[#0a0f1e] px-3 py-2">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link to="/competitions"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="grid h-8 w-8 place-items-center rounded-full bg-white/5"><UserIcon className="h-4 w-4" /></div>
          <button className="grid h-8 w-8 place-items-center rounded-full bg-white/5"><Settings2 className="h-4 w-4" /></button>
          <button className="relative grid h-8 w-8 place-items-center rounded-full bg-white/5">
            <Bell className="h-4 w-4" />
            <span className="absolute -end-0.5 -top-0.5 h-2 w-2 rounded-full bg-orange-500" />
          </button>
        </div>
        <div className="hidden text-[11px] text-muted-foreground sm:block">
          مسابقة: <span className="text-foreground/80">{id}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5">
            <span className="font-mono tabular-nums font-semibold">${fmt(equity)}</span>
            <span className="rounded bg-orange-600/90 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-white">تجريبي</span>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="grid flex-1 min-h-0 grid-cols-[220px_minmax(0,1fr)_300px] gap-0">
        {/* ORDER PANEL */}
        <aside className="flex min-h-0 flex-col gap-3 overflow-y-auto border-l border-white/5 bg-[#0a0f1e] p-3">
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs">
            <span>وضع أمر بضغطة واحدة</span>
            <Switch checked={oneClick} onCheckedChange={setOneClick} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <PriceButton
              label="بيع"
              value={fmt(bid, active.digits)}
              tone="sell"
              flash={activeTick.price - activeTick.prev}
              active={side === "sell"}
              onClick={() => setSide("sell")}
            />
            <PriceButton
              label="شراء"
              value={fmt(ask, active.digits)}
              tone="buy"
              badge={active.spreadPips.toString()}
              flash={activeTick.price - activeTick.prev}
              active={side === "buy"}
              onClick={() => setSide("buy")}
            />
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-lg border border-white/5 bg-white/[0.03] p-1 text-xs">
            <button
              onClick={() => setQtyMode("lots")}
              className={`rounded-md py-1.5 ${qtyMode === "lots" ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}
            >العقود</button>
            <button
              onClick={() => setQtyMode("units")}
              className={`rounded-md py-1.5 ${qtyMode === "units" ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}
            >الكمية</button>
          </div>

          <label className="block rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>الكمية</span>
              <span>{qtyMode === "lots" ? "عقد/عقود" : "وحدة"}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLotsInput((v) => Math.max(0.01, +(parseFloat(v || "0") - 0.01).toFixed(2)).toString())}
                className="grid h-7 w-7 place-items-center rounded-md border border-white/10 hover:bg-white/5"
              >−</button>
              <Input
                value={lotsInput}
                onChange={(e) => setLotsInput(e.target.value)}
                inputMode="decimal"
                className="h-8 flex-1 border-0 bg-transparent p-0 text-center text-lg font-semibold tabular-nums focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => setLotsInput((v) => (+(parseFloat(v || "0") + 0.01).toFixed(2)).toString())}
                className="grid h-7 w-7 place-items-center rounded-md border border-white/10 hover:bg-white/5"
              >+</button>
            </div>
          </label>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">الهامش المطلوب</span>
            <span className="font-mono tabular-nums">${fmt(previewMargin)}</span>
          </div>
          <div className="h-1 overflow-hidden rounded bg-white/5">
            <div
              className="h-full bg-gold/70 transition-all"
              style={{ width: `${Math.min(100, freeMargin > 0 ? (previewMargin / freeMargin) * 100 : 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-muted-foreground">1/{LEVERAGE}</div>

          <div className="mt-1 flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs">
            <span>الشراء عندما يصل هذا السعر إلى</span>
            <Switch checked={priceAlert} onCheckedChange={setPriceAlert} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs">
            <span>TP/SL</span>
            <Switch checked={tpsl} onCheckedChange={setTpsl} />
          </div>

          <button
            onClick={placeOrder}
            className={`mt-2 rounded-lg py-3 text-center font-semibold text-white transition ${side === "buy" ? "bg-emerald-500 hover:bg-emerald-400" : "bg-red-500 hover:bg-red-400"}`}
          >
            <div className="flex items-center justify-between px-2">
              <ArrowUpRight className="h-4 w-4" />
              <div className="flex-1 text-center">
                <div className="text-[10px] opacity-80">وضع الأمر عند</div>
                <div className="font-mono tabular-nums">{fmt(side === "buy" ? ask : bid, active.digits)}</div>
              </div>
            </div>
          </button>
        </aside>

        {/* CHART + POSITIONS */}
        <main className="relative flex min-h-0 flex-col overflow-hidden bg-[#050914]">
          <div className="flex items-center justify-between border-b border-white/5 bg-[#0a0f1e] px-3 py-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1">1 دقيقة</span>
              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <LineChart className="h-3.5 w-3.5" /> مؤشرات
              </button>
              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <Layers className="h-3.5 w-3.5" /> fx
              </button>
              <button className="text-muted-foreground hover:text-foreground">حفظ</button>
              <button className="text-muted-foreground hover:text-foreground"><Camera className="h-3.5 w-3.5" /></button>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-mono tabular-nums ${changeAbs >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {changePct >= 0 ? "+" : ""}{changePct.toFixed(2)}% {changeAbs >= 0 ? "↑" : "↓"} {fmt(Math.abs(changeAbs), active.digits)}
              </span>
              <span className={`font-mono tabular-nums font-bold ${changeAbs >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {fmt(activeTick.price, active.digits)}
              </span>
              <span className="font-mono text-sm font-bold">{active.code}</span>
              <span className="text-lg">{active.flag}</span>
              <button className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"><Plus className="h-3.5 w-3.5" /></button>
              <button className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"><Maximize2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>

          <div className="relative flex-1 min-h-0">
            <iframe
              key={active.tv}
              src={tvSrc}
              className="absolute inset-0 h-full w-full border-0"
              title={`Chart ${active.code}`}
              allow="fullscreen"
            />
          </div>

          {/* Positions strip */}
          <div className="border-t border-white/5 bg-[#0a0f1e] max-h-[30%] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between border-b border-white/5 bg-[#0a0f1e] px-3 py-1.5 text-[11px]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setHistoryTab("open")}
                  className={`rounded-md px-2 py-0.5 font-semibold ${historyTab === "open" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  المفتوحة ({positions.length})
                </button>
                <button
                  onClick={() => setHistoryTab("history")}
                  className={`rounded-md px-2 py-0.5 font-semibold ${historyTab === "history" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  السجل ({history.length})
                </button>
              </div>
              {historyTab === "open" ? (
                <span className={`font-mono tabular-nums ${openPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  إجمالي: {openPnL >= 0 ? "+" : ""}${fmt(openPnL)}
                </span>
              ) : (
                <span className="font-mono tabular-nums text-muted-foreground">
                  صافي: ${fmt(history.reduce((s, h) => s + h.pnl, 0))}
                </span>
              )}
            </div>
            {!loaded ? (
              <div className="px-3 py-4 text-center text-[11px] text-muted-foreground">جارٍ التحميل…</div>
            ) : historyTab === "open" ? (
              positions.length === 0 ? (
              <div className="px-3 py-4 text-center text-[11px] text-muted-foreground">لا توجد صفقات مفتوحة</div>
            ) : (
              <table className="w-full text-[11px]">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-white/5">
                    <th className="px-3 py-1.5 text-right font-normal">الأداة</th>
                    <th className="px-3 py-1.5 text-right font-normal">الاتجاه</th>
                    <th className="px-3 py-1.5 text-right font-normal">اللوت</th>
                    <th className="px-3 py-1.5 text-right font-normal">الدخول</th>
                    <th className="px-3 py-1.5 text-right font-normal">الحالي</th>
                    <th className="px-3 py-1.5 text-right font-normal">P/L</th>
                    <th className="px-3 py-1.5 text-right font-normal">إغلاق</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p) => {
                    const inst = INSTRUMENTS.find((i) => i.code === p.code)!;
                    const cur = prices[p.code].price;
                    const exit = p.side === "buy" ? bidOf(inst, cur) : askOf(inst, cur);
                    const pl = pnlUsd(p, prices);
                    return (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                        <td className="px-3 py-1.5 font-semibold">{p.code}</td>
                        <td className={`px-3 py-1.5 ${p.side === "buy" ? "text-emerald-400" : "text-red-400"}`}>
                          {p.side === "buy" ? "شراء" : "بيع"}
                        </td>
                        <td className="px-3 py-1.5 font-mono tabular-nums">{p.lots}</td>
                        <td className="px-3 py-1.5 font-mono tabular-nums">{fmt(p.entry, inst.digits)}</td>
                        <td className="px-3 py-1.5 font-mono tabular-nums">{fmt(exit, inst.digits)}</td>
                        <td className={`px-3 py-1.5 font-mono tabular-nums ${pl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {pl >= 0 ? "+" : ""}${fmt(pl)}
                        </td>
                        <td className="px-3 py-1.5">
                          <button
                            onClick={() => closePosition(p.id)}
                            className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-400"
                          >
                            <XCircle className="h-3 w-3" /> إغلاق
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              )
            ) : history.length === 0 ? (
              <div className="px-3 py-4 text-center text-[11px] text-muted-foreground">لا يوجد سجل صفقات</div>
            ) : (
              <table className="w-full text-[11px]">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-white/5">
                    <th className="px-3 py-1.5 text-right font-normal">الأداة</th>
                    <th className="px-3 py-1.5 text-right font-normal">الاتجاه</th>
                    <th className="px-3 py-1.5 text-right font-normal">اللوت</th>
                    <th className="px-3 py-1.5 text-right font-normal">الدخول</th>
                    <th className="px-3 py-1.5 text-right font-normal">الإغلاق</th>
                    <th className="px-3 py-1.5 text-right font-normal">الربح/الخسارة</th>
                    <th className="px-3 py-1.5 text-right font-normal">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => {
                    const inst = INSTRUMENTS.find((i) => i.code === h.code);
                    const d = inst?.digits ?? 2;
                    return (
                      <tr key={h.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                        <td className="px-3 py-1.5 font-semibold">{h.code}</td>
                        <td className={`px-3 py-1.5 ${h.side === "buy" ? "text-emerald-400" : "text-red-400"}`}>
                          {h.side === "buy" ? "شراء" : "بيع"}
                        </td>
                        <td className="px-3 py-1.5 font-mono tabular-nums">{h.lots}</td>
                        <td className="px-3 py-1.5 font-mono tabular-nums">{fmt(h.entry, d)}</td>
                        <td className="px-3 py-1.5 font-mono tabular-nums">{fmt(h.exit, d)}</td>
                        <td className={`px-3 py-1.5 font-mono tabular-nums ${h.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {h.pnl >= 0 ? "+" : ""}${fmt(h.pnl)}
                        </td>
                        <td className="px-3 py-1.5 text-muted-foreground">
                          {new Date(h.closedAt).toLocaleString("ar", { hour12: false })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <footer className="grid grid-cols-2 gap-4 border-t border-white/5 bg-[#0a0f1e] px-3 py-1.5 text-[11px] text-muted-foreground sm:grid-cols-5">
            <span>الرصيد: <span className="font-mono tabular-nums text-foreground">${fmt(balance)}</span></span>
            <span>حقوق الملكية: <span className={`font-mono tabular-nums ${openPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}>${fmt(equity)}</span></span>
            <span>الهامش: <span className="font-mono tabular-nums text-foreground">${fmt(usedMargin)}</span></span>
            <span>الحر: <span className="font-mono tabular-nums text-foreground">${fmt(freeMargin)}</span></span>
            <span>مستوى الهامش: <span className="font-mono tabular-nums text-foreground">{usedMargin > 0 ? fmt(marginLevel) + "%" : "—"}</span></span>
          </footer>
        </main>

        {/* WATCHLIST */}
        <aside className={`flex min-h-0 flex-col overflow-hidden border-r border-white/5 bg-[#0a0f1e] transition-all ${watchOpen ? "" : "w-0 hidden"}`}>
          <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <Flame className="h-4 w-4 text-orange-400" />
              <span>الأكثر رواجًا</span>
              <button className="ms-1 text-muted-foreground hover:text-foreground"><Sparkles className="h-3.5 w-3.5" /></button>
            </div>
            <div className="flex items-center gap-1">
              <span className="mr-1 h-2 w-2 animate-pulse rounded-full bg-emerald-400" title="مباشر" />
              <button className="grid h-7 w-7 place-items-center rounded-md hover:bg-white/5"><Search className="h-3.5 w-3.5 text-muted-foreground" /></button>
              <button onClick={() => setWatchOpen(false)} className="grid h-7 w-7 place-items-center rounded-md hover:bg-white/5">
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {INSTRUMENTS.map((s) => {
              const t = prices[s.code];
              const pct = ((t.price - t.open) / t.open) * 100;
              const up = pct >= 0;
              const flash = t.price - t.prev;
              const isActive = s.code === active.code;
              return (
                <li key={s.code}>
                  <button
                    onClick={() => setActive(s)}
                    className={`flex w-full items-center justify-between gap-3 border-b border-white/5 px-3 py-2.5 text-right transition ${isActive ? "bg-white/[0.04]" : "hover:bg-white/[0.03]"}`}
                  >
                    <div className="text-lg leading-none">{s.flag}</div>
                    <div className="min-w-0 flex-1 text-right">
                      <div className="truncate text-sm font-semibold">{s.code}</div>
                      <div className="truncate text-[10px] text-muted-foreground">{s.name}</div>
                    </div>
                    <div className="text-left">
                      <FlashPrice value={fmt(t.price, s.digits)} flash={flash} />
                      <div className={`font-mono text-[10px] tabular-nums ${up ? "text-emerald-400" : "text-red-400"}`}>
                        {up ? "+" : ""}{pct.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-white/5 px-3 py-2 text-[10px] text-muted-foreground">
            <Clock className="me-1 inline h-3 w-3" /> السوق التجريبي — لا تترتب أي مخاطرة مالية.
          </div>
        </aside>
      </div>
    </div>
  );
}

function PriceButton({
  label, value, tone, badge, flash, active, onClick,
}: {
  label: string;
  value: string;
  tone: "buy" | "sell";
  badge?: string;
  flash: number;
  active: boolean;
  onClick: () => void;
}) {
  const activeCls = active
    ? tone === "buy"
      ? "bg-emerald-500/15 border-emerald-400/40"
      : "bg-red-500/15 border-red-400/40"
    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]";
  const priceCls = tone === "buy" ? "text-emerald-400" : "text-red-400";
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-left transition ${activeCls}`}
    >
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{label}</span>
        {badge && <span className="rounded bg-white/10 px-1 py-0.5 font-mono font-semibold text-foreground">{badge}</span>}
      </div>
      <div className={`font-mono font-bold tabular-nums leading-none ${priceCls}`}>
        <FlashPriceBase value={value} flash={flash} inheritColor render={renderPriceParts} />
      </div>
    </button>
  );
}

function FlashPrice({ value, flash, inheritColor = false }: { value: string; flash: number; inheritColor?: boolean }) {
  return <FlashPriceBase value={value} flash={flash} inheritColor={inheritColor} />;
}

function renderPriceParts(value: string) {
  const dot = value.indexOf(".");
  if (dot === -1) {
    return <span className="text-lg">{value}</span>;
  }
  const head = value.slice(0, dot);
  const frac = value.slice(dot + 1);
  // Split fractional: emphasize the first 2 (big pips), shrink the rest.
  const bigFrac = frac.slice(0, 2);
  const smallFrac = frac.slice(2);
  return (
    <span className="inline-flex items-baseline">
      <span className="text-sm opacity-75">{head}</span>
      <span className="mx-[1px] text-sm opacity-60">.</span>
      <span className="text-xl">{bigFrac}</span>
      {smallFrac && <span className="text-[10px] opacity-75">{smallFrac}</span>}
    </span>
  );
}

function FlashPriceBase({
  value,
  flash,
  inheritColor = false,
  render,
}: {
  value: string;
  flash: number;
  inheritColor?: boolean;
  render?: (v: string) => React.ReactNode;
}) {
  const [tone, setTone] = useState<"up" | "down" | null>(null);
  const lastRef = useRef(value);
  useEffect(() => {
    if (value === lastRef.current) return;
    lastRef.current = value;
    setTone(flash >= 0 ? "up" : "down");
    const t = window.setTimeout(() => setTone(null), 350);
    return () => window.clearTimeout(t);
  }, [value, flash]);
  const baseColor = inheritColor ? "" : tone === "up" ? "text-emerald-400" : tone === "down" ? "text-red-400" : "";
  const bg = tone === "up" ? "bg-emerald-400/10" : tone === "down" ? "bg-red-400/10" : "";
  return (
    <span className={`inline-block rounded px-1 font-mono tabular-nums transition-colors ${baseColor} ${bg}`}>
      {render ? render(value) : value}
    </span>
  );
}

// Static competition metadata for the entry gate. Values mirror the summary
// shown on /competitions and are safe to expose publicly.
const COMP_META: Record<string, { name: string; entryFee: number; prize: number; market: string; rules: string }> = {
  "fx-nov":        { name: "Forex Masters",         entryFee: 10, prize: 1000,  market: "فوركس",  rules: "أزواج العملات الكبرى — أسبوعان من التحدي." },
  "crypto-q3":     { name: "Crypto Cup",            entryFee: 20, prize: 2000,  market: "كريبتو", rules: "BTC / ETH وأشهر العملات الرقمية." },
  "gold-classic":  { name: "Gold Classic",          entryFee: 50, prize: 5000,  market: "معادن",   rules: "تداول الذهب والمعادن — سباق 10 أيام." },
  "indices-june":  { name: "Indices Championship",  entryFee: 100, prize: 10000, market: "مؤشرات", rules: "مؤشرات عالمية — سباق أسبوعي." },
};

function CompetitionEntryGate({ id, status }: { id: string; status: "loading" | "denied" }) {
  const meta = COMP_META[id];
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-6">
        <Link
          to="/competitions"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground hover:border-gold/40 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> رجوع للمسابقات
        </Link>
      </div>
      <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-8 backdrop-blur">
        {status === "loading" ? (
          <p className="text-center text-sm text-muted-foreground">جارٍ التحقق من مشاركتك…</p>
        ) : (
          <>
            <p className="font-mono text-[10px] uppercase tracking-widest text-gold">مسابقة</p>
            <h1 className="mt-1 font-display text-3xl font-semibold">{meta?.name ?? id}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              يجب الانضمام إلى المسابقة قبل الوصول إلى منصة التداول التجريبية.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">رسم الاشتراك</p>
                <p className="mt-1 font-mono text-lg tabular-nums">
                  {meta ? "$" + meta.entryFee : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">الجائزة</p>
                <p className="mt-1 font-mono text-lg tabular-nums text-emerald-400">
                  {meta ? "$" + meta.prize.toLocaleString("en-US") : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">السوق</p>
                <p className="mt-1 font-mono text-lg">{meta?.market ?? "—"}</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-muted-foreground">
              <p className="font-mono text-[10px] uppercase tracking-widest text-gold/80">القواعد</p>
              <p className="mt-1">{meta?.rules ?? "شروط وقواعد المسابقة تُعرض في صفحة المسابقات."}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/competitions"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2 text-sm font-semibold text-background hover:bg-[oklch(0.88_0.11_90)]"
              >
                انضم إلى المسابقة
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
