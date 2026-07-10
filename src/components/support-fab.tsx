import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle, Send, LogIn } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  subject: z.string().trim().min(3, "الموضوع قصير جداً").max(200),
  body: z.string().trim().min(5, "الرسالة قصيرة جداً").max(4000),
});

export function SupportFab() {
  const [open, setOpen] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState({ subject: "", body: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setChecking(true);
    supabase.auth.getUser().then(({ data }) => {
      setUid(data.user?.id ?? null);
      setChecking(false);
    });
  }, [open]);

  async function send() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "بيانات غير صالحة");
    if (!uid) return;
    setSending(true);
    const { data: t, error } = await supabase
      .from("support_tickets")
      .insert({ user_id: uid, subject: parsed.data.subject, category: "استفسار" })
      .select("id")
      .single();
    if (error || !t) {
      setSending(false);
      return toast.error(error?.message ?? "تعذّر الإرسال");
    }
    const { error: mErr } = await supabase
      .from("ticket_messages")
      .insert({ ticket_id: t.id, sender_id: uid, body: parsed.data.body, is_staff: false });
    setSending(false);
    if (mErr) return toast.error(mErr.message);
    toast.success("تم إرسال رسالتك إلى الإدارة");
    setForm({ subject: "", body: "" });
    setOpen(false);
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
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-gold" /> تواصل مع الإدارة
          </DialogTitle>
          <DialogDescription>
            أرسل استفسارك وسيصلك الرد من فريق الإدارة في أقرب وقت.
          </DialogDescription>
        </DialogHeader>

        {checking ? (
          <p className="py-6 text-center text-sm text-muted-foreground">جارٍ التحميل…</p>
        ) : !uid ? (
          <div className="space-y-3 py-2 text-sm">
            <p className="text-muted-foreground">يجب تسجيل الدخول لإرسال استفسار.</p>
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 rounded-md border border-gold/30 bg-gold/10 px-4 py-2 font-semibold text-gold hover:bg-gold/15"
            >
              <LogIn className="h-4 w-4" /> تسجيل الدخول
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              placeholder="الموضوع"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            />
            <Textarea
              className="min-h-[120px]"
              placeholder="اكتب رسالتك بالتفصيل…"
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            />
            <div className="flex items-center justify-between gap-2">
              <Link
                to="/portal/support"
                onClick={() => setOpen(false)}
                className="text-xs text-muted-foreground underline-offset-4 hover:text-gold hover:underline"
              >
                عرض محادثاتي السابقة
              </Link>
              <Button size="sm" onClick={send} disabled={sending}>
                <Send className="me-1.5 h-3.5 w-3.5" />
                {sending ? "جارٍ الإرسال…" : "إرسال"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
