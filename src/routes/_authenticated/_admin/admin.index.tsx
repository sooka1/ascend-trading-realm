import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  AdminShell,
  AdminCard,
  AdminKpi,
  AdminQuickAction,
  Sparkline,
  StatusPill,
  fmtInt,
  fmtMoney,
} from "@/components/admin-shell";
import { getExecutiveDashboard } from "@/lib/admin.functions";
import { checkEmailHasRole } from "@/lib/rbac.functions";
import {
  Users,
  Wallet,
  ArrowDownToLine,
  LifeBuoy,
  ShieldCheck,
  ArrowLeftRight,
  Activity,
  TrendingUp,
  CreditCard,
  Landmark,
  History,
  Zap,
  Bell,
} from "lucide-react";
import { CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/")({
  head: () => ({
    meta: [
      { title: "Admin — Executive Dashboard" },
      { name: "description", content: "Executive control center: KPIs, live activity, revenue and subscriptions." },
    ],
  }),
  component: AdminIndex,
});

function AdminIndex() {
  const fetchDashboard = useServerFn(getExecutiveDashboard);
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "executive"],
    queryFn: () => fetchDashboard(),
    staleTime: 15_000,
    refetchInterval: 60_000,
  });

  const checkRole = useServerFn(checkEmailHasRole);
  const TARGET_EMAIL = "hassan.muorad@gmail.com";
  const { data: superAdminCheck, isFetching: isCheckingRole } = useQuery({
    queryKey: ["admin", "verify-super-admin", TARGET_EMAIL],
    queryFn: () => checkRole({ data: { email: TARGET_EMAIL, role: "super_admin" } }),
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

  const t = data?.totals;

  return (
    <AdminShell
      eyebrow="Executive Control Center"
      title="لوحة القيادة التنفيذية"
      subtitle="نظرة شاملة على أداء المنصة والعمليات المالية والنشاط الحيّ لحظة بلحظة."
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

      {/* Super admin verification */}
      <div
        className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-sm ${
          superAdminCheck?.ok
            ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-100"
            : "border-amber-400/20 bg-amber-400/[0.06] text-amber-100"
        }`}
      >
        <div className="flex items-center gap-3">
          {superAdminCheck?.ok ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          ) : (
            <XCircle className="h-5 w-5 text-amber-300" />
          )}
          <div>
            <p className="font-medium">
              {superAdminCheck?.ok
                ? "تم التحقق: هذا الحساب يملك دور super_admin"
                : "لم يتم العثور على دور super_admin لهذا الحساب"}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              {TARGET_EMAIL}
            </p>
          </div>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {isCheckingRole ? "جارٍ التحقق…" : "تحديث تلقائي كل 15 ث"}
        </span>
      </div>

      {/* KPI grid — each tile links to its detail page */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiLink to="/admin/users">
          <AdminKpi
            icon={Users}
            label="إجمالي المستخدمين"
            value={isLoading ? "—" : fmtInt(t?.users)}
            hint={t ? `+${fmtInt(t.newUsers30d)} خلال 30 يوماً` : undefined}
          />
        </KpiLink>
        <KpiLink to="/admin/subscriptions">
          <AdminKpi
            icon={CreditCard}
            label="اشتراكات نشطة"
            value={isLoading ? "—" : fmtInt(t?.activeSubscriptions)}
            hint={t ? `${fmtInt(t.totalSubscriptions)} إجمالي` : undefined}
            tone="positive"
          />
        </KpiLink>
        <KpiLink to="/admin/accounting">
          <AdminKpi
            icon={Landmark}
            label="رأس مال تحت الإدارة"
            value={isLoading ? "—" : fmtMoney(t?.aum)}
            hint="Assets Under Management"
            tone="positive"
          />
        </KpiLink>
        <KpiLink to="/admin/analytics">
          <AdminKpi
            icon={TrendingUp}
            label="رأس مال جديد (30ي)"
            value={isLoading ? "—" : fmtMoney(t?.newCapital30d)}
            hint="Inflows via subscriptions"
            tone="positive"
          />
        </KpiLink>
        <KpiLink to="/admin/payments">
          <AdminKpi
            icon={Wallet}
            label="إيداعات معلّقة"
            value={isLoading ? "—" : fmtInt(t?.pendingDeposits)}
            tone={t && t.pendingDeposits > 0 ? "warning" : "neutral"}
          />
        </KpiLink>
        <KpiLink to="/admin/payments">
          <AdminKpi
            icon={ArrowDownToLine}
            label="سحوبات معلّقة"
            value={isLoading ? "—" : fmtInt(t?.pendingWithdrawals)}
            tone={t && t.pendingWithdrawals > 0 ? "warning" : "neutral"}
          />
        </KpiLink>
        <KpiLink to="/admin/support">
          <AdminKpi
            icon={LifeBuoy}
            label="تذاكر دعم مفتوحة"
            value={isLoading ? "—" : fmtInt(t?.openTickets)}
            tone={t && t.openTickets > 5 ? "warning" : "neutral"}
          />
        </KpiLink>
        <KpiLink to="/admin/finance">
          <AdminKpi
            icon={ArrowLeftRight}
            label="حركة معتمدة (30ي)"
            value={isLoading ? "—" : fmtMoney((t?.depositsApproved30d ?? 0) + (t?.withdrawalsApproved30d ?? 0))}
            hint={t ? `${fmtMoney(t.depositsApproved30d)} إيداع · ${fmtMoney(t.withdrawalsApproved30d)} سحب` : undefined}
          />
        </KpiLink>
      </div>

      {/* Trend charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <AdminCard title="تدفق الإيداعات (30 يوماً)" icon={TrendingUp}>
          <Sparkline data={(data?.series.deposits ?? []).map((r) => r.total)} height={64} />
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              الإجمالي
            </span>
            <span className="font-display text-2xl font-semibold text-emerald-300">
              {fmtMoney(t?.depositsApproved30d)}
            </span>
          </div>
        </AdminCard>
        <AdminCard title="تدفق السحوبات (30 يوماً)" icon={ArrowDownToLine}>
          <Sparkline data={(data?.series.withdrawals ?? []).map((r) => r.total)} height={64} />
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              الإجمالي
            </span>
            <span className="font-display text-2xl font-semibold">
              {fmtMoney(t?.withdrawalsApproved30d)}
            </span>
          </div>
        </AdminCard>
        <AdminCard title="نمو الاشتراكات (30 يوماً)" icon={CreditCard}>
          <Sparkline data={(data?.series.subscriptions ?? []).map((r) => r.total)} height={64} />
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              رأس مال جديد
            </span>
            <span className="font-display text-2xl font-semibold text-gold">
              {fmtMoney(t?.newCapital30d)}
            </span>
          </div>
        </AdminCard>
      </div>

      {/* Quick actions */}
      <div className="mt-6">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          إجراءات سريعة
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminQuickAction to="/admin/finance" icon={Wallet} label="مراجعة الطلبات المالية" hint="Deposits & withdrawals" />
          <AdminQuickAction to="/admin/users" icon={ShieldCheck} label="إدارة المستخدمين والأدوار" hint="RBAC & access" />
          <AdminQuickAction to="/admin/audit" icon={History} label="سجل التدقيق" hint="Recent audit trail" />
          <AdminQuickAction to="/admin/monitoring" icon={Zap} label="صحة النظام" hint="DB · storage · errors" />
        </div>
      </div>

      {/* Live activity + recent requests */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AdminCard
          title="النشاط الحيّ"
          icon={Activity}
          action={<StatusPill tone="info">Live</StatusPill>}
        >
          {isLoading ? (
            <SkeletonRows />
          ) : (data?.activity ?? []).length === 0 ? (
            <EmptyLine text="لا يوجد نشاط حديث." />
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {(data!.activity as any[]).slice(0, 10).map((a) => (
                <li key={a.id} className="flex items-start gap-3 py-2.5">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-gold">
                        {a.action}
                      </span>
                      <span className="mx-2 text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{a.entity}</span>
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard title="أحدث طلبات الاستثمار" icon={Bell}>
          {isLoading ? (
            <SkeletonRows />
          ) : (data?.recentRequests ?? []).length === 0 ? (
            <EmptyLine text="لا توجد طلبات حديثة." />
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {(data!.recentRequests as any[]).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate">
                      {fmtMoney(Number(r.amount), r.currency || "USD")}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
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
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </AdminShell>
  );
}

function SkeletonRows() {
  return (
    <ul className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="h-8 animate-pulse rounded bg-white/[0.03]" />
      ))}
    </ul>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <p className="rounded-md border border-dashed border-white/10 px-4 py-6 text-center text-sm text-muted-foreground">
      {text}
    </p>
  );
}

function KpiLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="block rounded-xl transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
    >
      {children}
    </Link>
  );
}