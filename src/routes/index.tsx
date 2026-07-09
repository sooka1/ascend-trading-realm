import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Briefcase,
  ChartLine,
  FileText,
  Globe2,
  Headphones,
  Lock,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { MarketTicker } from "@/components/market-ticker";
import { AnimatedCounter } from "@/components/animated-counter";
import { Button } from "@/components/ui/button";
import { AnimatedChart } from "@/components/animated-chart";
import { useI18n } from "@/lib/i18n";
import { LANDING, type LandingContent } from "@/lib/landing-t";
import heroVideo from "@/assets/hero-bg.mp4.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HK Investment Management — Professional Portfolio Management" },
      {
        name: "description",
        content:
          "Professionally managed investment portfolios across Forex, Gold, Commodities, Indices and Stocks. Disciplined risk management, transparent reporting, secure client portal.",
      },
      { property: "og:title", content: "HK Investment Management" },
      {
        property: "og:description",
        content: "Professional Investment Management with disciplined risk controls and transparent reporting.",
      },
    ],
  }),
  component: Home,
});

function useContent(): LandingContent {
  const { lang } = useI18n();
  return LANDING[lang];
}

function Home() {
  const c = useContent();
  return (
    <PageShell>
      <Hero c={c} />
      <MarketTicker />
      <TrustStrip c={c} />
      <Features c={c} />
      <SolutionsPreview c={c} />
      <PerformanceBand c={c} />
      <RiskFramework c={c} />
      <SecurityBlock c={c} />
      <PortalPreview c={c} />
      <FinalCTA c={c} />
    </PageShell>
  );
}

