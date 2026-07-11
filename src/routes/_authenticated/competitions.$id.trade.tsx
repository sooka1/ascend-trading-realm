import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowUpRight, Bell, Camera, Clock, Flame, Layers, LineChart,
  Maximize2, Plus, Search, Settings2, Sparkles, TrendingUp, User as UserIcon, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

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

type Symbol = {
  code: string;
  name: string;
  price: number;
  changePct: number;
  flag: string;
  tv: string; // TradingView symbol
};

const SYMBOLS: Symbol[] = [
  { code: "GOLD",     name: "Gold Spot",           price: 4119.52, changePct: -0.10, flag: "🥇", tv: "OANDA:XAUUSD" },
  { code: "BTCUSD",   name: "Bitcoin vs US Dollar",price: 64112.75,changePct:  0.46, flag: "₿",  tv: "BITSTAMP:BTCUSD" },
  { code: "USDJPY",   name: "USD / JPY",           price: 161.664, changePct: -0.42, flag: "🇺🇸", tv: "FX:USDJPY" },
  { code: "EURUSD",   name: "EUR / USD",           price: 1.14139, changePct: -0.13, flag: "🇪🇺", tv: "FX:EURUSD" },
  { code: "JP225Cash",name: "Nikkei 225",          price: 69219,   changePct:  0.44, flag: "🇯🇵", tv: "TVC:NI225" },
  { code: "US100Cash",name: "Nasdaq 100",          price: 29852.03,changePct:  0.48, flag: "🇺🇸", tv: "NASDAQ:NDX" },
  { code: "ETHUSD",   name: "Ethereum vs US Dollar",price:1792.26, changePct:  0.26, flag: "Ξ",  tv: "BITSTAMP:ETHUSD" },
  { code: "SILVER",   name: "Silver Spot",         price: 59.793,  changePct: -0.23, flag: "🥈", tv: "OANDA:XAGUSD" },
  { code: "GBPUSD",   name: "GBP / USD",           price: 1.33992, changePct:  0.05, flag: "🇬🇧", tv: "FX:GBPUSD" },
];

