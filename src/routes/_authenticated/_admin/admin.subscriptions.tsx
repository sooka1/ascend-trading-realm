import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AdminShell,
  AdminCard,
  AdminKpi,
  StatusPill,
  fmtInt,
  fmtMoney,
} from "@/components/admin-shell";
import {
  listSubscriptionsAdmin,
  setSubscriptionStatus,
} from "@/lib/admin.functions";
import { CreditCard, Landmark, Search, Play, Pause, X, Archive } from "lucide-react";

type StatusFilter = "all" | "active" | "pending" | "paused" | "closed" | "archived";

export const Route = createFileRoute("/_authenticated/_admin/admin/subscriptions")({
  head: () => ({
    meta: [
      { title: "Admin — Subscriptions" },
      { name: "description", content: "Manage investor subscription plans, statuses, and lifecycle." },
    ],
  }),
  component: AdminSubscriptions,
});

function AdminSubscriptions() {
  const fetchList = useServerFn(listSubscriptionsAdmin);
  const setStatus = useServerFn(setSubscriptionStatus);
  const qc = useQueryClient();
  const [status, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "subs", status, search],
    queryFn: () => fetchList({ data: { status, search } }),
    staleTime: 30_000,
  });

  async function transition(id: string, next: "active" | "paused" | "closed" | "archived") {
    setBusy(id);
    try {
      await setStatus({ data: { id, status: next } });
      toast.success("تم التحديث");
      qc.invalidateQueries({ queryKey: ["admin", "subs"] });
      qc.invalidateQueries({ queryKey: ["admin", "executive"] });
    } catch (e: any) {
      toast.error(e.message ?? "فشل التحديث");
    } finally {
      setBusy(null);
    }
  }

  const t = data?.totals;

  return (
    <AdminShell
      eyebrow="Subscription Management"
      title="إدارة الاشتراكات"
      subtitle="التحكم الكامل بدورة حياة اشتراكات المستثمرين — تفعيل، إيقاف مؤقت، إغلاق أو أرشفة."
    >
      {error ? (
        <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200">
          {(error as Error).message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpi icon={CreditCard} label="اشتراكات نشطة" value={fmtInt(t?.active)} tone="positive" />
        <AdminKpi icon={Landmark} label="AUM النشط" value={fmtMoney(t?.aum)} tone="positive" />
        <AdminKpi label="قيد الانتظار" value={fmtInt(t?.pending)} tone="warning" />
        <AdminKpi label="مغلقة / موقوفة" value={fmtInt((t?.closed ?? 0) + (t?.paused ?? 0))} />
      </div>

      <AdminCard title="سجل الاشتراكات" icon={CreditCard} className="mt-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(["all", "active", "pending", "paused", "closed", "archived"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition ${
                status === s
                  ? "border-gold/50 bg-gold/[0.08] text-foreground"
                  : "border-white/10 text-muted-foreground hover:border-gold/30 hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
          <div className="ms-auto relative">
            <Search className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث..."
              className="w-56 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 pl-8 text-sm placeholder:text-muted-foreground focus:border-gold/40 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-2 py-2 text-start">المستثمر</th>
                <th className="px-2 py-2 text-start">الباقة</th>
                <th className="px-2 py-2 text-start">المبلغ</th>
                <th className="px-2 py-2 text-start">الحالة</th>
                <th className="px-2 py-2 text-start">تاريخ البدء</th>
                <th className="px-2 py-2 text-end">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-2 py-3">
                      <div className="h-6 animate-pulse rounded bg-white/[0.03]" />
                    </td>
                  </tr>
                ))
              ) : (data?.rows ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2 py-8 text-center text-muted-foreground">
                    لا توجد اشتراكات مطابقة.
                  </td>
                </tr>
              ) : (
                (data!.rows as any[]).map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="px-2 py-2.5">
                      <div className="font-medium">{r.profile?.display_name ?? "—"}</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {r.profile?.email ?? r.user_id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      <div>{r.packages?.name ?? "—"}</div>
                      {r.packages?.risk_level && (
                        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {r.packages.risk_level} · {r.packages.lockup_months ?? 0}m lockup
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2.5 font-semibold">
                      {fmtMoney(Number(r.amount), r.currency || "USD")}
                    </td>
                    <td className="px-2 py-2.5">
                      <StatusPill
                        tone={
                          r.status === "active"
                            ? "positive"
                            : r.status === "pending"
                              ? "warning"
                              : r.status === "closed" || r.status === "archived"
                                ? "critical"
                                : "neutral"
                        }
                      >
                        {r.status}
                      </StatusPill>
                    </td>
                    <td className="px-2 py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {r.started_at ? new Date(r.started_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {r.status !== "active" && (
                          <ActionBtn
                            onClick={() => transition(r.id, "active")}
                            disabled={busy === r.id}
                            icon={<Play className="h-3 w-3" />}
                            label="تفعيل"
                            tone="positive"
                          />
                        )}
                        {r.status === "active" && (
                          <ActionBtn
                            onClick={() => transition(r.id, "paused")}
                            disabled={busy === r.id}
                            icon={<Pause className="h-3 w-3" />}
                            label="إيقاف"
                            tone="warning"
                          />
                        )}
                        {r.status !== "closed" && r.status !== "archived" && (
                          <ActionBtn
                            onClick={() => transition(r.id, "closed")}
                            disabled={busy === r.id}
                            icon={<X className="h-3 w-3" />}
                            label="إغلاق"
                            tone="critical"
                          />
                        )}
                        {r.status !== "archived" && (
                          <ActionBtn
                            onClick={() => transition(r.id, "archived")}
                            disabled={busy === r.id}
                            icon={<Archive className="h-3 w-3" />}
                            label="أرشفة"
                            tone="neutral"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </AdminShell>
  );
}

function ActionBtn({
  onClick,
  disabled,
  icon,
  label,
  tone,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  tone: "positive" | "warning" | "critical" | "neutral";
}) {
  const cls =
    tone === "positive"
      ? "border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/[0.08]"
      : tone === "warning"
        ? "border-amber-400/30 text-amber-200 hover:bg-amber-400/[0.08]"
        : tone === "critical"
          ? "border-red-400/30 text-red-200 hover:bg-red-400/[0.08]"
          : "border-white/15 text-muted-foreground hover:border-gold/40 hover:text-foreground";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition disabled:opacity-40 ${cls}`}
    >
      {icon}
      {label}
    </button>
  );
}