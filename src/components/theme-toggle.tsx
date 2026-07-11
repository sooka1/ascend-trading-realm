import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle({ size = "md" }: { size?: "sm" | "md" }) {
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";
  const dim = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? "التبديل إلى الوضع الداكن" : "التبديل إلى الوضع الفاتح"}
      title={isLight ? "Dark mode" : "Light mode"}
      className={`inline-flex ${dim} items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground transition hover:border-gold/40 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
    >
      {isLight ? <Moon className={icon} /> : <Sun className={icon} />}
    </button>
  );
}
