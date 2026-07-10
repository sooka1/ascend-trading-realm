import type { Lang } from "./i18n";

export type PortfoliosContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  popular: string;
  target: string;
  minimum: string;
  risk: string;
  withdraw: string;
  cta: string;
  disclaimer: string;
  tiers: { name: string; risk: string; features: string[] }[];
};

export const PORTFOLIOS: Record<Lang, PortfoliosContent> = {
  en: {
    eyebrow: "Managed Portfolios",
    title: "Three strategies. One standard of care.",
    subtitle:
      "Every portfolio is managed with the same discipline — you choose the risk profile that fits your objectives.",
    popular: "Most popular",
    target: "Target weekly return",
    minimum: "Minimum",
    risk: "Risk profile",
    withdraw: "Min. profit withdrawal",
    cta: "Open this portfolio",
    disclaimer:
      "Target returns are illustrative and not guaranteed. Investing involves risk, including possible loss of principal. Past performance is not indicative of future results.",
    tiers: [
      {
        name: "Conservative",
        risk: "Low",
        features: [
          "Capital preservation focus",
          "Fixed-income & income overlays",
          "Low correlation to equity markets",
          "Monthly performance reporting",
        ],
      },
      {
        name: "Balanced",
        risk: "Low",
        features: [
          "Multi-asset diversification",
          "Active currency & gold overlay",
          "Volatility-adjusted position sizing",
          "Bi-weekly performance updates",
        ],
      },
      {
        name: "Growth",
        risk: "Low",
        features: [
          "Higher exposure to growth assets",
          "Tactical single-name equities",
          "Optional digital-asset overlay",
          "Weekly performance updates",
        ],
      },
    ],
  },
  ar: {
    eyebrow: "المحافظ المُدارة",
    title: "ثلاث استراتيجيات. معيار واحد من العناية.",
    subtitle:
      "تُدار كل محفظة بالانضباط ذاته — تختار أنت مستوى المخاطر الذي يناسب أهدافك.",
    popular: "الأكثر شعبية",
    target: "العائد الأسبوعي المستهدف",
    minimum: "الحد الأدنى",
    risk: "ملف المخاطر",
    withdraw: "الحد الأدنى لسحب الأرباح",
    cta: "افتح هذه المحفظة",
    disclaimer:
      "العوائد المستهدفة توضيحية وغير مضمونة. ينطوي الاستثمار على مخاطر، بما في ذلك احتمال خسارة رأس المال. الأداء السابق لا يضمن النتائج المستقبلية.",
    tiers: [
      {
        name: "المحافظة",
        risk: "منخفض",
        features: [
          "التركيز على الحفاظ على رأس المال",
          "أدوات الدخل الثابت واستراتيجيات الدخل",
          "ارتباط منخفض بأسواق الأسهم",
          "تقارير أداء شهرية",
        ],
      },
      {
        name: "المتوازنة",
        risk: "منخفض",
        features: [
          "تنويع متعدد الأصول",
          "تغطية نشطة للعملات والذهب",
          "تحجيم المراكز حسب التقلبات",
          "تحديثات أداء كل أسبوعين",
        ],
      },
      {
        name: "النمو",
        risk: "منخفض",
        features: [
          "تعرّض أكبر لأصول النمو",
          "أسهم فردية تكتيكية",
          "تغطية اختيارية للأصول الرقمية",
          "تحديثات أداء أسبوعية",
        ],
      },
    ],
  },
  fr: {
    eyebrow: "Portefeuilles gérés",
    title: "Trois stratégies. Un même standard d'exigence.",
    subtitle:
      "Chaque portefeuille est géré avec la même discipline — vous choisissez le profil de risque adapté à vos objectifs.",
    popular: "Le plus populaire",
    target: "Rendement annuel visé",
    minimum: "Minimum",
    risk: "Profil de risque",
    withdraw: "Retrait min. des gains",
    cta: "Ouvrir ce portefeuille",
    disclaimer:
      "Les rendements visés sont illustratifs et non garantis. Investir comporte des risques, y compris la perte possible du capital. Les performances passées ne préjugent pas des résultats futurs.",
    tiers: [
      {
        name: "Conservateur",
        risk: "Faible",
        features: [
          "Priorité à la préservation du capital",
          "Obligations et stratégies de revenu",
          "Faible corrélation aux marchés actions",
          "Rapports de performance mensuels",
        ],
      },
      {
        name: "Équilibré",
        risk: "Faible",
        features: [
          "Diversification multi-actifs",
          "Couverture active devises & or",
          "Positions ajustées à la volatilité",
          "Mises à jour bimensuelles",
        ],
      },
      {
        name: "Croissance",
        risk: "Faible",
        features: [
          "Exposition accrue aux actifs de croissance",
          "Actions individuelles tactiques",
          "Couverture optionnelle en actifs numériques",
          "Mises à jour hebdomadaires",
        ],
      },
    ],
  },
  es: {
    eyebrow: "Carteras gestionadas",
    title: "Tres estrategias. Un mismo estándar de cuidado.",
    subtitle:
      "Cada cartera se gestiona con la misma disciplina — usted elige el perfil de riesgo que se adapta a sus objetivos.",
    popular: "Más popular",
    target: "Rendimiento anual objetivo",
    minimum: "Mínimo",
    risk: "Perfil de riesgo",
    withdraw: "Retiro mín. de ganancias",
    cta: "Abrir esta cartera",
    disclaimer:
      "Los rendimientos objetivo son ilustrativos y no están garantizados. Invertir implica riesgos, incluida la posible pérdida de capital. El rendimiento pasado no garantiza resultados futuros.",
    tiers: [
      {
        name: "Conservadora",
        risk: "Bajo",
        features: [
          "Enfoque en preservación de capital",
          "Renta fija y estrategias de ingresos",
          "Baja correlación con la renta variable",
          "Informes de rendimiento mensuales",
        ],
      },
      {
        name: "Equilibrada",
        risk: "Bajo",
        features: [
          "Diversificación multiactivo",
          "Cobertura activa en divisas y oro",
          "Posiciones ajustadas a la volatilidad",
          "Actualizaciones quincenales",
        ],
      },
      {
        name: "Crecimiento",
        risk: "Bajo",
        features: [
          "Mayor exposición a activos de crecimiento",
          "Acciones individuales tácticas",
          "Cobertura opcional en activos digitales",
          "Actualizaciones semanales",
        ],
      },
    ],
  },
  tr: {
    eyebrow: "Yönetilen Portföyler",
    title: "Üç strateji. Tek bir özen standardı.",
    subtitle:
      "Her portföy aynı disiplinle yönetilir — hedeflerinize uygun risk profilini siz seçersiniz.",
    popular: "En popüler",
    target: "Hedef yıllık getiri",
    minimum: "Minimum",
    risk: "Risk profili",
    withdraw: "Min. kâr çekimi",
    cta: "Bu portföyü aç",
    disclaimer:
      "Hedef getiriler örnek amaçlıdır ve garanti edilmez. Yatırım, anaparanın kaybı dahil riskler içerir. Geçmiş performans gelecekteki sonuçların göstergesi değildir.",
    tiers: [
      {
        name: "Muhafazakâr",
        risk: "Düşük",
        features: [
          "Sermaye koruma odaklı",
          "Sabit getirili ve gelir stratejileri",
          "Hisse piyasalarıyla düşük korelasyon",
          "Aylık performans raporları",
        ],
      },
      {
        name: "Dengeli",
        risk: "Düşük",
        features: [
          "Çoklu varlık çeşitlendirmesi",
          "Aktif döviz ve altın koruması",
          "Volatiliteye göre pozisyon ölçekleme",
          "İki haftada bir performans güncellemeleri",
        ],
      },
      {
        name: "Büyüme",
        risk: "Düşük",
        features: [
          "Büyüme varlıklarına daha yüksek maruz kalma",
          "Taktiksel tekil hisse senetleri",
          "İsteğe bağlı dijital varlık koruması",
          "Haftalık performans güncellemeleri",
        ],
      },
    ],
  },
};