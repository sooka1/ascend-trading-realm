import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { captureServerException } from "@/lib/sentry.server";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    // Uncaught request-middleware failure — forward to Sentry then render
    // the standalone HTML fallback (unchanged UX).
    captureServerException(error, { source: "request_middleware" });
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Server function middleware — captures throws from serverFn handlers,
// rethrows so existing error semantics are preserved. Runs only on the
// server (client half is a no-op).
const sentryFunctionMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    try {
      return await next();
    } catch (error) {
      captureServerException(error, { source: "server_function" });
      throw error;
    }
  },
);

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth, sentryFunctionMiddleware],
  requestMiddleware: [errorMiddleware],
}));
