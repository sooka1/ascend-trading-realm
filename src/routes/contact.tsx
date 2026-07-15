import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Navigation } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePage } from "@/lib/i18n";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { sendSupportInquiry } from "@/lib/support-inquiry.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Get in touch with HKEX" },
      { name: "description", content: "Talk to our sales, partnerships or support team." },
      { property: "og:title", content: "Contact HKEX" },
      { property: "og:description", content: "Reach our sales, support or partnerships teams." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const p = usePage().contact;
  const send = useServerFn(sendSupportInquiry);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const offices: Array<{
    key: string;
    title: string;
    titleAr: string;
    address: string;
    query: string;
    coords: string;
  }> = [
    {
      key: "beijing",
      title: "Beijing Office",
      titleAr: "مكتب بكين",
      address: "China World Tower, 1 Jianguomenwai Avenue\nChaoyang District, Beijing 100004\nChina",
      query: "China World Tower, 1 Jianguomenwai Avenue, Chaoyang, Beijing",
      coords: "39.9088°N · 116.4590°E",
    },
    {
      key: "shanghai",
      title: "Shanghai Office",
      titleAr: "مكتب شنغهاي",
      address: "Shanghai IFC, 8 Century Avenue\nPudong, Shanghai 200120\nChina",
      query: "Shanghai IFC, 8 Century Avenue, Pudong, Shanghai",
      coords: "31.2360°N · 121.5050°E",
    },
    {
      key: "singapore",
      title: "Singapore Office",
      titleAr: "مكتب سنغافورة",
      address: "Marina Bay Financial Centre, 10 Marina Boulevard\nSingapore 018983",
      query: "Marina Bay Financial Centre, 10 Marina Boulevard, Singapore",
      coords: "1.2792°N · 103.8545°E",
    },
    {
      key: "london",
      title: "London Office",
      titleAr: "مكتب لندن",
      address: "One Canada Square, Canary Wharf\nLondon E14 5AB\nUnited Kingdom",
      query: "One Canada Square, Canary Wharf, London",
      coords: "51.5049°N · 0.0195°W",
    },
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await send({
        data: {
          kind: "contact",
          name: form.name,
          email: form.email,
          subject: form.subject || undefined,
          message: form.message,
          source: "contact",
        },
      });
      toast.success(p.sent);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      toast.error(err?.message ?? "تعذّر الإرسال");
    } finally {
      setSending(false);
    }
  }

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
          onSubmit={onSubmit}
        >
          <h2 className="font-display text-2xl font-bold">{p.formTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">{p.fullName}</Label>
              <Input id="name" className="mt-1.5 bg-white/5" required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="email">{p.email}</Label>
              <Input id="email" type="email" className="mt-1.5 bg-white/5" required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="subject">{p.subject}</Label>
            <Input id="subject" className="mt-1.5 bg-white/5"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
          </div>
          <div className="mt-4">
            <Label htmlFor="msg">{p.message}</Label>
            <Textarea id="msg" rows={6} className="mt-1.5 bg-white/5" required
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
          </div>
          <Button type="submit" disabled={sending} className="mt-6 bg-[var(--gradient-brand)] text-white">
            {sending ? "جارٍ الإرسال…" : p.send}
          </Button>
        </form>

        <div className="space-y-4">
          <div className="glass overflow-hidden rounded-2xl">
            <div className="p-6">
              <MapPin className="h-5 w-5 text-gold" />
              <div className="mt-3 font-medium">{p.hqT}</div>
              <div className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                {p.hqB}
              </div>
            </div>
            <iframe
              title="HKEX Hong Kong HQ map"
              src="https://www.google.com/maps?q=Two+International+Finance+Centre,+8+Finance+Street,+Central,+Hong+Kong&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-64 w-full border-0"
            />
            <div className="flex items-center justify-between gap-2 border-t border-white/5 p-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  22.2851°N · 114.1592°E
              </span>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Two+International+Finance+Centre,+8+Finance+Street,+Central,+Hong+Kong"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold/20"
              >
                <Navigation className="h-3.5 w-3.5" />
                الاتجاهات · Directions
              </a>
            </div>
          </div>
          {offices.map((o) => (
            <div key={o.key} className="glass overflow-hidden rounded-2xl">
              <div className="p-6">
                <MapPin className="h-5 w-5 text-gold" />
                <div className="mt-3 font-medium">{o.titleAr} · {o.title}</div>
                <div className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                  {o.address}
                </div>
              </div>
              <iframe
                title={`HKEX ${o.title} map`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(o.query)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-64 w-full border-0"
              />
              <div className="flex items-center justify-between gap-2 border-t border-white/5 p-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {o.coords}
                </span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(o.query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold/20"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  الاتجاهات · Directions
                </a>
              </div>
            </div>
          ))}
          <div className="glass rounded-2xl p-6">
            <Mail className="h-5 w-5 text-gold" />
            <div className="mt-3 font-medium">{p.emailT}</div>
            <div className="mt-1 text-sm text-muted-foreground">support@hkexinvest.com</div>
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="font-medium">{p.officesT}</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>Hong Kong 🇭🇰</div><div>Beijing 🇨🇳</div>
              <div>Shanghai 🇨🇳</div><div>Singapore 🇸🇬</div>
              <div>London 🇬🇧</div><div>Dubai 🇦🇪</div>
              <div>New York 🇺🇸</div><div>Zurich 🇨🇭</div>
              <div>Tokyo 🇯🇵</div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
