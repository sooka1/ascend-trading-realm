import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Newspaper, Radio, RefreshCw, ExternalLink, Globe2 } from "lucide-react";
import { getMarketNews, type NewsItem } from "@/lib/news.functions";
import { breadcrumbScript } from "@/lib/breadcrumbs";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "الأخبار العالمية — أسواق واستثمار وبورصات | HKEX Invest" },
      { name: "description", content: "بث لحظي للأخبار السياسية والاقتصادية العالمية المؤثرة على الاستثمار والتداول والبورصات، من مصادر غربية وصينية." },
      { property: "og:title", content: "الأخبار العالمية — الاستثمار والبورصات" },
      { property: "og:description", content: "بث لحظي للأخبار المؤثرة على الأسواق من مصادر غربية وصينية." },
      { property: "og:url", content: "https://www.hkexinvest.com/risk" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://www.hkexinvest.com/risk" }],
    scripts: [
      breadcrumbScript([
        { name: "Home", path: "/" },
        { name: "News", path: "/risk" },
      ]),
    ],
  }),
  component: NewsPage,
});

type Filter = "all" | "west" | "china" | "global";

const REGION_LABEL: Record<NewsItem["region"], string> = {
  west: "غربية",
  china: "صينية",
  global: "عالمية",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "";
  const s = Math.max(0, Math.floor(diff / 1000));
  if (s < 60) return `${s} ث`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} س`;
  const d = Math.floor(h / 24);
  return `${d} ي`;
}

function NewsPage() {
  const fetchNews = useServerFn(getMarketNews);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const { data, isFetching, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["market-news"],
    queryFn: () => fetchNews(),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });

  const items = useMemo(() => {
    let list = data?.items ?? [];
    if (filter !== "all") list = list.filter((i) => i.region === filter);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(s) ||
          i.description.toLowerCase().includes(s) ||
          i.source.toLowerCase().includes(s),
      );
    }
    return list;
  }, [data, filter, q]);

  const top = items[0];
  const rest = items.slice(1);

  return (
    <PageShell>
      <PageHero
        eyebrow="بث لحظي"
        title={<>الأخبار السياسية والاقتصادية للاستثمار والبورصات</>}
        subtitle="تدفق مباشر للأخبار المؤثرة على الأسواق العالمية من مصادر غربية وصينية موثوقة، يتحدث تلقائيًا كل دقيقة."
      />

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <Radio className="h-3 w-3" /> بث مباشر
          </div>
          <span className="text-xs text-muted-foreground">
            آخر تحديث:{" "}
            {dataUpdatedAt
              ? new Date(dataUpdatedAt).toLocaleTimeString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : "—"}
          </span>
          <button
            onClick={() => refetch()}
            className="ms-auto inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs text-gold transition hover:bg-gold/20 disabled:opacity-60"
            disabled={isFetching}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> تحديث
          </button>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          {(["all", "west", "china", "global"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                filter === f
                  ? "border-gold bg-gold/20 text-gold"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {f === "all"
                ? "الكل"
                : f === "west"
                ? "غربية"
                : f === "china"
                ? "صينية"
                : "عالمية"}
            </button>
          ))}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث في العناوين…"
            className="ms-auto w-full max-w-xs rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm outline-none focus:border-gold/60"
          />
        </div>

        {!data && isFetching && (
          <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
            جاري تحميل الأخبار…
          </div>
        )}

        {data && items.length === 0 && (
          <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
            لا توجد أخبار مطابقة الآن.
          </div>
        )}

        {top && (
          <a
            href={top.link}
            target="_blank"
            rel="noopener noreferrer"
            className="glass group mb-6 block rounded-2xl p-6 transition hover:border-gold/40"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-gold">
                <Newspaper className="h-3 w-3" /> {top.source}
              </span>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-muted-foreground">
                {REGION_LABEL[top.region]}
              </span>
              <span className="text-muted-foreground">{timeAgo(top.pubDate)}</span>
            </div>
            <h2 className="font-display text-2xl font-semibold leading-snug group-hover:text-gold">
              {top.title}
            </h2>
            {top.description && (
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{top.description}</p>
            )}
            <div className="mt-4 inline-flex items-center gap-1 text-xs text-gold">
              اقرأ المصدر <ExternalLink className="h-3 w-3" />
            </div>
          </a>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((n) => (
            <a
              key={n.link}
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className="glass group flex flex-col rounded-2xl p-5 transition hover:border-gold/40"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-gold">
                  <Globe2 className="h-3 w-3" /> {n.source}
                </span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-muted-foreground">
                  {REGION_LABEL[n.region]}
                </span>
                <span className="text-muted-foreground">{timeAgo(n.pubDate)}</span>
              </div>
              <h3 className="font-display text-base font-semibold leading-snug group-hover:text-gold">
                {n.title}
              </h3>
              {n.description && (
                <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{n.description}</p>
              )}
            </a>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          الأخبار مجمَّعة من مصادر عامة (CNBC, BBC, Yahoo Finance, Reuters, Bloomberg, MarketWatch, Investing.com, SCMP, China Daily, Xinhua, Caixin وGoogle News). جميع الحقوق محفوظة لأصحابها.
        </p>
      </section>
    </PageShell>
  );
}