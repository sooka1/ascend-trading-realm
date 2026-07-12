import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Brain, Calculator, CalendarClock, Clock, ExternalLink, FileText, GraduationCap, Globe2, LineChart, Network, PlayCircle, Radio, Search, ShieldAlert, Video } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { usePage } from "@/lib/i18n";
import { EDU_VIDEOS, type EduVideo } from "@/lib/education-videos";
import { EDU_BOOKS, type EduBook } from "@/lib/education-books";
import { EDU_WEBINARS, type EduWebinar } from "@/lib/education-webinars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/education")({
  head: () => ({
    meta: [
      { title: "Trading Academy — Courses, videos and webinars | HKEX" },
      { name: "description", content: "Learn to trade like a pro." },
      { property: "og:title", content: "HK Trading Academy" },
      { property: "og:description", content: "Free trading education — courses, webinars, calculators." },
    ],
  }),
  component: Education,
});

function Education() {
  const p = usePage().education;
  const t = p.tracks;
  const tracks = [
    { icon: GraduationCap, title: t.coursesT, body: t.coursesB, stat: t.coursesS },
    { icon: Video, title: t.videosT, body: t.videosB, stat: t.videosS },
    { icon: PlayCircle, title: t.webinarsT, body: t.webinarsB, stat: t.webinarsS },
    { icon: BookOpen, title: t.ebooksT, body: t.ebooksB, stat: t.ebooksS },
    { icon: Calculator, title: t.calcT, body: t.calcB, stat: t.calcS },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow={p.hero.eyebrow}
        title={<>{p.hero.titleA} <span className="text-gradient">{p.hero.titleB}</span></>}
        subtitle={p.hero.subtitle}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map((t) => (
            <div key={t.title} className="glass rounded-2xl p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--gradient-brand-soft)]">
                <t.icon className="h-5 w-5 text-gold" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
              <div className="mt-4 text-xs uppercase tracking-widest text-gold">{t.stat}</div>
            </div>
          ))}
        </div>
        <ForeignCoursesSection />
      </section>
      <VideoLibrarySection />
      <BooksLibrarySection />
      <WebinarsSection />
      <CalculatorsSection />
    </PageShell>
  );
}

