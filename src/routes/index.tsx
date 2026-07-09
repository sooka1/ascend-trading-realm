import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Award,
  BarChart3,
  Bitcoin,
  ChevronRight,
  Clock,
  DollarSign,
  Flame,
  Globe2,
  GraduationCap,
  Layers,
  LineChart,
  Lock,
  Medal,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trophy,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { MarketTicker } from "@/components/market-ticker";
import { AnimatedCounter } from "@/components/animated-counter";
import { Button } from "@/components/ui/button";
import { useT, useHome } from "@/lib/i18n";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import heroBg from "@/assets/hero-bg.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <PageShell>
      <Hero />
      <MarketTicker />
      <WhyChooseUs />
      <Instruments />
      <CompetitionsSection />
      <Leaderboard />
      <Stats />
      <Reviews />
      <AcademyNews />
      <AffiliateBanner />
      <MobileApps />
      <SecurityBlock />
      <FaqSection />
      <FinalCTA />
    </PageShell>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  const t = useT();
  return (
    <section className="relative overflow-hidden">
      <img
        src={heroBg}
        alt=""
        aria-hidden
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" aria-hidden />

      {/* floating asset chips */}
      <FloatingAssets />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pt-20 pb-24 sm:px-6 md:pt-28 md:pb-32 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            {t("hero.badge")}
          </span>

          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] sm:text-6xl md:text-7xl">
            {t("hero.title.1")}
            <br />
            <span className="text-gradient">{t("hero.title.2")}</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground">{t("hero.subtitle")}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              asChild
              className="bg-[var(--gradient-brand)] text-white shadow-[var(--shadow-glow)] hover:opacity-95"
            >
              <Link to="/auth">
                {t("hero.cta.start")} <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/15 bg-white/5 hover:bg-white/10">
              <Link to="/competitions">
                <Trophy className="mr-2 h-4 w-4 text-gold" /> {t("hero.cta.compete")}
              </Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link to="/platform">{t("hero.cta.demo")}</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-xs text-muted-foreground">
            <TrustPill icon={ShieldCheck} label={t("hero.trust.regulated")} />
            <TrustPill icon={Zap} label={t("hero.trust.execution")} />
            <TrustPill icon={Lock} label={t("hero.trust.funds")} />
            <TrustPill icon={Users} label={t("hero.trust.traders")} />
          </div>
        </div>

        <HeroCard />
      </div>
    </section>
  );
}

function TrustPill({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon className="h-4 w-4 text-gold" />
      {label}
    </span>
  );
}

