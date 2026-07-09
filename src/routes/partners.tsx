import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Handshake, Users } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { usePage } from "@/lib/i18n";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partners — Introducing Brokers & Institutional | HK Global" },
      { name: "description", content: "White-label, IB and institutional partnerships." },
      { property: "og:title", content: "Partner with HK Global Trading" },
      { property: "og:description", content: "White-label, IB and institutional partnerships." },
    ],
  }),
  component: Partners,
});

function Partners() {
  const p = usePage().partners;
  const icons = [Handshake, Building2, Users];
  return (
    <PageShell>
      <PageHero
        eyebrow={p.hero.eyebrow}
        title={<>{p.hero.titleA} <span className="text-gradient">{p.hero.titleB}</span> {p.hero.titleC}</>}
        subtitle={p.hero.subtitle}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {p.models.map((m, i) => {
            const Icon = icons[i];
            return (
              <div key={m.title} className="glass-strong rounded-2xl p-6">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--gradient-brand-soft)]">
                  <Icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{m.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{m.body}</p>
                <Button asChild className="mt-6 w-full bg-[var(--gradient-brand)] text-white">
                  <Link to="/contact">{m.cta}</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
