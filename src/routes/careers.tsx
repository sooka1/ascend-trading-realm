import { createFileRoute } from "@tanstack/react-router";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import { LegalDoc } from "@/components/legal-doc";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "الوظائف — HKEX Invest" },
      {
        name: "description",
        content:
          "لا توجد شواغر معلنة حاليًا في HKEX Invest. تعرَّف على ثقافة العمل وكيف يمكنك إرسال سيرتك الذاتية للاعتبار المستقبلي.",
      },
      { property: "og:title", content: "انضم إلى HKEX Invest" },
      { property: "og:url", content: "https://www.hkexinvest.com/careers" },
    ],
    links: [{ rel: "canonical", href: "https://www.hkexinvest.com/careers" }],
    scripts: [breadcrumbScript([{ name: "Home", path: "/" }, { name: "Careers", path: "/careers" }])],
  }),
  component: CareersPage,
});

function CareersPage() {
  return (
    <LegalDoc
      eyebrow="الوظائف"
      title="اعمل معنا"
      subtitle="نبني منصة استثمار مستقلة، شفافة، وموجَّهة للعميل — ونبحث عن أشخاص يشاركوننا هذا الهدف."
      sections={[
        { t: "ثقافة الفريق", b: "نُقدِّر الجودة أكثر من السرعة، والشفافية أكثر من التسويق. القرارات مبنية على البيانات، والملكية موزَّعة على من ينفِّذ العمل." },
        { t: "المجالات التي تهمّنا", b: "• هندسة برمجيات (Full-Stack, Backend, Mobile).\n• أمان معلومات ومراجعة كود.\n• عمليات مالية وامتثال (KYC/AML).\n• دعم عملاء متعدد اللغات.\n• محتوى مالي وتعليم." },
        { t: "الشواغر الحالية", b: "لا توجد وظائف مفتوحة رسميًا في هذه اللحظة. نحدِّث هذه الصفحة عند فتح شواغر جديدة." },
        { t: "التقديم التلقائي", b: "إذا كنت ترى أنك مناسب لأحد المجالات أعلاه، أرسل سيرتك الذاتية عبر صفحة تواصل معنا. نحتفظ بالطلبات للاعتبار المستقبلي." },
        { t: "المساواة والشمول", b: "نُقيِّم المتقدِّمين على أساس المهارات والملاءمة فقط، بصرف النظر عن الجنس أو العرق أو الدين أو التوجه، وفق قوانين العمل المعمول بها." },
      ]}
    />
  );
}