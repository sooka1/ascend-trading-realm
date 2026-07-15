import { createFileRoute } from "@tanstack/react-router";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import { LegalDoc } from "@/components/legal-doc";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "إخلاء المسؤولية والاستقلالية — HKEX Invest" },
      {
        name: "description",
        content:
          "HKEX Invest منصة تكنولوجيا مالية مستقلة، وليست تابعة لبورصة هونغ كونغ (HKEX). راجع إخلاء المسؤولية الكامل هنا.",
      },
      { property: "og:title", content: "إخلاء المسؤولية — HKEX Invest" },
      { property: "og:url", content: "https://www.hkexinvest.com/disclaimer" },
    ],
    links: [{ rel: "canonical", href: "https://www.hkexinvest.com/disclaimer" }],
    scripts: [breadcrumbScript([{ name: "Home", path: "/" }, { name: "Disclaimer", path: "/disclaimer" }])],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <LegalDoc
      eyebrow="إخلاء مسؤولية"
      title="الاستقلالية وإخلاء المسؤولية"
      subtitle="توضيح رسمي حول طبيعة HKEX Invest وعلاقتها بالجهات الأخرى، ومخاطر الاستثمار."
      sections={[
        {
          t: "1. الاستقلالية عن HKEX",
          b: "HKEX Invest منصة تكنولوجيا مالية مستقلة. لا توجد أي علاقة رسمية أو تشغيلية أو ملكية مع Hong Kong Exchanges and Clearing Limited (HKEX) أو أي من الشركات التابعة لها. الاسم مستخدم للإشارة إلى هويّة المنصة فقط ولا يعني بأي شكل تبعية أو ترخيصًا من HKEX.",
        },
        {
          t: "2. لا نُقدِّم نصائح استثمارية",
          b: "المحتوى المنشور في الموقع هو معلومات عامة لأغراض تعليمية وتشغيلية فقط، ولا يُعدّ توصية بشراء أو بيع أي أصل مالي. يُنصح باستشارة مستشار مؤهَّل قبل اتخاذ أي قرار استثماري.",
        },
        {
          t: "3. لا ضمانات على العوائد",
          b: "الاستثمار ينطوي على مخاطر، من بينها احتمال خسارة رأس المال جزئيًا أو كليًا. الأداء السابق لا يضمن الأداء المستقبلي. أي أرقام أو رسوم بيانية على الموقع هي توضيحية ما لم يُذكر خلاف ذلك.",
        },
        {
          t: "4. القيود الجغرافية",
          b: "لا تُقدَّم خدمات HKEX Invest في الدول أو المناطق التي يُحظر فيها ذلك قانونيًا. يتحمَّل العميل مسؤولية التحقق من قانونية استخدام الخدمة في بلده.",
        },
        {
          t: "5. تحديث المحتوى",
          b: "قد تُحدَّث المعلومات والسياسات دون إشعار مسبق. النسخة المنشورة هنا هي المرجع.",
        },
      ]}
    />
  );
}