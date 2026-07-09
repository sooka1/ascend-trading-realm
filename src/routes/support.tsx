import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy, MessageCircle, Phone, Mail } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support Center — 24/7 client care | HK Global Trading" },
      { name: "description", content: "Reach the HK Global Trading support team 24/7 via live chat, phone, or ticket. Human replies in under 60 seconds." },
      { property: "og:title", content: "HK Global Support Center" },
      { property: "og:description", content: "Human, multilingual support in under 60 seconds — 24/7." },
    ],
  }),
  component: Support,
});

function Support() {
  const channels = [
    { icon: MessageCircle, title: "Live chat", body: "Average response: 42 seconds. Available in 14 languages.", cta: "Start chat" },
    { icon: Phone, title: "Phone", body: "Global toll-free lines with priority routing for Pro & Elite clients.", cta: "See numbers" },
    { icon: Mail, title: "Ticket", body: "Complex cases handled by senior specialists within 4 hours.", cta: "Open ticket" },
    { icon: LifeBuoy, title: "Help center", body: "500+ step-by-step guides covering every feature and edge case.", cta: "Browse guides" },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="Support"
        title={<>We're here <span className="text-gradient">24/7</span></>}
        subtitle="Real humans. Zero call-center scripts. Support that trades alongside you."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((c) => (
            <div key={c.title} className="glass rounded-2xl p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--gradient-brand-soft)]">
                <c.icon className="h-5 w-5 text-gold" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
              <Button asChild variant="ghost" className="mt-4 -mx-3">
                <Link to="/contact">{c.cta} →</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}