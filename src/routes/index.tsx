import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Briefcase,
  ChartLine,
  CheckCircle2,
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
import Autoplay from "embla-carousel-autoplay";
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
import { landingContent, type LandingContent } from "@/lib/landing-t";
import { portfoliosContent } from "@/lib/portfolios-t";
import heroVideo from "@/assets/hero-bg.mp4.asset.json";
import heroPoster from "@/assets/hero-bg.jpg";
import candlesVideo from "@/assets/hk-candles-intro.mp4.asset.json";
import custodyBanksImg from "@/assets/custody-banks.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HKEX Invest — Professional Portfolio Management" },
      {
        name: "description",
        content:
          "Professionally managed investment portfolios across Forex, Gold, Commodities, Indices and Stocks. Disciplined risk management, transparent reporting, secure client portal.",
      },
      { property: "og:title", content: "HKEX Invest — Professional Portfolio Management" },
      {
        property: "og:description",
        content: "Professionally managed investment portfolios across Forex, Gold, Commodities, Indices and Stocks. Disciplined risk management, transparent reporting, secure client portal.",
      },
    ],
  }),
  component: Home,
});

function useContent(): LandingContent {
  const { lang } = useI18n();
  return landingContent(lang);
}

function Home() {
  const c = useContent();
  return (
    <PageShell>
        <Hero c={c} />
        <MarketTicker />
        <TrustStrip c={c} />
        <CustodyBanks />
        <Features c={c} />
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
  const videoRef = React.useRef<HTMLDivElement | null>(null);
  const videoElRef = React.useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = React.useState(false);
  const [inView, setInView] = React.useState(true);

  // Lazy-load video: only mount <source> when hero is near viewport, and
  // respect prefers-reduced-motion + Save-Data.
  React.useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as any).connection?.saveData;
    if (reduce || saveData) {
      setVideoReady(false);
      return;
    }
    const el = videoRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      setVideoReady(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? false;
        setInView(visible);
        if (visible) setVideoReady(true);
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Pause when off-screen to save CPU/battery during scroll.
  React.useEffect(() => {
    const v = videoElRef.current;
    if (!v) return;
    if (inView) v.play().catch(() => {});
    else v.pause();
  }, [inView, videoReady]);

  React.useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = videoRef.current;
        if (!el) return;
        const y = Math.min(window.scrollY, 800);
        el.style.transform = `translate3d(0, ${y * 0.35}px, 0) scale(1.08)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <section className="relative isolate overflow-hidden border-b border-white/5">
      {/* Cinematic brand video */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div
          ref={videoRef}
          className="absolute inset-0 will-change-transform"
        >
          {videoReady && (
            <video
              ref={videoElRef}
              className="h-full w-full object-contain object-center opacity-40 blur-md sm:object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={heroPoster}
            >
              <source src={candlesVideo.url} type="video/mp4" />
            </video>
          )}
          {!videoReady && (
            <img
              src={heroPoster}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain object-center opacity-40 blur-md sm:object-cover"
            />
          )}
        </div>
        {/* Bottom fade only, to blend into the page — video stays fully clear */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>
      <div className="relative mx-auto flex max-w-4xl flex-col items-center justify-start px-4 pt-2 pb-10 text-center sm:px-6 sm:pt-3 sm:pb-14 lg:min-h-[70vh] lg:justify-center lg:px-8 lg:pt-4 lg:pb-20">
        <img
          src="/branding/hkex-logo-platform.png"
          alt="HKEX — 交易・投資・成長"
          width={300}
          height={150}
          className="mb-2 block h-[90px] w-[180px] object-contain select-none sm:mb-3 sm:h-[110px] sm:w-[220px] md:h-[130px] md:w-[260px]"
          draggable={false}
        />
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="h-px w-6 bg-gold/60 sm:w-10" aria-hidden />
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold/90 sm:text-[10px] sm:tracking-[0.32em]">
            {c.hero.badge}
          </span>
          <span className="h-px w-6 bg-gold/60 sm:w-10" aria-hidden />
        </div>
        <h1 className="mt-5 font-display text-[1.75rem] font-semibold leading-[1.25] tracking-tight text-balance sm:mt-6 sm:text-[2.25rem] sm:font-bold sm:leading-[1.2] md:text-[3rem] md:leading-[1.15] lg:text-[4.25rem] lg:leading-[1.08] xl:text-[4.75rem]">
          <span>{c.hero.titleA} </span>
          <span className="text-gold">{c.hero.titleB} </span>
          <span>{c.hero.titleC}</span>
        </h1>
        <div className="mt-6 h-px w-20 bg-gradient-to-r from-transparent via-gold/70 to-transparent sm:mt-8 sm:w-24" aria-hidden />
        <p className="mt-5 max-w-2xl whitespace-pre-line text-base leading-relaxed text-white dark:text-white sm:mt-6 sm:text-lg" style={{ color: "#ffffff" }}>
          {c.hero.subtitle}
        </p>
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
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-6 text-sm text-muted-foreground sm:px-6 md:grid-cols-4 lg:px-8">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex items-center gap-2.5 rounded-lg border border-gold/25 bg-white/[0.03] px-4 py-3 backdrop-blur-sm transition hover:border-gold/50 hover:bg-white/[0.05]"
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gold/30 bg-gold/[0.08]">
              <it.icon className="h-4 w-4 text-gold" />
            </span>
            <span className="text-foreground/90">{it.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CustodyBanks() {
  return (
    <section className="border-b border-white/5 bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <img
          src={custodyBanksImg.url}
          alt="أموالك محفوظة لدى مؤسسات من الدرجة الأولى — J.P. Morgan, UBS, Citi, J. Safra Sarasin, Deutsche Bank, Coutts, Pictet"
          className="mx-auto h-auto w-full max-w-4xl [filter:invert(1)_hue-rotate(180deg)_brightness(1.05)]"
          loading="lazy"
        />
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
  const { lang } = useI18n();
  const p = portfoliosContent(lang);
  const targets = ["6 – 10%", "10 – 16%", "16 – 24%"];
  const mins = ["$100", "$500", "$1,000"];
  const HIGHLIGHT = [false, true, false];
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
          {p.tiers.map((tier, i) => (
            <div
              key={tier.name}
              className={`glass-strong rounded-3xl p-8 ${HIGHLIGHT[i] ? "ring-1 ring-gold/40" : ""}`}
            >
              {HIGHLIGHT[i] && (
                <span className="mb-3 inline-block rounded-full bg-gold/15 px-3 py-1 text-xs text-gold">
                  {p.popular}
                </span>
              )}
              <h3 className="font-display text-2xl font-semibold">{tier.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.target}</p>
              <p className="font-display text-5xl font-semibold text-gradient">{targets[i]}</p>
              <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{p.minimum}</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">{mins[i]}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{p.risk}</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold text-foreground">{tier.risk}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{p.withdraw}</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">$10</dd>
                </div>
              </dl>
              <ul className="mt-6 space-y-2 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full rounded-sm border border-[#a0430a] bg-[#c2410c] font-semibold text-white shadow-[0_4px_14px_rgba(194,65,12,0.35)] transition-all duration-200 hover:border-[#ea580c] hover:bg-[#ea580c] hover:shadow-[0_6px_20px_rgba(234,88,12,0.5)] active:border-[#7c2d0a] active:bg-[#9a3412] active:scale-[0.98]">
                <Link to="/auth">{p.cta}</Link>
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
        <Button asChild size="lg" className="border border-[#a0430a] bg-gradient-to-br from-[#ea580c] to-[#9a3412] font-semibold text-white shadow-[0_4px_14px_rgba(194,65,12,0.35)] transition-all duration-200 hover:from-[#f97316] hover:to-[#c2410c] hover:shadow-[0_6px_20px_rgba(234,88,12,0.5)] active:from-[#9a3412] active:to-[#7c2d0a] active:scale-[0.98]">
          <Link to="/auth">{c.final.cta}</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="border-white/15">
          <Link to="/copy-trading">{c.hero.ctaAdvisor}</Link>
        </Button>
      </div>
    </section>
  );
}

type TL = {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: { name: string; role: string; quote: string; rating: number; seed: string; verified?: boolean }[];
};

const TESTIMONIALS: Record<string, TL> = {
  ar: {
    eyebrow: "آراء العملاء",
    title: "تجارب حقيقية من عملائنا",
    subtitle: "شهادات من مستثمرين وثقوا بإدارتنا لمحافظهم.",
    items: [
      { seed: "khaled-m", name: "خالد المنصوري", role: "رجل أعمال — دبي", rating: 5, quote: "إدارة احترافية وشفافية كاملة في التقارير الشهرية. عوائد مستقرة ومخاطر مدروسة.", verified: true },
      { seed: "sara-a", name: "سارة العتيبي", role: "طبيبة استشارية — الرياض", rating: 5, quote: "بوابة العميل ممتازة وفريق الدعم سريع الاستجابة. أنصح بها لكل من يبحث عن استثمار طويل الأجل.", verified: true },
      { seed: "ahmed-f", name: "أحمد الفهد", role: "مستثمر خاص — الكويت", rating: 4.5, quote: "التزام صارم بإدارة المخاطر، وأداء يفوق التوقعات على مدى سنتين متتاليتين.", verified: true },
      { seed: "layla-q", name: "ليلى القحطاني", role: "مديرة مالية — جدة", rating: 5, quote: "خطة الاستثمار وُضعت وفق أهدافي بدقة، والتواصل مع المستشار احترافي جدًا.", verified: true },
      { seed: "yousef-b", name: "يوسف البلوشي", role: "مهندس أول — مسقط", rating: 4.5, quote: "التقارير الشهرية واضحة والأداء ثابت. تجربة مطمئنة على المدى الطويل.", verified: true },
      { seed: "mona-s", name: "منى الشمري", role: "مستثمرة — الدوحة", rating: 4.5, quote: "التحديثات الأسبوعية عن الأداء ممتازة، وسحب الأرباح سهل وسريع.", verified: true },
      // — أجانب موثّقون —
      { seed: "james-w", name: "James Whitfield", role: "رجل أعمال — لندن", rating: 5, quote: "أداء ثابت وتقارير شهرية شفافة. تجربة احترافية بكل المقاييس.", verified: true },
      { seed: "sofia-l", name: "Sofia Lindqvist", role: "مستثمرة خاصة — ستوكهولم", rating: 5, quote: "الحفاظ على رأس المال كان أولويتي، والنتائج فاقت توقعاتي.", verified: true },
      { seed: "michael-c", name: "Michael Chen", role: "تنفيذي — سنغافورة", rating: 5, quote: "إدارة مخاطر منضبطة وأداء قوي يناسب استثماري طويل الأجل.", verified: true },
      { seed: "amelia-r", name: "Amelia Rossi", role: "مديرة مالية — ميلانو", rating: 4.5, quote: "تنويع واضح بين الأصول وتواصل احترافي مع المستشار.", verified: true },
      { seed: "hugo-l", name: "Hugo Lefevre", role: "مهندس — مونتريال", rating: 5, quote: "خيار ممتاز للاستثمار المستقر بعيدًا عن ضجيج الأسواق.", verified: true },
      { seed: "david-t", name: "David Thompson", role: "مدير صندوق — نيويورك", rating: 5, quote: "انضباط في التنفيذ وشفافية نادرة في التقارير. من أفضل تجاربي الاستثمارية.", verified: true },
      { seed: "hannah-m", name: "Hannah Müller", role: "مستشارة ثروات — فرانكفورت", rating: 5, quote: "التوازن بين العائد والمخاطر مدروس بعناية، والتواصل دقيق ومحترم.", verified: true },
      { seed: "takeshi-y", name: "Takeshi Yamamoto", role: "مستثمر خاص — طوكيو", rating: 4.5, quote: "التزام صارم بالخطة الاستثمارية ونتائج مستقرة على مدى عام كامل.", verified: true },
      { seed: "isabella-c", name: "Isabella Costa", role: "رائدة أعمال — لشبونة", rating: 5, quote: "أداء تجاوز التوقعات مع وضوح تام في هيكل الرسوم.", verified: true },
      { seed: "oliver-b", name: "Oliver Bennett", role: "محامي شركات — سيدني", rating: 5, quote: "منصة عملاء ممتازة وتقارير شهرية بجودة مؤسسية.", verified: true },
      { seed: "ana-v", name: "Anastasia Volkova", role: "مستثمرة — دبي", rating: 4.5, quote: "فريق يفهم أهداف العميل الطويلة المدى ويتعامل بمهنية عالية.", verified: true },
      { seed: "rafael-o", name: "Rafael Ortega", role: "طبيب أسنان — مدريد", rating: 5, quote: "مثالي لمن يريد استثمارًا هادئًا بعيدًا عن التوتر اليومي.", verified: true },
      { seed: "priya-s", name: "Priya Sharma", role: "مهندسة برمجيات — بنغالورو", rating: 5, quote: "تحديثات دقيقة وأداء واضح — سعيدة جدًا بالتجربة.", verified: true },
      // — عرب —
      { seed: "abdullah-g", name: "عبدالله الغامدي", role: "رجل أعمال — الرياض", rating: 5, quote: "خدمة عملاء راقية وتقارير أسبوعية تعطيني صورة كاملة عن المحفظة.", verified: true },
      { seed: "noura-k", name: "نورة الكعبي", role: "مستثمرة — أبوظبي", rating: 5, quote: "تجربة استثمارية ناضجة، والتواصل مع المستشار مباشر وواضح.", verified: true },
      { seed: "faisal-d", name: "فيصل الدوسري", role: "استشاري مالي — المنامة", rating: 4.5, quote: "الحفاظ على رأس المال أولوية، وقد لمست ذلك في كل قرار.", verified: true },
      { seed: "reem-h", name: "ريم الحمادي", role: "مديرة تسويق — الشارقة", rating: 5, quote: "عوائد جيدة مع شفافية كاملة في العمولات والرسوم.", verified: true },
      { seed: "majed-h", name: "ماجد الحربي", role: "طبيب — الدمام", rating: 5, quote: "تنويع ذكي بين الأصول وأداء يستحق الثقة.", verified: true },
      { seed: "hind-z", name: "هند الزعابي", role: "مستثمرة خاصة — عمّان", rating: 4.5, quote: "أشعر أن مالي في أيدٍ أمينة، والتقارير تصلني في وقتها.", verified: true },
      { seed: "tareq-b", name: "طارق البقمي", role: "مقاول — جدة", rating: 5, quote: "بدأت متردداً وأصبحت من أكثر المؤيدين لهذه المحفظة.", verified: true },
      { seed: "dana-s", name: "دانا الصباح", role: "محامية — الكويت", rating: 5, quote: "احترافية في التعامل ونتائج فعلية على أرض الواقع.", verified: true },
      // — مصريون (لهجة مصرية) —
      { seed: "mohamed-a", name: "محمد عبد الرحمن", role: "صاحب مصنع — القاهرة", rating: 5, quote: "بصراحة تجربة محترمة جدًا، الأرباح بتنزل في وقتها والتقارير واضحة أوي." },
      { seed: "mona-sh", name: "منى شعبان", role: "دكتورة صيدلانية — الإسكندرية", rating: 5, quote: "أنا مبحبش المخاطرة، والمحفظة دي ريّحتني جدًا. الأداء ثابت والحمد لله." },
      { seed: "ahmed-fa", name: "أحمد فتحي", role: "مهندس بترول — القاهرة", rating: 5, quote: "الفريق محترم والتواصل سريع، وكل ما أسأل بلاقي رد فورًا." },
      { seed: "shaimaa-a", name: "شيماء عبد الله", role: "معلمة — المنصورة", rating: 4.5, quote: "بدأت بمبلغ صغير وكبرتُه بالتدريج، الموضوع سهل ومفيش تعقيد." },
      { seed: "karim-s", name: "كريم السيد", role: "مبرمج — الجيزة", rating: 5, quote: "المنصة سهلة والسحب بيتم بسرعة، تجربة تستاهل فعلًا." },
      { seed: "heba-m", name: "هبة مصطفى", role: "صاحبة بوتيك — طنطا", rating: 5, quote: "أول مرة أحس إن فيه حد بيشتغل على فلوسي بجد. ربنا يبارك." },
      { seed: "amr-h", name: "عمرو حجازي", role: "محاسب قانوني — القاهرة", rating: 4.5, quote: "الأرقام واضحة والتقارير مفصّلة، ده اللي بيفرق في الاستثمار." },
      { seed: "salma-a", name: "سلمى عادل", role: "مهندسة معمارية — الإسكندرية", rating: 5, quote: "خدمة العملاء بترد بسرعة وبتشرح كل حاجة بهدوء، حاجة تفرح." },
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
    accent: "from-gold/25 to-gold/5",
  },
  riskExcellence: {
    year: "2024",
    issuer: "MENA Investment Summit",
    verifyUrl: "https://www.menafn.com/",
    icon: Crown,
    accent: "from-primary/25 to-primary/5",
  },
  fintechInnovation: {
    year: "2025",
    issuer: "World Finance Awards",
    verifyUrl: "https://www.worldfinance.com/awards",
    icon: Gem,
    accent: "from-brand-blue/25 to-brand-blue/5",
  },
  clientTrust: {
    year: "2025",
    issuer: "Euromoney Private Banking",
    verifyUrl: "https://www.euromoney.com/research-and-awards",
    icon: Sparkle,
    accent: "from-gold-soft/25 to-gold-soft/5",
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
  const autoplay = React.useRef(
    Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true }),
  );
  return (
    <section className="border-y border-white/5 bg-white/[0.02] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.22em] text-gold">{t.eyebrow}</span>
          <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">{t.title}</h2>
          <p className="mt-4 text-muted-foreground">{t.subtitle}</p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
            direction: dir === "rtl" ? "rtl" : "ltr",
            watchDrag: true,
            dragFree: false,
            dragThreshold: 8,
            duration: 22,
            skipSnaps: false,
            containScroll: "trimSnaps",
          }}
          plugins={[autoplay.current]}
          className="mt-12 touch-pan-y"
        >
          <CarouselContent className="-ml-4 transform-gpu will-change-transform [backface-visibility:hidden]">
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
                      <p className="flex items-center gap-1.5 truncate font-display text-base font-semibold text-foreground">
                        <span className="truncate">{it.name}</span>
                        {it.verified && (
                          <BadgeCheck
                            className="h-4 w-4 shrink-0 text-gold"
                            aria-label="عميل مُوثّق"
                          />
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{it.role}</p>
                      {it.verified && (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-gold">
                          <BadgeCheck className="h-3 w-3" />
                          عميل مُوثّق
                        </span>
                      )}
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
            asChild
            className="rounded-sm border border-[#a0430a] bg-[#c2410c] font-semibold text-white shadow-[0_4px_14px_rgba(194,65,12,0.35)] transition-all duration-200 hover:border-[#ea580c] hover:bg-[#ea580c] hover:shadow-[0_6px_20px_rgba(234,88,12,0.5)] active:border-[#7c2d0a] active:bg-[#9a3412] active:scale-[0.98]"
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
