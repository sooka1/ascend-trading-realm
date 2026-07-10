import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell, AdminCard } from "@/components/admin-shell";
import { Bell, Send, History, TestTube2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { broadcastNotification, listBroadcasts } from "@/lib/broadcast.functions";
import { sendTestPushToSelf } from "@/lib/push.functions";
import { canUsePush, ensurePushSubscription } from "@/lib/push-client";

export const Route = createFileRoute("/_authenticated/_admin/admin/notifications")({
  head: () => ({ meta: [{ title: "Admin — Notifications" }] }),
  component: AdminNotifications,
});

function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const broadcast = useServerFn(broadcastNotification);
  const fetchLogs = useServerFn(listBroadcasts);
  const sendTest = useServerFn(sendTestPushToSelf);
  const [testing, setTesting] = useState(false);
  const [envInfo, setEnvInfo] = useState<{ host: string; allowed: boolean; permission: string }>(
    { host: "", allowed: false, permission: "default" },
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    setEnvInfo({
      host: window.location.hostname,
      allowed: canUsePush(),
      permission:
        typeof Notification !== "undefined" ? Notification.permission : "unsupported",
    });
  }, []);

  async function onEnablePush() {
    if (!envInfo.allowed) {
      toast.error("افتح رابط الإنتاج على الهاتف: hk-global-trade.lovable.app");
      return;
    }
    if (typeof Notification === "undefined") {
      toast.error("المتصفح لا يدعم الإشعارات");
      return;
    }
    const perm = await Notification.requestPermission();
    setEnvInfo((s) => ({ ...s, permission: perm }));
    if (perm !== "granted") {
      toast.error("لم يتم منح إذن الإشعارات");
      return;
    }
    const ok = await ensurePushSubscription();
    if (ok) toast.success("تم تفعيل الإشعارات على هذا الجهاز");
    else toast.error("تعذّر تسجيل الاشتراك");
  }

  async function onSendTest() {
    setTesting(true);
    try {
      const res = await sendTest({ data: {} });
      if (res.subscriptions === 0) {
        toast.error("لا يوجد جهاز مسجل — فعّل الإشعارات أولاً");
      } else {
        toast.success(`تم الإرسال إلى ${res.sent}/${res.subscriptions} جهاز`);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "فشل إرسال الاختبار");
    } finally {
      setTesting(false);
    }
  }
  const [logs, setLogs] = useState<
    Array<{
      id: string;
      title: string;
      body: string | null;
      recipients_count: number;
      status: string;
      error: string | null;
      created_at: string;
    }>
  >([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const loadLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetchLogs();
      setLogs(res.items as any);
    } catch (e: any) {
      toast.error(e?.message ?? "تعذّر تحميل السجل");
    } finally {
      setLoadingLogs(false);
    }
  }, [fetchLogs]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

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
      void loadLogs();
    } catch (e: any) {
      toast.error(e?.message ?? "تعذّر إرسال الإشعار");
      void loadLogs();
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
      <AdminCard title="اختبار الإشعارات على هذا الجهاز" icon={TestTube2}>
        <div className="space-y-3 text-sm">
          <div className="rounded-sm border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="font-mono text-[11px] text-muted-foreground">
                النطاق الحالي: <span className="text-foreground">{envInfo.host || "…"}</span>
              </div>
              <span
                className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase ${
                  envInfo.allowed
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                }`}
              >
                {envInfo.allowed ? "إنتاج" : "معاينة"}
              </span>
            </div>
            {!envInfo.allowed && (
              <p className="mt-2 text-xs text-amber-300/90">
                الإشعارات الفورية لا تعمل في المعاينة. افتح رابط الإنتاج على الهاتف:
                {" "}
                <a
                  href="https://hk-global-trade.lovable.app/admin/notifications"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline"
                >
                  hk-global-trade.lovable.app <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            )}
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              إذن الإشعارات: <span className="text-foreground">{envInfo.permission}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onEnablePush} disabled={!envInfo.allowed}>
              <Bell className="me-1.5 h-3.5 w-3.5" />
              تفعيل الإشعارات
            </Button>
            <Button onClick={onSendTest} disabled={testing || !envInfo.allowed}>
              <Send className="me-1.5 h-3.5 w-3.5" />
              {testing ? "جارٍ الإرسال…" : "إرسال إشعار تجريبي لي"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            على iOS يجب إضافة التطبيق إلى الشاشة الرئيسية أولاً ثم فتحه من الأيقونة.
          </p>
        </div>
      </AdminCard>

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

      <AdminCard title="سجل عمليات البث" icon={History}>
        {loadingLogs ? (
          <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد عمليات بث بعد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-start font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="p-2 text-start">الوقت</th>
                  <th className="p-2 text-start">العنوان</th>
                  <th className="p-2 text-start">النص</th>
                  <th className="p-2 text-start">المستلمون</th>
                  <th className="p-2 text-start">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-t border-white/5">
                    <td className="p-2 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="p-2 font-medium">{l.title}</td>
                    <td className="p-2 max-w-[320px] truncate text-muted-foreground" title={l.body ?? ""}>
                      {l.body ?? "—"}
                    </td>
                    <td className="p-2">{l.recipients_count}</td>
                    <td className="p-2">
                      <StatusPill status={l.status} error={l.error} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </AdminShell>
  );
}

function StatusPill({ status, error }: { status: string; error: string | null }) {
  const map: Record<string, { label: string; cls: string }> = {
    sent: { label: "تم الإرسال", cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    pending: { label: "قيد الإرسال", cls: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
    failed: { label: "فشل", cls: "border-red-500/30 bg-red-500/10 text-red-300" },
  };
  const s = map[status] ?? { label: status, cls: "border-white/10 bg-white/[0.03] text-muted-foreground" };
  return (
    <span
      className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${s.cls}`}
      title={error ?? undefined}
    >
      {s.label}
    </span>
  );
}