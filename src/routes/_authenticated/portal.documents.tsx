import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText, Search } from "lucide-react";
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

  const filtered = docs.filter(
    (d) =>
      !q ||
      d.file_name.toLowerCase().includes(q.toLowerCase()) ||
      d.category.toLowerCase().includes(q.toLowerCase()),
  );

  const grouped = filtered.reduce<Record<string, Doc[]>>((acc, d) => {
    (acc[d.category] ??= []).push(d);
    return acc;
  }, {});

  return (
    <PageShell bare>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold">مركز المستندات</p>
            <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">مستنداتي</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              التقارير، العقود، إشعارات الاستحقاق، وشهادات KYC. الروابط موقّعة وتنتهي خلال 60 ثانية.
            </p>
          </div>
          <Button asChild variant="ghost" className="text-muted-foreground">
            <Link to="/portal"><ArrowLeft className="ml-2 h-4 w-4" />رجوع للبوابة</Link>
          </Button>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث بالاسم أو الفئة…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="mt-8 space-y-6">
          {loading ? (
            <div className="glass rounded-3xl p-8 text-center text-sm text-muted-foreground">جارٍ التحميل…</div>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">لا توجد مستندات مطابقة.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, list]) => (
              <div key={category} className="glass rounded-3xl p-6">
                <h2 className="font-display text-lg font-semibold capitalize">{category}</h2>
                <ul className="mt-4 divide-y divide-white/5">
                  {list.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{d.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(d.created_at).toLocaleDateString()} · {formatSize(d.size_bytes)}
                          {d.description ? ` · ${d.description}` : ""}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => download(d)}>
                        <Download className="mr-2 h-4 w-4" /> تنزيل
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>
    </PageShell>
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