import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { ArrowRight } from "lucide-react";
import enData from "@/content/markets/en.json";
import arData from "@/content/markets/ar.json";

type FaqItem = { q: string; a: string };
type Asset = {
  symbol: string;
  name: string;
  category: string;
  title: string;
  description: string;
  intro: string;
  overview: string;
  highlights: string[];
  why: string[];
  tradingHours: string;
  volatility: string;
  risk: string;
  faq: FaqItem[];
};

const EN = enData as Record<string, Asset>;
const AR = arData as Record<string, Asset>;
const SITE = "https://www.hkexinvest.com";

const SLUGS = Object.keys(EN);

type Lang = "en" | "ar";

function pickLang(raw: unknown): Lang {
  return raw === "ar" ? "ar" : "en";
}

export const Route = createFileRoute("/markets/$symbol")({
  validateSearch: (s: Record<string, unknown>) => ({ lang: pickLang(s.lang) }),
  loaderDeps: ({ search }) => ({ lang: search.lang }),
  loader: ({ params, deps }) => {
    const slug = params.symbol.toLowerCase();
    const bundle = deps.lang === "ar" ? AR : EN;
    const asset = bundle[slug];
    if (!asset) throw notFound();
    return { asset, slug, lang: deps.lang };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Asset not found" }, { name: "robots", content: "noindex" }] };
    }
    const { asset, slug, lang } = loaderData;
    const path = `/markets/${slug}`;
    const canonical = `${SITE}${path}`;
    const enUrl = canonical;
    const arUrl = `${canonical}?lang=ar`;
    const currentUrl = lang === "ar" ? arUrl : enUrl;

    const financialProduct = {
      "@context": "https://schema.org",
      "@type": "FinancialProduct",
      name: `${asset.name} (${asset.symbol})`,
      category: asset.category,
      description: asset.description,
      url: currentUrl,
      provider: {
        "@type": "FinancialService",
        name: "HKEX Invest",
        url: SITE,
      },
    };

    const faqPage = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: asset.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: "Markets", item: `${SITE}/markets` },
        { "@type": "ListItem", position: 3, name: asset.name, item: canonical },
      ],
    };

    return {
      meta: [
        { title: asset.title },
        { name: "description", content: asset.description },
        { name: "robots", content: "index,follow,max-image-preview:large" },
        { property: "og:title", content: asset.title },
        { property: "og:description", content: asset.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: currentUrl },
        { property: "og:locale", content: lang === "ar" ? "ar_AE" : "en_US" },
        { property: "og:locale:alternate", content: lang === "ar" ? "en_US" : "ar_AE" },
        { name: "twitter:title", content: asset.title },
        { name: "twitter:description", content: asset.description },
      ],
      links: [
        { rel: "canonical", href: currentUrl },
        { rel: "alternate", hrefLang: "en", href: enUrl },
        { rel: "alternate", hrefLang: "ar", href: arUrl },
        { rel: "alternate", hrefLang: "x-default", href: enUrl },
      ],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(financialProduct) },
        { type: "application/ld+json", children: JSON.stringify(faqPage) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumb) },
      ],
    };
  },
  component: AssetPage,
  notFoundComponent: () => (
    <PageShell>
      <PageHero title="Asset not found" subtitle="This market page doesn't exist." />
    </PageShell>
  ),
});

const UI = {
  en: {
    breadcrumbHome: "Home",
    breadcrumbMarkets: "Markets",
    why: (n: string) => `Why trade ${n}?`,
    highlights: "Trading highlights",
    overview: "Market overview",
    hours: "Trading hours",
    volatility: "Volatility profile",
    risk: "Risk disclosure",
    faq: "Frequently asked questions",
    related: "Related markets",
    start: (s: string) => `Start trading ${s}`,
    viewAll: "View all markets",
    switchLang: "العربية",
  },
  ar: {
    breadcrumbHome: "الرئيسية",
    breadcrumbMarkets: "الأسواق",
    why: (n: string) => `لماذا تتداول ${n}؟`,
    highlights: "أبرز ميزات التداول",
    overview: "نظرة عامة على السوق",
    hours: "ساعات التداول",
    volatility: "طبيعة التقلبات",
    risk: "إفصاح المخاطر",
    faq: "الأسئلة الشائعة",
    related: "أسواق ذات صلة",
    start: (s: string) => `ابدأ تداول ${s}`,
    viewAll: "جميع الأسواق",
    switchLang: "English",
  },
} as const;

function AssetPage() {
  const { asset: a, slug, lang } = Route.useLoaderData();
  const t = UI[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const related = SLUGS.filter((s) => s !== slug).slice(0, 6);
  const bundle = lang === "ar" ? AR : EN;

  return (
    <PageShell>
      <div dir={dir}>
        <PageHero
          eyebrow={a.category}
          title={
            <>
              {a.name} <span className="text-gradient">({a.symbol})</span>
            </>
          }
          subtitle={a.intro}
        />
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link to="/">{t.breadcrumbHome}</Link></li>
              <li aria-hidden>/</li>
              <li><Link to="/markets">{t.breadcrumbMarkets}</Link></li>
              <li aria-hidden>/</li>
              <li className="text-foreground">{a.name}</li>
            </ol>
          </nav>

          <div className="mb-8 flex justify-end">
            <Link
              to="/markets/$symbol"
              params={{ symbol: slug }}
              search={{ lang: lang === "ar" ? "en" : "ar" }}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {t.switchLang}
            </Link>
          </div>

          <article className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-semibold">{t.overview}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.overview}</p>
          </article>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="glass rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold">{t.why(a.name)}</h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {a.why.map((w) => (
                  <li key={w} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold">{t.highlights}</h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {a.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="glass rounded-2xl p-5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-gold">{t.hours}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.tradingHours}</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-gold">{t.volatility}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.volatility}</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-gold">{t.risk}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.risk}</p>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold">{t.faq}</h2>
            <div className="mt-4 space-y-3">
              {a.faq.map((f) => (
                <details key={f.q} className="glass rounded-xl p-4">
                  <summary className="cursor-pointer font-medium text-foreground">{f.q}</summary>
                  <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold">{t.related}</h2>
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {related.map((s) => (
                <li key={s}>
                  <Link
                    to="/markets/$symbol"
                    params={{ symbol: s }}
                    search={{ lang }}
                    className="block rounded-lg border border-white/10 px-3 py-2 text-sm text-muted-foreground hover:border-gold/40 hover:text-foreground"
                  >
                    {bundle[s]?.name} <span className="text-gold/70">({bundle[s]?.symbol})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--gradient-brand)] px-5 py-2.5 text-sm font-semibold text-black"
            >
              {t.start(a.symbol)}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/markets"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground"
            >
              {t.viewAll}
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  );
}