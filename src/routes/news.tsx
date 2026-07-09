import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "Market News — Live analysis and insights | HK Global Trading" },
      { name: "description", content: "Real-time market news, macro analysis and trading insights from HK Global Trading's research desk." },
      { property: "og:title", content: "HK Global Trading — Market News" },
      { property: "og:description", content: "Live market analysis from our research desk." },
    ],
  }),
  component: News,
});

function News() {
  const items = [
    { tag: "Market brief", time: "2h", title: "Gold breaks $2,400 as central banks pivot dovish", body: "A cluster of policy signals across the ECB, BoE and Fed has sent gold to a fresh all-time high on record ETF inflows." },
    { tag: "Deep dive", time: "6h", title: "Bitcoin ETF flows point to fresh institutional wave", body: "Weekly BTC ETF inflows crossed $1.8B for the first time since March — a signal that treasuries and pensions are back in the market." },
    { tag: "Signal", time: "1d", title: "EUR/USD sets up a textbook liquidity sweep", body: "Price is trading into a swept high on the 4H, with clean shift-of-character back below prior resistance." },
    { tag: "Analysis", time: "1d", title: "Semiconductor rally: rotation or resumption?", body: "SOX index is 3% off ATH with breadth improving — we break down the desk's positioning." },
    { tag: "Macro", time: "2d", title: "Yen carry trade unwinds — how to hedge", body: "Historical playbook for USDJPY reversals and second-order effects on emerging market FX." },
    { tag: "Commodity", time: "2d", title: "Brent finds bid on Middle East risk premium", body: "Options market pricing an increased tail risk into month-end." },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="Market news"
        title={<>Live analysis. <span className="text-gradient">Real edge.</span></>}
        subtitle="Daily briefings, deep dives and actionable setups from the HK research desk."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((n) => (
            <article key={n.title} className="glass rounded-2xl p-6 transition hover:border-white/20">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
                <span>{n.tag}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{n.time} ago</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold">{n.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{n.body}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}