import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell, AdminCard } from "@/components/admin-shell";
import { Bell, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { broadcastNotification } from "@/lib/broadcast.functions";

export const Route = createFileRoute("/_authenticated/_admin/admin/notifications")({
  head: () => ({ meta: [{ title: "Admin — Notifications" }] }),
  component: AdminNotifications,
});

function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const broadcast = useServerFn(broadcastNotification);

  async function onSend() {
    if (!title.trim()) {
      toast.error("اكتب عنوان الإشعار أولًا");
      return;
    }
    if (!confirm("سيتم إرسال هذا الإشعار لجميع المستخدمين. هل أنت متأكد؟")) return;
    setSending(true);
    try {
      const res = await broadcast({ data: { title: title.trim(), body: body.trim() } });
      toast.success(`تم إرسال الإشعار إلى ${res.sent} مستخدم`);
      setTitle("");
      setBody("");
    } catch (e: any) {
      toast.error(e?.message ?? "تعذّر إرسال الإشعار");
    } finally {
      setSending(false);
    }
  }

  return (
    <AdminShell
      eyebrow="Governance"
      title="الإشعارات"
      subtitle="أرسل رسالة تصل إلى جميع مستخدمي التطبيق كإشعار."
    >
      <AdminCard title="بث إشعار لجميع المستخدمين" icon={Bell}>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              العنوان
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تحديث جديد متاح"
              maxLength={200}
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              نص الرسالة (اختياري)
            </label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="اكتب محتوى الإشعار…"
              className="min-h-[120px]"
              maxLength={2000}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={onSend} disabled={sending || !title.trim()}>
              <Send className="me-1.5 h-3.5 w-3.5" />
              {sending ? "جارٍ الإرسال…" : "إرسال للجميع"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            سيظهر الإشعار في قائمة إشعارات كل مستخدم فور الإرسال.
          </p>
        </div>
      </AdminCard>
    </AdminShell>
  );
}