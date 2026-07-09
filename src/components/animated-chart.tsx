import { useEffect, useMemo, useState } from "react";

/** SVG performance chart that animates its stroke into view. */
export function AnimatedChart() {
  const points = useMemo(() => generateSeries(60, 100), []);
  const [drawn, setDrawn] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1600;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setDrawn(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const w = 560;
  const h = 200;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const pad = 8;
  const path = points
    .map((v, i) => {
      const x = pad + (i / (points.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `${path} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-40 w-full">
      <defs>
        <linearGradient id="hk-chart-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.82 0.14 82)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.82 0.14 82)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hk-chart-stroke" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="oklch(0.52 0.19 262)" />
          <stop offset="100%" stopColor="oklch(0.82 0.14 82)" />
        </linearGradient>
      </defs>
      {/* grid */}
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={pad} x2={w - pad} y1={h * g} y2={h * g} stroke="oklch(1 0 0 / 0.06)" strokeDasharray="3 4" />
      ))}
      <path d={area} fill="url(#hk-chart-fill)" opacity={drawn} />
      <path
        d={path}
        fill="none"
        stroke="url(#hk-chart-stroke)"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - drawn}
      />
    </svg>
  );
}

function generateSeries(n: number, start: number) {
  const out: number[] = [];
  let v = start;
  // Deterministic pseudo-random so SSR and client render identical paths.
  const rand = (i: number) => {
    const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  for (let i = 0; i < n; i++) {
    v += (Math.sin(i / 5) + Math.cos(i / 3)) * 0.6 + (i / n) * 0.6 + (rand(i) - 0.5) * 0.4;
    out.push(v);
  }
  return out;
}