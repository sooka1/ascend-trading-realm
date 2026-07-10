import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { BadgeCheck, CheckCircle2, Quote, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PORTFOLIOS } from "@/lib/portfolios-t";
import type { Lang } from "@/lib/i18n";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import * as React from "react";

export const Route = createFileRoute("/portfolios")({
  head: () => ({
    meta: [
      { title: "Managed Portfolios — HK Investment Management" },
      { name: "description", content: "Three managed portfolio strategies — Conservative, Balanced and Growth — matched to your risk profile and goals." },
      { property: "og:title", content: "Managed Portfolios" },
      { property: "og:description", content: "Conservative, Balanced and Growth strategies with disciplined risk management." },
    ],
  }),
  component: PortfoliosPage,
});

const TARGETS = ["6 – 10%", "10 – 16%", "16 – 24%"];
const MINS = ["$100", "$500", "$1,000"];
const WITHDRAW = "$10";
const HIGHLIGHT = [false, true, false];

type Review = { name: string; role: string; tier: string; rating: number; quote: string; verified?: boolean };
type ReviewsContent = { eyebrow: string; title: string; subtitle: string; items: Review[] };

const REVIEWS: Record<Lang, ReviewsContent> = {
  ar: {
    eyebrow: "آراء العملاء",
    title: "ماذا يقول عملاء المحافظ",
    subtitle: "تجارب حقيقية من مستثمرين يديرون محافظهم معنا.",
    items: [
      { name: "خالد المنصوري", role: "رجل أعمال — دبي", tier: "المتوازنة", rating: 5, quote: "المحفظة المتوازنة أعطتني عوائد ثابتة مع تقارير شهرية شفافة. راحة بال حقيقية." },
      { name: "سارة العتيبي", role: "طبيبة استشارية — الرياض", tier: "المحافظة", rating: 5, quote: "بدأت بمحفظة محافِظة والحفاظ على رأس المال كان الأولوية — الأداء تجاوز توقعاتي." },
      { name: "أحمد الفهد", role: "مستثمر خاص — الكويت", tier: "النمو", rating: 5, quote: "محفظة النمو تناسب أفقي الاستثماري الطويل. إدارة مخاطر منضبطة وأداء قوي." },
      { name: "ليلى القحطاني", role: "مديرة مالية — جدة", tier: "المتوازنة", rating: 4.5, quote: "التنويع بين الأصول واضح والتواصل مع المستشار احترافي جدًا." },
      { name: "يوسف البلوشي", role: "مهندس أول — مسقط", tier: "المحافظة", rating: 5, quote: "خيار مثالي لمن يبحث عن استثمار مستقر بعيدًا عن تقلبات السوق." },
      { name: "منى الشمري", role: "مستثمرة — الدوحة", tier: "النمو", rating: 4.5, quote: "التحديثات الأسبوعية عن الأداء ممتازة، وسحب الأرباح سهل وسريع." },
      { name: "James Whitfield", role: "رجل أعمال — لندن", tier: "المتوازنة", rating: 5, quote: "أداء ثابت وتقارير شهرية شفافة. تجربة احترافية بكل المقاييس.", verified: true },
      { name: "Sofia Lindqvist", role: "مستثمرة خاصة — ستوكهولم", tier: "المحافظة", rating: 5, quote: "الحفاظ على رأس المال كان أولويتي، والنتائج فاقت توقعاتي.", verified: true },
      { name: "Michael Chen", role: "تنفيذي — سنغافورة", tier: "النمو", rating: 5, quote: "إدارة مخاطر منضبطة وأداء قوي يناسب استثماري طويل الأجل.", verified: true },
      { name: "Amelia Rossi", role: "مديرة مالية — ميلانو", tier: "المتوازنة", rating: 4.5, quote: "تنويع واضح بين الأصول وتواصل احترافي مع المستشار.", verified: true },
      { name: "Hugo Lefevre", role: "مهندس — مونتريال", tier: "المحافظة", rating: 5, quote: "خيار ممتاز للاستثمار المستقر بعيدًا عن ضجيج الأسواق.", verified: true },
    ],
  },
  en: {
    eyebrow: "Client voices",
    title: "What portfolio clients say",
    subtitle: "Real experiences from investors managing their portfolios with us.",
    items: [
      { name: "James Whitfield", role: "Business Owner — London", tier: "Balanced", rating: 5, quote: "The Balanced portfolio delivered steady returns with transparent monthly reporting. Real peace of mind." },
      { name: "Sofia Lindqvist", role: "Private Investor — Stockholm", tier: "Conservative", rating: 5, quote: "I started with Conservative — capital preservation was the priority and performance exceeded my expectations." },
      { name: "Michael Chen", role: "Executive — Singapore", tier: "Growth", rating: 5, quote: "The Growth portfolio fits my long-term horizon. Disciplined risk management and strong performance." },
      { name: "Amelia Rossi", role: "CFO — Milan", tier: "Balanced", rating: 4.5, quote: "Clear diversification across assets and highly professional advisor communication." },
      { name: "Daniel Okafor", role: "Senior Engineer — Dubai", tier: "Conservative", rating: 5, quote: "An ideal choice for anyone seeking stable investing away from market noise." },
      { name: "Elena Marín", role: "Investor — Doha", tier: "Growth", rating: 4.5, quote: "Weekly performance updates are excellent, and profit withdrawals are easy and fast." },
    ],
  },
  fr: {
    eyebrow: "Avis clients",
    title: "Ce que disent les clients des portefeuilles",
    subtitle: "Expériences réelles d'investisseurs gérant leurs portefeuilles avec nous.",
    items: [
      { name: "Julien Moreau", role: "Chef d'entreprise — Paris", tier: "Équilibré", rating: 5, quote: "Le portefeuille équilibré a offert des rendements constants avec des rapports mensuels transparents." },
      { name: "Camille Roux", role: "Investisseuse privée — Lyon", tier: "Prudent", rating: 5, quote: "Préserver le capital était ma priorité — la performance a dépassé mes attentes." },
      { name: "Antoine Girard", role: "Cadre dirigeant — Genève", tier: "Croissance", rating: 5, quote: "Une gestion du risque disciplinée et une performance solide sur le long terme." },
      { name: "Élodie Bernard", role: "Directrice financière — Bruxelles", tier: "Équilibré", rating: 4.5, quote: "Diversification claire et communication très professionnelle avec le conseiller." },
      { name: "Hugo Lefevre", role: "Ingénieur — Montréal", tier: "Prudent", rating: 5, quote: "Choix idéal pour un investissement stable, loin du bruit des marchés." },
      { name: "Nina Fabre", role: "Investisseuse — Doha", tier: "Croissance", rating: 4.5, quote: "Mises à jour hebdomadaires excellentes et retraits de gains rapides." },
    ],
  },
  es: {
    eyebrow: "Opiniones",
    title: "Lo que dicen los clientes de las carteras",
    subtitle: "Experiencias reales de inversores que gestionan sus carteras con nosotros.",
    items: [
      { name: "Carlos Herrera", role: "Empresario — Madrid", tier: "Equilibrada", rating: 5, quote: "La cartera equilibrada me ha dado rendimientos estables con informes mensuales transparentes." },
      { name: "Lucía Fernández", role: "Inversora privada — Barcelona", tier: "Conservadora", rating: 5, quote: "Empecé con Conservadora — preservar el capital fue clave y el desempeño superó mis expectativas." },
      { name: "Diego Ramírez", role: "Directivo — Ciudad de México", tier: "Crecimiento", rating: 5, quote: "Encaja con mi horizonte de largo plazo. Gestión de riesgo disciplinada." },
      { name: "Valeria Sánchez", role: "Directora financiera — Bogotá", tier: "Equilibrada", rating: 4.5, quote: "Diversificación clara y comunicación muy profesional con el asesor." },
      { name: "Mateo García", role: "Ingeniero — Buenos Aires", tier: "Conservadora", rating: 5, quote: "Ideal para quien busca invertir con estabilidad." },
      { name: "Sara Ortega", role: "Inversora — Doha", tier: "Crecimiento", rating: 4.5, quote: "Actualizaciones semanales excelentes y retiros rápidos." },
    ],
  },
  tr: {
    eyebrow: "Müşteri görüşleri",
    title: "Portföy müşterileri ne diyor",
    subtitle: "Portföylerini bizimle yöneten yatırımcılardan gerçek deneyimler.",
    items: [
      { name: "Emre Yılmaz", role: "İş İnsanı — İstanbul", tier: "Dengeli", rating: 5, quote: "Dengeli portföy şeffaf aylık raporlarla istikrarlı getiri sağladı." },
      { name: "Aylin Demir", role: "Özel Yatırımcı — Ankara", tier: "Muhafazakâr", rating: 5, quote: "Sermayeyi korumak önceliğimdi — performans beklentimin üzerinde." },
      { name: "Kaan Aksoy", role: "Yönetici — İzmir", tier: "Büyüme", rating: 5, quote: "Uzun vadeli ufkuma uygun. Disiplinli risk yönetimi." },
      { name: "Zeynep Çelik", role: "Finans Direktörü — Bursa", tier: "Dengeli", rating: 4.5, quote: "Net çeşitlendirme ve son derece profesyonel danışman iletişimi." },
      { name: "Burak Öztürk", role: "Kıdemli Mühendis — Antalya", tier: "Muhafazakâr", rating: 5, quote: "İstikrarlı yatırım arayan herkes için ideal." },
      { name: "Selin Arslan", role: "Yatırımcı — Doha", tier: "Büyüme", rating: 4.5, quote: "Haftalık güncellemeler mükemmel, kâr çekimleri hızlı." },
    ],
  },
};

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.floor(value);
        const half = !filled && i + 0.5 < value;
        return (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${filled || half ? "fill-gold text-gold" : "text-white/20"}`}
          />
        );
      })}
    </div>
  );
}

function PortfoliosPage() {
  const { lang } = useI18n();
  const c = PORTFOLIOS[lang];
  return (
    <PageShell>
      <PageHero
        eyebrow={c.eyebrow}
        title={<>{c.title}</>}
        subtitle={c.subtitle}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {c.tiers.map((p, i) => (
            <div
              key={p.name}
              className={`glass-strong rounded-3xl p-8 ${HIGHLIGHT[i] ? "ring-1 ring-gold/40" : ""}`}
            >
              {HIGHLIGHT[i] && (
                <span className="mb-3 inline-block rounded-full bg-gold/15 px-3 py-1 text-xs text-gold">
                  {c.popular}
                </span>
              )}
              <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.target}</p>
              <p className="font-display text-5xl font-semibold text-gradient">{TARGETS[i]}</p>
              <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{c.minimum}</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">{MINS[i]}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{c.risk}</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold text-foreground">{p.risk}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{c.withdraw}</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">{WITHDRAW}</dd>
                </div>
              </dl>
              <ul className="mt-6 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full rounded-sm border border-[#a0430a] bg-[#c2410c] font-semibold text-white shadow-[0_4px_14px_rgba(194,65,12,0.35)] transition-all duration-200 hover:border-[#ea580c] hover:bg-[#ea580c] hover:shadow-[0_6px_20px_rgba(234,88,12,0.5)] active:border-[#7c2d0a] active:bg-[#9a3412] active:scale-[0.98]">
                <Link to="/auth">{c.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-3xl text-xs text-muted-foreground">{c.disclaimer}</p>
      </section>
      <ReviewsSection />
    </PageShell>
  );
}

function ReviewsSection() {
  const { lang } = useI18n();
  const r = REVIEWS[lang];
  return (
    <section className="border-t border-white/5 bg-white/[0.02] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.22em] text-gold">{r.eyebrow}</span>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">{r.title}</h2>
          <p className="mt-3 text-muted-foreground">{r.subtitle}</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {r.items.map((it) => (
            <figure key={it.name} className="glass-strong flex h-full flex-col rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(it.name)}&backgroundType=gradientLinear&fontFamily=Georgia`}
                  alt=""
                  loading="lazy"
                  className="h-11 w-11 shrink-0 rounded-full border border-gold/30 bg-white/5"
                />
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate font-display text-base font-semibold text-foreground">
                    <span className="truncate">{it.name}</span>
                    {it.verified && (
                      <BadgeCheck
                        className="h-4 w-4 shrink-0 text-gold"
                        aria-label="عميل مُوثّق"
                      />
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{it.role}</p>
                  {it.verified && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-gold">
                      <BadgeCheck className="h-3 w-3" />
                      عميل مُوثّق
                    </span>
                  )}
                </div>
                <Quote className="ms-auto h-5 w-5 shrink-0 text-gold/60" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <StarRow value={it.rating} />
                <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                  {it.tier}
                </span>
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                "{it.quote}"
              </blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}