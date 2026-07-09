import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { ShieldCheck } from "lucide-react";
import { useStatic } from "@/lib/i18n";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "Risk Management — HK Investment Management" },
      { name: "description", content: "How HK Investment Management approaches capital preservation, position sizing, diversification, monitoring and stress testing." },
      { property: "og:title", content: "Risk Management" },
    ],
  }),
  component: RiskPage,
});

function RiskPage() {
  const p = useStatic().risk;
  return (
    <PageShell>
      <PageHero
        eyebrow={p.eyebrow}
        title={<>{p.title}</>}
        subtitle={p.subtitle}
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {p.pillars.map((pi) => (
            <div key={pi.t} className="glass rounded-2xl p-6">
              <ShieldCheck className="h-6 w-6 text-gold" />
              <h3 className="mt-4 font-display text-lg font-semibold">{pi.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{pi.b}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-gold/30 bg-gold/5 p-6 text-sm text-muted-foreground">
          <strong className="text-gold">{p.important}</strong> {p.disclaimer}
        </div>
      </section>
    </PageShell>
  );
}