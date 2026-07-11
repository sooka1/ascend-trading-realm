import { useEffect, useRef, useState, useCallback } from "react";
import { CandlestickSeries, LineSeries, AreaSeries, BarSeries, createChart } from "lightweight-charts";
import type { IChartApi, ISeriesApi, Time } from "lightweight-charts";
import { getMarketDataProvider } from "../adapters/market-data";
import type { Candle, Timeframe } from "../adapters/market-data/types";
import { Minus, Slash, Square, TrendingUp, Trash2, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";

type DrawTool = "none" | "trend" | "hline" | "rect" | "fib";
type Anchor = { time: number; price: number };
type Drawing =
  | { id: string; type: "trend"; a: Anchor; b: Anchor }
  | { id: string; type: "rect"; a: Anchor; b: Anchor }
  | { id: string; type: "fib"; a: Anchor; b: Anchor }
  | { id: string; type: "hline"; price: number };

const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
const FIB_COLORS = ["#94a3b8", "#f59e0b", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#94a3b8"];

type ChartType = "candles" | "line" | "area" | "bars";

function heikinAshi(src: Candle[]): Candle[] {
  const out: Candle[] = [];
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const prev = out[i - 1];
    const close = (c.open + c.high + c.low + c.close) / 4;
    const open = prev ? (prev.open + prev.close) / 2 : (c.open + c.close) / 2;
    const high = Math.max(c.high, open, close);
    const low = Math.min(c.low, open, close);
    out.push({ time: c.time, open, high, low, close, volume: c.volume });
  }
  return out;
}

export function TerminalChart({ symbol, timeframe, chartType, precision }: { symbol: string; timeframe: Timeframe; chartType: ChartType; precision: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Bar"> | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [tool, setTool] = useState<DrawTool>("none");
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [pending, setPending] = useState<Anchor | null>(null);
  const [hover, setHover] = useState<Anchor | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      layout: { background: { color: "transparent" }, textColor: "#c9d1d9", fontFamily: "inherit" },
      localization: { locale: "en-US" },
      grid: { vertLines: { color: "rgba(255,255,255,0.04)" }, horzLines: { color: "rgba(255,255,255,0.04)" } },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
      timeScale: { borderColor: "rgba(255,255,255,0.08)", timeVisible: true, secondsVisible: false },
      crosshair: { mode: 1 },
      autoSize: true,
    });
    chartRef.current = chart;
    return () => { chart.remove(); chartRef.current = null; seriesRef.current = null; };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    if (seriesRef.current) { chart.removeSeries(seriesRef.current); seriesRef.current = null; }
    const opts = { priceFormat: { type: "price" as const, precision, minMove: Math.pow(10, -precision) } };
    let series: ISeriesApi<"Candlestick"> | ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Bar">;
    if (chartType === "line") series = chart.addSeries(LineSeries, { ...opts, color: "#F5C542", lineWidth: 2 });
    else if (chartType === "area") series = chart.addSeries(AreaSeries, { ...opts, lineColor: "#F5C542", topColor: "rgba(245,197,66,0.35)", bottomColor: "rgba(245,197,66,0)" });
    else if (chartType === "bars") series = chart.addSeries(BarSeries, { ...opts, upColor: "#22c55e", downColor: "#ef4444" });
    else series = chart.addSeries(CandlestickSeries, { ...opts, upColor: "#22c55e", downColor: "#ef4444", borderVisible: false, wickUpColor: "#22c55e", wickDownColor: "#ef4444" });
    seriesRef.current = series;

    let disposed = false;
    let candles: Candle[] = [];
    const provider = getMarketDataProvider();
    (async () => {
      const raw = await provider.getCandles(symbol, timeframe, 400);
      if (disposed) return;
      candles = raw;
      const view = chartType === "line" || chartType === "area"
        ? raw.map((c) => ({ time: c.time as Time, value: c.close }))
        : raw.map((c) => ({ time: c.time as Time, open: c.open, high: c.high, low: c.low, close: c.close }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (series as any).setData(view);
      chart.timeScale().fitContent();
    })();

    const unsub = provider.onCandle(symbol, timeframe, (c) => {
      if (disposed) return;
      const last = candles[candles.length - 1];
      if (last && last.time === c.time) {
        last.close = c.close;
        last.high = Math.max(last.high, c.close);
        last.low = Math.min(last.low, c.close);
      } else {
        const prev = candles[candles.length - 1];
        candles.push({ time: c.time, open: prev?.close ?? c.close, high: c.close, low: c.close, close: c.close });
      }
      const bar = candles[candles.length - 1];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (series as any).update(
        chartType === "line" || chartType === "area"
          ? { time: bar.time as Time, value: bar.close }
          : { time: bar.time as Time, open: bar.open, high: bar.high, low: bar.low, close: bar.close }
      );
    });

    return () => { disposed = true; unsub(); };
  }, [symbol, timeframe, chartType, precision]);

  // heikin-ashi placeholder (kept for future use)
  void heikinAshi;

  // Redraw overlay via rAF while mounted so drawings track pan/zoom.
  const [, forceTick] = useState(0);
  useEffect(() => {
    let raf = 0;
    const loop = () => { forceTick((n) => (n + 1) & 0xffff); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const posFromEvent = useCallback((e: React.MouseEvent): Anchor | null => {
    const chart = chartRef.current, series = seriesRef.current, host = ref.current;
    if (!chart || !series || !host) return null;
    const rect = host.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const time = chart.timeScale().coordinateToTime(x);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const price = (series as any).coordinateToPrice(y);
    if (time == null || price == null) return null;
    return { time: Number(time), price: Number(price) };
  }, []);

  const onOverlayClick = (e: React.MouseEvent) => {
    if (tool === "none") return;
    const p = posFromEvent(e);
    if (!p) return;
    const id = Math.random().toString(36).slice(2);
    if (tool === "hline") {
      setDrawings((d) => [...d, { id, type: "hline", price: p.price }]);
      return;
    }
    if (!pending) { setPending(p); return; }
    setDrawings((d) => [...d, { id, type: tool as "trend" | "rect" | "fib", a: pending, b: p }]);
    setPending(null);
  };

  const project = (a: Anchor): { x: number; y: number } | null => {
    const chart = chartRef.current, series = seriesRef.current;
    if (!chart || !series) return null;
    const x = chart.timeScale().timeToCoordinate(a.time as unknown as Time);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const y = (series as any).priceToCoordinate(a.price);
    if (x == null || y == null) return null;
    return { x: Number(x), y: Number(y) };
  };
  const priceY = (price: number): number | null => {
    const series = seriesRef.current;
    if (!series) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const y = (series as any).priceToCoordinate(price);
    return y == null ? null : Number(y);
  };

  const width = ref.current?.clientWidth ?? 0;
  const height = ref.current?.clientHeight ?? 0;

  const tools: { id: DrawTool; icon: typeof Minus; label: string }[] = [
    { id: "none", icon: MousePointer2, label: "تحديد" },
    { id: "trend", icon: Slash, label: "خط اتجاه" },
    { id: "hline", icon: Minus, label: "خط أفقي" },
    { id: "rect", icon: Square, label: "مستطيل" },
    { id: "fib", icon: TrendingUp, label: "فيبوناتشي" },
  ];

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      <div ref={ref} className="h-full w-full" />
      <svg
        ref={svgRef}
        className={cn("pointer-events-none absolute inset-0", tool !== "none" && "pointer-events-auto cursor-crosshair")}
        onClick={onOverlayClick}
        onMouseMove={(e) => tool !== "none" && setHover(posFromEvent(e))}
        onMouseLeave={() => setHover(null)}
      >
        {drawings.map((d) => {
          if (d.type === "hline") {
            const y = priceY(d.price);
            if (y == null) return null;
            return (
              <g key={d.id}>
                <line x1={0} x2={width} y1={y} y2={y} stroke="#F5C542" strokeWidth={1.25} strokeDasharray="4 3" />
                <text x={6} y={y - 4} fill="#F5C542" fontSize={11}>{d.price.toFixed(precision)}</text>
              </g>
            );
          }
          const pa = project(d.a); const pb = project(d.b);
          if (!pa || !pb) return null;
          if (d.type === "trend") return <line key={d.id} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#60a5fa" strokeWidth={1.5} />;
          if (d.type === "rect") {
            const x = Math.min(pa.x, pb.x), y = Math.min(pa.y, pb.y);
            const w = Math.abs(pb.x - pa.x), h = Math.abs(pb.y - pa.y);
            return <rect key={d.id} x={x} y={y} width={w} height={h} fill="rgba(96,165,250,0.12)" stroke="#60a5fa" strokeWidth={1} />;
          }
          // fib
          const x1 = Math.min(pa.x, pb.x), x2 = Math.max(pa.x, pb.x);
          return (
            <g key={d.id}>
              {FIB_LEVELS.map((lvl, i) => {
                const price = d.a.price + (d.b.price - d.a.price) * (1 - lvl);
                const y = priceY(price);
                if (y == null) return null;
                return (
                  <g key={lvl}>
                    <line x1={x1} x2={width} y1={y} y2={y} stroke={FIB_COLORS[i]} strokeWidth={1} strokeOpacity={0.8} strokeDasharray="3 3" />
                    <text x={x2 + 4} y={y - 2} fill={FIB_COLORS[i]} fontSize={10}>{lvl.toFixed(3)} · {price.toFixed(precision)}</text>
                  </g>
                );
              })}
              <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#94a3b8" strokeWidth={1} strokeDasharray="2 2" />
            </g>
          );
        })}
        {pending && hover && tool !== "none" && tool !== "hline" && (() => {
          const pa = project(pending); const pb = project(hover);
          if (!pa || !pb) return null;
          if (tool === "rect") {
            const x = Math.min(pa.x, pb.x), y = Math.min(pa.y, pb.y);
            return <rect x={x} y={y} width={Math.abs(pb.x - pa.x)} height={Math.abs(pb.y - pa.y)} fill="rgba(245,197,66,0.1)" stroke="#F5C542" strokeDasharray="3 3" />;
          }
          return <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#F5C542" strokeDasharray="3 3" />;
        })()}
        {tool === "hline" && hover && (() => {
          const y = priceY(hover.price);
          if (y == null) return null;
          return <line x1={0} x2={width} y1={y} y2={y} stroke="#F5C542" strokeDasharray="3 3" strokeOpacity={0.6} />;
        })()}
        {void height}
      </svg>
      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1 rounded-md border border-white/10 bg-black/60 p-1 backdrop-blur">
        {tools.map((t) => {
          const Icon = t.icon;
          const active = tool === t.id;
          return (
            <button
              key={t.id}
              type="button"
              title={t.label}
              onClick={() => { setTool(t.id); setPending(null); }}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded text-white/70 transition hover:bg-white/10 hover:text-white",
                active && "bg-gold/20 text-gold ring-1 ring-gold/40",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}
        {drawings.length > 0 && (
          <button
            type="button"
            title="مسح الكل"
            onClick={() => { setDrawings([]); setPending(null); }}
            className="flex h-7 w-7 items-center justify-center rounded text-red-300/80 hover:bg-red-500/15 hover:text-red-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}