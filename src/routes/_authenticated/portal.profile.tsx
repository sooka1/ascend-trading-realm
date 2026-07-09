import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, PortalCard } from "@/components/portal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, MapPin, Bell, Globe2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/portal/profile")({
  head: () => ({
    meta: [
      { title: "الملف الشخصي — بوابة العميل" },
      { name: "description", content: "بياناتك الشخصية، تفضيلاتك، وإعدادات الاتصال." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [language, setLanguage] = useState("ar");
  const [tz, setTz] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? "");
      const { data } = await supabase.from("profiles").select("display_name").eq("id", u.user.id).maybeSingle();
      if (data?.display_name) setDisplayName(data.display_name as string);
    })();
  }, []);

  async function save() {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", u.user.id);
      if (error) toast.error(error.message);
      else toast.success("تم حفظ التغييرات");
    }
    setSaving(false);
  }

  return (
    <PortalShell
      eyebrow="الحساب"
      title="الملف الشخصي"
      subtitle="حدّث بياناتك، تفضيلاتك، وطريقة تواصلنا معك."
      actions={
        <Button onClick={save} disabled={saving} className="rounded-sm bg-gold font-semibold text-background hover:bg-[oklch(0.88_0.11_90)]">
          {saving ? "جارٍ الحفظ…" : "حفظ التغييرات"}
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <PortalCard title="المعلومات الشخصية" icon={User}>
          <div className="grid gap-4">
            <Field label="الاسم الكامل">
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-white/[0.03]" />
            </Field>
            <Field label="البريد الإلكتروني">
              <Input value={email} disabled className="bg-white/[0.03] opacity-70" />
            </Field>
            <Field label="رقم الهاتف">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+966 5X XXX XXXX" className="bg-white/[0.03]" />
            </Field>
          </div>
        </PortalCard>

        <PortalCard title="العنوان" icon={MapPin}>
          <Field label="العنوان الكامل">
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="الشارع، المدينة، البلد، الرمز البريدي"
              className="min-h-[120px] w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-gold/60"
            />
          </Field>
        </PortalCard>

        <PortalCard title="اللغة والمنطقة الزمنية" icon={Globe2}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="اللغة">
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-gold/60">
                <option value="ar">العربية</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="tr">Türkçe</option>
              </select>
            </Field>
            <Field label="المنطقة الزمنية">
              <Input value={tz} onChange={(e) => setTz(e.target.value)} className="bg-white/[0.03]" />
            </Field>
          </div>
        </PortalCard>

        <PortalCard title="تفضيلات الإشعارات" icon={Bell}>
          <div className="space-y-3">
            <Toggle label="إشعارات البريد الإلكتروني" hint="ملخصات يومية وتنبيهات مهمة" checked={emailNotif} onChange={setEmailNotif} />
            <Toggle label="إشعارات SMS" hint="تنبيهات فورية للعمليات الحرجة" checked={smsNotif} onChange={setSmsNotif} />
          </div>
        </PortalCard>
      </div>
    </PortalShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-mono text-[10px] uppercase tracking-widest text-gold/80">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-md border border-white/5 bg-white/[0.02] p-3 transition hover:border-gold/30">
      <span className="min-w-0">
        <span className="block font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <span className="relative inline-flex h-6 w-11 shrink-0">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full border border-white/10 bg-white/5 transition peer-checked:border-gold/50 peer-checked:bg-gold/30" />
        <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white/70 transition peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" style={{ insetInlineStart: "0.125rem" }} />
      </span>
    </label>
  );
}