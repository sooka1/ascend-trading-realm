import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal-shell";
import { PortalEmpty } from "@/components/portal-empty";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/statements")({
  head: () => ({ meta: [{ title: "الكشوف — بوابة العميل" }, { name: "description", content: "كشوف الحساب الرسمية." }] }),
  component: () => (
    <PortalShell eyebrow="التقارير" title="كشوف الحساب" subtitle="كشوفك اليومية والأسبوعية والشهرية والربع سنوية والسنوية.">
      <PortalEmpty icon={FileText} title="مركز الكشوف" description="جميع كشوف حسابك في مكان واحد مع خيارات تنزيل PDF/Excel وطباعة." bullets={["يومي", "أسبوعي", "شهري", "ربع سنوي", "سنوي", "نطاق مخصص"]} />
    </PortalShell>
  ),
});