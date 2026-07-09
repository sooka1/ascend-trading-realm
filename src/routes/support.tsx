import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy, MessageCircle, Phone, Mail } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { usePage } from "@/lib/i18n";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support Center — 24/7 client care | HK Global Trading" },
      { name: "description", content: "24/7 support." },
      { property: "og:title", content: "HK Global Support Center" },
      { property: "og:description", content: "Human, multilingual support 24/7." },
    ],
  }),
  component: Support,
});

function Support() {
  const p = usePage().support;
  const icons = [MessageCircle, Phone, Mail, LifeBuoy];
  return (
    <PageShell>
      <PageHero
        eyebrow={p.hero.eyebrow}
        title={<>{p.hero.titleA} <span className="text-gradient">{p.hero.titleB}</span></>}
        subtitle={p.hero.subtitle}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {p.channels.map((c, i) => {
            const Icon = icons[i];
            return (
              <div key={c.title} className="glass rounded-2xl p-6">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--gradient-brand-soft)]">
                  <Icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
                <Button asChild variant="ghost" className="mt-4 -mx-3">
                  <Link to="/contact">{c.cta} →</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
