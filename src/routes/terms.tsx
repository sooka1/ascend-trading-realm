import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { useStatic } from "@/lib/i18n";
import { breadcrumbScript } from "@/lib/breadcrumbs";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — HKEX Invest" },
      { name: "description", content: "Terms of service governing use of HKEX Invest's website and platform." },
      { property: "og:title", content: "Terms of Service" },
      { property: "og:description", content: "Terms of service governing use of HKEX Invest's website and platform." },
      { property: "og:url", content: "https://www.hkexinvest.com/terms" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://www.hkexinvest.com/terms" }],
    scripts: [
      breadcrumbScript([
        { name: "Home", path: "/" },
        { name: "Terms of Service", path: "/terms" },
      ]),
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const p = useStatic().terms;
  return (
    <PageShell>
      <PageHero
        eyebrow={p.eyebrow}
        title={<>{p.title}</>}
        subtitle={p.subtitle}
      />
      <article className="mx-auto max-w-3xl space-y-8 px-4 py-16 text-sm leading-relaxed text-muted-foreground sm:px-6 lg:px-8">
        {p.sections.map((s) => (
          <Section key={s.t} title={s.t}>{s.b}</Section>
        ))}
      </article>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mt-3">{children}</p>
    </section>
  );
}