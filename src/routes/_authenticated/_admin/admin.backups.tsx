import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, AdminCard } from "@/components/admin-shell";
import { DatabaseBackup } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/backups")({
  head: () => ({ meta: [{ title: "Admin — Backups" }] }),
  component: () => (
    <AdminShell eyebrow="System" title="النسخ الاحتياطي" subtitle="حالة النسخ الاحتياطي واستعادة البيانات.">
      <AdminCard title="النسخ الأخيرة" icon={DatabaseBackup}>
        <p className="text-sm text-muted-foreground">النسخ الاحتياطي مُدار تلقائياً بواسطة النظام.</p>
      </AdminCard>
    </AdminShell>
  ),
});