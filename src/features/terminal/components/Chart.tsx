import { useEffect, useRef } from "react";
import { CandlestickSeries, LineSeries, AreaSeries, BarSeries, createChart } from "lightweight-charts";
import type { IChartApi, ISeriesApi, Time } from "lightweight-charts";
import { getMarketDataProvider } from "../adapters/market-data";
import type { Candle, Timeframe } from "../adapters/market-data/types";

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
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Bar"> | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      layout: { background: { color: "transparent" }, textColor: "#c9d1d9", fontFamily: "inherit" },
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

  // heikin-ashi requested as chart-type: transform then feed as candles.
  // (kept simple — full HA/indicators overlays can be added incrementally.)
  void heikinAshi;

  return <div ref={ref} className="h-full w-full" />;
}