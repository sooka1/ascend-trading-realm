import { useEffect, useRef, useState, useCallback } from "react";
import { CandlestickSeries, LineSeries, AreaSeries, BarSeries, createChart } from "lightweight-charts";
import type { IChartApi, ISeriesApi, Time } from "lightweight-charts";
import { getMarketDataProvider } from "../adapters/market-data";
import type { Candle, Timeframe } from "../adapters/market-data/types";
import { Minus, Slash, Square, TrendingUp, Trash2, MousePointer2, Activity, LineChart as LineIcon, Waves, BarChart3, Undo2, Redo2, Magnet, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ema, bollinger, rsi as rsiCalc, macd as macdCalc } from "../lib/indicators";
import { supabase } from "@/integrations/supabase/client";

type DrawTool = "none" | "trend" | "hline" | "rect" | "fib";
type Anchor = { time: number; price: number };
type DrawStyle = { color?: string; width?: number; opacity?: number };
type Drawing =
  | { id: string; type: "trend"; a: Anchor; b: Anchor; style?: DrawStyle }
  | { id: string; type: "rect"; a: Anchor; b: Anchor; style?: DrawStyle }
  | { id: string; type: "fib"; a: Anchor; b: Anchor; style?: DrawStyle }
  | { id: string; type: "hline"; price: number; style?: DrawStyle };

const DEFAULT_COLORS: Record<Exclude<DrawTool, "none">, string> = {
  trend: "#60a5fa", hline: "#F5C542", rect: "#60a5fa", fib: "#94a3b8",
};
const PALETTE = ["#F5C542", "#60a5fa", "#22c55e", "#ef4444", "#a78bfa", "#f97316", "#e2e8f0"];
const resolveStyle = (d: Drawing): { color: string; width: number; opacity: number } => ({
  color: d.style?.color ?? DEFAULT_COLORS[d.type],
  width: d.style?.width ?? (d.type === "hline" ? 1.25 : 1.5),
  opacity: d.style?.opacity ?? 1,
});

