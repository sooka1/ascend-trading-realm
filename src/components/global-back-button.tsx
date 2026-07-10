import { useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

// Floating "back" button rendered globally from the root layout so it
// appears on every page (existing, new, and future) except the home page.
export function GlobalBackButton() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/") return null;

  const goBack = () => {
    // Smart back: if there's real in-app history, go back. Otherwise navigate
    // to a sensible fallback — the parent path when nested, else the home page.
    const hasInAppHistory =
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      (!document.referrer || new URL(document.referrer).origin === window.location.origin);

    if (hasInAppHistory) {
      router.history.back();
      // If back() didn't change the location shortly, fall back.
      const before = window.location.pathname;
      window.setTimeout(() => {
        if (window.location.pathname === before) {
          void router.navigate({ to: fallbackPath(before) });
        }
      }, 120);
      return;
    }
    void router.navigate({ to: fallbackPath(pathname) });
  };

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="رجوع"
      className="fixed top-4 right-4 z-[60] inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-card/80 px-3 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur-md transition hover:bg-card hover:border-gold/40 active:scale-95"
    >
      <ArrowRight className="h-3.5 w-3.5" />
      <span>رجوع</span>
    </button>
  );
}

function fallbackPath(current: string): string {
  const trimmed = current.replace(/\/+$/, "");
  const parent = trimmed.slice(0, trimmed.lastIndexOf("/"));
  return parent && parent !== "" ? parent : "/";
}