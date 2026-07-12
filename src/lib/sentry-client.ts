// Browser-only Sentry helper.
//
// CRITICAL: This module MUST NOT statically import `@sentry/tanstackstart-react`
// (nor `@sentry/react` / `@sentry/browser`). Doing so pulls the browser SDK —
// and transitively `@sentry/node` shims via the tanstackstart wrapper — into
// the SSR Worker bundle. All Sentry APIs are loaded via dynamic `import()`
// inside function bodies so the module graph reachable from SSR contains
// only `@sentry/cloudflare` (see `src/lib/sentry.server.ts` + `src/server.ts`).

type SentryBrowser = typeof import("@sentry/tanstackstart-react");

// Public-by-design DSN — safe in the client bundle. Server DSN is a
// separate Cloudflare Worker `env.SENTRY_DSN` binding.
const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

let sentry: SentryBrowser | undefined;
let initPromise: Promise<void> | undefined;

export function initSentryClient(): Promise<void> {
  if (typeof window === "undefined" || !dsn) return Promise.resolve();
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const mod = (await import("@sentry/tanstackstart-react")) as SentryBrowser;
    mod.init({
      dsn,
      environment: import.meta.env.MODE,
      // Requirement: no tracing / replay / logs / metrics for now.
      tracesSampleRate: 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      // Only ignore clearly-expected cancellation noise. Do NOT broadly
      // ignore NetworkError — that would hide real outages.
      ignoreErrors: [
        "AbortError",
        "The user aborted a request.",
        "cancelled",
        "canceled",
        "ResizeObserver loop limit exceeded",
        "ResizeObserver loop completed with undelivered notifications.",
      ],
    });
    sentry = mod;
    // Dedupe: mark the value so the Lovable error-capture hook can skip
    // re-reporting the identical exception object.
    (window as unknown as { __sentryReported?: WeakSet<object> }).__sentryReported =
      new WeakSet();
  })();
  return initPromise;
}

/** Report to Sentry once per error object; safe to call from anywhere. */
export function captureClientException(
  error: unknown,
  context?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  if (!sentry) {
    // Not yet initialized — try to init lazily; drop this event silently.
    void initSentryClient();
    return;
  }
  const seen = (window as unknown as { __sentryReported?: WeakSet<object> })
    .__sentryReported;
  if (error && typeof error === "object") {
    if (seen?.has(error as object)) return;
    seen?.add(error as object);
  }
  sentry.captureException(error, context ? { extra: context } : undefined);
}