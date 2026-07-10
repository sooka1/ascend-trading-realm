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