function Hero({ c }: { c: LandingContent }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/5">
      {/* Cinematic brand video */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <video
          className="h-full w-full object-cover"
          src={heroVideo.url}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster=""
        />
        {/* Layered overlays: darken + brand tint + fade-to-page */}
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pt-24 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:px-8 lg:pt-32 lg:pb-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-gold">
            <Sparkles className="h-3 w-3" /> {c.hero.badge}
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
            {c.hero.titleA} <span className="text-gradient">{c.hero.titleB}</span> {c.hero.titleC}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">{c.hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="bg-[var(--gradient-gold)] font-semibold text-background shadow-[var(--shadow-gold)] hover:opacity-95">
              <Link to="/auth">{c.hero.ctaOpen} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/15">
              <Link to="/contact">{c.hero.ctaAdvisor}</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to="/solutions">{c.hero.ctaLearn}</Link>
            </Button>
          </div>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 text-sm">
            {[
              { k: c.hero.statAum, v: "$1.2B+" },
              { k: c.hero.statClients, v: "18,400+" },
              { k: c.hero.statCountries, v: "62" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">{s.k}</dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="glass-strong rounded-3xl p-6 shadow-[var(--shadow-glow)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.hero.cardTitle}</p>
                <p className="mt-1 font-display text-2xl font-semibold">+18.4% <span className="text-sm font-normal text-muted-foreground">{c.hero.ytd}</span></p>
              </div>
              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold">{c.hero.live}</span>
            </div>
            <AnimatedChart />
            <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
              {[
                { k: "1M", v: "+2.1%" },
                { k: "6M", v: "+9.7%" },
                { k: "1Y", v: "+22.3%" },
              ].map((r) => (
                <div key={r.k} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <p className="text-muted-foreground">{r.k}</p>
                  <p className="mt-1 font-semibold text-foreground">{r.v}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{c.hero.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}

function TrustStrip({ c }: { c: LandingContent }) {
  const items = [
    { icon: ShieldCheck, label: c.trust.regulated },
    { icon: Lock, label: c.trust.funds },
    { icon: BadgeCheck, label: c.trust.audits },
    { icon: Globe2, label: c.trust.global },
  ];
  return (
    <section className="border-b border-white/5 bg-white/[0.02]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-6 text-sm text-muted-foreground sm:px-6 md:grid-cols-4 lg:px-8">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2">
            <it.icon className="h-4 w-4 text-gold" /> {it.label}
          </div>
        ))}
      </div>
    </section>
  );
}

function Features({ c }: { c: LandingContent }) {
  const icons = [Briefcase, BarChart3, FileText, Lock, ChartLine, Users, ShieldCheck, Headphones];
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <span className="text-xs uppercase tracking-[0.22em] text-gold">{c.features.eyebrow}</span>
        <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
          {c.features.titleA} <span className="text-gradient">{c.features.titleB}</span>
        </h2>
        <p className="mt-4 text-muted-foreground">{c.features.subtitle}</p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {c.features.items.map((f, i) => {
          const Icon = icons[i] ?? Briefcase;
          return (
            <div key={f.t} className="glass group rounded-2xl p-6 transition hover:-translate-y-0.5 hover:border-gold/30">
              <Icon className="h-6 w-6 text-gold" />
              <h3 className="mt-4 font-display text-lg font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.b}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SolutionsPreview({ c }: { c: LandingContent }) {
  const targets = ["6 – 10%", "10 – 16%", "16 – 24%"];
  const mins = ["$25,000", "$100,000", "$250,000"];
  return (
    <section className="border-y border-white/5 bg-white/[0.02] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.22em] text-gold">{c.solutions.eyebrow}</span>
            <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">{c.solutions.title}</h2>
          </div>
          <Button asChild variant="outline" className="border-white/15">
            <Link to="/portfolios">{c.solutions.explore} <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {c.solutions.tiers.map((p, i) => (
            <div key={p.name} className={`glass-strong rounded-3xl p-8 ${i === 1 ? "ring-1 ring-gold/40" : ""}`}>
              {i === 1 && <span className="mb-3 inline-block rounded-full bg-gold/15 px-3 py-1 text-xs text-gold">{c.solutions.popular}</span>}
              <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.solutions.target}</p>
              <p className="font-display text-4xl font-semibold text-gradient">{targets[i]}</p>
              <dl className="mt-6 space-y-3 text-sm">
                <Row k={c.solutions.risk} v={p.risk} />
                <Row k={c.solutions.min} v={mins[i]} />
                <Row k={c.solutions.allocation} v={p.allocation} />
              </dl>
              <Button asChild className="mt-6 w-full bg-[var(--gradient-gold)] font-semibold text-background hover:opacity-95">
                <Link to="/auth">{c.solutions.open}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium text-foreground">{v}</dd>
    </div>
  );
}

function PerformanceBand({ c }: { c: LandingContent }) {
  const stats = [
    { k: c.perf.aum, n: 1.2, suffix: "B+", prefix: "$", decimals: 1 },
    { k: c.perf.accounts, n: 18400, suffix: "+", decimals: 0 },
    { k: c.perf.tenure, n: 4.7, suffix: "", decimals: 1 },
    { k: c.perf.sat, n: 98, suffix: "%", decimals: 0 },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid gap-6 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-10 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.k}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.k}</p>
            <p className="mt-2 font-display text-4xl font-semibold text-foreground">
              <AnimatedCounter value={s.n} prefix={s.prefix ?? ""} suffix={s.suffix} decimals={s.decimals} />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RiskFramework({ c }: { c: LandingContent }) {
  return (
    <section className="border-y border-white/5 bg-white/[0.02] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.22em] text-gold">{c.riskf.eyebrow}</span>
          <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">{c.riskf.title}</h2>
          <p className="mt-4 text-muted-foreground">{c.riskf.subtitle}</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {c.riskf.items.map((it) => (
            <div key={it.t} className="rounded-2xl border border-white/5 bg-background/40 p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-gold" />
                <h3 className="font-display text-lg font-semibold">{it.t}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{it.b}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-xs text-muted-foreground">{c.riskf.disclaimer}</p>
      </div>
    </section>
  );
}

function SecurityBlock({ c }: { c: LandingContent }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <div>
          <span className="text-xs uppercase tracking-[0.22em] text-gold">{c.security.eyebrow}</span>
          <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">{c.security.title}</h2>
          <p className="mt-4 max-w-md text-muted-foreground">{c.security.subtitle}</p>
          <Button asChild variant="outline" className="mt-6 border-white/15">
            <Link to="/legal">{c.security.legal}</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {c.security.items.map((it) => (
            <div key={it.t} className="glass rounded-2xl p-5">
              <Lock className="h-5 w-5 text-gold" />
              <h3 className="mt-3 font-display text-base font-semibold">{it.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{it.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PortalPreview({ c }: { c: LandingContent }) {
  const icons = [Wallet, TrendingUp, FileText, Headphones];
  return (
    <section className="border-y border-white/5 bg-white/[0.02] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.22em] text-gold">{c.portal.eyebrow}</span>
            <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">{c.portal.title}</h2>
          </div>
          <Button asChild variant="outline" className="border-white/15">
            <Link to="/auth">{c.portal.access} <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {c.portal.items.map((r, i) => {
            const Icon = icons[i] ?? Wallet;
            return (
              <div key={r.t} className="glass rounded-2xl p-6">
                <Icon className="h-5 w-5 text-gold" />
                <h3 className="mt-3 font-display text-lg font-semibold">{r.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.b}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ c }: { c: LandingContent }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <span className="text-xs uppercase tracking-[0.22em] text-gold">{c.final.eyebrow}</span>
      <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
        {c.final.titleA} <span className="text-gradient">{c.final.titleB}</span>
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{c.final.note}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" className="bg-[var(--gradient-gold)] font-semibold text-background hover:opacity-95">
          <Link to="/auth">{c.final.cta}</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="border-white/15">
          <Link to="/contact">{c.hero.ctaAdvisor}</Link>
        </Button>
      </div>
    </section>
  );
}
