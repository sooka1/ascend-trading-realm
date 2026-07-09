import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { getAdminOverview } from "@/lib/admin.functions";
import { Users, Wallet, ArrowDownToLine, LifeBuoy, ShieldCheck, ArrowLeftRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/")({
  head: () => ({
    meta: [
      { title: "Admin — Overview" },
      { name: "description", content: "Enterprise admin overview: users, requests, tickets." },
    ],
  }),
  component: AdminIndex,
});

function AdminIndex() {
  const fetchOverview = useServerFn(getAdminOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => fetchOverview(),
    staleTime: 30_000,
  });

  return (
    <PageShell bare>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-widest text-gold">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">لوحة الإدارة</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          نظرة عامة على النشاط والطلبات المعلّقة والدعم.
        </p>

        {error ? (
          <div className="glass mt-6 rounded-2xl p-6 text-sm text-red-300">
            تعذّر تحميل البيانات: {(error as Error).message}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat icon={<Users className="h-4 w-4" />} label="المستخدمون" value={data?.users} loading={isLoading} />
          <Stat icon={<Wallet className="h-4 w-4" />} label="إيداعات معلّقة" value={data?.pendingDeposits} loading={isLoading} accent="amber" />
          <Stat icon={<ArrowDownToLine className="h-4 w-4" />} label="سحوبات معلّقة" value={data?.pendingWithdrawals} loading={isLoading} accent="amber" />
          <Stat icon={<LifeBuoy className="h-4 w-4" />} label="تذاكر دعم مفتوحة" value={data?.openTickets} loading={isLoading} />
          <Stat
            icon={<ArrowLeftRight className="h-4 w-4" />}
            label="إيداعات معتمدة (30 يوم)"
            value={data ? Math.round(data.depositsApproved30d).toLocaleString() : undefined}
            loading={isLoading}
            accent="emerald"
          />
          <Stat
            icon={<ArrowLeftRight className="h-4 w-4" />}
            label="سحوبات معتمدة (30 يوم)"
            value={data ? Math.round(data.withdrawalsApproved30d).toLocaleString() : undefined}
            loading={isLoading}
          />
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NavCard to="/admin/users" title="إدارة المستخدمين" desc="الأدوار والصلاحيات" icon={<ShieldCheck className="h-4 w-4" />} />
          <NavCard to="/admin/finance" title="طلبات مالية" desc="إيداع وسحب" icon={<Wallet className="h-4 w-4" />} />
          <NavCard to="/admin/audit" title="سجل التدقيق" desc="أحدث العمليات" icon={<ArrowLeftRight className="h-4 w-4" />} />
        </div>
      </section>
    </PageShell>
  );
}

function Stat({
  icon,
  label,
  value,
  loading,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string | undefined;
  loading?: boolean;
  accent?: "amber" | "emerald";
}) {
  const accentCls =
    accent === "amber"
      ? "text-amber-300"
      : accent === "emerald"
      ? "text-emerald-300"
      : "text-foreground";
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={`mt-3 font-display text-3xl font-semibold ${accentCls}`}>
        {loading ? "—" : value ?? 0}
      </div>
    </div>
  );
}

function NavCard({
  to,
  title,
  desc,
  icon,
}: {
  to: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="glass group rounded-2xl p-5 transition-colors hover:border-gold/30"
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}