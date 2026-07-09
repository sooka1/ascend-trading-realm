import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, PortalCard } from "@/components/portal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, ExternalLink, FileText, Printer, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/statements")({
  head: () => ({
    meta: [
      { title: "الكشوف — بوابة العميل" },
      { name: "description", content: "كشوف الحساب اليومية، الشهرية، الربع سنوية والسنوية." },
    ],
  }),
  component: StatementsPage,
});

type Statement = {
  id: string;
  kind: string;
  period: string;
  title: string;
  file_url: string | null;
  created_at: string;
};

const KINDS = ["all", "daily", "weekly", "monthly", "quarterly", "annual"] as const;
const KIND_LABEL: Record<string, string> = {
  all: "الكل",
  daily: "يومي",
  weekly: "أسبوعي",
  monthly: "شهري",
  quarterly: "ربع سنوي",
  annual: "سنوي",
};

function StatementsPage() {
  const [rows, setRows] = useState<Statement[]>([]);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("all");

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from("statements").select("*").order("created_at", { ascending: false }).limit(500);
      setRows((data ?? []) as Statement[]);
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (kind !== "all" && r.kind?.toLowerCase() !== kind) return false;
      if (needle && ![r.title, r.period, r.kind].some((v) => v?.toLowerCase().includes(needle))) return false;
      return true;
    });
  }, [rows, q, kind]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.kind] = (c[r.kind] || 0) + 1;
    return c;
  }, [rows]);

  const exportCsv = () => {
    const header = ["title", "kind", "period", "created_at", "file_url"];
    const csv = [header.join(","), ...filtered.map((r) => header.map((h) => JSON.stringify((r as unknown as Record<string, unknown>)[h] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statements-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PortalShell
      eyebrow="التقارير"
      title="كشوف الحساب"
      subtitle="جميع كشوفك الرسمية في مكان واحد — قابلة للتنزيل والطباعة."
      actions={
        <>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="me-1.5 h-3.5 w-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="me-1.5 h-3.5 w-3.5" /> طباعة
          </Button>
        </>
      }
    >
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="ابحث بالعنوان أو الفترة…" value={q} onChange={(e) => setQ(e.target.value)} className="ps-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`rounded-md border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition ${
                kind === k
                  ? "border-gold/50 bg-gold/[0.08] text-foreground"
                  : "border-white/10 text-muted-foreground hover:border-gold/40 hover:text-foreground"
              }`}
            >
              {KIND_LABEL[k]}
              <span className="ms-1.5 tabular-nums opacity-70">{counts[k] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <PortalCard title="مركز الكشوف" icon={FileText}>
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {rows.length === 0 ? "لا توجد كشوف بعد." : "لا توجد نتائج مطابقة لعوامل التصفية."}
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {filtered.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gold/20 bg-gold/[0.06]">
                  <FileText className="h-4 w-4 text-gold" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.title}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {s.kind} · {s.period} · {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
                {s.file_url ? (
                  <div className="flex items-center gap-1.5">
                    <a href={s.file_url} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="me-1.5 h-3.5 w-3.5" /> عرض
                      </Button>
                    </a>
                    <a href={s.file_url} download>
                      <Button size="sm">
                        <Download className="me-1.5 h-3.5 w-3.5" /> تنزيل
                      </Button>
                    </a>
                  </div>
                ) : (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">قيد الإعداد</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </PortalCard>
    </PortalShell>
  );
}