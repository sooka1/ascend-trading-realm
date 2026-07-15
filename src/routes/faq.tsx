import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePage, getStaticPage } from "@/lib/i18n";

export const Route = createFileRoute("/faq")({
  head: () => {
    const faq = (() => {
      try {
        return getStaticPage?.("en")?.faq ?? null;
      } catch {
        return null;
      }
    })();
    const items = faq?.groups?.flatMap((g: any) => g.items) ?? [];
    return {
      meta: [
        { title: "FAQ — Frequently asked questions | HKEX Invest" },
        { name: "description", content: "Answers to the most common questions about HKEX Invest — account, deposits, security and platform." },
        { property: "og:title", content: "HKEX Invest — FAQ" },
        { property: "og:description", content: "Straight answers." },
        { property: "og:url", content: "https://www.hkexinvest.com/faq" },
      ],
      links: [{ rel: "canonical", href: "https://www.hkexinvest.com/faq" }],
      scripts: items.length
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: items.map((it: any) => ({
                  "@type": "Question",
                  name: it.q,
                  acceptedAnswer: { "@type": "Answer", text: it.a },
                })),
              }),
            },
          ]
        : [],
    };
  },
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