function VideoLibrarySection() {
  const [topic, setTopic] = useState<"all" | "strategy" | "psychology">("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const PER = 24;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return EDU_VIDEOS.filter((v) => {
      if (topic !== "all" && v.topic !== topic) return false;
      if (!needle) return true;
      return v.title.toLowerCase().includes(needle) || v.channel.toLowerCase().includes(needle);
    });
  }, [topic, q]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * PER, current * PER);

  const stratCount = EDU_VIDEOS.filter((v) => v.topic === "strategy").length;
  const psychCount = EDU_VIDEOS.filter((v) => v.topic === "psychology").length;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-gold">
            <Video className="h-3.5 w-3.5" /> مكتبة الفيديو
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            {EDU_VIDEOS.length} فيديو <span className="text-gradient">أجنبي</span> في الاستراتيجية وعلم النفس
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            مكتبة مختارة من أشهر قنوات التداول العالمية — {stratCount} فيديو استراتيجية و {psychCount} فيديو علم نفس. كل رابط يفتح نتائج يوتيوب الرسمية للفيديو.
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-full border border-white/10">
          {([
            ["all", "الكل", null],
            ["strategy", "استراتيجية", LineChart],
            ["psychology", "علم النفس", Brain],
          ] as const).map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => { setTopic(k); setPage(1); }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs transition ${
                topic === k ? "bg-gold text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث عن عنوان أو قناة…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {filtered.length} نتيجة
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {slice.map((v) => (
          <VideoCard key={v.id} v={v} />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>
          السابق
        </Button>
        <span className="text-xs text-muted-foreground">
          صفحة {current} / {pages}
        </span>
        <Button variant="outline" size="sm" disabled={current >= pages} onClick={() => setPage(current + 1)}>
          التالي
        </Button>
      </div>
    </section>
  );
}

function VideoCard({ v }: { v: EduVideo }) {
  const topicStyle =
    v.topic === "strategy"
      ? "border-bull/40 bg-bull/10 text-bull"
      : "border-violet-400/40 bg-violet-400/10 text-violet-200";
  const TopicIcon = v.topic === "strategy" ? LineChart : Brain;
  return (
    <a
      href={v.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.preventDefault();
        window.open(v.url, "_blank", "noopener,noreferrer") ||
          (window.top ? (window.top.location.href = v.url) : (window.location.href = v.url));
      }}
      className="glass group flex flex-col rounded-2xl p-4 transition hover:border-gold/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${topicStyle}`}>
          <TopicIcon className="h-3 w-3" />
          {v.topic === "strategy" ? "استراتيجية" : "علم النفس"}
        </span>
        <span className="text-[10px] text-muted-foreground">{v.minutes} د</span>
      </div>
      <h3 className="mt-3 line-clamp-2 font-display text-sm font-semibold group-hover:text-gold">
        {v.title}
      </h3>
      <div className="mt-auto flex items-center justify-between pt-3">
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{v.channel}</span>
        <span className="inline-flex items-center gap-1 text-[11px] text-gold/90 group-hover:text-gold">
          مشاهدة <ExternalLink className="h-3 w-3" />
        </span>
      </div>
    </a>
  );
}

function BooksLibrarySection() {
  const [topic, setTopic] = useState<"all" | "market-structure" | "risk">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return EDU_BOOKS.filter((b) => {
      if (topic !== "all" && b.topic !== topic) return false;
      if (!needle) return true;
      return b.title.toLowerCase().includes(needle) || b.author.toLowerCase().includes(needle);
    });
  }, [topic, q]);

  const msCount = EDU_BOOKS.filter((b) => b.topic === "market-structure").length;
  const rkCount = EDU_BOOKS.filter((b) => b.topic === "risk").length;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-gold">
            <BookOpen className="h-3.5 w-3.5" /> كتب وملفات
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            كتب و PDF عن <span className="text-gradient">بنية السوق والمخاطر</span>
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            مرجع موسّع — {msCount} حول بنية السوق و {rkCount} حول إدارة المخاطر. الروابط تفتح مصادر رسمية (SEC, BIS, IMF, CFTC…) أو نتائج البحث للحصول على أحدث PDF.
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-full border border-white/10">
          {([
            ["all", "الكل", null],
            ["market-structure", "بنية السوق", Network],
            ["risk", "المخاطر", ShieldAlert],
          ] as const).map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => setTopic(k)}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs transition ${
                topic === k ? "bg-gold text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث عن كتاب أو مؤلف…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-xs text-muted-foreground">{filtered.length} عنوان</div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((b) => (
          <BookCard key={b.id} b={b} />
        ))}
      </div>
    </section>
  );
}

function BookCard({ b }: { b: EduBook }) {
  const topicStyle =
    b.topic === "market-structure"
      ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
      : "border-bear/40 bg-bear/10 text-bear";
  const TopicIcon = b.topic === "market-structure" ? Network : ShieldAlert;
  const FormatIcon = b.format === "PDF" ? FileText : BookOpen;
  return (
    <a
      href={b.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.preventDefault();
        window.open(b.url, "_blank", "noopener,noreferrer") ||
          (window.top ? (window.top.location.href = b.url) : (window.location.href = b.url));
      }}
      className="glass group flex flex-col rounded-2xl p-4 transition hover:border-gold/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${topicStyle}`}>
          <TopicIcon className="h-3 w-3" />
          {b.topic === "market-structure" ? "بنية السوق" : "المخاطر"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          <FormatIcon className="h-3 w-3" />
          {b.format}
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 font-display text-sm font-semibold group-hover:text-gold">
        {b.title}
      </h3>
      <div className="mt-auto flex items-center justify-between pt-3">
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{b.author}</span>
        <span className="inline-flex items-center gap-1 text-[11px] text-gold/90 group-hover:text-gold">
          فتح <ExternalLink className="h-3 w-3" />
        </span>
      </div>
    </a>
  );
}

function WebinarsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-gold">
            <Radio className="h-3.5 w-3.5" /> ندوات مباشرة
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            ندوات <span className="text-gradient">تداول مباشرة</span> أسبوعياً
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            جلسات حيّة من كبرى المنصات العالمية — تحليل، تعليم، وجولات على المنصة. كل بطاقة تفتح صفحة الجدول الرسمية لدى المزوّد.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {EDU_WEBINARS.map((w) => (
          <WebinarCard key={w.id} w={w} />
        ))}
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground/70">
        الأوقات تقريبية بتوقيت جرينتش وقد تتغيّر — تحقّق من الصفحة الرسمية قبل الجلسة.
      </p>
    </section>
  );
}

