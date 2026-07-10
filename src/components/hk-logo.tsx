import { cn } from "@/lib/utils";
import logoSrc from "@/assets/hk-logo.png";

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
        <span className={cn("relative shrink-0", dim)}>
          <span
            className="absolute inset-0 rounded-full bg-[var(--gradient-brand)] opacity-90"
            aria-hidden
          />
          <span
            className="absolute inset-[2px] rounded-full bg-[color:var(--background)]"
            aria-hidden
          />
          <img
            src={logoSrc}
            alt="HK Investment Management"
            className={cn("relative rounded-full object-contain p-[3px]", dim)}
            width={64}
            height={64}
          />
        </span>
        {showWordmark && (
          <span className={cn("leading-none tracking-tight", text)}>
            HK <span className="text-gradient">Invest</span>
          </span>
        )}
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-display font-bold", className)}>
      <span className={cn("relative shrink-0", dim)}>
        <span className="absolute inset-0 rounded-xl bg-[var(--gradient-brand-soft)] blur-md" aria-hidden />
        <span className="absolute inset-0 rounded-xl ring-1 ring-white/10" aria-hidden />
        <img
          src={logoSrc}
          alt="HK Investment Management"
          className={cn("relative rounded-xl object-contain", dim)}
          width={64}
          height={64}
        />
      </span>
      {showWordmark && (
        <span className={cn("leading-none tracking-tight", text)}>
          HK <span className="text-gradient">Investment</span>
        </span>
      )}
    </span>
  );
}