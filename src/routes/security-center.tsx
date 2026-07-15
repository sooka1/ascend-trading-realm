import { createFileRoute } from "@tanstack/react-router";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import { LegalDoc } from "@/components/legal-doc";

export const Route = createFileRoute("/security-center")({
  head: () => ({
    meta: [
      { title: "مركز الأمان — HKEX Invest" },
      {
        name: "description",
        content:
          "الإجراءات الأمنية المُفعَّلة في HKEX Invest: التشفير، المصادقة الثنائية، حماية الحساب، والإبلاغ عن الثغرات.",
      },
      { property: "og:title", content: "مركز الأمان — HKEX Invest" },
      { property: "og:url", content: "https://www.hkexinvest.com/security-center" },
    ],
    links: [{ rel: "canonical", href: "https://www.hkexinvest.com/security-center" }],
    scripts: [breadcrumbScript([{ name: "Home", path: "/" }, { name: "Security Center", path: "/security-center" }])],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <LegalDoc
      eyebrow="الأمان والثقة"
      title="مركز الأمان"
      subtitle="لمحة عن الإجراءات الأمنية الفعلية المطبَّقة في HKEX Invest. لا نُقدِّم أي ادعاءات بشهادات لم تُصدَر لنا."
      sections={[
        { t: "1. التشفير أثناء النقل", b: "يستخدم الموقع بروتوكول HTTPS مع شهادات TLS حديثة لتشفير كل الاتصالات بين المتصفح والخوادم." },
        { t: "2. حماية بيانات الاعتماد", b: "لا نحفظ كلمات مرور العملاء بشكل نصّي. تُخزَّن مُهشَّرة (hashed) عبر مزوِّد الهوية المستخدَم (Supabase Auth)، ولا يمكن استرجاعها حتى من قِبَل فريقنا." },
        { t: "3. المصادقة الثنائية (2FA)", b: "يمكن لأي مستخدم تفعيل المصادقة الثنائية من إعدادات الحساب في بوابة المستثمر لإضافة طبقة حماية إضافية عند تسجيل الدخول." },
        { t: "4. عزل صلاحيات القراءة/الكتابة", b: "تُستخدَم قواعد Row Level Security على مستوى قاعدة البيانات بحيث لا يمكن لأي مستخدم الوصول إلى بيانات مستخدم آخر مباشرةً عبر واجهة برمجة التطبيقات." },
        { t: "5. سجلات النشاط والتنبيهات", b: "تُسجَّل عمليات تسجيل الدخول، تغيير كلمة المرور، والعمليات الحساسة داخل بوابة المستثمر. يمكن للمستخدم مراجعتها في قسم سجل النشاط." },
        { t: "6. الإبلاغ عن ثغرة (Responsible Disclosure)", b: "إذا اكتشفت ثغرة أمنية محتملة، يُرجى إبلاغنا عبر صفحة تواصل معنا أو البريد الرسمي، مع وصف تقني وخطوات إعادة إنتاج المشكلة. نُقدِّر الإفصاح المسؤول ولن نتخذ إجراءات قانونية ضد الباحثين حسني النية الذين يلتزمون بهذه القواعد." },
        { t: "7. حدود المسؤولية", b: "رغم اتِّباعنا لممارسات أمنية معتبرة، لا يمكن ضمان الأمان المطلق لأي نظام رقمي. يتحمَّل العميل جزءًا من المسؤولية عبر حماية جهازه وعدم مشاركة بيانات دخوله." },
      ]}
    />
  );
}