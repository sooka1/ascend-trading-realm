import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Spreads, commissions and account tiers | HK Global" },
      { name: "description", content: "Transparent pricing across Standard, Pro and Elite accounts. Raw spreads from 0.0 pips, low commissions and zero deposit fees." },
      { property: "og:title", content: "HK Global Trading Pricing" },
      { property: "og:description", content: "Transparent pricing. Raw spreads. Zero deposit fees." },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const tiers = [
    {
      name: "Standard",
      price: "$0",
      note: "No commission · From 0.6 pips",
      features: ["Web & mobile terminal", "10,000+ instruments", "Free education", "24/7 support"],
      cta: "Open account",
    },
    {
      name: "Pro",
      price: "$7",
      note: "Per lot round-turn · Raw spread from 0.0",
      featured: true,
      features: ["Everything in Standard", "Depth of market", "VPS included", "Priority support", "Competition entry credits"],
      cta: "Upgrade to Pro",
    },
    {
      name: "Elite",
      price: "Custom",
      note: "Institutional pricing",
      features: ["Prime brokerage tier", "Dedicated relationship manager", "Custom margin & leverage", "API co-location"],
      cta: "Talk to sales",
    },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="Pricing"
        title={<>Transparent. <span className="text-gradient">Ruthlessly fair.</span></>}
        subtitle="No hidden fees. No deposit charges. Choose the tier that fits your style."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={cn("relative rounded-2xl p-6", t.featured ? "glass-strong shadow-[var(--shadow-glow)]" : "glass")}>
              {t.featured && (
                <span className="absolute -top-3 left-6 rounded-full bg-[var(--gradient-brand)] px-3 py-1 text-[10px] uppercase tracking-widest text-white">
                  Most popular
                </span>
              )}
              <div className="text-sm uppercase tracking-widest text-muted-foreground">{t.name}</div>
              <div className="mt-2 font-display text-4xl font-bold">{t.price}</div>
              <div className="mt-1 text-xs text-muted-foreground">{t.note}</div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className={cn("mt-8 w-full", t.featured ? "bg-[var(--gradient-brand)] text-white" : "")} variant={t.featured ? "default" : "outline"}>
                <Link to={t.name === "Elite" ? "/contact" : "/auth"}>{t.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}