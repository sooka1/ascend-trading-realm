import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { captureServerException } from "@/lib/sentry.server";

// GET /api/public/ops — internal monitoring snapshot for uptime dashboards.
// Protected by a shared-secret bearer token (OPS_MONITOR_TOKEN).
// Emits queue, cron, and database health metrics gathered server-side via
// the service role. Never call from browser code.
function verifyBearer(header: string | null, expected: string): boolean {
  if (!header?.startsWith("Bearer ")) return false;
  const supplied = Buffer.from(header.slice(7));
  const target = Buffer.from(expected);
  if (supplied.length !== target.length) return false;
  return timingSafeEqual(supplied, target);
}

// Silence unused import warning while keeping named import stable.
const _hmac = createHmac;
void _hmac;

export const Route = createFileRoute("/api/public/ops")({
  server: {
    handlers: {
      GET: async ({ request }) => {
       try {
        const token = process.env.OPS_MONITOR_TOKEN;
        if (!token) return new Response("Not configured", { status: 503 });
        if (!verifyBearer(request.headers.get("authorization"), token)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const startedAt = Date.now();

        const [{ data: queue }, { data: crons }, { data: recent }] = await Promise.all([
          supabaseAdmin.rpc("queue_health"),
          supabaseAdmin
            .from("cron_jobs_v" as never)
            .select("*")
            .limit(0)
            .then(() => ({ data: null })), // Placeholder — cron.job is not in Data API.
          supabaseAdmin
            .from("ledger_integrity_daily")
            .select("as_of_date,row_count,is_balanced,total_credits,total_debits")
            .order("as_of_date", { ascending: false })
            .limit(3),
        ]);

        return new Response(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            duration_ms: Date.now() - startedAt,
            queue,
            crons,
            ledger_recent: recent ?? [],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          },
        );
       } catch (e) {
         captureServerException(e, { route: "/api/public/ops" });
         throw e;
       }
      },
    },
  },
});