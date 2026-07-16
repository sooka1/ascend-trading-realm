import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PortalShell } from "@/components/portal-shell";
import { TerminalChart } from "@/features/terminal/components/Chart";
import { OrderTicket } from "@/features/terminal/components/OrderTicket";
import { Watchlist } from "@/features/terminal/components/Watchlist";
import { PositionsTable } from "@/features/terminal/components/PositionsTable";
import { PriceAlerts } from "@/features/terminal/components/PriceAlerts";
import { EconomicCalendar } from "@/features/terminal/components/EconomicCalendar";
import { PerformancePanel } from "@/features/terminal/components/PerformancePanel";
import { useAccount, useHistory, useInstruments, usePendingOrders, usePositions, useQuotes, useWatchlist } from "@/features/terminal/hooks/use-terminal-data";
import type { Timeframe } from "@/features/terminal/adapters/market-data/types";

export const Route = createFileRoute("/_authenticated/portal/trading")({
  head: () => ({
    meta: [
      { title: "منصة التداول — HKEX Invest" },
      { name: "description", content: "محطة تداول احترافية بأسعار حية وتنفيذ فوري." },
    ],
  }),
  component: TradingTerminal,
});

const TIMEFRAMES: Timeframe[] = ["1m","5m","15m","30m","1h","4h","1d","1w","1M"];
const CHART_TYPES = [
  { key: "candles", label: "شموع" },
  { key: "line", label: "خط" },
  { key: "area", label: "منطقة" },
  { key: "bars", label: "أعمدة" },
] as const;
type ChartType = typeof CHART_TYPES[number]["key"];

