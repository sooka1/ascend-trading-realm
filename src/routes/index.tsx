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

function Home() {
  return (
    <PageShell>
      <Hero />
      <MarketTicker />
      <TrustStrip />
      <Features />
      <SolutionsPreview />
      <PerformanceBand />
      <RiskFramework />
      <SecurityBlock />
      <PortalPreview />
      <FinalCTA />
    </PageShell>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[var(--gradient-radial)]" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pt-24 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:px-8 lg:pt-32 lg:pb-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-gold">
            <Sparkles className="h-3 w-3" /> Professional Investment Management
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
            Professional <span className="text-gradient">Investment</span> Management
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Experienced portfolio management with disciplined risk controls, transparent reporting and client-focused
            service — across Forex, Gold, Commodities, Indices and Stocks.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="bg-[var(--gradient-gold)] font-semibold text-background shadow-[var(--shadow-gold)] hover:opacity-95">
              <Link to="/auth">Open Investment Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/15">
              <Link to="/contact">Talk to an Advisor</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to="/solutions">Learn More</Link>
            </Button>
          </div>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 text-sm">
            {[
              { k: "AUM", v: "$1.2B+" },
              { k: "Clients", v: "18,400+" },
              { k: "Countries", v: "62" },
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
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Balanced Growth Portfolio</p>
                <p className="mt-1 font-display text-2xl font-semibold">+18.4% <span className="text-sm font-normal text-muted-foreground">YTD</span></p>
              </div>
              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold">Live</span>
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
          <p className="mt-3 text-xs text-muted-foreground">
            Illustrative sample. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { icon: ShieldCheck, label: "Regulated & compliant" },
    { icon: Lock, label: "Segregated client funds" },
    { icon: BadgeCheck, label: "Independent audits" },
    { icon: Globe2, label: "Global reach, 24/6 desk" },
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

function Features() {
  const items = [
    { icon: Briefcase, t: "Professional portfolio management", b: "A senior investment team allocates across markets to pursue your objectives." },
    { icon: BarChart3, t: "Diversified investment strategies", b: "Multi-asset exposure across Forex, Gold, Commodities, Indices and Stocks." },
    { icon: FileText, t: "Transparent reporting", b: "Daily, monthly and annual statements — every position, every fee." },
    { icon: Lock, t: "Secure client portal", b: "Two-factor authentication, encrypted storage, KYC/AML verified." },
    { icon: ChartLine, t: "Real-time performance", b: "Live dashboard with equity curve, allocation and risk metrics." },
    { icon: Users, t: "Experienced team", b: "Portfolio managers, quants and risk officers with decades in global markets." },
    { icon: ShieldCheck, t: "Advanced risk framework", b: "Position sizing, drawdown limits and stress tests baked into every strategy." },
    { icon: Headphones, t: "Dedicated support", b: "Named account manager and priority relationship desk." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <span className="text-xs uppercase tracking-[0.22em] text-gold">Why HK Investment</span>
        <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
          Built for investors who value <span className="text-gradient">discipline</span>.
        </h2>
        <p className="mt-4 text-muted-foreground">
          We combine institutional-grade infrastructure with an experienced human team. Your capital is managed with
          rigor, reported with clarity, and safeguarded with the standards you would expect of a serious asset manager.
        </p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {items.map((f) => (
          <div key={f.t} className="glass group rounded-2xl p-6 transition hover:-translate-y-0.5 hover:border-gold/30">
            <f.icon className="h-6 w-6 text-gold" />
            <h3 className="mt-4 font-display text-lg font-semibold">{f.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.b}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SolutionsPreview() {
  const tiers = [
    { name: "Conservative", target: "6 – 10%", risk: "Low", min: "$25,000", allocation: "70% Fixed / 30% Growth" },
    { name: "Balanced", target: "10 – 16%", risk: "Moderate", min: "$100,000", allocation: "50% Growth / 50% Income" },
    { name: "Growth", target: "16 – 24%", risk: "Higher", min: "$250,000", allocation: "80% Growth / 20% Alt." },
  ];
  return (
    <section className="border-y border-white/5 bg-white/[0.02] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.22em] text-gold">Managed Portfolios</span>
            <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Three strategies. One standard of care.</h2>
          </div>
          <Button asChild variant="outline" className="border-white/15">
            <Link to="/portfolios">Explore portfolios <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {tiers.map((p, i) => (
            <div key={p.name} className={`glass-strong rounded-3xl p-8 ${i === 1 ? "ring-1 ring-gold/40" : ""}`}>
              {i === 1 && <span className="mb-3 inline-block rounded-full bg-gold/15 px-3 py-1 text-xs text-gold">Most popular</span>}
              <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Target annual return</p>
              <p className="font-display text-4xl font-semibold text-gradient">{p.target}</p>
              <dl className="mt-6 space-y-3 text-sm">
                <Row k="Risk profile" v={p.risk} />
                <Row k="Minimum" v={p.min} />
                <Row k="Allocation" v={p.allocation} />
              </dl>
              <Button asChild className="mt-6 w-full bg-[var(--gradient-gold)] font-semibold text-background hover:opacity-95">
                <Link to="/auth">Open account</Link>
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

function PerformanceBand() {
  const stats = [
    { k: "Assets under management", n: 1.2, suffix: "B+", prefix: "$" },
    { k: "Active client accounts", n: 18400, suffix: "+" },
    { k: "Average tenure (yrs)", n: 4.7, suffix: "" },
    { k: "Client satisfaction", n: 98, suffix: "%" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid gap-6 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-10 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.k}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.k}</p>
            <p className="mt-2 font-display text-4xl font-semibold text-foreground">
              {s.prefix ?? ""}
              <AnimatedCounter to={s.n} />
              {s.suffix}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RiskFramework() {
  const items = [
    { t: "Capital preservation", b: "Every strategy starts by defining acceptable loss, then constructs positions inside that limit." },
    { t: "Position sizing", b: "Volatility-adjusted sizing based on strategy conviction and current market regime." },
    { t: "Portfolio diversification", b: "Uncorrelated exposure across currencies, metals, indices and select single names." },
    { t: "Continuous monitoring", b: "24/6 risk desk, automated alerts and hard stops on strategy-level drawdowns." },
    { t: "Stress testing", b: "Historical and hypothetical scenarios run weekly to validate resilience." },
    { t: "Risk controls", b: "Hard limits on leverage, concentration and correlated exposure, enforced at the platform level." },
  ];
  return (
    <section className="border-y border-white/5 bg-white/[0.02] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.22em] text-gold">Risk Management</span>
          <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Discipline is the strategy.</h2>
          <p className="mt-4 text-muted-foreground">
            Our framework is built around one belief: durable returns come from avoiding large losses. Every position is
            sized, monitored and stress-tested against pre-defined risk budgets.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.t} className="rounded-2xl border border-white/5 bg-background/40 p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-gold" />
                <h3 className="font-display text-lg font-semibold">{it.t}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{it.b}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-xs text-muted-foreground">
          All investing involves risk, including loss of principal. Past performance is not indicative of, and does not
          guarantee, future results.
        </p>
      </div>
    </section>
  );
}

function SecurityBlock() {
  const items = [
    { t: "Two-factor authentication", b: "TOTP-based 2FA on every client login and sensitive action." },
    { t: "Encrypted client data", b: "AES-256 at rest and TLS 1.3 in transit for every request." },
    { t: "Secure cloud infrastructure", b: "Hardened production environment with least-privilege access." },
    { t: "KYC verification", b: "Identity verification on every account before activation." },
    { t: "AML compliance", b: "Transaction monitoring aligned with international standards." },
    { t: "Audit logs", b: "Immutable audit trail for every operational and account event." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <div>
          <span className="text-xs uppercase tracking-[0.22em] text-gold">Security</span>
          <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Guardrails you can verify.</h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            We protect client capital and data with layered security controls, third-party audits and a zero-trust
            operating posture.
          </p>
          <Button asChild variant="outline" className="mt-6 border-white/15">
            <Link to="/legal">Legal & compliance</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((it) => (
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

function PortalPreview() {
  const rows = [
    { icon: Wallet, t: "Portfolio overview", b: "Balance, allocation and P&L in one glance." },
    { icon: TrendingUp, t: "Live performance", b: "Interactive charts with daily and cumulative returns." },
    { icon: FileText, t: "Statements & reports", b: "Monthly, annual and on-demand PDF reports." },
    { icon: Headphones, t: "Secure messaging", b: "Direct line to your account manager." },
  ];
  return (
    <section className="border-y border-white/5 bg-white/[0.02] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.22em] text-gold">Client Portal</span>
            <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Your portfolio, transparent.</h2>
          </div>
          <Button asChild variant="outline" className="border-white/15">
            <Link to="/auth">Access your dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {rows.map((r) => (
            <div key={r.t} className="glass rounded-2xl p-6">
              <r.icon className="h-5 w-5 text-gold" />
              <h3 className="mt-3 font-display text-lg font-semibold">{r.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{r.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <span className="text-xs uppercase tracking-[0.22em] text-gold">Get started</span>
      <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
        Put your capital in <span className="text-gradient">experienced hands</span>.
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
        Open an investment account online in minutes, or speak with a senior advisor about a strategy tailored to your
        objectives.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" className="bg-[var(--gradient-gold)] font-semibold text-background hover:opacity-95">
          <Link to="/auth">Open Investment Account</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="border-white/15">
          <Link to="/contact">Talk to an Advisor</Link>
        </Button>
      </div>
    </section>
  );
}