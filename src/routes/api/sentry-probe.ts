// TEMPORARY — one-shot Sentry verification probe. Delete after use.
// Gates: (1) request host must NOT be a production host,
//        (2) caller must be authenticated super_admin.
// No wallet/trade/competition/webhook/user-data operations.
import { createFileRoute } from "@tanstack/react-router";
import * as Sentry from "@sentry/cloudflare";

const PRODUCTION_HOSTS = new Set([
  "hkexinvest.com",
  "www.hkexinvest.com",
  "hkexinvest-com.lovable.app",
]);

export const Route = createFileRoute("/api/sentry-probe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const host = new URL(request.url).host.toLowerCase();
        if (PRODUCTION_HOSTS.has(host)) {
          return new Response("Not found", { status: 404 });
        }

        const auth = request.headers.get("authorization") ?? "";
        const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        if (!bearer) return new Response("Unauthorized", { status: 401 });

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const { data: userRes, error: userErr } =
          await supabaseAdmin.auth.getUser(bearer);
        if (userErr || !userRes?.user) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { data: isSuper } = await supabaseAdmin.rpc("has_role", {
          _user_id: userRes.user.id,
          _role: "super_admin",
        });
        if (!isSuper) return new Response("Forbidden", { status: 403 });

        const err = new Error("Sentry verification probe — safe to ignore");
        Sentry.captureException(err, {
          tags: { probe: "sentry_verify" },
          extra: {
            source: "api/_sentry_probe",
            host,
            userId: userRes.user.id,
            capturedAt: new Date().toISOString(),
          },
        });
        return Response.json({
          ok: true,
          tag: "sentry_verify",
          host,
          userId: userRes.user.id,
        });
      },
    },
  },
});