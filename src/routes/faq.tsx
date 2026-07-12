import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePage } from "@/lib/i18n";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Frequently asked questions | HKEX" },
      { name: "description", content: "Answers to the most common questions." },
      { property: "og:title", content: "HKEX FAQ" },
      { property: "og:description", content: "Straight answers." },
    ],
  }),
  component: FAQ,
});

function FAQ() {
  const p = usePage().faq;
  return (
    <PageShell>
      <PageHero
        eyebrow={p.hero.eyebrow}
        title={<>{p.hero.titleA} <span className="text-gradient">{p.hero.titleB}</span></>}
      />
      <section className="mx-auto max-w-3xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
        {p.groups.map((g) => (
          <div key={g.title}>
            <h2 className="font-display text-2xl font-bold">{g.title}</h2>
            <Accordion type="single" collapsible className="mt-4">
              {g.items.map((it, i) => (
                <AccordionItem key={i} value={`${g.title}-${i}`} className="border-white/10">
                  <AccordionTrigger className="text-left">{it.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{it.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </section>
    </PageShell>
  );
}
