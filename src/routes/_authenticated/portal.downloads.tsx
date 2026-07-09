import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal-shell";
import { PortalEmpty } from "@/components/portal-empty";
import { Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/downloads")({
  head: () => ({ meta: [{ title: "التنزيلات — بوابة العميل" }, { name: "description", content: "جميع ملفاتك القابلة للتنزيل." }] }),
  component: () => (
    <PortalShell eyebrow="الحساب" title="التنزيلات" subtitle="أرشيف مركزي لكل ما نزّلته من كشوف وتقارير ووثائق.">
      <PortalEmpty icon={Download} title="مركز التنزيلات" description="تصفّح ونزّل ملفاتك السابقة بسرعة، مع خيارات إعادة التنزيل." />
    </PortalShell>
  ),
});