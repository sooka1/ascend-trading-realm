import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  AdminShell,
  AdminCard,
  AdminKpi,
  StatusPill,
  fmtInt,
  fmtBytes,
} from "@/components/admin-shell";
import { getSystemMonitoring } from "@/lib/admin.functions";
import { Database, HardDrive, Gauge, AlertTriangle, Activity, Server } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/monitoring")({
  head: () => ({
    meta: [
      { title: "Admin — System Monitoring" },
      { name: "description", content: "Platform health: database, storage, error rate, table sizes." },
    ],
  }),
  component: AdminMonitoring,
});

function AdminMonitoring() {
  const fetchMon = useServerFn(getSystemMonitoring);
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "monitoring"],
    queryFn: () => fetchMon(),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  const dbLatency = data?.dbLatencyMs ?? 0;
  const latencyTone: "positive" | "warning" | "critical" =
    dbLatency < 200 ? "positive" : dbLatency < 800 ? "warning" : "critical";

  return (
    <AdminShell
      eyebrow="System Monitoring"
      title="مراقبة النظام"
      subtitle="صحة قاعدة البيانات، استهلاك التخزين، معدل الأخطاء، وحجم الجداول الأساسية."
      actions={
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition hover:border-gold/40 hover:text-foreground"
        >
          <Activity className={`h-3.5 w-3.5 ${isFetching ? "animate-pulse text-gold" : ""}`} />
          {isFetching ? "جارٍ التحديث" : "تحديث"}
        </button>
      }
    >
      {error ? (
        <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200">
          تعذّر تحميل البيانات: {(error as Error).message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpi
          icon={Database}
          label="حالة قاعدة البيانات"
          value={isLoading ? "—" : data?.dbHealthy ? "متصلة" : "خطأ"}
          hint={data?.dbError ?? "Postgres via Data API"}
          tone={data?.dbHealthy ? "positive" : "critical"}
        />
        <AdminKpi
          icon={Gauge}
          label="زمن استجابة القاعدة"
          value={isLoading ? "—" : `${fmtInt(dbLatency)} ms`}
          hint="Latency probe"
          tone={latencyTone}
        />
        <AdminKpi
          icon={HardDrive}
          label="مساحة التخزين"
          value={isLoading ? "—" : fmtBytes(data?.storage.bytes ?? 0)}
          hint={data ? `${fmtInt(data.storage.objects)} ملف` : undefined}
        />
        <AdminKpi
          icon={AlertTriangle}
          label="معدل الأخطاء (24س)"
          value={
            isLoading
              ? "—"
              : `${((data?.errors24h.rate ?? 0) * 100).toFixed(2)}%`
          }
          hint={data ? `${fmtInt(data.errors24h.failed)} من ${fmtInt(data.errors24h.total)}` : undefined}
          tone={
            (data?.errors24h.rate ?? 0) > 0.05
              ? "critical"
              : (data?.errors24h.rate ?? 0) > 0.01
                ? "warning"
                : "positive"
          }
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AdminCard title="حجم الجداول الأساسية" icon={Database}>
          {isLoading ? (
            <ul className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="h-8 animate-pulse rounded bg-white/[0.03]" />
              ))}
            </ul>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {(data?.tables ?? []).map((t) => (
                <li key={t.table} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">{t.table}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-display text-base font-semibold">{fmtInt(t.count)}</span>
                    {t.error ? <StatusPill tone="critical">خطأ</StatusPill> : <StatusPill tone="positive">OK</StatusPill>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard title="حالة الخدمات" icon={Server}>
          <ul className="divide-y divide-white/[0.06]">
            <ServiceRow
              name="Data API (PostgREST)"
              healthy={!!data?.dbHealthy}
              hint={`${fmtInt(dbLatency)} ms`}
            />
            <ServiceRow name="Storage (documents bucket)" healthy hint={fmtBytes(data?.storage.bytes ?? 0)} />
            <ServiceRow name="Auth" healthy hint="Supabase Auth" />
            <ServiceRow name="Server Functions (Worker)" healthy hint="Cloudflare Workers" />
          </ul>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            آخر تحديث: {data ? new Date(data.generatedAt).toLocaleTimeString() : "—"}
          </p>
        </AdminCard>
      </div>

      <p className="mt-6 rounded-md border border-white/5 bg-white/[0.02] p-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        ملاحظة: يعمل الواجهة الخلفية على Cloudflare Workers، وبعض مقاييس البنية التحتية (CPU/RAM على مستوى المضيف) غير متاحة على مستوى التطبيق. المقاييس الظاهرة هنا هي ما يمكن قياسه بأمان من داخل التطبيق.
      </p>
    </AdminShell>
  );
}

function ServiceRow({ name, healthy, hint }: { name: string; healthy: boolean; hint?: string }) {
  return (
    <li className="flex items-center justify-between py-2.5 text-sm">
      <span>{name}</span>
      <span className="flex items-center gap-2">
        {hint && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {hint}
          </span>
        )}
        <StatusPill tone={healthy ? "positive" : "critical"}>
          {healthy ? "Operational" : "Down"}
        </StatusPill>
      </span>
    </li>
  );
}