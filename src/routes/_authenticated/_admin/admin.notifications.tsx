import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, AdminCard } from "@/components/admin-shell";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/notifications")({
  head: () => ({ meta: [{ title: "Admin — Notifications" }] }),
  component: () => (
    <AdminShell eyebrow="Governance" title="الإشعارات" subtitle="مركز إرسال ومتابعة إشعارات النظام.">
      <AdminCard title="الإشعارات" icon={Bell}>
        <p className="text-sm text-muted-foreground">لا توجد إشعارات مُجدولة.</p>
      </AdminCard>
    </AdminShell>
  ),
});