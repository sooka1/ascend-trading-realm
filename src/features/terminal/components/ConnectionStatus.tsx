import { useEffect, useState } from "react";
import { Wifi, WifiOff, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMarketDataProvider } from "../adapters/market-data";
import type { ConnectionStatus as Status } from "../adapters/market-data/types";

const META: Record<Status, { label: string; className: string; Icon: typeof Wifi }> = {
  idle:       { label: "في الانتظار", className: "text-white/50 border-white/10 bg-white/[0.03]", Icon: Loader2 },
  connecting: { label: "جارٍ الاتصال…", className: "text-amber-300 border-amber-400/30 bg-amber-400/10", Icon: Loader2 },
  open:       { label: "متصل مباشر", className: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10", Icon: Wifi },
  closed:     { label: "منقطع — إعادة المحاولة", className: "text-amber-300 border-amber-400/30 bg-amber-400/10", Icon: WifiOff },
  error:      { label: "خطأ في الاتصال", className: "text-red-300 border-red-400/30 bg-red-400/10", Icon: AlertTriangle },
};

export function ConnectionStatusBadge() {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const p = getMarketDataProvider();
    const unsub = p.onStatus(setStatus);
    return () => unsub();
  }, []);

  const { label, className, Icon } = META[status];
  const spin = status === "connecting" || status === "closed";
  return (
    <div
      title={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        className,
      )}
    >
      <Icon className={cn("h-3 w-3", spin && "animate-spin")} />
      <span>{label}</span>
    </div>
  );
}