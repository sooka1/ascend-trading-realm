import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { AnimatedChart } from "@/components/animated-chart";
import { useRoles } from "@/hooks/use-roles";
import {
  ArrowDownRight,
  ArrowDownToLine,
  ArrowUpRight,
  ArrowUpFromLine,
  Briefcase,
  FileText,
  LogOut,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحة المستثمر — HK Investment Management" },
      { name: "description", content: "محفظتك الاستثمارية، الأداء، ونشاط الحساب." },
    ],
  }),
  component: DashboardPage,
});

type Profile = { display_name: string | null; email: string | null };
type Portfolio = {
  id: string;
  name: string;
  strategy: "conservative" | "balanced" | "growth";
  base_currency: string;
  inception_date: string;
};
type Snapshot = { as_of_date: string; equity: number; pnl: number; allocation: Record<string, number> };
type Transaction = { id: string; occurred_at: string; symbol: string; side: string; quantity: number; price: number; pnl: number };

function DashboardPage() {
  const navigate = useNavigate();
  const { isAdmin, has, loading: rolesLoading } = useRoles();

  // Super admins land on the admin console, not the investor dashboard.
  useEffect(() => {
    if (!rolesLoading && has("super_admin")) {
      navigate({ to: "/admin", replace: true });
    }
  }, [rolesLoading, has, navigate]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  async function load() {
    setLoading(true);
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) return setLoading(false);

    const [{ data: prof }, { data: pf }] = await Promise.all([
      supabase.from("profiles").select("display_name, email").eq("id", uid).maybeSingle(),
      supabase.from("portfolios").select("*").eq("user_id", uid).order("created_at").limit(1).maybeSingle(),
    ]);
    setProfile(prof);
    setPortfolio((pf as Portfolio | null) ?? null);
    if (pf) {
      const [{ data: sn }, { data: tx }] = await Promise.all([
        supabase.from("portfolio_snapshots").select("*").eq("portfolio_id", pf.id).order("as_of_date"),
        supabase.from("transactions").select("*").eq("portfolio_id", pf.id).order("occurred_at", { ascending: false }).limit(10),
      ]);
      setSnapshots((sn ?? []) as Snapshot[]);
      setTxs((tx ?? []) as Transaction[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function seedDemo() {
    setSeeding(true);
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) return;
    const { data: pf, error: pErr } = await supabase
      .from("portfolios")
      .insert({ user_id: uid, name: "Balanced Growth", strategy: "balanced", base_currency: "USD" })
      .select()
      .single();
    if (pErr || !pf) {
      toast.error(pErr?.message ?? "تعذّر إنشاء المحفظة التجريبية");
      setSeeding(false);
      return;
    }
    const snaps = buildDemoSnapshots(uid, pf.id, 90, 100000);
    const txs = buildDemoTxs(uid, pf.id, 12);
    const now = new Date().toISOString();
    await Promise.all([
      supabase.from("portfolio_snapshots").insert(snaps),
      supabase.from("transactions").insert(txs),
      supabase.from("statements").insert([
        { user_id: uid, kind: "monthly", period: "2026-06", title: "كشف حساب شهري — يونيو 2026" },
        { user_id: uid, kind: "monthly", period: "2026-05", title: "كشف حساب شهري — مايو 2026" },
        { user_id: uid, kind: "annual", period: "2025", title: "التقرير السنوي — 2025" },
      ]),
      supabase.from("notifications").insert([
        { user_id: uid, title: "مرحبًا بك في HK Investment Management", body: "لوحة المستثمر جاهزة الآن.", created_at: now },
        { user_id: uid, title: "تم تمويل المحفظة", body: "اكتمل التخصيص الأولي — استراتيجية النمو المتوازن." },
      ]),
      supabase.from("messages").insert([
        { user_id: uid, from_role: "manager", body: "مرحبًا — أنا مدير حسابك. تواصل معي في أي وقت عبر هذه القناة." },
      ]),
    ]);
    toast.success("تم إنشاء المحفظة التجريبية");
    await load();
    setSeeding(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("تم تسجيل الخروج");
    navigate({ to: "/auth", replace: true });
  }

  const latest = snapshots.at(-1);
  const first = snapshots[0];
  const cumulative = latest && first ? ((latest.equity - first.equity) / first.equity) * 100 : 0;
  const alloc = latest?.allocation ?? {};
  const allocEntries = Object.entries(alloc);

  const name = profile?.display_name ?? profile?.email?.split("@")[0] ?? "مستثمر";

  return (
    <PageShell bare>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold">لوحة المستثمر</p>
            <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">
              أهلًا، <span className="text-gradient">{name}</span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild className="bg-[var(--gradient-gold)] font-semibold text-background">
              <Link to="/investor"><ArrowDownToLine className="ml-2 h-4 w-4" />إيداع</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/15">
              <Link to="/investor"><ArrowUpFromLine className="ml-2 h-4 w-4" />سحب</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/15">
              <Link to="/portal">بوابة العميل</Link>
            </Button>
            {isAdmin && (
              <Button asChild variant="outline" className="border-gold/40 text-gold hover:bg-gold/10">
                <Link to="/admin/finance"><ShieldCheck className="ml-2 h-4 w-4" />الإدارة</Link>
              </Button>
            )}
            <Button variant="outline" className="border-white/15" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> تسجيل الخروج
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="mt-10 text-sm text-muted-foreground">جارٍ تحميل محفظتك…</p>
        ) : !portfolio ? (
          <EmptyState onSeed={seedDemo} loading={seeding} />
        ) : (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Stat label="قيمة المحفظة" icon={Wallet} value={fmt(latest?.equity ?? 0)} hint={portfolio.name} />
              <Stat
                label="العائد التراكمي"
                icon={cumulative >= 0 ? ArrowUpRight : ArrowDownRight}
                value={`${cumulative >= 0 ? "+" : ""}${cumulative.toFixed(2)}%`}
                accent={cumulative >= 0 ? "gold" : "bear"}
                hint="منذ التأسيس"
              />
              <Stat label="الاستراتيجية" icon={Briefcase} value={cap(portfolio.strategy)} hint={`العملة: ${portfolio.base_currency}`} />
              <Stat label="اللقطات" icon={FileText} value={String(snapshots.length)} hint="سجلات يومية للرصيد" />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="glass-strong rounded-3xl p-6 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">منحنى الرصيد</p>
                    <p className="mt-1 font-display text-2xl font-semibold">{fmt(latest?.equity ?? 0)}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs ${cumulative >= 0 ? "border-gold/30 bg-gold/10 text-gold" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
                    {cumulative >= 0 ? "+" : ""}
                    {cumulative.toFixed(2)}%
                  </span>
                </div>
                <EquityChart snapshots={snapshots} />
              </div>

              <div className="glass rounded-3xl p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">التوزيع</p>
                {allocEntries.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">لا توجد بيانات توزيع بعد.</p>
                ) : (
                  <ul className="mt-4 space-y-3 text-sm">
                    {allocEntries.map(([k, v]) => (
                      <li key={k}>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{k}</span>
                          <span className="font-medium">{(Number(v) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                          <div className="h-full rounded-full bg-[var(--gradient-gold)]" style={{ width: `${Number(v) * 100}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="glass rounded-3xl p-6 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">آخر العمليات</h2>
                  <Link to="/portal" className="text-xs text-gold hover:underline">عرض الكل →</Link>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                      <tr>
                        <th className="py-2 text-start">التاريخ</th>
                        <th className="py-2 text-start">الرمز</th>
                        <th className="py-2 text-start">النوع</th>
                        <th className="py-2 text-end">الكمية</th>
                        <th className="py-2 text-end">السعر</th>
                        <th className="py-2 text-end">الربح/الخسارة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {txs.map((t) => (
                        <tr key={t.id} className="border-t border-white/5">
                          <td className="py-3">{new Date(t.occurred_at).toLocaleDateString()}</td>
                          <td className="py-3 font-medium">{t.symbol}</td>
                          <td className="py-3 uppercase text-muted-foreground">{t.side}</td>
                          <td className="py-3 text-end">{Number(t.quantity).toLocaleString()}</td>
                          <td className="py-3 text-end">{Number(t.price).toFixed(2)}</td>
                          <td className={`py-3 text-end ${Number(t.pnl) >= 0 ? "text-gold" : "text-red-400"}`}>
                            {Number(t.pnl) >= 0 ? "+" : ""}
                            {Number(t.pnl).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="glass rounded-3xl p-6">
                <h2 className="font-display text-lg font-semibold">روابط سريعة</h2>
                <ul className="mt-4 space-y-2 text-sm">
                  <QuickLink to="/portal" icon={FileText} label="الكشوف والتقارير" />
                  <QuickLink to="/portal" icon={MessageSquare} label="المراسلات الآمنة" />
                  <QuickLink to="/portfolios" icon={Briefcase} label="أضف استراتيجية أخرى" />
                </ul>
              </div>
            </div>
          </>
        )}
      </section>
    </PageShell>
  );
}

function EmptyState({ onSeed, loading }: { onSeed: () => void; loading: boolean }) {
  return (
    <div className="mt-10 grid gap-8 rounded-3xl border border-white/5 bg-white/[0.02] p-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold">
          <Sparkles className="h-3 w-3" /> ابدأ الآن
        </span>
        <h2 className="mt-4 font-display text-3xl font-semibold">لا توجد محفظة بعد.</h2>
        <p className="mt-3 max-w-md text-muted-foreground">
          أنشئ محفظة تجريبية "النمو المتوازن" لاستكشاف لوحة المستثمر، أو تواصل مع مستشار لفتح حساب مُدار حقيقي.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={onSeed} disabled={loading} className="bg-[var(--gradient-gold)] font-semibold text-background">
            {loading ? "جارٍ الإنشاء…" : "إنشاء محفظة تجريبية"}
          </Button>
          <Button asChild variant="outline" className="border-white/15">
            <Link to="/contact">تحدث مع مستشار</Link>
          </Button>
        </div>
      </div>
      <div className="glass-strong rounded-3xl p-6">
        <AnimatedChart />
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  accent?: "gold" | "bear";
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <Icon className={`h-5 w-5 ${accent === "bear" ? "text-red-400" : "text-gold"}`} />
      <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function QuickLink({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <li>
      <Link to={to} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 transition hover:border-gold/30">
        <span className="flex items-center gap-2"><Icon className="h-4 w-4 text-gold" /> {label}</span>
        <span className="text-muted-foreground">→</span>
      </Link>
    </li>
  );
}

function EquityChart({ snapshots }: { snapshots: Snapshot[] }) {
  const path = useMemo(() => {
    if (snapshots.length < 2) return null;
    const w = 720;
    const h = 220;
    const pad = 10;
    const vals = snapshots.map((s) => Number(s.equity));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const d = snapshots
      .map((s, i) => {
        const x = pad + (i / (snapshots.length - 1)) * (w - pad * 2);
        const y = h - pad - ((Number(s.equity) - min) / (max - min || 1)) * (h - pad * 2);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
    const area = `${d} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`;
    return { d, area, w, h };
  }, [snapshots]);

  if (!path) return <AnimatedChart />;
  return (
    <svg viewBox={`0 0 ${path.w} ${path.h}`} className="mt-4 h-52 w-full">
      <defs>
        <linearGradient id="dash-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.82 0.14 82)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.82 0.14 82)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="dash-stroke" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="oklch(0.52 0.19 262)" />
          <stop offset="100%" stopColor="oklch(0.82 0.14 82)" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={10} x2={path.w - 10} y1={path.h * g} y2={path.h * g} stroke="oklch(1 0 0 / 0.06)" strokeDasharray="3 4" />
      ))}
      <path d={path.area} fill="url(#dash-fill)" />
      <path d={path.d} fill="none" stroke="url(#dash-stroke)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function fmt(n: number) {
  return `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}
function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildDemoSnapshots(userId: string, portfolioId: string, days: number, start: number) {
  const out: {
    user_id: string;
    portfolio_id: string;
    as_of_date: string;
    equity: number;
    pnl: number;
    allocation: Record<string, number>;
  }[] = [];
  let v = start;
  const today = new Date();
  for (let i = days; i > 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const drift = (Math.sin(i / 6) + Math.cos(i / 4)) * 220 + (days - i) * 55 + (Math.random() - 0.4) * 180;
    v = Math.max(start * 0.9, v + drift);
    out.push({
      user_id: userId,
      portfolio_id: portfolioId,
      as_of_date: d.toISOString().slice(0, 10),
      equity: Math.round(v * 100) / 100,
      pnl: Math.round((v - start) * 100) / 100,
      allocation: {
        Forex: 0.28,
        Gold: 0.22,
        Indices: 0.24,
        Commodities: 0.14,
        Stocks: 0.12,
      },
    });
  }
  return out;
}

function buildDemoTxs(userId: string, portfolioId: string, count: number) {
  const symbols = ["EUR/USD", "XAU/USD", "US500", "USOIL", "AAPL", "MSFT", "GBP/USD", "NAS100"];
  const out: {
    user_id: string;
    portfolio_id: string;
    occurred_at: string;
    symbol: string;
    side: "buy" | "sell";
    quantity: number;
    price: number;
    pnl: number;
  }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i * 2);
    out.push({
      user_id: userId,
      portfolio_id: portfolioId,
      occurred_at: d.toISOString(),
      symbol: symbols[i % symbols.length],
      side: i % 2 === 0 ? "buy" : "sell",
      quantity: Math.round((Math.random() * 900 + 100) * 100) / 100,
      price: Math.round((Math.random() * 400 + 50) * 100) / 100,
      pnl: Math.round((Math.random() * 1200 - 300) * 100) / 100,
    });
  }
  return out;
}