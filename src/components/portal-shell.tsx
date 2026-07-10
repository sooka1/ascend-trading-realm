import { Link, useRouterState } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wallet,
  Landmark,
  FileText,
  Receipt,
  LineChart,
  FolderOpen,
  Bell,
  LifeBuoy,
  User,
  ShieldCheck,
  Settings,
  Download,
  History,
  Zap,
  Star,
  Newspaper,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useMfaEnforcement } from "@/hooks/use-mfa-enforcement";

type NavItem = { to: string; icon: LucideIcon; label: string; group?: string };

const NAV: NavItem[] = [
  { to: "/portal", icon: LayoutDashboard, label: "لوحة القيادة", group: "overview" },
  { to: "/portal/portfolio", icon: Wallet, label: "المحفظة", group: "overview" },
  { to: "/portal/accounts", icon: Landmark, label: "الحسابات الاستثمارية", group: "overview" },
  { to: "/portal/statements", icon: FileText, label: "الكشوف", group: "reports" },
  { to: "/portal/transactions", icon: Receipt, label: "سجل العمليات", group: "reports" },
  { to: "/portal/performance", icon: LineChart, label: "تقارير الأداء", group: "reports" },
  { to: "/portal/documents", icon: FolderOpen, label: "المستندات", group: "reports" },
  { to: "/portal/notifications", icon: Bell, label: "الإشعارات", group: "engagement" },
  { to: "/portal/support", icon: LifeBuoy, label: "الدعم", group: "engagement" },
  { to: "/portal/updates", icon: Newspaper, label: "التحديثات", group: "engagement" },
  { to: "/portal/activity", icon: History, label: "سجل النشاط", group: "engagement" },
  { to: "/portal/favorites", icon: Star, label: "المفضلة", group: "engagement" },
  { to: "/portal/profile", icon: User, label: "الملف الشخصي", group: "account" },
  { to: "/portal/mfa", icon: ShieldCheck, label: "الأمان والمصادقة", group: "account" },
  { to: "/portal/settings", icon: Settings, label: "الإعدادات", group: "account" },
  { to: "/portal/downloads", icon: Download, label: "التنزيلات", group: "account" },
];

const GROUP_LABELS: Record<string, string> = {
  overview: "نظرة عامة",
  reports: "التقارير والمستندات",
  engagement: "الأنشطة والاتصال",
  account: "الحساب",
};

export function PortalShell({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const router = useRouter();
  useMfaEnforcement();
  const queryClient = useQueryClient();
  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  const groups = Array.from(new Set(NAV.map((n) => n.group ?? "misc")));

  return (
    <PageShell bare>
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="sticky top-6 hidden self-start lg:block">
            <div className="rounded-xl border border-white/10 bg-card/50 p-4 backdrop-blur-xl">
              <p className="mb-4 px-2 font-mono text-[10px] uppercase tracking-[0.22em] text-gold/80">
                Investor Portal
              </p>
              <nav className="space-y-5">
                {groups.map((g) => (
                  <div key={g}>
                    <p className="mb-1.5 px-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      {GROUP_LABELS[g] ?? g}
                    </p>
                    <ul className="space-y-0.5">
                      {NAV.filter((n) => (n.group ?? "misc") === g).map((n) => {
                        const active =
                          n.to === "/portal"
                            ? pathname === "/portal"
                            : pathname.startsWith(n.to);
                        return (
                          <li key={n.to}>
                            <Link
                              to={n.to}
                              className={`group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition ${
                                active
                                  ? "bg-gold/[0.08] text-foreground"
                                  : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
                              }`}
                            >
                              <n.icon
                                className={`h-4 w-4 shrink-0 ${active ? "text-gold" : "text-muted-foreground group-hover:text-gold"}`}
                              />
                              <span className="truncate">{n.label}</span>
                              {active && (
                                <span className="ms-auto h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main className="min-w-0">
            {/* Mobile nav */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2 lg:hidden">
              {NAV.map((n) => {
                const active = n.to === "/portal" ? pathname === "/portal" : pathname.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition ${
                      active
                        ? "border-gold/40 bg-gold/[0.08] text-foreground"
                        : "border-white/10 text-muted-foreground hover:border-gold/40 hover:text-foreground"
                    }`}
                  >
                    <n.icon className="h-3.5 w-3.5" />
                    {n.label}
                  </Link>
                );
              })}
            </div>

            <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold/80">{eyebrow}</p>
                <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">{title}</h1>
                {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-muted-foreground transition hover:border-red-400/40 hover:text-red-200"
              >
                <LogOut className="h-3.5 w-3.5" />
                تسجيل الخروج
              </button>
            </header>

            <div>{children}</div>
          </main>
        </div>
      </div>
    </PageShell>
  );
}

export function QuickAction({
  to,
  icon: Icon,
  label,
  hint,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  hint?: string;
}) {
  return (
    <Link
      to={to}
      className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-card/50 p-4 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-gold/40"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gold/20 bg-gold/[0.06]">
        <Icon className="h-5 w-5 text-gold" />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium text-foreground">{label}</span>
        {hint && <span className="block truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{hint}</span>}
      </span>
      <Zap className="ms-auto h-4 w-4 text-muted-foreground opacity-0 transition group-hover:text-gold group-hover:opacity-100" />
    </Link>
  );
}

export function PortalCard({
  title,
  icon: Icon,
  action,
  children,
  className = "",
}: {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative overflow-hidden rounded-xl border border-white/10 bg-card/50 p-6 backdrop-blur-xl ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {Icon && (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gold/20 bg-gold/[0.06]">
              <Icon className="h-4 w-4 text-gold" />
            </span>
          )}
          <h2 className="font-display text-lg font-semibold">{title}</h2>
        </div>
        {action}
      </div>
      {children}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" aria-hidden />
    </section>
  );
}