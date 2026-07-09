import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  AdminShell,
  AdminCard,
  AdminKpi,
  StatusPill,
  fmtInt,
  fmtMoney,
} from "@/components/admin-shell";
import { listInvoicesAdmin } from "@/lib/admin.functions";
import { FileText, Download, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/invoices")({
  head: () => ({
    meta: [
      { title: "Admin — Invoices" },
      { name: "description", content: "Invoice ledger derived from subscriptions and approved deposits." },
    ],
  }),
  component: AdminInvoices,
});

function AdminInvoices() {
  const fetchList = useServerFn(listInvoicesAdmin);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "invoices"],
    queryFn: () => fetchList(),
    staleTime: 30_000,
  });
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<"all" | "subscription" | "deposit">("all");

  const rows = useMemo(() => {
    const list = (data?.rows ?? []) as any[];
    const term = search.trim().toLowerCase();
    return list
      .filter((r) => kind === "all" || r.kind === kind)
      .filter((r) =>
        !term
          ? true
          : [r.number, r.profile?.email, r.profile?.display_name, r.description]
              .filter(Boolean)
              .some((v: string) => v.toLowerCase().includes(term)),
      );
  }, [data, search, kind]);

  function exportCsv() {
    const header = ["Number", "Kind", "Client", "Email", "Description", "Amount", "Currency", "Status", "Issued"].join(",");
    const body = rows
      .map((r) =>
        [
          r.number,
          r.kind,
          csv(r.profile?.display_name ?? ""),
          csv(r.profile?.email ?? ""),
          csv(r.description),
          r.amount,
          r.currency,
          r.status,
          new Date(r.issued_at).toISOString(),
        ].join(","),
      )
      .join("\n");
    downloadFile(`invoices-${Date.now()}.csv`, `${header}\n${body}`);
  }

  const t = data?.totals;

  return (
    <AdminShell
      eyebrow="Invoice Ledger"
      title="سجل الفواتير"
      subtitle="الفواتير المستمدة من الاشتراكات والإيداعات المعتمدة، مع تصدير للمحاسبة."
      actions={
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-md border border-gold/30 bg-gold/[0.06] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-gold transition hover:bg-gold/[0.12]"
        >
          <Download className="h-3.5 w-3.5" /> تصدير CSV
        </button>
      }
    >
      {error ? (
        <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200">
          {(error as Error).message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminKpi icon={FileText} label="عدد الفواتير" value={fmtInt(t?.count)} />
        <AdminKpi label="مدفوعة" value={fmtMoney(t?.paid)} tone="positive" />
        <AdminKpi label="مستحقة" value={fmtMoney(t?.due)} tone="warning" />
      </div>

      <AdminCard title="السجل الكامل" icon={FileText} className="mt-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(["all", "subscription", "deposit"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition ${
                kind === k
                  ? "border-gold/50 bg-gold/[0.08] text-foreground"
                  : "border-white/10 text-muted-foreground hover:border-gold/30"
              }`}
            >
              {k}
            </button>
          ))}
          <div className="relative ms-auto">
            <Search className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث..."
              className="w-56 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 pl-8 text-sm placeholder:text-muted-foreground focus:border-gold/40 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-2 py-2 text-start">الرقم</th>
                <th className="px-2 py-2 text-start">النوع</th>
                <th className="px-2 py-2 text-start">العميل</th>
                <th className="px-2 py-2 text-start">البند</th>
                <th className="px-2 py-2 text-start">المبلغ</th>
                <th className="px-2 py-2 text-start">الحالة</th>
                <th className="px-2 py-2 text-end">تاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-2 py-3">
                      <div className="h-6 animate-pulse rounded bg-white/[0.03]" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 py-8 text-center text-muted-foreground">
                    لا توجد فواتير.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={`${r.kind}-${r.id}`}>
                    <td className="px-2 py-2.5 font-mono text-xs">{r.number}</td>
                    <td className="px-2 py-2.5">
                      <StatusPill tone={r.kind === "subscription" ? "info" : "neutral"}>{r.kind}</StatusPill>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="font-medium">{r.profile?.display_name ?? "—"}</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {r.profile?.email ?? r.user_id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-muted-foreground">{r.description}</td>
                    <td className="px-2 py-2.5 font-semibold">{fmtMoney(r.amount, r.currency)}</td>
                    <td className="px-2 py-2.5">
                      <StatusPill
                        tone={
                          r.status === "paid"
                            ? "positive"
                            : r.status === "due" || r.status === "pending"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {r.status}
                      </StatusPill>
                    </td>
                    <td className="px-2 py-2.5 text-end font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {new Date(r.issued_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </AdminShell>
  );
}

function csv(v: string) {
  return `"${(v ?? "").replace(/"/g, '""')}"`;
}
function downloadFile(name: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}