import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, PortalCard } from "@/components/portal-shell";
import { Newspaper } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/updates")({
  head: () => ({
    meta: [
      { title: "التحديثات — بوابة العميل" },
      { name: "description", content: "آخر الإعلانات والتحديثات من HK Investment Management." },
    ],
  }),
  component: UpdatesPage,
});

type Update = { id: string; title: string; body: string | null; created_at: string };

function UpdatesPage() {
  const [rows, setRows] = useState<Update[]>([]);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id,title,body,created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      setRows((data ?? []) as Update[]);
    })();
  }, []);

  return (
    <PortalShell eyebrow="الأنشطة" title="التحديثات والإعلانات" subtitle="آخر التحديثات، الإعلانات، والتنبيهات من فريق HK.">
      <PortalCard title={`التحديثات · ${rows.length}`} icon={Newspaper}>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">لا توجد تحديثات جديدة.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((u) => (
              <li key={u.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-base font-semibold">{u.title}</h3>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
                {u.body && <p className="mt-2 text-sm text-muted-foreground">{u.body}</p>}
              </li>
            ))}
          </ul>
        )}
      </PortalCard>
    </PortalShell>
  );
}
