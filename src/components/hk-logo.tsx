import { cn } from "@/lib/utils";

// Single, canonical platform logo. Served from public/ so it is available at
// /branding/hkex-logo-platform.png with no bundler transform.
const LOGO_SRC = "/branding/hkex-logo-platform.png";
const LOGO_ALT = "HKEX — 交易・投資・成長";

interface HKLogoProps {
  className?: string;
  /** Deprecated: the logo image already contains the wordmark. Kept for API compatibility. */
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  /** Deprecated: no container is rendered around the logo anymore. Kept for API compatibility. */
  variant?: "default" | "chip";
}

export function HKLogo({ className, size = "md" }: HKLogoProps) {
  // Height-only sizing with w-auto keeps the original aspect ratio intact so
  // the candlestick section next to the wordmark is always fully visible.
  // - sm: mobile headers (~48-56px tall)
  // - md: desktop / portal / admin headers (~60-68px tall, scales down on mobile)
  // - lg: auth / verify-email / marketing hero (~300-380px wide)
  const dim =
    size === "sm"
      ? "h-12 sm:h-14 w-auto"
      : size === "lg"
        ? "h-auto w-[300px] sm:w-[360px] md:w-[400px] max-w-full"
        : "h-12 sm:h-16 md:h-[68px] w-auto";

  return (
    <img
      src={LOGO_SRC}
      alt={LOGO_ALT}
      className={cn("block object-contain select-none", dim, className)}
      draggable={false}
    />
  );
}