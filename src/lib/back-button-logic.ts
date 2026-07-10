// Pure, framework-free logic for the smart back button. Kept side-effect
// free so it can be unit-tested without a router or DOM.

export type BackAction =
  | { kind: "history-back" }
  | { kind: "navigate"; to: string };

export const AUTH_ROUTES = new Set(["/auth", "/forgot-password", "/reset-password"]);

export function fallbackPath(current: string): string {
  if (!current || current === "/") return "/";
  const trimmed = current.replace(/\/+$/, "");
  const idx = trimmed.lastIndexOf("/");
  if (idx <= 0) return "/";
  return trimmed.slice(0, idx);
}

export function decideBackAction(params: {
  pathname: string;
  historyLength: number;
  referrer: string | null | undefined;
  currentOrigin: string;
}): BackAction {
  const { pathname, historyLength, referrer, currentOrigin } = params;

  // Home has no back action; caller must not render the button there.
  if (pathname === "/") return { kind: "navigate", to: "/" };

  // Auth/recovery routes must never use history.back() — the previous entry
  // is usually a protected route that immediately redirects back here.
  if (AUTH_ROUTES.has(pathname)) return { kind: "navigate", to: "/" };

  let sameOriginReferrer = true;
  if (referrer) {
    try {
      sameOriginReferrer = new URL(referrer).origin === currentOrigin;
    } catch {
      sameOriginReferrer = false;
    }
  }

  const hasInAppHistory = historyLength > 1 && sameOriginReferrer;
  if (hasInAppHistory) return { kind: "history-back" };
  return { kind: "navigate", to: fallbackPath(pathname) };
}