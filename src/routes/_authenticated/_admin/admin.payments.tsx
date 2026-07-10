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
import { listPaymentsAdmin, decidePaymentAdmin } from "@/lib/admin.functions";
import { ArrowUpRight, ArrowDownRight, Wallet, AlertCircle, Check, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/payments")({
  head: () => ({
    meta: [
      { title: "Admin — Payments" },
      { name: "description", content: "Payment log across all methods with manual review queue." },
    ],
  }),
  component: AdminPayments,
});

function AdminPayments() {
  const fetchList = useServerFn(listPaymentsAdmin);
  const decide = useServerFn(decidePaymentAdmin);
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [status, setStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "payments", status],
    queryFn: () => fetchList({ data: { status } }),
    staleTime: 30_000,
  });

  async function onDecide(kind: "deposit" | "withdrawal", id: string, decision: "approved" | "rejected") {
    let note: string | undefined;
    if (decision === "rejected") {
      note = window.prompt("سبب الرفض (اختياري):") ?? undefined;
    } else if (!window.confirm("تأكيد اعتماد هذه العملية؟")) {
      return;
    }
    setBusyId(`${kind}-${id}`);
    try {
      await decide({ data: { kind, id, decision, note } });
      toast.success(decision === "approved" ? "تم الاعتماد" : "تم الرفض");
      await qc.invalidateQueries({ queryKey: ["admin", "payments"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const t = data?.totals;
  return (
    <AdminShell
      eyebrow="Payments"
      title="سجل المدفوعات"
      subtitle="تدفقات الأموال (إيداعات وسحوبات) عبر جميع الوسائل — قابل للفلترة والمراجعة."
    >
      {error ? (
        <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200">
          {(error as Error).message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpi icon={ArrowUpRight} label="التدفق الداخل" value={fmtMoney(t?.inflow)} tone="positive" />
        <AdminKpi icon={ArrowDownRight} label="التدفق الخارج" value={fmtMoney(t?.outflow)} />
        <AdminKpi icon={AlertCircle} label="قيد المراجعة" value={fmtInt(t?.pending)} tone="warning" />
        <AdminKpi icon={Wallet} label="مرفوضة" value={fmtInt(t?.failed)} tone="critical" />
      </div>

      <AdminCard title="جميع المدفوعات" icon={Wallet} className="mt-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition ${
                status === s
                  ? "border-gold/50 bg-gold/[0.08] text-foreground"
                  : "border-white/10 text-muted-foreground hover:border-gold/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-2 py-2 text-start">التاريخ</th>
                <th className="px-2 py-2 text-start">النوع</th>
                <th className="px-2 py-2 text-start">المستثمر</th>
                <th className="px-2 py-2 text-start">المبلغ</th>
                <th className="px-2 py-2 text-start">الطريقة/الوجهة</th>
                <th className="px-2 py-2 text-start">المرجع</th>
                <th className="px-2 py-2 text-end">الحالة</th>
                <th className="px-2 py-2 text-end">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-2 py-3">
                      <div className="h-6 animate-pulse rounded bg-white/[0.03]" />
                    </td>
                  </tr>
                ))
              ) : (data?.rows ?? []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-2 py-8 text-center text-muted-foreground">
                    لا توجد مدفوعات.
                  </td>
                </tr>
              ) : (
                (data!.rows as any[]).map((r) => (
                  <tr key={`${r.kind}-${r.id}`}>
                    <td className="px-2 py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-2 py-2.5">
                      <StatusPill tone={r.kind === "deposit" ? "positive" : "info"}>{r.kind}</StatusPill>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="font-medium">{r.profile?.display_name ?? "—"}</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {r.profile?.email ?? r.user_id.slice(0, 8)}
                      </div>
                    </td>
                    <td className={`px-2 py-2.5 font-semibold ${r.kind === "deposit" ? "text-emerald-300" : "text-amber-300"}`}>
                      {r.kind === "deposit" ? "+" : "−"}
                      {fmtMoney(r.amount, r.currency)}
                    </td>
                    <td className="px-2 py-2.5 text-muted-foreground">{r.method}</td>
                    <td className="px-2 py-2.5 font-mono text-xs text-muted-foreground">{r.reference ?? "—"}</td>
                    <td className="px-2 py-2.5 text-end">
                      <StatusPill
                        tone={
                          r.status === "approved"
                            ? "positive"
                            : r.status === "pending"
                              ? "warning"
                              : r.status === "rejected"
                                ? "critical"
                                : "neutral"
                        }
                      >
                        {r.status}
                      </StatusPill>
                    </td>
                    <td className="px-2 py-2.5 text-end">
                      {r.status === "pending" ? (
                        <div className="flex justify-end gap-1">
                          <button
                            disabled={busyId === `${r.kind}-${r.id}`}
                            onClick={() => onDecide(r.kind, r.id, "approved")}
                            title="اعتماد"
                            className="rounded border border-emerald-400/30 bg-emerald-400/[0.08] p-1.5 text-emerald-300 hover:border-emerald-400/60 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            disabled={busyId === `${r.kind}-${r.id}`}
                            onClick={() => onDecide(r.kind, r.id, "rejected")}
                            title="رفض"
                            className="rounded border border-red-400/30 bg-red-400/[0.08] p-1.5 text-red-300 hover:border-red-400/60 disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
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