import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Wallet,
  History,
  Activity,
  BarChart3,
  Server,
  Settings,
  Building2,
  CreditCard,
  FileText,
  Bell,
  Megaphone,
  Handshake,
  DatabaseBackup,
  Search,
  Zap,
  MessageCircle,
  LogOut,
  Menu,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useMfaEnforcement } from "@/hooks/use-mfa-enforcement";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type NavItem = {
  to: string;
  icon: LucideIcon;
  label: string;
  group: string;
  enabled?: boolean;
};

const NAV: NavItem[] = [
  { to: "/admin", icon: LayoutDashboard, label: "لوحة القيادة", group: "overview", enabled: true },
  { to: "/admin/analytics", icon: BarChart3, label: "التحليلات", group: "overview", enabled: true },
  { to: "/admin/monitoring", icon: Server, label: "مراقبة النظام", group: "overview", enabled: true },

  { to: "/admin/finance", icon: Wallet, label: "طلبات مالية", group: "operations", enabled: true },
  { to: "/admin/subscriptions", icon: CreditCard, label: "الاشتراكات", group: "operations", enabled: true },
  { to: "/admin/invoices", icon: FileText, label: "الفواتير", group: "operations", enabled: true },
  { to: "/admin/payments", icon: Wallet, label: "المدفوعات", group: "operations", enabled: true },
  { to: "/admin/accounting", icon: FileText, label: "التقارير المحاسبية", group: "operations", enabled: true },
  { to: "/admin/support", icon: MessageCircle, label: "رسائل العملاء", group: "operations", enabled: true },
  { to: "/admin/live-chat", icon: MessageCircle, label: "الشات المباشر", group: "operations", enabled: true },

  { to: "/admin/users", icon: Users, label: "المستخدمون", group: "identity", enabled: true },
  { to: "/admin/roles", icon: ShieldCheck, label: "الأدوار والصلاحيات", group: "identity", enabled: true },
  { to: "/admin/user-roles", icon: ShieldCheck, label: "تعيين أدوار المستخدمين", group: "identity", enabled: true },
  { to: "/admin/organizations", icon: Building2, label: "المؤسسات", group: "identity", enabled: true },

  { to: "/admin/audit", icon: History, label: "سجل التدقيق", group: "governance", enabled: true },
  { to: "/admin/notifications", icon: Bell, label: "الإشعارات", group: "governance", enabled: true },
  { to: "/admin/marketing", icon: Megaphone, label: "التسويق", group: "governance", enabled: true },
  { to: "/admin/partners", icon: Handshake, label: "الشركاء", group: "governance", enabled: true },

  { to: "/admin/backups", icon: DatabaseBackup, label: "النسخ الاحتياطي", group: "system", enabled: true },
  { to: "/admin/settings", icon: Settings, label: "إعدادات النظام", group: "system", enabled: true },
  { to: "/admin/search", icon: Search, label: "البحث الشامل", group: "system", enabled: true },
];

const GROUP_LABELS: Record<string, string> = {
  overview: "نظرة تنفيذية",
  operations: "العمليات المالية",
  identity: "الهوية والوصول",
  governance: "الحوكمة والاتصال",
  system: "النظام",
};

