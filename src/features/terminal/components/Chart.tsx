import { useEffect, useRef, useState, useCallback } from "react";
import { CandlestickSeries, LineSeries, AreaSeries, BarSeries, createChart } from "lightweight-charts";
import type { IChartApi, ISeriesApi, Time } from "lightweight-charts";
import { getMarketDataProvider } from "../adapters/market-data";
import type { Candle, Timeframe } from "../adapters/market-data/types";
import { Minus, Slash, Square, TrendingUp, Trash2, MousePointer2, Activity, LineChart as LineIcon, Waves, BarChart3, Undo2, Redo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ema, bollinger, rsi as rsiCalc, macd as macdCalc } from "../lib/indicators";

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
type Indicators = { ema9: boolean; ema21: boolean; ema50: boolean; bb: boolean; rsi: boolean; macd: boolean };
const DEFAULT_INDICATORS: Indicators = { ema9: false, ema21: false, ema50: false, bb: false, rsi: false, macd: false };

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
  const [past, setPast] = useState<Drawing[][]>([]);
  const [future, setFuture] = useState<Drawing[][]>([]);
  const drawingsRef = useRef<Drawing[]>([]);
  const [indicators, setIndicators] = useState<Indicators>(DEFAULT_INDICATORS);
  const indicatorSeriesRef = useRef<Record<string, ISeriesApi<"Line"> | ISeriesApi<"Area"> | null>>({});
  const candlesRef = useRef<Candle[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dragRef = useRef<null | {
    id: string;
    handle: "a" | "b" | "move" | "price";
    origin: Anchor;
    snapshot: Drawing;
  }>(null);

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
      candlesRef.current = raw;
      const view = chartType === "line" || chartType === "area"
        ? raw.map((c) => ({ time: c.time as Time, value: c.close }))
        : raw.map((c) => ({ time: c.time as Time, open: c.open, high: c.high, low: c.low, close: c.close }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (series as any).setData(view);
      chart.timeScale().fitContent();
      recomputeIndicators();
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
      candlesRef.current = candles;
      recomputeIndicators();
    });

    return () => { disposed = true; unsub(); };
  }, [symbol, timeframe, chartType, precision, indicators]);

  // Add / remove and refresh indicator series based on toggles.
  const recomputeIndicators = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const bars = candlesRef.current;
    if (!bars.length) return;
    const closes = bars.map((b) => b.close);
    const store = indicatorSeriesRef.current;

    const ensure = (key: string, factory: () => ISeriesApi<"Line">) => {
      if (!store[key]) store[key] = factory();
      return store[key]!;
    };
    const drop = (key: string) => {
      const s = store[key];
      if (s) { try { chart.removeSeries(s); } catch { /* ignore */ } store[key] = null; }
    };
    const applyLine = (key: string, values: (number | null)[], color: string, pane = 0) => {
      const s = ensure(key, () => chart.addSeries(LineSeries, { color, lineWidth: 1, priceLineVisible: false, lastValueVisible: false }, pane));
      const data = bars.map((b, i) => (values[i] == null ? null : { time: b.time as Time, value: values[i] as number })).filter(Boolean) as { time: Time; value: number }[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s as any).setData(data);
    };

    // Main pane overlays
    indicators.ema9 ? applyLine("ema9", ema(closes, 9), "#f59e0b") : drop("ema9");
    indicators.ema21 ? applyLine("ema21", ema(closes, 21), "#38bdf8") : drop("ema21");
    indicators.ema50 ? applyLine("ema50", ema(closes, 50), "#a78bfa") : drop("ema50");
    if (indicators.bb) {
      const bb = bollinger(closes, 20, 2);
      applyLine("bbUpper", bb.upper, "rgba(245,197,66,0.55)");
      applyLine("bbMid", bb.mid, "rgba(245,197,66,0.35)");
      applyLine("bbLower", bb.lower, "rgba(245,197,66,0.55)");
    } else { drop("bbUpper"); drop("bbMid"); drop("bbLower"); }

    // Sub-pane: RSI (pane 1)
    if (indicators.rsi) {
      applyLine("rsi", rsiCalc(closes, 14), "#22d3ee", 1);
      applyLine("rsi70", closes.map(() => 70), "rgba(239,68,68,0.4)", 1);
      applyLine("rsi30", closes.map(() => 30), "rgba(34,197,94,0.4)", 1);
    } else { drop("rsi"); drop("rsi70"); drop("rsi30"); }

    // Sub-pane: MACD (pane 2)
    if (indicators.macd) {
      const m = macdCalc(closes);
      const paneIdx = indicators.rsi ? 2 : 1;
      applyLine("macdLine", m.line, "#60a5fa", paneIdx);
      applyLine("macdSignal", m.signal, "#f97316", paneIdx);
      applyLine("macdHist", m.hist, "rgba(148,163,184,0.6)", paneIdx);
    } else { drop("macdLine"); drop("macdSignal"); drop("macdHist"); }
  }, [indicators]);

  useEffect(() => { recomputeIndicators(); }, [recomputeIndicators]);

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

  // Convert a native PointerEvent (from window listeners) to a data-space anchor.
  const posFromNative = useCallback((e: PointerEvent): Anchor | null => {
    const chart = chartRef.current, series = seriesRef.current, host = ref.current;
    if (!chart || !series || !host) return null;
    const rect = host.getBoundingClientRect();
    const time = chart.timeScale().coordinateToTime(e.clientX - rect.left);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const price = (series as any).coordinateToPrice(e.clientY - rect.top);
    if (time == null || price == null) return null;
    return { time: Number(time), price: Number(price) };
  }, []);

  // Global drag handling for selected drawing.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current; if (!drag) return;
      const cur = posFromNative(e); if (!cur) return;
      setDrawings((prev) => prev.map((d) => {
        if (d.id !== drag.id) return d;
        const snap = drag.snapshot;
        if (snap.type === "hline") {
          return { ...snap, price: cur.price };
        }
        if (drag.handle === "a") return { ...snap, a: cur };
        if (drag.handle === "b") return { ...snap, b: cur };
        // move: shift by delta in data-space.
        const dt = cur.time - drag.origin.time;
        const dp = cur.price - drag.origin.price;
        return { ...snap, a: { time: snap.a.time + dt, price: snap.a.price + dp }, b: { time: snap.b.time + dt, price: snap.b.price + dp } };
      }));
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, [posFromNative]);

  // History (undo/redo) helpers.
  useEffect(() => { drawingsRef.current = drawings; }, [drawings]);
  const commit = useCallback(() => {
    setPast((p) => [...p, drawingsRef.current]);
    setFuture([]);
  }, []);
  const undo = useCallback(() => {
    setPast((p) => {
      if (!p.length) return p;
      const prev = p[p.length - 1];
      setFuture((f) => [...f, drawingsRef.current]);
      setDrawings(prev);
      return p.slice(0, -1);
    });
  }, []);
  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[f.length - 1];
      setPast((p) => [...p, drawingsRef.current]);
      setDrawings(next);
      return f.slice(0, -1);
    });
  }, []);

  // Keyboard: Delete/Backspace/Esc + Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
      }
      if (mod && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        redo();
        return;
      }
      if (!selectedId) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        commit();
        setDrawings((prev) => prev.filter((d) => d.id !== selectedId));
        setSelectedId(null);
      } else if (e.key === "Escape") {
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, commit, undo, redo]);

  const startDrag = (e: React.PointerEvent, drawing: Drawing, handle: "a" | "b" | "move" | "price") => {
    e.stopPropagation();
    if (tool !== "none") return;
    const origin = posFromEvent(e);
    if (!origin) return;
    commit();
    setSelectedId(drawing.id);
    dragRef.current = { id: drawing.id, handle, origin, snapshot: drawing };
  };

  const onOverlayClick = (e: React.MouseEvent) => {
    if (tool === "none") { setSelectedId(null); return; }
    const p = posFromEvent(e);
    if (!p) return;
    const id = Math.random().toString(36).slice(2);
    if (tool === "hline") {
      commit();
      setDrawings((d) => [...d, { id, type: "hline", price: p.price }]);
      return;
    }
    if (!pending) { setPending(p); return; }
    commit();
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

  const indicatorToggles: { key: keyof Indicators; label: string; icon: typeof Activity; color: string }[] = [
    { key: "ema9", label: "EMA 9", icon: LineIcon, color: "#f59e0b" },
    { key: "ema21", label: "EMA 21", icon: LineIcon, color: "#38bdf8" },
    { key: "ema50", label: "EMA 50", icon: LineIcon, color: "#a78bfa" },
    { key: "bb", label: "Bollinger", icon: Waves, color: "#F5C542" },
    { key: "rsi", label: "RSI 14", icon: Activity, color: "#22d3ee" },
    { key: "macd", label: "MACD", icon: BarChart3, color: "#60a5fa" },
  ];

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      <div ref={ref} className="h-full w-full" />
      <svg
        ref={svgRef}
        className={cn("absolute inset-0", tool !== "none" ? "pointer-events-auto cursor-crosshair" : "pointer-events-none")}
        onClick={onOverlayClick}
        onMouseMove={(e) => tool !== "none" && setHover(posFromEvent(e))}
        onMouseLeave={() => setHover(null)}
      >
        {drawings.map((d) => {
          const isSel = selectedId === d.id;
          const selectable: React.SVGAttributes<SVGElement> = {
            style: { pointerEvents: tool === "none" ? "all" : "none", cursor: tool === "none" ? "move" : undefined },
          };
          if (d.type === "hline") {
            const y = priceY(d.price);
            if (y == null) return null;
            return (
              <g key={d.id} onPointerDown={(e) => startDrag(e, d, "price")}>
                <line x1={0} x2={width} y1={y - 6} y2={y - 6 + 12} stroke="transparent" strokeWidth={12} {...selectable} />
                <line x1={0} x2={width} y1={y} y2={y} stroke="#F5C542" strokeWidth={isSel ? 2 : 1.25} strokeDasharray="4 3" />
                <text x={6} y={y - 4} fill="#F5C542" fontSize={11}>{d.price.toFixed(precision)}</text>
                {isSel && <circle cx={width / 2} cy={y} r={5} fill="#0f172a" stroke="#F5C542" strokeWidth={2} style={{ pointerEvents: "all", cursor: "ns-resize" }} />}
              </g>
            );
          }
          const pa = project(d.a); const pb = project(d.b);
          if (!pa || !pb) return null;
          const handles = isSel && (
            <>
              <circle cx={pa.x} cy={pa.y} r={5} fill="#0f172a" stroke="#F5C542" strokeWidth={2}
                style={{ pointerEvents: "all", cursor: "grab" }}
                onPointerDown={(e) => startDrag(e, d, "a")} />
              <circle cx={pb.x} cy={pb.y} r={5} fill="#0f172a" stroke="#F5C542" strokeWidth={2}
                style={{ pointerEvents: "all", cursor: "grab" }}
                onPointerDown={(e) => startDrag(e, d, "b")} />
            </>
          );
          if (d.type === "trend") return (
            <g key={d.id} onPointerDown={(e) => startDrag(e, d, "move")}>
              <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="transparent" strokeWidth={12} {...selectable} />
              <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={isSel ? "#F5C542" : "#60a5fa"} strokeWidth={isSel ? 2 : 1.5} />
              {handles}
            </g>
          );
          if (d.type === "rect") {
            const x = Math.min(pa.x, pb.x), y = Math.min(pa.y, pb.y);
            const w = Math.abs(pb.x - pa.x), h = Math.abs(pb.y - pa.y);
            return (
              <g key={d.id} onPointerDown={(e) => startDrag(e, d, "move")}>
                <rect x={x} y={y} width={w} height={h} fill="rgba(96,165,250,0.12)" stroke={isSel ? "#F5C542" : "#60a5fa"} strokeWidth={isSel ? 2 : 1} {...selectable} />
                {handles}
              </g>
            );
          }
          // fib
          const x1 = Math.min(pa.x, pb.x), x2 = Math.max(pa.x, pb.x);
          return (
            <g key={d.id} onPointerDown={(e) => startDrag(e, d, "move")}>
              {FIB_LEVELS.map((lvl, i) => {
                const price = d.a.price + (d.b.price - d.a.price) * (1 - lvl);
                const y = priceY(price);
                if (y == null) return null;
                return (
                  <g key={lvl}>
                    <line x1={x1} x2={width} y1={y} y2={y} stroke={FIB_COLORS[i]} strokeWidth={isSel ? 1.5 : 1} strokeOpacity={0.8} strokeDasharray="3 3" {...selectable} />
                    <text x={x2 + 4} y={y - 2} fill={FIB_COLORS[i]} fontSize={10}>{lvl.toFixed(3)} · {price.toFixed(precision)}</text>
                  </g>
                );
              })}
              <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={isSel ? "#F5C542" : "#94a3b8"} strokeWidth={1} strokeDasharray="2 2" {...selectable} />
              {handles}
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
      <div className="absolute right-2 top-2 z-10 flex flex-wrap gap-1 rounded-md border border-white/10 bg-black/60 p-1 backdrop-blur">
        {indicatorToggles.map((it) => {
          const active = indicators[it.key];
          const Icon = it.icon;
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => setIndicators((v) => ({ ...v, [it.key]: !v[it.key] }))}
              className={cn(
                "flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium transition",
                active ? "bg-white/10 text-white ring-1" : "text-white/50 hover:bg-white/5",
              )}
              style={active ? { borderColor: it.color, boxShadow: `inset 0 0 0 1px ${it.color}55` } : undefined}
            >
              <Icon className="h-3 w-3" style={{ color: active ? it.color : undefined }} />
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}