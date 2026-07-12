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
  // Height caps with `w-auto` preserve the original aspect ratio (~1.82:1)
  // so the candlestick and wordmark are never cropped. The logo must NOT
  // dictate header height — `max-h` + `shrink-0` lets the header size itself.
  // Public-header caps per spec: mobile 38px · tablet 44px · desktop 52px.
  const dim =
    size === "sm"
      ? // Mobile / portal / admin compact headers (max-height driven).
        "max-h-[38px] sm:max-h-[44px] w-auto shrink-0"
      : size === "lg"
        ? // Auth pages, footer, loading/error surfaces (width driven).
          "h-auto w-[300px] sm:w-[360px] md:w-[400px] max-w-full shrink-0"
        : // Default = public desktop header, responsive down to mobile.
          "max-h-[38px] sm:max-h-[44px] md:max-h-[52px] w-auto shrink-0";

  return (
    <img
      src={LOGO_SRC}
      alt={LOGO_ALT}
      className={cn("block object-contain select-none", dim, className)}
      draggable={false}
    />
  );
}