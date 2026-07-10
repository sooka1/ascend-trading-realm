import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { ArrowRight } from "lucide-react";

type Asset = {
  symbol: string;
  name: string;
  category: string;
  title: string;
  description: string;
  intro: string;
  highlights: string[];
  why: string[];
};

const ASSETS: Record<string, Asset> = {
  btc: {
    symbol: "BTC",
    name: "Bitcoin",
    category: "Cryptocurrency",
    title: "Bitcoin (BTC) Price, Chart & Live Trading | HK Global Trading",
    description:
      "Live Bitcoin (BTC) price, real-time charts, and secure BTC/USD trading with tight spreads and 24/7 execution on HK Global Trading.",
    intro:
      "Track the live Bitcoin price and trade BTC/USD around the clock with institutional-grade liquidity, transparent spreads, and instant execution.",
    highlights: [
      "24/7 BTC/USD trading with deep liquidity",
      "Tight spreads and low commissions",
      "Advanced charting and price alerts",
      "Segregated funds and enterprise custody",
    ],
    why: [
      "The original and most liquid cryptocurrency",
      "Global market cap leader with deep derivatives markets",
      "A core diversifier in modern digital-asset portfolios",
    ],
  },
  eth: {
    symbol: "ETH",
    name: "Ethereum",
    category: "Cryptocurrency",
    title: "Ethereum (ETH) Price, Chart & Live Trading | HK Global Trading",
    description:
      "Real-time Ethereum (ETH) price, live charts, and ETH/USD trading with fast execution, tight spreads, and 24/7 markets on HK Global Trading.",
    intro:
      "Follow the live Ethereum price and trade ETH/USD with fast execution, transparent pricing, and professional-grade analytics.",
    highlights: [
      "24/7 ETH/USD trading with deep order books",
      "Low-latency execution and tight spreads",
      "Advanced charts, indicators, and alerts",
      "Bank-grade security and custody",
    ],
    why: [
      "Leading smart-contract platform powering DeFi and NFTs",
      "Second-largest crypto by market capitalization",
      "High liquidity across spot and derivatives markets",
    ],
  },
  xrp: {
    symbol: "XRP",
    name: "XRP",
    category: "Cryptocurrency",
    title: "XRP Price, Chart & Live Trading | HK Global Trading",
    description:
      "Live XRP price, real-time charts, and XRP/USD trading with tight spreads, fast execution, and 24/7 markets on HK Global Trading.",
    intro:
      "Monitor the live XRP price and trade XRP/USD with instant execution, competitive spreads, and professional charting tools.",
    highlights: [
      "24/7 XRP/USD trading with deep liquidity",
      "Transparent pricing and low fees",
      "Real-time charts and technical indicators",
      "Secure custody and segregated client funds",
    ],
    why: [
      "Purpose-built for fast, low-cost cross-border payments",
      "One of the most traded digital assets globally",
      "Established liquidity across major exchanges",
    ],
  },
  tsla: {
    symbol: "TSLA",
    name: "Tesla",
    category: "US Stocks",
    title: "Tesla Stock (TSLA) Price, Chart & Trading | HK Global Trading",
    description:
      "Live Tesla (TSLA) stock price, real-time charts, and CFD trading with tight spreads and instant execution on HK Global Trading.",
    intro:
      "Track the live Tesla stock price and trade TSLA CFDs with tight spreads, leverage, and professional-grade execution.",
    highlights: [
      "Trade TSLA long or short via CFDs",
      "Competitive spreads and low commissions",
      "Real-time quotes and advanced charting",
      "Regulated platform with segregated funds",
    ],
    why: [
      "One of the most actively traded US equities",
      "High volatility creates opportunities for active traders",
      "Leader in the electric-vehicle and clean-energy sector",
    ],
  },
  oil: {
    symbol: "OIL",
    name: "Crude Oil",
    category: "Commodities",
    title: "Crude Oil Price, Chart & Live Trading (WTI & Brent) | HK Global Trading",
    description:
      "Live crude oil prices (WTI & Brent), real-time charts, and oil CFD trading with tight spreads and fast execution on HK Global Trading.",
    intro:
      "Track live WTI and Brent crude oil prices and trade oil CFDs with tight spreads, deep liquidity, and instant execution.",
    highlights: [
      "Trade WTI and Brent crude via CFDs",
      "Tight spreads and transparent pricing",
      "Real-time charts with advanced indicators",
      "Long or short with flexible leverage",
    ],
    why: [
      "One of the world's most traded commodities",
      "High liquidity and clear trending behavior",
      "A key macro benchmark and portfolio diversifier",
    ],
  },
};

export const Route = createFileRoute("/markets/$symbol")({
  loader: ({ params }) => {
    const asset = ASSETS[params.symbol.toLowerCase()];
    if (!asset) throw notFound();
    return asset;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Asset not found" }, { name: "robots", content: "noindex" }] };
    }
    const url = `https://hk-global-trade.lovable.app/markets/${loaderData.symbol.toLowerCase()}`;
    return {
      meta: [
        { title: loaderData.title },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FinancialProduct",
            name: `${loaderData.name} (${loaderData.symbol})`,
            category: loaderData.category,
            description: loaderData.description,
            url,
          }),
        },
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

function AssetPage() {
  const a = Route.useLoaderData();
  return (
    <PageShell>
      <PageHero
        eyebrow={a.category}
        title={
          <>
            {a.name} <span className="text-gradient">({a.symbol})</span>
          </>
        }
        subtitle={a.intro}
      />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-semibold">Why trade {a.name}?</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {a.why.map((w) => (
                <li key={w} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-semibold">Trading highlights</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {a.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--gradient-brand)] px-5 py-2.5 text-sm font-semibold text-black"
          >
            Start trading {a.symbol}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/markets"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground"
          >
            View all markets
          </Link>
        </div>
      </section>
    </PageShell>
  );
}