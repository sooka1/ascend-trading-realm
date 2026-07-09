import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "ar" | "en" | "fr" | "es" | "tr";

export const LANGUAGES: { code: Lang; label: string; native: string; dir: "rtl" | "ltr" }[] = [
  { code: "ar", label: "Arabic", native: "العربية", dir: "rtl" },
  { code: "en", label: "English", native: "English", dir: "ltr" },
  { code: "fr", label: "French", native: "Français", dir: "ltr" },
  { code: "es", label: "Spanish", native: "Español", dir: "ltr" },
  { code: "tr", label: "Turkish", native: "Türkçe", dir: "ltr" },
];

type Dict = Record<string, string>;

const DICTS: Record<Lang, Dict> = {
  ar: {
    "nav.platform": "المنصة",
    "nav.markets": "الأسواق",
    "nav.competitions": "المسابقات",
    "nav.education": "التعليم",
    "nav.partners": "الشركاء",
    "nav.pricing": "الأسعار",
    "nav.about": "من نحن",
    "cta.login": "تسجيل الدخول",
    "cta.open_account": "افتح حسابًا",
    "lang.label": "اللغة",
  },
  en: {
    "nav.platform": "Platform",
    "nav.markets": "Markets",
    "nav.competitions": "Competitions",
    "nav.education": "Education",
    "nav.partners": "Partners",
    "nav.pricing": "Pricing",
    "nav.about": "About",
    "cta.login": "Log in",
    "cta.open_account": "Open account",
    "lang.label": "Language",
  },
  fr: {
    "nav.platform": "Plateforme",
    "nav.markets": "Marchés",
    "nav.competitions": "Compétitions",
    "nav.education": "Formation",
    "nav.partners": "Partenaires",
    "nav.pricing": "Tarifs",
    "nav.about": "À propos",
    "cta.login": "Connexion",
    "cta.open_account": "Ouvrir un compte",
    "lang.label": "Langue",
  },
  es: {
    "nav.platform": "Plataforma",
    "nav.markets": "Mercados",
    "nav.competitions": "Competencias",
    "nav.education": "Educación",
    "nav.partners": "Socios",
    "nav.pricing": "Precios",
    "nav.about": "Nosotros",
    "cta.login": "Iniciar sesión",
    "cta.open_account": "Abrir cuenta",
    "lang.label": "Idioma",
  },
  tr: {
    "nav.platform": "Platform",
    "nav.markets": "Piyasalar",
    "nav.competitions": "Yarışmalar",
    "nav.education": "Eğitim",
    "nav.partners": "Ortaklar",
    "nav.pricing": "Fiyatlandırma",
    "nav.about": "Hakkımızda",
    "cta.login": "Giriş yap",
    "cta.open_account": "Hesap aç",
    "lang.label": "Dil",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string; dir: "rtl" | "ltr" };
const I18nContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "hk_lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved && DICTS[saved]) setLangState(saved);
    } catch {}
  }, []);

  const dir = LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr";

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
    }
  }, [lang, dir]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      dir,
      setLang: (l) => {
        setLangState(l);
        try {
          localStorage.setItem(STORAGE_KEY, l);
        } catch {}
      },
      t: (k) => DICTS[lang]?.[k] ?? DICTS.en[k] ?? k,
    }),
    [lang, dir],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useT() {
  return useI18n().t;
}