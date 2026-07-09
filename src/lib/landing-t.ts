import type { Lang } from "./i18n";

export type LandingContent = {
  hero: {
    badge: string;
    titleA: string;
    titleB: string;
    titleC: string;
    subtitle: string;
    ctaOpen: string;
    ctaAdvisor: string;
    ctaLearn: string;
    statAum: string;
    statClients: string;
    statCountries: string;
    cardTitle: string;
    ytd: string;
    live: string;
    disclaimer: string;
  };
  trust: { regulated: string; funds: string; audits: string; global: string };
  features: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    subtitle: string;
    items: { t: string; b: string }[];
  };
  solutions: {
    eyebrow: string;
    title: string;
    explore: string;
    popular: string;
    target: string;
    risk: string;
    min: string;
    allocation: string;
    open: string;
    tiers: { name: string; risk: string; allocation: string }[];
  };
  perf: { aum: string; accounts: string; tenure: string; sat: string };
  riskf: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: { t: string; b: string }[];
    disclaimer: string;
  };
  security: {
    eyebrow: string;
    title: string;
    subtitle: string;
    legal: string;
    items: { t: string; b: string }[];
  };
  portal: {
    eyebrow: string;
    title: string;
    access: string;
    items: { t: string; b: string }[];
  };
  final: { eyebrow: string; titleA: string; titleB: string; cta: string; note: string };
};

const en: LandingContent = {
  hero: {
    badge: "Professional Investment Management",
    titleA: "Professional",
    titleB: "Investment",
    titleC: "Management",
    subtitle:
      "Experienced portfolio management with disciplined risk controls, transparent reporting and client-focused service — across Forex, Gold, Commodities, Indices and Stocks.",
    ctaOpen: "Open Investment Account",
    ctaAdvisor: "Talk to an Advisor",
    ctaLearn: "Learn More",
    statAum: "AUM",
    statClients: "Clients",
    statCountries: "Countries",
    cardTitle: "Balanced Growth Portfolio",
    ytd: "YTD",
    live: "Live",
    disclaimer: "Illustrative sample. Past performance does not guarantee future results.",
  },
  trust: {
    regulated: "Regulated & compliant",
    funds: "Segregated client funds",
    audits: "Independent audits",
    global: "Global reach, 24/6 desk",
  },
  features: {
    eyebrow: "Why HK Investment",
    titleA: "Built for investors who value",
    titleB: "discipline.",
    subtitle:
      "We combine institutional-grade infrastructure with an experienced human team. Your capital is managed with rigor, reported with clarity, and safeguarded with the standards you would expect of a serious asset manager.",
    items: [
      { t: "Professional portfolio management", b: "A senior investment team allocates across markets to pursue your objectives." },
      { t: "Diversified investment strategies", b: "Multi-asset exposure across Forex, Gold, Commodities, Indices and Stocks." },
      { t: "Transparent reporting", b: "Daily, monthly and annual statements — every position, every fee." },
      { t: "Secure client portal", b: "Two-factor authentication, encrypted storage, KYC/AML verified." },
      { t: "Real-time performance", b: "Live dashboard with equity curve, allocation and risk metrics." },
      { t: "Experienced team", b: "Portfolio managers, quants and risk officers with decades in global markets." },
      { t: "Advanced risk framework", b: "Position sizing, drawdown limits and stress tests baked into every strategy." },
      { t: "Dedicated support", b: "Named account manager and priority relationship desk." },
    ],
  },
  solutions: {
    eyebrow: "Managed Portfolios",
    title: "Three strategies. One standard of care.",
    explore: "Explore portfolios",
    popular: "Most popular",
    target: "Target annual return",
    risk: "Risk profile",
    min: "Minimum",
    allocation: "Allocation",
    open: "Open account",
    tiers: [
      { name: "Conservative", risk: "Low", allocation: "70% Fixed / 30% Growth" },
      { name: "Balanced", risk: "Moderate", allocation: "50% Growth / 50% Income" },
      { name: "Growth", risk: "Higher", allocation: "80% Growth / 20% Alt." },
    ],
  },
  perf: {
    aum: "Assets under management",
    accounts: "Active client accounts",
    tenure: "Average tenure (yrs)",
    sat: "Client satisfaction",
  },
  riskf: {
    eyebrow: "Risk Management",
    title: "Discipline is the strategy.",
    subtitle:
      "Our framework is built around one belief: durable returns come from avoiding large losses. Every position is sized, monitored and stress-tested against pre-defined risk budgets.",
    items: [
      { t: "Capital preservation", b: "Every strategy starts by defining acceptable loss, then constructs positions inside that limit." },
      { t: "Position sizing", b: "Volatility-adjusted sizing based on strategy conviction and current market regime." },
      { t: "Portfolio diversification", b: "Uncorrelated exposure across currencies, metals, indices and select single names." },
      { t: "Continuous monitoring", b: "24/6 risk desk, automated alerts and hard stops on strategy-level drawdowns." },
      { t: "Stress testing", b: "Historical and hypothetical scenarios run weekly to validate resilience." },
      { t: "Risk controls", b: "Hard limits on leverage, concentration and correlated exposure, enforced at the platform level." },
    ],
    disclaimer:
      "All investing involves risk, including loss of principal. Past performance is not indicative of, and does not guarantee, future results.",
  },
  security: {
    eyebrow: "Security",
    title: "Guardrails you can verify.",
    subtitle:
      "We protect client capital and data with layered security controls, third-party audits and a zero-trust operating posture.",
    legal: "Legal & compliance",
    items: [
      { t: "Two-factor authentication", b: "TOTP-based 2FA on every client login and sensitive action." },
      { t: "Encrypted client data", b: "AES-256 at rest and TLS 1.3 in transit for every request." },
      { t: "Secure cloud infrastructure", b: "Hardened production environment with least-privilege access." },
      { t: "KYC verification", b: "Identity verification on every account before activation." },
      { t: "AML compliance", b: "Transaction monitoring aligned with international standards." },
      { t: "Audit logs", b: "Immutable audit trail for every operational and account event." },
    ],
  },
  portal: {
    eyebrow: "Client Portal",
    title: "Your portfolio, transparent.",
    access: "Access your dashboard",
    items: [
      { t: "Portfolio overview", b: "Balance, allocation and P&L in one glance." },
      { t: "Live performance", b: "Interactive charts with daily and cumulative returns." },
      { t: "Statements & reports", b: "Monthly, annual and on-demand PDF reports." },
      { t: "Secure messaging", b: "Direct line to your account manager." },
    ],
  },
  final: {
    eyebrow: "Get started",
    titleA: "Put your capital in",
    titleB: "experienced hands.",
    cta: "Open Investment Account",
    note: "Speak with a specialist about your objectives, timeline and risk tolerance.",
  },
};

