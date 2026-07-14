import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Capacitor } from "@capacitor/core";
import { toast } from "sonner";
import { Fingerprint, ShieldCheck, Smartphone } from "lucide-react";
import { PortalShell } from "@/components/portal-shell";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { biometricAuthenticate, isBiometricAvailable } from "@/lib/native/biometric";
import { biometricPrefs } from "@/lib/native/biometric-prefs";

export const Route = createFileRoute("/_authenticated/portal/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات — بوابة العميل" },
      { name: "description", content: "الأمان البيومتري وتفضيلات الحساب." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [native] = useState(() => Capacitor.isNativePlatform());
  const [available, setAvailable] = useState<boolean | null>(null);
  const [kind, setKind] = useState<string>("");
  const [appLock, setAppLock] = useState(false);
  const [sensitive, setSensitive] = useState(false);

  useEffect(() => {
    setAppLock(biometricPrefs.appLockEnabled());
    setSensitive(biometricPrefs.sensitiveEnabled());
    if (!native) { setAvailable(false); return; }
    void isBiometricAvailable().then((r) => {
      setAvailable(r.available);
      setKind(r.kind ?? "");
    });
  }, [native]);

  async function toggleAppLock(next: boolean) {
    if (next && native) {
      const ok = await biometricAuthenticate("تأكيد تفعيل قفل التطبيق");
      if (!ok) { toast.error("لم يتم التحقق البيومتري."); return; }
    }
    biometricPrefs.setAppLock(next);
    setAppLock(next);
    toast.success(next ? "تم تفعيل قفل التطبيق." : "تم إيقاف قفل التطبيق.");
  }

  async function toggleSensitive(next: boolean) {
    if (next && native) {
      const ok = await biometricAuthenticate("تأكيد تفعيل الحماية للعمليات الحساسة");
      if (!ok) { toast.error("لم يتم التحقق البيومتري."); return; }
    }
    biometricPrefs.setSensitive(next);
    setSensitive(next);
    toast.success(next ? "سيُطلب التحقق البيومتري قبل العمليات الحساسة." : "تم إيقاف التحقق للعمليات الحساسة.");
  }

  const canUse = native && available === true;

  return (
    <PortalShell
      eyebrow="الحساب"
      title="الإعدادات"
      subtitle="الأمان البيومتري والتفضيلات العامة."
    >
      <div className="glass rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 text-gold">
            <Fingerprint className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">الحماية البيومترية</h2>
            <p className="text-xs text-muted-foreground">
              {native
                ? available === null
                  ? "جارٍ فحص الجهاز…"
                  : available
                    ? `متاح على هذا الجهاز${kind ? ` — ${kind}` : ""}.`
                    : "لا يدعم هذا الجهاز التحقق البيومتري."
                : "متاحة فقط داخل تطبيق الجوال المثبَّت (iOS / Android)."}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <PreferenceRow
            icon={Smartphone}
            title="قفل التطبيق عند الفتح"
            description="اطلب البصمة أو Face ID عند فتح التطبيق أو استئنافه بعد فترة خمول."
            disabled={!canUse}
            checked={appLock}
            onChange={toggleAppLock}
          />
          <PreferenceRow
            icon={ShieldCheck}
            title="تأكيد العمليات الحساسة"
            description="السحب، التحويلات، وتغيير كلمة المرور تتطلب تحقّقًا بيومتريًا."
            disabled={!canUse}
            checked={sensitive}
            onChange={toggleSensitive}
          />
        </div>

        {!native && (
          <p className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-muted-foreground">
            حمّل تطبيق HKEX على هاتفك لتفعيل الحماية البيومترية. الإعدادات محفوظة على الجهاز فقط ولا تُشارَك مع أي جهاز آخر.
          </p>
        )}
      </div>
    </PortalShell>
  );
}

function PreferenceRow({
  icon: Icon,
  title,
  description,
  disabled,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  disabled: boolean;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  const id = `pref-${title}`;
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
        <div>
          <Label htmlFor={id} className="text-sm font-medium">{title}</Label>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}