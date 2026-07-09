import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { usePage } from "@/lib/i18n";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "Market News — Live analysis and insights | HK Global Trading" },
      { name: "description", content: "Real-time market news." },
      { property: "og:title", content: "HK Global Trading — Market News" },
      { property: "og:description", content: "Live market analysis." },
    ],
  }),
  component: News,
});

function News() {
  const p = usePage().news;
  return (
    <PageShell>
      <PageHero
        eyebrow={p.hero.eyebrow}
        title={<>{p.hero.titleA} <span className="text-gradient">{p.hero.titleB}</span></>}
        subtitle={p.hero.subtitle}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {p.items.map((n) => (
            <article key={n.title} className="glass rounded-2xl p-6 transition hover:border-white/20">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
                <span>{n.tag}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{n.time} {p.ago}</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold">{n.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{n.body}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
