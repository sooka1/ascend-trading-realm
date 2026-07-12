import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, PortalCard } from "@/components/portal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, MapPin, Bell, Globe2, ShieldCheck, BadgeCheck, Upload, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { LANGUAGES, getAllTimezones } from "@/lib/locales";
import { setUserTimezone, setUserLocale } from "@/lib/user-timezone";
import { getBrowserLanguage, getBrowserTimezone } from "@/lib/browser-defaults";

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
  const [language, setLanguage] = useState<string>(() => getBrowserLanguage());
  const [tz, setTz] = useState<string>(() => getBrowserTimezone());
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"unverified" | "pending" | "approved" | "rejected">("unverified");
  const [idFrontUrl, setIdFrontUrl] = useState<string | null>(null);
  const [idBackUrl, setIdBackUrl] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setUid(u.user.id);
      setEmail(u.user.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("display_name,avatar_url,verification_status,id_front_url,id_back_url,selfie_url,verification_notes,language,timezone")
        .eq("id", u.user.id)
        .maybeSingle();
      if (data) {
        setDisplayName((data.display_name as string) ?? "");
        setAvatarUrl((data.avatar_url as string) ?? null);
        setVerificationStatus(((data.verification_status as typeof verificationStatus) ?? "unverified"));
        setIdFrontUrl((data.id_front_url as string) ?? null);
        setIdBackUrl((data.id_back_url as string) ?? null);
        setSelfieUrl((data.selfie_url as string) ?? null);
        {
          // Strip admin-only internal marker before exposing to the user.
          const raw = (data.verification_notes as string) ?? null;
          const publicPart = raw ? raw.split(/\r?\n?\[\[internal\]\]/)[0].trim() : null;
          setVerificationNotes(publicPart && publicPart.length > 0 ? publicPart : null);
        }
        if (data.language) {
          setLanguage(data.language as string);
          setUserLocale(data.language as string);
        }
        if (data.timezone) {
          setTz(data.timezone as string);
          setUserTimezone(data.timezone as string);
        }
      }
    })();
  }, []);

  async function save() {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName, language, timezone: tz })
        .eq("id", u.user.id);
      if (error) toast.error(error.message);
      else {
        setUserTimezone(tz);
        setUserLocale(language);
        toast.success("تم حفظ التغييرات");
      }
    }
    setSaving(false);
  }

  async function uploadKycFile(kind: "id_front" | "id_back" | "selfie", file: File) {
    if (!uid) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("حجم الملف كبير جدًا (الحد الأقصى 8 ميغابايت)");
      return;
    }
    setUploading(kind);
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${uid}/${kind}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("kyc").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      toast.error(upErr.message);
      setUploading(null);
      return;
    }
    const newStatus: "approved" | "pending" = verificationStatus === "approved" ? "approved" : "pending";
    const patch = {
      verification_status: newStatus,
      id_front_url: kind === "id_front" ? path : idFrontUrl,
      id_back_url: kind === "id_back" ? path : idBackUrl,
      selfie_url: kind === "selfie" ? path : selfieUrl,
    };
    const { error: updErr } = await supabase.from("profiles").update(patch).eq("id", uid);
    if (updErr) {
      toast.error(updErr.message);
    } else {
      if (kind === "id_front") setIdFrontUrl(path);
      if (kind === "id_back") setIdBackUrl(path);
      if (kind === "selfie") setSelfieUrl(path);
      if (newStatus !== verificationStatus) setVerificationStatus(newStatus);
      toast.success("تم رفع الملف — بانتظار مراجعة الإدارة");
    }
    setUploading(null);
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
            <div className="flex items-center gap-3 rounded-md border border-white/5 bg-white/[0.02] p-3">
              <span className="inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-gold/30 bg-gold/[0.08] text-lg font-semibold text-gold">
                {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : (displayName || email || "?").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-medium">{displayName || email || "المستخدم"}</span>
                  {verificationStatus === "approved" && (
                    <BadgeCheck className="h-4 w-4 shrink-0 text-gold" aria-label="موثّق" />
                  )}
                </div>
                <VerificationPill status={verificationStatus} />
              </div>
            </div>
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

        <PortalCard title="توثيق الحساب" icon={ShieldCheck}>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-md border border-white/5 bg-white/[0.02] p-3 text-xs text-muted-foreground">
              <span>ارفع صور واضحة من هويتك الوطنية/جواز السفر وصورة شخصية للتحقق. ستتم مراجعة الطلب من قِبَل الإدارة.</span>
              <VerificationPill status={verificationStatus} />
            </div>
            {verificationStatus === "rejected" && verificationNotes && (
              <p className="rounded-md border border-red-400/30 bg-red-500/[0.06] p-2 text-xs text-red-200">{verificationNotes}</p>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              <KycSlot label="صورة الهوية — وجه" path={idFrontUrl} busy={uploading === "id_front"} onFile={(f) => uploadKycFile("id_front", f)} />
              <KycSlot label="صورة الهوية — ظهر" path={idBackUrl} busy={uploading === "id_back"} onFile={(f) => uploadKycFile("id_back", f)} />
              <KycSlot label="صورة شخصية (Selfie)" path={selfieUrl} busy={uploading === "selfie"} onFile={(f) => uploadKycFile("selfie", f)} />
            </div>
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
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-gold/60"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="المنطقة الزمنية">
              <select
                value={tz}
                onChange={(e) => setTz(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-gold/60"
              >
                {getAllTimezones().map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
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

function VerificationPill({ status }: { status: "unverified" | "pending" | "approved" | "rejected" }) {
  const map = {
    approved: { label: "موثّق", icon: BadgeCheck, cls: "border-gold/40 bg-gold/10 text-gold" },
    pending: { label: "قيد المراجعة", icon: Clock, cls: "border-amber-400/30 bg-amber-400/10 text-amber-200" },
    rejected: { label: "مرفوض", icon: XCircle, cls: "border-red-400/30 bg-red-400/10 text-red-200" },
    unverified: { label: "غير موثّق", icon: ShieldCheck, cls: "border-white/10 bg-white/[0.03] text-muted-foreground" },
  } as const;
  const { label, icon: Icon, cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function KycSlot({ label, path, busy, onFile }: { label: string; path: string | null; busy: boolean; onFile: (f: File) => void }) {
  return (
    <label className="group relative flex min-h-[130px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-white/15 bg-white/[0.02] p-3 text-center transition hover:border-gold/40">
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (f) onFile(f);
          e.currentTarget.value = "";
        }}
      />
      <Upload className="h-5 w-5 text-gold/80" />
      <span className="text-xs font-medium">{label}</span>
      <span className="text-[10px] text-muted-foreground">
        {busy ? "جارٍ الرفع…" : path ? "تم الرفع — انقر للاستبدال" : "انقر لاختيار صورة"}
      </span>
    </label>
  );
}