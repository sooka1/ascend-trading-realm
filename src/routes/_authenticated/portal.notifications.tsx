import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, PortalCard } from "@/components/portal-shell";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { PushPermissionButton } from "@/components/push-permission-button";

export const Route = createFileRoute("/_authenticated/portal/notifications")({
  head: () => ({
    meta: [
      { title: "الإشعارات — بوابة العميل" },
      { name: "description", content: "مركز الإشعارات الموحّد لحسابك الاستثماري." },
    ],
  }),
  component: NotificationsPage,
});

type Notification = { id: string; title: string; body: string | null; read_at: string | null; created_at: string; priority?: string | null };

function NotificationsPage() {
  const [tab, setTab] = useState<"unread" | "read" | "all">("unread");
  const [items, setItems] = useState<Notification[]>([]);

  async function load() {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as Notification[]);
  }

  useEffect(() => { void load(); }, []);

  async function markRead(id: string) {
    const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    void load();
  }

  async function markAllRead() {
    const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
    if (error) return toast.error(error.message);
    toast.success("تم وضع علامة على الكل كمقروء");
    void load();
  }

  const filtered = items.filter((n) =>
    tab === "all" ? true : tab === "unread" ? !n.read_at : !!n.read_at,
  );

  return (
    <PortalShell
      eyebrow="مركز الإشعارات"
      title="الإشعارات"
      subtitle="كل ما يخص حسابك ومحفظتك ومستنداتك ومحادثات الدعم في مكان واحد."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <PushPermissionButton />
          <Button onClick={markAllRead} variant="outline" className="rounded-sm border-white/10 hover:border-gold/60">
            <CheckCheck className="ml-2 h-4 w-4" /> وضع علامة على الكل كمقروء
          </Button>
        </div>
      }
    >
      <div className="mb-5 inline-flex gap-1 rounded-md border border-white/10 bg-card/40 p-1 backdrop-blur-xl">
        {(["unread", "read", "all"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-sm px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition ${
              tab === t ? "bg-gold/[0.12] text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "unread" ? "غير مقروءة" : t === "read" ? "مقروءة" : "الكل"}
            <span className="ms-2 tabular-nums">{items.filter((n) => t === "all" ? true : t === "unread" ? !n.read_at : !!n.read_at).length}</span>
          </button>
        ))}
      </div>

      <PortalCard title="الإشعارات" icon={Bell}>
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">لا توجد إشعارات في هذا التصنيف.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {filtered.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {!n.read_at && <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />}
                    <p className="font-medium">{n.title}</p>
                    {n.priority === "high" && (
                      <span className="rounded-sm border border-red-400/30 bg-red-400/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-red-400">مهم</span>
                    )}
                  </div>
                  {n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}
                  <p className="mt-1 font-mono text-[10px] tracking-wide text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.read_at && (
                  <Button size="sm" variant="ghost" onClick={() => markRead(n.id)} className="shrink-0">
                    قراءة
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </PortalCard>
    </PortalShell>
  );
}