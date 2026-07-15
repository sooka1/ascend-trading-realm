import { createFileRoute } from "@tanstack/react-router";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import { LegalDoc } from "@/components/legal-doc";

export const Route = createFileRoute("/press")({
  head: () => ({
    meta: [
      { title: "المركز الإعلامي — HKEX Invest" },
      {
        name: "description",
        content:
          "نقطة التواصل الرسمية للصحفيين ووسائل الإعلام مع HKEX Invest، والموارد الأساسية للعلامة.",
      },
      { property: "og:title", content: "المركز الإعلامي — HKEX Invest" },
      { property: "og:url", content: "https://www.hkexinvest.com/press" },
    ],
    links: [{ rel: "canonical", href: "https://www.hkexinvest.com/press" }],
    scripts: [breadcrumbScript([{ name: "Home", path: "/" }, { name: "Press", path: "/press" }])],
  }),
  component: PressPage,
});

function PressPage() {
  return (
    <LegalDoc
      eyebrow="المركز الإعلامي"
      title="للصحفيين ووسائل الإعلام"
      subtitle="لأي طلبات تصريحات أو مقابلات أو استفسارات إعلامية."
      sections={[
        { t: "تعريف مختصر", b: "HKEX Invest منصة تكنولوجيا مالية مستقلة تُقدِّم أدوات لإدارة الاستثمار متعدد الأصول. المنصة ليست تابعة لبورصة هونغ كونغ (HKEX)." },
        { t: "قناة التواصل", b: "يُرجى إرسال الطلبات الإعلامية عبر صفحة تواصل معنا مع تحديد الموضوع بوضوح والجدول الزمني. نتعامل مع الطلبات بأسرع ما يمكن ضمن ساعات العمل." },
        { t: "استخدام الشعار والاسم", b: "يُسمح باستخدام اسم وشعار HKEX Invest في السياقات التحريرية دون تحريف. لا يُسمح باستخدامهما بصورة توحي بتأييد أو شراكة غير قائمة. الأصول متاحة عبر صفحة العلامة (/brand)." },
        { t: "ما لا نُصدره", b: "لا نُصدر توقُّعات لأسعار الأصول ولا نصائح استثمارية للجمهور. الاستفسارات المالية تُوجَّه إلى فريق الاتصال الرسمي وليس إلى فرق التسويق أو الدعم." },
      ]}
    />
  );
}