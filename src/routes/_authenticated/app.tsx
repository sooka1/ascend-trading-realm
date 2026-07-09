import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Plus,
  Repeat,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { HKLogo } from "@/components/hk-logo";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [
      { title: "HK Invest — الجوّال" },
      { name: "description", content: "محفظتك الاستثمارية أينما كنت." },
    ],
  }),
  component: MobileAppLayout,
});

function MobileAppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/app";
  return (
    <div className="min-h-screen bg-[color:var(--background)] pb-24">
      <div className="mx-auto max-w-md">{isHome ? <MobileHome /> : <Outlet />}</div>
      <MobileBottomNav />
    </div>
  );
}

type Profile = { display_name: string | null; email: string | null };
type Portfolio = {
  id: string;
  name: string;
  strategy: string;
  base_currency: string;
};
type Snapshot = { as_of_date: string; equity: number; pnl: number; allocation: Record<string, number> };
type Transaction = { id: string; occurred_at: string; symbol: string; side: string; quantity: number; price: number; pnl: number };

function MobileHome() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [hidden, setHidden] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) return setLoading(false);
      const [{ data: prof }, { data: pf }] = await Promise.all([
        supabase.from("profiles").select("display_name, email").eq("id", uid).maybeSingle(),
        supabase.from("portfolios").select("*").eq("user_id", uid).order("created_at").limit(1).maybeSingle(),
      ]);
      setProfile(prof as Profile | null);
      setPortfolio((pf as Portfolio | null) ?? null);
      if (pf) {
        const [{ data: sn }, { data: tx }] = await Promise.all([
          supabase.from("portfolio_snapshots").select("*").eq("portfolio_id", pf.id).order("as_of_date"),
          supabase.from("transactions").select("*").eq("portfolio_id", pf.id).order("occurred_at", { ascending: false }).limit(5),
        ]);
        setSnapshots((sn ?? []) as Snapshot[]);
        setTxs((tx ?? []) as Transaction[]);
      }
      setLoading(false);
    })();
  }, []);

  const latest = snapshots.at(-1);
  const first = snapshots[0];
  const cumulative = latest && first ? ((latest.equity - first.equity) / first.equity) * 100 : 0;
  const todayPnl = latest?.pnl ?? 0;
  const name = profile?.display_name ?? profile?.email?.split("@")[0] ?? "مستثمر";
  const alloc = Object.entries(latest?.allocation ?? {});

  return (
    <>
      <MobileTopBar name={name} />

      <main className="space-y-5 px-4 pt-4">
        {loading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">جارٍ التحميل…</p>
        ) : !portfolio ? (
          <EmptyMobile />
        ) : (
          <>
            <BalanceCard
              equity={latest?.equity ?? 0}
              cumulative={cumulative}
              todayPnl={todayPnl}
              hidden={hidden}
              onToggle={() => setHidden((v) => !v)}
              portfolioName={portfolio.name}
            />

            <QuickActions />

            <MiniEquityChart snapshots={snapshots} />

            <AllocationCard entries={alloc} />

            <ActivityCard txs={txs} />

            <TrustFooter />
          </>
        )}
      </main>
    </>
  );
}

function MobileTopBar({ name }: { name: string }) {
  return (
    <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-white/5 bg-[color:var(--background)]/80 px-4 py-3 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-3">
        <HKLogo showWordmark={false} size="sm" />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">أهلاً بعودتك</p>
          <p className="truncate text-sm font-semibold">{name}</p>
        </div>
      </div>
      <button
        aria-label="الإشعارات"
        className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold" />
      </button>
    </header>
  );
}

