import { cn } from "@/lib/utils";

function HKMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="8" fill="#0a1e3f" />
      {/* H */}
      <rect x="12" y="16" width="5" height="32" fill="#ffffff" />
      <rect x="26" y="16" width="5" height="32" fill="#ffffff" />
      <rect x="12" y="29.5" width="19" height="5" fill="#ffffff" />
      {/* K */}
      <rect x="37" y="16" width="5" height="32" fill="#ffffff" />
      <polygon points="55,16 48,16 42,30 42,34 48,48 55,48 46,32" fill="#ffffff" />
    </svg>
  );
}

interface HKLogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "chip";
}

export function HKLogo({ className, showWordmark = true, size = "md", variant = "default" }: HKLogoProps) {
  const dim = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-9 w-9";
  const text = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg";
  if (variant === "chip") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pe-3 ps-1 font-display font-bold shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]",
          className,
        )}
      >
        <span className={cn("relative shrink-0", dim)} aria-label="HK Investment Management">
          <HKMark className={cn("relative", dim)} />
        </span>
        {showWordmark && (
          <span className={cn("leading-none tracking-tight", text)}>
            HK <span className="text-black">Invest</span>
          </span>
        )}
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-display font-bold", className)}>
      <span className={cn("relative shrink-0", dim)} aria-label="HK Investment Management">
        <HKMark className={cn("relative", dim)} />
      </span>
      {showWordmark && (
        <span className={cn("leading-none tracking-tight", text)}>
          HK <span className="text-black">Investment</span>
        </span>
      )}
    </span>
  );
}