const fmt = (n: number, d = 2) => new Intl.NumberFormat("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);

function CompetitionTradePage() {
  const { id } = useParams({ from: "/_authenticated/competitions/$id/trade" });
  const [active, setActive] = useState<Symbol>(SYMBOLS[1]);
  const [qtyMode, setQtyMode] = useState<"lots" | "units">("lots");
  const [lots, setLots] = useState("0.01");
  const [oneClick, setOneClick] = useState(true);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [tpsl, setTpsl] = useState(false);
  const [priceAlert, setPriceAlert] = useState(false);
  const [watchOpen, setWatchOpen] = useState(true);
  const [balance] = useState(5114.91);

  // Fake tick to keep the sidebar prices alive.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setTick((x) => x + 1), 2500);
    return () => window.clearInterval(t);
  }, []);
  const list = useMemo(
    () =>
      SYMBOLS.map((s) => ({
        ...s,
        price: +(s.price * (1 + (Math.sin(tick + s.code.length) * 0.0003))).toFixed(s.price < 10 ? 5 : 2),
      })),
    [tick],
  );

  const spread = 50;
  const bid = +(active.price - spread * 0.01).toFixed(2);
  const ask = +(active.price + spread * 0.01).toFixed(2);
  const marginPct = 0.01;
  const requiredMargin = (parseFloat(lots) || 0) * 100 * marginPct;

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
            <span className="font-mono tabular-nums font-semibold">${fmt(balance)}</span>
            <span className="rounded bg-orange-600/90 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-white">تجريبي</span>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="grid flex-1 min-h-0 grid-cols-[220px_minmax(0,1fr)_300px] gap-0">
        {/* ORDER PANEL */}
        <aside className="flex min-h-0 flex-col gap-3 overflow-y-auto border-l border-white/5 bg-[#0a0f1e] p-3">
          {/* One-click */}
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs">
            <span>وضع أمر بضغطة واحدة</span>
            <Switch checked={oneClick} onCheckedChange={setOneClick} />
          </div>

          {/* Buy/Sell bid/ask */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSide("sell")}
              className={`rounded-lg px-3 py-2 text-left transition ${side === "sell" ? "bg-red-500/15 border border-red-400/40" : "border border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}
            >
              <div className="text-[10px] text-muted-foreground">بيع</div>
              <div className="font-mono text-base font-bold tabular-nums text-red-400">{fmt(bid)}</div>
            </button>
            <button
              onClick={() => setSide("buy")}
              className={`rounded-lg px-3 py-2 text-left transition ${side === "buy" ? "bg-emerald-500/15 border border-emerald-400/40" : "border border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}
            >
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>شراء</span>
                <span className="rounded bg-white/10 px-1 py-0.5 font-mono font-semibold text-foreground">{spread}</span>
              </div>
              <div className="font-mono text-base font-bold tabular-nums text-emerald-400">{fmt(ask)}</div>
            </button>
          </div>

          {/* Qty mode */}
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
            <Input
              value={lots}
              onChange={(e) => setLots(e.target.value)}
              inputMode="decimal"
              className="mt-1 h-8 border-0 bg-transparent p-0 text-lg font-semibold tabular-nums focus-visible:ring-0"
            />
          </label>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">الهامش المطلوب</span>
            <span className="font-mono tabular-nums">${fmt(requiredMargin)}</span>
          </div>
          <div className="h-1 overflow-hidden rounded bg-white/5">
            <div className="h-full bg-gold/70" style={{ width: `${Math.min(100, requiredMargin)}%` }} />
          </div>
          <div className="text-[10px] text-muted-foreground">{marginPct * 100}%</div>

          <div className="mt-1 flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs">
            <span>الشراء عندما يصل هذا السعر إلى</span>
            <Switch checked={priceAlert} onCheckedChange={setPriceAlert} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs">
            <span>TP/SL</span>
            <Switch checked={tpsl} onCheckedChange={setTpsl} />
          </div>

          <button
            className={`mt-2 rounded-lg py-3 text-center font-semibold text-white transition ${side === "buy" ? "bg-emerald-500 hover:bg-emerald-400" : "bg-red-500 hover:bg-red-400"}`}
            onClick={() =>
              alert(`تم إرسال أمر تجريبي — ${side === "buy" ? "شراء" : "بيع"} ${lots} ${active.code} @ ${side === "buy" ? ask : bid}`)
            }
          >
            <div className="flex items-center justify-between px-2">
              <ArrowUpRight className="h-4 w-4" />
              <div className="flex-1 text-center">
                <div className="text-[10px] opacity-80">وضع الأمر عند</div>
                <div className="font-mono tabular-nums">{fmt(side === "buy" ? ask : bid)}</div>
              </div>
            </div>
          </button>
        </aside>

        {/* CHART */}
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
              <span className="text-muted-foreground">10 ساعة</span>
              <span className="font-mono tabular-nums text-red-400">-0.20% ↓ -128.10</span>
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

          <footer className="grid grid-cols-2 gap-4 border-t border-white/5 bg-[#0a0f1e] px-3 py-1.5 text-[11px] text-muted-foreground sm:grid-cols-4">
            <span>الرصيد: <span className="font-mono tabular-nums text-foreground">${fmt(balance)}</span></span>
            <span>رأس المال الحر: <span className="font-mono tabular-nums text-foreground">${fmt(balance)}</span></span>
            <span>الهامش: <span className="font-mono tabular-nums text-foreground">-</span></span>
            <span>مستوى الهامش: <span className="font-mono tabular-nums text-foreground">-</span></span>
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
              <button className="grid h-7 w-7 place-items-center rounded-md hover:bg-white/5"><Search className="h-3.5 w-3.5 text-muted-foreground" /></button>
              <button
                onClick={() => setWatchOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-md hover:bg-white/5"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {list.map((s) => {
              const up = s.changePct >= 0;
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
                      <div className="font-mono text-sm font-semibold tabular-nums">{fmt(s.price, s.price < 10 ? 5 : 2)}</div>
                      <div className={`font-mono text-[10px] tabular-nums ${up ? "text-emerald-400" : "text-red-400"}`}>
                        {up ? "+" : ""}{s.changePct.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-white/5 px-3 py-2 text-[10px] text-muted-foreground">
            <Clock className="me-1 inline h-3 w-3" /> السوق التجريبي — لا يترتب على الصفقات أي مخاطرة مالية.
          </div>
        </aside>
      </div>
    </div>
  );
}
