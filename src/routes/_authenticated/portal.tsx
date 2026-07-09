import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Download, FileText, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({
    meta: [
      { title: "بوابة العميل — HK Investment Management" },
      { name: "description", content: "الكشوف، سجل العمليات، المراسلات الآمنة، والإشعارات لعملاء HK." },
    ],
  }),
  component: PortalPage,
});

type Statement = { id: string; kind: string; period: string; title: string; file_url: string | null };
type Transaction = { id: string; occurred_at: string; symbol: string; side: string; quantity: number; price: number; pnl: number };
type Notification = { id: string; title: string; body: string | null; read_at: string | null; created_at: string };
type Message = { id: string; from_role: string; body: string; created_at: string };

function PortalPage() {
  const [statements, setStatements] = useState<Statement[]>([]);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [uid, setUid] = useState<string | null>(null);

  async function load() {
    const { data: userRes } = await supabase.auth.getUser();
    const id = userRes.user?.id ?? null;
    setUid(id);
    if (!id) return;
    const [{ data: st }, { data: tx }, { data: no }, { data: ms }] = await Promise.all([
      supabase.from("statements").select("*").eq("user_id", id).order("created_at", { ascending: false }),
      supabase.from("transactions").select("*").eq("user_id", id).order("occurred_at", { ascending: false }).limit(50),
      supabase.from("notifications").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
      supabase.from("messages").select("*").eq("user_id", id).order("created_at"),
    ]);
    setStatements((st ?? []) as Statement[]);
    setTxs((tx ?? []) as Transaction[]);
    setNotifications((no ?? []) as Notification[]);
    setMessages((ms ?? []) as Message[]);
  }

  useEffect(() => {
    void load();
  }, []);

  async function sendMessage() {
    if (!uid || !draft.trim()) return;
    const { error } = await supabase.from("messages").insert({ user_id: uid, from_role: "client", body: draft.trim() });
    if (error) return toast.error(error.message);
    setDraft("");
    await load();
  }

  return (
    <PageShell bare>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold">بوابة العميل</p>
            <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">المستندات والنشاط والدعم</h1>
          </div>
          <Button asChild variant="outline" className="border-white/15">
            <Link to="/dashboard">العودة إلى لوحة التحكم</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="glass rounded-3xl p-6 lg:col-span-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gold" />
              <h2 className="font-display text-lg font-semibold">الكشوف والتقارير</h2>
            </div>
            {statements.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">لا توجد كشوف بعد.</p>
            ) : (
              <ul className="mt-4 divide-y divide-white/5">
                {statements.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{cap(s.kind)} · {s.period}</p>
                    </div>
                    <Button size="sm" variant="ghost" disabled={!s.file_url}>
                      <Download className="mr-2 h-4 w-4" /> {s.file_url ? "تنزيل" : "قيد الإصدار"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gold" />
              <h2 className="font-display text-lg font-semibold">الإشعارات</h2>
            </div>
            {notifications.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">لا توجد إشعارات.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {notifications.map((n) => (
                  <li key={n.id} className="rounded-lg border border-white/5 bg-white/[0.03] p-3 text-sm">
                    <p className="font-medium">{n.title}</p>
                    {n.body && <p className="mt-1 text-muted-foreground">{n.body}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass rounded-3xl p-6 lg:col-span-2">
            <h2 className="font-display text-lg font-semibold">سجل العمليات</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="py-2 text-start">التاريخ</th>
                    <th className="py-2 text-start">الرمز</th>
                    <th className="py-2 text-start">النوع</th>
                    <th className="py-2 text-end">الكمية</th>
                    <th className="py-2 text-end">السعر</th>
                    <th className="py-2 text-end">الربح/الخسارة</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground">لا توجد عمليات بعد.</td>
                    </tr>
                  ) : (
                    txs.map((t) => (
                      <tr key={t.id} className="border-t border-white/5">
                        <td className="py-3">{new Date(t.occurred_at).toLocaleDateString()}</td>
                        <td className="py-3 font-medium">{t.symbol}</td>
                        <td className="py-3 uppercase text-muted-foreground">{t.side}</td>
                        <td className="py-3 text-end">{Number(t.quantity).toLocaleString()}</td>
                        <td className="py-3 text-end">{Number(t.price).toFixed(2)}</td>
                        <td className={`py-3 text-end ${Number(t.pnl) >= 0 ? "text-gold" : "text-red-400"}`}>
                          {Number(t.pnl) >= 0 ? "+" : ""}
                          {Number(t.pnl).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gold" />
              <h2 className="font-display text-lg font-semibold">المراسلات الآمنة</h2>
            </div>
            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-2">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا توجد رسائل بعد.</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-2xl px-3 py-2 text-sm ${m.from_role === "client" ? "ml-auto max-w-[85%] bg-gold/15 text-foreground" : "mr-auto max-w-[85%] bg-white/5 text-foreground"}`}
                  >
                    <p>{m.body}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {m.from_role === "client" ? "أنت" : "مدير الحساب"} · {new Date(m.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex items-end gap-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="اكتب رسالة لمدير حسابك…"
                className="min-h-[70px] bg-white/[0.03]"
              />
              <Button onClick={sendMessage} className="bg-[var(--gradient-gold)] font-semibold text-background">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}