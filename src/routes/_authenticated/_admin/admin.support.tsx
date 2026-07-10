import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/_admin/admin/support")({
  head: () => ({
    meta: [
      { title: "Admin — رسائل العملاء" },
      { name: "description", content: "استفسارات الزوار والعملاء." },
    ],
  }),
  component: AdminSupport,
});

type Inquiry = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  subject: string;
  body: string;
  status: "open" | "pending" | "resolved" | "closed";
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
};

function AdminSupport() {
  const [uid, setUid] = useState<string | null>(null);
  const [items, setItems] = useState<Inquiry[]>([]);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const { data: u } = await supabase.auth.getUser();
      setUid(u.user?.id ?? null);
      await load();
      setLoading(false);
    })();
  }, []);

  async function load() {
    const { data, error } = await supabase
      .from("guest_inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setItems((data ?? []) as Inquiry[]);
  }

  function pick(i: Inquiry) {
    setSelected(i);
    setReply(i.admin_reply ?? "");
  }

  async function saveReply() {
    if (!selected || !uid || !reply.trim()) return;
    const { error } = await supabase
      .from("guest_inquiries")
      .update({
        admin_reply: reply.trim(),
        replied_at: new Date().toISOString(),
        replied_by: uid,
        status: "resolved",
      })
      .eq("id", selected.id);
    if (error) return toast.error(error.message);
    toast.success("تم حفظ الرد");
    await load();
    setSelected({ ...selected, admin_reply: reply.trim(), status: "resolved" });
  }

  async function setStatus(status: Inquiry["status"]) {
    if (!selected) return;
    const { error } = await supabase.from("guest_inquiries").update({ status }).eq("id", selected.id);
    if (error) return toast.error(error.message);
    setSelected({ ...selected, status });
    await load();
  }

  return (
    <PageShell bare>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-widest text-gold">Admin</p>
        <h1 className="mt-1 flex items-center gap-2 font-display text-3xl font-semibold md:text-4xl">
          <MessageCircle className="h-6 w-6 text-gold" /> رسائل العملاء
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          استفسارات الزوار الواردة عبر شات الاستفسارات — يمكنك عرضها والرد عليها.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
          <div className="glass rounded-2xl p-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              الرسائل · {items.length}
            </p>
            {loading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">جارٍ التحميل…</p>
            ) : items.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">لا توجد رسائل بعد.</p>
            ) : (
              <ul className="space-y-1">
                {items.map((i) => (
                  <li key={i.id}>
                    <button
                      onClick={() => pick(i)}
                      className={`w-full rounded-md border px-3 py-2.5 text-start text-sm transition ${
                        selected?.id === i.id
                          ? "border-gold/40 bg-gold/[0.08]"
                          : "border-white/10 bg-white/[0.02] hover:border-gold/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">{i.subject}</span>
                        <StatusPill status={i.status} />
                      </div>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {i.name ?? i.email ?? i.phone ?? "زائر"} · {new Date(i.created_at).toLocaleString()}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass rounded-2xl p-4">
            {!selected ? (
              <div className="grid min-h-[280px] place-items-center text-center text-sm text-muted-foreground">
                اختر رسالة لعرضها والرد عليها.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold">{selected.subject}</h2>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {new Date(selected.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={selected.status} />
                    <select
                      value={selected.status}
                      onChange={(e) => setStatus(e.target.value as Inquiry["status"])}
                      className="rounded-md border border-white/10 bg-white/[0.02] px-2 py-1 text-xs"
                    >
                      <option value="open">مفتوحة</option>
                      <option value="pending">معلّقة</option>
                      <option value="resolved">محلولة</option>
                      <option value="closed">مغلقة</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-2 text-sm sm:grid-cols-3">
                  <InfoRow icon={User} label={selected.name ?? "—"} />
                  <InfoRow icon={Mail} label={selected.email ?? "—"} href={selected.email ? `mailto:${selected.email}` : undefined} />
                  <InfoRow icon={Phone} label={selected.phone ?? "—"} href={selected.phone ? `tel:${selected.phone}` : undefined} />
                </div>

                <div className="rounded-md border border-white/5 bg-white/[0.03] p-3 text-sm">
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">رسالة العميل</p>
                  <p className="whitespace-pre-wrap">{selected.body}</p>
                </div>

                <div className="border-t border-white/5 pt-3">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    رد الإدارة {selected.replied_at ? `· ${new Date(selected.replied_at).toLocaleString()}` : ""}
                  </p>
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="اكتب رداً للعميل…"
                    className="min-h-[100px] bg-white/[0.02]"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button size="sm" onClick={saveReply}>
                      <Send className="me-1.5 h-3.5 w-3.5" /> حفظ الرد
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function InfoRow({ icon: Icon, label, href }: { icon: any; label: string; href?: string }) {
  const content = (
    <div className="flex items-center gap-2 rounded-md border border-white/5 bg-white/[0.02] px-3 py-2">
      <Icon className="h-3.5 w-3.5 text-gold" />
      <span className="truncate">{label}</span>
    </div>
  );
  return href ? <a href={href} className="hover:text-gold">{content}</a> : content;
}

function StatusPill({ status }: { status: Inquiry["status"] }) {
  const map: Record<Inquiry["status"], { label: string; className: string }> = {
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
