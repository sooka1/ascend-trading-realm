import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/economic-calendar")({
  head: () => ({
    meta: [
      { title: "Economic Calendar — Live macro events | HK Global Trading" },
      { name: "description", content: "Live economic calendar covering every major macro release, central bank event and earnings print. Filter by impact and region." },
      { property: "og:title", content: "HK Economic Calendar" },
      { property: "og:description", content: "The macro events that move markets — all in one view." },
    ],
  }),
  component: EconCal,
});

type Impact = "high" | "medium" | "low";
const rows: { time: string; ccy: string; event: string; impact: Impact; prev: string; est: string }[] = [
  { time: "12:30", ccy: "USD", event: "Non-Farm Payrolls", impact: "high", prev: "175K", est: "185K" },
  { time: "12:30", ccy: "USD", event: "Unemployment Rate", impact: "high", prev: "3.9%", est: "3.9%" },
  { time: "14:00", ccy: "USD", event: "ISM Services PMI", impact: "medium", prev: "51.4", est: "52.0" },
  { time: "13:00", ccy: "GBP", event: "BoE Rate Decision", impact: "high", prev: "5.25%", est: "5.00%" },
  { time: "09:00", ccy: "EUR", event: "German Factory Orders m/m", impact: "medium", prev: "-4.2%", est: "0.4%" },
  { time: "23:50", ccy: "JPY", event: "GDP q/q", impact: "high", prev: "0.4%", est: "0.6%" },
  { time: "01:30", ccy: "AUD", event: "RBA Meeting Minutes", impact: "medium", prev: "—", est: "—" },
  { time: "15:00", ccy: "CAD", event: "BoC Governor Speech", impact: "low", prev: "—", est: "—" },
];

function EconCal() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Economic Calendar"
        title={<>The events that <span className="text-gradient">move markets</span></>}
        subtitle="Filter every macro release by impact, currency and region — with historical vs consensus at a glance."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass-strong overflow-hidden rounded-2xl">
          <div className="grid grid-cols-[80px_60px_1fr_100px_90px_90px] gap-3 border-b border-white/5 px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground">
            <div>Time</div>
            <div>Ccy</div>
            <div>Event</div>
            <div>Impact</div>
            <div className="text-right">Prev</div>
            <div className="text-right">Est</div>
          </div>
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[80px_60px_1fr_100px_90px_90px] items-center gap-3 border-b border-white/5 px-6 py-4 last:border-b-0 text-sm">
              <div className="tabular-nums text-muted-foreground">{r.time}</div>
              <div className="font-medium">{r.ccy}</div>
              <div className="truncate">{r.event}</div>
              <div>
                <span className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-widest",
                  r.impact === "high" && "border-bear/30 bg-bear/10 text-bear",
                  r.impact === "medium" && "border-gold/30 bg-gold/10 text-gold",
                  r.impact === "low" && "border-white/10 bg-white/5 text-muted-foreground",
                )}>{r.impact}</span>
              </div>
              <div className="text-right tabular-nums text-muted-foreground">{r.prev}</div>
              <div className="text-right tabular-nums">{r.est}</div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}