import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal-shell";
import { PortalEmpty } from "@/components/portal-empty";
import { History } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/activity")({
  head: () => ({ meta: [{ title: "سجل النشاط — بوابة العميل" }, { name: "description", content: "خط زمني لجميع أنشطة حسابك." }] }),
  component: () => (
    <PortalShell eyebrow="الأنشطة" title="سجل النشاط" subtitle="خط زمني كامل لكل أفعال حسابك: تسجيلات الدخول، التعديلات، والعمليات.">
      <PortalEmpty icon={History} title="Timeline" description="نشاطك الشامل مرتّبًا زمنيًا مع تصفية حسب النوع." bullets={["تحديث الملف الشخصي", "رفع مستندات", "تغيير الأذونات", "أفعال إدارية", "دخول/خروج"]} />
    </PortalShell>
  ),
});