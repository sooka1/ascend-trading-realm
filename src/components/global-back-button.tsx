import { useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { decideBackAction } from "@/lib/back-button-logic";
import { consumeTopBackHandler } from "@/lib/back-stack";

// Floating "back" button rendered globally from the root layout so it
// appears on every page (existing, new, and future) except the home page.
export function GlobalBackButton() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const busyRef = useRef(false);
  const [pressed, setPressed] = useState(false);

  // Re-render on browser back/forward gestures (swipe on mobile) so the
  // fallback timeout below reads the latest pathname. TanStack already
  // reacts to popstate, but this keeps the button state stable during the
  // gesture animation on iOS Safari.
  useEffect(() => {
    const onPop = () => {
      busyRef.current = false;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (pathname === "/") return null;

  const goBack = () => {
    if (typeof window === "undefined") return;
    if (busyRef.current) return; // guard against double-tap on touch devices
    busyRef.current = true;
    // Release after a short lockout regardless of outcome.
    window.setTimeout(() => (busyRef.current = false), 400);

    // If any overlay (modal/sheet/drawer/popover) is open, close it first
    // instead of navigating between pages.
    if (consumeTopBackHandler()) return;

    const action = decideBackAction({
      pathname,
      historyLength: window.history.length,
      referrer: document.referrer,
      currentOrigin: window.location.origin,
    });
    if (action.kind === "history-back") {
      router.history.back();
      const before = window.location.pathname;
      window.setTimeout(() => {
        if (window.location.pathname === before) {
          void router.navigate({ to: "/" });
        }
      }, 200);
      return;
    }
    void router.navigate({ to: action.to });
  };

  return (
    <button
      type="button"
      onClick={goBack}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      aria-label="رجوع"
      style={{
        top: "max(1rem, env(safe-area-inset-top))",
        right: "max(1rem, env(safe-area-inset-right))",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
      }}
      className={`fixed z-[60] inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-card/80 px-3 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur-md transition select-none hover:bg-card hover:border-gold/40 active:scale-95 ${
        pressed ? "scale-95 border-gold/40" : ""
      }`}
    >
      <ArrowRight className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
      <span className="hidden sm:inline">رجوع</span>
      <span className="sr-only sm:hidden">رجوع</span>
    </button>
  );
}