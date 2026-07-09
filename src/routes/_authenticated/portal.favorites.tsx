import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal-shell";
import { PortalEmpty } from "@/components/portal-empty";
import { Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/favorites")({
  head: () => ({ meta: [{ title: "المفضلة — بوابة العميل" }, { name: "description", content: "مستنداتك وتقاريرك المفضلة." }] }),
  component: () => (
    <PortalShell eyebrow="الأنشطة" title="المفضلة" subtitle="اختصارات لأهم المستندات والتقارير التي تصل إليها بانتظام.">
      <PortalEmpty icon={Star} title="مفضّلاتك" description="ثبّت العناصر الأكثر أهمية للوصول السريع." />
    </PortalShell>
  ),
});