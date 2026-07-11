import { createFileRoute, Link } from "@tanstack/react-router";
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
  getPortfolioManagerDashboard,
  triggerWeeklyDistribution,
} from "@/lib/admin.functions";
import {
  Landmark,
  Users,
  Wallet,
  ArrowUpFromLine,
  ArrowDownToLine,
  TrendingUp,
  Zap,
  History,
  Activity,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/portfolio-manager")({
  head: () => ({
    meta: [
      { title: "Admin — Portfolio Manager" },
      {
        name: "description",
        content:
          "Institutional portfolio manager console: AUM per portfolio, capital allocation, profit distribution, approvals and audit trail.",
      },
    ],
  }),
  component: PortfolioManager,
});

function PortfolioManager() {
  const fetchDash = useServerFn(getPortfolioManagerDashboard);
  const distribute = useServerFn(triggerWeeklyDistribution);
  const qc = useQueryClient();
  const [distBusy, setDistBusy] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "portfolio-manager"],
    queryFn: () => fetchDash(),
    staleTime: 20_000,
    refetchInterval: 60_000,
  });

  async function runDistribution() {
    if (!confirm("تشغيل توزيع الأرباح لهذا اليوم؟ سيتم إنشاء توزيعات فقط للاشتراكات المؤهلة.")) return;
    setDistBusy(true);
    try {
      const r = await distribute();
      toast.success(`تم توزيع ${r.inserted} عملية.`);
      qc.invalidateQueries({ queryKey: ["admin", "portfolio-manager"] });
      qc.invalidateQueries({ queryKey: ["admin", "executive"] });
    } catch (e: any) {
      toast.error(e?.message ?? "فشل التوزيع");
    } finally {
      setDistBusy(false);
    }
  }

  const t = data?.totals;

  return (
    <AdminShell
      eyebrow="Managed Portfolios"
      title="إدارة المحافظ الاستثمارية"
      subtitle="مركز التحكم المؤسسي — الأصول تحت الإدارة، توزيع رأس المال، توزيع الأرباح، الموافقات وسجل التدقيق."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition hover:border-gold/40 hover:text-foreground"
          >
            <Activity className={`h-3.5 w-3.5 ${isFetching ? "animate-pulse text-gold" : ""}`} />
            {isFetching ? "جارٍ التحديث" : "تحديث"}
          </button>
          {data?.isSuperAdmin && (
            <button
              onClick={runDistribution}
              disabled={distBusy}
              className="inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold/[0.08] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-gold transition hover:bg-gold/[0.14] disabled:opacity-40"
            >
              <Zap className="h-3.5 w-3.5" />
              {distBusy ? "جارٍ التوزيع…" : "تشغيل توزيع الأرباح اليومي"}
            </button>
          )}
        </div>
      }
    >
      {error ? (
        <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200">
          {(error as Error).message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpi icon={Landmark} label="AUM الإجمالي" value={fmtMoney(t?.aum)} tone="positive" />
        <AdminKpi icon={Users} label="المستثمرون النشطون" value={fmtInt(t?.investors)} />
        <AdminKpi
          icon={ArrowDownToLine}
          label="إيداعات قيد الموافقة"
          value={`${fmtInt(t?.pendingDepositsCount)} · ${fmtMoney(t?.pendingDepositsAmount)}`}
          tone="warning"
        />
        <AdminKpi
          icon={ArrowUpFromLine}
          label="سحوبات قيد الموافقة"
          value={`${fmtInt(t?.pendingWithdrawalsCount)} · ${fmtMoney(t?.pendingWithdrawalsAmount)}`}
          tone="warning"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpi icon={TrendingUp} label="أرباح موزّعة اليوم" value={fmtMoney(t?.distributedToday)} />
        <AdminKpi label="عمليات اليوم" value={fmtInt(t?.distributedTodayCount)} />
        <AdminKpi label="أرباح آخر 30 يومًا" value={fmtMoney(t?.distributed30d)} />
        <AdminKpi label="اشتراكات معلّقة" value={fmtInt(t?.pendingSubs)} />
      </div>

      <AdminCard title="المحافظ (الباقات) — الأصول تحت الإدارة" icon={Landmark} className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-2 py-2 text-start">المحفظة</th>
                <th className="px-2 py-2 text-start">المخاطرة</th>
                <th className="px-2 py-2 text-start">العائد المستهدف</th>
                <th className="px-2 py-2 text-start">الحد الأدنى</th>
                <th className="px-2 py-2 text-start">قفل</th>
                <th className="px-2 py-2 text-start">مستثمرون</th>
                <th className="px-2 py-2 text-start">اشتراكات</th>
                <th className="px-2 py-2 text-end">AUM</th>
                <th className="px-2 py-2 text-end">حصة السوق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="px-2 py-3">
                      <div className="h-6 animate-pulse rounded bg-white/[0.03]" />
                    </td>
                  </tr>
                ))
              ) : (data?.byPackage ?? []).length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-2 py-8 text-center text-muted-foreground">
                    لا توجد محافظ.
                  </td>
                </tr>
              ) : (
                data!.byPackage.map((p) => {
                  const share = t?.aum ? (p.aum / t.aum) * 100 : 0;
                  return (
                    <tr key={p.id}>
                      <td className="px-2 py-2.5">
                        <div className="font-medium">{p.name}</div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {p.currency}
                        </div>
                      </td>
                      <td className="px-2 py-2.5">
                        <StatusPill
                          tone={
                            p.risk_level === "conservative"
                              ? "positive"
                              : p.risk_level === "aggressive"
                                ? "critical"
                                : "warning"
                          }
                        >
                          {p.risk_level}
                        </StatusPill>
                      </td>
                      <td className="px-2 py-2.5 font-mono text-xs">{p.target_return_pct.toFixed(2)}%</td>
                      <td className="px-2 py-2.5 font-mono text-xs">{fmtMoney(p.min_amount, p.currency)}</td>
                      <td className="px-2 py-2.5 font-mono text-xs">{p.lockup_months}m</td>
                      <td className="px-2 py-2.5">{fmtInt(p.investors)}</td>
                      <td className="px-2 py-2.5">{fmtInt(p.subs)}</td>
                      <td className="px-2 py-2.5 text-end font-semibold">{fmtMoney(p.aum, p.currency)}</td>
                      <td className="px-2 py-2.5 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full bg-gold/70"
                              style={{ width: `${Math.min(100, share)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {share.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminCard title="أكبر المستثمرين حسب رأس المال" icon={Users}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-2 py-2 text-start">المستثمر</th>
                  <th className="px-2 py-2 text-start">التحقق</th>
                  <th className="px-2 py-2 text-end">رأس المال</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {(data?.topInvestors ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-2 py-8 text-center text-muted-foreground">
                      لا يوجد مستثمرون نشطون.
                    </td>
                  </tr>
                ) : (
                  data!.topInvestors.map((r) => (
                    <tr key={r.user_id}>
                      <td className="px-2 py-2.5">
                        <div className="font-medium">{r.display_name ?? "—"}</div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {r.email ?? r.user_id.slice(0, 8)}
                        </div>
                      </td>
                      <td className="px-2 py-2.5">
                        <StatusPill
                          tone={r.verification_status === "verified" ? "positive" : "neutral"}
                        >
                          {r.verification_status ?? "pending"}
                        </StatusPill>
                      </td>
                      <td className="px-2 py-2.5 text-end font-semibold">{fmtMoney(r.aum)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>

        <AdminCard
          title="سجل التدقيق المالي"
          icon={History}
          action={
            <Link
              to="/admin/audit"
              className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-gold"
            >
              عرض الكل ←
            </Link>
          }
        >
          <ul className="space-y-2">
            {(data?.audit ?? []).length === 0 ? (
              <li className="py-6 text-center text-sm text-muted-foreground">لا توجد أحداث حديثة.</li>
            ) : (
              data!.audit.map((a) => (
                <li
                  key={a.id}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <StatusPill
                        tone={
                          a.to_status === "approved"
                            ? "positive"
                            : a.to_status === "rejected"
                              ? "critical"
                              : "warning"
                        }
                      >
                        {a.request_kind} · {a.action}
                      </StatusPill>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {a.from_status ?? "—"} → {a.to_status ?? "—"}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {new Date(a.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      المسؤول: <span className="text-foreground">{a.admin?.display_name ?? a.admin_id.slice(0, 8)}</span>
                    </span>
                    <span>
                      المستثمر: <span className="text-foreground">{a.target?.display_name ?? a.target_user_id.slice(0, 8)}</span>
                    </span>
                    {a.reason && <span className="italic">— {a.reason}</span>}
                  </div>
                </li>
              ))
            )}
          </ul>
        </AdminCard>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          to="/admin/finance"
          className="rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-gold/40"
        >
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <Wallet className="h-3.5 w-3.5" /> Approvals
          </div>
          <div className="mt-2 text-lg font-semibold">مراجعة طلبات الإيداع والسحب</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {fmtInt((t?.pendingDepositsCount ?? 0) + (t?.pendingWithdrawalsCount ?? 0))} عنصر بانتظار الموافقة.
          </div>
        </Link>
        <Link
          to="/admin/subscriptions"
          className="rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-gold/40"
        >
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" /> Subscriptions
          </div>
          <div className="mt-2 text-lg font-semibold">إدارة اشتراكات المحافظ</div>
          <div className="mt-1 text-sm text-muted-foreground">
            تفعيل، إيقاف، إغلاق أو أرشفة اشتراكات المستثمرين.
          </div>
        </Link>
      </div>
    </AdminShell>
  );
}