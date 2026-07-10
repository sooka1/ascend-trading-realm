import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().email("بريد غير صالح").max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().min(3, "الموضوع قصير جداً").max(200),
  body: z.string().trim().min(5, "الرسالة قصيرة جداً").max(4000),
});

export function SupportFab() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", body: "" });
  const [sending, setSending] = useState(false);

  async function send() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "بيانات غير صالحة");
    setSending(true);
    const { error } = await supabase.from("guest_inquiries").insert({
      name: parsed.data.name || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject,
      body: parsed.data.body,
    });
    setSending(false);
    if (error) return toast.error(error.message);
    toast.success("تم إرسال رسالتك إلى الإدارة، سنتواصل معك قريباً");
    setForm({ name: "", email: "", phone: "", subject: "", body: "" });
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
            أرسل استفسارك مباشرة — لا حاجة لتسجيل الدخول. اترك بيانات التواصل ليتمكن فريقنا من الرد عليك.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="الاسم (اختياري)"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              placeholder="البريد الإلكتروني (اختياري)"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <Input
            placeholder="رقم الجوال (اختياري)"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
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
          <div className="flex justify-end">
            <Button size="sm" onClick={send} disabled={sending}>
              <Send className="me-1.5 h-3.5 w-3.5" />
              {sending ? "جارٍ الإرسال…" : "إرسال"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
