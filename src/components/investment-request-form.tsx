import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { CheckCircle2 } from "lucide-react";

const schema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  country: z.string().trim().min(2).max(80),
  capital_range: z.enum(["1k_10k", "10k_50k", "50k_250k", "250k_1m", "1m_plus"]),
  risk_preference: z.enum(["conservative", "balanced", "aggressive"]),
  notes: z.string().trim().max(2000).optional(),
});

type Lang = "ar" | "en" | "fr" | "es" | "tr";

const L: Record<Lang, {
  title: string; subtitle: string;
  name: string; email: string; country: string; capital: string; risk: string; notes: string;
  submit: string; submitting: string; success: string; error: string;
  capOpts: Record<string, string>;
  riskOpts: Record<string, string>;
  placeholder: { name: string; email: string; country: string; notes: string };
}> = {
  ar: {
    title: "طلب استثمار",
    subtitle: "أخبرنا قليلاً عنك، وسيتواصل معك مستشار خلال 24 ساعة.",
    name: "الاسم الكامل", email: "البريد الإلكتروني", country: "الدولة",
    capital: "نطاق رأس المال", risk: "تفضيل المخاطر", notes: "ملاحظات (اختياري)",
    submit: "إرسال الطلب", submitting: "جارٍ الإرسال...",
    success: "تم استلام طلبك. سنتواصل معك قريبًا.",
    error: "تعذّر إرسال الطلب. حاول مرة أخرى.",
    capOpts: { "1k_10k": "1,000$ – 10,000$", "10k_50k": "10,000$ – 50,000$", "50k_250k": "50,000$ – 250,000$", "250k_1m": "250,000$ – 1,000,000$", "1m_plus": "أكثر من 1,000,000$" },
    riskOpts: { conservative: "متحفّظ", balanced: "متوازن", aggressive: "مغامر" },
    placeholder: { name: "اسمك الكامل", email: "you@example.com", country: "مثال: الإمارات", notes: "أي تفاصيل تودّ مشاركتها" },
  },
  en: {
    title: "Investment Request",
    subtitle: "Tell us a bit about you and an advisor will reach out within 24 hours.",
    name: "Full name", email: "Email", country: "Country",
    capital: "Capital range", risk: "Risk preference", notes: "Notes (optional)",
    submit: "Submit request", submitting: "Submitting...",
    success: "Request received. We'll be in touch shortly.",
    error: "Could not submit request. Please try again.",
    capOpts: { "1k_10k": "$1,000 – $10,000", "10k_50k": "$10,000 – $50,000", "50k_250k": "$50,000 – $250,000", "250k_1m": "$250,000 – $1,000,000", "1m_plus": "$1,000,000+" },
    riskOpts: { conservative: "Conservative", balanced: "Balanced", aggressive: "Aggressive" },
    placeholder: { name: "Your full name", email: "you@example.com", country: "e.g. United Arab Emirates", notes: "Anything else you'd like to share" },
  },
  fr: {
    title: "Demande d'investissement",
    subtitle: "Parlez-nous de vous ; un conseiller vous contactera sous 24 heures.",
    name: "Nom complet", email: "E-mail", country: "Pays",
    capital: "Fourchette de capital", risk: "Profil de risque", notes: "Notes (facultatif)",
    submit: "Envoyer la demande", submitting: "Envoi...",
    success: "Demande reçue. Nous vous contacterons rapidement.",
    error: "Envoi impossible. Réessayez.",
    capOpts: { "1k_10k": "1 000 $ – 10 000 $", "10k_50k": "10 000 $ – 50 000 $", "50k_250k": "50 000 $ – 250 000 $", "250k_1m": "250 000 $ – 1 000 000 $", "1m_plus": "1 000 000 $+" },
    riskOpts: { conservative: "Prudent", balanced: "Équilibré", aggressive: "Dynamique" },
    placeholder: { name: "Votre nom complet", email: "vous@exemple.com", country: "ex. France", notes: "Tout ce que vous souhaitez partager" },
  },
  es: {
    title: "Solicitud de inversión",
    subtitle: "Cuéntanos sobre ti y un asesor te contactará en 24 horas.",
    name: "Nombre completo", email: "Correo", country: "País",
    capital: "Rango de capital", risk: "Perfil de riesgo", notes: "Notas (opcional)",
    submit: "Enviar solicitud", submitting: "Enviando...",
    success: "Solicitud recibida. Te contactaremos pronto.",
    error: "No se pudo enviar. Inténtalo de nuevo.",
    capOpts: { "1k_10k": "$1.000 – $10.000", "10k_50k": "$10.000 – $50.000", "50k_250k": "$50.000 – $250.000", "250k_1m": "$250.000 – $1.000.000", "1m_plus": "$1.000.000+" },
    riskOpts: { conservative: "Conservador", balanced: "Equilibrado", aggressive: "Agresivo" },
    placeholder: { name: "Tu nombre completo", email: "tu@ejemplo.com", country: "ej. España", notes: "Cualquier detalle adicional" },
  },
  tr: {
    title: "Yatırım Talebi",
    subtitle: "Kendinizden kısaca bahsedin, 24 saat içinde bir danışman size ulaşsın.",
    name: "Ad Soyad", email: "E-posta", country: "Ülke",
    capital: "Sermaye aralığı", risk: "Risk tercihi", notes: "Notlar (isteğe bağlı)",
    submit: "Talep gönder", submitting: "Gönderiliyor...",
    success: "Talebiniz alındı. Kısa süre içinde iletişime geçeceğiz.",
    error: "Gönderilemedi. Lütfen tekrar deneyin.",
    capOpts: { "1k_10k": "$1.000 – $10.000", "10k_50k": "$10.000 – $50.000", "50k_250k": "$50.000 – $250.000", "250k_1m": "$250.000 – $1.000.000", "1m_plus": "$1.000.000+" },
    riskOpts: { conservative: "Muhafazakâr", balanced: "Dengeli", aggressive: "Agresif" },
    placeholder: { name: "Adınız Soyadınız", email: "siz@ornek.com", country: "örn. Türkiye", notes: "Paylaşmak istediğiniz her şey" },
  },
};

