import { Link } from "@tanstack/react-router";
import { Bell, CheckCheck } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Notif = { id: string; title: string; body: string | null; read_at: string | null; created_at: string };

export function NotificationsPopover({ size = "md" }: { size?: "sm" | "md" }) {
  const qc = useQueryClient();
  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  const { data: notifs = [] } = useQuery({
    queryKey: ["portal", "notifications", "recent"],
    queryFn: async (): Promise<Notif[]> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data } = await supabase
        .from("notifications")
        .select("id,title,body,read_at,created_at")
        .eq("user_id", u.user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      return (data ?? []) as Notif[];
    },
    refetchInterval: 30000,
  });
  const unread = notifs.filter((n) => !n.read_at).length;

  async function markAllRead() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    // Optimistic: flip unread → read locally, rollback on failure.
    const prev = qc.getQueryData<Notif[]>(["portal", "notifications", "recent"]);
    const now = new Date().toISOString();
    qc.setQueryData<Notif[]>(["portal", "notifications", "recent"], (old) =>
      (old ?? []).map((n) => (n.read_at ? n : { ...n, read_at: now })),
    );
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("user_id", u.user.id)
      .is("read_at", null);
    if (error) {
      // Rollback
      if (prev) qc.setQueryData(["portal", "notifications", "recent"], prev);
      toast.error(error.message);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["portal", "notifications"] });
  }

  return (
    <Popover>
      <PopoverTrigger
        aria-label="الإشعارات"
        className={`relative inline-flex ${dim} items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground transition hover:border-gold/40 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
      >
        <Bell className={icon} />
        {unread > 0 && (
          <span className="absolute -top-1 -end-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 font-mono text-[10px] font-semibold text-background">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 border-white/10 bg-card/95 p-0 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-gold/80">الإشعارات</p>
          {unread > 0 && (
            <button onClick={markAllRead} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition hover:text-gold">
              <CheckCheck className="h-3 w-3" /> تعليم الكل كمقروء
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifs.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">لا توجد إشعارات.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {notifs.map((n) => (
                <li key={n.id} className={`px-3 py-2.5 text-xs ${n.read_at ? "opacity-70" : "bg-gold/[0.04]"}`}>
                  <div className="flex items-center gap-2">
                    {!n.read_at && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />}
                    <p className="min-w-0 flex-1 truncate font-medium text-foreground">{n.title}</p>
                  </div>
                  {n.body && <p className="mt-1 line-clamp-2 text-muted-foreground">{n.body}</p>}
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70">
                    {new Date(n.created_at).toLocaleString("ar")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-white/5 p-2 text-center">
          <Link to="/portal/notifications" className="text-xs text-gold hover:underline">
            عرض كل الإشعارات
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}