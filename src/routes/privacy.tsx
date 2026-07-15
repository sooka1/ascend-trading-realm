import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { useStatic } from "@/lib/i18n";
import { breadcrumbScript } from "@/lib/breadcrumbs";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — HKEX Invest" },
      { name: "description", content: "How HKEX Invest collects, uses and protects your personal information." },
      { property: "og:title", content: "Privacy Policy" },
      { property: "og:description", content: "How HKEX Invest collects, uses and protects your personal information." },
      { property: "og:url", content: "https://www.hkexinvest.com/privacy" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://www.hkexinvest.com/privacy" }],
    scripts: [
      breadcrumbScript([
        { name: "Home", path: "/" },
        { name: "Privacy Policy", path: "/privacy" },
      ]),
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const p = useStatic().privacy;
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