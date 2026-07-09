import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { usePage } from "@/lib/i18n";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Trading education and stories | HK Global Trading" },
      { name: "description", content: "Long-form articles on trading psychology, strategy, market structure and the HK community." },
      { property: "og:title", content: "HK Global Trading Blog" },
      { property: "og:description", content: "Long-form trading insight from our editorial team." },
    ],
  }),
  component: Blog,
});

function Blog() {
  const p = usePage().blog;
  const cats = [p.cats.strategy, p.cats.psychology, p.cats.community, p.cats.risk, p.cats.crypto, p.cats.macro];
  const reads = ["8 min","6 min","12 min","9 min","7 min","10 min"];
  return (
    <PageShell>
      <PageHero
        eyebrow={p.hero.eyebrow}
        title={<>{p.hero.titleA} <span className="text-gradient">{p.hero.titleB}</span></>}
        subtitle={p.hero.subtitle}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {p.posts.map((title, i) => (
            <article key={title} className="glass overflow-hidden rounded-2xl">
              <div className="h-40 bg-[var(--gradient-brand-soft)] bg-grid" />
              <div className="p-6">
                <div className="text-xs uppercase tracking-widest text-gold">{cats[i]}</div>
                <h3 className="mt-2 font-display text-lg font-semibold">{title}</h3>
                <div className="mt-3 text-xs text-muted-foreground">{reads[i]} {p.read}</div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
