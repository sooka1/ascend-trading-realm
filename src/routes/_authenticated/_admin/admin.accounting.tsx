import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  AdminShell,
  AdminCard,
  AdminKpi,
  Sparkline,
  fmtMoney,
  fmtInt,
} from "@/components/admin-shell";
import { getAccountingSummary } from "@/lib/admin.functions";
import { TrendingUp, TrendingDown, Landmark, Download, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/accounting")({
  head: () => ({
    meta: [
      { title: "Admin — Accounting" },
      { name: "description", content: "Revenue, expenses, and profit reports across the last 12 months." },
    ],
  }),
  component: AdminAccounting,
});

function AdminAccounting() {
  const fetchSum = useServerFn(getAccountingSummary);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "accounting"],
    queryFn: () => fetchSum(),
    staleTime: 60_000,
  });

  function exportCsv() {
    if (!data) return;
    const header = "Month,Revenue,Expenses,Net,Subscriptions";
    const body = data.rows
      .map((r) => `${r.month},${r.revenue},${r.expenses},${r.net},${r.subscriptions}`)
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accounting-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const t = data?.totals;

  return (
    <AdminShell
      eyebrow="Accounting"
      title="التقارير المحاسبية"
      subtitle="الإيرادات، المصروفات، وصافي التدفق النقدي — تحليل شهري لآخر 12 شهراً."
      actions={
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-md border border-gold/30 bg-gold/[0.06] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-gold transition hover:bg-gold/[0.12]"
        >
          <Download className="h-3.5 w-3.5" /> تصدير CSV
        </button>
      }
    >
      {error ? (
        <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200">
          {(error as Error).message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpi icon={TrendingUp} label="إجمالي الإيرادات (12ش)" value={fmtMoney(t?.revenue)} tone="positive" />
        <AdminKpi icon={TrendingDown} label="إجمالي المصروفات (12ش)" value={fmtMoney(t?.expenses)} tone="warning" />
        <AdminKpi icon={Landmark} label="صافي الربح" value={fmtMoney(t?.net)} tone={(t?.net ?? 0) >= 0 ? "positive" : "critical"} />
        <AdminKpi icon={FileText} label="اشتراكات مُنشأة" value={fmtInt(t?.subscriptions)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <AdminCard title="الإيرادات الشهرية" icon={TrendingUp}>
          <Sparkline data={(data?.rows ?? []).map((r) => r.revenue)} height={80} />
        </AdminCard>
        <AdminCard title="المصروفات الشهرية" icon={TrendingDown}>
          <Sparkline data={(data?.rows ?? []).map((r) => r.expenses)} height={80} />
        </AdminCard>
        <AdminCard title="صافي التدفق" icon={Landmark}>
          <Sparkline data={(data?.rows ?? []).map((r) => r.net)} height={80} />
        </AdminCard>
      </div>

      <AdminCard title="التفصيل الشهري" icon={FileText} className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-2 py-2 text-start">الشهر</th>
                <th className="px-2 py-2 text-end">الإيرادات</th>
                <th className="px-2 py-2 text-end">المصروفات</th>
                <th className="px-2 py-2 text-end">الصافي</th>
                <th className="px-2 py-2 text-end">اشتراكات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-2 py-3">
                      <div className="h-6 animate-pulse rounded bg-white/[0.03]" />
                    </td>
                  </tr>
                ))
              ) : (
                (data?.rows ?? []).map((r) => (
                  <tr key={r.month}>
                    <td className="px-2 py-2.5 font-mono text-xs">{r.month}</td>
                    <td className="px-2 py-2.5 text-end text-emerald-300">{fmtMoney(r.revenue)}</td>
                    <td className="px-2 py-2.5 text-end text-amber-300">{fmtMoney(r.expenses)}</td>
                    <td className={`px-2 py-2.5 text-end font-semibold ${r.net >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                      {fmtMoney(r.net)}
                    </td>
                    <td className="px-2 py-2.5 text-end">{fmtInt(r.subscriptions)}</td>
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