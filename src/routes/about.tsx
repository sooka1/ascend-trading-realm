import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { Award, Compass, Handshake, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePage, useT } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About HK — HKEX Invest" },
      { name: "description", content: "Learn about HKEX Invest: our mission, values and experienced team of portfolio managers." },
      { property: "og:title", content: "About HKEX Invest" },
      { property: "og:description", content: "Our mission is to help investors access professionally managed investment strategies." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const p = usePage().about;
  const t = useT();
  const values = [
    { icon: Target, t: t("about.val.clientT"), b: t("about.val.clientB") },
    { icon: Compass, t: t("about.val.discT"), b: t("about.val.discB") },
    { icon: Handshake, t: t("about.val.transT"), b: t("about.val.transB") },
    { icon: Award, t: t("about.val.excT"), b: t("about.val.excB") },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow={p.hero.eyebrow}
        title={<>{p.hero.titleA} <span className="text-gradient">{p.hero.titleB}</span></>}
        subtitle={p.hero.subtitle}
      />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass-strong rounded-3xl p-10">
          <h2 className="font-display text-3xl font-semibold">{p.values.missionT}</h2>
          <p className="mt-4 whitespace-pre-line text-muted-foreground">{p.values.missionB}</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-semibold">{p.values.valuesT}</h2>
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
            <Link to="/portfolios">{t("about.cta.portfolios")}</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/15">
            <Link to="/contact">{t("about.cta.advisor")}</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}