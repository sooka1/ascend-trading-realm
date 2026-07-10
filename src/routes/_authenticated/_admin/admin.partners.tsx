import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, AdminCard } from "@/components/admin-shell";
import { Handshake } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/partners")({
  head: () => ({ meta: [{ title: "Admin — Partners" }] }),
  component: () => (
    <AdminShell eyebrow="Governance" title="الشركاء" subtitle="إدارة الشركاء والاتفاقيات.">
      <AdminCard title="الشركاء" icon={Handshake}>
        <p className="text-sm text-muted-foreground">لا يوجد شركاء مسجلون حالياً.</p>
      </AdminCard>
    </AdminShell>
  ),
});