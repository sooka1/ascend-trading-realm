import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal-shell";
import { PortalEmpty } from "@/components/portal-empty";
import { Landmark } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/accounts")({
  head: () => ({ meta: [{ title: "الحسابات الاستثمارية — بوابة العميل" }, { name: "description", content: "إدارة حساباتك المتعددة." }] }),
  component: () => (
    <PortalShell eyebrow="نظرة عامة" title="الحسابات الاستثمارية" subtitle="حسابات متعددة تحت مظلة واحدة: شخصي، تجاري، مشترك، وأرشيف.">
      <PortalEmpty icon={Landmark} title="حسابات المستثمر" description="أدر عدة حسابات استثمارية بأنواعها المختلفة مع تعريفات وعملات أساسية وحالات مستقلة." bullets={["حساب شخصي", "حساب تجاري", "حساب مشترك", "الأرشيف", "المعرّف والعملة الأساسية", "تواريخ الفتح والحالة"]} />
    </PortalShell>
  ),
});