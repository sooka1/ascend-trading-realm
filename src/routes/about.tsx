import { createFileRoute } from "@tanstack/react-router";
import { Globe2, Rocket, ShieldCheck, Users } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { AnimatedCounter } from "@/components/animated-counter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About HK Global Trading — Our story, mission and team" },
      { name: "description", content: "HK Global Trading is a premium multi-asset broker and competition platform serving 2M+ traders across 184 countries." },
      { property: "og:title", content: "About HK Global Trading" },
      { property: "og:description", content: "The story behind the world's most competitive trading platform." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PageShell>
      <PageHero
        eyebrow="About us"
        title={<>Built by traders, <span className="text-gradient">for traders</span></>}
        subtitle="Founded in 2019, HK Global Trading unifies institutional-grade execution with a world-class competition ecosystem — trusted by more than 2 million clients worldwide."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: 2_400_000, suffix: "+", label: "Active clients" },
            { value: 184, suffix: "", label: "Countries" },
            { value: 12, suffix: "B+", prefix: "$", label: "Monthly volume" },
            { value: 850, suffix: "+", label: "Team members" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-6 text-center">
              <div className="font-display text-3xl font-bold text-gradient">
                <AnimatedCounter value={s.value} prefix={(s as any).prefix ?? ""} suffix={s.suffix} />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {[
            { icon: Rocket, title: "Our mission", body: "Give every trader — from first click to portfolio manager — an unfair edge through technology, education and competition." },
            { icon: ShieldCheck, title: "Our values", body: "Transparent pricing, uncompromising security, and a fanatical bias toward client outcomes over house P&L." },
            { icon: Globe2, title: "Our reach", body: "Local expertise on five continents, 24/7 multilingual support, and licenses across leading global regulators." },
          ].map((v) => (
            <div key={v.title} className="glass rounded-2xl p-6">
              <v.icon className="h-6 w-6 text-gold" />
              <h3 className="mt-4 font-display text-xl font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 glass-strong rounded-3xl p-8 md:p-12">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Users className="h-5 w-5 text-gold" /> <span className="text-xs uppercase tracking-widest">Leadership</span>
          </div>
          <h3 className="mt-3 font-display text-3xl font-bold">A team forged on trading floors</h3>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Our leadership brings decades of experience from Goldman Sachs, Jane Street, Coinbase and Interactive Brokers.
            We build for traders because we are traders — and every product decision passes through a live P&amp;L.
          </p>
        </div>
      </section>
    </PageShell>
  );
}