function TradingTerminal() {
  const { data: instruments = [] } = useInstruments();
  const { data: watchSymbols = [] } = useWatchlist();
  const { data: account } = useAccount();
  const { data: positions = [] } = usePositions();
  const { data: pending = [] } = usePendingOrders();
  const { data: history = [] } = useHistory();

  const [selected, setSelected] = useState("XAUUSD");
  const [tf, setTf] = useState<Timeframe>("15m");
  const [chartType, setChartType] = useState<ChartType>("candles");
  const [histSide, setHistSide] = useState<"all" | "buy" | "sell">(() => {
    try {
      const v = typeof window !== "undefined" ? window.localStorage.getItem("hk.hist.side") : null;
      return v === "buy" || v === "sell" || v === "all" ? v : "all";
    } catch { return "all"; }
  });
  const [histResult, setHistResult] = useState<"all" | "win" | "loss">(() => {
    try {
      const v = typeof window !== "undefined" ? window.localStorage.getItem("hk.hist.result") : null;
      return v === "win" || v === "loss" || v === "all" ? v : "all";
    } catch { return "all"; }
  });
  useEffect(() => { try { window.localStorage.setItem("hk.hist.side", histSide); } catch { /* noop */ } }, [histSide]);
  useEffect(() => { try { window.localStorage.setItem("hk.hist.result", histResult); } catch { /* noop */ } }, [histResult]);
  const [focusedHistoryId, setFocusedHistoryId] = useState<string | null>(null);

  const allSymbols = useMemo(() => Array.from(new Set([...watchSymbols, selected, ...positions.map(p => p.symbol)])), [watchSymbols, selected, positions]);
  const quotes = useQuotes(allSymbols);
  const contractSizes = useMemo(() => Object.fromEntries(instruments.map(i => [i.symbol, i.contract_size])), [instruments]);

  const selInst = instruments.find(i => i.symbol === selected);
  const selQ = quotes[selected];
  const bid = selQ?.bid ?? 0, ask = selQ?.ask ?? 0;

  const shownInstruments = useMemo(() => {
    const set = new Set(watchSymbols);
    return instruments.filter(i => set.has(i.symbol) || instruments.length < 15);
  }, [instruments, watchSymbols]);

  // account metrics
  const balance = Number(account?.balance ?? 0);
  const leverage = Number(account?.leverage ?? 100);
  const floating = useMemo(() => positions.reduce((sum, p) => {
    const q = quotes[p.symbol]; if (!q) return sum;
    const mp = p.side === "buy" ? q.bid : q.ask;
    const cs = contractSizes[p.symbol] ?? 1;
    return sum + (mp - Number(p.entry_price)) * (p.side === "buy" ? 1 : -1) * Number(p.volume) * cs;
  }, 0), [positions, quotes, contractSizes]);
  const usedMargin = useMemo(() => positions.reduce((sum, p) => {
    const cs = contractSizes[p.symbol] ?? 1;
    return sum + (Number(p.entry_price) * Number(p.volume) * cs) / leverage;
  }, 0), [positions, contractSizes, leverage]);
  const equity = balance + floating;
  const freeMargin = equity - usedMargin;
  const marginLevel = usedMargin > 0 ? (equity / usedMargin) * 100 : 0;
  const realized = useMemo(
    () => history.reduce((s, h) => s + Number(h.profit ?? 0), 0),
    [history],
  );
  const totalPnl = realized + floating;

  const filteredHistory = useMemo(() => history.filter(h => {
    if (histSide !== "all" && h.side !== histSide) return false;
    const p = Number(h.profit ?? 0);
    if (histResult === "win" && !(p >= 0)) return false;
    if (histResult === "loss" && !(p < 0)) return false;
    return true;
  }), [history, histSide, histResult]);
  const focusedTrade = useMemo(
    () => history.find(h => h.id === focusedHistoryId) ?? null,
    [history, focusedHistoryId],
  );

  return (
    <PortalShell fullscreen eyebrow="بوابة المتداول" title="منصة التداول" subtitle="بيانات حيّة وتنفيذ فوري">
      <div className="h-[calc(100vh-10rem)] min-h-[600px] w-full rounded-lg border border-[#2a2e39] bg-[#131722] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] overflow-hidden">
        <PanelGroup orientation="horizontal" className="flex h-full w-full">
          {/* LEFT: order ticket + account */}
          <Panel defaultSize={22} minSize={16}>
            <div className="flex h-full flex-col border-l border-[#2a2e39] bg-[#131722]">
              <div className="px-3 py-2 border-b border-[#2a2e39] bg-[#1e222d]/40 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">أمر جديد</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                  LIVE
                </span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <OrderTicket instrument={selInst} bid={bid} ask={ask} balance={freeMargin > 0 ? freeMargin : balance} leverage={leverage} />
                <div className="px-3 pb-3 space-y-1 text-[11px]">
                  <div className="rounded-md border border-[#2a2e39] bg-[#1e222d] p-2.5 space-y-1 shadow-inner shadow-black/50">
                    <div className="mb-1 flex items-center justify-between border-b border-[#2a2e39] pb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">ملخّص الحساب</span>
                      <span className="font-mono text-[10px] text-[#d4af37]">1:{leverage}</span>
                    </div>
                    <Row label="الرصيد" v={`$${balance.toFixed(2)}`} />
                    <Row label="حقوق الملكية" v={`$${equity.toFixed(2)}`} />
                    <Row label="الهامش المستخدم" v={`$${usedMargin.toFixed(2)}`} />
                    <Row label="الهامش الحر" v={`$${freeMargin.toFixed(2)}`} />
                    <Row label="مستوى الهامش" v={`${marginLevel.toFixed(1)}%`} />
                    <Row label="الربح العائم" v={`$${floating.toFixed(2)}`} vClass={floating >= 0 ? "text-emerald-500" : "text-rose-500"} />
                    <Row label="ربح محقق" v={`$${realized.toFixed(2)}`} vClass={realized >= 0 ? "text-emerald-500" : "text-rose-500"} />
                    <Row label="الإجمالي (محقق + عائم)" v={`$${totalPnl.toFixed(2)}`} vClass={totalPnl >= 0 ? "text-emerald-500" : "text-rose-500"} />
                  </div>
                </div>
              </div>
            </div>
          </Panel>
          <PanelResizeHandle className="w-px bg-white/10 hover:bg-amber-400/40 transition-colors" />

          {/* CENTER: chart + bottom tabs */}
          <Panel defaultSize={56} minSize={30}>
            <PanelGroup orientation="vertical" className="flex h-full w-full flex-col">
              <Panel defaultSize={65} minSize={30}>
                <div className="flex h-full flex-col">
                  <div className="flex items-center gap-3 px-3 py-2 border-b border-[#2a2e39] bg-[#131722] flex-wrap">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold tracking-wide text-[#d4af37]">{selected}</span>
                      <span
                        title="سوق OTC خاص بالمنصة — الأسعار تتبع حركة السوق العالمي"
                        className="inline-flex items-center gap-1 rounded-full border border-[#d4af37]/50 bg-[#d4af37]/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-[#d4af37]"
                      >OTC</span>
                    </div>
                    {selQ && (
                      <HeaderPrice
                        last={selQ.last ?? 0}
                        precision={selInst?.price_precision ?? 2}
                        changePct={selQ.changePct24h}
                      />
                    )}
                    <div className="hidden md:flex items-center gap-3 text-[10px] font-mono tabular-nums text-white/60 border-r border-[#2a2e39] pr-3 mr-1" dir="ltr">
                      <span><span className="text-white/40">B </span><span className="text-rose-500">{bid.toFixed(selInst?.price_precision ?? 2)}</span></span>
                      <span><span className="text-white/40">A </span><span className="text-emerald-500">{ask.toFixed(selInst?.price_precision ?? 2)}</span></span>
                      {selInst && <span><span className="text-white/40">S </span>{((ask - bid) / (selInst.pip_size || 1)).toFixed(1)}</span>}
                    </div>
                    <div className="flex gap-1 mr-auto">
                      {TIMEFRAMES.map(t => (
                        <button key={t} onClick={() => setTf(t)}
                          className={cn("px-2 py-0.5 rounded text-[11px] border font-mono tabular-nums transition-colors",
                            tf === t
                              ? "border-[#d4af37]/60 bg-[#d4af37]/10 text-[#d4af37] shadow-[0_0_10px_-4px_rgba(212,175,55,0.7)]"
                              : "border-[#2a2e39] text-white/60 hover:bg-[#1e222d] hover:text-white/85")}>{t}</button>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      {CHART_TYPES.map(ct => (
                        <button key={ct.key} onClick={() => setChartType(ct.key)}
                          className={cn("px-2 py-0.5 rounded text-[11px] border transition-colors",
                            chartType === ct.key
                              ? "border-[#d4af37]/60 bg-[#d4af37]/10 text-[#d4af37]"
                              : "border-[#2a2e39] text-white/60 hover:bg-[#1e222d] hover:text-white/85")}>{ct.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    {selInst && <TerminalChart symbol={selected} timeframe={tf} chartType={chartType} precision={selInst.price_precision} positions={positions} bid={bid} ask={ask} contractSize={selInst.contract_size} focusedTrade={focusedTrade ? { id: focusedTrade.id, symbol: focusedTrade.symbol, side: focusedTrade.side as "buy"|"sell", entry_price: focusedTrade.entry_price, close_price: focusedTrade.close_price, profit: focusedTrade.profit } : null} />}
                  </div>
                </div>
              </Panel>
              <PanelResizeHandle className="h-px bg-white/10 hover:bg-amber-400/40 transition-colors" />
              <Panel defaultSize={35} minSize={15}>
                <Tabs defaultValue="positions" className="h-full flex flex-col">
                  <TabsList className="h-8 mx-2 mt-2 self-start bg-white/[0.03] border border-white/10">
                    <TabsTrigger value="positions" className="text-xs">الصفقات ({positions.length})</TabsTrigger>
                    <TabsTrigger value="pending" className="text-xs">المعلّقة ({pending.length})</TabsTrigger>
                    <TabsTrigger value="history" className="text-xs">السجل</TabsTrigger>
                    <TabsTrigger value="alerts" className="text-xs">التنبيهات</TabsTrigger>
                    <TabsTrigger value="calendar" className="text-xs">الأجندة</TabsTrigger>
                    <TabsTrigger value="performance" className="text-xs">الأداء</TabsTrigger>
                  </TabsList>
                  <TabsContent value="positions" className="flex-1 mt-0 overflow-hidden">
                    <PositionsTable positions={positions} quotes={quotes} contractSizes={contractSizes} />
                  </TabsContent>
                  <TabsContent value="pending" className="flex-1 mt-0 overflow-auto p-2 text-xs">
                    {pending.length === 0 ? <div className="text-center py-6 text-white/40">لا توجد أوامر معلّقة</div> :
                      <table className="w-full text-[11px]">
                        <thead className="text-white/50 text-right">
                          <tr><th className="px-2 py-2">الأداة</th><th className="px-2 py-2">النوع</th><th className="px-2 py-2">الاتجاه</th><th className="px-2 py-2">الحجم</th><th className="px-2 py-2">السعر</th><th></th></tr>
                        </thead>
                        <tbody>
                          {pending.map(o => (
                            <tr key={o.id} className="border-t border-white/[0.04]">
                              <td className="px-2 py-2">{o.symbol}</td>
                              <td className="px-2 py-2 uppercase">{o.order_type}</td>
                              <td className={`px-2 py-2 ${o.side === "buy" ? "text-emerald-400" : "text-red-400"}`}>{o.side}</td>
                              <td className="px-2 py-2 font-mono">{o.volume}</td>
                              <td className="px-2 py-2 font-mono">{o.price ?? "—"}</td>
                              <td className="px-2 py-2 text-left"><Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={async () => { const { getBroker } = await import("@/features/terminal/adapters/broker"); await getBroker().cancelOrder(o.id); }}>إلغاء</Button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    }
                  </TabsContent>
                  <TabsContent value="history" className="flex-1 mt-0 overflow-auto p-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2 mb-2 px-1">
                      <span className="text-white/50">النوع:</span>
                      {(["all","buy","sell"] as const).map(v => (
                        <button key={v} onClick={() => setHistSide(v)}
                          className={cn("px-2 py-0.5 rounded border text-[10px]",
                            histSide === v ? "border-amber-400/40 bg-amber-400/10 text-amber-200" : "border-white/10 text-white/60 hover:bg-white/[0.04]")}>
                          {v === "all" ? "الكل" : v === "buy" ? "شراء" : "بيع"}
                        </button>
                      ))}
                      <span className="text-white/50 ms-2">النتيجة:</span>
                      {(["all","win","loss"] as const).map(v => (
                        <button key={v} onClick={() => setHistResult(v)}
                          className={cn("px-2 py-0.5 rounded border text-[10px]",
                            histResult === v ? "border-amber-400/40 bg-amber-400/10 text-amber-200" : "border-white/10 text-white/60 hover:bg-white/[0.04]")}>
                          {v === "all" ? "الكل" : v === "win" ? "رابحة" : "خاسرة"}
                        </button>
                      ))}
                      {focusedHistoryId && (
                        <button onClick={() => setFocusedHistoryId(null)}
                          className="ms-auto px-2 py-0.5 rounded border border-white/10 text-[10px] text-white/60 hover:bg-white/[0.04]">
                          إلغاء التمييز
                        </button>
                      )}
                    </div>
                    {filteredHistory.length === 0 ? <div className="text-center py-6 text-white/40">لا يوجد سجل مطابق</div> :
                      <table className="w-full text-[11px]">
                        <thead className="text-white/50 text-right">
                          <tr><th className="px-2 py-2">الأداة</th><th className="px-2 py-2">الاتجاه</th><th className="px-2 py-2">الحجم</th><th className="px-2 py-2">الدخول</th><th className="px-2 py-2">الإغلاق</th><th className="px-2 py-2">الربح</th><th className="px-2 py-2">التاريخ</th></tr>
                        </thead>
                        <tbody>
                          {filteredHistory.map(h => (
                            <tr key={h.id}
                              onClick={() => { setSelected(h.symbol); setFocusedHistoryId(focusedHistoryId === h.id ? null : h.id); }}
                              className={cn("border-t border-white/[0.04] cursor-pointer hover:bg-white/[0.03]",
                                focusedHistoryId === h.id && "bg-amber-400/[0.08]")}>
                              <td className="px-2 py-2">{h.symbol}</td>
                              <td className={`px-2 py-2 ${h.side === "buy" ? "text-emerald-400" : "text-red-400"}`}>{h.side}</td>
                              <td className="px-2 py-2 font-mono">{Number(h.volume).toFixed(2)}</td>
                              <td className="px-2 py-2 font-mono">{Number(h.entry_price).toFixed(4)}</td>
                              <td className="px-2 py-2 font-mono">{Number(h.close_price).toFixed(4)}</td>
                              <td className={`px-2 py-2 font-mono ${Number(h.profit) >= 0 ? "text-emerald-400" : "text-red-400"}`}>${Number(h.profit).toFixed(2)}</td>
                              <td className="px-2 py-2 text-white/50">{new Date(h.closed_at).toLocaleString("ar-EG")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    }
                  </TabsContent>
                  <TabsContent value="alerts" className="flex-1 mt-0 overflow-hidden">
                    <PriceAlerts selectedSymbol={selected} quotes={quotes} />
                  </TabsContent>
                  <TabsContent value="calendar" className="flex-1 mt-0 overflow-hidden">
                    <EconomicCalendar />
                  </TabsContent>
                  <TabsContent value="performance" className="flex-1 mt-0 overflow-hidden">
                    <PerformancePanel history={history} />
                  </TabsContent>
                </Tabs>
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle className="w-px bg-white/10 hover:bg-amber-400/40 transition-colors" />

          {/* RIGHT: watchlist */}
          <Panel defaultSize={22} minSize={16}>
            <div className="flex h-full flex-col border-r border-white/10">
              <div className="px-3 py-2 border-b border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">قائمة المتابعة</span>
                <span className="font-mono text-[10px] text-white/40 tabular-nums">{shownInstruments.length || instruments.length}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <Watchlist instruments={shownInstruments.length ? shownInstruments : instruments} quotes={quotes} selected={selected} onSelect={setSelected} />
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </PortalShell>
  );
}

function Row({ label, v, vClass }: { label: string; v: string; vClass?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/50">{label}</span>
      <span className={`font-mono ${vClass ?? "text-white/90"}`}>{v}</span>
    </div>
  );
}