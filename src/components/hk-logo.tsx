import { cn } from "@/lib/utils";
import logoSrc from "@/assets/hk-logo.png";

interface HKLogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}

export function HKLogo({ className, showWordmark = true, size = "md" }: HKLogoProps) {
  const dim = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-12 w-12" : "h-9 w-9";
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-display font-bold", className)}>
      <span className={cn("relative shrink-0", dim)}>
        <span className="absolute inset-0 rounded-lg bg-[var(--gradient-brand-soft)] blur-md" aria-hidden />
        <img
          src={logoSrc}
          alt="HK Global Trading"
          className={cn("relative object-contain", dim)}
          width={64}
          height={64}
        />
      </span>
      {showWordmark && (
        <span className={cn("leading-none tracking-tight", text)}>
          HK <span className="text-gradient">Global</span>
        </span>
      )}
    </span>
  );
}