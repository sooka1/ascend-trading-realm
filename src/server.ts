import "./lib/error-capture";

import * as Sentry from "@sentry/cloudflare";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

const workerHandler = {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      // Expose the Worker `env` binding (same mechanism Sentry uses via
      // withSentry) so server functions can read runtime secrets such as
      // AUTH_RATE_LIMIT_HMAC_KEY without touching process.env. The value
      // is never logged or returned to the client.
      try {
        (globalThis as unknown as { env?: unknown }).env = env;
      } catch {
        // never break the response path
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      // Also forward to Sentry — withSentry catches uncaught throws, but
      // we return an HTML fallback here so it wouldn't otherwise escape.
      try {
        Sentry.captureException(error);
      } catch {
        // ignore — never break the response path
      }
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

// Sentry.withSentry initializes Sentry per-request using the Worker
// `env` binding, then wraps `fetch` so uncaught throws are reported.
// When env.SENTRY_DSN is absent, withSentry no-ops (safe in dev).
export default Sentry.withSentry(
  (env: { SENTRY_DSN?: string }) => ({
    dsn: env?.SENTRY_DSN,
    // Requirement: no tracing / logs / profiling yet.
    tracesSampleRate: 0,
  }),
  workerHandler,
);
