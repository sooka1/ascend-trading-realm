import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, BarChart3, Cpu, LineChart, Radio, Terminal, Zap } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/platform")({
  head: () => ({
    meta: [
      { title: "Trading Platform — HK Global Trading" },
      { name: "description", content: "Institutional-grade charting, sub-20ms execution, algo orders and depth-of-market — all in a single trading terminal." },
      { property: "og:title", content: "The HK Trading Platform" },
      { property: "og:description", content: "Institutional-grade execution and pro-grade tools in one terminal." },
    ],
  }),
  component: Platform,
});

function Platform() {
  const features = [
    { icon: Zap, title: "Sub-20ms execution", body: "Direct market access with intelligent smart-order routing." },
    { icon: BarChart3, title: "Advanced charting", body: "60+ indicators, drawing tools and multi-timeframe analysis." },
    { icon: Cpu, title: "Algo & VPS", body: "Deploy strategies in Pine, MQL or Python on our low-latency VPS." },
    { icon: Radio, title: "Real-time signals", body: "Curated setups from institutional desks and quant models." },
    { icon: LineChart, title: "Depth of market", body: "Full L2 book, footprint, and volume profile out of the box." },
    { icon: Terminal, title: "One-click trading", body: "Custom hotkeys, bracket orders and lightning fast liquidation." },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="Trading Platform"
        title={<>The <span className="text-gradient">terminal</span> pros trust</>}
        subtitle="Every tool a professional trader needs, unified in a single high-performance interface — on web, desktop and mobile."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--gradient-brand-soft)]">
                <f.icon className="h-5 w-5 text-gold" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 glass-strong rounded-3xl p-10 text-center">
          <Activity className="mx-auto h-8 w-8 text-gold" />
          <h3 className="mt-4 font-display text-3xl font-bold">Try it live in seconds</h3>
          <p className="mt-3 text-muted-foreground">A pre-funded demo account with $100k in virtual capital — no signup required.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-[var(--gradient-brand)] text-white"><Link to="/auth">Try Demo</Link></Button>
            <Button variant="outline" asChild className="border-white/15 bg-white/5"><Link to="/auth">Open Live Account</Link></Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}