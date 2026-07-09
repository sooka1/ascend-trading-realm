import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { listRecentAudit } from "@/lib/admin.functions";
import { History } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/audit")({
  head: () => ({
    meta: [
      { title: "Admin — Audit Log" },
      { name: "description", content: "Recent finance audit actions." },
    ],
  }),
  component: AdminAudit,
});

function AdminAudit() {
  const fetchLog = useServerFn(listRecentAudit);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "audit"],
    queryFn: () => fetchLog(),
  });

  return (
    <PageShell bare>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-widest text-gold">Admin</p>
        <h1 className="mt-1 flex items-center gap-2 font-display text-3xl font-semibold md:text-4xl">
          <History className="h-6 w-6 text-gold" /> سجل التدقيق
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">آخر 100 عملية على الطلبات المالية.</p>

        {error ? (
          <div className="glass mt-6 rounded-2xl p-6 text-sm text-red-300">
            {(error as Error).message}
          </div>
        ) : null}

        <div className="glass mt-6 overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start">التاريخ</th>
                  <th className="px-4 py-3 text-start">النوع</th>
                  <th className="px-4 py-3 text-start">الإجراء</th>
                  <th className="px-4 py-3 text-start">من → إلى</th>
                  <th className="px-4 py-3 text-start">السبب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      جارٍ التحميل…
                    </td>
                  </tr>
                ) : (data?.rows.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      لا توجد سجلات.
                    </td>
                  </tr>
                ) : (
                  data!.rows.map((a: any) => (
                    <tr key={a.id}>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{a.request_kind}</td>
                      <td className="px-4 py-3">{a.action}</td>
                      <td className="px-4 py-3 text-xs">
                        {a.from_status ?? "—"} → {a.to_status ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{a.reason ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageShell>
  );
}