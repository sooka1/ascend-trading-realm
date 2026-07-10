import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, AdminCard } from "@/components/admin-shell";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/settings")({
  head: () => ({ meta: [{ title: "Admin — Settings" }] }),
  component: () => (
    <AdminShell eyebrow="System" title="إعدادات النظام" subtitle="ضبط إعدادات المنصة العامة.">
      <AdminCard title="الإعدادات" icon={Settings}>
        <p className="text-sm text-muted-foreground">لا توجد إعدادات قابلة للتعديل هنا حالياً.</p>
      </AdminCard>
    </AdminShell>
  ),
});