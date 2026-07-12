import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// GET /api/public/health — liveness + readiness probe for external monitors.
// Returns HTTP 200 only when every critical dependency is reachable.
export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async () => {
        const startedAt = Date.now();
        const version = process.env.APP_VERSION ?? "unknown";

        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY;
        const checks: Record<string, { ok: boolean; latency_ms?: number; detail?: string }> = {
          app: { ok: true },
          database: { ok: false },
          market_data: { ok: false },
        };

        if (!url || !key) {
          checks.database.detail = "supabase env missing";
        } else {
          const client = createClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
          });
          try {
            const t0 = Date.now();
            const { error } = await client.from("instruments").select("id", { count: "exact", head: true }).limit(1);
            checks.database = { ok: !error, latency_ms: Date.now() - t0, detail: error?.message };
          } catch (e) {
            checks.database = { ok: false, detail: (e as Error).message };
          }
          try {
            const t0 = Date.now();
            const { data, error } = await client
              .from("market_data_prices_latest")
              .select("updated_at")
              .order("updated_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            const fresh = data?.updated_at
              ? Date.now() - new Date(data.updated_at as string).getTime() < 15 * 60_000
              : false;
            checks.market_data = {
              ok: !error && fresh,
              latency_ms: Date.now() - t0,
              detail: error?.message ?? (fresh ? undefined : "stale (>15min)"),
            };
          } catch (e) {
            checks.market_data = { ok: false, detail: (e as Error).message };
          }
        }

        const healthy = Object.values(checks).every((c) => c.ok);
        return new Response(
          JSON.stringify({
            status: healthy ? "ok" : "degraded",
            version,
            timestamp: new Date().toISOString(),
            uptime_check_ms: Date.now() - startedAt,
            checks,
          }),
          {
            status: healthy ? 200 : 503,
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          },
        );
      },
    },
  },
});