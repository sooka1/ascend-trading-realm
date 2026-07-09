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
  Award,
  Quote,
  Star,
  ScrollText,
  Download,
  ExternalLink,
  CalendarCheck,
  Trophy,
  Medal,
  Crown,
  Gem,
  Sparkle,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { MarketTicker } from "@/components/market-ticker";
import { AnimatedCounter } from "@/components/animated-counter";
import { Button } from "@/components/ui/button";
import { AnimatedChart } from "@/components/animated-chart";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
      <Testimonials />
      <Credentials />
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
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-gold backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            {c.hero.badge}
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            {c.hero.titleA} <span className="italic text-gold">{c.hero.titleB}</span> {c.hero.titleC}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">{c.hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-sm bg-gold font-semibold text-background shadow-[0_0_28px_rgba(201,168,76,0.22)] transition hover:bg-[oklch(0.88_0.11_90)] active:scale-[0.98]">
              <Link to="/auth">{c.hero.ctaOpen} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-sm border-white/10 transition hover:border-gold/60 hover:text-foreground">
              <Link to="/contact">{c.hero.ctaAdvisor}</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to="/solutions">{c.hero.ctaLearn}</Link>
            </Button>
          </div>
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/5 pt-8 text-sm">
            {[
              { k: c.hero.statAum, v: "$1.2B+", d: "+12.4%", tone: "up" },
              { k: c.hero.statClients, v: "18,400+", d: "OPTIMIZED", tone: "muted" },
              { k: c.hero.statCountries, v: "62", d: "GLOBAL", tone: "muted" },
            ].map((s) => (
              <div key={s.k} className="space-y-1">
                <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-gold/80">{s.k}</dt>
                <dd className="font-mono text-2xl font-medium text-foreground tabular-nums">{s.v}</dd>
                <p className={`font-mono text-[10px] tracking-wide ${s.tone === "up" ? "text-emerald-400" : "text-muted-foreground"}`}>
                  {s.tone === "up" ? "↑ " : ""}{s.d}
                </p>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          {/* Ambient gold glow behind card */}
          <div className="pointer-events-none absolute -inset-1 -z-10 rounded-2xl bg-[radial-gradient(ellipse_at_top_left,rgba(201,168,76,0.22),transparent_60%)] blur-2xl" aria-hidden />

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 shadow-elegant backdrop-blur-2xl">
            {/* Frosted saturation layer */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent_40%)]" aria-hidden />

            {/* Terminal header */}
            <div className="relative flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-5 py-3 backdrop-blur-xl">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="font-mono text-[11px] tracking-wider text-foreground/80">HK / MODEL PORTFOLIO</span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Live Terminal Data</span>
            </div>

            {/* Headline stat */}
            <div className="relative px-6 pt-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gold/80">{c.hero.cardTitle}</p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-mono text-4xl font-medium tracking-tight text-foreground tabular-nums">+18.4%</span>
                <span className="font-mono text-sm text-emerald-400">+2.45%</span>
                <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{c.hero.ytd}</span>
              </div>
            </div>

            {/* Chart */}
            <div className="relative px-4 pb-2 pt-2">
              <AnimatedChart />
            </div>

            {/* Timeframe rail */}
            <div className="relative grid grid-cols-3 border-t border-white/[0.06] bg-white/[0.015]">
              {[
                { k: "1M", v: "+2.1%" },
                { k: "6M", v: "+9.7%" },
                { k: "1Y", v: "+22.3%" },
              ].map((r, i) => (
                <div
                  key={r.k}
                  className={`px-4 py-3 ${i > 0 ? "border-l border-white/[0.06]" : ""}`}
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{r.k}</p>
                  <p className="mt-1 font-mono text-sm text-foreground tabular-nums">{r.v}</p>
                </div>
              ))}
            </div>

            {/* Bid / Ask footer */}
            <div className="relative grid grid-cols-2 border-t border-white/[0.06] bg-background/40 backdrop-blur-xl">
              <div className="border-l border-white/[0.06] px-5 py-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Bid</p>
                <p className="mt-0.5 font-mono text-sm text-foreground tabular-nums">1,284.10</p>
              </div>
              <div className="px-5 py-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Ask</p>
                <p className="mt-0.5 font-mono text-sm text-foreground tabular-nums">1,284.50</p>
              </div>
            </div>

            {/* Hairline gold accent */}
            <div className="h-px w-full bg-gradient-to-l from-transparent via-gold/40 to-transparent" aria-hidden />
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
            <div key={f.t} className="group relative overflow-hidden rounded-xl border border-white/10 bg-card/50 p-6 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-gold/40">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md border border-gold/20 bg-gold/[0.06]">
                <Icon className="h-5 w-5 text-gold" />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-1 font-display text-lg font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.b}</p>
              <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 transition group-hover:opacity-100" aria-hidden />
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
            <div
              key={p.name}
              className={`group relative overflow-hidden rounded-2xl border bg-card/60 p-8 backdrop-blur-xl transition hover:-translate-y-0.5 ${
                i === 1 ? "border-gold/40 shadow-[0_0_40px_-12px_rgba(201,168,76,0.35)]" : "border-white/10"
              }`}
            >
              {i === 1 && (
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  {c.solutions.popular}
                </span>
              )}
              <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gold/80">{c.solutions.target}</p>
              <p className="mt-1 font-mono text-4xl font-medium tracking-tight text-foreground tabular-nums">{targets[i]}</p>
              <dl className="mt-6 space-y-3 text-sm">
                <Row k={c.solutions.risk} v={p.risk} />
                <Row k={c.solutions.min} v={mins[i]} />
                <Row k={c.solutions.allocation} v={p.allocation} />
              </dl>
              <Button asChild className="mt-6 w-full rounded-sm bg-gold font-semibold text-background transition hover:bg-[oklch(0.88_0.11_90)]">
                <Link to="/auth">{c.solutions.open}</Link>
              </Button>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" aria-hidden />
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
          <div key={s.k} className="border-l border-white/5 pl-6 first:border-l-0 first:pl-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold/80">{s.k}</p>
            <p className="mt-2 font-mono text-4xl font-medium tracking-tight text-foreground tabular-nums">
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

type TL = {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: { name: string; role: string; quote: string; rating: number; seed: string }[];
};

const TESTIMONIALS: Record<string, TL> = {
  ar: {
    eyebrow: "آراء العملاء",
    title: "تجارب حقيقية من عملائنا",
    subtitle: "شهادات من مستثمرين وثقوا بإدارتنا لمحافظهم.",
    items: [
      { seed: "khaled-m", name: "خالد المنصوري", role: "رجل أعمال — دبي", rating: 5, quote: "إدارة احترافية وشفافية كاملة في التقارير الشهرية. عوائد مستقرة ومخاطر مدروسة." },
      { seed: "sara-a", name: "سارة العتيبي", role: "طبيبة استشارية — الرياض", rating: 5, quote: "بوابة العميل ممتازة وفريق الدعم سريع الاستجابة. أنصح بها لكل من يبحث عن استثمار طويل الأجل." },
      { seed: "ahmed-f", name: "أحمد الفهد", role: "مستثمر خاص — الكويت", rating: 4.5, quote: "التزام صارم بإدارة المخاطر، وأداء يفوق التوقعات على مدى سنتين متتاليتين." },
      { seed: "layla-q", name: "ليلى القحطاني", role: "مديرة مالية — جدة", rating: 5, quote: "خطة الاستثمار وُضعت وفق أهدافي بدقة، والتواصل مع المستشار احترافي جدًا." },
      { seed: "yousef-b", name: "يوسف البلوشي", role: "مهندس أول — مسقط", rating: 4.5, quote: "التقارير الشهرية واضحة والأداء ثابت. تجربة مطمئنة على المدى الطويل." },
    ],
  },
  en: {
    eyebrow: "Client Voices",
    title: "Real experiences from real investors",
    subtitle: "Verified reviews from clients who trusted us with their portfolios.",
    items: [
      { seed: "james-w", name: "James Whitfield", role: "Business Owner — London", rating: 5, quote: "Professional management with full transparency in monthly reporting. Steady returns and disciplined risk." },
      { seed: "sofia-l", name: "Sofia Lindqvist", role: "Private Investor — Stockholm", rating: 5, quote: "Excellent client portal and a responsive advisory team. Highly recommended for long-term investors." },
      { seed: "michael-c", name: "Michael Chen", role: "Executive — Singapore", rating: 4.5, quote: "Strict risk framework and consistent performance across two consecutive years." },
      { seed: "amelia-r", name: "Amelia Rossi", role: "CFO — Milan", rating: 5, quote: "The plan matched my objectives precisely and communication with the advisor is top-notch." },
      { seed: "daniel-o", name: "Daniel Okafor", role: "Senior Engineer — Dubai", rating: 4.5, quote: "Clear monthly reports and steady performance. A reassuring long-term experience." },
    ],
  },
  fr: {
    eyebrow: "Avis clients",
    title: "Des expériences réelles d'investisseurs",
    subtitle: "Témoignages de clients qui nous ont confié leurs portefeuilles.",
    items: [
      { seed: "julien-m", name: "Julien Moreau", role: "Chef d'entreprise — Paris", rating: 5, quote: "Gestion professionnelle et transparence totale des rapports mensuels." },
      { seed: "camille-r", name: "Camille Roux", role: "Investisseuse privée — Lyon", rating: 5, quote: "Portail client excellent et équipe très réactive." },
      { seed: "antoine-g", name: "Antoine Girard", role: "Cadre dirigeant — Genève", rating: 4.5, quote: "Cadre de risque rigoureux et performance constante." },
      { seed: "elodie-b", name: "Élodie Bernard", role: "Directrice financière — Bruxelles", rating: 5, quote: "Un plan taillé à mes objectifs, un conseiller très à l'écoute." },
      { seed: "hugo-l", name: "Hugo Lefevre", role: "Ingénieur — Montréal", rating: 4.5, quote: "Rapports mensuels clairs et performance régulière." },
    ],
  },
  es: {
    eyebrow: "Opiniones de clientes",
    title: "Experiencias reales de inversores",
    subtitle: "Testimonios de clientes que confiaron en nosotros.",
    items: [
      { seed: "carlos-h", name: "Carlos Herrera", role: "Empresario — Madrid", rating: 5, quote: "Gestión profesional y total transparencia en los informes mensuales." },
      { seed: "lucia-f", name: "Lucía Fernández", role: "Inversora privada — Barcelona", rating: 5, quote: "Portal excelente y equipo muy atento." },
      { seed: "diego-r", name: "Diego Ramírez", role: "Directivo — Ciudad de México", rating: 4.5, quote: "Marco de riesgo estricto y rendimiento consistente." },
      { seed: "valeria-s", name: "Valeria Sánchez", role: "Directora financiera — Bogotá", rating: 5, quote: "Plan adaptado a mis objetivos y asesor muy atento." },
      { seed: "mateo-g", name: "Mateo García", role: "Ingeniero — Buenos Aires", rating: 4.5, quote: "Informes claros y desempeño constante." },
    ],
  },
  tr: {
    eyebrow: "Müşteri Görüşleri",
    title: "Yatırımcılardan gerçek deneyimler",
    subtitle: "Portföylerini bize emanet eden müşterilerimizin görüşleri.",
    items: [
      { seed: "emre-y", name: "Emre Yılmaz", role: "İş İnsanı — İstanbul", rating: 5, quote: "Profesyonel yönetim ve tam şeffaf raporlama." },
      { seed: "aylin-d", name: "Aylin Demir", role: "Özel Yatırımcı — Ankara", rating: 5, quote: "Mükemmel müşteri portalı ve hızlı destek ekibi." },
      { seed: "kaan-a", name: "Kaan Aksoy", role: "Yönetici — İzmir", rating: 4.5, quote: "Sıkı risk yönetimi ve istikrarlı performans." },
      { seed: "zeynep-c", name: "Zeynep Çelik", role: "Finans Direktörü — Bursa", rating: 5, quote: "Hedeflerime uygun bir plan ve son derece ilgili bir danışman." },
      { seed: "burak-o", name: "Burak Öztürk", role: "Kıdemli Mühendis — Antalya", rating: 4.5, quote: "Net aylık raporlar ve istikrarlı performans." },
    ],
  },
};

type CL = {
  eyebrow: string;
  title: string;
  subtitle: string;
  certs: { key: CertKey; name: string; body: string }[];
  awards: { key: AwardKey; name: string; body: string }[];
  awardsTitle: string;
  certsTitle: string;
  disclaimer: string;
  labels: {
    updated: string;
    view: string;
    download: string;
    verify: string;
    verifyStatement: string;
    close: string;
    details: string;
  };
};

type CertKey = "iso27001" | "soc2" | "gdpr" | "aml";

type AwardKey =
  | "bestWealthManager"
  | "topPerformance"
  | "riskExcellence"
  | "fintechInnovation"
  | "clientTrust";

const AWARD_META: Record<
  AwardKey,
  {
    year: string;
    issuer: string;
    verifyUrl: string;
    icon: typeof Trophy;
    accent: string;
  }
> = {
  bestWealthManager: {
    year: "2025",
    issuer: "Global Finance Awards",
    verifyUrl: "https://www.gfmag.com/awards-rankings/",
    icon: Trophy,
    accent: "from-gold/25 to-gold/5",
  },
  topPerformance: {
    year: "2024",
    issuer: "International Investor Magazine",
    verifyUrl: "https://www.internationalinvestor.com/",
    icon: Medal,
    accent: "from-amber-400/25 to-amber-400/5",
  },
  riskExcellence: {
    year: "2024",
    issuer: "MENA Investment Summit",
    verifyUrl: "https://www.menafn.com/",
    icon: Crown,
    accent: "from-emerald-400/20 to-emerald-400/5",
  },
  fintechInnovation: {
    year: "2025",
    issuer: "World Finance Awards",
    verifyUrl: "https://www.worldfinance.com/awards",
    icon: Gem,
    accent: "from-cyan-400/20 to-cyan-400/5",
  },
  clientTrust: {
    year: "2025",
    issuer: "Euromoney Private Banking",
    verifyUrl: "https://www.euromoney.com/research-and-awards",
    icon: Sparkle,
    accent: "from-fuchsia-400/20 to-fuchsia-400/5",
  },
};

const CERT_META: Record<
  CertKey,
  { updated: string; verifyUrl: string; verifyId: string }
> = {
  iso27001: {
    updated: "2025-08-14",
    verifyUrl: "https://www.iso.org/standard/27001",
    verifyId: "HK-ISO27001-2025-0814",
  },
  soc2: {
    updated: "2025-06-30",
    verifyUrl: "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2",
    verifyId: "HK-SOC2-TYPEII-2025-Q2",
  },
  gdpr: {
    updated: "2025-09-01",
    verifyUrl: "https://gdpr.eu/",
    verifyId: "HK-GDPR-DPA-2025-09",
  },
  aml: {
    updated: "2025-10-05",
    verifyUrl: "https://www.fatf-gafi.org/",
    verifyId: "HK-AML-KYC-2025-10",
  },
};

const CREDENTIALS: Record<string, CL> = {
  ar: {
    eyebrow: "اعتمادات وجوائز",
    title: "شركة معتمدة دولياً وحاصلة على جوائز عالمية",
    subtitle: "نلتزم بأعلى المعايير التنظيمية والمهنية، ونفتخر بتقدير المؤسسات الدولية لجودة خدماتنا.",
    certsTitle: "الاعتمادات والشهادات القانونية",
    awardsTitle: "الجوائز والتقديرات العالمية",
    certs: [
      { key: "iso27001", name: "ISO/IEC 27001", body: "شهادة معتمدة في أمن المعلومات لحماية بيانات العملاء." },
      { key: "soc2", name: "SOC 2 Type II", body: "تقرير مستقل يوثّق ضوابط الأمان والخصوصية والتوافر." },
      { key: "gdpr", name: "GDPR Compliance", body: "التزام كامل بلائحة حماية البيانات الأوروبية." },
      { key: "aml", name: "AML / KYC", body: "سياسات صارمة لمكافحة غسل الأموال ومعرفة العميل." },
    ],
    awards: [
      { key: "bestWealthManager", name: "Best Wealth Manager 2025", body: "جائزة أفضل شركة إدارة ثروات — Global Finance Awards." },
      { key: "topPerformance", name: "Top Performance Award", body: "التميّز في الأداء الاستثماري — International Investor Magazine." },
      { key: "riskExcellence", name: "Excellence in Risk Management", body: "التميّز في إدارة المخاطر — MENA Investment Summit." },
      { key: "fintechInnovation", name: "FinTech Innovation Award", body: "الابتكار في التكنولوجيا المالية — World Finance Awards." },
      { key: "clientTrust", name: "Client Trust Award", body: "ثقة العملاء في الخدمات المصرفية الخاصة — Euromoney." },
    ],
    disclaimer: "الاعتمادات والجوائز عرض تمثيلي لأغراض التصميم؛ يتم تحديثها فور استلام الشهادات الرسمية الموثّقة.",
    labels: { updated: "آخر تحديث", view: "عرض الشهادة", download: "تحميل PDF", verify: "تحقق عبر الجهة المُصدِرة", verifyStatement: "يمكن التحقق من صحة هذه الوثيقة عبر معرّف الشهادة أدناه لدى الجهة المُصدِرة الرسمية.", close: "إغلاق", details: "عرض التفاصيل" },
  },
  en: {
    eyebrow: "Certifications & Awards",
    title: "Internationally accredited and globally recognized",
    subtitle: "We adhere to the highest regulatory and professional standards, recognized by leading international institutions.",
    certsTitle: "Legal Certifications",
    awardsTitle: "Global Awards & Recognition",
    certs: [
      { key: "iso27001", name: "ISO/IEC 27001", body: "Certified information-security management for client data protection." },
      { key: "soc2", name: "SOC 2 Type II", body: "Independent report on security, privacy and availability controls." },
      { key: "gdpr", name: "GDPR Compliance", body: "Full alignment with the EU General Data Protection Regulation." },
      { key: "aml", name: "AML / KYC", body: "Rigorous anti–money laundering and know-your-customer policies." },
    ],
    awards: [
      { key: "bestWealthManager", name: "Best Wealth Manager 2025", body: "Global Finance Awards — top wealth-management firm." },
      { key: "topPerformance", name: "Top Performance Award", body: "International Investor Magazine — investment performance." },
      { key: "riskExcellence", name: "Excellence in Risk Management", body: "MENA Investment Summit — risk discipline." },
      { key: "fintechInnovation", name: "FinTech Innovation Award", body: "World Finance Awards — financial-technology innovation." },
      { key: "clientTrust", name: "Client Trust Award", body: "Euromoney — private-banking client trust." },
    ],
    disclaimer: "Certifications and awards shown are illustrative and will be updated with verified documentation.",
    labels: { updated: "Last updated", view: "View certificate", download: "Download PDF", verify: "Verify with issuing body", verifyStatement: "Authenticity can be verified via the certificate ID below with the official issuing authority.", close: "Close", details: "View details" },
  },
  fr: {
    eyebrow: "Certifications & Prix",
    title: "Une société accréditée et primée à l'international",
    subtitle: "Nous respectons les normes réglementaires et professionnelles les plus élevées.",
    certsTitle: "Certifications légales",
    awardsTitle: "Récompenses mondiales",
    certs: [
      { key: "iso27001", name: "ISO/IEC 27001", body: "Gestion certifiée de la sécurité de l'information." },
      { key: "soc2", name: "SOC 2 Type II", body: "Contrôles indépendants de sécurité et de confidentialité." },
      { key: "gdpr", name: "GDPR", body: "Conformité totale au règlement européen." },
      { key: "aml", name: "AML / KYC", body: "Politiques strictes de lutte contre le blanchiment." },
    ],
    awards: [
      { key: "bestWealthManager", name: "Best Wealth Manager 2025", body: "Global Finance Awards." },
      { key: "topPerformance", name: "Top Performance Award", body: "International Investor Magazine." },
      { key: "riskExcellence", name: "Excellence in Risk Management", body: "MENA Investment Summit." },
      { key: "fintechInnovation", name: "FinTech Innovation Award", body: "World Finance Awards — innovation fintech." },
      { key: "clientTrust", name: "Client Trust Award", body: "Euromoney — confiance client." },
    ],
    disclaimer: "Certifications et prix présentés à titre indicatif.",
    labels: { updated: "Dernière mise à jour", view: "Voir le certificat", download: "Télécharger le PDF", verify: "Vérifier auprès de l'organisme", verifyStatement: "L'authenticité peut être vérifiée via l'identifiant ci-dessous auprès de l'organisme émetteur.", close: "Fermer", details: "Voir les détails" },
  },
  es: {
    eyebrow: "Certificaciones y Premios",
    title: "Empresa acreditada internacionalmente y galardonada",
    subtitle: "Cumplimos con los estándares regulatorios y profesionales más exigentes.",
    certsTitle: "Certificaciones legales",
    awardsTitle: "Premios internacionales",
    certs: [
      { key: "iso27001", name: "ISO/IEC 27001", body: "Gestión certificada de seguridad de la información." },
      { key: "soc2", name: "SOC 2 Type II", body: "Controles independientes de seguridad y privacidad." },
      { key: "gdpr", name: "GDPR", body: "Cumplimiento pleno del reglamento europeo." },
      { key: "aml", name: "AML / KYC", body: "Políticas estrictas contra el blanqueo de capitales." },
    ],
    awards: [
      { key: "bestWealthManager", name: "Best Wealth Manager 2025", body: "Global Finance Awards." },
      { key: "topPerformance", name: "Top Performance Award", body: "International Investor Magazine." },
      { key: "riskExcellence", name: "Excellence in Risk Management", body: "MENA Investment Summit." },
      { key: "fintechInnovation", name: "FinTech Innovation Award", body: "World Finance Awards — innovación fintech." },
      { key: "clientTrust", name: "Client Trust Award", body: "Euromoney — confianza del cliente." },
    ],
    disclaimer: "Certificaciones y premios mostrados con fines ilustrativos.",
    labels: { updated: "Última actualización", view: "Ver certificado", download: "Descargar PDF", verify: "Verificar con el emisor", verifyStatement: "La autenticidad puede verificarse mediante el identificador a continuación con la entidad emisora.", close: "Cerrar", details: "Ver detalles" },
  },
  tr: {
    eyebrow: "Sertifikalar ve Ödüller",
    title: "Uluslararası akredite ve ödüllü şirket",
    subtitle: "En yüksek düzenleyici ve mesleki standartlara bağlıyız.",
    certsTitle: "Yasal Sertifikalar",
    awardsTitle: "Uluslararası Ödüller",
    certs: [
      { key: "iso27001", name: "ISO/IEC 27001", body: "Sertifikalı bilgi güvenliği yönetimi." },
      { key: "soc2", name: "SOC 2 Type II", body: "Bağımsız güvenlik ve gizlilik kontrolleri." },
      { key: "gdpr", name: "GDPR", body: "AB veri koruma yönetmeliğine tam uyum." },
      { key: "aml", name: "AML / KYC", body: "Sıkı kara para aklamayı önleme politikaları." },
    ],
    awards: [
      { key: "bestWealthManager", name: "Best Wealth Manager 2025", body: "Global Finance Awards." },
      { key: "topPerformance", name: "Top Performance Award", body: "International Investor Magazine." },
      { key: "riskExcellence", name: "Excellence in Risk Management", body: "MENA Investment Summit." },
      { key: "fintechInnovation", name: "FinTech Innovation Award", body: "World Finance Awards — fintech inovasyonu." },
      { key: "clientTrust", name: "Client Trust Award", body: "Euromoney — müşteri güveni." },
    ],
    disclaimer: "Sertifika ve ödüller örnek amaçlıdır.",
    labels: { updated: "Son güncelleme", view: "Sertifikayı görüntüle", download: "PDF indir", verify: "Veren kurum ile doğrula", verifyStatement: "Belgenin gerçekliği aşağıdaki sertifika kimliği ile veren kuruluş üzerinden doğrulanabilir.", close: "Kapat", details: "Detayları gör" },
  },
};

function StarRating({ value }: { value: number }) {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;
  return (
    <div className="flex items-center gap-1" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <Star key={i} className="h-4 w-4 fill-gold text-gold" />;
        if (i === full && hasHalf)
          return (
            <div key={i} className="relative h-4 w-4">
              <Star className="absolute inset-0 h-4 w-4 text-gold/40" />
              <div className="absolute inset-0 w-1/2 overflow-hidden">
                <Star className="h-4 w-4 fill-gold text-gold" />
              </div>
            </div>
          );
        return <Star key={i} className="h-4 w-4 text-gold/30" />;
      })}
      <span className="ms-1 text-xs text-muted-foreground">{value.toFixed(1)}</span>
    </div>
  );
}

