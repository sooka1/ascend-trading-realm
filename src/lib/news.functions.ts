import { createServerFn } from "@tanstack/react-start";

export type NewsItem = {
  source: string;
  region: "west" | "china" | "global";
  title: string;
  link: string;
  pubDate: string; // ISO
  description: string;
};

const FEEDS: { source: string; region: NewsItem["region"]; url: string }[] = [
  // Western sources
  { source: "CNBC Markets", region: "west", url: "https://www.cnbc.com/id/15839069/device/rss/rss.html" },
  { source: "CNBC Economy", region: "west", url: "https://www.cnbc.com/id/20910258/device/rss/rss.html" },
  { source: "Yahoo Finance", region: "west", url: "https://finance.yahoo.com/news/rssindex" },
  { source: "BBC Business", region: "west", url: "https://feeds.bbci.co.uk/news/business/rss.xml" },
  { source: "Investing.com", region: "west", url: "https://www.investing.com/rss/news.rss" },
  { source: "MarketWatch", region: "west", url: "https://feeds.content.dowjones.io/public/rss/mw_topstories" },
  { source: "Reuters (Google News)", region: "west", url: "https://news.google.com/rss/search?q=when:1d+site:reuters.com+markets+OR+stocks+OR+economy&hl=en-US&gl=US&ceid=US:en" },
  { source: "Bloomberg (Google News)", region: "west", url: "https://news.google.com/rss/search?q=when:1d+site:bloomberg.com+markets&hl=en-US&gl=US&ceid=US:en" },
  // Chinese sources
  { source: "SCMP Business", region: "china", url: "https://www.scmp.com/rss/92/feed" },
  { source: "China Daily Business", region: "china", url: "https://www.chinadaily.com.cn/rss/bizchina_rss.xml" },
  { source: "Xinhua Business (Google News)", region: "china", url: "https://news.google.com/rss/search?q=when:1d+site:xinhuanet.com+economy+OR+markets&hl=en-US&gl=US&ceid=US:en" },
  { source: "Caixin (Google News)", region: "china", url: "https://news.google.com/rss/search?q=when:1d+site:caixinglobal.com&hl=en-US&gl=US&ceid=US:en" },
  { source: "أخبار الصين (Google News AR)", region: "china", url: "https://news.google.com/rss/search?q=when:1d+الصين+اقتصاد+OR+بورصة&hl=ar&gl=SA&ceid=SA:ar" },
  // Arabic global
  { source: "أخبار الأسواق (Google News AR)", region: "global", url: "https://news.google.com/rss/search?q=when:1d+الأسواق+OR+البورصة+OR+الاستثمار&hl=ar&gl=SA&ceid=SA:ar" },
];

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function stripHtml(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, "")).trim();
}

function pick(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? decodeEntities(m[1]).trim() : "";
}

function parseRss(xml: string): { title: string; link: string; pubDate: string; description: string }[] {
  const out: { title: string; link: string; pubDate: string; description: string }[] = [];
  // RSS 2.0 <item>
  const itemRe = /<item[\s>][\s\S]*?<\/item>/gi;
  const items = xml.match(itemRe);
  if (items && items.length) {
    for (const it of items) {
      const title = stripHtml(pick(it, "title"));
      let link = pick(it, "link");
      if (!link) {
        const m = it.match(/<link[^>]*href=["']([^"']+)["']/i);
        if (m) link = m[1];
      }
      const pubDate = pick(it, "pubDate") || pick(it, "dc:date") || pick(it, "published");
      const description = stripHtml(pick(it, "description") || pick(it, "summary"));
      if (title && link) out.push({ title, link, pubDate, description });
    }
    return out;
  }
  // Atom <entry>
  const entryRe = /<entry[\s>][\s\S]*?<\/entry>/gi;
  const entries = xml.match(entryRe) || [];
  for (const it of entries) {
    const title = stripHtml(pick(it, "title"));
    let link = "";
    const m = it.match(/<link[^>]*href=["']([^"']+)["']/i);
    if (m) link = m[1];
    const pubDate = pick(it, "updated") || pick(it, "published");
    const description = stripHtml(pick(it, "summary") || pick(it, "content"));
    if (title && link) out.push({ title, link, pubDate, description });
  }
  return out;
}

async function fetchFeed(feed: (typeof FEEDS)[number]): Promise<NewsItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; HKEX-News/1.0)",
        accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.5",
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRss(xml).slice(0, 12).map((i) => ({
      source: feed.source,
      region: feed.region,
      title: i.title,
      link: i.link,
      pubDate: i.pubDate ? new Date(i.pubDate).toISOString() : new Date().toISOString(),
      description: i.description.slice(0, 320),
    }));
  } catch {
    return [];
  }
}

export const getMarketNews = createServerFn({ method: "GET" }).handler(async () => {
  const results = await Promise.all(FEEDS.map(fetchFeed));
  const all = results.flat();
  all.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  // Dedupe by title
  const seen = new Set<string>();
  const deduped: NewsItem[] = [];
  for (const it of all) {
    const key = it.title.toLowerCase().slice(0, 90);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(it);
  }
  return { items: deduped.slice(0, 120), fetchedAt: new Date().toISOString() };
});