import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, LogIn } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatMsg = { id: string; ticket_id: string; sender_id: string; body: string; is_staff: boolean; created_at: string };

export function SupportFab() {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user);
      setUid(data.user?.id ?? null);
      setUserEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session?.user);
      setUid(session?.user?.id ?? null);
      setUserEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Find or create the user's active support ticket + load message history.
  useEffect(() => {
    if (!open || !uid) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: existing } = await supabase
        .from("support_tickets")
        .select("id")
        .eq("user_id", uid)
        .in("status", ["open", "pending"])
        .order("last_message_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      let tid = existing?.id as string | undefined;
      if (!tid) {
        const { data: created, error } = await supabase
          .from("support_tickets")
          .insert({ user_id: uid, subject: "استفسار من الشات المباشر" })
          .select("id")
          .single();
        if (error) {
          toast.error(error.message);
          setLoading(false);
          return;
        }
        tid = created.id as string;
      }
      if (cancelled || !tid) return;
      setTicketId(tid);
      const { data: msgs } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", tid)
        .order("created_at", { ascending: true });
      if (!cancelled) setMessages((msgs ?? []) as ChatMsg[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, uid]);

  // Realtime subscription for incoming messages on the active ticket.
  useEffect(() => {
    if (!ticketId) return;
    const channel = supabase
      .channel(`ticket-${ticketId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ticket_messages", filter: `ticket_id=eq.${ticketId}` },
        (payload) => {
          const m = payload.new as ChatMsg;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  // Auto-scroll on new message.
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length, open]);

  async function send() {
    if (!authed || !uid || !ticketId) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }
    const body = draft.trim();
    if (body.length < 1) return;
    setSending(true);
    const { error } = await supabase
      .from("ticket_messages")
      .insert({ ticket_id: ticketId, sender_id: uid, body, is_staff: false });
    if (!error) {
      await supabase
        .from("support_tickets")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", ticketId);
    }
    setSending(false);
    if (error) return toast.error(error.message);
    setDraft("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="فتح شات الاستفسارات"
          className="group fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full border border-primary/30 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.03] hover:bg-primary/90 active:scale-95"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">استفسارات</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/70 opacity-70" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-gold" />
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden" dir="rtl">
        <DialogHeader className="border-b border-white/10 bg-card/60 px-4 py-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4 text-gold" /> دعم HK — شات مباشر
          </DialogTitle>
          <DialogDescription className="text-xs">
            {authed
              ? "محادثتك محفوظة تلقائيًا ويستطيع فريق الدعم الرد في أي وقت."
              : "يجب تسجيل الدخول أولاً لبدء محادثة الدعم."}
          </DialogDescription>
        </DialogHeader>

        {authed === false ? (
          <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">سجّل الدخول أو أنشئ حسابًا لبدء المحادثة.</p>
            <Button asChild size="sm" onClick={() => setOpen(false)}>
              <Link to="/auth">
                <LogIn className="me-1.5 h-3.5 w-3.5" />
                تسجيل الدخول
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex h-[420px] flex-col">
            <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
              {loading ? (
                <p className="py-6 text-center text-xs text-muted-foreground">جارٍ فتح المحادثة…</p>
              ) : messages.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  ابدأ محادثتك مع فريق الدعم — سنرد عليك في أقرب وقت.
                </p>
              ) : (
                messages.map((m) => {
                  const mine = m.sender_id === uid && !m.is_staff;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                          mine
                            ? "bg-primary text-primary-foreground rounded-bl-sm"
                            : "bg-white/[0.06] text-foreground rounded-br-sm border border-white/10"
                        }`}
                      >
                        {m.is_staff && (
                          <p className="mb-0.5 font-mono text-[9px] uppercase tracking-widest text-gold">HK Support</p>
                        )}
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p className="mt-1 text-[9px] opacity-60">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="border-t border-white/10 bg-card/40 p-2">
              <div className="flex items-end gap-2">
                <Textarea
                  className="min-h-[42px] max-h-32 resize-none"
                  placeholder="اكتب رسالتك…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  disabled={!ticketId || sending}
                />
                <Button size="sm" onClick={send} disabled={sending || !ticketId || draft.trim().length === 0}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
