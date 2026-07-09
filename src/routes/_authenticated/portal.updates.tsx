import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal-shell";
import { PortalEmpty } from "@/components/portal-empty";
import { Newspaper } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/updates")({
  head: () => ({ meta: [{ title: "التحديثات — بوابة العميل" }, { name: "description", content: "آخر مستجدات الحساب والسوق." }] }),
  component: () => (
    <PortalShell eyebrow="الأنشطة" title="آخر التحديثات" subtitle="أخبار حسابك ومحفظتك وتنبيهات السوق ذات الصلة.">
      <PortalEmpty icon={Newspaper} title="مركز التحديثات" description="ملخّص دوري لأهم مستجدات محفظتك، والسوق، والتحديثات المنصّية." />
    </PortalShell>
  ),
});