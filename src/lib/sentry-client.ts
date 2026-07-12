import * as Sentry from "@sentry/tanstackstart-react";

// Public-by-design DSN — safe in the client bundle. Server DSN is a
// separate Cloudflare Worker `env.SENTRY_DSN` binding.
const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

let initialized = false;

export function initSentryClient() {
  if (initialized || typeof window === "undefined" || !dsn) return;
  initialized = true;

  Sentry.init({
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

  // Dedupe: mark the value so the Lovable error-capture hook can skip
  // re-reporting the identical exception object.
  const g = window as unknown as {
    __sentryReported?: WeakSet<object>;
  };
  g.__sentryReported = new WeakSet();
}

/** Report to Sentry once per error object; safe to call from anywhere. */
export function captureClientException(
  error: unknown,
  context?: Record<string, unknown>,
) {
  if (!initialized || typeof window === "undefined") return;
  const seen = (window as unknown as { __sentryReported?: WeakSet<object> })
    .__sentryReported;
  if (error && typeof error === "object") {
    if (seen?.has(error as object)) return;
    seen?.add(error as object);
  }
  Sentry.captureException(error, context ? { extra: context } : undefined);
}