export function AdminShell({
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
  const groups = Array.from(new Set(NAV.map((n) => n.group)));
  const queryClient = useQueryClient();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  const renderItem = (n: NavItem, mobile = false) => {
    const active =
      n.to === "/admin" ? pathname === "/admin" : pathname.startsWith(n.to);
    const enabled = n.enabled !== false;
    const base = mobile
      ? "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition"
      : "group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition";
    const cls = active
      ? mobile
        ? "border-gold/40 bg-gold/[0.08] text-foreground"
        : "bg-gold/[0.08] text-foreground"
      : enabled
        ? mobile
          ? "border-white/10 text-muted-foreground hover:border-gold/40 hover:text-foreground"
          : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
        : mobile
          ? "border-white/5 text-muted-foreground/40 cursor-not-allowed"
          : "text-muted-foreground/40 cursor-not-allowed";

    const inner = (
      <>
        <n.icon
          className={`${mobile ? "h-3.5 w-3.5" : "h-4 w-4 shrink-0"} ${
            active ? "text-gold" : enabled ? "text-muted-foreground group-hover:text-gold" : "text-muted-foreground/40"
          }`}
        />
        <span className={mobile ? "" : "truncate"}>{n.label}</span>
        {!mobile && active && (
          <span className="ms-auto h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
        )}
        {!mobile && !enabled && (
          <span className="ms-auto font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60">
            قريباً
          </span>
        )}
      </>
    );

    if (!enabled) {
      return (
        <span key={n.to} className={`${base} ${cls}`} aria-disabled="true">
          {inner}
        </span>
      );
    }
    return (
      <Link
        key={n.to}
        to={n.to}
        onClick={() => mobile && setMobileNavOpen(false)}
        className={`${base} ${cls}`}
      >
        {inner}
      </Link>
    );
  };

  const renderSidebarNav = (onNavigate?: () => void) => (
    <nav className="space-y-5">
      {groups.map((g) => (
        <div key={g}>
          <p className="mb-1.5 px-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            {GROUP_LABELS[g] ?? g}
          </p>
          <ul className="space-y-0.5">
            {NAV.filter((n) => n.group === g).map((n) => {
              const active = n.to === "/admin" ? pathname === "/admin" : pathname.startsWith(n.to);
              const enabled = n.enabled !== false;
              const cls = active
                ? "bg-gold/[0.08] text-foreground"
                : enabled
                  ? "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
                  : "text-muted-foreground/40 cursor-not-allowed";
              const content = (
                <>
                  <n.icon className={`h-4 w-4 shrink-0 ${active ? "text-gold" : "text-muted-foreground"}`} />
                  <span className="truncate">{n.label}</span>
                  {active && <span className="ms-auto h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />}
                </>
              );
              return (
                <li key={n.to}>
                  {enabled ? (
                    <Link
                      to={n.to}
                      onClick={onNavigate}
                      className={`group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${cls}`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <span className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${cls}`} aria-disabled="true">
                      {content}
                    </span>
                  )}
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
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="sticky top-6 hidden self-start lg:block">
            <div className="rounded-xl border border-white/10 bg-card/50 p-4 backdrop-blur-xl">
              <p className="mb-4 px-2 font-mono text-[10px] uppercase tracking-[0.22em] text-gold/80">
                Super Admin
              </p>
              {renderSidebarNav()}
            </div>
          </aside>

          <main className="min-w-0">
            <header className="mb-6 border-b border-white/5 pb-6">
              <div className="mb-4 flex items-center justify-between gap-2 lg:hidden">
                <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                  <SheetTrigger className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground transition hover:border-gold/40 hover:text-gold">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">القائمة</span>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto border-white/10 bg-card/95 p-5 backdrop-blur-xl">
                    <SheetHeader>
                      <SheetTitle className="text-right font-mono text-[10px] uppercase tracking-[0.22em] text-gold/80">
                        Super Admin
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-1">
                      {renderSidebarNav(() => setMobileNavOpen(false))}
                    </div>
                  </SheetContent>
                </Sheet>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground transition hover:border-red-400/40 hover:text-red-200"
                  aria-label="تسجيل الخروج"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold/80">{eyebrow}</p>
                  <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl md:text-4xl">{title}</h1>
                  {subtitle && (
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
                  )}
                </div>
                {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="hidden items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-muted-foreground transition hover:border-red-400/40 hover:text-red-200 lg:inline-flex"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  تسجيل الخروج
                </button>
              </div>
            </header>

            <div>{children}</div>
          </main>
        </div>
      </div>
    </PageShell>
  );
}

export function AdminCard({
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
    <section
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-card/50 p-6 backdrop-blur-xl ${className}`}
    >
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
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
        aria-hidden
      />
    </section>
  );
}

export function AdminKpi({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "positive" | "warning" | "critical" | "neutral";
}) {
  const toneCls =
    tone === "positive"
      ? "text-emerald-300"
      : tone === "warning"
        ? "text-amber-300"
        : tone === "critical"
          ? "text-red-300"
          : "text-foreground";
  return (
    <div className="rounded-xl border border-white/10 bg-card/50 p-5 backdrop-blur-xl">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5 text-gold" />}
        {label}
      </div>
      <div className={`mt-3 font-display text-3xl font-semibold ${toneCls}`}>{value}</div>
      {hint && (
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

export function AdminQuickAction({
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
        {hint && (
          <span className="block truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {hint}
          </span>
        )}
      </span>
      <Zap className="ms-auto h-4 w-4 text-muted-foreground opacity-0 transition group-hover:text-gold group-hover:opacity-100" />
    </Link>
  );
}

export function Sparkline({
  data,
  height = 48,
  className = "",
}: {
  data: number[];
  height?: number;
  className?: string;
}) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 100;
  const step = w / Math.max(data.length - 1, 1);
  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      className={`h-12 w-full ${className}`}
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gold"
      />
    </svg>
  );
}

export function fmtInt(n: number | undefined | null) {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function fmtMoney(n: number | undefined | null, currency = "USD") {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function StatusPill({
  tone = "neutral",
  children,
}: {
  tone?: "positive" | "warning" | "critical" | "info" | "neutral";
  children: ReactNode;
}) {
  const cls =
    tone === "positive"
      ? "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-200"
      : tone === "warning"
        ? "border-amber-400/30 bg-amber-400/[0.08] text-amber-200"
        : tone === "critical"
          ? "border-red-400/30 bg-red-400/[0.08] text-red-200"
          : tone === "info"
            ? "border-sky-400/30 bg-sky-400/[0.08] text-sky-200"
            : "border-white/15 bg-white/[0.04] text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${cls}`}
    >
      {children}
    </span>
  );
}

export { Activity as LiveActivityIcon };