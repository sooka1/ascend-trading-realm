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
import { useT } from "@/lib/i18n";
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
          <Button size="sm" className="bg-bull text-white hover:bg-bull/90">Buy</Button>
          <Button size="sm" variant="outline" className="border-bear/40 text-bear hover:bg-bear/10">Sell</Button>
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
  const items = [
    { icon: Zap, title: "Lightning execution", body: "Sub-20ms order routing across global liquidity venues." },
    { icon: ShieldCheck, title: "Regulated & secure", body: "Segregated funds, multi-jurisdiction compliance, cold storage." },
    { icon: BarChart3, title: "Pro-grade tools", body: "Advanced charting, algo orders, VPS, and depth-of-market." },
    { icon: Trophy, title: "Real prize pools", body: "Weekly and monthly tournaments with 6-figure prize funds." },
    { icon: Globe2, title: "Global markets", body: "10,000+ instruments across forex, crypto, stocks and indices." },
    { icon: Users, title: "24/7 support", body: "Human, multilingual client care in under 60 seconds." },
  ];
  return (
    <Section
      eyebrow="Why HK"
      title={<>Built for traders who <span className="text-gradient">refuse to lose</span></>}
      subtitle="Every layer of the HK stack — from routing to risk — is engineered for measurable edge."
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
  const cats = [
    { icon: DollarSign, name: "Forex", count: "60+ pairs" },
    { icon: Bitcoin, name: "Crypto", count: "120+ coins" },
    { icon: Medal, name: "Gold & Silver", count: "Spot & Futures" },
    { icon: LineChart, name: "Indices", count: "30+ global" },
    { icon: Layers, name: "Stocks", count: "5,000+ tickers" },
    { icon: Flame, name: "Energy", count: "Brent, WTI, NatGas" },
    { icon: Activity, name: "Commodities", count: "Softs & Metals" },
    { icon: Globe2, name: "ETFs & Futures", count: "Institutional access" },
  ];
  return (
    <Section
      eyebrow="Instruments"
      title={<>All markets. <span className="text-gradient">One account.</span></>}
      subtitle="Diversify across asset classes and time zones — from Tokyo open to Wall Street close."
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
  const comps = [
    { title: "King of Wall Street", prize: "$100,000", type: "Monthly · Live", spots: "1,842 / 3,000", tag: "Featured", accent: "gold" },
    { title: "Crypto Gladiator", prize: "$50,000", type: "Weekly · Live", spots: "612 / 1,500", tag: "Live now", accent: "blue" },
    { title: "Forex Masters Cup", prize: "$25,000", type: "Bi-weekly", spots: "Opens Fri", tag: "Upcoming", accent: "gold" },
  ];
  return (
    <Section
      eyebrow="Competitions"
      title={<>Trade to <span className="text-gradient">win</span>.</>}
      subtitle="Enter live tournaments with real prize pools. Climb the leaderboard, earn badges and unlock exclusive rewards."
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
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Prize pool</div>
              <div className="mt-1 font-display text-3xl font-bold text-gradient">{c.prize}</div>
              <div className="mt-3 text-xs text-muted-foreground">Slots: {c.spots}</div>
              <div className="mt-2 h-1.5 rounded-full bg-white/5">
                <div className="h-full w-2/3 rounded-full bg-[var(--gradient-brand)]" />
              </div>
            </div>

            <Button asChild className="mt-6 w-full bg-[var(--gradient-brand)] text-white hover:opacity-95">
              <Link to="/competitions">Register now</Link>
            </Button>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- LEADERBOARD ---------------- */
function Leaderboard() {
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
      eyebrow="Live Leaderboard"
      title={<>The world's <span className="text-gradient">top traders</span></>}
      subtitle="Real-time global rankings from this week's active competitions."
    >
      <div className="glass-strong overflow-hidden rounded-2xl">
        <div className="grid grid-cols-[64px_1fr_auto_auto] gap-4 border-b border-white/5 px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground sm:grid-cols-[64px_1fr_140px_140px]">
          <div>Rank</div>
          <div>Trader</div>
          <div className="text-right">P&amp;L</div>
          <div className="hidden text-right sm:block">Equity</div>
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
          <Link to="/competitions">View full leaderboard <ChevronRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>
    </Section>
  );
}

/* ---------------- STATS ---------------- */
function Stats() {
  const stats = [
    { value: 2_400_000, suffix: "+", label: "Active traders" },
    { value: 184, suffix: "+", label: "Countries served" },
    { value: 18, suffix: "ms", label: "Avg. execution" },
    { value: 1.2, suffix: "B+", prefix: "$", decimals: 1, label: "Prize pools awarded" },
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
  const reviews = [
    { quote: "The competition system turned my hobby into a career. I've cleared six figures in prize money.", name: "Julian F.", role: "Pro trader · Zurich" },
    { quote: "Execution is genuinely institutional. My scalp strategy finally works outside the lab.", name: "Amara O.", role: "Quant · Lagos" },
    { quote: "The mobile app is stunning and the leaderboard is addictive — in the best way possible.", name: "Chen L.", role: "Retail trader · Taipei" },
  ];
  return (
    <Section
      eyebrow="Loved by traders"
      title={<>Voices from the <span className="text-gradient">global floor</span></>}
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
  return (
    <Section
      eyebrow="Academy & News"
      title={<>Learn. Then <span className="text-gradient">crush it.</span></>}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-strong lg:row-span-2 lg:col-span-1 rounded-2xl p-8">
          <GraduationCap className="h-8 w-8 text-gold" />
          <h3 className="mt-6 font-display text-2xl font-bold">HK Trading Academy</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            200+ video lessons, live webinars, e-books and pro-grade calculators. Free for every funded client.
          </p>
          <Button asChild variant="outline" className="mt-6 border-white/15 bg-white/5 hover:bg-white/10">
            <Link to="/education">Explore Academy</Link>
          </Button>
        </div>
        {[
          { tag: "Market brief", title: "Gold breaks $2,400 as central banks pivot", time: "2h ago" },
          { tag: "Deep dive", title: "Bitcoin ETF flows point to fresh institutional wave", time: "6h ago" },
          { tag: "Signal", title: "EUR/USD sets up textbook liquidity sweep", time: "1d ago" },
          { tag: "Analysis", title: "Semiconductor rally: rotation or resumption?", time: "1d ago" },
        ].map((n) => (
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
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="glass-strong relative overflow-hidden rounded-3xl p-8 md:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--gradient-brand-soft)] blur-3xl" />
        <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Affiliate program
            </span>
            <h3 className="mt-5 font-display text-3xl font-bold md:text-4xl">
              Earn up to <span className="text-gradient">$1,200</span> per funded referral.
            </h3>
            <p className="mt-3 max-w-lg text-muted-foreground">
              Multi-tier commissions, lifetime revenue share and a real-time affiliate dashboard.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild className="bg-[var(--gradient-brand)] text-white">
                <Link to="/affiliate">Become an affiliate</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/15 bg-white/5 hover:bg-white/10">
                <Link to="/partners">Partner with us</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { k: "Tier 1", v: "$600" },
              { k: "Tier 2", v: "$900" },
              { k: "Tier 3", v: "$1,200" },
              { k: "Rev share", v: "20%" },
            ].map((s) => (
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
  return (
    <Section
      eyebrow="On every device"
      title={<>Your terminal, <span className="text-gradient">in your pocket</span></>}
    >
      <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
        <div className="glass-strong relative overflow-hidden rounded-2xl p-8">
          <Smartphone className="h-8 w-8 text-gold" />
          <h3 className="mt-5 font-display text-2xl font-bold">Trade anywhere, anytime</h3>
          <p className="mt-3 max-w-lg text-muted-foreground">
            Full charting, competitions and one-tap orders on iOS and Android. Biometric login, push alerts,
            and the same institutional infrastructure as desktop.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="glass rounded-xl px-4 py-3 text-sm">📱 App Store</div>
            <div className="glass rounded-xl px-4 py-3 text-sm">🤖 Google Play</div>
          </div>
        </div>
        <div className="relative flex justify-center">
          <div className="glass-strong relative aspect-[9/16] w-56 overflow-hidden rounded-[2.5rem] border border-white/15 p-3 shadow-[var(--shadow-glow)]">
            <div className="flex h-full flex-col rounded-[2rem] bg-background/80 p-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Portfolio</div>
              <div className="mt-1 font-display text-2xl font-bold tabular-nums">$48,921.44</div>
              <div className="text-xs text-bull">+$1,214 today</div>
              <MiniChart />
              <div className="mt-auto grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-bull/15 py-2 text-center text-xs font-medium text-bull">Buy</div>
                <div className="rounded-lg bg-bear/15 py-2 text-center text-xs font-medium text-bear">Sell</div>
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
  const items = [
    { icon: ShieldCheck, title: "Multi-jurisdiction regulation" },
    { icon: Lock, title: "Segregated client funds" },
    { icon: Wallet, title: "95% assets in cold storage" },
    { icon: Award, title: "SOC 2 Type II certified" },
  ];
  return (
    <Section
      eyebrow="Security & regulation"
      title={<>Your capital, <span className="text-gradient">fortified</span></>}
      subtitle="Bank-grade security and transparent regulation across every jurisdiction we operate in."
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
  const faqs = [
    { q: "How do I open a live trading account?", a: "Click 'Open account', complete verification in under 5 minutes, and fund via card, bank wire or crypto. You'll be live in the same session." },
    { q: "What are competition prize pools?", a: "Weekly and monthly tournaments run with prize pools from $10,000 to $500,000+. Entry is free for eligible funded accounts and paid entries return >90% of fees to winners." },
    { q: "Which markets can I trade?", a: "Forex, indices, commodities, energy, ETFs, futures, 5,000+ stocks and 120+ cryptocurrencies — all from a single account." },
    { q: "How fast are withdrawals?", a: "Same-day for crypto, next-day for card, 1–2 business days for bank wire. We maintain a 99.4% approval rate on first submission." },
    { q: "Is my money safe?", a: "Client funds are segregated in tier-1 banks, protected by multi-jurisdiction regulation and covered by our internal insurance program." },
  ];
  return (
    <Section
      eyebrow="FAQ"
      title={<>Straight <span className="text-gradient">answers</span></>}
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
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 p-10 text-center md:p-16">
        <div className="pointer-events-none absolute inset-0 bg-[var(--gradient-brand-soft)]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div className="relative">
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            Your seat at the <span className="text-gradient">global table</span> is open.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Open an account in minutes. Trade the world. Compete for real prizes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild className="bg-[var(--gradient-brand)] text-white shadow-[var(--shadow-glow)]">
              <Link to="/auth">Open Live Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/15 bg-white/5 hover:bg-white/10">
              <Link to="/platform">Try Demo</Link>
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
