import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { MessageCircle, Send, LogIn, X, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ensureMyKeypair,
  encryptFor,
  decryptChatBody,
  getSuperAdminPublicKey,
  verifyDecryption,
} from "@/lib/e2ee";
import { EncryptedBody } from "@/components/encrypted-body";
import {
  notifyIncomingMessage,
  registerChatNotificationSW,
  ensureChatNotificationPermission,
  primeChatAudio,
} from "@/lib/chat-notify";
import { MessageStatus } from "@/components/message-status";
import { ChatAttachment } from "@/components/chat-attachment";
import { uploadChatAttachment } from "@/lib/chat-attachments";
import { ChatAttachmentPreview } from "@/components/chat-attachment-preview";

type ChatMsg = {
  id: string;
  ticket_id: string;
  sender_id: string;
  body: string;
  body_admin: string | null;
  is_staff: boolean;
  created_at: string;
  attachment_path?: string | null;
  attachment_name?: string | null;
  attachment_mime?: string | null;
  attachment_size?: number | null;
};

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
  const [mySk, setMySk] = useState<string | null>(null);
  const [myPk, setMyPk] = useState<string | null>(null);
  const [adminPk, setAdminPk] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const [adminReadAt, setAdminReadAt] = useState<string | null>(null);
  const [staffTyping, setStaffTyping] = useState(false);
  const [typingDebug, setTypingDebug] = useState<{
    at: number;
    reason: string;
    value: boolean;
  } | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done" | "error">(
    "idle",
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastTypingSentRef = useRef(0);
  const typingClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // Register the chat notification service worker once, and request permission
  // the first time the user opens the chat panel so we can alert them even
  // when the tab is not focused.
  useEffect(() => {
    void registerChatNotificationSW();
    primeChatAudio();
  }, []);
  useEffect(() => {
    if (!open) return;
    void ensureChatNotificationPermission();
  }, [open]);

  // Generate/load the user's E2EE keypair once signed in, and fetch the admin's public key.
  useEffect(() => {
    if (!uid) return;
    void (async () => {
      const kp = await ensureMyKeypair(uid);
      setMySk(kp.secretKey);
      setMyPk(kp.publicKey);
      const apk = await getSuperAdminPublicKey();
      setAdminPk(apk);
      // Self-test: confirm past messages decrypt on this browser.
      const check = await verifyDecryption(uid, kp.secretKey || null);
      if (check.status === "ok") {
        toast.success("تم التحقق من فك تشفير رسائلك السابقة بنجاح", {
          description: `تم فحص ${check.total} رسالة`,
        });
      } else if (check.status === "partial") {
        toast.warning("بعض الرسائل السابقة لم يتم فك تشفيرها", {
          description: `${check.ok} من ${check.total} — قد تحتاج لتسجيل الدخول من جهازك الأصلي`,
        });
      } else if (check.status === "failed") {
        toast.error("تعذّر فك تشفير الرسائل السابقة على هذا المتصفح", {
          description: "سجّل الدخول مرة على جهازك الأصلي لمزامنة المفتاح",
        });
      } else if (check.status === "no-key") {
        toast.message("بانتظار مزامنة مفتاح التشفير من جهازك الأصلي");
      }
    })();
  }, [uid]);

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
      // Load current admin_last_read_at + mark this side as having read now.
      const { data: trow } = await supabase
        .from("support_tickets")
        .select("admin_last_read_at")
        .eq("id", tid)
        .maybeSingle();
      if (!cancelled) setAdminReadAt((trow?.admin_last_read_at as string | null) ?? null);
      await supabase
        .from("support_tickets")
        .update({ client_last_read_at: new Date().toISOString() })
        .eq("id", tid);
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
          // Notify only on incoming staff replies, not on our own echo.
          if (m.is_staff && m.sender_id !== uid) {
            notifyIncomingMessage(
              "رسالة جديدة من دعم HK",
              undefined,
              "/",
            );
            if (!open) setUnread((n) => n + 1);
            // If the panel is open, mark as read immediately.
            if (open) {
              void supabase
                .from("support_tickets")
                .update({ client_last_read_at: new Date().toISOString() })
                .eq("id", ticketId);
            }
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "support_tickets", filter: `id=eq.${ticketId}` },
        (payload) => {
          const t = payload.new as { admin_last_read_at: string | null };
          setAdminReadAt(t.admin_last_read_at ?? null);
        },
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        const p = payload.payload as { from?: string; uid?: string };
        console.debug("[typing] client received", { ticketId, from: p?.from, uid: p?.uid });
        if (p?.from !== "staff") return;
        setStaffTyping(true);
        setTypingDebug({ at: Date.now(), reason: "broadcast من الدعم", value: true });
        console.debug("[typing] client updated → staffTyping=true", { ticketId });
        if (typingClearRef.current) clearTimeout(typingClearRef.current);
        typingClearRef.current = setTimeout(() => {
          setStaffTyping(false);
          setTypingDebug({ at: Date.now(), reason: "انتهاء المهلة (2.5s)", value: false });
          console.debug("[typing] client updated → staffTyping=false (timeout)", { ticketId });
        }, 2500);
      })
      .subscribe();
    channelRef.current = channel;
    return () => {
      channelRef.current = null;
      if (typingClearRef.current) clearTimeout(typingClearRef.current);
      supabase.removeChannel(channel);
    };
  }, [ticketId, uid, open]);

  function emitTyping() {
    const ch = channelRef.current;
    if (!ch || !uid) {
      console.debug("[typing] client emit skipped (no channel/uid)", { hasChannel: !!ch, uid });
      return;
    }
    const now = Date.now();
    if (now - lastTypingSentRef.current < 1500) {
      console.debug("[typing] client emit throttled", { ticketId });
      return;
    }
    lastTypingSentRef.current = now;
    console.debug("[typing] client sending", { ticketId, uid });
    void ch
      .send({ type: "broadcast", event: "typing", payload: { from: "client", uid } })
      .then((res) => console.debug("[typing] client send result", { ticketId, res }))
      .catch((err) => console.debug("[typing] client send error", { ticketId, err }));
  }

  // Reset the unseen badge whenever the panel opens.
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

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
    if (body.length < 1 && !pendingFile) return;
    if (!mySk || !myPk) {
      toast.error("جارٍ تجهيز التشفير، حاول بعد لحظة");
      return;
    }
    setSending(true);
    try {
      // Refresh the super-admin's public key at send-time so a message
      // never lands with body_admin=null just because the key hadn't
      // been fetched yet on chat open.
      let apk = adminPk;
      if (!apk) {
        apk = await getSuperAdminPublicKey();
        if (apk) setAdminPk(apk);
      }
      let attachment: Awaited<ReturnType<typeof uploadChatAttachment>> | null = null;
      if (pendingFile) {
        setUploadStatus("uploading");
        setUploadProgress(0);
        setUploadError(null);
        try {
          attachment = await uploadChatAttachment(ticketId, pendingFile, (f) =>
            setUploadProgress(f),
          );
          setUploadStatus("done");
        } catch (e) {
          setUploadStatus("error");
          setUploadError(e instanceof Error ? e.message : "فشل الرفع");
          throw e;
        }
      }
      const bodyForMe = body ? encryptFor(myPk, body) : null;
      const bodyForAdmin = body && apk ? encryptFor(apk, body) : null;
      const insertPayload: Record<string, unknown> = {
        ticket_id: ticketId,
        sender_id: uid,
        body: bodyForMe,
        body_admin: bodyForAdmin,
        is_staff: false,
      };
      if (attachment) Object.assign(insertPayload, attachment);
      const { error } = await supabase
        .from("ticket_messages")
        .insert(insertPayload as never);
      if (error) throw error;
      await supabase
        .from("support_tickets")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", ticketId);
      setDraft("");
      setPendingFile(null);
      setUploadStatus("idle");
      setUploadProgress(0);
      setUploadError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر إرسال الرسالة");
    } finally {
      setSending(false);
    }
  }

  // Back-fill body_admin on the user's own past messages once the admin
  // public key is known. Without this, any message sent before the admin
  // ever published a key stays unreadable to the super admin forever.
  useEffect(() => {
    if (!ticketId || !uid || !mySk || !adminPk) return;
    const pending = messages.filter(
      (m) => !m.is_staff && m.sender_id === uid && !m.body_admin && m.body,
    );
    if (pending.length === 0) return;
    void (async () => {
      for (const m of pending) {
        const res = decryptChatBody(m.body, null, mySk);
        if (res.status !== "ok") continue;
        const cipher = encryptFor(adminPk, res.text);
        await supabase
          .from("ticket_messages")
          .update({ body_admin: cipher })
          .eq("id", m.id);
      }
    })();
  }, [ticketId, uid, mySk, adminPk, messages]);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="فتح شات الاستفسارات"
          className="group fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full border border-primary/30 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.03] hover:bg-primary/90 active:scale-95"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">استفسارات</span>
          {unread > 0 ? (
            <span className="absolute -top-2 -right-2 min-w-[1.25rem] rounded-full bg-gold px-1.5 py-0.5 text-center font-mono text-[10px] font-bold text-black shadow">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/70 opacity-70" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-gold" />
            </span>
          )}
        </button>
      )}

      {open && (
        <aside
          dir="rtl"
          className="fixed bottom-4 left-4 z-50 flex w-[min(92vw,22rem)] h-[min(78vh,32rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-card/95 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4 fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-white/10 bg-card/60 px-4 py-3">
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <MessageCircle className="h-4 w-4 text-gold" /> دعم HK — شات مباشر
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {authed
                  ? "محادثتك محفوظة تلقائيًا."
                  : "يجب تسجيل الدخول أولاً."}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="إغلاق"
              className="rounded-full p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

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
          <div className="flex flex-1 min-h-0 flex-col">
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
                  const decoded = decryptChatBody(m.body, m.body_admin, mySk);
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
                        <p className="whitespace-pre-wrap break-words">
                          <EncryptedBody result={decoded} />
                        </p>
                        {m.attachment_path && m.attachment_name && m.attachment_mime && (
                          <ChatAttachment
                            path={m.attachment_path}
                            name={m.attachment_name}
                            mime={m.attachment_mime}
                            size={m.attachment_size ?? 0}
                          />
                        )}
                        <p className="mt-1 text-[9px] opacity-60">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <MessageStatus
                          mine={mine}
                          delivered={!!m.body_admin}
                          read={
                            mine &&
                            !!adminReadAt &&
                            new Date(adminReadAt) >= new Date(m.created_at)
                          }
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="border-t border-white/10 bg-card/40 p-2">
              {pendingFile && (
                <ChatAttachmentPreview
                  file={pendingFile}
                  onRemove={() => {
                    setPendingFile(null);
                    setUploadStatus("idle");
                    setUploadProgress(0);
                    setUploadError(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  status={uploadStatus}
                  progress={uploadProgress}
                  error={uploadError}
                />
              )}
              <div className="flex items-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.csv"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    if (f && f.size > 25 * 1024 * 1024) {
                      toast.error("حجم الملف يتجاوز 25 ميغابايت");
                      e.target.value = "";
                      return;
                    }
                    setPendingFile(f);
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!ticketId || sending}
                  aria-label="إرفاق ملف"
                  className="h-9 w-9 p-0"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Textarea
                  className="min-h-[42px] max-h-32 resize-none"
                  placeholder="اكتب رسالتك…"
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    emitTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  disabled={!ticketId || sending}
                />
                <Button
                  size="sm"
                  onClick={send}
                  disabled={
                    sending || !ticketId || (draft.trim().length === 0 && !pendingFile)
                  }
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
              {staffTyping && (
                <p className="mt-1 px-1 text-[10px] text-muted-foreground animate-pulse">
                  دعم HK يكتب…
                </p>
              )}
              {typingDebug && (
                <div className="mt-1 rounded-md border border-white/10 bg-black/30 px-2 py-1 font-mono text-[9px] leading-relaxed text-muted-foreground">
                  <span className="text-gold">[debug typing]</span>{" "}
                  <span>{typingDebug.value ? "ON" : "OFF"}</span>
                  {" · "}
                  <span>{new Date(typingDebug.at).toLocaleTimeString()}</span>
                  {" · "}
                  <span>{typingDebug.reason}</span>
                </div>
              )}
            </div>
          </div>
        )}
        </aside>
      )}
    </>
  );
}
