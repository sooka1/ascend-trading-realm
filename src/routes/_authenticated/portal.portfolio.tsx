import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal-shell";
import { PortalEmpty } from "@/components/portal-empty";
import { Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/portfolio")({
  head: () => ({ meta: [{ title: "المحفظة — بوابة العميل" }, { name: "description", content: "ملخّص محفظتك وتوزيعاتك." }] }),
  component: () => (
    <PortalShell eyebrow="نظرة عامة" title="المحفظة" subtitle="ملخّص شامل عن أصولك، التوزيعات، والأداء التاريخي.">
      <PortalEmpty
        icon={Wallet}
        title="المحفظة الكاملة"
        description="سيتوفّر عرض تفصيلي لمحفظتك يشمل توزيع الأصول والقطاعات والمناطق الجغرافية، بالإضافة إلى اللقطات التاريخية وسجل إعادة التوازن."
        bullets={["توزيع الأصول (Asset allocation)", "التوزيع القطاعي والجغرافي", "لقطات دورية للمحفظة", "سجل إعادة التوازن", "ملاحظات مدير المحفظة"]}
      />
    </PortalShell>
  ),
});