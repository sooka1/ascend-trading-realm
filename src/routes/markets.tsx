import { createFileRoute } from "@tanstack/react-router";
import { Bitcoin, DollarSign, Flame, Layers, LineChart, Medal } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { MarketTicker } from "@/components/market-ticker";
import { MarketBoard } from "@/components/market-board";
import { usePage } from "@/lib/i18n";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "Markets — Forex, Crypto, Stocks, Indices | HKEX" },
      { name: "description", content: "Trade 10,000+ instruments." },
      { property: "og:title", content: "HKEX Markets" },
      { property: "og:description", content: "10,000+ instruments across every major asset class." },
    ],
  }),
  component: Markets,
});

function Markets() {
  const p = usePage().markets;
  const icons = [DollarSign, Bitcoin, Medal, LineChart, Layers, Flame];
  return (
    <PageShell>
      <PageHero
        eyebrow={p.hero.eyebrow}
        title={<>{p.hero.titleA} <span className="text-gradient">{p.hero.titleB}</span></>}
        subtitle={p.hero.subtitle}
      />
      <MarketTicker />
      <MarketBoard />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {p.groups.map((g, i) => {
            const Icon = icons[i];
            return (
              <div key={g.name} className="glass rounded-2xl p-6">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--gradient-brand-soft)]">
                  <Icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{g.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{g.desc}</p>
                <ul className="mt-4 space-y-1 text-sm">
                  {g.specs.map((s) => (
                    <li key={s} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold" />{s}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
