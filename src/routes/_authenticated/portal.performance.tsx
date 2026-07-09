import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal-shell";
import { PortalEmpty } from "@/components/portal-empty";
import { LineChart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/performance")({
  head: () => ({ meta: [{ title: "تقارير الأداء — بوابة العميل" }, { name: "description", content: "تقارير أداء مهنية." }] }),
  component: () => (
    <PortalShell eyebrow="التقارير" title="تقارير الأداء" subtitle="تقارير تفاعلية بجودة المؤسسات، مع تنزيل PDF/Excel ومقارنات تاريخية.">
      <PortalEmpty icon={LineChart} title="لوحة الأداء" description="تقارير احترافية للأداء تشمل رسومًا بيانية تفاعلية، مقارنات، ومؤشرات KPI." bullets={["ملخصات يومية/أسبوعية", "شهري/ربع سنوي/سنوي", "نطاق مخصص", "رسوم تفاعلية", "تنزيل PDF/Excel", "عرض قابل للطباعة"]} />
    </PortalShell>
  ),
});