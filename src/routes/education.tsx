import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Calculator, GraduationCap, PlayCircle, Video } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { usePage } from "@/lib/i18n";

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
      </section>
    </PageShell>
  );
}
