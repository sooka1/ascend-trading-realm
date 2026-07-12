/**
 * VirtualList — Sprint 3
 *
 * Thin wrapper around @tanstack/react-virtual for windowed rendering of
 * long lists (positions, trades, notifications, ledger, investments,
 * competitions). Additive: existing tables continue to render normally.
 *
 * Usage:
 *   <VirtualList
 *     items={rows}
 *     estimateSize={() => 56}
 *     renderItem={(row, i) => <TradeRow key={row.id} row={row} />}
 *   />
 */
import { useRef, memo, type ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface VirtualListProps<T> {
  items: T[];
  estimateSize?: () => number;
  overscan?: number;
  className?: string;
  height?: number | string;
  renderItem: (item: T, index: number) => ReactNode;
  /** Optional infinite scroll: called when user nears the end. */
  onEndReached?: () => void;
  endThreshold?: number;
}

function VirtualListInner<T>({
  items,
  estimateSize = () => 48,
  overscan = 8,
  className,
  height = 480,
  renderItem,
  onEndReached,
  endThreshold = 4,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const last = virtualItems[virtualItems.length - 1];
  if (
    onEndReached &&
    last &&
    last.index >= items.length - endThreshold - 1
  ) {
    // Fire outside render via microtask to avoid setState-during-render.
    queueMicrotask(onEndReached);
  }

  return (
    <div
      ref={parentRef}
      className={className}
      style={{ height, overflow: "auto", contain: "strict" }}
    >
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((v) => (
          <div
            key={v.key}
            data-index={v.index}
            ref={rowVirtualizer.measureElement}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${v.start}px)`,
            }}
          >
            {renderItem(items[v.index], v.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export const VirtualList = memo(VirtualListInner) as typeof VirtualListInner;