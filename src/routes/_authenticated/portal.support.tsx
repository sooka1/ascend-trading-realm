import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, LifeBuoy, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/portal/support")({
  head: () => ({
    meta: [
      { title: "الدعم — بوابة العميل" },
      { name: "description", content: "افتح تذكرة دعم وتابع الردود من فريق HK Investment Management." },
    ],
  }),
  component: SupportPage,
});

type Ticket = {
  id: string;
  subject: string;
  category: string | null;
  status: "open" | "pending" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  last_message_at: string;
  created_at: string;
};

type TicketMessage = {
  id: string;
  ticket_id: string;
  sender_id: string;
  body: string;
  is_staff: boolean;
  created_at: string;
};

const newTicketSchema = z.object({
  subject: z.string().trim().min(3, "الموضوع قصير جداً").max(200),
  category: z.string().trim().max(50).optional(),
  body: z.string().trim().min(5, "الرسالة قصيرة جداً").max(4000),
});

function SupportPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "", body: "" });

  useEffect(() => {
    void (async () => {
      const { data: u } = await supabase.auth.getUser();
      setUid(u.user?.id ?? null);
      await loadTickets();
    })();
  }, []);

  async function loadTickets() {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("id,subject,category,status,priority,last_message_at,created_at")
      .order("last_message_at", { ascending: false });
    if (error) return toast.error(error.message);
    setTickets((data ?? []) as Ticket[]);
  }

  async function openTicket(t: Ticket) {
    setSelected(t);
    const { data, error } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", t.id)
      .order("created_at", { ascending: true });
    if (error) return toast.error(error.message);
    setMessages((data ?? []) as TicketMessage[]);
  }

  async function submitNew() {
    const parsed = newTicketSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "بيانات غير صالحة");
    if (!uid) return;
    const { data: t, error } = await supabase
      .from("support_tickets")
      .insert({ user_id: uid, subject: parsed.data.subject, category: parsed.data.category || null })
      .select()
      .single();
    if (error || !t) return toast.error(error?.message ?? "تعذّر الإنشاء");
    const { error: mErr } = await supabase
      .from("ticket_messages")
      .insert({ ticket_id: t.id, sender_id: uid, body: parsed.data.body, is_staff: false });
    if (mErr) return toast.error(mErr.message);
    toast.success("تم فتح التذكرة");
    setForm({ subject: "", category: "", body: "" });
    setCreating(false);
    await loadTickets();
    await openTicket(t as Ticket);
  }

  async function reply() {
    if (!selected || !uid || !draft.trim()) return;
    const { error } = await supabase
      .from("ticket_messages")
      .insert({ ticket_id: selected.id, sender_id: uid, body: draft.trim(), is_staff: false });
    if (error) return toast.error(error.message);
    await supabase
      .from("support_tickets")
      .update({ last_message_at: new Date().toISOString(), status: "open" })
      .eq("id", selected.id);
    setDraft("");
    await openTicket(selected);
    await loadTickets();
  }

  return (
    <PageShell bare>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold">الدعم</p>
            <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">تذاكر الدعم</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setCreating((v) => !v)} className="bg-[var(--gradient-gold)] font-semibold text-background">
              <Plus className="ml-2 h-4 w-4" /> تذكرة جديدة
            </Button>
            <Button asChild variant="ghost" className="text-muted-foreground">
              <Link to="/portal"><ArrowLeft className="ml-2 h-4 w-4" />رجوع</Link>
            </Button>
          </div>
        </div>

        {creating && (
          <div className="glass mt-6 rounded-3xl p-6">
            <h2 className="font-display text-lg font-semibold">فتح تذكرة جديدة</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Input
                placeholder="الموضوع"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              />
              <Input
                placeholder="الفئة (اختياري) — مثال: حساب، إيداع، تقارير"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
            </div>
            <Textarea
              className="mt-3 min-h-[120px]"
              placeholder="اكتب استفسارك بالتفصيل…"
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setCreating(false)}>إلغاء</Button>
              <Button onClick={submitNew} className="bg-[var(--gradient-gold)] font-semibold text-background">
                إرسال
              </Button>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div className="glass rounded-3xl p-4">
            <h2 className="px-2 pb-3 text-sm font-medium text-muted-foreground">تذاكري</h2>
            {tickets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
                <LifeBuoy className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">لا توجد تذاكر بعد.</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {tickets.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => openTicket(t)}
                      className={`w-full rounded-xl px-3 py-3 text-start text-sm transition ${
                        selected?.id === t.id ? "bg-white/10" : "hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">{t.subject}</span>
                        <StatusPill status={t.status} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.category ?? "عام"} · {new Date(t.last_message_at).toLocaleDateString()}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass rounded-3xl p-6">
            {!selected ? (
              <div className="grid h-full min-h-[300px] place-items-center text-center text-sm text-muted-foreground">
                اختر تذكرة من القائمة أو افتح تذكرة جديدة.
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold">{selected.subject}</h2>
                    <p className="text-xs text-muted-foreground">
                      {selected.category ?? "عام"} · فُتحت في {new Date(selected.created_at).toLocaleString()}
                    </p>
                  </div>
                  <StatusPill status={selected.status} />
                </div>
                <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        m.is_staff ? "mr-auto bg-white/5" : "ml-auto bg-gold/15"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {m.is_staff ? "فريق الدعم" : "أنت"} · {new Date(m.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                {selected.status !== "closed" && (
                  <div className="mt-4 flex items-end gap-2 border-t border-white/5 pt-4">
                    <Textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="اكتب رداً…"
                      className="min-h-[70px] bg-white/[0.03]"
                    />
                    <Button onClick={reply} className="bg-[var(--gradient-gold)] font-semibold text-background">
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
    open: { label: "مفتوحة", className: "bg-emerald-500/15 text-emerald-300" },
    pending: { label: "معلّقة", className: "bg-amber-500/15 text-amber-300" },
    resolved: { label: "محلولة", className: "bg-sky-500/15 text-sky-300" },
    closed: { label: "مغلقة", className: "bg-white/10 text-muted-foreground" },
  };
  const s = map[status];
  return <span className={`rounded-full px-2 py-0.5 text-[10px] ${s.className}`}>{s.label}</span>;
}