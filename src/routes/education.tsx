import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Brain, Calculator, ExternalLink, GraduationCap, Globe2, LineChart, PlayCircle, Search, Video } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { usePage } from "@/lib/i18n";
import { EDU_VIDEOS, type EduVideo } from "@/lib/education-videos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/education")({
  head: () => ({
    meta: [
      { title: "Trading Academy — Courses, videos and webinars | HK Global" },
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
        الروابط تنقلك إلى المصادر الأجنبية الأصلية؛ HK Global غير مسؤول عن محتوى الجهات الخارجية.
      </p>
    </div>
  );
}