const ar: LandingContent = {
  hero: {
    badge: "نقوم بالتداول نيابة عنك",
    titleA: "نقوم",
    titleB: "بالتداول",
    titleC: "نيابة عنك",
    subtitle:
      "إدارة محافظ استثمارية بخبرة عالية، مع ضوابط مخاطر منضبطة، وتقارير شفافة، وخدمة عملاء متميزة — عبر أسواق الفوركس والذهب والسلع والمؤشرات والأسهم.",
    ctaOpen: "افتح حساب استثمار",
    ctaAdvisor: "تحدّث مع مستشار",
    ctaLearn: "اعرف المزيد",
    statAum: "الأصول المُدارة",
    statClients: "العملاء",
    statCountries: "الدول",
    cardTitle: "محفظة النمو المتوازن",
    ytd: "منذ بداية العام",
    live: "مباشر",
    disclaimer: "عيّنة توضيحية. الأداء السابق لا يضمن النتائج المستقبلية.",
  },
  trust: {
    regulated: "منظَّم وممتثل",
    funds: "أموال عملاء مفصولة",
    audits: "تدقيق مستقل",
    global: "حضور عالمي، مكتب 24/6",
  },
  features: {
    eyebrow: "لماذا HK Investment",
    titleA: "مصممة للمستثمرين الذين يقدّرون",
    titleB: "الانضباط.",
    subtitle:
      "نجمع بين البنية التحتية بمستوى المؤسسات وفريق بشري خبير. رأس مالك يُدار بصرامة، ويُقاس بوضوح، ويُحمى وفق المعايير التي يتوقعها المستثمر الجاد.",
    items: [
      { t: "إدارة محفظة احترافية", b: "فريق استثماري كبير يوزّع رأس المال عبر الأسواق لتحقيق أهدافك." },
      { t: "استراتيجيات استثمار متنوّعة", b: "تعرّض متعدد الأصول عبر الفوركس والذهب والسلع والمؤشرات والأسهم." },
      { t: "تقارير شفافة", b: "كشوف يومية وشهرية وسنوية — كل مركز، كل رسم." },
      { t: "بوابة عميل آمنة", b: "مصادقة ثنائية، تخزين مشفّر، وتحقق KYC/AML." },
      { t: "أداء لحظي", b: "لوحة مباشرة بمنحنى الأسهم والتوزيع ومؤشرات المخاطر." },
      { t: "فريق ذو خبرة", b: "مديرو محافظ ومحلّلون كمّيّون ومسؤولو مخاطر بخبرة عقود في الأسواق العالمية." },
      { t: "إطار مخاطر متقدّم", b: "تحجيم المراكز، وحدود التراجع، واختبارات الضغط في صميم كل استراتيجية." },
      { t: "دعم مخصّص", b: "مدير حساب شخصي ومكتب علاقات ذو أولوية." },
    ],
  },
  solutions: {
    eyebrow: "المحافظ المُدارة",
    title: "ثلاث استراتيجيات. معيار عناية واحد.",
    explore: "استكشف المحافظ",
    popular: "الأكثر شيوعًا",
    target: "العائد السنوي المستهدف",
    risk: "ملف المخاطر",
    min: "الحد الأدنى",
    allocation: "التوزيع",
    open: "افتح حساب",
    tiers: [
      { name: "محافظة", risk: "منخفض", allocation: "٧٠٪ ثابت / ٣٠٪ نمو" },
      { name: "متوازنة", risk: "متوسط", allocation: "٥٠٪ نمو / ٥٠٪ دخل" },
      { name: "نمو", risk: "أعلى", allocation: "٨٠٪ نمو / ٢٠٪ بديل" },
    ],
  },
  perf: {
    aum: "الأصول تحت الإدارة",
    accounts: "حسابات العملاء النشطة",
    tenure: "متوسط مدة العميل (بالسنوات)",
    sat: "رضا العملاء",
  },
  riskf: {
    eyebrow: "إدارة المخاطر",
    title: "الانضباط هو الاستراتيجية.",
    subtitle:
      "إطار عملنا مبني على قناعة واحدة: العوائد المستدامة تأتي من تجنّب الخسائر الكبيرة. كل مركز يُحجَّم ويُراقب ويُختبر وفق ميزانيات مخاطر محدّدة مسبقًا.",
    items: [
      { t: "الحفاظ على رأس المال", b: "كل استراتيجية تبدأ بتحديد الخسارة المقبولة، ثم تُبنى المراكز داخل هذا الحد." },
      { t: "تحجيم المراكز", b: "تحجيم معدَّل حسب التقلبات بناءً على قناعة الاستراتيجية والنظام السوقي الحالي." },
      { t: "تنويع المحفظة", b: "تعرّض غير مترابط عبر العملات والمعادن والمؤشرات وأسهم مختارة." },
      { t: "مراقبة مستمرة", b: "مكتب مخاطر 24/6، تنبيهات آلية وإيقافات صارمة على تراجع الاستراتيجية." },
      { t: "اختبار الضغط", b: "سيناريوهات تاريخية وافتراضية تُشغَّل أسبوعيًا للتحقق من المرونة." },
      { t: "ضوابط المخاطر", b: "حدود صارمة للرافعة والتركّز والتعرّض المترابط، مُطبَّقة على مستوى المنصة." },
    ],
    disclaimer:
      "كل استثمار ينطوي على مخاطر، بما فيها فقدان رأس المال. الأداء السابق لا يشير إلى النتائج المستقبلية ولا يضمنها.",
  },
  security: {
    eyebrow: "الأمان",
    title: "ضمانات يمكنك التحقق منها.",
    subtitle:
      "نحمي رأس مال العملاء وبياناتهم بضوابط أمنية متعدّدة الطبقات وتدقيقات خارجية ونهج تشغيل بلا ثقة ضمنية.",
    legal: "القانوني والامتثال",
    items: [
      { t: "مصادقة ثنائية", b: "مصادقة TOTP لكل تسجيل دخول وإجراء حسّاس." },
      { t: "بيانات عملاء مشفّرة", b: "تشفير AES-256 للتخزين وTLS 1.3 لكل طلب." },
      { t: "بنية سحابية آمنة", b: "بيئة إنتاج معزَّزة بوصول أقل امتياز." },
      { t: "التحقق من الهوية (KYC)", b: "التحقق من الهوية لكل حساب قبل التفعيل." },
      { t: "الامتثال لمكافحة غسل الأموال", b: "مراقبة العمليات وفق المعايير الدولية." },
      { t: "سجلات تدقيق", b: "أثر تدقيق غير قابل للتعديل لكل حدث تشغيلي أو حسابي." },
    ],
  },
  portal: {
    eyebrow: "بوابة العميل",
    title: "محفظتك، بشفافية.",
    access: "الوصول إلى لوحتك",
    items: [
      { t: "نظرة عامة على المحفظة", b: "الرصيد والتوزيع والربح والخسارة في لمحة." },
      { t: "أداء مباشر", b: "رسوم بيانية تفاعلية مع العوائد اليومية والتراكمية." },
      { t: "كشوف وتقارير", b: "تقارير PDF شهرية وسنوية وعند الطلب." },
      { t: "مراسلات آمنة", b: "خط مباشر مع مدير حسابك." },
    ],
  },
  final: {
    eyebrow: "ابدأ الآن",
    titleA: "ضع رأس مالك في",
    titleB: "أيدٍ خبيرة.",
    cta: "افتح حساب استثمار",
    note: "تحدّث مع مختصّ حول أهدافك وأفقك الزمني وتحمّلك للمخاطر.",
  },
};

