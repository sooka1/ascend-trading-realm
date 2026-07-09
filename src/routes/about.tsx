import { createFileRoute } from "@tanstack/react-router";
import { Globe2, Rocket, ShieldCheck, Users } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { AnimatedCounter } from "@/components/animated-counter";
import { usePage } from "@/lib/i18n";

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
  const p = usePage().about;
  return (
    <PageShell>
      <PageHero
        eyebrow={p.hero.eyebrow}
        title={<>{p.hero.titleA} <span className="text-gradient">{p.hero.titleB}</span></>}
        subtitle={p.hero.subtitle}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: 2_400_000, suffix: "+", label: p.stats.clients },
            { value: 184, suffix: "", label: p.stats.countries },
            { value: 12, suffix: "B+", prefix: "$", label: p.stats.volume },
            { value: 850, suffix: "+", label: p.stats.team },
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
            { icon: Rocket, title: p.values.missionT, body: p.values.missionB },
            { icon: ShieldCheck, title: p.values.valuesT, body: p.values.valuesB },
            { icon: Globe2, title: p.values.reachT, body: p.values.reachB },
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
            <Users className="h-5 w-5 text-gold" /> <span className="text-xs uppercase tracking-widest">{p.leadership.eyebrow}</span>
          </div>
          <h3 className="mt-3 font-display text-3xl font-bold">{p.leadership.title}</h3>
          <p className="mt-4 max-w-3xl text-muted-foreground">{p.leadership.body}</p>
        </div>
      </section>
    </PageShell>
  );
}
