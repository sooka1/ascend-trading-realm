import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { useStatic } from "@/lib/i18n";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Legal & Compliance — HKEX Invest" },
      { name: "description", content: "Legal and compliance information for HKEX Invest, including risk disclosures and regulatory approach." },
      { property: "og:title", content: "Legal & Compliance" },
    ],
  }),
  component: LegalPage,
});

function LegalPage() {
  const p = useStatic().legal;
  return (
    <PageShell>
      <PageHero
        eyebrow={p.eyebrow}
        title={<>{p.title}</>}
        subtitle={p.subtitle}
      />
      <article className="prose-invert mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          {p.sections.map((s) => (
            <Section key={s.t} title={s.t}>{s.b}</Section>
          ))}
          <p className="text-xs">{p.footnote}</p>
        </div>
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