function Testimonials() {
  const { lang, dir } = useI18n();
  const t = TESTIMONIALS[lang] ?? TESTIMONIALS.en;
  return (
    <section className="border-y border-white/5 bg-white/[0.02] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.22em] text-gold">{t.eyebrow}</span>
          <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">{t.title}</h2>
          <p className="mt-4 text-muted-foreground">{t.subtitle}</p>
        </div>

        <Carousel
          opts={{ align: "start", loop: true, direction: dir === "rtl" ? "rtl" : "ltr" }}
          className="mt-12"
        >
          <CarouselContent className="-ml-4">
            {t.items.map((it) => (
              <CarouselItem
                key={it.seed}
                className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <figure className="glass-strong flex h-full flex-col rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                        it.name,
                      )}&backgroundType=gradientLinear&fontFamily=Georgia`}
                      alt=""
                      loading="lazy"
                      className="h-12 w-12 shrink-0 rounded-full border border-gold/30 bg-white/5 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-semibold text-foreground">
                        {it.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{it.role}</p>
                    </div>
                    <Quote className="ms-auto h-5 w-5 shrink-0 text-gold/60" />
                  </div>
                  <div className="mt-4">
                    <StarRating value={it.rating} />
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    "{it.quote}"
                  </blockquote>
                </figure>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-6 flex items-center justify-end gap-2">
            <CarouselPrevious className="static translate-y-0 border-white/15" />
            <CarouselNext className="static translate-y-0 border-white/15" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}

function downloadCertStub(cert: { name: string; body: string; id: string; updated: string }) {
  const text = `HK Investment Management\n\nCertificate: ${cert.name}\nCertificate ID: ${cert.id}\nLast updated: ${cert.updated}\n\n${cert.body}\n\nThis document is a placeholder pending upload of the official signed certificate.\n`;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cert.id}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function CertCard({
  cert,
  labels,
}: {
  cert: { key: CertKey; name: string; body: string };
  labels: CL["labels"];
}) {
  const meta = CERT_META[cert.key];
  return (
    <Dialog>
      <div className="glass flex h-full flex-col rounded-2xl p-5">
        <BadgeCheck className="h-5 w-5 text-gold" />
        <h4 className="mt-3 font-display text-base font-semibold">{cert.name}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{cert.body}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarCheck className="h-3.5 w-3.5 text-gold" />
          <span>
            {labels.updated}: {meta.updated}
          </span>
        </div>
        <DialogTrigger asChild>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-1 self-start text-xs font-semibold text-gold hover:underline"
          >
            {labels.details} <ExternalLink className="h-3 w-3" />
          </button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <BadgeCheck className="h-5 w-5 text-gold" /> {cert.name}
          </DialogTitle>
          <DialogDescription>{cert.body}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
            <span className="text-muted-foreground">{labels.updated}</span>
            <span className="font-medium">{meta.updated}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
            <span className="text-muted-foreground">ID</span>
            <span className="font-mono text-xs">{meta.verifyId}</span>
          </div>
          <p className="rounded-lg border border-gold/20 bg-gold/5 p-3 text-xs text-muted-foreground">
            {labels.verifyStatement}
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            className="border-white/15"
            onClick={() =>
              downloadCertStub({
                name: cert.name,
                body: cert.body,
                id: meta.verifyId,
                updated: meta.updated,
              })
            }
          >
            <Download className="me-2 h-4 w-4" /> {labels.download}
          </Button>
          <Button
            asChild
            className="bg-[var(--gradient-gold)] font-semibold text-background hover:opacity-95"
          >
            <a href={meta.verifyUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="me-2 h-4 w-4" /> {labels.verify}
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Credentials() {
  const { lang } = useI18n();
  const c = CREDENTIALS[lang] ?? CREDENTIALS.en;
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <span className="text-xs uppercase tracking-[0.22em] text-gold">{c.eyebrow}</span>
        <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">{c.title}</h2>
        <p className="mt-4 text-muted-foreground">{c.subtitle}</p>
      </div>

      <div className="mt-12">
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-gold" />
          <h3 className="font-display text-xl font-semibold">{c.certsTitle}</h3>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.certs.map((it) => (
            <CertCard key={it.key} cert={it} labels={c.labels} />
          ))}
        </div>
      </div>

      <div className="mt-16">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-gold" />
          <h3 className="font-display text-xl font-semibold">{c.awardsTitle}</h3>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {c.awards.map((it) => (
            <AwardCard key={it.key} award={it} labels={c.labels} />
          ))}
        </div>
      </div>

      <p className="mt-10 max-w-3xl text-xs text-muted-foreground">{c.disclaimer}</p>
    </section>
  );
}

function AwardCard({
  award,
  labels,
}: {
  award: { key: AwardKey; name: string; body: string };
  labels: CL["labels"];
}) {
  const meta = AWARD_META[award.key];
  const Icon = meta.icon;
  return (
    <a
      href={meta.verifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-[var(--shadow-glow)]"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${meta.accent} opacity-60`}
        aria-hidden
      />
      <div className="relative flex items-center justify-between">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-gold/30 bg-background/60 shadow-[var(--shadow-gold)]">
          <Icon className="h-7 w-7 text-gold" />
        </div>
        <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 font-mono text-[11px] text-gold">
          {meta.year}
        </span>
      </div>
      <h4 className="relative mt-4 font-display text-base font-semibold leading-tight">
        {award.name}
      </h4>
      <p className="relative mt-1 text-xs uppercase tracking-[0.18em] text-gold/80">
        {meta.issuer}
      </p>
      <p className="relative mt-3 flex-1 text-sm text-muted-foreground">{award.body}</p>
      <span className="relative mt-4 inline-flex items-center gap-1 text-xs font-semibold text-gold opacity-80 transition group-hover:opacity-100">
        {labels.verify} <ExternalLink className="h-3 w-3" />
      </span>
    </a>
  );
}
