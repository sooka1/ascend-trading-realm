import { createFileRoute } from "@tanstack/react-router";
import { Bitcoin, DollarSign, Flame, Layers, LineChart, Medal } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { MarketTicker } from "@/components/market-ticker";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "Markets — Forex, Crypto, Stocks, Indices | HK Global Trading" },
      { name: "description", content: "Trade 10,000+ instruments across forex, crypto, stocks, indices, commodities and futures — all from a single HK account." },
      { property: "og:title", content: "HK Global Trading Markets" },
      { property: "og:description", content: "10,000+ instruments across every major asset class." },
    ],
  }),
  component: Markets,
});

function Markets() {
  const groups = [
    { icon: DollarSign, name: "Forex", desc: "60+ major, minor and exotic pairs with raw-spread execution.", specs: ["From 0.0 pips", "1:500 leverage", "24/5"] },
    { icon: Bitcoin, name: "Crypto", desc: "120+ coins with deep liquidity and low commissions.", specs: ["24/7 trading", "Perpetual futures", "Cold storage"] },
    { icon: Medal, name: "Metals", desc: "Gold, silver, platinum and palladium — spot and futures.", specs: ["Physical delivery", "Micro contracts", "Overnight financing"] },
    { icon: LineChart, name: "Indices", desc: "30+ global cash and futures indices.", specs: ["S&P 500, Nasdaq", "DAX, FTSE, Nikkei", "Extended hours"] },
    { icon: Layers, name: "Stocks & ETFs", desc: "5,000+ US, European and Asian stocks plus 300 ETFs.", specs: ["Fractional shares", "Pre-market", "Dividend paid"] },
    { icon: Flame, name: "Energy", desc: "Brent, WTI, Natural Gas, Heating Oil.", specs: ["Continuous contracts", "Roll-free", "Tight spreads"] },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="Markets"
        title={<>Every market. <span className="text-gradient">Every session.</span></>}
        subtitle="From forex majors to frontier crypto — access 10,000+ instruments through one unified account."
      />
      <MarketTicker />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <div key={g.name} className="glass rounded-2xl p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--gradient-brand-soft)]">
                <g.icon className="h-5 w-5 text-gold" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{g.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{g.desc}</p>
              <ul className="mt-4 space-y-1 text-sm">
                {g.specs.map((s) => (
                  <li key={s} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}