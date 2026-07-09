import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  AdminShell,
  AdminCard,
  AdminKpi,
  Sparkline,
  StatusPill,
  fmtInt,
} from "@/components/admin-shell";
import { getPlatformAnalytics } from "@/lib/admin.functions";
import { Users, TrendingUp, LineChart, LifeBuoy, Activity, Percent } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Admin — Platform Analytics" },
      { name: "description", content: "DAU, WAU, MAU, retention, churn, subscription and ticket breakdowns." },
    ],
  }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const fetchAn = useServerFn(getPlatformAnalytics);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => fetchAn(),
    staleTime: 60_000,
  });

  const stickiness = data && data.mau > 0 ? data.dau / data.mau : 0;

  return (
    <AdminShell
      eyebrow="Platform Analytics"
      title="التحليلات التنفيذية"
      subtitle="نشاط المستخدمين، النمو، الاحتفاظ، ومعدل الاستهلاك عبر آخر 90 يوماً."
    >
      {error ? (
        <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200">
          تعذّر تحميل البيانات: {(error as Error).message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpi
          icon={Activity}
          label="Daily Active"
          value={isLoading ? "—" : fmtInt(data?.dau)}
          hint="آخر 24 ساعة"
          tone="positive"
        />
        <AdminKpi
          icon={Users}
          label="Weekly Active"
          value={isLoading ? "—" : fmtInt(data?.wau)}
          hint="آخر 7 أيام"
        />
        <AdminKpi
          icon={LineChart}
          label="Monthly Active"
          value={isLoading ? "—" : fmtInt(data?.mau)}
          hint="آخر 30 يوماً"
        />
        <AdminKpi
          icon={Percent}
          label="Stickiness (DAU/MAU)"
          value={isLoading ? "—" : `${(stickiness * 100).toFixed(1)}%`}
          hint="مؤشر الالتصاق"
          tone={stickiness > 0.2 ? "positive" : "warning"}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <AdminCard title="نمو المستخدمين (90 يوماً)" icon={TrendingUp} className="lg:col-span-2">
          <Sparkline data={(data?.growth ?? []).map((g) => g.users)} height={120} />
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              الإجمالي التراكمي
            </span>
            <span className="font-display text-3xl font-semibold text-gold">
              {fmtInt(data?.totalUsers)}
            </span>
          </div>
        </AdminCard>

        <AdminCard title="Churn" icon={Percent}>
          <div className="font-display text-4xl font-semibold text-amber-300">
            {isLoading ? "—" : `${((data?.churn ?? 0) * 100).toFixed(1)}%`}
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            نسبة الاشتراكات المغلقة أو الملغاة
          </p>
        </AdminCard>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AdminCard title="توزيع الاشتراكات حسب الحالة" icon={LineChart}>
          <StatusList data={data?.subByStatus} loading={isLoading} />
        </AdminCard>
        <AdminCard title="تذاكر الدعم حسب الحالة" icon={LifeBuoy}>
          <StatusList data={data?.ticketByStatus} loading={isLoading} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}

function StatusList({
  data,
  loading,
}: {
  data: Record<string, number> | undefined;
  loading: boolean;
}) {
  if (loading) {
    return (
      <ul className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="h-8 animate-pulse rounded bg-white/[0.03]" />
        ))}
      </ul>
    );
  }
  const entries = Object.entries(data ?? {});
  if (entries.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-white/10 px-4 py-6 text-center text-sm text-muted-foreground">
        لا توجد بيانات.
      </p>
    );
  }
  const total = entries.reduce((a, [, v]) => a + v, 0);
  const tone = (k: string) =>
    k === "active" || k === "resolved" || k === "closed"
      ? "positive"
      : k === "pending" || k === "paused"
        ? "warning"
        : k === "open"
          ? "info"
          : k === "rejected" || k === "cancelled"
            ? "critical"
            : "neutral";
  return (
    <ul className="divide-y divide-white/[0.06]">
      {entries.map(([k, v]) => (
        <li key={k} className="flex items-center justify-between py-2.5 text-sm">
          <StatusPill tone={tone(k) as any}>{k}</StatusPill>
          <span className="flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold">{fmtInt(v)}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {total ? `${((v / total) * 100).toFixed(0)}%` : "—"}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}