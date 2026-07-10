import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, AdminCard } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { ensureMyKeypair, encryptFor, decryptChatBody } from "@/lib/e2ee";
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

export const Route = createFileRoute("/_authenticated/_admin/admin/live-chat")({
  head: () => ({
    meta: [
      { title: "Admin — الشات المباشر" },
      { name: "description", content: "محادثات فورية بين العملاء والسوبر ادمن." },
    ],
  }),
  component: AdminLiveChat,
});

type Ticket = {
  id: string;
  user_id: string;
  subject: string;
  status: "open" | "pending" | "resolved" | "closed";
  last_message_at: string;
  created_at: string;
  client_last_read_at: string | null;
  admin_last_read_at: string | null;
};
type Msg = {
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
type Profile = { id: string; display_name: string | null; email: string | null; public_key: string | null };

function AdminLiveChat() {
  const [uid, setUid] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [mySk, setMySk] = useState<string | null>(null);
  const [myPk, setMyPk] = useState<string | null>(null);
  const [unreadByTicket, setUnreadByTicket] = useState<Record<string, number>>({});
  const [clientReadAt, setClientReadAt] = useState<string | null>(null);
  const [clientTyping, setClientTyping] = useState(false);
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
    void (async () => {
      const { data: u } = await supabase.auth.getUser();
      const id = u.user?.id ?? null;
      setUid(id);
      if (id) {
        const kp = await ensureMyKeypair(id);
        setMySk(kp.secretKey);
        setMyPk(kp.publicKey);
      }
      await loadTickets();
    })();
    void registerChatNotificationSW();
    void ensureChatNotificationPermission();
  }, []);

  async function loadTickets() {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("id,user_id,subject,status,last_message_at,created_at,client_last_read_at,admin_last_read_at")
      .order("last_message_at", { ascending: false });
    if (error) return toast.error(error.message);
    const t = (data ?? []) as Ticket[];
    setTickets(t);
    const uids = Array.from(new Set(t.map((x) => x.user_id)));
    if (uids.length) {
      const { data: p } = await supabase
        .from("profiles")
        .select("id,display_name,email,public_key")
        .in("id", uids);
      const map: Record<string, Profile> = {};
      (p ?? []).forEach((x) => (map[x.id] = x as Profile));
      setProfiles(map);
    }
  }

  async function openTicket(t: Ticket) {
    setSelected(t);
    setUnreadByTicket((m) => ({ ...m, [t.id]: 0 }));
    setClientReadAt(t.client_last_read_at);
    await supabase
      .from("support_tickets")
      .update({ admin_last_read_at: new Date().toISOString() })
      .eq("id", t.id);
    const { data, error } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", t.id)
      .order("created_at", { ascending: true });
    if (error) return toast.error(error.message);
    setMessages((data ?? []) as Msg[]);
  }

  // Realtime: refresh tickets on any new message or ticket change
  useEffect(() => {
    const ch = supabase
      .channel("admin-live-chat-tickets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_tickets" },
        () => void loadTickets(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ticket_messages" },
        (payload) => {
          const m = payload.new as Msg;
          void loadTickets();
          // Alert on incoming client messages, not our own staff replies.
          if (!m.is_staff && m.sender_id !== uid) {
            notifyIncomingMessage(
              "رسالة عميل جديدة",
              nameFor(m.sender_id),
              "/admin/live-chat",
            );
            if (selected?.id !== m.ticket_id) {
              setUnreadByTicket((prev) => ({
                ...prev,
                [m.ticket_id]: (prev[m.ticket_id] ?? 0) + 1,
              }));
            }
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [uid, selected?.id, profiles]);

  // Realtime: subscribe to messages of the selected ticket
  useEffect(() => {
    if (!selected) return;
    setClientTyping(false);
    const ch = supabase
      .channel(`ticket-${selected.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ticket_messages",
          filter: `ticket_id=eq.${selected.id}`,
        },
        (payload) => {
          const m = payload.new as Msg;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          // Mark as read immediately while the admin has the ticket open.
          if (!m.is_staff && m.sender_id !== uid) {
            void supabase
              .from("support_tickets")
              .update({ admin_last_read_at: new Date().toISOString() })
              .eq("id", selected.id);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "support_tickets",
          filter: `id=eq.${selected.id}`,
        },
        (payload) => {
          const t = payload.new as { client_last_read_at: string | null };
          setClientReadAt(t.client_last_read_at ?? null);
        },
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        const p = payload.payload as { from?: string; uid?: string };
        console.debug("[typing] admin received", { ticketId: selected?.id, from: p?.from, uid: p?.uid });
        if (p?.from !== "client") return;
        setClientTyping(true);
        setTypingDebug({ at: Date.now(), reason: "broadcast من العميل", value: true });
        console.debug("[typing] admin updated → clientTyping=true", { ticketId: selected?.id });
        if (typingClearRef.current) clearTimeout(typingClearRef.current);
        typingClearRef.current = setTimeout(() => {
          setClientTyping(false);
          setTypingDebug({ at: Date.now(), reason: "انتهاء المهلة (2.5s)", value: false });
          console.debug("[typing] admin updated → clientTyping=false (timeout)", { ticketId: selected?.id });
        }, 2500);
      })
      .subscribe();
    channelRef.current = ch;
    return () => {
      channelRef.current = null;
      if (typingClearRef.current) clearTimeout(typingClearRef.current);
      supabase.removeChannel(ch);
    };
  }, [selected?.id, uid]);

  function emitTyping() {
    const ch = channelRef.current;
    if (!ch || !uid) {
      console.debug("[typing] admin emit skipped (no channel/uid)", { hasChannel: !!ch, uid });
      return;
    }
    const now = Date.now();
    if (now - lastTypingSentRef.current < 1500) {
      console.debug("[typing] admin emit throttled", { ticketId: selected?.id });
      return;
    }
    lastTypingSentRef.current = now;
    console.debug("[typing] admin sending", { ticketId: selected?.id, uid });
    void ch
      .send({ type: "broadcast", event: "typing", payload: { from: "staff", uid } })
      .then((res) => console.debug("[typing] admin send result", { ticketId: selected?.id, res }))
      .catch((err) => console.debug("[typing] admin send error", { ticketId: selected?.id, err }));
  }

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length, selected?.id]);

  async function reply() {
    if (!selected || !uid || sending) return;
    if (!draft.trim() && !pendingFile) return;
    if (!mySk || !myPk) return toast.error("جارٍ تجهيز التشفير");
    setSending(true);
    try {
      const body = draft.trim();
      const ownerPk = profiles[selected.user_id]?.public_key ?? null;
      let attachment: Awaited<ReturnType<typeof uploadChatAttachment>> | null = null;
      if (pendingFile) {
        setUploadStatus("uploading");
        setUploadProgress(0);
        setUploadError(null);
        try {
          attachment = await uploadChatAttachment(selected.id, pendingFile, (f) =>
            setUploadProgress(f),
          );
          setUploadStatus("done");
        } catch (e) {
          setUploadStatus("error");
          setUploadError(e instanceof Error ? e.message : "فشل الرفع");
          throw e;
        }
      }
      const bodyForOwner = body && ownerPk ? encryptFor(ownerPk, body) : null;
      const bodyForAdmin = body ? encryptFor(myPk, body) : null;
      const insertPayload: Record<string, unknown> = {
        ticket_id: selected.id,
        sender_id: uid,
        body: bodyForOwner,
        body_admin: bodyForAdmin,
        is_staff: true,
      };
      if (attachment) Object.assign(insertPayload, attachment);
      const { error } = await supabase
        .from("ticket_messages")
        .insert(insertPayload as never);
      if (error) throw error;
      await supabase
        .from("support_tickets")
        .update({ last_message_at: new Date().toISOString(), status: "open" })
        .eq("id", selected.id);
      setDraft("");
      setPendingFile(null);
      setUploadStatus("idle");
      setUploadProgress(0);
      setUploadError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر إرسال الرد");
    } finally {
      setSending(false);
    }
  }

  const nameFor = (userId: string) => {
    const p = profiles[userId];
    return p?.display_name || p?.email || `عميل ${userId.slice(0, 8)}`;
  };

  const unreadCount = useMemo(
    () => tickets.filter((t) => t.status === "open" || t.status === "pending").length,
    [tickets],
  );

  return (
    <AdminShell
      eyebrow="الاتصال"
      title="الشات المباشر"
      subtitle={`محادثات العملاء والمستثمرين — للسوبر ادمن فقط · نشطة: ${unreadCount}`}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        <AdminCard title={`المحادثات · ${tickets.length}`} icon={MessageCircle}>
          {tickets.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">لا توجد محادثات بعد.</p>
          ) : (
            <ul className="space-y-1 max-h-[560px] overflow-y-auto pe-1">
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
                      <span className="truncate font-medium">{nameFor(t.user_id)}</span>
                      <span className="flex items-center gap-1.5">
                        {(unreadByTicket[t.id] ?? 0) > 0 && (
                          <span className="rounded-full bg-gold px-1.5 py-0.5 font-mono text-[9px] font-bold text-black">
                            {unreadByTicket[t.id]}
                          </span>
                        )}
                        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          {new Date(t.last_message_at).toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                    <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t.subject} · {t.status}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard
          title={selected ? `محادثة مع ${nameFor(selected.user_id)}` : "المحادثة"}
          icon={MessageCircle}
        >
          {!selected ? (
            <div className="grid min-h-[420px] place-items-center text-center text-sm text-muted-foreground">
              اختر محادثة من القائمة لعرض الرسائل والرد.
            </div>
          ) : (
            <div className="flex h-[540px] flex-col">
              <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto pe-1" dir="rtl">
                {messages.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">لا رسائل بعد.</p>
                ) : (
                  messages.map((m) => {
                    const staff = m.is_staff;
                    // Admin's copy is body_admin; fall back to body if needed.
                    const decoded = decryptChatBody(m.body_admin, m.body, mySk);
                    return (
                      <div key={m.id} className={`flex ${staff ? "justify-start" : "justify-end"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                            staff
                              ? "bg-primary text-primary-foreground rounded-bl-sm"
                              : "bg-white/[0.06] text-foreground rounded-br-sm border border-white/10"
                          }`}
                        >
                          {!staff && (
                            <p className="mb-0.5 font-mono text-[9px] uppercase tracking-widest text-gold">
                              {nameFor(selected.user_id)}
                            </p>
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
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <MessageStatus
                            mine={staff}
                            delivered={!!m.body}
                            read={
                              staff &&
                              !!clientReadAt &&
                              new Date(clientReadAt) >= new Date(m.created_at)
                            }
                            counterpartyLabel="العميل"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {pendingFile && (
                <div className="mt-3">
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
                </div>
              )}
              <div className="mt-3 flex items-end gap-2 border-t border-white/5 pt-3">
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
                  aria-label="إرفاق ملف"
                  className="h-9 w-9 p-0"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Textarea
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    emitTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void reply();
                    }
                  }}
                  placeholder="اكتب رداً…"
                  className="min-h-[60px] bg-white/[0.02]"
                />
                <Button
                  size="sm"
                  onClick={reply}
                  disabled={sending || (!draft.trim() && !pendingFile)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {clientTyping && (
                <p className="mt-1 px-1 text-[10px] text-muted-foreground animate-pulse">
                  {nameFor(selected.user_id)} يكتب…
                </p>
              )}
              {typingDebug && (
                <div className="mt-1 rounded-md border border-white/10 bg-black/30 px-2 py-1 font-mono text-[10px] leading-relaxed text-muted-foreground">
                  <span className="text-gold">[debug typing]</span>{" "}
                  <span>{typingDebug.value ? "ON" : "OFF"}</span>
                  {" · "}
                  <span>{new Date(typingDebug.at).toLocaleTimeString()}</span>
                  {" · "}
                  <span>{typingDebug.reason}</span>
                </div>
              )}
            </div>
          )}
        </AdminCard>
      </div>
    </AdminShell>
  );
}