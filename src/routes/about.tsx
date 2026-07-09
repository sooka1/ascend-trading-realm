import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { Award, Compass, Handshake, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About HK — HK Investment Management" },
      { name: "description", content: "Learn about HK Investment Management: our mission, values and experienced team of portfolio managers." },
      { property: "og:title", content: "About HK Investment Management" },
      { property: "og:description", content: "Our mission is to help investors access professionally managed investment strategies." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const values = [
    { icon: Target, t: "Client-first", b: "Your objectives shape every allocation. We are aligned with your outcomes." },
    { icon: Compass, t: "Discipline", b: "Rules-based risk controls prevent emotion from moving the portfolio." },
    { icon: Handshake, t: "Transparency", b: "Every position and every fee is reported — nothing hidden." },
    { icon: Award, t: "Excellence", b: "A senior team with decades of institutional experience." },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="About HK"
        title={<>Professional investment management, built for the long term.</>}
        subtitle="HK Investment Management helps investors access professionally managed investment strategies with transparency, disciplined risk management and long-term performance."
      />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass-strong rounded-3xl p-10">
          <h2 className="font-display text-3xl font-semibold">Our mission</h2>
          <p className="mt-4 text-muted-foreground">
            Help investors access professionally managed investment strategies with transparency, disciplined risk
            management, and long-term performance. We believe great investment outcomes come from clarity of process,
            respect for risk, and a genuine partnership with our clients.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-semibold">Our values</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.t} className="glass rounded-2xl p-6">
              <v.icon className="h-6 w-6 text-gold" />
              <h3 className="mt-4 font-display text-lg font-semibold">{v.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.b}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild className="bg-[var(--gradient-gold)] font-semibold text-background">
            <Link to="/portfolios">Explore managed portfolios</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/15">
            <Link to="/contact">Talk to an advisor</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}