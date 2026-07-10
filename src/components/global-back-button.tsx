import { useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

// Floating "back" button rendered globally from the root layout so it
// appears on every page (existing, new, and future) except the home page.
export function GlobalBackButton() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/") return null;

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      void router.navigate({ to: "/" });
    }
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