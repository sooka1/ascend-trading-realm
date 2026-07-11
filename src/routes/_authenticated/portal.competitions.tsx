import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, PortalCard } from "@/components/portal-shell";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/competitions")({
  head: () => ({
    meta: [
      { title: "اشتراكات المسابقات — بوابة العميل" },
      { name: "description", content: "سجل خصومات ومسجّلات المسابقات لحسابك." },
    ],
  }),
  component: PortalCompetitionsPage,
});

type Entry = {
  id: string;
  competition_id: string | null;
  tier_fee: number;
  currency: string;
  status: string;
  created_at: string;
};

const STATUS_AR: Record<string, { label: string; cls: string }> = {
  active: { label: "نشط", cls: "border-emerald-400/40 text-emerald-300 bg-emerald-400/10" },
  pending: { label: "قيد المعالجة", cls: "border-amber-400/40 text-amber-300 bg-amber-400/10" },
  cancelled: { label: "ملغى", cls: "border-white/15 text-muted-foreground bg-white/[0.03]" },
  refunded: { label: "مُعاد", cls: "border-white/15 text-muted-foreground bg-white/[0.03]" },
};

function PortalCompetitionsPage() {
  const [rows, setRows] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) return setLoading(false);
      const { data } = await supabase
        .from("competition_entries")
        .select("id,competition_id,tier_fee,currency,status,created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      setRows((data ?? []) as Entry[]);
      setLoading(false);
    })();
  }, []);

  const total = rows.reduce((s, r) => s + Number(r.tier_fee), 0);

  return (
    <PortalShell
      eyebrow="بوابة العميل"
      title="اشتراكات المسابقات"
      subtitle="سجل الخصومات من محفظتك مقابل الاشتراك في المسابقات."
    >
      <PortalCard title="سجل اشتراكات المسابقات" icon={Trophy}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gold" />
            <span className="text-sm text-muted-foreground">إجمالي المصروف</span>
          </div>
          <span className="font-mono tabular-nums text-lg font-semibold text-gold">
            ${total.toFixed(2)}
          </span>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">جارٍ التحميل…</p>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            لا توجد اشتراكات مسابقات بعد.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-muted-foreground">
                  <th className="py-2 text-start font-medium">التاريخ</th>
                  <th className="py-2 text-start font-medium">المسابقة</th>
                  <th className="py-2 text-start font-medium">الرسم</th>
                  <th className="py-2 text-start font-medium">الحالة</th>
                  <th className="py-2 text-start font-medium">المعرّف</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const st = STATUS_AR[r.status] ?? {
                    label: r.status,
                    cls: "border-white/15 text-muted-foreground bg-white/[0.03]",
                  };
                  return (
                    <tr key={r.id} className="border-b border-white/5">
                      <td className="py-2 font-mono text-xs tabular-nums">
                        {new Date(r.created_at).toLocaleString("ar")}
                      </td>
                      <td className="py-2">{r.competition_id ?? "—"}</td>
                      <td className="py-2 font-mono tabular-nums">
                        ${Number(r.tier_fee).toFixed(2)} {r.currency}
                      </td>
                      <td className="py-2">
                        <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-2 font-mono text-[10px] text-muted-foreground">
                        {r.id.slice(0, 8)}…
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PortalCard>
    </PortalShell>
  );
}