const fr: LandingContent = {
  hero: {
    badge: "Gestion d'investissement professionnelle",
    titleA: "Gestion",
    titleB: "d'Investissement",
    titleC: "Professionnelle",
    subtitle:
      "Gestion de portefeuille expérimentée, contrôle des risques rigoureux, reporting transparent et service centré client — sur le Forex, l'Or, les matières premières, les indices et les actions.",
    ctaOpen: "Ouvrir un compte d'investissement",
    ctaAdvisor: "Parler à un conseiller",
    ctaLearn: "En savoir plus",
    statAum: "Actifs gérés",
    statClients: "Clients",
    statCountries: "Pays",
    cardTitle: "Portefeuille Croissance Équilibrée",
    ytd: "YTD",
    live: "En direct",
    disclaimer:
      "Exemple illustratif. Les performances passées ne garantissent pas les résultats futurs.",
  },
  trust: {
    regulated: "Régulé et conforme",
    funds: "Fonds clients ségrégués",
    audits: "Audits indépendants",
    global: "Portée mondiale, desk 24/6",
  },
  features: {
    eyebrow: "Pourquoi HK Investment",
    titleA: "Conçu pour les investisseurs qui valorisent",
    titleB: "la discipline.",
    subtitle:
      "Nous combinons une infrastructure de niveau institutionnel avec une équipe humaine expérimentée. Votre capital est géré avec rigueur, reporté avec clarté et protégé selon les standards attendus d'un gérant d'actifs sérieux.",
    items: [
      { t: "Gestion de portefeuille professionnelle", b: "Une équipe d'investissement senior alloue sur les marchés selon vos objectifs." },
      { t: "Stratégies d'investissement diversifiées", b: "Exposition multi-actifs : Forex, Or, matières premières, indices et actions." },
      { t: "Reporting transparent", b: "Relevés quotidiens, mensuels et annuels — chaque position, chaque frais." },
      { t: "Portail client sécurisé", b: "Authentification à deux facteurs, stockage chiffré, KYC/AML vérifié." },
      { t: "Performance en temps réel", b: "Tableau de bord avec courbe d'équité, allocation et mesures de risque." },
      { t: "Équipe expérimentée", b: "Gérants, quants et responsables du risque avec des décennies sur les marchés." },
      { t: "Cadre de risque avancé", b: "Dimensionnement, limites de drawdown et stress tests intégrés à chaque stratégie." },
      { t: "Support dédié", b: "Chargé de compte nommé et desk relationnel prioritaire." },
    ],
  },
  solutions: {
    eyebrow: "Portefeuilles gérés",
    title: "Trois stratégies. Une même exigence.",
    explore: "Explorer les portefeuilles",
    popular: "Le plus populaire",
    target: "Rendement annuel visé",
    risk: "Profil de risque",
    min: "Minimum",
    allocation: "Allocation",
    open: "Ouvrir un compte",
    tiers: [
      { name: "Prudent", risk: "Faible", allocation: "70% Fixe / 30% Croissance" },
      { name: "Équilibré", risk: "Modéré", allocation: "50% Croissance / 50% Revenu" },
      { name: "Croissance", risk: "Élevé", allocation: "80% Croissance / 20% Alt." },
    ],
  },
  perf: {
    aum: "Actifs sous gestion",
    accounts: "Comptes clients actifs",
    tenure: "Ancienneté moyenne (ans)",
    sat: "Satisfaction client",
  },
  riskf: {
    eyebrow: "Gestion des risques",
    title: "La discipline est la stratégie.",
    subtitle:
      "Notre cadre repose sur une conviction : les rendements durables viennent de l'évitement des grosses pertes. Chaque position est dimensionnée, surveillée et testée contre des budgets de risque prédéfinis.",
    items: [
      { t: "Préservation du capital", b: "Chaque stratégie définit d'abord la perte acceptable, puis construit ses positions dans cette limite." },
      { t: "Dimensionnement des positions", b: "Ajustement par la volatilité selon la conviction et le régime de marché." },
      { t: "Diversification du portefeuille", b: "Expositions décorrélées entre devises, métaux, indices et titres choisis." },
      { t: "Surveillance continue", b: "Desk risque 24/6, alertes automatiques et stops fermes sur les drawdowns." },
      { t: "Stress tests", b: "Scénarios historiques et hypothétiques exécutés chaque semaine." },
      { t: "Contrôles de risque", b: "Limites strictes sur levier, concentration et corrélation, appliquées au niveau plateforme." },
    ],
    disclaimer:
      "Tout investissement comporte des risques, y compris la perte en capital. Les performances passées ne préjugent pas des résultats futurs.",
  },
  security: {
    eyebrow: "Sécurité",
    title: "Des garde-fous vérifiables.",
    subtitle:
      "Nous protégeons le capital et les données clients avec des contrôles de sécurité en couches, des audits tiers et une posture zéro confiance.",
    legal: "Juridique & Conformité",
    items: [
      { t: "Authentification à deux facteurs", b: "2FA TOTP à chaque connexion et action sensible." },
      { t: "Données clients chiffrées", b: "AES-256 au repos, TLS 1.3 en transit." },
      { t: "Infrastructure cloud sécurisée", b: "Environnement de production renforcé, accès au moindre privilège." },
      { t: "Vérification KYC", b: "Vérification d'identité avant activation." },
      { t: "Conformité AML", b: "Surveillance des transactions selon les standards internationaux." },
      { t: "Journaux d'audit", b: "Piste d'audit immuable pour chaque événement." },
    ],
  },
  portal: {
    eyebrow: "Espace client",
    title: "Votre portefeuille, en toute transparence.",
    access: "Accéder au tableau de bord",
    items: [
      { t: "Vue d'ensemble", b: "Solde, allocation et P&L en un coup d'œil." },
      { t: "Performance en direct", b: "Graphiques interactifs des rendements quotidiens et cumulés." },
      { t: "Relevés & rapports", b: "Rapports PDF mensuels, annuels et à la demande." },
      { t: "Messagerie sécurisée", b: "Ligne directe avec votre chargé de compte." },
    ],
  },
  final: {
    eyebrow: "Commencer",
    titleA: "Confiez votre capital à",
    titleB: "des mains expérimentées.",
    cta: "Ouvrir un compte d'investissement",
    note: "Parlez à un spécialiste de vos objectifs, horizon et tolérance au risque.",
  },
};

