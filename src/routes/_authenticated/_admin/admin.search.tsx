import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, AdminCard } from "@/components/admin-shell";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/search")({
  head: () => ({ meta: [{ title: "Admin — Search" }] }),
  component: () => (
    <AdminShell eyebrow="System" title="البحث الشامل" subtitle="بحث موحّد عبر بيانات المنصة.">
      <AdminCard title="البحث" icon={Search}>
        <input
          type="search"
          placeholder="ابحث عن مستخدم أو طلب أو فاتورة..."
          className="w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-gold/40"
        />
        <p className="mt-3 text-xs text-muted-foreground">اكتب استعلاماً لبدء البحث.</p>
      </AdminCard>
    </AdminShell>
  ),
});