function FloatingAssets() {
  const items = [
    { label: "BTC", top: "12%", left: "8%", delay: "0s", color: "text-gold" },
    { label: "XAU", top: "70%", left: "6%", delay: "1.2s", color: "text-gold-soft" },
    { label: "ETH", top: "22%", right: "10%", delay: "0.5s", color: "text-brand-blue" },
    { label: "S&P", top: "75%", right: "8%", delay: "1.8s", color: "text-foreground" },
  ] as const;
  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
      {items.map((it) => (
        <div
          key={it.label}
          className="absolute animate-float-slow"
          style={{ top: it.top, left: (it as any).left, right: (it as any).right, animationDelay: it.delay }}
        >
          <div className="glass flex h-14 w-14 items-center justify-center rounded-2xl font-display font-bold">
            <span className={it.color}>{it.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function HeroCard() {
  const h = useHome();
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-3xl bg-[var(--gradient-brand-soft)] blur-2xl" aria-hidden />
      <div className="glass-strong relative overflow-hidden rounded-3xl p-5 shadow-[var(--shadow-glow)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">BTC / USD · 1H</div>
            <div className="mt-1 font-display text-2xl font-bold tabular-nums">$71,284.50</div>
          </div>
          <div className="rounded-lg bg-bull/15 px-2 py-1 text-xs font-medium text-bull">+1.42%</div>
        </div>

        <MiniChart />

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          {[
            { k: "24h High", v: "72,110" },
            { k: "24h Low", v: "70,204" },
            { k: "Volume", v: "$28.4B" },
          ].map((s) => (
            <div key={s.k} className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
              <div className="text-muted-foreground">{s.k}</div>
              <div className="mt-0.5 font-medium tabular-nums">{s.v}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button size="sm" className="bg-bull text-white hover:bg-bull/90">{h.common.buy}</Button>
          <Button size="sm" variant="outline" className="border-bear/40 text-bear hover:bg-bear/10">{h.common.sell}</Button>
        </div>
      </div>
    </div>
  );
}

function MiniChart() {
  const points = "0,60 20,55 40,58 60,42 80,48 100,38 120,44 140,30 160,34 180,22 200,26 220,16 240,20 260,12";
  return (
    <svg viewBox="0 0 260 80" className="mt-4 h-24 w-full">
      <defs>
        <linearGradient id="ch" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.58 0.20 264)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="oklch(0.58 0.20 264)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke="oklch(0.58 0.20 264)" strokeWidth="2" />
      <polygon points={`${points} 260,80 0,80`} fill="url(#ch)" />
    </svg>
  );
}

/* ---------------- WHY CHOOSE US ---------------- */
function WhyChooseUs() {
  const h = useHome().why;
  const icons = [Zap, ShieldCheck, BarChart3, Trophy, Globe2, Users];
  const items = h.items.map((it, i) => ({ ...it, icon: icons[i] }));
  return (
    <Section
      eyebrow={h.eyebrow}
      title={<>{h.titleA} <span className="text-gradient">{h.titleB}</span></>}
      subtitle={h.subtitle}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <div
            key={it.title}
            className="glass group relative overflow-hidden rounded-2xl p-6 transition hover:-translate-y-0.5 hover:border-white/20"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--gradient-brand-soft)] opacity-0 blur-2xl transition group-hover:opacity-100" />
            <div className="relative">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--gradient-brand-soft)]">
                <it.icon className="h-5 w-5 text-gold" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- INSTRUMENTS ---------------- */
function Instruments() {
  const h = useHome().instruments;
  const icons = [DollarSign, Bitcoin, Medal, LineChart, Layers, Flame, Activity, Globe2];
  const cats = h.items.map((it, i) => ({ ...it, icon: icons[i] }));
  return (
    <Section
      eyebrow={h.eyebrow}
      title={<>{h.titleA} <span className="text-gradient">{h.titleB}</span></>}
      subtitle={h.subtitle}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cats.map((c) => (
          <div key={c.name} className="glass rounded-xl p-5 transition hover:border-white/20">
            <c.icon className="h-6 w-6 text-gold" />
            <div className="mt-3 font-display font-semibold">{c.name}</div>
            <div className="text-sm text-muted-foreground">{c.count}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- COMPETITIONS ---------------- */
function CompetitionsSection() {
  const h = useHome().competitions;
  const tags = [h.tagFeatured, h.tagLive, h.tagUpcoming];
  const accents = ["gold", "blue", "gold"] as const;
  const comps = h.items.map((c, i) => ({ ...c, tag: tags[i], accent: accents[i] }));
  return (
    <Section
      eyebrow={h.eyebrow}
      title={<>{h.titleA} <span className="text-gradient">{h.titleB}</span>.</>}
      subtitle={h.subtitle}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {comps.map((c) => (
          <div key={c.title} className="glass-strong group relative overflow-hidden rounded-2xl p-6">
            <div className="absolute inset-x-0 top-0 h-px bg-[var(--gradient-brand)]" />
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                {c.tag}
              </span>
              <Trophy className={c.accent === "gold" ? "h-5 w-5 text-gold" : "h-5 w-5 text-brand-blue"} />
            </div>
            <h3 className="mt-6 font-display text-2xl font-bold">{c.title}</h3>
            <div className="mt-1 text-sm text-muted-foreground">{c.type}</div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{h.prizePool}</div>
              <div className="mt-1 font-display text-3xl font-bold text-gradient">{c.prize}</div>
              <div className="mt-3 text-xs text-muted-foreground">{h.slots}: {c.spots}</div>
              <div className="mt-2 h-1.5 rounded-full bg-white/5">
                <div className="h-full w-2/3 rounded-full bg-[var(--gradient-brand)]" />
              </div>
            </div>

            <Button asChild className="mt-6 w-full bg-[var(--gradient-brand)] text-white hover:opacity-95">
              <Link to="/competitions">{h.register}</Link>
            </Button>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- LEADERBOARD ---------------- */
function Leaderboard() {
  const h = useHome().leaderboard;
  const rows = [
    { rank: 1, name: "Alexei V.", country: "🇦🇪", pnl: "+184.2%", equity: "$284,150", badge: "gold" },
    { rank: 2, name: "Priya M.", country: "🇸🇬", pnl: "+152.7%", equity: "$212,880", badge: "silver" },
    { rank: 3, name: "Diego R.", country: "🇧🇷", pnl: "+141.9%", equity: "$198,412", badge: "bronze" },
    { rank: 4, name: "Kenji O.", country: "🇯🇵", pnl: "+118.5%", equity: "$176,033" },
    { rank: 5, name: "Layla H.", country: "🇸🇦", pnl: "+107.8%", equity: "$168,724" },
    { rank: 6, name: "Marco B.", country: "🇮🇹", pnl: "+94.6%", equity: "$154,201" },
    { rank: 7, name: "Sara K.", country: "🇩🇪", pnl: "+82.3%", equity: "$142,088" },
  ];
  const badge = (b?: string) =>
    b === "gold" ? "bg-gold/20 text-gold border-gold/30" :
    b === "silver" ? "bg-white/10 text-foreground border-white/20" :
    b === "bronze" ? "bg-[oklch(0.55_0.14_50)]/20 text-[oklch(0.75_0.14_50)] border-[oklch(0.55_0.14_50)]/30" :
    "bg-white/5 text-muted-foreground border-white/10";
  return (
    <Section
      eyebrow={h.eyebrow}
      title={<>{h.titleA} <span className="text-gradient">{h.titleB}</span></>}
      subtitle={h.subtitle}
    >
      <div className="glass-strong overflow-hidden rounded-2xl">
        <div className="grid grid-cols-[64px_1fr_auto_auto] gap-4 border-b border-white/5 px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground sm:grid-cols-[64px_1fr_140px_140px]">
          <div>{h.rank}</div>
          <div>{h.trader}</div>
          <div className="text-right">{h.pnl}</div>
          <div className="hidden text-right sm:block">{h.equity}</div>
        </div>
        {rows.map((r) => (
          <div
            key={r.rank}
            className="grid grid-cols-[64px_1fr_auto_auto] items-center gap-4 border-b border-white/5 px-6 py-4 last:border-b-0 sm:grid-cols-[64px_1fr_140px_140px]"
          >
            <div>
              <span className={`inline-grid h-8 w-8 place-items-center rounded-full border font-display text-sm font-bold ${badge(r.badge)}`}>
                {r.rank}
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-xl">{r.country}</span>
              <span className="truncate font-medium">{r.name}</span>
            </div>
            <div className="text-right font-medium tabular-nums text-bull">{r.pnl}</div>
            <div className="hidden text-right tabular-nums text-muted-foreground sm:block">{r.equity}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <Button variant="outline" asChild className="border-white/15 bg-white/5 hover:bg-white/10">
          <Link to="/competitions">{h.viewAll} <ChevronRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>
    </Section>
  );
}

/* ---------------- STATS ---------------- */
function Stats() {
  const h = useHome().stats;
  const stats = [
    { value: 2_400_000, suffix: "+", label: h.activeTraders },
    { value: 184, suffix: "+", label: h.countries },
    { value: 18, suffix: "ms", label: h.execution },
    { value: 1.2, suffix: "B+", prefix: "$", decimals: 1, label: h.prizes },
  ];
  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-strong grid gap-6 rounded-3xl p-8 sm:grid-cols-2 lg:grid-cols-4 lg:p-12">
          {stats.map((s) => (
            <div key={s.label} className="text-center lg:text-left">
              <div className="font-display text-4xl font-bold tabular-nums text-gradient lg:text-5xl">
                <AnimatedCounter
                  value={s.value}
                  prefix={(s as any).prefix ?? ""}
                  suffix={s.suffix}
                  decimals={(s as any).decimals ?? 0}
                />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- REVIEWS ---------------- */
function Reviews() {
  const h = useHome().reviews;
  const reviews = h.items;
  return (
    <Section
      eyebrow={h.eyebrow}
      title={<>{h.titleA} <span className="text-gradient">{h.titleB}</span></>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {reviews.map((r) => (
          <figure key={r.name} className="glass rounded-2xl p-6">
            <div className="text-gold" aria-hidden>★★★★★</div>
            <blockquote className="mt-4 text-sm leading-relaxed text-foreground/90">"{r.quote}"</blockquote>
            <figcaption className="mt-6 text-sm">
              <div className="font-medium">{r.name}</div>
              <div className="text-muted-foreground">{r.role}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- ACADEMY + NEWS ---------------- */
function AcademyNews() {
  const h = useHome().academy;
  return (
    <Section
      eyebrow={h.eyebrow}
      title={<>{h.titleA} <span className="text-gradient">{h.titleB}</span></>}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-strong lg:row-span-2 lg:col-span-1 rounded-2xl p-8">
          <GraduationCap className="h-8 w-8 text-gold" />
          <h3 className="mt-6 font-display text-2xl font-bold">{h.cardTitle}</h3>
          <p className="mt-3 text-sm text-muted-foreground">{h.cardBody}</p>
          <Button asChild variant="outline" className="mt-6 border-white/15 bg-white/5 hover:bg-white/10">
            <Link to="/education">{h.explore}</Link>
          </Button>
        </div>
        {h.news.map((n) => (
          <Link key={n.title} to="/news" className="glass group rounded-2xl p-6 transition hover:border-white/20">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
              <span>{n.tag}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{n.time}</span>
            </div>
            <h4 className="mt-3 font-display text-lg font-semibold transition-colors group-hover:text-gradient">{n.title}</h4>
          </Link>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- AFFILIATE ---------------- */
function AffiliateBanner() {
  const h = useHome().affiliate;
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="glass-strong relative overflow-hidden rounded-3xl p-8 md:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--gradient-brand-soft)] blur-3xl" />
        <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {h.tag}
            </span>
            <h3 className="mt-5 font-display text-3xl font-bold md:text-4xl">
              {h.titleA} <span className="text-gradient">{h.titleB}</span> {h.titleC}
            </h3>
            <p className="mt-3 max-w-lg text-muted-foreground">{h.body}</p>
            <div className="mt-6 flex gap-3">
              <Button asChild className="bg-[var(--gradient-brand)] text-white">
                <Link to="/affiliate">{h.become}</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/15 bg-white/5 hover:bg-white/10">
                <Link to="/partners">{h.partner}</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {h.tiles.map((s) => (
              <div key={s.k} className="glass rounded-xl p-4 text-center">
                <div className="text-xs text-muted-foreground">{s.k}</div>
                <div className="mt-1 font-display text-2xl font-bold text-gradient">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- MOBILE APPS ---------------- */
function MobileApps() {
  const home = useHome();
  const h = home.mobile;
  return (
    <Section
      eyebrow={h.eyebrow}
      title={<>{h.titleA} <span className="text-gradient">{h.titleB}</span></>}
    >
      <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
        <div className="glass-strong relative overflow-hidden rounded-2xl p-8">
          <Smartphone className="h-8 w-8 text-gold" />
          <h3 className="mt-5 font-display text-2xl font-bold">{h.cardTitle}</h3>
          <p className="mt-3 max-w-lg text-muted-foreground">{h.cardBody}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="glass rounded-xl px-4 py-3 text-sm">📱 App Store</div>
            <div className="glass rounded-xl px-4 py-3 text-sm">🤖 Google Play</div>
          </div>
        </div>
        <div className="relative flex justify-center">
          <div className="glass-strong relative aspect-[9/16] w-56 overflow-hidden rounded-[2.5rem] border border-white/15 p-3 shadow-[var(--shadow-glow)]">
            <div className="flex h-full flex-col rounded-[2rem] bg-background/80 p-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{h.portfolio}</div>
              <div className="mt-1 font-display text-2xl font-bold tabular-nums">$48,921.44</div>
              <div className="text-xs text-bull">+$1,214 {h.today}</div>
              <MiniChart />
              <div className="mt-auto grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-bull/15 py-2 text-center text-xs font-medium text-bull">{home.common.buy}</div>
                <div className="rounded-lg bg-bear/15 py-2 text-center text-xs font-medium text-bear">{home.common.sell}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------------- SECURITY ---------------- */
function SecurityBlock() {
  const h = useHome().security;
  const icons = [ShieldCheck, Lock, Wallet, Award];
  const items = h.items.map((title, i) => ({ title, icon: icons[i] }));
  return (
    <Section
      eyebrow={h.eyebrow}
      title={<>{h.titleA} <span className="text-gradient">{h.titleB}</span></>}
      subtitle={h.subtitle}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.title} className="glass rounded-xl p-5">
            <it.icon className="h-6 w-6 text-gold" />
            <div className="mt-3 font-medium">{it.title}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- FAQ ---------------- */
function FaqSection() {
  const h = useHome().faq;
  const faqs = h.items;
  return (
    <Section
      eyebrow={h.eyebrow}
      title={<>{h.titleA} <span className="text-gradient">{h.titleB}</span></>}
    >
      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-white/10">
              <AccordionTrigger className="text-left font-display text-lg">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

/* ---------------- FINAL CTA ---------------- */
function FinalCTA() {
  const h = useHome().finalCta;
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 p-10 text-center md:p-16">
        <div className="pointer-events-none absolute inset-0 bg-[var(--gradient-brand-soft)]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div className="relative">
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            {h.titleA} <span className="text-gradient">{h.titleB}</span> {h.titleC}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{h.body}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild className="bg-[var(--gradient-brand)] text-white shadow-[var(--shadow-glow)]">
              <Link to="/auth">{h.openLive}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/15 bg-white/5 hover:bg-white/10">
              <Link to="/platform">{h.tryDemo}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Shared section wrapper ---------------- */
function Section({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {eyebrow}
          </span>
        )}
        <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl md:text-5xl">{title}</h2>
        {subtitle && <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
