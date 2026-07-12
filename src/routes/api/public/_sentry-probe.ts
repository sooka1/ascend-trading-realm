import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import * as Sentry from "@sentry/cloudflare";

// TEMPORARY preview-only Sentry verification probe.
// Guarantees:
//  - only responds on the exact deployed preview hostname
//  - requires a one-time SENTRY_PROBE_TOKEN header
//  - requires an authenticated super_admin bearer token
//  - no DB writes, no wallet/trade/competition/webhook/user-data operations
//  - returns dsnPresent (boolean only), eventId, flushed — never the DSN value
const PREVIEW_HOST = "id-preview--5d06956d-0893-4e53-8e16-f9255052df0e.lovable.app";

export const Route = createFileRoute("/api/public/_sentry-probe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        if (url.hostname !== PREVIEW_HOST) {
          return new Response("Not found", { status: 404 });
        }

        const expectedToken = process.env.SENTRY_PROBE_TOKEN;
        const providedToken = request.headers.get("x-probe-token");
        if (!expectedToken || !providedToken || providedToken !== expectedToken) {
          return new Response("Forbidden", { status: 403 });
        }

        const authHeader = request.headers.get("authorization") ?? "";
        const jwt = authHeader.toLowerCase().startsWith("bearer ")
          ? authHeader.slice(7).trim()
          : "";
        if (!jwt) return new Response("Unauthorized", { status: 401 });

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!supabaseUrl || !supabaseKey) {
          return new Response("Server misconfigured", { status: 500 });
        }
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
          global: { headers: { Authorization: `Bearer ${jwt}` } },
        });
        const { data: userRes, error: userErr } = await supabase.auth.getUser(jwt);
        if (userErr || !userRes?.user) {
          return new Response("Unauthorized", { status: 401 });
        }
        const userId = userRes.user.id;
        const { data: isSuper, error: roleErr } = await supabase.rpc("has_role", {
          _user_id: userId,
          _role: "super_admin",
        });
        if (roleErr || !isSuper) return new Response("Forbidden", { status: 403 });

        const dsnPresent = Boolean(process.env.SENTRY_DSN);

        const eventId = Sentry.captureException(
          new Error("Sentry verification probe — safe to ignore"),
          {
            tags: { probe: "sentry_verify" },
            extra: { source: "api/public/_sentry-probe", host: url.hostname, userId },
          },
        );

        let flushed = false;
        try {
          flushed = await Sentry.flush(3000);
        } catch {
          flushed = false;
        }

        return new Response(
          JSON.stringify({ dsnPresent, eventId: eventId ?? null, flushed, host: url.hostname }),
          { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
        );
      },
    },
  },
});