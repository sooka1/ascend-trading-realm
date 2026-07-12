import type { ReactNode } from "react";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

// Wraps a scrollable region and shows a native-style pull-to-refresh indicator.
// The parent must give the wrapper a bounded height for touch scroll to occur.
export function PullRefresh({
  onRefresh,
  children,
  className = "",
  enabled = true,
}: {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  className?: string;
  enabled?: boolean;
}) {
  const { containerRef, pull, refreshing, threshold } = usePullToRefresh(onRefresh, { enabled });
  const progress = Math.min(1, pull / threshold);
  return (
    <div
      ref={containerRef}
      className={`relative h-full overflow-y-auto overscroll-contain ${className}`}
    >
      <div
        aria-hidden={!refreshing && pull === 0}
        className="pointer-events-none absolute inset-x-0 top-0 flex justify-center transition-transform"
        style={{ transform: `translateY(${refreshing ? 24 : pull * 0.8}px)`, opacity: refreshing ? 1 : progress }}
      >
        <div className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-background/80 backdrop-blur">
          <span
            className={`h-4 w-4 rounded-full border-2 border-gold/30 border-t-gold ${refreshing ? "animate-spin" : ""}`}
            style={!refreshing ? { transform: `rotate(${progress * 360}deg)` } : undefined}
          />
        </div>
      </div>
      <div style={{ transform: refreshing ? "translateY(24px)" : `translateY(${pull * 0.4}px)`, transition: pull === 0 && !refreshing ? "transform 200ms" : undefined }}>
        {children}
      </div>
    </div>
  );
}