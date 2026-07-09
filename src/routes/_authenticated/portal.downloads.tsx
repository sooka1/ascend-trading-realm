import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, PortalCard } from "@/components/portal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, ExternalLink, FileText, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/downloads")({
  head: () => ({
    meta: [
      { title: "التنزيلات — بوابة العميل" },
      { name: "description", content: "جميع الملفات القابلة للتنزيل: الكشوف، المستندات، والتقارير." },
    ],
  }),
  component: DownloadsPage,
});

type Row = { id: string; title: string; kind: string; url: string | null; created_at: string; source: "statement" | "document" };

function DownloadsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "statement" | "document">("all");

  useEffect(() => {
    void (async () => {
      const [{ data: s }, { data: d }] = await Promise.all([
        supabase.from("statements").select("id,title,kind,file_url,created_at").order("created_at", { ascending: false }).limit(200),
        supabase.from("documents").select("id,file_name,category,storage_path,created_at").order("created_at", { ascending: false }).limit(200),
      ]);
      const list: Row[] = [
        ...((s ?? []) as Array<{ id: string; title: string; kind: string; file_url: string | null; created_at: string }>).map((r) => ({
          id: r.id,
          title: r.title,
          kind: r.kind,
          url: r.file_url,
          created_at: r.created_at,
          source: "statement" as const,
        })),
        ...((d ?? []) as Array<{ id: string; file_name: string; category: string | null; storage_path: string; created_at: string }>).map((r) => ({
          id: r.id,
          title: r.file_name,
          kind: r.category ?? "document",
          url: r.storage_path,
          created_at: r.created_at,
          source: "document" as const,
        })),
      ].sort((a, b) => b.created_at.localeCompare(a.created_at));
      setRows(list);
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab !== "all" && r.source !== tab) return false;
      if (needle && ![r.title, r.kind].some((v) => v?.toLowerCase().includes(needle))) return false;
      return true;
    });
  }, [rows, q, tab]);

  return (
    <PortalShell eyebrow="الحساب" title="مركز التنزيلات" subtitle="جميع ملفاتك القابلة للتنزيل في مكان واحد.">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="ابحث بالاسم أو النوع…" value={q} onChange={(e) => setQ(e.target.value)} className="ps-9" />
        </div>
        {(["all", "statement", "document"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition ${
              tab === k
                ? "border-gold/50 bg-gold/[0.08] text-foreground"
                : "border-white/10 text-muted-foreground hover:border-gold/40 hover:text-foreground"
            }`}
          >
            {k === "all" ? "الكل" : k === "statement" ? "كشوف" : "مستندات"}
          </button>
        ))}
      </div>

      <PortalCard title={`الملفات · ${filtered.length}`} icon={Download}>
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">لا توجد ملفات متاحة.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {filtered.map((r) => (
              <li key={`${r.source}-${r.id}`} className="flex flex-wrap items-center gap-3 py-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gold/20 bg-gold/[0.06]">
                  <FileText className="h-4 w-4 text-gold" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{r.title}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {r.source} · {r.kind} · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                {r.url && (
                  <div className="flex items-center gap-1.5">
                    <a href={r.url} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="me-1.5 h-3.5 w-3.5" /> عرض
                      </Button>
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </PortalCard>
    </PortalShell>
  );
}
