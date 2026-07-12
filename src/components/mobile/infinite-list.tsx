import type { ReactNode } from "react";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Skeleton } from "./skeleton";

// Renders a list + a sentinel that fires `loadMore` when near the viewport.
// Consumers pass their own items; this component owns the sentinel/loading tail.
export function InfiniteList({
  children,
  loadMore,
  hasMore,
  loading,
  emptyState,
  rowSkeletonCount = 3,
}: {
  children: ReactNode;
  loadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  emptyState?: ReactNode;
  rowSkeletonCount?: number;
}) {
  const sentinelRef = useInfiniteScroll(loadMore, { hasMore, loading });
  const empty = !loading && !hasMore && (Array.isArray(children) ? children.length === 0 : !children);
  return (
    <div className="flex flex-col">
      {children}
      {empty && emptyState}
      {hasMore && (
        <>
          <div ref={sentinelRef} className="h-1 w-full" aria-hidden />
          {loading && (
            <div className="space-y-2 p-3">
              {Array.from({ length: rowSkeletonCount }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}