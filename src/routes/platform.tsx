import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, BarChart3, Cpu, LineChart, Radio, Terminal, Zap } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { usePage } from "@/lib/i18n";

export const Route = createFileRoute("/platform")({
  head: () => ({
    meta: [
      { title: "Trading Platform — HK Global Trading" },
      { name: "description", content: "Institutional-grade charting, sub-20ms execution." },
      { property: "og:title", content: "The HK Trading Platform" },
      { property: "og:description", content: "Institutional-grade tools in one terminal." },
    ],
  }),
  component: Platform,
});

function Platform() {
  const p = usePage().platform;
  const icons = [Zap, BarChart3, Cpu, Radio, LineChart, Terminal];
  return (
    <PageShell>
      <PageHero
        eyebrow={p.hero.eyebrow}
        title={<>{p.hero.titleA} <span className="text-gradient">{p.hero.titleB}</span></>}
        subtitle={p.hero.subtitle}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {p.features.map((f, i) => {
            const Icon = icons[i];
            return (
              <div key={f.title} className="glass rounded-2xl p-6">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--gradient-brand-soft)]">
                  <Icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 glass-strong rounded-3xl p-10 text-center">
          <Activity className="mx-auto h-8 w-8 text-gold" />
          <h3 className="mt-4 font-display text-3xl font-bold">{p.demo.title}</h3>
          <p className="mt-3 text-muted-foreground">{p.demo.body}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-[var(--gradient-brand)] text-white"><Link to="/auth">{p.demo.tryDemo}</Link></Button>
            <Button variant="outline" asChild className="border-white/15 bg-white/5"><Link to="/auth">{p.demo.openLive}</Link></Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