function WebinarCard({ w }: { w: EduWebinar }) {
  return (
    <a
      href={w.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.preventDefault();
        window.open(w.url, "_blank", "noopener,noreferrer") ||
          (window.top ? (window.top.location.href = w.url) : (window.location.href = w.url));
      }}
      className="glass group flex flex-col rounded-2xl p-5 transition hover:border-gold/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-bull/40 bg-bull/10 px-2 py-0.5 text-[10px] text-bull">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bull" /> مباشر
        </span>
        <span className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {w.language}
        </span>
      </div>
      <h3 className="mt-3 font-display text-base font-semibold group-hover:text-gold">{w.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{w.topic}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5 text-gold" /> {w.cadence}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-gold" /> {w.time}
        </span>
        <span className="col-span-2 truncate">{w.day}</span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{w.host}</span>
        <span className="inline-flex items-center gap-1 text-[11px] text-gold/90 group-hover:text-gold">
          الانضمام <ExternalLink className="h-3 w-3" />
        </span>
      </div>
    </a>
  );
}

type ForeignCourse = {
  provider: string;
  title: string;
  desc: string;
  level: "مبتدئ" | "متوسط" | "متقدم";
  language: "EN" | "AR";
  url: string;
};

const FOREIGN_COURSES: ForeignCourse[] = [
  {
    provider: "BabyPips",
    title: "School of Pipsology",
    desc: "منهج فوركس مجاني كامل من الصفر حتى الاحتراف — الأشهر عالمياً للمبتدئين.",
    level: "مبتدئ",
    language: "EN",
    url: "https://www.babypips.com/learn/forex",
  },
  {
    provider: "Investopedia Academy",
    title: "Become a Day Trader",
    desc: "دورة احترافية في تداول اليوم على الأسهم والفوركس مع استراتيجيات مؤسسية.",
    level: "متوسط",
    language: "EN",
    url: "https://academy.investopedia.com/products/become-a-day-trader",
  },
  {
    provider: "IG Academy",
    title: "Trading Courses",
    desc: "مسار متكامل من IG يغطي أساسيات الأسواق والتحليل الفني وإدارة المخاطر.",
    level: "مبتدئ",
    language: "EN",
    url: "https://www.ig.com/en/learn-to-trade/ig-academy",
  },
  {
    provider: "Coursera — Yale",
    title: "Financial Markets by Robert Shiller",
    desc: "دورة أكاديمية من جامعة ييل حول الأسواق المالية العالمية وأدواتها.",
    level: "متقدم",
    language: "EN",
    url: "https://www.coursera.org/learn/financial-markets-global",
  },
  {
    provider: "Udemy",
    title: "The Complete Foundation FOREX Trading Course",
    desc: "دورة فوركس شاملة الأكثر مبيعاً على Udemy — تحليل فني، شارتات، وخطط دخول.",
    level: "متوسط",
    language: "EN",
    url: "https://www.udemy.com/course/forex-trading/",
  },
  {
    provider: "CME Group",
    title: "Futures & Options Education",
    desc: "مواد تعليمية رسمية من بورصة شيكاغو التجارية حول العقود الآجلة والخيارات.",
    level: "متقدم",
    language: "EN",
    url: "https://www.cmegroup.com/education.html",
  },
  {
    provider: "TradingView",
    title: "Chart School & Ideas",
    desc: "مكتبة تعليمية حول التحليل الفني والمؤشرات وأنماط الشموع مع أمثلة حية.",
    level: "مبتدئ",
    language: "EN",
    url: "https://www.tradingview.com/education/",
  },
  {
    provider: "Bloomberg Market Concepts",
    title: "BMC Certificate",
    desc: "شهادة معتمدة من Bloomberg في مفاهيم الأسواق: العملات، السندات، الأسهم، السلع.",
    level: "متقدم",
    language: "EN",
    url: "https://portal.bloombergforeducation.com/bmc",
  },
];

const LEVEL_STYLE: Record<ForeignCourse["level"], string> = {
  مبتدئ: "border-bull/40 bg-bull/10 text-bull",
  متوسط: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  متقدم: "border-bear/40 bg-bear/10 text-bear",
};

