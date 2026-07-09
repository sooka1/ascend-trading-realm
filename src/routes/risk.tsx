import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "Risk Management — HK Investment Management" },
      { name: "description", content: "How HK Investment Management approaches capital preservation, position sizing, diversification, monitoring and stress testing." },
      { property: "og:title", content: "Risk Management" },
    ],
  }),
  component: RiskPage,
});

const pillars = [
  { t: "Capital preservation", b: "Every strategy begins with a defined loss budget. Positions are constructed to fit inside it." },
  { t: "Position sizing", b: "Volatility-adjusted sizing based on strategy conviction and prevailing market regime." },
  { t: "Portfolio diversification", b: "Uncorrelated exposure across currencies, metals, indices and selective equities." },
  { t: "Continuous monitoring", b: "A 24/6 risk desk with automated alerts and hard limits on drawdown and leverage." },
  { t: "Stress testing", b: "Weekly historical and hypothetical scenarios validate resilience across regimes." },
  { t: "Risk controls", b: "Concentration, leverage and correlated-exposure limits enforced at the platform level." },
];

function RiskPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Risk Management"
        title={<>Discipline is the strategy.</>}
        subtitle="Durable returns come from avoiding large losses. Our framework enforces that discipline across every managed portfolio."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.t} className="glass rounded-2xl p-6">
              <ShieldCheck className="h-6 w-6 text-gold" />
              <h3 className="mt-4 font-display text-lg font-semibold">{p.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.b}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-gold/30 bg-gold/5 p-6 text-sm text-muted-foreground">
          <strong className="text-gold">Important:</strong> All investing involves risk, including the loss of principal.
          There is no guarantee that any strategy will achieve its objective. Past performance is not indicative of, and
          does not guarantee, future results. Investors should carefully consider their objectives and risk tolerance
          before investing.
        </div>
      </section>
    </PageShell>
  );
}