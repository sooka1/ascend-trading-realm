import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Frequently asked questions | HK Global Trading" },
      { name: "description", content: "Answers to the most common questions about accounts, deposits, competitions, security and platform features." },
      { property: "og:title", content: "HK Global Trading FAQ" },
      { property: "og:description", content: "Straight answers on accounts, deposits, competitions and more." },
    ],
  }),
  component: FAQ,
});

function FAQ() {
  const groups = [
    {
      title: "Getting started",
      items: [
        { q: "How do I open an account?", a: "Click Open account, complete our 5-minute onboarding, verify your identity, and fund via card, wire or crypto." },
        { q: "What's the minimum deposit?", a: "The Standard tier starts at $50. Pro and Elite have higher minimums for margin and DMA access." },
        { q: "Can I try before funding?", a: "Yes — every user gets a $100k demo account instantly on signup." },
      ],
    },
    {
      title: "Competitions",
      items: [
        { q: "Are competitions free to enter?", a: "Most competitions are free for eligible funded accounts. Paid competitions return 90%+ of entry fees to the prize pool." },
        { q: "How are winners chosen?", a: "By verified P&L on live trading over the competition period, with anti-abuse checks and Sharpe filters." },
        { q: "When are prizes paid?", a: "Prizes are credited to your account within 72 hours of results being finalized." },
      ],
    },
    {
      title: "Security & compliance",
      items: [
        { q: "Is HK Global Trading regulated?", a: "Yes, we hold licenses across multiple leading global jurisdictions. Details are available on the About page." },
        { q: "How are client funds protected?", a: "Client funds are segregated in tier-1 banks and covered by internal insurance and negative-balance protection." },
        { q: "Do you support 2FA?", a: "Yes — TOTP and hardware key 2FA is available on every account." },
      ],
    },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="FAQ"
        title={<>Frequently asked <span className="text-gradient">questions</span></>}
      />
      <section className="mx-auto max-w-3xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
        {groups.map((g) => (
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