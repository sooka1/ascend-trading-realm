import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, Layers, LinkIcon, TrendingUp } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

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
  const steps = [
    { icon: LinkIcon, title: "Get your link", body: "Sign up and generate custom referral links and QR codes in seconds." },
    { icon: Layers, title: "Refer clients", body: "Share across your audience — social, blog, newsletter or paid." },
    { icon: Coins, title: "Earn", body: "Track live commissions in your dashboard and withdraw anytime." },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="Affiliate"
        title={<>Refer. Earn. <span className="text-gradient">Repeat.</span></>}
        subtitle="Up to $1,200 per funded referral plus 20% lifetime revenue share — one of the most competitive programs in the industry."
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
          <h3 className="mt-4 font-display text-3xl font-bold">Commission structure</h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {[
              { k: "Tier 1", v: "$600", d: "1-5 clients / mo" },
              { k: "Tier 2", v: "$900", d: "6-20 clients / mo" },
              { k: "Tier 3", v: "$1,200", d: "20+ clients / mo" },
              { k: "Rev share", v: "20%", d: "Lifetime, all tiers" },
            ].map((r) => (
              <div key={r.k} className="glass rounded-xl p-5 text-center">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{r.k}</div>
                <div className="mt-1 font-display text-3xl font-bold text-gradient">{r.v}</div>
                <div className="mt-1 text-xs text-muted-foreground">{r.d}</div>
              </div>
            ))}
          </div>
          <Button asChild className="mt-8 bg-[var(--gradient-brand)] text-white">
            <Link to="/auth">Become an affiliate</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}