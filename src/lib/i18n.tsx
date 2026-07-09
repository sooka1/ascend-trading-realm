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
    "cta.dashboard": "لوحة التحكم",
    "cta.signout": "تسجيل الخروج",
    "lang.label": "اللغة",
    // Hero
    "hero.badge": "تداول عالمي المستوى، جوائز حقيقية",
    "hero.title.1": "تداول العالم.",
    "hero.title.2": "نافس كالمحترفين.",
    "hero.subtitle": "فوركس وعملات رقمية وذهب ومؤشرات وأسهم — بتنفيذ بسرعة المؤسسات على منصة صُممت لأكثر المتداولين تنافسية في العالم. انضم إلى البطولات المباشرة وتسلّق قائمة المتصدرين العالمية.",
    "hero.cta.start": "ابدأ التداول",
    "hero.cta.compete": "انضم إلى المسابقة",
    "hero.cta.demo": "جرّب النسخة التجريبية",
    "hero.trust.regulated": "مُنظَّم عالميًا",
    "hero.trust.execution": "تنفيذ بمتوسط 18 ملي ثانية",
    "hero.trust.funds": "أموال مفصولة",
    "hero.trust.traders": "أكثر من 2 مليون متداول",
    // Footer
    "footer.tagline": "منصة تداول عالمية متميّزة للفوركس والعملات الرقمية والمؤشرات والسلع — مع مسابقات عالمية المستوى وتحليلات فورية وتنفيذ بمستوى المؤسسات.",
    "footer.col.platform": "المنصة",
    "footer.col.compete": "نافس وتعلّم",
    "footer.col.company": "الشركة",
    "footer.col.support": "الدعم",
    "footer.link.platform": "منصة التداول",
    "footer.link.markets": "الأسواق",
    "footer.link.pricing": "الأسعار",
    "footer.link.calendar": "التقويم الاقتصادي",
    "footer.link.competitions": "المسابقات",
    "footer.link.education": "التعليم",
    "footer.link.news": "الأخبار",
    "footer.link.blog": "المدوّنة",
    "footer.link.about": "من نحن",
    "footer.link.partners": "الشركاء",
    "footer.link.affiliate": "برنامج الشركاء",
    "footer.link.contact": "تواصل معنا",
    "footer.link.support": "مركز الدعم",
    "footer.link.faq": "الأسئلة الشائعة",
    "footer.risk.label": "تحذير المخاطر:",
    "footer.risk.body": "ينطوي تداول المنتجات ذات الرافعة المالية مثل عقود الفروقات والفوركس والعملات الرقمية على مستوى عالٍ من المخاطر وقد لا يكون مناسبًا لجميع المستثمرين. قد تخسر أكثر من إيداعك الأولي. تأكّد من فهمك الكامل للمخاطر واطلب المشورة المستقلة عند الحاجة. الأداء السابق لا يضمن النتائج المستقبلية.",
    "footer.copyright": "© {year} HK Global Trading. جميع الحقوق محفوظة.",
    "footer.compliance": "مُنظَّم عالميًا · أموال العملاء مفصولة · محمي بـ SSL",
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
    "cta.dashboard": "Dashboard",
    "cta.signout": "Sign out",
    "lang.label": "Language",
    "hero.badge": "World-class trading, real prizes",
    "hero.title.1": "Trade the world.",
    "hero.title.2": "Compete like a pro.",
    "hero.subtitle": "Forex, crypto, gold, indices and stocks — executed at institutional speed on a platform built for the world's most competitive traders. Join live tournaments and climb the global leaderboard.",
    "hero.cta.start": "Start Trading",
    "hero.cta.compete": "Join Competition",
    "hero.cta.demo": "Try Demo",
    "hero.trust.regulated": "Globally regulated",
    "hero.trust.execution": "18ms avg execution",
    "hero.trust.funds": "Segregated funds",
    "hero.trust.traders": "2M+ traders",
    "footer.tagline": "A premium global trading platform for forex, crypto, indices and commodities — with world-class competitions, real-time analytics and institutional-grade execution.",
    "footer.col.platform": "Platform",
    "footer.col.compete": "Compete & Learn",
    "footer.col.company": "Company",
    "footer.col.support": "Support",
    "footer.link.platform": "Trading Platform",
    "footer.link.markets": "Markets",
    "footer.link.pricing": "Pricing",
    "footer.link.calendar": "Economic Calendar",
    "footer.link.competitions": "Competitions",
    "footer.link.education": "Education",
    "footer.link.news": "News",
    "footer.link.blog": "Blog",
    "footer.link.about": "About Us",
    "footer.link.partners": "Partners",
    "footer.link.affiliate": "Affiliate Program",
    "footer.link.contact": "Contact",
    "footer.link.support": "Support Center",
    "footer.link.faq": "FAQ",
    "footer.risk.label": "Risk Warning:",
    "footer.risk.body": "Trading leveraged products such as CFDs, forex and crypto carries a high level of risk and may not be suitable for all investors. You could lose more than your initial deposit. Ensure you fully understand the risks involved and seek independent advice if necessary. Past performance is not indicative of future results.",
    "footer.copyright": "© {year} HK Global Trading. All rights reserved.",
    "footer.compliance": "Regulated globally · Segregated client funds · SSL secured",
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
    "cta.dashboard": "Tableau de bord",
    "cta.signout": "Se déconnecter",
    "lang.label": "Langue",
    "hero.badge": "Trading de classe mondiale, prix réels",
    "hero.title.1": "Tradez le monde.",
    "hero.title.2": "Compétitionnez en pro.",
    "hero.subtitle": "Forex, crypto, or, indices et actions — exécutés à la vitesse institutionnelle sur une plateforme conçue pour les traders les plus compétitifs. Rejoignez les tournois en direct et grimpez au classement mondial.",
    "hero.cta.start": "Commencer à trader",
    "hero.cta.compete": "Rejoindre la compétition",
    "hero.cta.demo": "Essayer la démo",
    "hero.trust.regulated": "Régulé à l'international",
    "hero.trust.execution": "Exécution moyenne 18 ms",
    "hero.trust.funds": "Fonds ségrégués",
    "hero.trust.traders": "Plus de 2M de traders",
    "footer.tagline": "Une plateforme de trading mondiale premium pour le forex, la crypto, les indices et les matières premières — avec des compétitions de classe mondiale, des analyses en temps réel et une exécution institutionnelle.",
    "footer.col.platform": "Plateforme",
    "footer.col.compete": "Compétitions & Apprentissage",
    "footer.col.company": "Société",
    "footer.col.support": "Support",
    "footer.link.platform": "Plateforme de trading",
    "footer.link.markets": "Marchés",
    "footer.link.pricing": "Tarifs",
    "footer.link.calendar": "Calendrier économique",
    "footer.link.competitions": "Compétitions",
    "footer.link.education": "Formation",
    "footer.link.news": "Actualités",
    "footer.link.blog": "Blog",
    "footer.link.about": "À propos",
    "footer.link.partners": "Partenaires",
    "footer.link.affiliate": "Programme d'affiliation",
    "footer.link.contact": "Contact",
    "footer.link.support": "Centre d'assistance",
    "footer.link.faq": "FAQ",
    "footer.risk.label": "Avertissement sur les risques :",
    "footer.risk.body": "Le trading de produits à effet de levier tels que les CFD, le forex et la crypto comporte un niveau de risque élevé et peut ne pas convenir à tous les investisseurs. Vous pouvez perdre plus que votre dépôt initial. Assurez-vous de bien comprendre les risques encourus et demandez conseil de manière indépendante si nécessaire. Les performances passées ne préjugent pas des résultats futurs.",
    "footer.copyright": "© {year} HK Global Trading. Tous droits réservés.",
    "footer.compliance": "Régulé à l'international · Fonds clients ségrégués · Sécurisé SSL",
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
    "cta.dashboard": "Panel",
    "cta.signout": "Cerrar sesión",
    "lang.label": "Idioma",
    "hero.badge": "Trading de clase mundial, premios reales",
    "hero.title.1": "Opera el mundo.",
    "hero.title.2": "Compite como un profesional.",
    "hero.subtitle": "Forex, cripto, oro, índices y acciones — ejecutados a velocidad institucional en una plataforma diseñada para los traders más competitivos del mundo. Únete a torneos en vivo y sube en el ranking global.",
    "hero.cta.start": "Comenzar a operar",
    "hero.cta.compete": "Unirse a la competencia",
    "hero.cta.demo": "Probar demo",
    "hero.trust.regulated": "Regulado globalmente",
    "hero.trust.execution": "Ejecución media de 18 ms",
    "hero.trust.funds": "Fondos segregados",
    "hero.trust.traders": "Más de 2M de traders",
    "footer.tagline": "Una plataforma global de trading premium para forex, cripto, índices y materias primas — con competencias de clase mundial, análisis en tiempo real y ejecución de nivel institucional.",
    "footer.col.platform": "Plataforma",
    "footer.col.compete": "Compite y aprende",
    "footer.col.company": "Empresa",
    "footer.col.support": "Soporte",
    "footer.link.platform": "Plataforma de trading",
    "footer.link.markets": "Mercados",
    "footer.link.pricing": "Precios",
    "footer.link.calendar": "Calendario económico",
    "footer.link.competitions": "Competencias",
    "footer.link.education": "Educación",
    "footer.link.news": "Noticias",
    "footer.link.blog": "Blog",
    "footer.link.about": "Sobre nosotros",
    "footer.link.partners": "Socios",
    "footer.link.affiliate": "Programa de afiliados",
    "footer.link.contact": "Contacto",
    "footer.link.support": "Centro de soporte",
    "footer.link.faq": "Preguntas frecuentes",
    "footer.risk.label": "Advertencia de riesgo:",
    "footer.risk.body": "Operar con productos apalancados como CFDs, forex y cripto conlleva un alto nivel de riesgo y puede no ser adecuado para todos los inversores. Podrías perder más que tu depósito inicial. Asegúrate de comprender los riesgos y busca asesoramiento independiente si es necesario. Los resultados pasados no garantizan resultados futuros.",
    "footer.copyright": "© {year} HK Global Trading. Todos los derechos reservados.",
    "footer.compliance": "Regulado globalmente · Fondos de clientes segregados · Protegido con SSL",
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
    "cta.dashboard": "Panel",
    "cta.signout": "Çıkış yap",
    "lang.label": "Dil",
    "hero.badge": "Dünya standartlarında işlem, gerçek ödüller",
    "hero.title.1": "Dünyayı işleme al.",
    "hero.title.2": "Profesyonel gibi yarış.",
    "hero.subtitle": "Forex, kripto, altın, endeksler ve hisseler — kurumsal hızda çalışan, dünyanın en rekabetçi trader'ları için tasarlanmış bir platformda. Canlı turnuvalara katıl ve küresel sıralamada yüksel.",
    "hero.cta.start": "İşlem yapmaya başla",
    "hero.cta.compete": "Yarışmaya katıl",
    "hero.cta.demo": "Demo'yu dene",
    "hero.trust.regulated": "Küresel olarak düzenlenmiş",
    "hero.trust.execution": "Ortalama 18ms yürütme",
    "hero.trust.funds": "Ayrılmış fonlar",
    "hero.trust.traders": "2M+ trader",
    "footer.tagline": "Forex, kripto, endeksler ve emtialar için birinci sınıf küresel bir işlem platformu — dünya standartlarında yarışmalar, gerçek zamanlı analitik ve kurumsal düzeyde yürütme ile.",
    "footer.col.platform": "Platform",
    "footer.col.compete": "Yarış ve öğren",
    "footer.col.company": "Şirket",
    "footer.col.support": "Destek",
    "footer.link.platform": "İşlem Platformu",
    "footer.link.markets": "Piyasalar",
    "footer.link.pricing": "Fiyatlandırma",
    "footer.link.calendar": "Ekonomik Takvim",
    "footer.link.competitions": "Yarışmalar",
    "footer.link.education": "Eğitim",
    "footer.link.news": "Haberler",
    "footer.link.blog": "Blog",
    "footer.link.about": "Hakkımızda",
    "footer.link.partners": "Ortaklar",
    "footer.link.affiliate": "Ortaklık Programı",
    "footer.link.contact": "İletişim",
    "footer.link.support": "Destek Merkezi",
    "footer.link.faq": "SSS",
    "footer.risk.label": "Risk Uyarısı:",
    "footer.risk.body": "CFD, forex ve kripto gibi kaldıraçlı ürünlerin ticareti yüksek düzeyde risk içerir ve tüm yatırımcılar için uygun olmayabilir. İlk yatırımınızdan daha fazlasını kaybedebilirsiniz. İlgili riskleri tam olarak anladığınızdan emin olun ve gerekirse bağımsız tavsiye alın. Geçmiş performans, gelecekteki sonuçların göstergesi değildir.",
    "footer.copyright": "© {year} HK Global Trading. Tüm hakları saklıdır.",
    "footer.compliance": "Küresel düzenlemeye tabi · Ayrılmış müşteri fonları · SSL korumalı",
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