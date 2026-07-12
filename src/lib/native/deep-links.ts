import { Capacitor } from "@capacitor/core";

// hkex:// deep-link → in-app router path.
// Supported hosts: investment, portfolio, competition, copy, notification, referral, kyc
//
// Examples:
//   hkex://investment/123        → /portal/portfolio?investment=123
//   hkex://portfolio              → /portal/portfolio
//   hkex://competition/abc        → /competitions/abc
//   hkex://copy/master-42         → /portal/copy-trading?master=master-42
//   hkex://notification/xyz       → /portal/notifications?id=xyz
//   hkex://referral/CODE          → /portal/referrals?code=CODE
//   hkex://kyc                    → /portal/profile?section=kyc
//
// Also handles universal-link https://hkexinvest.com/* — passed through as-is.
export function resolveDeepLink(rawUrl: string): string | null {
  if (!rawUrl) return null;
  let url: URL;
  try { url = new URL(rawUrl); } catch { return null; }

  // Universal / App links — trust the path as-is.
  if (url.protocol === "https:" || url.protocol === "http:") {
    return url.pathname + url.search + url.hash;
  }

  if (url.protocol !== "hkex:") return null;

  const host = url.hostname || url.pathname.replace(/^\/+/, "").split("/")[0];
  const segments = url.pathname.replace(/^\/+/, "").split("/").filter(Boolean);
  const first = url.hostname ? segments[0] : segments[1];
  const q = url.search;

  switch (host) {
    case "investment":
      return first ? `/portal/portfolio?investment=${encodeURIComponent(first)}` : "/portal/portfolio";
    case "portfolio":
      return "/portal/portfolio" + q;
    case "competition":
      return first ? `/competitions/${encodeURIComponent(first)}` : "/competitions";
    case "copy":
      return first ? `/portal/copy-trading?master=${encodeURIComponent(first)}` : "/portal/copy-trading";
    case "notification":
      return first ? `/portal/notifications?id=${encodeURIComponent(first)}` : "/portal/notifications";
    case "referral":
      return first ? `/portal/referrals?code=${encodeURIComponent(first)}` : "/portal/referrals";
    case "kyc":
      return "/portal/profile?section=kyc";
    default:
      return null;
  }
}

// Wire the platform-level URL listeners. Consumers navigate via the
// "app:deeplink" window event so this file stays router-agnostic.
export async function initDeepLinks() {
  if (typeof window === "undefined") return;

  const dispatch = (path: string | null) => {
    if (!path) return;
    window.dispatchEvent(new CustomEvent("app:deeplink", { detail: path }));
  };

  // Native — Capacitor App plugin fires appUrlOpen for custom + universal links.
  if (Capacitor.isNativePlatform()) {
    try {
      const { App } = await import("@capacitor/app");
      App.addListener("appUrlOpen", ({ url }: { url: string }) => {
        dispatch(resolveDeepLink(url));
      });
      const launch = await App.getLaunchUrl();
      if (launch?.url) dispatch(resolveDeepLink(launch.url));
    } catch {}
  }

  // Web fallback — allow ?dl=hkex%3A%2F%2Finvestment%2F123 on the marketing site.
  const params = new URLSearchParams(window.location.search);
  const dl = params.get("dl");
  if (dl) dispatch(resolveDeepLink(dl));

  // Push listener bridge (already dispatched by push.ts): re-normalize hkex:// urls.
  window.addEventListener("app:deeplink", (e: Event) => {
    const detail = (e as CustomEvent<string>).detail;
    if (typeof detail === "string" && detail.startsWith("hkex://")) {
      const resolved = resolveDeepLink(detail);
      if (resolved) {
        // Re-dispatch resolved path.
        window.dispatchEvent(new CustomEvent("app:navigate", { detail: resolved }));
      }
    } else if (typeof detail === "string") {
      window.dispatchEvent(new CustomEvent("app:navigate", { detail }));
    }
  });
}