function ForeignCoursesSection() {
  return (
    <div className="mt-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-gold">
            <Globe2 className="h-3.5 w-3.5" /> دورات عالمية
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            دورات تداول أجنبية <span className="text-gradient">مختارة</span>
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            مجموعة من أفضل المصادر الأجنبية لتعلّم التداول من جهات موثوقة عالمياً — كلها روابط مباشرة للمزوّد الأصلي.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {FOREIGN_COURSES.map((c) => (
          <a
            key={c.provider + c.title}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              // Preview iframes often block target=_blank; ensure the link opens.
              e.preventDefault();
              window.open(c.url, "_blank", "noopener,noreferrer") ||
                (window.top ? (window.top.location.href = c.url) : (window.location.href = c.url));
            }}
            className="glass group flex flex-col rounded-2xl p-5 transition hover:border-gold/40"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{c.provider}</span>
              <span className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {c.language}
              </span>
            </div>
            <h3 className="mt-3 font-display text-base font-semibold group-hover:text-gold">{c.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{c.desc}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className={`rounded-full border px-2 py-0.5 text-[11px] ${LEVEL_STYLE[c.level]}`}>{c.level}</span>
              <span className="inline-flex items-center gap-1 text-xs text-gold/90 group-hover:text-gold">
                فتح الدورة <ExternalLink className="h-3 w-3" />
              </span>
            </div>
          </a>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground/70">
        الروابط تنقلك إلى المصادر الأجنبية الأصلية؛ HKEX غير مسؤول عن محتوى الجهات الخارجية.
      </p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Calculators: Margin, Pip Value, Swap
// -----------------------------------------------------------------------------

const FX_PAIRS: { symbol: string; price: number; contract: number; pipSize: number; quote: string; swapLong: number; swapShort: number }[] = [
  { symbol: "EUR/USD", price: 1.0850, contract: 100000, pipSize: 0.0001, quote: "USD", swapLong: -0.75, swapShort: 0.25 },
  { symbol: "GBP/USD", price: 1.2700, contract: 100000, pipSize: 0.0001, quote: "USD", swapLong: -0.90, swapShort: 0.30 },
  { symbol: "USD/JPY", price: 155.20, contract: 100000, pipSize: 0.01,   quote: "JPY", swapLong: 1.20, swapShort: -2.10 },
  { symbol: "AUD/USD", price: 0.6600, contract: 100000, pipSize: 0.0001, quote: "USD", swapLong: -0.55, swapShort: 0.10 },
  { symbol: "USD/CAD", price: 1.3650, contract: 100000, pipSize: 0.0001, quote: "CAD", swapLong: 0.40, swapShort: -1.30 },
  { symbol: "XAU/USD", price: 2380.0, contract: 100,    pipSize: 0.01,   quote: "USD", swapLong: -3.50, swapShort: 1.20 },
];

function num(v: string, d = 0): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-white/5 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold text-gold">{value}</span>
    </div>
  );
}

function MarginCalc() {
  const [sym, setSym] = useState(FX_PAIRS[0].symbol);
  const [lots, setLots] = useState("1");
  const [leverage, setLeverage] = useState("100");
  const p = FX_PAIRS.find((x) => x.symbol === sym)!;
  const notional = num(lots) * p.contract * p.price;
  const margin = leverage ? notional / num(leverage, 1) : 0;
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="font-display text-base font-semibold">حاسبة الهامش</h3>
      <p className="mt-1 text-xs text-muted-foreground">احسب الهامش المطلوب لفتح صفقة.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Field label="الأداة">
          <select value={sym} onChange={(e) => setSym(e.target.value)} className="w-full rounded-md border border-white/10 bg-transparent p-2 text-sm">
            {FX_PAIRS.map((x) => <option key={x.symbol} value={x.symbol}>{x.symbol}</option>)}
          </select>
        </Field>
        <Field label="الحجم (لوت)"><Input value={lots} onChange={(e) => setLots(e.target.value)} inputMode="decimal" /></Field>
        <Field label="الرافعة (1:X)"><Input value={leverage} onChange={(e) => setLeverage(e.target.value)} inputMode="numeric" /></Field>
      </div>
      <div className="mt-4">
        <ResultRow label="القيمة الاسمية" value={`${notional.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${p.quote}`} />
        <ResultRow label="الهامش المطلوب" value={`${margin.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${p.quote}`} />
      </div>
    </div>
  );
}

function PipCalc() {
  const [sym, setSym] = useState(FX_PAIRS[0].symbol);
  const [lots, setLots] = useState("1");
  const p = FX_PAIRS.find((x) => x.symbol === sym)!;
  // Pip value in quote currency
  const pipQuote = p.pipSize * p.contract * num(lots);
  // Convert to USD (approx): if quote is USD, same; else divide by pair price when USD is base (e.g. USD/JPY)
  const pipUsd = p.quote === "USD" ? pipQuote : pipQuote / p.price;
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="font-display text-base font-semibold">حاسبة قيمة النقطة</h3>
      <p className="mt-1 text-xs text-muted-foreground">قيمة النقطة (Pip) بحسب حجم الصفقة.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="الأداة">
          <select value={sym} onChange={(e) => setSym(e.target.value)} className="w-full rounded-md border border-white/10 bg-transparent p-2 text-sm">
            {FX_PAIRS.map((x) => <option key={x.symbol} value={x.symbol}>{x.symbol}</option>)}
          </select>
        </Field>
        <Field label="الحجم (لوت)"><Input value={lots} onChange={(e) => setLots(e.target.value)} inputMode="decimal" /></Field>
      </div>
      <div className="mt-4">
        <ResultRow label={`قيمة النقطة (${p.quote})`} value={`${pipQuote.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${p.quote}`} />
        <ResultRow label="قيمة النقطة (USD)" value={`$${pipUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
      </div>
    </div>
  );
}

function SwapCalc() {
  const [sym, setSym] = useState(FX_PAIRS[0].symbol);
  const [lots, setLots] = useState("1");
  const [side, setSide] = useState<"long" | "short">("long");
  const [nights, setNights] = useState("1");
  const p = FX_PAIRS.find((x) => x.symbol === sym)!;
  const rate = side === "long" ? p.swapLong : p.swapShort;
  const pipQuote = p.pipSize * p.contract * num(lots);
  const pipUsd = p.quote === "USD" ? pipQuote : pipQuote / p.price;
  const daily = rate * pipUsd; // points × pip value ≈ USD/day
  const total = daily * num(nights);
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="font-display text-base font-semibold">حاسبة السواب (المبيت)</h3>
      <p className="mt-1 text-xs text-muted-foreground">تقدير رسوم/عوائد التبييت لكل ليلة.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="الأداة">
          <select value={sym} onChange={(e) => setSym(e.target.value)} className="w-full rounded-md border border-white/10 bg-transparent p-2 text-sm">
            {FX_PAIRS.map((x) => <option key={x.symbol} value={x.symbol}>{x.symbol}</option>)}
          </select>
        </Field>
        <Field label="الاتجاه">
          <select value={side} onChange={(e) => setSide(e.target.value as "long" | "short")} className="w-full rounded-md border border-white/10 bg-transparent p-2 text-sm">
            <option value="long">شراء (Long)</option>
            <option value="short">بيع (Short)</option>
          </select>
        </Field>
        <Field label="الحجم (لوت)"><Input value={lots} onChange={(e) => setLots(e.target.value)} inputMode="decimal" /></Field>
        <Field label="عدد الليالي"><Input value={nights} onChange={(e) => setNights(e.target.value)} inputMode="numeric" /></Field>
      </div>
      <div className="mt-4">
        <ResultRow label="نقاط السواب / ليلة" value={rate.toFixed(2)} />
        <ResultRow label="سواب يومي (USD)" value={`${daily >= 0 ? "+" : ""}${daily.toFixed(2)}`} />
        <ResultRow label="إجمالي السواب (USD)" value={`${total >= 0 ? "+" : ""}${total.toFixed(2)}`} />
      </div>
    </div>
  );
}

function CalculatorsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">حاسبات التداول</h2>
          <p className="mt-1 text-sm text-muted-foreground">الهامش، قيمة النقطة، والسواب — تقديرية بأسعار توضيحية.</p>
        </div>
        <Calculator className="h-6 w-6 text-gold" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <MarginCalc />
        <PipCalc />
        <SwapCalc />
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground/70">
        القيم إرشادية فقط وتعتمد على أسعار سوق توضيحية؛ راجع منصة التداول لأرقام حقيقية.
      </p>
    </section>
  );
}
