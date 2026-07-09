import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, Layers, LinkIcon, TrendingUp } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { usePage } from "@/lib/i18n";

export const Route = createFileRoute("/affiliate")({
  head: () => ({
    meta: [
      { title: "Affiliate Program — Earn up to $1,200 per referral | HK Global" },
      { name: "description", content: "Join the HK Global affiliate program. Multi-tier commissions, lifetime revenue share and real-time reporting." },
      { property: "og:title", content: "HK Global Affiliate Program" },
      { property: "og:description", content: "Earn up to $1,200 per funded referral, with lifetime revenue share." },
    ],
  }),
  component: Affiliate,
});

function Affiliate() {
  const p = usePage().affiliate;
  const steps = [
    { icon: LinkIcon, title: p.steps.linkT, body: p.steps.linkB },
    { icon: Layers, title: p.steps.referT, body: p.steps.referB },
    { icon: Coins, title: p.steps.earnT, body: p.steps.earnB },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow={p.hero.eyebrow}
        title={<>{p.hero.titleA} <span className="text-gradient">{p.hero.titleB}</span></>}
        subtitle={p.hero.subtitle}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.title} className="glass rounded-2xl p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--gradient-brand-soft)]">
                <s.icon className="h-5 w-5 text-gold" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 glass-strong rounded-3xl p-8 md:p-12">
          <TrendingUp className="h-8 w-8 text-gold" />
          <h3 className="mt-4 font-display text-3xl font-bold">{p.commission.title}</h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {[
              { k: p.commission.tier1, v: "$600", d: p.commission.d1 },
              { k: p.commission.tier2, v: "$900", d: p.commission.d2 },
              { k: p.commission.tier3, v: "$1,200", d: p.commission.d3 },
              { k: p.commission.rev, v: "20%", d: p.commission.d4 },
            ].map((r) => (
              <div key={r.k} className="glass rounded-xl p-5 text-center">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{r.k}</div>
                <div className="mt-1 font-display text-3xl font-bold text-gradient">{r.v}</div>
                <div className="mt-1 text-xs text-muted-foreground">{r.d}</div>
              </div>
            ))}
          </div>
          <Button asChild className="mt-8 bg-[var(--gradient-brand)] text-white">
            <Link to="/auth">{p.commission.cta}</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
