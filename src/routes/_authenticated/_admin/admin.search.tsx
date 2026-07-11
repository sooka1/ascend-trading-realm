import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, AdminCard } from "@/components/admin-shell";
import { Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listUsersWithRoles } from "@/lib/admin.functions";

function SearchView() {
  const [q, setQ] = useState("");
  const fn = useServerFn(listUsersWithRoles);
  const term = q.trim();
  const { data, isFetching, error } = useQuery({
    queryKey: ["admin-search", term],
    queryFn: () => fn({ data: { search: term } }),
    enabled: term.length > 0,
  });
  return (
    <AdminShell eyebrow="System" title="البحث الشامل" subtitle="بحث موحّد عبر بيانات المنصة.">
      <AdminCard title="البحث" icon={Search}>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث بالاسم أو البريد الإلكتروني..."
          className="w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-gold/40"
        />
        {!term && (
          <p className="mt-3 text-xs text-muted-foreground">اكتب استعلاماً لبدء البحث.</p>
        )}
        {term && isFetching && (
          <p className="mt-3 text-xs text-muted-foreground">جارٍ البحث…</p>
        )}
        {error && (
          <p className="mt-3 text-xs text-red-400">{(error as Error).message}</p>
        )}
        {term && !isFetching && data && (
          <div className="mt-4 space-y-2">
            {data.users.length === 0 ? (
              <p className="text-xs text-muted-foreground">لا توجد نتائج.</p>
            ) : (
              data.users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium">{u.display_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(u.roles ?? []).join(", ") || "user"}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </AdminCard>
    </AdminShell>
  );
}

export const Route = createFileRoute("/_authenticated/_admin/admin/search")({
  head: () => ({ meta: [{ title: "Admin — Search" }] }),
  component: SearchView,
});