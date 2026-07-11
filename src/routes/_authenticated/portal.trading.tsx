import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
      { title: "منصة التداول — HK Investment Management" },
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

  return (
    <PortalShell fullscreen eyebrow="بوابة المتداول" title="منصة التداول" subtitle="بيانات حيّة وتنفيذ فوري">
      <div className="h-[calc(100vh-10rem)] min-h-[600px] w-full rounded-xl border border-white/10 bg-slate-950/60 overflow-hidden">
        <PanelGroup orientation="horizontal" className="flex h-full w-full">
          {/* LEFT: order ticket + account */}
          <Panel defaultSize={22} minSize={16}>
            <div className="flex h-full flex-col border-l border-white/10">
              <div className="px-3 py-2 border-b border-white/10 text-xs font-semibold text-white/70">أمر جديد</div>
              <div className="flex-1 overflow-y-auto">
                <OrderTicket instrument={selInst} bid={bid} ask={ask} balance={freeMargin > 0 ? freeMargin : balance} leverage={leverage} />
                <div className="px-3 pb-3 space-y-1 text-[11px]">
                  <div className="rounded-md border border-white/10 bg-white/[0.02] p-2 space-y-1">
                    <Row label="الرصيد" v={`$${balance.toFixed(2)}`} />
                    <Row label="حقوق الملكية" v={`$${equity.toFixed(2)}`} />
                    <Row label="الهامش المستخدم" v={`$${usedMargin.toFixed(2)}`} />
                    <Row label="الهامش الحر" v={`$${freeMargin.toFixed(2)}`} />
                    <Row label="مستوى الهامش" v={`${marginLevel.toFixed(1)}%`} />
                    <Row label="الربح العائم" v={`$${floating.toFixed(2)}`} vClass={floating >= 0 ? "text-emerald-400" : "text-red-400"} />
                    <Row label="الرافعة" v={`1:${leverage}`} />
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
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 flex-wrap">
                    <div className="font-semibold text-sm">{selected}</div>
                    <div className="flex gap-1 ml-2">
                      {TIMEFRAMES.map(t => (
                        <button key={t} onClick={() => setTf(t)}
                          className={cn("px-2 py-0.5 rounded text-[11px] border",
                            tf === t ? "border-amber-400/40 bg-amber-400/10 text-amber-200" : "border-white/10 text-white/60 hover:bg-white/[0.04]")}>{t}</button>
                      ))}
                    </div>
                    <div className="flex gap-1 mr-auto">
                      {CHART_TYPES.map(ct => (
                        <button key={ct.key} onClick={() => setChartType(ct.key)}
                          className={cn("px-2 py-0.5 rounded text-[11px] border",
                            chartType === ct.key ? "border-amber-400/40 bg-amber-400/10 text-amber-200" : "border-white/10 text-white/60 hover:bg-white/[0.04]")}>{ct.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    {selInst && <TerminalChart symbol={selected} timeframe={tf} chartType={chartType} precision={selInst.price_precision} positions={positions} />}
                  </div>
                </div>
              </Panel>
              <PanelResizeHandle className="h-px bg-white/10 hover:bg-amber-400/40 transition-colors" />
              <Panel defaultSize={35} minSize={15}>
                <Tabs defaultValue="positions" className="h-full flex flex-col">
                  <TabsList className="h-8 mx-2 mt-2 self-start">
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
                    {history.length === 0 ? <div className="text-center py-6 text-white/40">لا يوجد سجل بعد</div> :
                      <table className="w-full text-[11px]">
                        <thead className="text-white/50 text-right">
                          <tr><th className="px-2 py-2">الأداة</th><th className="px-2 py-2">الاتجاه</th><th className="px-2 py-2">الحجم</th><th className="px-2 py-2">الدخول</th><th className="px-2 py-2">الإغلاق</th><th className="px-2 py-2">الربح</th><th className="px-2 py-2">التاريخ</th></tr>
                        </thead>
                        <tbody>
                          {history.map(h => (
                            <tr key={h.id} className="border-t border-white/[0.04]">
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
              <div className="px-3 py-2 border-b border-white/10 text-xs font-semibold text-white/70">قائمة المتابعة</div>
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