const es: LandingContent = {
  hero: {
    badge: "Gestión de Inversiones Profesional",
    titleA: "Gestión",
    titleB: "de Inversiones",
    titleC: "Profesional",
    subtitle:
      "Gestión de carteras experimentada con controles de riesgo disciplinados, reportes transparentes y servicio enfocado al cliente — en Forex, Oro, Materias primas, Índices y Acciones.",
    ctaOpen: "Abrir cuenta de inversión",
    ctaAdvisor: "Hablar con un asesor",
    ctaLearn: "Saber más",
    statAum: "Activos gestionados",
    statClients: "Clientes",
    statCountries: "Países",
    cardTitle: "Cartera Crecimiento Equilibrado",
    ytd: "YTD",
    live: "En vivo",
    disclaimer: "Ejemplo ilustrativo. Los resultados pasados no garantizan resultados futuros.",
  },
  trust: {
    regulated: "Regulado y conforme",
    funds: "Fondos de clientes segregados",
    audits: "Auditorías independientes",
    global: "Alcance global, mesa 24/6",
  },
  features: {
    eyebrow: "Por qué HK Investment",
    titleA: "Diseñado para inversores que valoran",
    titleB: "la disciplina.",
    subtitle:
      "Combinamos infraestructura de nivel institucional con un equipo humano experimentado. Tu capital se gestiona con rigor, se reporta con claridad y se protege con los estándares de un gestor serio.",
    items: [
      { t: "Gestión profesional de cartera", b: "Un equipo senior asigna capital en los mercados según tus objetivos." },
      { t: "Estrategias diversificadas", b: "Exposición multi-activo en Forex, Oro, Materias primas, Índices y Acciones." },
      { t: "Reportes transparentes", b: "Estados diarios, mensuales y anuales — cada posición, cada comisión." },
      { t: "Portal de cliente seguro", b: "Autenticación de dos factores, almacenamiento cifrado, KYC/AML verificados." },
      { t: "Rendimiento en tiempo real", b: "Panel en vivo con curva de capital, asignación y métricas de riesgo." },
      { t: "Equipo con experiencia", b: "Gestores, quants y responsables de riesgo con décadas en mercados globales." },
      { t: "Marco de riesgo avanzado", b: "Dimensionamiento, límites de drawdown y stress tests en cada estrategia." },
      { t: "Soporte dedicado", b: "Gestor de cuenta asignado y mesa de relación prioritaria." },
    ],
  },
  solutions: {
    eyebrow: "Carteras gestionadas",
    title: "Tres estrategias. Un único estándar.",
    explore: "Explorar carteras",
    popular: "Más popular",
    target: "Rendimiento anual objetivo",
    risk: "Perfil de riesgo",
    min: "Mínimo",
    allocation: "Asignación",
    open: "Abrir cuenta",
    tiers: [
      { name: "Conservadora", risk: "Bajo", allocation: "70% Fijo / 30% Crecimiento" },
      { name: "Equilibrada", risk: "Moderado", allocation: "50% Crecimiento / 50% Ingresos" },
      { name: "Crecimiento", risk: "Alto", allocation: "80% Crecimiento / 20% Alt." },
    ],
  },
  perf: {
    aum: "Activos bajo gestión",
    accounts: "Cuentas de clientes activas",
    tenure: "Antigüedad media (años)",
    sat: "Satisfacción del cliente",
  },
  riskf: {
    eyebrow: "Gestión de riesgos",
    title: "La disciplina es la estrategia.",
    subtitle:
      "Nuestro marco se basa en una idea: los rendimientos duraderos vienen de evitar grandes pérdidas. Cada posición se dimensiona, monitoriza y prueba contra presupuestos de riesgo predefinidos.",
    items: [
      { t: "Preservación del capital", b: "Cada estrategia define primero la pérdida aceptable y construye las posiciones dentro de ese límite." },
      { t: "Dimensionamiento de posiciones", b: "Ajuste por volatilidad según la convicción y el régimen de mercado." },
      { t: "Diversificación", b: "Exposición no correlacionada entre divisas, metales, índices y valores seleccionados." },
      { t: "Monitorización continua", b: "Mesa de riesgo 24/6, alertas automáticas y stops firmes." },
      { t: "Pruebas de estrés", b: "Escenarios históricos e hipotéticos semanales para validar la resiliencia." },
      { t: "Controles de riesgo", b: "Límites estrictos de apalancamiento, concentración y correlación en la plataforma." },
    ],
    disclaimer:
      "Toda inversión conlleva riesgo, incluida la pérdida del principal. Los resultados pasados no garantizan los futuros.",
  },
  security: {
    eyebrow: "Seguridad",
    title: "Garantías que puedes verificar.",
    subtitle:
      "Protegemos capital y datos con controles de seguridad por capas, auditorías externas y una postura de confianza cero.",
    legal: "Legal y cumplimiento",
    items: [
      { t: "Autenticación de dos factores", b: "2FA TOTP en cada inicio de sesión y acción sensible." },
      { t: "Datos cifrados", b: "AES-256 en reposo, TLS 1.3 en tránsito." },
      { t: "Infraestructura cloud segura", b: "Entorno de producción endurecido con mínimos privilegios." },
      { t: "Verificación KYC", b: "Verificación de identidad antes de activar cada cuenta." },
      { t: "Cumplimiento AML", b: "Monitorización alineada con estándares internacionales." },
      { t: "Registros de auditoría", b: "Rastro inmutable para cada evento operativo y de cuenta." },
    ],
  },
  portal: {
    eyebrow: "Portal del cliente",
    title: "Tu cartera, transparente.",
    access: "Acceder al panel",
    items: [
      { t: "Visión de la cartera", b: "Saldo, asignación y P&L a un vistazo." },
      { t: "Rendimiento en vivo", b: "Gráficos interactivos de rendimientos diarios y acumulados." },
      { t: "Estados e informes", b: "Informes PDF mensuales, anuales y a demanda." },
      { t: "Mensajería segura", b: "Línea directa con tu gestor de cuenta." },
    ],
  },
  final: {
    eyebrow: "Empezar",
    titleA: "Pon tu capital en",
    titleB: "manos expertas.",
    cta: "Abrir cuenta de inversión",
    note: "Habla con un especialista sobre tus objetivos, horizonte y tolerancia al riesgo.",
  },
};

