import { useEffect, useRef, useState } from "react";
import { hapticImpact } from "@/lib/native-shell";

// Native-feeling pull-to-refresh. Attach the returned ref to a scroll container.
// Guarantees a single in-flight refresh (does not duplicate requests).
export function usePullToRefresh(onRefresh: () => Promise<void> | void, opts: {
  threshold?: number; // px, default 72
  enabled?: boolean;
} = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const busy = useRef(false);
  const threshold = opts.threshold ?? 72;
  const enabled = opts.enabled ?? true;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    const onStart = (e: TouchEvent) => {
      if (el.scrollTop > 0 || busy.current) return;
      startY.current = e.touches[0].clientY;
    };
    const onMove = (e: TouchEvent) => {
      if (startY.current == null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) return;
      const damped = Math.min(threshold * 1.6, dy * 0.55);
      setPull(damped);
    };
    const onEnd = async () => {
      if (startY.current == null) return;
      startY.current = null;
      if (pull >= threshold && !busy.current) {
        busy.current = true;
        setRefreshing(true);
        void hapticImpact("light");
        try { await onRefresh(); } finally {
          setRefreshing(false);
          setPull(0);
          busy.current = false;
        }
      } else {
        setPull(0);
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [enabled, onRefresh, pull, threshold]);

  return { containerRef, pull, refreshing, threshold } as const;
}