function BalanceCard({
  equity,
  cumulative,
  todayPnl,
  hidden,
  onToggle,
  portfolioName,
}: {
  equity: number;
  cumulative: number;
  todayPnl: number;
  hidden: boolean;
  onToggle: () => void;
  portfolioName: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[var(--gradient-brand)] p-5 shadow-[var(--shadow-glow)]">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/20 blur-3xl" aria-hidden />
      <div className="relative flex items-center justify-between text-white/80">
        <span className="text-[10px] uppercase tracking-widest">{portfolioName}</span>
        <button onClick={onToggle} aria-label={hidden ? "إظهار الرصيد" : "إخفاء الرصيد"} className="grid h-7 w-7 place-items-center rounded-full bg-white/10">
          {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
      <p className="relative mt-3 text-[11px] uppercase tracking-widest text-white/70">الرصيد الإجمالي</p>
      <p className="relative mt-1 font-display text-4xl font-semibold tracking-tight text-white">
        {hidden ? "••••••" : fmt(equity)}
      </p>
      <div className="relative mt-4 flex items-center gap-3 text-xs">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${
            cumulative >= 0 ? "bg-white/15 text-white" : "bg-red-500/20 text-red-100"
          }`}
        >
          {cumulative >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
          {cumulative >= 0 ? "+" : ""}
          {cumulative.toFixed(2)}%
        </span>
        <span className="text-white/70">
          {todayPnl >= 0 ? "+" : ""}
          {fmt(todayPnl)} <span className="text-white/50">إجمالي الربح/الخسارة</span>
        </span>
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { icon: Plus, label: "إيداع", onClick: () => toast("للإيداع — تواصل مع المستشار") },
    { icon: ArrowUpRight, label: "سحب", onClick: () => toast("للسحب — قدّم الطلب عبر البوابة") },
    { icon: Repeat, label: "تحويل", onClick: () => toast("التحويل — قريبًا") },
    { icon: FileText, label: "التقارير", to: "/portal" as const },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map((a) => {
        const Icon = a.icon;
        const inner = (
          <span className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-[color:var(--surface)] px-2 py-3 transition active:scale-95">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold/10 text-gold">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-[11px] font-medium">{a.label}</span>
          </span>
        );
        return "to" in a ? (
          <Link key={a.label} to={a.to}>{inner}</Link>
        ) : (
          <button key={a.label} onClick={a.onClick} className="text-left">{inner}</button>
        );
      })}
    </div>
  );
}

function MiniEquityChart({ snapshots }: { snapshots: Snapshot[] }) {
  const [range, setRange] = useState<"1W" | "1M" | "3M" | "ALL">("1M");
  const filtered = useMemo(() => {
    if (range === "ALL") return snapshots;
    const days = range === "1W" ? 7 : range === "1M" ? 30 : 90;
    return snapshots.slice(-days);
  }, [snapshots, range]);

  const path = useMemo(() => {
    if (filtered.length < 2) return null;
    const w = 320;
    const h = 120;
    const pad = 6;
    const vals = filtered.map((s) => Number(s.equity));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const d = filtered
      .map((s, i) => {
        const x = pad + (i / (filtered.length - 1)) * (w - pad * 2);
        const y = h - pad - ((Number(s.equity) - min) / (max - min || 1)) * (h - pad * 2);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
    const area = `${d} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`;
    return { d, area, w, h };
  }, [filtered]);

  return (
    <div className="rounded-3xl border border-white/10 bg-[color:var(--surface)] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">الأداء</p>
        <div className="flex rounded-full bg-white/5 p-0.5 text-[10px]">
          {(["1W", "1M", "3M", "ALL"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full px-2.5 py-1 font-medium transition ${
                range === r ? "bg-gold text-background" : "text-muted-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      {path ? (
        <svg viewBox={`0 0 ${path.w} ${path.h}`} className="mt-3 h-28 w-full">
          <defs>
            <linearGradient id="mob-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.82 0.14 82)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="oklch(0.82 0.14 82)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="mob-stroke" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="oklch(0.52 0.19 262)" />
              <stop offset="100%" stopColor="oklch(0.82 0.14 82)" />
            </linearGradient>
          </defs>
          <path d={path.area} fill="url(#mob-fill)" />
          <path d={path.d} fill="none" stroke="url(#mob-stroke)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <p className="py-6 text-center text-xs text-muted-foreground">لا توجد بيانات بعد</p>
      )}
    </div>
  );
}

function AllocationCard({ entries }: { entries: [string, unknown][] }) {
  if (entries.length === 0) return null;
  const colors = ["bg-gold", "bg-[oklch(0.52_0.19_262)]", "bg-emerald-400", "bg-sky-400", "bg-fuchsia-400"];
  return (
    <div className="rounded-3xl border border-white/10 bg-[color:var(--surface)] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">التوزيع</p>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-white/5">
        {entries.map(([k, v], i) => (
          <div key={k} className={colors[i % colors.length]} style={{ width: `${Number(v) * 100}%` }} />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        {entries.map(([k, v], i) => (
          <li key={k} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${colors[i % colors.length]}`} />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">{k}</span>
            <span className="font-medium">{(Number(v) * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActivityCard({ txs }: { txs: Transaction[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[color:var(--surface)] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">آخر النشاط</p>
        <Link to="/app/activity" className="flex items-center gap-1 text-xs text-gold">
          عرض الكل <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      {txs.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">لا توجد عمليات بعد.</p>
      ) : (
        <ul className="mt-3 divide-y divide-white/5">
          {txs.slice(0, 4).map((t) => {
            const isBuy = t.side === "buy";
            const pnl = Number(t.pnl);
            return (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${isBuy ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {isBuy ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.symbol}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {t.side.toUpperCase()} · {new Date(t.occurred_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${Number(t.price).toFixed(2)}</p>
                  <p className={`text-[11px] ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {pnl >= 0 ? "+" : ""}
                    {pnl.toFixed(2)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function TrustFooter() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-[11px] text-muted-foreground">
      <ShieldCheck className="h-4 w-4 shrink-0 text-gold" />
      <p>تشفير بمستوى البنوك. حفظ منفصل للأصول. وصول للقراءة فقط عبر الجوال.</p>
    </div>
  );
}

function EmptyMobile() {
  return (
    <div className="rounded-3xl border border-white/10 bg-[color:var(--surface)] p-6 text-center">
      <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] text-gold">
        <Sparkles className="h-3 w-3" /> ابدأ الآن
      </span>
      <h2 className="mt-3 font-display text-2xl font-semibold">لا توجد محفظة بعد</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        أنشئ محفظة تجريبية من لوحة التحكم على سطح المكتب، أو تواصل مع مستشار لفتح حساب مُدار.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <Button asChild className="bg-[var(--gradient-gold)] font-semibold text-background">
          <Link to="/dashboard">فتح لوحة التحكم الكاملة</Link>
        </Button>
        <Button asChild variant="outline" className="border-white/15">
          <Link to="/contact">تحدث مع مستشار</Link>
        </Button>
      </div>
    </div>
  );
}

function fmt(n: number) {
  return `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}