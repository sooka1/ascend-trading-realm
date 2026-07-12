// Server-side Sentry helper for the Cloudflare Worker runtime.
//
// IMPORTANT: This module does NOT call Sentry.init and does NOT read
// process.env. Sentry is initialized exclusively by `Sentry.withSentry`
// in `src/server.ts`, which binds the DSN from the Worker `env` argument.
// captureServerException MUST be called from code reached through that
// wrapper (SSR path, API routes, server functions).

import * as Sentry from "@sentry/cloudflare";

export function captureServerException(
  error: unknown,
  context?: Record<string, unknown>,
) {
  try {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  } catch {
    // Sentry not initialized (missing DSN binding) — swallow so we never
    // break the request path just because observability is degraded.
  }
}