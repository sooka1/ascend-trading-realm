import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, PortalCard } from "@/components/portal-shell";
import { Landmark, Calendar, CircleDollarSign, Target } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/accounts")({
  head: () => ({
    meta: [
      { title: "الحسابات الاستثمارية — بوابة العميل" },
      { name: "description", content: "جميع اشتراكاتك الاستثمارية النشطة والمؤرشفة في مكان واحد." },
    ],
  }),
  component: AccountsPage,
});

type Subscription = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  started_at: string | null;
  ends_at: string | null;
  packages: {
    name: string;
    risk_level: string | null;
    target_return_pct: number | null;
    lockup_months: number | null;
    description: string | null;
  } | null;
};

const fmt = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);

const STATUS_LABEL: Record<string, string> = {
  active: "نشط",
  pending: "قيد المعالجة",
  paused: "متوقف",
  closed: "مغلق",
  archived: "مؤرشف",
};

function AccountsPage() {
  const [rows, setRows] = useState<Subscription[]>([]);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*, packages(name,risk_level,target_return_pct,lockup_months,description)")
        .order("started_at", { ascending: false });
      setRows((data ?? []) as unknown as Subscription[]);
    })();
  }, []);

  const groups = useMemo(() => {
    const g: Record<string, Subscription[]> = {};
    for (const r of rows) (g[r.status] ??= []).push(r);
    return g;
  }, [rows]);

  const totals = useMemo(() => {
    const active = rows.filter((r) => r.status === "active");
    return {
      count: rows.length,
      activeCount: active.length,
      capital: active.reduce((a, b) => a + Number(b.amount || 0), 0),
    };
  }, [rows]);

  return (
    <PortalShell eyebrow="نظرة عامة" title="الحسابات الاستثمارية" subtitle="جميع اشتراكاتك الاستثمارية حسب الحالة، مع تفاصيل المنتج وقيود الإغلاق.">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Kpi label="إجمالي الحسابات" value={String(totals.count)} />
        <Kpi label="الحسابات النشطة" value={String(totals.activeCount)} positive />
        <Kpi label="رأس المال النشط" value={fmt(totals.capital)} unit="USD" />
      </div>

      {rows.length === 0 ? (
        <PortalCard title="لا توجد حسابات بعد" icon={Landmark}>
          <p className="py-8 text-center text-sm text-muted-foreground">لم يتم فتح أي حساب استثماري بعد.</p>
        </PortalCard>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([status, list]) => (
            <PortalCard
              key={status}
              title={`${STATUS_LABEL[status] ?? status} · ${list.length}`}
              icon={Landmark}
            >
              <div className="grid gap-3 md:grid-cols-2">
                {list.map((s) => (
                  <article key={s.id} className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-display text-base font-semibold">{s.packages?.name ?? "—"}</p>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {s.packages?.risk_level ?? "—"} · {STATUS_LABEL[s.status] ?? s.status}
                        </p>
                      </div>
                      <span className="rounded-sm border border-gold/20 bg-gold/[0.06] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gold">
                        {s.currency}
                      </span>
                    </div>

                    {s.packages?.description && (
                      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{s.packages.description}</p>
                    )}

                    <dl className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3 text-sm">
                      <Row icon={CircleDollarSign} label="المبلغ" value={`${fmt(Number(s.amount))} ${s.currency}`} />
                      <Row
                        icon={Target}
                        label="العائد الأسبوعي المستهدف"
                        value={s.packages?.target_return_pct != null ? `${fmt(Number(s.packages.target_return_pct))}%` : "—"}
                        accent
                      />
                      <Row
                        icon={Calendar}
                        label="تاريخ البدء"
                        value={s.started_at ? new Date(s.started_at).toLocaleDateString() : "—"}
                      />
                      <Row
                        icon={Calendar}
                        label="تاريخ الانتهاء"
                        value={s.ends_at ? new Date(s.ends_at).toLocaleDateString() : (s.packages?.lockup_months ? `قفل ${s.packages.lockup_months}ش` : "—")}
                      />
                    </dl>
                  </article>
                ))}
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </PortalShell>
  );
}

function Kpi({ label, value, unit, positive }: { label: string; value: string; unit?: string; positive?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-card/50 p-4 backdrop-blur-xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold/80">{label}</p>
      <p className={`mt-2 font-display text-2xl font-semibold tabular-nums ${positive ? "text-emerald-400" : "text-foreground"}`}>{value}</p>
      {unit && <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{unit}</p>}
    </div>
  );
}

function Row({ icon: Icon, label, value, accent }: { icon: typeof Landmark; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`truncate font-mono text-xs tabular-nums ${accent ? "text-gold" : "text-foreground"}`}>{value}</p>
      </div>
    </div>
  );
}