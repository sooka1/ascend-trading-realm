import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/_admin/admin/support")({
  head: () => ({
    meta: [
      { title: "Admin — رسائل العملاء" },
      { name: "description", content: "استفسارات العملاء ورسائل الدعم." },
    ],
  }),
  component: AdminSupport,
});

type Ticket = {
  id: string;
  user_id: string;
  subject: string;
  category: string | null;
  status: "open" | "pending" | "resolved" | "closed";
  last_message_at: string;
  created_at: string;
};

type Msg = {
  id: string;
  ticket_id: string;
  sender_id: string;
  body: string;
  is_staff: boolean;
  created_at: string;
};

function AdminSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { display_name: string | null; email: string | null }>>({});
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const { data: u } = await supabase.auth.getUser();
      setUid(u.user?.id ?? null);
      await loadTickets();
      setLoading(false);
    })();
  }, []);

  async function loadTickets() {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("id,user_id,subject,category,status,last_message_at,created_at")
      .order("last_message_at", { ascending: false });
    if (error) return toast.error(error.message);
    const list = (data ?? []) as Ticket[];
    setTickets(list);
    const ids = Array.from(new Set(list.map((t) => t.user_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,display_name,email")
        .in("id", ids);
      const map: Record<string, { display_name: string | null; email: string | null }> = {};
      (profs ?? []).forEach((p: any) => {
        map[p.id] = { display_name: p.display_name, email: p.email };
      });
      setProfiles(map);
    }
  }

  async function openTicket(t: Ticket) {
    setSelected(t);
    const { data, error } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", t.id)
      .order("created_at", { ascending: true });
    if (error) return toast.error(error.message);
    setMessages((data ?? []) as Msg[]);
  }

  async function reply() {
    if (!selected || !uid || !draft.trim()) return;
    const { error } = await supabase
      .from("ticket_messages")
      .insert({ ticket_id: selected.id, sender_id: uid, body: draft.trim(), is_staff: true });
    if (error) return toast.error(error.message);
    await supabase
      .from("support_tickets")
      .update({ last_message_at: new Date().toISOString(), status: "pending" })
      .eq("id", selected.id);
    setDraft("");
    await openTicket(selected);
    await loadTickets();
  }

  async function setStatus(status: Ticket["status"]) {
    if (!selected) return;
    const { error } = await supabase.from("support_tickets").update({ status }).eq("id", selected.id);
    if (error) return toast.error(error.message);
    setSelected({ ...selected, status });
    await loadTickets();
  }

  return (
    <PageShell bare>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-widest text-gold">Admin</p>
        <h1 className="mt-1 flex items-center gap-2 font-display text-3xl font-semibold md:text-4xl">
          <MessageCircle className="h-6 w-6 text-gold" /> رسائل العملاء
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          استفسارات العملاء الواردة عبر شات الاستفسارات — يمكنك الرد وتغيير حالة الرسالة.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
          <div className="glass rounded-2xl p-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              الرسائل · {tickets.length}
            </p>
            {loading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">جارٍ التحميل…</p>
            ) : tickets.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">لا توجد رسائل بعد.</p>
            ) : (
              <ul className="space-y-1">
                {tickets.map((t) => {
                  const p = profiles[t.user_id];
                  return (
                    <li key={t.id}>
                      <button
                        onClick={() => openTicket(t)}
                        className={`w-full rounded-md border px-3 py-2.5 text-start text-sm transition ${
                          selected?.id === t.id
                            ? "border-gold/40 bg-gold/[0.08]"
                            : "border-white/10 bg-white/[0.02] hover:border-gold/30"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium">{t.subject}</span>
                          <StatusPill status={t.status} />
                        </div>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {p?.display_name ?? p?.email ?? t.user_id.slice(0, 8)} ·{" "}
                          {new Date(t.last_message_at).toLocaleString()}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="glass rounded-2xl p-4">
            {!selected ? (
              <div className="grid min-h-[280px] place-items-center text-center text-sm text-muted-foreground">
                اختر رسالة من القائمة لعرضها والرد عليها.
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold">{selected.subject}</h2>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {profiles[selected.user_id]?.display_name ?? profiles[selected.user_id]?.email ?? selected.user_id} ·{" "}
                      {new Date(selected.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={selected.status} />
                    <select
                      value={selected.status}
                      onChange={(e) => setStatus(e.target.value as Ticket["status"])}
                      className="rounded-md border border-white/10 bg-white/[0.02] px-2 py-1 text-xs"
                    >
                      <option value="open">مفتوحة</option>
                      <option value="pending">معلّقة</option>
                      <option value="resolved">محلولة</option>
                      <option value="closed">مغلقة</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex-1 space-y-3 overflow-y-auto pe-1">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[85%] rounded-md border px-3 py-2 text-sm ${
                        m.is_staff
                          ? "ms-auto border-gold/20 bg-gold/[0.08]"
                          : "me-auto border-white/5 bg-white/[0.03]"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {m.is_staff ? "الإدارة" : "العميل"} · {new Date(m.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                {selected.status !== "closed" && (
                  <div className="mt-4 flex items-end gap-2 border-t border-white/5 pt-4">
                    <Textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="اكتب رداً للعميل…"
                      className="min-h-[70px] bg-white/[0.02]"
                    />
                    <Button size="sm" onClick={reply}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function StatusPill({ status }: { status: Ticket["status"] }) {
  const map: Record<Ticket["status"], { label: string; className: string }> = {
    open: { label: "مفتوحة", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    pending: { label: "معلّقة", className: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
    resolved: { label: "محلولة", className: "border-sky-500/30 bg-sky-500/10 text-sky-300" },
    closed: { label: "مغلقة", className: "border-white/10 bg-white/[0.03] text-muted-foreground" },
  };
  const s = map[status];
  return (
    <span className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${s.className}`}>
      {s.label}
    </span>
  );
}
