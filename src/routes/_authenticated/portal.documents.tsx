import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, PortalCard } from "@/components/portal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileText, FolderOpen, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/portal/documents")({
  head: () => ({
    meta: [
      { title: "المستندات — بوابة العميل" },
      { name: "description", content: "الوصول الآمن إلى مستنداتك، التقارير، والعقود." },
    ],
  }),
  component: DocumentsPage,
});

type Doc = {
  id: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  category: string;
  description: string | null;
  created_at: string;
};

function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id,storage_path,file_name,mime_type,size_bytes,category,description,created_at")
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setDocs((data ?? []) as Doc[]);
      setLoading(false);
    })();
  }, []);

  async function download(d: Doc) {
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(d.storage_path, 60);
    if (error || !data?.signedUrl) return toast.error(error?.message ?? "تعذّر إنشاء رابط التنزيل");
    window.open(data.signedUrl, "_blank", "noopener");
  }

  const categories = useMemo(() => {
    const set = new Set(docs.map((d) => d.category));
    return ["all", ...Array.from(set)];
  }, [docs]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return docs.filter((d) => {
      if (category !== "all" && d.category !== category) return false;
      if (needle && ![d.file_name, d.category, d.description ?? ""].some((v) => v.toLowerCase().includes(needle))) return false;
      return true;
    });
  }, [docs, q, category]);

  const grouped = filtered.reduce<Record<string, Doc[]>>((acc, d) => {
    (acc[d.category] ??= []).push(d);
    return acc;
  }, {});

  return (
    <PortalShell
      eyebrow="التقارير والمستندات"
      title="مركز المستندات"
      subtitle="التقارير، العقود، إشعارات الاستحقاق، وشهادات KYC — روابط التنزيل موقّعة وتنتهي خلال 60 ثانية."
    >
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="ابحث بالاسم أو الفئة…" value={q} onChange={(e) => setQ(e.target.value)} className="ps-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-md border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition ${
                category === c
                  ? "border-gold/50 bg-gold/[0.08] text-foreground"
                  : "border-white/10 text-muted-foreground hover:border-gold/40 hover:text-foreground"
              }`}
            >
              {c === "all" ? "الكل" : c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <PortalCard title="جارٍ التحميل…" icon={FileText}>
          <p className="py-8 text-center text-sm text-muted-foreground">جلب مستنداتك…</p>
        </PortalCard>
      ) : filtered.length === 0 ? (
        <PortalCard title="لا توجد مستندات" icon={FileText}>
          <p className="py-8 text-center text-sm text-muted-foreground">لا توجد مستندات مطابقة.</p>
        </PortalCard>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, list]) => (
            <PortalCard key={cat} title={`${cat} · ${list.length}`} icon={FolderOpen}>
              <ul className="divide-y divide-white/5">
                {list.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center gap-3 py-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gold/20 bg-gold/[0.06]">
                      <FileText className="h-4 w-4 text-gold" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{d.file_name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {new Date(d.created_at).toLocaleDateString()} · {formatSize(d.size_bytes)}
                        {d.description ? ` · ${d.description}` : ""}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => download(d)}>
                      <Download className="me-1.5 h-3.5 w-3.5" /> تنزيل
                    </Button>
                  </li>
                ))}
              </ul>
            </PortalCard>
          ))}
        </div>
      )}
    </PortalShell>
  );
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
