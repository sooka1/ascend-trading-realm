import { PageShell, PageHero } from "@/components/page-shell";

export type LegalSection = { t: string; b: string | React.ReactNode };

export function LegalDoc({
  eyebrow,
  title,
  subtitle,
  sections,
  footnote,
  dir = "rtl",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  sections: LegalSection[];
  footnote?: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <PageShell>
      <PageHero eyebrow={eyebrow} title={<>{title}</>} subtitle={subtitle} />
      <article
        dir={dir}
        className="mx-auto max-w-3xl space-y-8 px-4 py-16 text-sm leading-relaxed text-muted-foreground sm:px-6 lg:px-8"
      >
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {s.t}
            </h2>
            <div className="mt-3 whitespace-pre-line">{s.b}</div>
          </section>
        ))}
        {footnote && (
          <p className="border-t border-white/10 pt-6 text-xs text-muted-foreground/80">
            {footnote}
          </p>
        )}
      </article>
    </PageShell>
  );
}