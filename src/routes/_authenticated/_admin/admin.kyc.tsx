import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, AdminCard, StatusPill } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { BadgeCheck, ShieldCheck, Clock, XCircle, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/_admin/admin/kyc")({
  head: () => ({ meta: [{ title: "Admin — KYC Verification" }] }),
  component: AdminKyc,
});

type Row = {
  id: string;
  email: string | null;
  display_name: string | null;
  verification_status: "unverified" | "pending" | "approved" | "rejected";
  id_front_url: string | null;
  id_back_url: string | null;
  selfie_url: string | null;
  verification_notes: string | null;
  verified_at: string | null;
};

function AdminKyc() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id,email,display_name,verification_status,id_front_url,id_back_url,selfie_url,verification_notes,verified_at")
      .neq("verification_status", "unverified")
      .order("verified_at", { ascending: false, nullsFirst: true });
    setRows(((data ?? []) as Row[]));
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => rows.filter((r) => filter === "all" || r.verification_status === filter), [rows, filter]);

  async function decide(row: Row, decision: "approved" | "rejected") {
    const notes = decision === "rejected" ? window.prompt("سبب الرفض (اختياري):") ?? null : null;
    const { error } = await supabase
      .from("profiles")
      .update({ verification_status: decision, verified_at: decision === "approved" ? new Date().toISOString() : null, verification_notes: notes })
      .eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(decision === "approved" ? "تم توثيق الحساب" : "تم رفض الطلب");
    await load();
  }

  return (
    <AdminShell eyebrow="Verification" title="توثيق الحسابات" subtitle="مراجعة صور الهوية والصور الشخصية.">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["pending","approved","rejected","all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full border px-3 py-1 text-xs ${filter===f?"border-gold/40 bg-gold/10 text-gold":"border-white/10 text-muted-foreground hover:border-gold/30"}`}>
            {f === "pending" ? "قيد المراجعة" : f === "approved" ? "موثّق" : f === "rejected" ? "مرفوض" : "الكل"}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا توجد طلبات.</p>
      ) : (
        <div className="grid gap-4">
          {filtered.map((r) => (
            <KycRow key={r.id} row={r} onDecide={decide} />
          ))}
        </div>
      )}
    </AdminShell>
  );
}

function KycRow({ row, onDecide }: { row: Row; onDecide: (r: Row, d: "approved" | "rejected") => void }) {
  const [urls, setUrls] = useState<{ front: string | null; back: string | null; selfie: string | null }>({ front: null, back: null, selfie: null });
  useEffect(() => {
    void (async () => {
      async function sign(path: string | null) {
        if (!path) return null;
        const { data } = await supabase.storage.from("kyc").createSignedUrl(path, 600);
        return data?.signedUrl ?? null;
      }
      const [front, back, selfie] = await Promise.all([sign(row.id_front_url), sign(row.id_back_url), sign(row.selfie_url)]);
      setUrls({ front, back, selfie });
    })();
  }, [row.id]);

  return (
    <AdminCard title={row.display_name || row.email || row.id}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">{row.email}</div>
        <StatusBadge status={row.verification_status} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Preview label="الهوية — وجه" url={urls.front} />
        <Preview label="الهوية — ظهر" url={urls.back} />
        <Preview label="صورة شخصية" url={urls.selfie} />
      </div>
      {row.verification_notes && (
        <p className="mt-3 rounded-md border border-white/5 bg-white/[0.02] p-2 text-xs text-muted-foreground">ملاحظة: {row.verification_notes}</p>
      )}
      {row.verification_status !== "approved" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onDecide(row, "approved")} className="bg-gold text-background hover:bg-[oklch(0.88_0.11_90)]">
            <Check className="ml-1 h-4 w-4" /> قبول وتوثيق
          </Button>
          {row.verification_status !== "rejected" && (
            <Button size="sm" variant="outline" onClick={() => onDecide(row, "rejected")}>
              <X className="ml-1 h-4 w-4" /> رفض
            </Button>
          )}
        </div>
      )}
    </AdminCard>
  );
}

function Preview({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="space-y-1">
      <p className="font-mono text-[10px] uppercase tracking-widest text-gold/80">{label}</p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-md border border-white/10 bg-white/5">
          <img src={url} alt={label} className="h-40 w-full object-cover" />
        </a>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-white/10 bg-white/[0.02] text-xs text-muted-foreground">لم يُرفع</div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Row["verification_status"] }) {
  const map = {
    approved: { label: "موثّق", icon: BadgeCheck, cls: "border-gold/40 bg-gold/10 text-gold" },
    pending: { label: "قيد المراجعة", icon: Clock, cls: "border-amber-400/30 bg-amber-400/10 text-amber-200" },
    rejected: { label: "مرفوض", icon: XCircle, cls: "border-red-400/30 bg-red-400/10 text-red-200" },
    unverified: { label: "غير موثّق", icon: ShieldCheck, cls: "border-white/10 bg-white/[0.03] text-muted-foreground" },
  } as const;
  const { label, icon: Icon, cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${cls}`}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}