import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, PortalCard } from "@/components/portal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LifeBuoy, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { sendSupportInquiry } from "@/lib/support-inquiry.functions";
import {
  ensureMyKeypair,
  encryptFor,
  decryptChatBody,
  getSuperAdminPublicKey,
} from "@/lib/e2ee";
import { EncryptedBody } from "@/components/encrypted-body";

export const Route = createFileRoute("/_authenticated/portal/support")({
  head: () => ({
    meta: [
      { title: "الدعم — بوابة العميل" },
      { name: "description", content: "افتح تذكرة دعم وتابع الردود من فريق HKEX Invest." },
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
  body_admin: string | null;
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
  const [userEmail, setUserEmail] = useState<string>("");
  const [feedback, setFeedback] = useState<{ kind: "complaint" | "suggestion"; subject: string; message: string }>({
    kind: "complaint",
    subject: "",
    message: "",
  });
  const [sendingFb, setSendingFb] = useState(false);
  const sendInquiry = useServerFn(sendSupportInquiry);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "", body: "" });
  const [mySk, setMySk] = useState<string | null>(null);
  const [myPk, setMyPk] = useState<string | null>(null);
  const [adminPk, setAdminPk] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { data: u } = await supabase.auth.getUser();
      const id = u.user?.id ?? null;
      setUid(id);
      setUserEmail(u.user?.email ?? "");
      if (id) {
        const kp = await ensureMyKeypair(id);
        setMySk(kp.secretKey);
        setMyPk(kp.publicKey);
        setAdminPk(await getSuperAdminPublicKey());
      }
      await loadTickets();
    })();
  }, []);

  async function submitFeedback() {
    if (!feedback.message.trim() || feedback.message.trim().length < 5) {
      toast.error("اكتب رسالة أطول");
      return;
    }
    if (!userEmail) {
      toast.error("بريدك الإلكتروني غير متوفر");
      return;
    }
    setSendingFb(true);
    try {
      await sendInquiry({
        data: {
          kind: feedback.kind,
          name: userEmail.split("@")[0],
          email: userEmail,
          subject: feedback.subject || undefined,
          message: feedback.message.trim(),
          source: "portal/support",
        },
      });
      toast.success("تم إرسال رسالتك للدعم الفني");
      setFeedback({ kind: "complaint", subject: "", message: "" });
    } catch (e: any) {
      toast.error(e?.message ?? "تعذّر الإرسال");
    } finally {
      setSendingFb(false);
    }
  }

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
    if (!mySk || !myPk) return toast.error("جارٍ تجهيز التشفير");
    const { data: t, error } = await supabase
      .from("support_tickets")
      .insert({ user_id: uid, subject: parsed.data.subject, category: parsed.data.category || null })
      .select()
      .single();
    if (error || !t) return toast.error(error?.message ?? "تعذّر الإنشاء");
    const bodyForMe = encryptFor(myPk, parsed.data.body);
    const bodyForAdmin = adminPk ? encryptFor(adminPk, parsed.data.body) : null;
    const { error: mErr } = await supabase
      .from("ticket_messages")
      .insert({ ticket_id: t.id, sender_id: uid, body: bodyForMe, body_admin: bodyForAdmin, is_staff: false });
    if (mErr) return toast.error(mErr.message);
    toast.success("تم فتح التذكرة");
    setForm({ subject: "", category: "", body: "" });
    setCreating(false);
    await loadTickets();
    await openTicket(t as Ticket);
  }

  async function reply() {
    if (!selected || !uid || !draft.trim()) return;
    if (!mySk || !myPk) return toast.error("جارٍ تجهيز التشفير");
    const text = draft.trim();
    const bodyForMe = encryptFor(myPk, text);
    const bodyForAdmin = adminPk ? encryptFor(adminPk, text) : null;
    const { error } = await supabase
      .from("ticket_messages")
      .insert({ ticket_id: selected.id, sender_id: uid, body: bodyForMe, body_admin: bodyForAdmin, is_staff: false });
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
    <PortalShell
      eyebrow="الأنشطة والاتصال"
      title="تذاكر الدعم"
      subtitle="افتح تذكرة جديدة أو تابع محادثاتك السابقة مع فريق HK."
      actions={
        <Button size="sm" onClick={() => setCreating((v) => !v)}>
          <Plus className="me-1.5 h-3.5 w-3.5" /> تذكرة جديدة
        </Button>
      }
    >
      <div className="mb-6">
        <PortalCard title="شكوى أو مقترح للدعم الفني" icon={LifeBuoy}>
          <p className="mb-3 text-xs text-muted-foreground">
            أرسل شكواك أو مقترحك مباشرة إلى فريق الدعم الفني.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <select
              value={feedback.kind}
              onChange={(e) => setFeedback((f) => ({ ...f, kind: e.target.value as "complaint" | "suggestion" }))}
              className="rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-sm"
            >
              <option value="complaint">شكوى</option>
              <option value="suggestion">مقترح</option>
            </select>
            <Input
              placeholder="الموضوع (اختياري)"
              value={feedback.subject}
              onChange={(e) => setFeedback((f) => ({ ...f, subject: e.target.value }))}
            />
          </div>
          <Textarea
            className="mt-3 min-h-[110px]"
            placeholder="اكتب رسالتك…"
            value={feedback.message}
            onChange={(e) => setFeedback((f) => ({ ...f, message: e.target.value }))}
          />
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={submitFeedback} disabled={sendingFb}>
              <Send className="me-1.5 h-3.5 w-3.5" />
              {sendingFb ? "جارٍ الإرسال…" : "إرسال للدعم"}
            </Button>
          </div>
        </PortalCard>
      </div>

      {creating && (
        <div className="mb-6">
          <PortalCard title="فتح تذكرة جديدة" icon={LifeBuoy}>
            <div className="grid gap-3 md:grid-cols-2">
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
              <Button variant="outline" size="sm" onClick={() => setCreating(false)}>إلغاء</Button>
              <Button size="sm" onClick={submitNew}>إرسال</Button>
            </div>
          </PortalCard>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <PortalCard title={`تذاكري · ${tickets.length}`} icon={LifeBuoy}>
          {tickets.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">لا توجد تذاكر بعد.</p>
          ) : (
            <ul className="space-y-1">
              {tickets.map((t) => (
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
                      {t.category ?? "عام"} · {new Date(t.last_message_at).toLocaleDateString()}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </PortalCard>

        <PortalCard title={selected ? selected.subject : "المحادثة"} icon={LifeBuoy}>
          {!selected ? (
            <div className="grid min-h-[280px] place-items-center text-center text-sm text-muted-foreground">
              اختر تذكرة من القائمة أو افتح تذكرة جديدة.
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {selected.category ?? "عام"} · فُتحت في {new Date(selected.created_at).toLocaleString()}
                </p>
                <StatusPill status={selected.status} />
              </div>
              <div className="mt-4 flex-1 space-y-3 overflow-y-auto pe-1">
                {messages.map((m) => {
                  const decoded = decryptChatBody(m.body, m.body_admin, mySk);
                  return (
                  <div
                    key={m.id}
                    className={`max-w-[85%] rounded-md border px-3 py-2 text-sm ${
                      m.is_staff
                        ? "me-auto border-white/5 bg-white/[0.03]"
                        : "ms-auto border-gold/20 bg-gold/[0.08]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">
                      <EncryptedBody result={decoded} />
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {m.is_staff ? "فريق الدعم" : "أنت"} · {new Date(m.created_at).toLocaleString()}
                    </p>
                  </div>
                  );
                })}
              </div>
              {selected.status !== "closed" && (
                <div className="mt-4 flex items-end gap-2 border-t border-white/5 pt-4">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="اكتب رداً…"
                    className="min-h-[70px] bg-white/[0.02]"
                  />
                  <Button size="sm" onClick={reply}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </PortalCard>
      </div>
    </PortalShell>
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
