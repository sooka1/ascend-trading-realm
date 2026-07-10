import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, PortalCard } from "@/components/portal-shell";
import { Wallet, PieChart, TrendingUp, Layers } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/portfolio")({
  head: () => ({
    meta: [
      { title: "المحفظة — بوابة العميل" },
      { name: "description", content: "توزيع أصولك، لقطات المحفظة والأداء التاريخي." },
    ],
  }),
  component: PortfolioPage,
});

type Snapshot = {
  id: string;
  as_of_date: string;
  equity: number;
  pnl: number;
  allocation: Record<string, number> | null;
};

type Subscription = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  started_at: string | null;
  packages: { name: string; risk_level: string | null; target_return_pct: number | null } | null;
};

const fmt = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);

function PortfolioPage() {
  const [snaps, setSnaps] = useState<Snapshot[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);

  useEffect(() => {
    void (async () => {
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase.from("portfolio_snapshots").select("*").order("as_of_date", { ascending: false }).limit(90),
        supabase.from("subscriptions").select("*, packages(name,risk_level,target_return_pct)").order("started_at", { ascending: false }),
      ]);
      setSnaps((s ?? []) as Snapshot[]);
      setSubs((p ?? []) as unknown as Subscription[]);
    })();
  }, []);

  const latest = snaps[0];
  const prev = snaps[1];
  const delta = latest && prev ? latest.equity - prev.equity : 0;
  const deltaPct = latest && prev && prev.equity ? (delta / prev.equity) * 100 : 0;

  const allocation = useMemo(() => {
    const alloc = latest?.allocation ?? {};
    const entries = Object.entries(alloc).map(([k, v]) => ({ label: k, value: Number(v) || 0 }));
    const total = entries.reduce((a, b) => a + b.value, 0) || 1;
    return entries.map((e) => ({ ...e, pct: (e.value / total) * 100 })).sort((a, b) => b.pct - a.pct);
  }, [latest]);

  const totalInvested = subs.filter((s) => s.status === "active").reduce((a, b) => a + Number(b.amount || 0), 0);

  return (
    <PortalShell eyebrow="نظرة عامة" title="المحفظة" subtitle="توزيع أصولك، اللقطات الحديثة، والأداء التاريخي.">
      {/* KPI row */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="القيمة الحالية" value={latest ? fmt(latest.equity) : "—"} unit="USD" />
        <Kpi
          label="التغيّر اليومي"
          value={latest && prev ? `${delta >= 0 ? "+" : ""}${fmt(delta)}` : "—"}
          unit={latest && prev ? `${deltaPct >= 0 ? "+" : ""}${fmt(deltaPct)}%` : ""}
          positive={delta >= 0}
        />
        <Kpi label="إجمالي P&L" value={latest ? `${latest.pnl >= 0 ? "+" : ""}${fmt(latest.pnl)}` : "—"} unit="USD" positive={(latest?.pnl ?? 0) >= 0} />
        <Kpi label="رأس المال المستثمر" value={fmt(totalInvested)} unit="USD" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <PortalCard title="توزيع الأصول" icon={PieChart}>
          {allocation.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">لا توجد بيانات توزيع بعد.</p>
          ) : (
            <>
              <div className="mb-4 flex h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">
                {allocation.map((a, i) => (
                  <span
                    key={a.label}
                    style={{ width: `${a.pct}%`, background: BAR_COLORS[i % BAR_COLORS.length] }}
                    aria-hidden
                  />
                ))}
              </div>
              <ul className="space-y-2.5">
                {allocation.map((a, i) => (
                  <li key={a.label} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full" style={{ background: BAR_COLORS[i % BAR_COLORS.length] }} aria-hidden />
                    <span className="flex-1 text-sm">{a.label}</span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">{fmt(a.value)}</span>
                    <span className="w-16 text-end font-mono text-xs tabular-nums text-foreground">{fmt(a.pct)}%</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </PortalCard>

        <PortalCard title="الحسابات النشطة" icon={Layers}>
          {subs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">لا توجد اشتراكات نشطة.</p>
          ) : (
            <ul className="space-y-2.5">
              {subs.slice(0, 6).map((s) => (
                <li key={s.id} className="rounded-md border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{s.packages?.name ?? "—"}</p>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {s.packages?.risk_level ?? "—"} · {s.status}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-mono text-sm tabular-nums">{fmt(Number(s.amount))} {s.currency}</p>
                      {s.packages?.target_return_pct != null && (
                        <p className="font-mono text-[10px] text-gold/80">weekly {fmt(Number(s.packages.target_return_pct))}%</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PortalCard>
      </div>

      <div className="mt-6">
        <PortalCard title="لقطات المحفظة (آخر 90 يوماً)" icon={TrendingUp}>
          {snaps.length < 2 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">لا توجد لقطات كافية لعرض المخطط.</p>
          ) : (
            <EquitySpark data={snaps.slice().reverse()} />
          )}
        </PortalCard>
      </div>

      {snaps.length === 0 && !latest && (
        <div className="mt-6 flex items-center gap-3 rounded-md border border-white/10 bg-card/40 p-4 text-sm text-muted-foreground">
          <Wallet className="h-4 w-4 text-gold" />
          لا توجد لقطات لمحفظتك بعد. سيتم إنشاء أول لقطة عند بدء الاستثمار.
        </div>
      )}
    </PortalShell>
  );
}

const BAR_COLORS = ["#d4af37", "#8b6f2a", "#e8c866", "#5b4a1c", "#b8912e", "#f0d97a"];

function Kpi({ label, value, unit, positive }: { label: string; value: string; unit?: string; positive?: boolean }) {
  const tone = positive === undefined ? "text-foreground" : positive ? "text-emerald-400" : "text-red-400";
  return (
    <div className="rounded-xl border border-white/10 bg-card/50 p-4 backdrop-blur-xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold/80">{label}</p>
      <p className={`mt-2 font-display text-2xl font-semibold tabular-nums ${tone}`}>{value}</p>
      {unit && <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{unit}</p>}
    </div>
  );
}

function EquitySpark({ data }: { data: Snapshot[] }) {
  const w = 800;
  const h = 200;
  const pad = 24;
  const vals = data.map((d) => Number(d.equity));
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const step = (w - pad * 2) / Math.max(1, data.length - 1);
  const points = data
    .map((d, i) => {
      const x = pad + i * step;
      const y = h - pad - ((Number(d.equity) - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
  const area = `${pad},${h - pad} ${points} ${pad + (data.length - 1) * step},${h - pad}`;
  return (
    <div className="overflow-hidden rounded-md border border-white/10 bg-white/[0.02] p-2">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#g)" />
        <polyline points={points} fill="none" stroke="#d4af37" strokeWidth="1.5" />
      </svg>
      <div className="mt-1 flex items-center justify-between px-2 font-mono text-[10px] text-muted-foreground">
        <span>{data[0]?.as_of_date}</span>
        <span className="tabular-nums">min {fmt(min)} · max {fmt(max)}</span>
        <span>{data[data.length - 1]?.as_of_date}</span>
      </div>
    </div>
  );
}