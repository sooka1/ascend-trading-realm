import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, PortalCard, QuickAction } from "@/components/portal-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDownToLine, ArrowUpFromLine, Bell, Download, FileText, LineChart, MessageSquare, Receipt, Send, Wallet } from "lucide-react";
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
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold/80">بوابة العميل</p>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">المستندات والنشاط والدعم</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild className="rounded-sm bg-gold font-semibold text-background hover:bg-[oklch(0.88_0.11_90)]">
              <Link to="/investor"><ArrowDownToLine className="ml-2 h-4 w-4" />إيداع</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-sm border-white/10 hover:border-gold/60">
              <Link to="/investor"><ArrowUpFromLine className="ml-2 h-4 w-4" />سحب</Link>
            </Button>
            <Button asChild variant="ghost" className="text-muted-foreground">
              <Link to="/dashboard">لوحة التحكم</Link>
            </Button>
          </div>
        </div>

        <nav className="mt-6 flex flex-wrap gap-2 border-t border-white/5 pt-6">
          {[
            { to: "/portal/documents", icon: FolderOpen, label: "المستندات" },
            { to: "/portal/support", icon: LifeBuoy, label: "الدعم" },
            { to: "/portal/mfa", icon: ShieldCheck, label: "المصادقة الثنائية" },
            { to: "/security", icon: ShieldCheck, label: "الأمان" },
          ].map((n) => (
            <Button key={n.to} asChild variant="outline" className="rounded-sm border-white/10 font-mono text-xs uppercase tracking-wider hover:border-gold/60">
              <Link to={n.to}><n.icon className="ml-2 h-4 w-4" />{n.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-card/50 p-6 backdrop-blur-xl lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gold/20 bg-gold/[0.06]"><FileText className="h-4 w-4 text-gold" /></span>
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
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{cap(s.kind)} · {s.period}</p>
                    </div>
                    <Button size="sm" variant="ghost" disabled={!s.file_url}>
                      <Download className="mr-2 h-4 w-4" /> {s.file_url ? "تنزيل" : "قيد الإصدار"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" aria-hidden />
          </div>

          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-card/50 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gold/20 bg-gold/[0.06]"><Bell className="h-4 w-4 text-gold" /></span>
              <h2 className="font-display text-lg font-semibold">الإشعارات</h2>
            </div>
            {notifications.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">لا توجد إشعارات.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {notifications.map((n) => (
                  <li key={n.id} className="rounded-md border border-white/5 bg-white/[0.02] p-3 text-sm">
                    <p className="font-medium">{n.title}</p>
                    {n.body && <p className="mt-1 text-muted-foreground">{n.body}</p>}
                    <p className="mt-1 font-mono text-[10px] tracking-wide text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-card/50 p-6 backdrop-blur-xl lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">سجل العمليات</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Live Ledger</span>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold/80">
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
                      <tr key={t.id} className="border-t border-white/5 transition hover:bg-white/[0.015]">
                        <td className="py-3 font-mono text-xs text-muted-foreground">{new Date(t.occurred_at).toLocaleDateString()}</td>
                        <td className="py-3 font-mono font-medium">{t.symbol}</td>
                        <td className="py-3 font-mono text-xs uppercase text-muted-foreground">{t.side}</td>
                        <td className="py-3 text-end font-mono tabular-nums">{Number(t.quantity).toLocaleString()}</td>
                        <td className="py-3 text-end font-mono tabular-nums">{Number(t.price).toFixed(2)}</td>
                        <td className={`py-3 text-end font-mono tabular-nums ${Number(t.pnl) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
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

          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-card/50 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gold/20 bg-gold/[0.06]"><MessageSquare className="h-4 w-4 text-gold" /></span>
              <h2 className="font-display text-lg font-semibold">المراسلات الآمنة</h2>
            </div>
            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-2">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا توجد رسائل بعد.</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-md px-3 py-2 text-sm ${m.from_role === "client" ? "ml-auto max-w-[85%] border border-gold/20 bg-gold/[0.08]" : "mr-auto max-w-[85%] border border-white/5 bg-white/[0.03]"}`}
                  >
                    <p>{m.body}</p>
                    <p className="mt-1 font-mono text-[10px] tracking-wide text-muted-foreground">
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
              <Button onClick={sendMessage} className="rounded-sm bg-gold font-semibold text-background hover:bg-[oklch(0.88_0.11_90)]">
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