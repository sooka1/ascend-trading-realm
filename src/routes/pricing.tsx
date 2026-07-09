import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePage } from "@/lib/i18n";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Spreads, commissions and account tiers | HK Global" },
      { name: "description", content: "Transparent pricing." },
      { property: "og:title", content: "HK Global Trading Pricing" },
      { property: "og:description", content: "Transparent pricing." },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const p = usePage().pricing;
  return (
    <PageShell>
      <PageHero
        eyebrow={p.hero.eyebrow}
        title={<>{p.hero.titleA} <span className="text-gradient">{p.hero.titleB}</span></>}
        subtitle={p.hero.subtitle}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {p.tiers.map((t, i) => {
            const featured = i === 1;
            return (
              <div key={t.name} className={cn("relative rounded-2xl p-6", featured ? "glass-strong shadow-[var(--shadow-glow)]" : "glass")}>
                {featured && (
                  <span className="absolute -top-3 left-6 rounded-full bg-[var(--gradient-brand)] px-3 py-1 text-[10px] uppercase tracking-widest text-white">
                    {p.popular}
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
                <Button asChild className={cn("mt-8 w-full", featured ? "bg-[var(--gradient-brand)] text-white" : "")} variant={featured ? "default" : "outline"}>
                  <Link to={i === 2 ? "/contact" : "/auth"}>{t.cta}</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
