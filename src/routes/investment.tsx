import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, LineChart, Lock, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/investment")({
  head: () => ({
    meta: [
      { title: "Managed Investment — HK Global Trading" },
      { name: "description", content: "We trade on your behalf. Professional traders manage your capital across forex, gold, indices and crypto with strict risk controls and full transparency." },
      { property: "og:title", content: "Managed Investment — HK Global Trading" },
      { property: "og:description", content: "Professional traders managing your capital with proven strategies and full transparency." },
    ],
  }),
  component: InvestmentPage,
});

function InvestmentPage() {
  const t = useT();

  const features = [
    { icon: Users, t: t("inv.f1.t"), b: t("inv.f1.b") },
    { icon: ShieldCheck, t: t("inv.f2.t"), b: t("inv.f2.b") },
    { icon: LineChart, t: t("inv.f3.t"), b: t("inv.f3.b") },
    { icon: Lock, t: t("inv.f4.t"), b: t("inv.f4.b") },
  ];

  const plans = [
    { name: t("inv.plan.starter"), min: "$1,000", fee: "20%", target: "8–14%", highlight: false },
    { name: t("inv.plan.growth"), min: "$10,000", fee: "25%", target: "14–22%", highlight: true },
    { name: t("inv.plan.pro"), min: "$100,000", fee: "30%", target: "20–35%", highlight: false },
  ];

  const steps = [
    { t: t("inv.how.s1.t"), b: t("inv.how.s1.b") },
    { t: t("inv.how.s2.t"), b: t("inv.how.s2.b") },
    { t: t("inv.how.s3.t"), b: t("inv.how.s3.b") },
  ];

  return (
    <PageShell>
      <PageHero
        eyebrow={t("inv.eyebrow")}
        title={<>{t("inv.title.a")} <span className="text-gradient">{t("inv.title.b")}</span></>}
        subtitle={t("inv.subtitle")}
      />

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="bg-[var(--gradient-brand)] text-white shadow-[var(--shadow-glow)]">
            <Link to="/auth">{t("inv.cta.start")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/15">
            <Link to="/contact">{t("inv.cta.contact")}</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.t} className="glass rounded-2xl p-6">
              <f.icon className="h-6 w-6 text-gold" />
              <h3 className="mt-4 font-display text-lg font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{t("inv.plans.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("inv.plans.sub")}</p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-6 ${p.highlight ? "glass-strong ring-1 ring-gold/40" : "glass"}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                {p.highlight && <BadgeCheck className="h-5 w-5 text-gold" />}
              </div>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <dt className="text-muted-foreground">{t("inv.plan.min")}</dt>
                  <dd className="font-semibold">{p.min}</dd>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <dt className="text-muted-foreground">{t("inv.plan.fee")}</dt>
                  <dd className="font-semibold">{p.fee}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("inv.plan.target")}</dt>
                  <dd className="font-semibold text-gradient">{p.target}</dd>
                </div>
              </dl>
              <Button asChild className="mt-6 w-full bg-[var(--gradient-brand)] text-white">
                <Link to="/auth">{t("inv.cta.start")}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{t("inv.how.title")}</h2>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.t} className="glass rounded-2xl p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gradient-brand)] font-display text-white">
                {i + 1}
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.b}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-sm text-muted-foreground">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <p>{t("inv.risk")}</p>
        </div>
      </section>
    </PageShell>
  );
}