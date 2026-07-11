import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Point = { t: number; price: number };

/**
 * Deterministic 24h synthetic series for markets without a public candles API.
 * Seeded on the symbol so redraws are stable; ends exactly at `price` and the
 * total drift matches `changePct` (last 24h %).
 */
function synthSeries(symbol: string, price: number, changePct: number): Point[] {
  const N = 24;
  // Seeded RNG (mulberry32) — stable per symbol.
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) seed = (seed * 31 + symbol.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const startPrice = price / (1 + changePct / 100);
  const now = Date.now();
  const step = (price - startPrice) / (N - 1);
  const noise = Math.max(Math.abs(price) * 0.004, price * 0.001);
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const drift = startPrice + step * i;
    const jitter = (rand() - 0.5) * 2 * noise;
    pts.push({ t: now - (N - 1 - i) * 3_600_000, price: drift + (i === N - 1 ? 0 : jitter) });
  }
  pts[N - 1].price = price;
  return pts;
}

async function fetchBinanceKlines(stream: string): Promise<Point[] | null> {
  try {
    const sym = stream.toUpperCase();
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=1h&limit=24`);
    if (!res.ok) return null;
    const raw = (await res.json()) as Array<[number, string, string, string, string, ...unknown[]]>;
    return raw.map((k) => ({ t: k[0], price: Number(k[4]) }));
  } catch {
    return null;
  }
}

function fmt(v: number) {
  if (!isFinite(v)) return "—";
  if (v < 1) return v.toFixed(4);
  if (v < 100) return v.toFixed(3);
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function fmtHour(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function PriceSparkline({
  symbol,
  price,
  changePct,
  binanceStream,
  className,
}: {
  symbol: string;
  price: number;
  changePct: number;
  binanceStream?: string;
  className?: string;
}) {
  const [points, setPoints] = useState<Point[]>(() => synthSeries(symbol, price, changePct));
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Fetch real 24h klines for crypto; fall back to synthetic on failure.
  useEffect(() => {
    let cancelled = false;
    if (binanceStream) {
      void fetchBinanceKlines(binanceStream).then((real) => {
        if (cancelled) return;
        if (real && real.length > 1) setPoints(real);
        else setPoints(synthSeries(symbol, price, changePct));
      });
    } else {
      setPoints(synthSeries(symbol, price, changePct));
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, binanceStream]);

  // Keep the last synthetic point pinned to the latest live price.
  useEffect(() => {
    if (binanceStream) return;
    setPoints((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice();
      next[next.length - 1] = { ...next[next.length - 1], price };
      return next;
    });
  }, [price, binanceStream]);

  const { path, area, min, max, first, last, up, w, h, coords } = useMemo(() => {
    const W = 600;
    const H = 140;
    const pad = 6;
    if (points.length < 2) {
      return { path: "", area: "", min: 0, max: 0, first: 0, last: 0, up: true, w: W, h: H, coords: [] as Array<[number, number]> };
    }
    const prices = points.map((p) => p.price);
    const lo = Math.min(...prices);
    const hi = Math.max(...prices);
    const range = hi - lo || Math.max(hi * 0.001, 1);
    const stepX = (W - pad * 2) / (points.length - 1);
    const cs: Array<[number, number]> = points.map((p, i) => {
      const x = pad + i * stepX;
      const y = pad + (1 - (p.price - lo) / range) * (H - pad * 2);
      return [x, y];
    });
    const p = cs.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const a = `${p} L${cs[cs.length - 1][0].toFixed(1)},${H - pad} L${cs[0][0].toFixed(1)},${H - pad} Z`;
    const f = points[0].price;
    const l = points[points.length - 1].price;
    return { path: p, area: a, min: lo, max: hi, first: f, last: l, up: l >= f, w: W, h: H, coords: cs };
  }, [points]);

  const stroke = up ? "hsl(var(--bull))" : "hsl(var(--bear))";
  const gradId = `sparkline-grad-${symbol.replace(/[^a-z0-9]/gi, "")}`;
  const changeFromSeries = first > 0 ? ((last - first) / first) * 100 : 0;

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || coords.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * w;
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < coords.length; i++) {
      const d = Math.abs(coords[i][0] - relX);
      if (d < best) { best = d; nearest = i; }
    }
    setHover({ i: nearest, x: coords[nearest][0], y: coords[nearest][1] });
  };

  const hoveredPoint = hover ? points[hover.i] : null;

  return (
    <div className={cn("glass rounded-xl p-3", className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">آخر 24 ساعة</div>
        <div className={cn("text-xs font-semibold tabular-nums", up ? "text-bull" : "text-bear")}>
          {up ? "▲" : "▼"} {up ? "+" : ""}{changeFromSeries.toFixed(2)}%
        </div>
      </div>
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="h-32 w-full"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradId})`} />
          <path d={path} fill="none" stroke={stroke} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
          {hover && (
            <g>
              <line x1={hover.x} x2={hover.x} y1={4} y2={h - 4} stroke="hsl(var(--foreground))" strokeOpacity="0.25" strokeDasharray="3 3" />
              <circle cx={hover.x} cy={hover.y} r={3.5} fill={stroke} stroke="hsl(var(--background))" strokeWidth={1.5} />
            </g>
          )}
        </svg>
        {hoveredPoint && (
          <div
            className="pointer-events-none absolute top-1 rounded-md border border-white/10 bg-black/70 px-2 py-1 text-[11px] tabular-nums backdrop-blur"
            style={{ left: `min(calc(${(hover!.x / w) * 100}% + 8px), calc(100% - 110px))` }}
          >
            <div className="text-muted-foreground">{fmtHour(hoveredPoint.t)}</div>
            <div className={cn("font-semibold", up ? "text-bull" : "text-bear")}>{fmt(hoveredPoint.price)}</div>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground/70 tabular-nums">
        <span>أدنى {fmt(min)}</span>
        <span>أعلى {fmt(max)}</span>
      </div>
    </div>
  );
}