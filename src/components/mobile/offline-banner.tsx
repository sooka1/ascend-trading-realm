import { useNetworkStatus } from "@/hooks/use-network-status";
import { flush } from "@/lib/native/network-queue";

// Sticky banner shown when the client is offline or on a weak connection.
// Placed once inside the authenticated layout; safe on web too.
export function OfflineBanner() {
  const status = useNetworkStatus();
  if (status === "online") return null;
  const isOffline = status === "offline";
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-[env(safe-area-inset-top)] z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-b-lg border border-t-0 border-amber-500/40 bg-amber-500/15 px-4 py-2 text-xs text-amber-200 backdrop-blur"
    >
      <span className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${isOffline ? "bg-red-400" : "bg-amber-300 animate-pulse"}`} />
        {isOffline ? "You are offline — actions will retry when reconnected" : "Weak connection — retrying…"}
      </span>
      <button
        type="button"
        onClick={() => void flush()}
        className="rounded-md border border-amber-400/40 px-2 py-1 text-[10px] uppercase tracking-wide text-amber-100 hover:bg-amber-500/20"
      >
        Retry
      </button>
    </div>
  );
}