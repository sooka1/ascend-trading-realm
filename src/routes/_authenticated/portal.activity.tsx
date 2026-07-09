import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, PortalCard } from "@/components/portal-shell";
import { ArrowDownToLine, ArrowUpFromLine, FileEdit, History } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/activity")({
  head: () => ({
    meta: [
      { title: "سجل النشاط — بوابة العميل" },
      { name: "description", content: "سجل زمني لجميع أحداث حسابك." },
    ],
  }),
  component: ActivityPage,
});

type Event = {
  id: string;
  request_kind: string;
  action: string;
  from_status: string | null;
  to_status: string | null;
  reason: string | null;
  created_at: string;
};

const KIND_ICON: Record<string, typeof History> = {
  deposit: ArrowDownToLine,
  withdrawal: ArrowUpFromLine,
  investment_request: FileEdit,
};

const KIND_LABEL: Record<string, string> = {
  deposit: "إيداع",
  withdrawal: "سحب",
  investment_request: "طلب استثمار",
};

function ActivityPage() {
  const [rows, setRows] = useState<Event[]>([]);

  useEffect(() => {
    void (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("finance_audit_log")
        .select("id,request_kind,action,from_status,to_status,reason,created_at")
        .eq("target_user_id", u.user.id)
        .order("created_at", { ascending: false })
        .limit(200);
      setRows((data ?? []) as Event[]);
    })();
  }, []);

  return (
    <PortalShell eyebrow="الأنشطة" title="سجل النشاط" subtitle="تسلسل زمني كامل لجميع الأحداث على حسابك.">
      <PortalCard title={`الأحداث · ${rows.length}`} icon={History}>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">لا توجد أحداث بعد.</p>
        ) : (
          <ol className="relative space-y-4 border-s border-white/10 ps-6">
            {rows.map((r) => {
              const Icon = KIND_ICON[r.request_kind] ?? History;
              return (
                <li key={r.id} className="relative">
                  <span className="absolute -start-[34px] top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.08]">
                    <Icon className="h-3 w-3 text-gold" />
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{KIND_LABEL[r.request_kind] ?? r.request_kind}</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{r.action}</span>
                    {r.from_status && r.to_status && (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {r.from_status} → <span className="text-gold">{r.to_status}</span>
                      </span>
                    )}
                  </div>
                  {r.reason && <p className="mt-1 text-sm text-muted-foreground">{r.reason}</p>}
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </PortalCard>
    </PortalShell>
  );
}
