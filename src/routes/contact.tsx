import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Get in touch with HK Global Trading" },
      { name: "description", content: "Talk to our sales, partnerships or support team. Global offices in London, Dubai, Singapore and New York." },
      { property: "og:title", content: "Contact HK Global Trading" },
      { property: "og:description", content: "Reach our sales, support or partnerships teams." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Contact"
        title={<>Let's <span className="text-gradient">talk</span></>}
        subtitle="Sales, partnerships, or press — we typically reply within one business hour."
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        <form
          className="glass-strong rounded-2xl p-6 md:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Thanks — we'll be in touch shortly.");
          }}
        >
          <h2 className="font-display text-2xl font-bold">Send us a message</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Alex Rivera" className="mt-1.5 bg-white/5" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="alex@example.com" className="mt-1.5 bg-white/5" required />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="Partnership inquiry" className="mt-1.5 bg-white/5" />
          </div>
          <div className="mt-4">
            <Label htmlFor="msg">Message</Label>
            <Textarea id="msg" rows={6} placeholder="Tell us how we can help…" className="mt-1.5 bg-white/5" required />
          </div>
          <Button type="submit" className="mt-6 bg-[var(--gradient-brand)] text-white">Send message</Button>
        </form>

        <div className="space-y-4">
          {[
            { icon: MapPin, title: "Global HQ", body: "One Canada Square, Level 41, London E14 5AB, United Kingdom" },
            { icon: Mail, title: "Email", body: "hello@hkglobaltrading.com" },
            { icon: Phone, title: "Phone", body: "+44 20 4525 0000" },
          ].map((c) => (
            <div key={c.title} className="glass rounded-2xl p-6">
              <c.icon className="h-5 w-5 text-gold" />
              <div className="mt-3 font-medium">{c.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{c.body}</div>
            </div>
          ))}
          <div className="glass rounded-2xl p-6">
            <div className="font-medium">Offices</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>London 🇬🇧</div>
              <div>Dubai 🇦🇪</div>
              <div>Singapore 🇸🇬</div>
              <div>New York 🇺🇸</div>
              <div>Zurich 🇨🇭</div>
              <div>Tokyo 🇯🇵</div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}