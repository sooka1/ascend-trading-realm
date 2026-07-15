import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc } from "@/components/legal-doc";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "سياسة ملفات الارتباط (Cookies) — HKEX Invest" },
      {
        name: "description",
        content:
          "شرح لكيفية استخدام HKEX Invest لملفات تعريف الارتباط وكيفية إدارتها.",
      },
      { property: "og:title", content: "سياسة ملفات الارتباط — HKEX Invest" },
      { property: "og:url", content: "https://www.hkexinvest.com/cookies" },
    ],
    links: [{ rel: "canonical", href: "https://www.hkexinvest.com/cookies" }],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <LegalDoc
      eyebrow="الخصوصية"
      title="سياسة ملفات الارتباط (Cookies)"
      subtitle="كيف تستخدم HKEX Invest ملفات تعريف الارتباط والتقنيات المشابهة."
      sections={[
        { t: "1. ما هي ملفات الارتباط", b: "ملفات الارتباط ملفات نصية صغيرة يحفظها متصفحك عند زيارة موقعنا. تساعدنا على تشغيل الموقع، تذكُّر تفضيلاتك، وفهم كيفية استخدامه." },
        { t: "2. الأنواع التي نستخدمها", b: "• أساسية: ضرورية لعمل الموقع (جلسة الدخول، الأمان، تفضيلات اللغة). لا يمكن تعطيلها.\n• أداء وتحليلات: تقيس التفاعل مع الصفحات (مثل Google Analytics) لتحسين التجربة.\n• وظيفية: تحفظ إعداداتك مثل الوضع الليلي والمنطقة الزمنية." },
        { t: "3. أطراف خارجية", b: "قد تُوضَع بعض ملفات الارتباط عبر خدمات موثوقة مثل Google Analytics و Supabase و Sentry. تخضع لسياسات الخصوصية الخاصة بها." },
        { t: "4. كيفية إدارتها", b: "يمكنك حذف أو تعطيل ملفات الارتباط من إعدادات متصفحك في أي وقت. ملاحظة: تعطيل الأساسية قد يمنع تسجيل الدخول أو استخدام بعض الميزات." },
        { t: "5. التحديثات", b: "قد نحدِّث هذه السياسة عند الحاجة. الإصدار الحالي هو المعتمد وتاريخ آخر تعديل مرتبط بتاريخ نشر هذه الصفحة." },
      ]}
    />
  );
}