const tr: LandingContent = {
  hero: {
    badge: "Profesyonel Yatırım Yönetimi",
    titleA: "Profesyonel",
    titleB: "Yatırım",
    titleC: "Yönetimi",
    subtitle:
      "Disiplinli risk kontrolleri, şeffaf raporlama ve müşteri odaklı hizmet ile deneyimli portföy yönetimi — Forex, Altın, Emtia, Endeksler ve Hisseler genelinde.",
    ctaOpen: "Yatırım hesabı aç",
    ctaAdvisor: "Bir danışmanla görüş",
    ctaLearn: "Daha fazla bilgi",
    statAum: "Yönetilen Varlık",
    statClients: "Müşteri",
    statCountries: "Ülke",
    cardTitle: "Dengeli Büyüme Portföyü",
    ytd: "Yılbaşından bu yana",
    live: "Canlı",
    disclaimer: "Örnek gösterimdir. Geçmiş performans gelecekteki sonuçları garanti etmez.",
  },
  trust: {
    regulated: "Düzenlenmiş ve uyumlu",
    funds: "Ayrıştırılmış müşteri fonları",
    audits: "Bağımsız denetimler",
    global: "Küresel erişim, 24/6 masa",
  },
  features: {
    eyebrow: "Neden HK Investment",
    titleA: "Disipline değer veren yatırımcılar için",
    titleB: "tasarlandı.",
    subtitle:
      "Kurumsal düzeyde altyapıyı deneyimli insan ekibiyle birleştiriyoruz. Sermayeniz titizlikle yönetilir, netlikle raporlanır ve ciddi bir varlık yöneticisinden beklediğiniz standartlarla korunur.",
    items: [
      { t: "Profesyonel portföy yönetimi", b: "Kıdemli yatırım ekibi, hedeflerinize göre piyasalarda tahsis yapar." },
      { t: "Çeşitlendirilmiş stratejiler", b: "Forex, Altın, Emtia, Endeksler ve Hisselerde çoklu varlık maruziyeti." },
      { t: "Şeffaf raporlama", b: "Günlük, aylık ve yıllık ekstreler — her pozisyon, her ücret." },
      { t: "Güvenli müşteri portalı", b: "İki faktörlü kimlik doğrulama, şifreli depolama, KYC/AML doğrulaması." },
      { t: "Gerçek zamanlı performans", b: "Sermaye eğrisi, tahsis ve risk metrikleriyle canlı panel." },
      { t: "Deneyimli ekip", b: "Portföy yöneticileri, kantlar ve risk yetkilileri; küresel piyasalarda on yıllar." },
      { t: "Gelişmiş risk çerçevesi", b: "Pozisyon boyutlandırma, drawdown limitleri ve stres testleri her stratejiye gömülüdür." },
      { t: "Özel destek", b: "İsim yapmış bir hesap yöneticisi ve öncelikli ilişki masası." },
    ],
  },
  solutions: {
    eyebrow: "Yönetilen Portföyler",
    title: "Üç strateji. Tek özen standardı.",
    explore: "Portföyleri keşfet",
    popular: "En popüler",
    target: "Hedef yıllık getiri",
    risk: "Risk profili",
    min: "Minimum",
    allocation: "Tahsis",
    open: "Hesap aç",
    tiers: [
      { name: "Muhafazakâr", risk: "Düşük", allocation: "%70 Sabit / %30 Büyüme" },
      { name: "Dengeli", risk: "Orta", allocation: "%50 Büyüme / %50 Gelir" },
      { name: "Büyüme", risk: "Yüksek", allocation: "%80 Büyüme / %20 Alt." },
    ],
  },
  perf: {
    aum: "Yönetilen varlıklar",
    accounts: "Aktif müşteri hesapları",
    tenure: "Ortalama süre (yıl)",
    sat: "Müşteri memnuniyeti",
  },
  riskf: {
    eyebrow: "Risk Yönetimi",
    title: "Disiplin, stratejinin kendisidir.",
    subtitle:
      "Çerçevemiz tek bir inanca dayanır: kalıcı getiriler büyük kayıplardan kaçınmaktan gelir. Her pozisyon, önceden belirlenmiş risk bütçelerine göre boyutlandırılır, izlenir ve stres testine tabi tutulur.",
    items: [
      { t: "Sermaye koruma", b: "Her strateji önce kabul edilebilir kaybı tanımlar, pozisyonları bu sınır içinde kurar." },
      { t: "Pozisyon boyutlandırma", b: "Strateji güvenine ve piyasa rejimine göre volatiliteye ayarlı boyutlandırma." },
      { t: "Portföy çeşitlendirme", b: "Döviz, metal, endeks ve seçilmiş hisselerde korelasyonsuz maruziyet." },
      { t: "Sürekli izleme", b: "24/6 risk masası, otomatik uyarılar ve strateji seviyesinde sıkı stoplar." },
      { t: "Stres testi", b: "Dayanıklılığı doğrulamak için haftalık tarihsel ve varsayımsal senaryolar." },
      { t: "Risk kontrolleri", b: "Kaldıraç, yoğunlaşma ve korele maruziyette platform seviyesinde sıkı limitler." },
    ],
    disclaimer:
      "Her yatırım, anaparanın kaybı dahil risk taşır. Geçmiş performans gelecekteki sonuçları göstermez ve garanti etmez.",
  },
  security: {
    eyebrow: "Güvenlik",
    title: "Doğrulayabileceğiniz güvenceler.",
    subtitle:
      "Katmanlı güvenlik kontrolleri, üçüncü taraf denetimleri ve sıfır güven işletim duruşuyla müşteri sermayesini ve verisini koruruz.",
    legal: "Hukuki ve uyum",
    items: [
      { t: "İki faktörlü kimlik doğrulama", b: "Her girişte ve hassas işlemde TOTP tabanlı 2FA." },
      { t: "Şifreli müşteri verileri", b: "Beklerken AES-256, iletimde TLS 1.3." },
      { t: "Güvenli bulut altyapısı", b: "En az ayrıcalıklı erişimle sertleştirilmiş üretim ortamı." },
      { t: "KYC doğrulama", b: "Her hesap etkinleştirilmeden önce kimlik doğrulaması." },
      { t: "AML uyumu", b: "Uluslararası standartlarla uyumlu işlem izleme." },
      { t: "Denetim kayıtları", b: "Her operasyonel ve hesap olayı için değişmez denetim izi." },
    ],
  },
  portal: {
    eyebrow: "Müşteri Portalı",
    title: "Portföyünüz, şeffaf.",
    access: "Panele erişin",
    items: [
      { t: "Portföy özeti", b: "Bakiye, tahsis ve K/Z tek bakışta." },
      { t: "Canlı performans", b: "Günlük ve kümülatif getirilerle etkileşimli grafikler." },
      { t: "Ekstreler ve raporlar", b: "Aylık, yıllık ve talebe göre PDF raporlar." },
      { t: "Güvenli mesajlaşma", b: "Hesap yöneticinizle doğrudan hat." },
    ],
  },
  final: {
    eyebrow: "Başlayın",
    titleA: "Sermayenizi",
    titleB: "deneyimli ellere emanet edin.",
    cta: "Yatırım hesabı aç",
    note: "Hedefleriniz, zaman ufkunuz ve risk toleransınız hakkında bir uzmanla konuşun.",
  },
};

export const LANDING: Record<Lang, LandingContent> = { en, ar, fr, es, tr };