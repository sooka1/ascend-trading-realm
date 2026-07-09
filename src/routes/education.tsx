import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Calculator, GraduationCap, PlayCircle, Video } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";

export const Route = createFileRoute("/education")({
  head: () => ({
    meta: [
      { title: "Trading Academy — Courses, videos and webinars | HK Global" },
      { name: "description", content: "Learn to trade like a pro. Courses, video library, live webinars, e-books and pro calculators — free for HK clients." },
      { property: "og:title", content: "HK Trading Academy" },
      { property: "og:description", content: "Free trading education — courses, webinars, calculators." },
    ],
  }),
  component: Education,
});

function Education() {
  const tracks = [
    { icon: GraduationCap, title: "Trading Courses", body: "12 full curriculums across beginner, intermediate and pro levels.", stat: "220+ lessons" },
    { icon: Video, title: "Video Library", body: "On-demand videos across strategy, psychology and technicals.", stat: "480 videos" },
    { icon: PlayCircle, title: "Live Webinars", body: "Weekly sessions with prop-desk traders and quant researchers.", stat: "3× per week" },
    { icon: BookOpen, title: "E-books & Guides", body: "Deep-dive PDFs on market structure, risk and edge design.", stat: "40+ e-books" },
    { icon: Calculator, title: "Trading Calculators", body: "Position sizing, margin, pip value, swap and profit calculators.", stat: "12 tools" },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="Education"
        title={<>The <span className="text-gradient">HK Academy</span></>}
        subtitle="Everything you need to sharpen your edge — free for HK clients."
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
      </section>
    </PageShell>
  );
}