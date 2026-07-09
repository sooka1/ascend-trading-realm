import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { AnimatedChart } from "@/components/animated-chart";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "Performance Reports — HK Investment Management" },
      { name: "description", content: "Historical performance figures for HK Investment Management managed portfolios. Past performance is not indicative of future results." },
      { property: "og:title", content: "Performance Reports" },
    ],
  }),
  component: PerformancePage,
});

const rows = [
  { name: "Conservative", ytd: "+7.2%", y1: "+9.6%", y3: "+28.4%", vol: "4.8%", maxDd: "-3.1%" },
  { name: "Balanced", ytd: "+12.4%", y1: "+15.2%", y3: "+52.8%", vol: "8.9%", maxDd: "-6.4%" },
  { name: "Growth", ytd: "+18.4%", y1: "+22.3%", y3: "+81.6%", vol: "13.7%", maxDd: "-11.2%" },
];

function PerformancePage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Performance"
        title={<>Track record, reported with clarity.</>}
        subtitle="Illustrative performance figures for our managed portfolio strategies. Detailed monthly and annual statements are available in the client portal."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass-strong rounded-3xl p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Balanced Growth Portfolio — cumulative return</p>
              <p className="mt-1 font-display text-3xl font-semibold">+52.8% <span className="text-sm text-muted-foreground">3Y</span></p>
            </div>
            <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold">Illustrative</span>
          </div>
          <AnimatedChart />
        </div>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-sm">
            <thead className="text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">Portfolio</th>
                <th className="px-4 py-2 text-right">YTD</th>
                <th className="px-4 py-2 text-right">1Y</th>
                <th className="px-4 py-2 text-right">3Y</th>
                <th className="px-4 py-2 text-right">Volatility</th>
                <th className="px-4 py-2 text-right">Max drawdown</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="bg-white/[0.03]">
                  <td className="rounded-l-xl px-4 py-4 font-display font-semibold">{r.name}</td>
                  <td className="px-4 py-4 text-right text-gold">{r.ytd}</td>
                  <td className="px-4 py-4 text-right">{r.y1}</td>
                  <td className="px-4 py-4 text-right">{r.y3}</td>
                  <td className="px-4 py-4 text-right text-muted-foreground">{r.vol}</td>
                  <td className="rounded-r-xl px-4 py-4 text-right text-muted-foreground">{r.maxDd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Performance figures shown are illustrative and net of a hypothetical fee schedule. Past performance is not
          indicative of, and does not guarantee, future results. Investing involves risk, including loss of principal.
        </p>
      </section>
    </PageShell>
  );
}