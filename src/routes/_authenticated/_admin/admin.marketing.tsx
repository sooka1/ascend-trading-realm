import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, AdminCard } from "@/components/admin-shell";
import { Megaphone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/marketing")({
  head: () => ({ meta: [{ title: "Admin — Marketing" }] }),
  component: () => (
    <AdminShell eyebrow="Governance" title="التسويق" subtitle="الحملات والمحتوى التسويقي.">
      <AdminCard title="الحملات" icon={Megaphone}>
        <p className="text-sm text-muted-foreground">لا توجد حملات نشطة.</p>
      </AdminCard>
    </AdminShell>
  ),
});