const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
const FIB_COLORS = ["#94a3b8", "#f59e0b", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#94a3b8"];

type ChartType = "candles" | "line" | "area" | "bars";
type Indicators = { ema9: boolean; ema21: boolean; ema50: boolean; bb: boolean; rsi: boolean; macd: boolean };
const DEFAULT_INDICATORS: Indicators = { ema9: false, ema21: false, ema50: false, bb: false, rsi: false, macd: false };
type IndicatorSettings = {
  ema9: number; ema21: number; ema50: number;
  bbPeriod: number; bbStd: number;
  rsi: number;
  macdFast: number; macdSlow: number; macdSignal: number;
};
const DEFAULT_INDICATOR_SETTINGS: IndicatorSettings = {
  ema9: 9, ema21: 21, ema50: 50,
  bbPeriod: 20, bbStd: 2,
  rsi: 14,
  macdFast: 12, macdSlow: 26, macdSignal: 9,
};

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
  const [indSettings, setIndSettings] = useState<IndicatorSettings>(DEFAULT_INDICATOR_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const indicatorSeriesRef = useRef<Record<string, ISeriesApi<"Line"> | ISeriesApi<"Area"> | null>>({});
  const candlesRef = useRef<Candle[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const loadedForSymbolRef = useRef<string | null>(null);
  // Snapping: attach drawing anchors to nearest candle time and nearest OHLC price.
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapPrice, setSnapPrice] = useState(true);
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
    indicators.ema9 ? applyLine("ema9", ema(closes, indSettings.ema9), "#f59e0b") : drop("ema9");
    indicators.ema21 ? applyLine("ema21", ema(closes, indSettings.ema21), "#38bdf8") : drop("ema21");
    indicators.ema50 ? applyLine("ema50", ema(closes, indSettings.ema50), "#a78bfa") : drop("ema50");
    if (indicators.bb) {
      const bb = bollinger(closes, indSettings.bbPeriod, indSettings.bbStd);
      applyLine("bbUpper", bb.upper, "rgba(245,197,66,0.55)");
      applyLine("bbMid", bb.mid, "rgba(245,197,66,0.35)");
      applyLine("bbLower", bb.lower, "rgba(245,197,66,0.55)");
    } else { drop("bbUpper"); drop("bbMid"); drop("bbLower"); }

    // Sub-pane: RSI (pane 1)
    if (indicators.rsi) {
      applyLine("rsi", rsiCalc(closes, indSettings.rsi), "#22d3ee", 1);
      applyLine("rsi70", closes.map(() => 70), "rgba(239,68,68,0.4)", 1);
      applyLine("rsi30", closes.map(() => 30), "rgba(34,197,94,0.4)", 1);
    } else { drop("rsi"); drop("rsi70"); drop("rsi30"); }

    // Sub-pane: MACD (pane 2)
    if (indicators.macd) {
      const m = macdCalc(closes, indSettings.macdFast, indSettings.macdSlow, indSettings.macdSignal);
      const paneIdx = indicators.rsi ? 2 : 1;
      applyLine("macdLine", m.line, "#60a5fa", paneIdx);
      applyLine("macdSignal", m.signal, "#f97316", paneIdx);
      applyLine("macdHist", m.hist, "rgba(148,163,184,0.6)", paneIdx);
    } else { drop("macdLine"); drop("macdSignal"); drop("macdHist"); }
  }, [indicators, indSettings]);

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

  // Snap anchor to nearest candle time and nearest OHLC price of that candle.
  const snapAnchor = useCallback((a: Anchor): Anchor => {
    if (!snapEnabled) return a;
    const bars = candlesRef.current;
    if (!bars.length) return a;
    let lo = 0, hi = bars.length - 1, idx = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (bars[mid].time <= a.time) { idx = mid; lo = mid + 1; } else { hi = mid - 1; }
    }
    const next = bars[Math.min(idx + 1, bars.length - 1)];
    const cur = bars[idx];
    const nearest = Math.abs(a.time - cur.time) <= Math.abs(next.time - a.time) ? cur : next;
    let price = a.price;
    if (snapPrice) {
      const candidates = [nearest.open, nearest.high, nearest.low, nearest.close];
      price = candidates.reduce((best, v) => Math.abs(v - a.price) < Math.abs(best - a.price) ? v : best, candidates[0]);
    }
    return { time: nearest.time, price };
  }, [snapEnabled, snapPrice]);

  // Global drag handling for selected drawing.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current; if (!drag) return;
      const raw = posFromNative(e); if (!raw) return;
      const cur = snapAnchor(raw);
      setDrawings((prev) => prev.map((d) => {
        if (d.id !== drag.id) return d;
        const snap = drag.snapshot;
        if (snap.type === "hline") {
          return { ...snap, price: cur.price };
        }
        if (drag.handle === "a") return { ...snap, a: cur };
        if (drag.handle === "b") return { ...snap, b: cur };
        // move: shift by delta in data-space.
        const dt = raw.time - drag.origin.time;
        const dp = raw.price - drag.origin.price;
        return { ...snap, a: { time: snap.a.time + dt, price: snap.a.price + dp }, b: { time: snap.b.time + dt, price: snap.b.price + dp } };
      }));
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, [posFromNative, snapAnchor]);

  // History (undo/redo) helpers.
  useEffect(() => { drawingsRef.current = drawings; }, [drawings]);

  // Load persisted drawings for this symbol.
  useEffect(() => {
    let cancelled = false;
    loadedForSymbolRef.current = null;
    setDrawings([]); setPast([]); setFuture([]); setSelectedId(null);
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { loadedForSymbolRef.current = symbol; return; }
      const { data } = await supabase
        .from("chart_drawings")
        .select("drawings")
        .eq("user_id", userData.user.id)
        .eq("symbol", symbol)
        .maybeSingle();
      if (cancelled) return;
      if (data?.drawings && Array.isArray(data.drawings)) setDrawings(data.drawings as Drawing[]);
      loadedForSymbolRef.current = symbol;
    })();
    return () => { cancelled = true; };
  }, [symbol]);

  // Persist drawings (debounced) whenever they change after initial load.
  useEffect(() => {
    if (loadedForSymbolRef.current !== symbol) return;
    const t = window.setTimeout(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      await supabase.from("chart_drawings").upsert(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { user_id: userData.user.id, symbol, drawings: drawings as any },
        { onConflict: "user_id,symbol" },
      );
    }, 500);
    return () => window.clearTimeout(t);
  }, [drawings, symbol]);

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
    const raw = posFromEvent(e);
    const p = raw ? snapAnchor(raw) : null;
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
    { key: "ema9", label: `EMA ${indSettings.ema9}`, icon: LineIcon, color: "#f59e0b" },
    { key: "ema21", label: `EMA ${indSettings.ema21}`, icon: LineIcon, color: "#38bdf8" },
    { key: "ema50", label: `EMA ${indSettings.ema50}`, icon: LineIcon, color: "#a78bfa" },
    { key: "bb", label: `BB ${indSettings.bbPeriod}/${indSettings.bbStd}`, icon: Waves, color: "#F5C542" },
    { key: "rsi", label: `RSI ${indSettings.rsi}`, icon: Activity, color: "#22d3ee" },
    { key: "macd", label: `MACD ${indSettings.macdFast}/${indSettings.macdSlow}/${indSettings.macdSignal}`, icon: BarChart3, color: "#60a5fa" },
  ];

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      <div ref={ref} className="h-full w-full" />
      <svg
        ref={svgRef}
        className={cn("absolute inset-0", tool !== "none" ? "pointer-events-auto cursor-crosshair" : "pointer-events-none")}
        onClick={onOverlayClick}
        onMouseMove={(e) => {
          if (tool === "none") return;
          const raw = posFromEvent(e);
          setHover(raw ? snapAnchor(raw) : null);
        }}
        onMouseLeave={() => setHover(null)}
      >
        {drawings.map((d) => {
          const isSel = selectedId === d.id;
          const st = resolveStyle(d);
          const selectable: React.SVGAttributes<SVGElement> = {
            style: { pointerEvents: tool === "none" ? "all" : "none", cursor: tool === "none" ? "move" : undefined },
          };
          if (d.type === "hline") {
            const y = priceY(d.price);
            if (y == null) return null;
            return (
              <g key={d.id} onPointerDown={(e) => startDrag(e, d, "price")}>
                <line x1={0} x2={width} y1={y - 6} y2={y - 6 + 12} stroke="transparent" strokeWidth={12} {...selectable} />
                <line x1={0} x2={width} y1={y} y2={y} stroke={st.color} strokeOpacity={st.opacity} strokeWidth={isSel ? st.width + 0.75 : st.width} strokeDasharray="4 3" />
                <text x={6} y={y - 4} fill={st.color} fillOpacity={st.opacity} fontSize={11}>{d.price.toFixed(precision)}</text>
                {isSel && <circle cx={width / 2} cy={y} r={5} fill="#0f172a" stroke={st.color} strokeWidth={2} style={{ pointerEvents: "all", cursor: "ns-resize" }} />}
              </g>
            );
          }
          const pa = project(d.a); const pb = project(d.b);
          if (!pa || !pb) return null;
          const handles = isSel && (
            <>
              <circle cx={pa.x} cy={pa.y} r={5} fill="#0f172a" stroke={st.color} strokeWidth={2}
                style={{ pointerEvents: "all", cursor: "grab" }}
                onPointerDown={(e) => startDrag(e, d, "a")} />
              <circle cx={pb.x} cy={pb.y} r={5} fill="#0f172a" stroke={st.color} strokeWidth={2}
                style={{ pointerEvents: "all", cursor: "grab" }}
                onPointerDown={(e) => startDrag(e, d, "b")} />
            </>
          );
          if (d.type === "trend") return (
            <g key={d.id} onPointerDown={(e) => startDrag(e, d, "move")}>
              <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="transparent" strokeWidth={12} {...selectable} />
              <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={st.color} strokeOpacity={st.opacity} strokeWidth={isSel ? st.width + 0.75 : st.width} />
              {handles}
            </g>
          );
          if (d.type === "rect") {
            const x = Math.min(pa.x, pb.x), y = Math.min(pa.y, pb.y);
            const w = Math.abs(pb.x - pa.x), h = Math.abs(pb.y - pa.y);
            return (
              <g key={d.id} onPointerDown={(e) => startDrag(e, d, "move")}>
                <rect x={x} y={y} width={w} height={h} fill={st.color} fillOpacity={st.opacity * 0.15} stroke={st.color} strokeOpacity={st.opacity} strokeWidth={isSel ? st.width + 0.5 : st.width} {...selectable} />
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
                    <line x1={x1} x2={width} y1={y} y2={y} stroke={d.style?.color ?? FIB_COLORS[i]} strokeWidth={isSel ? st.width : Math.max(1, st.width - 0.5)} strokeOpacity={0.8 * st.opacity} strokeDasharray="3 3" {...selectable} />
                    <text x={x2 + 4} y={y - 2} fill={d.style?.color ?? FIB_COLORS[i]} fillOpacity={st.opacity} fontSize={10}>{lvl.toFixed(3)} · {price.toFixed(precision)}</text>
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
      {(() => {
        if (!selectedId || tool !== "none") return null;
        const d = drawings.find((x) => x.id === selectedId);
        if (!d) return null;
        let cx = 0, cy = 0;
        if (d.type === "hline") {
          const y = priceY(d.price); if (y == null) return null;
          cx = width / 2; cy = y;
        } else {
          const pa = project(d.a), pb = project(d.b); if (!pa || !pb) return null;
          cx = (pa.x + pb.x) / 2; cy = Math.min(pa.y, pb.y);
        }
        const st = resolveStyle(d);
        const update = (patch: Partial<DrawStyle>) => {
          setDrawings((prev) => prev.map((x) => x.id === d.id ? { ...x, style: { ...(x.style ?? {}), ...patch } } : x));
        };
        const left = Math.max(8, Math.min(width - 240, cx - 120));
        const top = Math.max(8, cy - 74);
        return (
          <div
            className="absolute z-20 flex items-center gap-2 rounded-md border border-white/10 bg-black/80 px-2 py-1.5 shadow-lg backdrop-blur"
            style={{ left, top }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { commit(); update({ color: c }); }}
                  className={cn("h-4 w-4 rounded-full ring-1 ring-white/20 transition hover:scale-110", st.color === c && "ring-2 ring-white")}
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="h-4 w-px bg-white/10" />
            <label className="flex items-center gap-1 text-[10px] text-white/60">
              سُمك
              <input type="range" min={1} max={6} step={0.5} value={st.width}
                onChange={(e) => update({ width: Number(e.target.value) })}
                onPointerUp={() => commit()}
                className="h-1 w-16 accent-gold" />
              <span className="w-4 tabular-nums text-white/70">{st.width}</span>
            </label>
            <label className="flex items-center gap-1 text-[10px] text-white/60">
              شفافية
              <input type="range" min={0.1} max={1} step={0.05} value={st.opacity}
                onChange={(e) => update({ opacity: Number(e.target.value) })}
                onPointerUp={() => commit()}
                className="h-1 w-16 accent-gold" />
              <span className="w-6 tabular-nums text-white/70">{Math.round(st.opacity * 100)}%</span>
            </label>
            <button
              type="button"
              title="حذف"
              onClick={() => { commit(); setDrawings((p) => p.filter((x) => x.id !== d.id)); setSelectedId(null); }}
              className="ml-1 flex h-5 w-5 items-center justify-center rounded text-red-300 hover:bg-red-500/15"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        );
      })()}
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
            onClick={() => { commit(); setDrawings([]); setPending(null); setSelectedId(null); }}
            className="flex h-7 w-7 items-center justify-center rounded text-red-300/80 hover:bg-red-500/15 hover:text-red-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="my-0.5 h-px w-full bg-white/10" />
        <button
          type="button"
          title="تراجع (Ctrl+Z)"
          disabled={past.length === 0}
          onClick={undo}
          className="flex h-7 w-7 items-center justify-center rounded text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="إعادة (Ctrl+Shift+Z)"
          disabled={future.length === 0}
          onClick={redo}
          className="flex h-7 w-7 items-center justify-center rounded text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>
        <div className="my-0.5 h-px w-full bg-white/10" />
        <button
          type="button"
          title={snapEnabled ? "Snap مفعّل (شمعة)" : "تفعيل Snap للشمعة"}
          onClick={() => setSnapEnabled((v) => !v)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded text-white/70 transition hover:bg-white/10 hover:text-white",
            snapEnabled && "bg-gold/20 text-gold ring-1 ring-gold/40",
          )}
        >
          <Magnet className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title={snapPrice ? "Snap للسعر OHLC مفعّل" : "تفعيل Snap للسعر OHLC"}
          disabled={!snapEnabled}
          onClick={() => setSnapPrice((v) => !v)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded text-[10px] font-semibold text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30",
            snapEnabled && snapPrice && "bg-gold/20 text-gold ring-1 ring-gold/40",
          )}
        >
          $
        </button>
      </div>
      <div className="absolute right-2 top-2 z-10 flex flex-wrap items-center gap-1 rounded-md border border-white/10 bg-black/60 p-1 backdrop-blur">
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
        <button
          type="button"
          title="إعدادات المؤشرات"
          onClick={() => setSettingsOpen((v) => !v)}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded text-white/60 transition hover:bg-white/10 hover:text-white",
            settingsOpen && "bg-white/10 text-white",
          )}
        >
          <Settings2 className="h-3 w-3" />
        </button>
      </div>
      {settingsOpen && (
        <div className="absolute right-2 top-11 z-20 w-64 rounded-md border border-white/10 bg-black/85 p-3 shadow-xl backdrop-blur">
          <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-white/80">
            <span>إعدادات المؤشرات</span>
            <button
              type="button"
              onClick={() => setIndSettings(DEFAULT_INDICATOR_SETTINGS)}
              className="text-[10px] font-normal text-white/50 hover:text-white"
            >
              استعادة الافتراضي
            </button>
          </div>
          {([
            ["ema9", "EMA سريع", 1, 500, 1],
            ["ema21", "EMA متوسط", 1, 500, 1],
            ["ema50", "EMA طويل", 1, 500, 1],
            ["bbPeriod", "BB Period", 2, 200, 1],
            ["bbStd", "BB StdDev", 0.5, 5, 0.1],
            ["rsi", "RSI Period", 2, 100, 1],
            ["macdFast", "MACD Fast", 1, 100, 1],
            ["macdSlow", "MACD Slow", 1, 200, 1],
            ["macdSignal", "MACD Signal", 1, 100, 1],
          ] as [keyof IndicatorSettings, string, number, number, number][]).map(([k, label, min, max, step]) => (
            <label key={k} className="mb-1.5 flex items-center justify-between gap-2 text-[10px] text-white/60">
              <span>{label}</span>
              <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={indSettings[k]}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!Number.isFinite(v)) return;
                  setIndSettings((s) => ({ ...s, [k]: Math.min(max, Math.max(min, v)) }));
                }}
                className="h-6 w-16 rounded border border-white/10 bg-white/5 px-1.5 text-right text-white outline-none focus:border-gold/50"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}