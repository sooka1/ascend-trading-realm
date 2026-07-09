import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { Bitcoin, Building2, CandlestickChart, Coins, Globe2, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStatic } from "@/lib/i18n";

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: "Investment Solutions — HK Investment Management" },
      { name: "description", content: "Managed investment solutions across Forex, Gold, Commodities, Indices and Stocks — designed around your objectives." },
      { property: "og:title", content: "Investment Solutions" },
      { property: "og:description", content: "Multi-asset managed portfolios with disciplined risk controls." },
    ],
  }),
  component: SolutionsPage,
});

function SolutionsPage() {
  const p = useStatic().solutions;
  const icons = [Globe2, Coins, Building2, LineChart, CandlestickChart, Bitcoin];
  const asset = p.assets.map((a, i) => ({ icon: icons[i], t: a.t, b: a.b }));
  return (
    <PageShell>
      <PageHero
        eyebrow={p.eyebrow}
        title={<>{p.title}</>}
        subtitle={p.subtitle}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {asset.map((a) => (
            <div key={a.t} className="glass rounded-2xl p-6">
              <a.icon className="h-6 w-6 text-gold" />
              <h3 className="mt-4 font-display text-lg font-semibold">{a.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.b}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild className="bg-[var(--gradient-gold)] font-semibold text-background">
            <Link to="/portfolios">{p.ctaPortfolios}</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/15">
            <Link to="/contact">{p.ctaAdvisor}</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}