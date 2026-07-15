import { createFileRoute } from "@tanstack/react-router";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import { LegalDoc } from "@/components/legal-doc";

export const Route = createFileRoute("/complaints")({
  head: () => ({
    meta: [
      { title: "سياسة معالجة الشكاوى — HKEX Invest" },
      {
        name: "description",
        content:
          "كيفية تقديم شكوى إلى HKEX Invest، مراحل المعالجة، والجداول الزمنية للاستجابة.",
      },
      { property: "og:title", content: "سياسة معالجة الشكاوى — HKEX Invest" },
      { property: "og:url", content: "https://www.hkexinvest.com/complaints" },
    ],
    links: [{ rel: "canonical", href: "https://www.hkexinvest.com/complaints" }],
    scripts: [breadcrumbScript([{ name: "Home", path: "/" }, { name: "Complaints", path: "/complaints" }])],
  }),
  component: ComplaintsPage,
});

function ComplaintsPage() {
  return (
    <LegalDoc
      eyebrow="خدمة العملاء"
      title="سياسة معالجة الشكاوى"
      subtitle="نلتزم بمعالجة كل شكوى بجدية وشفافية وسرعة."
      sections={[
        { t: "1. كيفية تقديم شكوى", b: "يمكن تقديم الشكوى عبر:\n• صفحة تواصل معنا في الموقع.\n• الرسائل الآمنة داخل بوابة المستثمر.\n• البريد الإلكتروني الرسمي للدعم." },
        { t: "2. البيانات المطلوبة", b: "لتسريع المعالجة، يُفضَّل تضمين: اسم صاحب الحساب، البريد المسجَّل، وصف واضح للمشكلة، التاريخ التقريبي، وأي مرفقات داعمة (لقطات شاشة، مراجع معاملات)." },
        { t: "3. مراحل المعالجة", b: "• الاستلام: إشعار خلال 24 ساعة عمل.\n• التقييم الأولي: خلال 3 أيام عمل.\n• الرد الجوهري: خلال 15 يوم عمل من تاريخ الاستلام. عند تعقُّد الحالة، يُعلَم العميل بالسبب والمهلة الجديدة." },
        { t: "4. التصعيد الداخلي", b: "إذا لم تكن راضيًا عن الرد، يمكنك طلب مراجعة الشكوى من قِبَل مسؤول الامتثال. تُدرَس المراجعة بشكل مستقل وتُقدَّم إجابة نهائية خلال 20 يوم عمل إضافية." },
        { t: "5. التصعيد الخارجي", b: "بعد استنفاد المسار الداخلي، يحق لك اللجوء إلى الجهة التنظيمية المختصة أو التحكيم وفق التشريعات المطبَّقة في بلد إقامتك." },
        { t: "6. السجل والسرية", b: "تُحفَظ الشكاوى وردودها بشكل سرِّي، ولا تؤثِّر على وضع العميل داخل المنصة. تُستخدم بيانات الشكوى فقط لأغراض المعالجة والتحسين." },
      ]}
    />
  );
}