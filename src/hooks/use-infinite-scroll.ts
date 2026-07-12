import { useEffect, useRef } from "react";

// Sentinel-based infinite scroll. Callers provide `loadMore` and gate it via
// `hasMore` / `loading` to prevent duplicate loads. IntersectionObserver is
// SSR-safe (no-op when window is absent).
export function useInfiniteScroll(loadMore: () => void, opts: {
  hasMore: boolean;
  loading: boolean;
  rootMargin?: string;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const load = useRef(loadMore);
  load.current = loadMore;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = sentinelRef.current;
    if (!el || !opts.hasMore) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !opts.loading && opts.hasMore) {
          load.current();
        }
      },
      { rootMargin: opts.rootMargin ?? "240px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [opts.hasMore, opts.loading, opts.rootMargin]);

  return sentinelRef;
}