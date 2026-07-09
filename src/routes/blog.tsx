import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";

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
  const posts = [
    { cat: "Strategy", title: "The 3 microstructure edges that survived 2024", read: "8 min" },
    { cat: "Psychology", title: "Why top competitors journal every trade — and how to start", read: "6 min" },
    { cat: "Community", title: "Inside the King of Wall Street competition final", read: "12 min" },
    { cat: "Risk", title: "Position sizing frameworks used by prop desks", read: "9 min" },
    { cat: "Crypto", title: "Perpetuals vs spot: the true cost of leverage", read: "7 min" },
    { cat: "Macro", title: "How to trade FOMC weeks — 15 years of data", read: "10 min" },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="Blog"
        title={<>Deep dives, <span className="text-gradient">weekly</span></>}
        subtitle="Long-form thinking on trading strategy, community and market structure."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <article key={p.title} className="glass overflow-hidden rounded-2xl">
              <div className="h-40 bg-[var(--gradient-brand-soft)] bg-grid" />
              <div className="p-6">
                <div className="text-xs uppercase tracking-widest text-gold">{p.cat}</div>
                <h3 className="mt-2 font-display text-lg font-semibold">{p.title}</h3>
                <div className="mt-3 text-xs text-muted-foreground">{p.read} read</div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}