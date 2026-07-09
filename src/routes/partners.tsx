import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Handshake, Users } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partners — Introducing Brokers & Institutional | HK Global" },
      { name: "description", content: "White-label solutions, introducing broker programs and institutional partnerships with HK Global Trading." },
      { property: "og:title", content: "Partner with HK Global Trading" },
      { property: "og:description", content: "White-label, IB and institutional partnerships." },
    ],
  }),
  component: Partners,
});

function Partners() {
  const models = [
    { icon: Handshake, title: "Introducing Broker", body: "Refer clients and earn ongoing revenue share plus performance bonuses.", cta: "Apply as IB" },
    { icon: Building2, title: "White Label", body: "Launch your own broker on HK infrastructure in under 30 days.", cta: "Request a demo" },
    { icon: Users, title: "Institutional", body: "PB-grade liquidity, custom margin and dedicated relationship management.", cta: "Contact desk" },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="Partners"
        title={<>Grow with a <span className="text-gradient">world-class</span> partner</>}
        subtitle="Three tailored partnership tracks for brokers, fintechs and institutional desks."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {models.map((m) => (
            <div key={m.title} className="glass-strong rounded-2xl p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--gradient-brand-soft)]">
                <m.icon className="h-5 w-5 text-gold" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{m.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{m.body}</p>
              <Button asChild className="mt-6 w-full bg-[var(--gradient-brand)] text-white">
                <Link to="/contact">{m.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}