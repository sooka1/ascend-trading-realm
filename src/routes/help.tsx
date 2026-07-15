import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "مركز المساعدة — HKEX Invest" },
      {
        name: "description",
        content:
          "مركز المساعدة لمنصة HKEX Invest — روابط سريعة إلى الحساب، الأمان، الإيداع والسحب، الأسئلة الشائعة، وتواصل مع الدعم.",
      },
      { property: "og:title", content: "مركز المساعدة — HKEX Invest" },
      { property: "og:url", content: "https://www.hkexinvest.com/help" },
    ],
    links: [{ rel: "canonical", href: "https://www.hkexinvest.com/help" }],
    scripts: [breadcrumbScript([{ name: "Home", path: "/" }, { name: "Help Center", path: "/help" }])],
  }),
  component: HelpPage,
});

const CARDS = [
  { title: "البداية وفتح الحساب", body: "خطوات التسجيل، التحقق، وأول إيداع.", to: "/how-it-works" as const },
  { title: "الأمان والمصادقة الثنائية", body: "حماية حسابك وتمكين 2FA وأفضل الممارسات.", to: "/security-center" as const },
  { title: "الأسئلة الشائعة", body: "أجوبة سريعة لأشيع الاستفسارات.", to: "/faq" as const },
  { title: "الخصوصية والبيانات", body: "كيف نعالج بياناتك وحقوقك.", to: "/privacy" as const },
  { title: "الامتثال (AML/KYC)", body: "متطلبات الهوية ومكافحة غسل الأموال.", to: "/aml" as const },
  { title: "تقديم شكوى", body: "المسار الرسمي لمعالجة الشكاوى والتصعيد.", to: "/complaints" as const },
  { title: "شروط الخدمة", body: "الاتفاقيات الحاكمة لاستخدام المنصة.", to: "/terms" as const },
  { title: "تواصل مع الدعم", body: "قنوات التواصل الرسمية.", to: "/contact" as const },
];

function HelpPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="مركز المساعدة"
        title={<>كيف يمكننا مساعدتك؟</>}
        subtitle="اختر الموضوع المناسب أو تواصل معنا مباشرةً."
      />
      <section dir="rtl" className="mx-auto grid max-w-5xl gap-4 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        {CARDS.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group rounded-xl border border-white/10 bg-card/40 p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-gold/40 hover:bg-gold/[0.04]"
          >
            <h3 className="font-display text-base font-semibold text-foreground">{c.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-gold/80 transition group-hover:text-gold">
              فتح ←
            </span>
          </Link>
        ))}
      </section>
    </PageShell>
  );
}