import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal-shell";
import { PortalEmpty } from "@/components/portal-empty";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/settings")({
  head: () => ({ meta: [{ title: "الإعدادات — بوابة العميل" }, { name: "description", content: "تفضيلات عامة للحساب." }] }),
  component: () => (
    <PortalShell eyebrow="الحساب" title="الإعدادات" subtitle="التخصيصات العامة، الأجهزة المتصلة، والجلسات النشطة.">
      <PortalEmpty icon={Settings} title="التفضيلات" description="إدارة التخصيصات العامة والأمان." bullets={["الأجهزة المتصلة", "الجلسات النشطة", "تفضيلات العرض", "المنطقة الزمنية", "اللغة"]} />
    </PortalShell>
  ),
});