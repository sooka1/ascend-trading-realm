// A tiny LIFO stack of "back handlers". Overlays (modals, sheets, drawers,
// popovers) push a close-handler while open; the global back button pops
// and runs the top handler before falling back to router navigation.

import { useEffect } from "react";

type Handler = () => void;

const stack: Handler[] = [];

export function pushBackHandler(fn: Handler): () => void {
  stack.push(fn);
  return () => {
    const i = stack.lastIndexOf(fn);
    if (i !== -1) stack.splice(i, 1);
  };
}

export function consumeTopBackHandler(): boolean {
  // First, try to close any open Radix overlay (Dialog/Sheet/Drawer/
  // AlertDialog/Popover/DropdownMenu/HoverCard) by dispatching Escape —
  // Radix listens for it and closes the top-most layer. This covers every
  // shadcn overlay without wrapping each primitive.
  if (typeof document !== "undefined") {
    const openOverlay = document.querySelector(
      '[data-state="open"][role="dialog"], [data-state="open"][role="alertdialog"], [data-state="open"][role="menu"], [data-radix-popper-content-wrapper] [data-state="open"]',
    );
    if (openOverlay) {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
      );
      return true;
    }
  }
  const fn = stack.pop();
  if (!fn) return false;
  try {
    fn();
  } catch {
    // ignore
  }
  return true;
}

// Register a back handler while `active` is true.
export function useBackHandler(active: boolean, fn: Handler) {
  useEffect(() => {
    if (!active) return;
    return pushBackHandler(fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}