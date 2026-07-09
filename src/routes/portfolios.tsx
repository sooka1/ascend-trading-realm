import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

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

const tiers = [
  {
    name: "Conservative",
    target: "6 – 10%",
    min: "$25,000",
    risk: "Low",
    features: [
      "Capital preservation focus",
      "Fixed-income & income overlays",
      "Low correlation to equity markets",
      "Monthly performance reporting",
    ],
  },
  {
    name: "Balanced",
    target: "10 – 16%",
    min: "$100,000",
    risk: "Moderate",
    highlight: true,
    features: [
      "Multi-asset diversification",
      "Active currency & gold overlay",
      "Volatility-adjusted position sizing",
      "Bi-weekly performance updates",
    ],
  },
  {
    name: "Growth",
    target: "16 – 24%",
    min: "$250,000",
    risk: "Higher",
    features: [
      "Higher exposure to growth assets",
      "Tactical single-name equities",
      "Optional digital-asset overlay",
      "Weekly performance updates",
    ],
  },
];

function PortfoliosPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Managed Portfolios"
        title={<>Three strategies. One standard of care.</>}
        subtitle="Every portfolio is managed with the same discipline — you choose the risk profile that fits your objectives."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {tiers.map((p) => (
            <div
              key={p.name}
              className={`glass-strong rounded-3xl p-8 ${p.highlight ? "ring-1 ring-gold/40" : ""}`}
            >
              {p.highlight && (
                <span className="mb-3 inline-block rounded-full bg-gold/15 px-3 py-1 text-xs text-gold">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Target annual return</p>
              <p className="font-display text-5xl font-semibold text-gradient">{p.target}</p>
              <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Minimum</dt>
                  <dd className="font-medium">{p.min}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Risk profile</dt>
                  <dd className="font-medium">{p.risk}</dd>
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
                <Link to="/auth">Open this portfolio</Link>
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-3xl text-xs text-muted-foreground">
          Target returns are illustrative and not guaranteed. Investing involves risk, including possible loss of
          principal. Past performance is not indicative of future results.
        </p>
      </section>
    </PageShell>
  );
}