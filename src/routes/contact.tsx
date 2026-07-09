import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePage } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Get in touch with HK Global Trading" },
      { name: "description", content: "Talk to our sales, partnerships or support team." },
      { property: "og:title", content: "Contact HK Global Trading" },
      { property: "og:description", content: "Reach our sales, support or partnerships teams." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const p = usePage().contact;
  return (
    <PageShell>
      <PageHero
        eyebrow={p.hero.eyebrow}
        title={<>{p.hero.titleA} <span className="text-gradient">{p.hero.titleB}</span></>}
        subtitle={p.hero.subtitle}
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        <form
          className="glass-strong rounded-2xl p-6 md:p-8"
          onSubmit={(e) => { e.preventDefault(); alert(p.sent); }}
        >
          <h2 className="font-display text-2xl font-bold">{p.formTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">{p.fullName}</Label>
              <Input id="name" className="mt-1.5 bg-white/5" required />
            </div>
            <div>
              <Label htmlFor="email">{p.email}</Label>
              <Input id="email" type="email" className="mt-1.5 bg-white/5" required />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="subject">{p.subject}</Label>
            <Input id="subject" className="mt-1.5 bg-white/5" />
          </div>
          <div className="mt-4">
            <Label htmlFor="msg">{p.message}</Label>
            <Textarea id="msg" rows={6} className="mt-1.5 bg-white/5" required />
          </div>
          <Button type="submit" className="mt-6 bg-[var(--gradient-brand)] text-white">{p.send}</Button>
        </form>

        <div className="space-y-4">
          {[
            { icon: MapPin, title: p.hqT, body: p.hqB },
            { icon: Mail, title: p.emailT, body: "hello@hkglobaltrading.com" },
            { icon: Phone, title: p.phoneT, body: "+44 20 4525 0000" },
          ].map((c) => (
            <div key={c.title} className="glass rounded-2xl p-6">
              <c.icon className="h-5 w-5 text-gold" />
              <div className="mt-3 font-medium">{c.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{c.body}</div>
            </div>
          ))}
          <div className="glass rounded-2xl p-6">
            <div className="font-medium">{p.officesT}</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>London 🇬🇧</div><div>Dubai 🇦🇪</div><div>Singapore 🇸🇬</div>
              <div>New York 🇺🇸</div><div>Zurich 🇨🇭</div><div>Tokyo 🇯🇵</div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
