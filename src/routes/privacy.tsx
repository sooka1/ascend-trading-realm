import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { useStatic } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — HK Investment Management" },
      { name: "description", content: "How HK Investment Management collects, uses and protects your personal information." },
      { property: "og:title", content: "Privacy Policy" },
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