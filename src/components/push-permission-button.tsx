import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { canUsePush, ensurePushSubscription } from "@/lib/push-client";

// A user-facing button that requests notification permission via a direct
// user gesture and displays the current permission state.
export function PushPermissionButton({ className }: { className?: string }) {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [allowed, setAllowed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAllowed(canUsePush());
    setPermission(
      typeof Notification !== "undefined" ? Notification.permission : "unsupported",
    );
  }, []);

  async function onClick() {
    if (typeof Notification === "undefined") {
      toast.error("المتصفح لا يدعم الإشعارات");
      return;
    }
    if (!allowed) {
      toast.error("افتح رابط الإنتاج على الهاتف لتفعيل الإشعارات");
      return;
    }
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        toast.error("لم يتم منح إذن الإشعارات");
        return;
      }
      const ok = await ensurePushSubscription();
      if (ok) toast.success("تم تفعيل الإشعارات على هذا الجهاز");
      else toast.error("تعذّر تسجيل الاشتراك");
    } finally {
      setBusy(false);
    }
  }

  const label =
    permission === "granted"
      ? "الإشعارات مفعّلة"
      : permission === "denied"
        ? "الإشعارات محظورة"
        : permission === "unsupported"
          ? "غير مدعومة"
          : "تفعيل الإشعارات";

  const Icon =
    permission === "granted" ? BellRing : permission === "denied" ? BellOff : Bell;

  return (
    <div className={`flex flex-col items-end gap-1 ${className ?? ""}`}>
      <Button
        onClick={onClick}
        variant="outline"
        disabled={busy || permission === "granted" || permission === "denied" || permission === "unsupported"}
        className="rounded-sm border-white/10 hover:border-gold/60"
        aria-label={label}
      >
        <Icon className="ml-2 h-4 w-4" />
        {busy ? "جارٍ الطلب…" : label}
      </Button>
      {permission === "denied" && (
        <p className="font-mono text-[10px] text-amber-300/90">
          مسموح لك بإعادة التفعيل من إعدادات المتصفح
        </p>
      )}
    </div>
  );
}