import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PORTFOLIOS } from "@/lib/portfolios-t";

export const Route = createFileRoute("/portfolios")({
  head: () => ({
    meta: [
      { title: "Managed Portfolios — HK Investment Management" },
      { name: "description", content: "Three managed portfolio strategies — Conservative, Balanced and Growth — matched to your risk profile and goals." },
      { property: "og:title", content: "Managed Portfolios" },
      { property: "og:description", content: "Conservative, Balanced and Growth strategies with disciplined risk management." },
    ],
  }),
  component: PortfoliosPage,
});

const TARGETS = ["6 – 10%", "10 – 16%", "16 – 24%"];
const MINS = ["$100", "$500", "$100"];
const WITHDRAW = "$10";
const HIGHLIGHT = [false, true, false];

function PortfoliosPage() {
  const { lang } = useI18n();
  const c = PORTFOLIOS[lang];
  return (
    <PageShell>
      <PageHero
        eyebrow={c.eyebrow}
        title={<>{c.title}</>}
        subtitle={c.subtitle}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {c.tiers.map((p, i) => (
            <div
              key={p.name}
              className={`glass-strong rounded-3xl p-8 ${HIGHLIGHT[i] ? "ring-1 ring-gold/40" : ""}`}
            >
              {HIGHLIGHT[i] && (
                <span className="mb-3 inline-block rounded-full bg-gold/15 px-3 py-1 text-xs text-gold">
                  {c.popular}
                </span>
              )}
              <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.target}</p>
              <p className="font-display text-5xl font-semibold text-gradient">{TARGETS[i]}</p>
              <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">{c.minimum}</dt>
                  <dd className="font-medium">{MINS[i]}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{c.risk}</dt>
                  <dd className="font-medium">{p.risk}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{c.withdraw}</dt>
                  <dd className="font-medium">{WITHDRAW}</dd>
                </div>
              </dl>
              <ul className="mt-6 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full bg-[var(--gradient-gold)] font-semibold text-background">
                <Link to="/auth">{c.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-3xl text-xs text-muted-foreground">{c.disclaimer}</p>
      </section>
    </PageShell>
  );
}