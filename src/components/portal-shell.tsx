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
  Menu,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useMfaEnforcement } from "@/hooks/use-mfa-enforcement";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UserBadge } from "@/components/user-badge";

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
  const routerPathname = useRouterState({ select: (s) => s.location.pathname });
  // On first paint (before router hydration), fall back to window.location so
  // the active section shows the correct page immediately after a hard refresh.
  const pathname =
    routerPathname && routerPathname !== "/"
      ? routerPathname
      : typeof window !== "undefined"
        ? window.location.pathname
        : routerPathname;
  const router = useRouter();
  useMfaEnforcement();
  const queryClient = useQueryClient();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["portal", "notifications", "unread-count"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return 0;
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid)
        .is("read_at", null);
      return count ?? 0;
    },
    refetchInterval: 30000,
  });
  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  const groups = useMemo(
    () => Array.from(new Set(NAV.map((n) => n.group ?? "misc"))),
    [],
  );

  const activeNav = useMemo(
    () =>
      [...NAV]
        .sort((a, b) => b.to.length - a.to.length)
        .find((n) => (n.to === "/portal" ? pathname === "/portal" : pathname.startsWith(n.to))) ?? NAV[0],
    [pathname],
  );
  const ActiveIcon = activeNav.icon;

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-5">
      {groups.map((g) => (
        <div key={g}>
          <p className="mb-1.5 px-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            {GROUP_LABELS[g] ?? g}
          </p>
          <ul className="space-y-0.5">
            {NAV.filter((n) => (n.group ?? "misc") === g).map((n) => {
              const active =
                n.to === "/portal" ? pathname === "/portal" : pathname.startsWith(n.to);
              return (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    data-active={active ? "true" : "false"}
                    data-testid={`portal-nav-${n.to.replace(/^\/portal\/?/, "") || "home"}`}
                    className={`nav-item group relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      active
                        ? "nav-item-active border border-gold/40 bg-gold/[0.12] text-foreground shadow-[inset_2px_0_0_theme(colors.amber.400)] font-medium"
                        : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
                    }`}
                  >
                    <n.icon
                      className={`h-5 w-5 shrink-0 ${active ? "text-gold" : "text-muted-foreground group-hover:text-gold"}`}
                    />
                    <span className="truncate">{n.label}</span>
                    {active && <span className="sr-only"> (الصفحة الحالية)</span>}
                    {active && (
                      <span className="ms-auto h-2 w-2 rounded-full bg-gold shadow-[0_0_8px_theme(colors.amber.400)]" aria-hidden />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

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
              <NavList />
            </div>
          </aside>

          {/* Main */}
          <main className="min-w-0">
            <header className="mb-6 border-b border-white/5 pb-6">
              <div className="mb-4 flex items-center justify-between gap-2 lg:hidden">
                <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                  <div className="flex min-w-0 items-center gap-2">
                    <SheetTrigger className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gold/40 bg-gold/[0.08] text-gold transition hover:border-gold/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">القائمة</span>
                    </SheetTrigger>
                    <span
                      role="status"
                      aria-live="polite"
                      aria-label={`القسم الحالي: ${activeNav.label}`}
                      data-testid="portal-active-section"
                      data-active-path={activeNav.to}
                      className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-gold/40 bg-gold/[0.10] px-2.5 py-1 text-xs font-medium text-gold shadow-[inset_0_0_0_1px_theme(colors.amber.400/0.15)]"
                    >
                      <ActiveIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{activeNav.label}</span>
                    </span>
                  </div>
                  <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto border-white/10 bg-card/95 p-5 backdrop-blur-xl">
                    <SheetHeader>
                      <SheetTitle className="pe-8 text-right font-mono text-[10px] uppercase tracking-[0.22em] text-gold/80">
                        Investor Portal
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-1">
                      <NavList onNavigate={() => setMobileNavOpen(false)} />
                    </div>
                  </SheetContent>
                </Sheet>
                <div className="flex items-center gap-2.5">
                  <UserBadge />
                  <Link
                    to="/portal/notifications"
                    aria-label="الإشعارات"
                    className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground transition hover:border-gold/40 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -end-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 font-mono text-[10px] font-semibold text-background">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground transition hover:border-red-400/40 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label="تسجيل الخروج"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold/80">{eyebrow}</p>
                  <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl md:text-4xl">{title}</h1>
                  {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
                </div>
                {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
                <div className="hidden items-center gap-2 lg:flex">
                  <UserBadge />
                  <Link
                to="/portal/notifications"
                aria-label="الإشعارات"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-muted-foreground transition hover:border-gold/40 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -end-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-mono text-[10px] font-semibold text-background">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-muted-foreground transition hover:border-red-400/40 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    تسجيل الخروج
                  </button>
                </div>
              </div>
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
      className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-card/50 p-4 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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