export function InvestmentRequestForm() {
  const { lang } = useI18n();
  const l = L[lang as Lang] ?? L.en;
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      full_name: String(fd.get("full_name") ?? ""),
      email: String(fd.get("email") ?? ""),
      country: String(fd.get("country") ?? ""),
      capital_range: String(fd.get("capital_range") ?? ""),
      risk_preference: String(fd.get("risk_preference") ?? ""),
      notes: String(fd.get("notes") ?? "") || undefined,
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? l.error);
      return;
    }
    setSubmitting(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("investment_requests")
      .insert({ ...parsed.data, user_id: userData.user?.id ?? null });
    setSubmitting(false);
    if (error) {
      toast.error(l.error);
      return;
    }
    toast.success(l.success);
    setDone(true);
  }

  if (done) {
    return (
      <div className="glass-strong mx-auto max-w-2xl rounded-2xl p-10 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-gold" />
        <h3 className="mt-4 font-display text-2xl font-bold">{l.success}</h3>
      </div>
    );
  }

  const selectCls =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <form onSubmit={onSubmit} className="glass-strong mx-auto grid max-w-3xl gap-5 rounded-2xl p-6 md:p-8">
      <div className="text-center">
        <h3 className="font-display text-2xl font-bold">{l.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{l.subtitle}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="full_name">{l.name}</Label>
          <Input id="full_name" name="full_name" required maxLength={120} placeholder={l.placeholder.name} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">{l.email}</Label>
          <Input id="email" name="email" type="email" required maxLength={255} placeholder={l.placeholder.email} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="country">{l.country}</Label>
          <Input id="country" name="country" required maxLength={80} placeholder={l.placeholder.country} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="capital_range">{l.capital}</Label>
          <select id="capital_range" name="capital_range" required defaultValue="10k_50k" className={selectCls}>
            {Object.entries(l.capOpts).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2 md:col-span-2">
          <Label>{l.risk}</Label>
          <div className="grid grid-cols-3 gap-2">
            {(["conservative", "balanced", "aggressive"] as const).map((k, i) => (
              <label
                key={k}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm has-[:checked]:border-gold has-[:checked]:bg-gold/10"
              >
                <input type="radio" name="risk_preference" value={k} required defaultChecked={i === 1} className="accent-gold" />
                {l.riskOpts[k]}
              </label>
            ))}
          </div>
        </div>
        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor="notes">{l.notes}</Label>
          <Textarea id="notes" name="notes" maxLength={2000} rows={4} placeholder={l.placeholder.notes} />
        </div>
      </div>
      <Button
        type="submit"
        disabled={submitting}
        className="bg-[var(--gradient-brand)] text-white shadow-[var(--shadow-glow)]"
      >
        {submitting ? l.submitting : l.submit}
      </Button>
    </form>
  );
}