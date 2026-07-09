import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { Bitcoin, Building2, CandlestickChart, Coins, Globe2, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const asset = [
    { icon: Globe2, t: "Foreign Exchange", b: "Diversified currency exposure across major and select emerging pairs." },
    { icon: Coins, t: "Gold & Precious Metals", b: "Strategic and tactical positioning as an inflation and volatility hedge." },
    { icon: Building2, t: "Commodities", b: "Rules-based exposure to energy, agriculture and industrial metals." },
    { icon: LineChart, t: "Indices", b: "Diversified equity index exposure across global markets." },
    { icon: CandlestickChart, t: "Stocks", b: "Selective single-name exposure managed inside strict risk limits." },
    { icon: Bitcoin, t: "Digital Assets", b: "Optional overlay allocation for eligible investors, size-controlled." },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="Investment Solutions"
        title={<>Managed portfolios, tailored to your objectives.</>}
        subtitle="Multi-asset solutions across Forex, Gold, Commodities, Indices, Stocks and digital assets — constructed and monitored by our investment team."
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
            <Link to="/portfolios">See managed portfolios</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/15">
            <Link to="/contact">Speak with an advisor</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}