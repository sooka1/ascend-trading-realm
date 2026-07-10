import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, AdminCard } from "@/components/admin-shell";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/organizations")({
  head: () => ({ meta: [{ title: "Admin — Organizations" }] }),
  component: () => (
    <AdminShell eyebrow="Identity" title="المؤسسات" subtitle="إدارة المؤسسات والحسابات المؤسسية.">
      <AdminCard title="المؤسسات" icon={Building2}>
        <p className="text-sm text-muted-foreground">لا توجد مؤسسات مسجلة حالياً.</p>
      </AdminCard>
    </AdminShell>
  ),
});