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
    withdraw: string;
    open: string;
    tiers: { name: string; risk: string }[];
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
    ctaAdvisor: "Copy Trading",
    ctaLearn: "Competitions",
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
    target: "Target weekly return",
    risk: "Risk profile",
    min: "Minimum",
    withdraw: "Min. profit withdrawal",
    open: "Open account",
    tiers: [
      { name: "Conservative", risk: "Low" },
      { name: "Balanced", risk: "Low" },
      { name: "Growth", risk: "Higher" },
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
    badge: "استثمر أموالك… واترك التداول للمحترفين.",
    titleA: "نقوم",
    titleB: "بالتداول",
    titleC: "نيابةً عنك",
    subtitle:
      "فريق من المتداولين المحترفين يدير عمليات التداول باستخدام استراتيجيات مدروسة وإدارة مخاطر دقيقة، لتتمكن من الاستثمار دون الحاجة إلى تعلم التداول أو متابعة الأسواق بنفسك.\nتأسست في 2017، وتجمع HKEX بين التنفيذ المؤسسي ومنظومة مسابقات عالمية — بثقة أكثر من مليوني عميل.",
    ctaOpen: "افتح حساب استثمار",
    ctaAdvisor: "نسخ صفقات",
    ctaLearn: "المسابقات",
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
    eyebrow: "باقات الاستثمار",
    title: "ثلاث استراتيجيات. معيار عناية واحد.",
    explore: "استكشف باقات الاستثمار",
    popular: "الأكثر شيوعًا",
    target: "العائد الأسبوعي المستهدف",
    risk: "ملف المخاطر",
    min: "الحد الأدنى",
    withdraw: "الحد الأدنى لسحب الأرباح",
    open: "افتح حساب",
    tiers: [
      { name: "محافظة", risk: "منخفض" },
      { name: "متوازنة", risk: "منخفض" },
      { name: "نمو", risk: "أعلى" },
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
    ctaAdvisor: "Copie de trades",
    ctaLearn: "Concours",
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
    target: "Rendement hebdomadaire visé",
    risk: "Profil de risque",
    min: "Minimum",
    withdraw: "Retrait min. des gains",
    open: "Ouvrir un compte",
    tiers: [
      { name: "Prudent", risk: "Faible" },
      { name: "Équilibré", risk: "Faible" },
      { name: "Croissance", risk: "Élevé" },
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
    ctaAdvisor: "Copiar operaciones",
    ctaLearn: "Concursos",
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
    target: "Rendimiento semanal objetivo",
    risk: "Perfil de riesgo",
    min: "Mínimo",
    withdraw: "Retiro mín. de ganancias",
    open: "Abrir cuenta",
    tiers: [
      { name: "Conservadora", risk: "Bajo" },
      { name: "Equilibrada", risk: "Bajo" },
      { name: "Crecimiento", risk: "Alto" },
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
    ctaAdvisor: "İşlem Kopyalama",
    ctaLearn: "Yarışmalar",
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
    target: "Hedef haftalık getiri",
    risk: "Risk profili",
    min: "Minimum",
    withdraw: "Min. kâr çekimi",
    open: "Hesap aç",
    tiers: [
      { name: "Muhafazakâr", risk: "Düşük" },
      { name: "Dengeli", risk: "Düşük" },
      { name: "Büyüme", risk: "Yüksek" },
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

const de: LandingContent = {
    hero: {
      badge: "Professionelles Investmentmanagement",
      titleA: "Professionelles",
      titleB: "Investment-",
      titleC: "Management",
      subtitle: "Erfahrenes Portfoliomanagement mit disziplinierten Risikokontrollen, transparenter Berichterstattung und kundenorientiertem Service – über Forex, Gold, Rohstoffe, Indizes und Aktien hinweg.",
      ctaOpen: "Investmentkonto eröffnen",
      ctaAdvisor: "Copy Trading",
      ctaLearn: "Wettbewerbe",
      statAum: "Verwaltetes Vermögen",
      statClients: "Kunden",
      statCountries: "Länder",
      cardTitle: "Ausgewogenes Wachstum Portfolio",
      ytd: "JTD",
      live: "Live",
      disclaimer: "Illustratives Beispiel. Die Wertentwicklung in der Vergangenheit ist kein Indikator für zukünftige Ergebnisse."
    },
    trust: {
      regulated: "Reguliert & konform",
      funds: "Getrennte Kundengelder",
      audits: "Unabhängige Prüfungen",
      global: "Globale Reichweite, 24/6 Desk"
    },
    features: {
      eyebrow: "Warum HK Investment",
      titleA: "Konzipiert für Anleger, die",
      titleB: "Disziplin schätzen.",
      subtitle: "Wir kombinieren eine institutionelle Infrastruktur mit einem erfahrenen Team. Ihr Kapital wird mit Sorgfalt verwaltet, transparent berichtet und mit den Standards, die Sie von einem seriösen Vermögensverwalter erwarten, geschützt.",
      items: [
        {
          t: "Professionelles Portfoliomanagement",
          b: "Ein erfahrenes Investmentteam allokiert über verschiedene Märkte, um Ihre Ziele zu verfolgen."
        },
        {
          t: "Diversifizierte Anlagestrategien",
          b: "Multi-Asset-Engagement über Forex, Gold, Rohstoffe, Indizes und ausgewählte Aktien."
        },
        {
          t: "Transparente Berichterstattung",
          b: "Tägliche, monatliche und jährliche Kontoauszüge – jede Position, jede Gebühr."
        },
        {
          t: "Sicheres Kundenportal",
          b: "Zwei-Faktor-Authentifizierung, verschlüsselte Speicherung, KYC/AML-verifiziert."
        },
        {
          t: "Echtzeit-Performance",
          b: "Live-Dashboard mit Equity-Kurve, Allokation und Risikometriken."
        },
        {
          t: "Erfahrenes Team",
          b: "Portfoliomanager, Quant-Analysten und Risikobeauftragte mit jahrzehntelanger Erfahrung in globalen Märkten."
        },
        {
          t: "Fortgeschrittenes Risikorahmenwerk",
          b: "Positionsgröße, Drawdown-Limits und Stresstests sind in jede Strategie integriert."
        },
        {
          t: "Engagierter Support",
          b: "Benannter Kundenbetreuer und bevorzugter Relationship Desk."
        }
      ]
    },
    solutions: {
      eyebrow: "Verwaltete Portfolios",
      title: "Drei Strategien. Ein Qualitätsstandard.",
      explore: "Portfolios entdecken",
      popular: "Am beliebtesten",
      target: "Ziel wöchentliche Rendite",
      risk: "Risikoprofil",
      min: "Minimum",
      withdraw: "Mindestausschüttung Gewinn",
      open: "Konto eröffnen",
      tiers: [
        {
          name: "Konservativ",
          risk: "Gering"
        },
        {
          name: "Ausgewogen",
          risk: "Gering"
        },
        {
          name: "Wachstum",
          risk: "Höher"
        }
      ]
    },
    perf: {
      aum: "Verwaltetes Vermögen",
      accounts: "Aktive Kundenkonten",
      tenure: "Durchschnittliche Verweildauer (Jahre)",
      sat: "Kundenzufriedenheit"
    },
    riskf: {
      eyebrow: "Risikomanagement",
      title: "Disziplin ist die Strategie.",
      subtitle: "Unser Rahmenwerk basiert auf dem Glauben: dauerhafte Renditen entstehen durch die Vermeidung großer Verluste. Jede Position wird bemessen, überwacht und auf vordefinierte Risikobudgets hin gestresst.",
      items: [
        {
          t: "Kapitalerhaltung",
          b: "Jede Strategie beginnt mit der Definition des akzeptablen Verlusts und konstruiert dann Positionen innerhalb dieses Limits."
        },
        {
          t: "Positionsgröße",
          b: "Volatilitätsbereinigte Größenanpassung basierend auf der Strategieüberzeugung und dem aktuellen Marktregime."
        },
        {
          t: "Portfoliodiversifikation",
          b: "Unkorreliertes Engagement über Währungen, Metalle, Indizes und ausgewählte Einzeltitel."
        },
        {
          t: "Kontinuierliche Überwachung",
          b: "24/6 Risikodesk, automatisierte Warnmeldungen und harte Stopps bei Drawdowns auf Strategieebene."
        },
        {
          t: "Stresstests",
          b: "Historische und hypothetische Szenarien werden wöchentlich durchgeführt, um die Resilienz zu validieren."
        },
        {
          t: "Risikokontrollen",
          b: "Harte Limits für Hebelwirkung, Konzentration und korrelierte Exposition, auf Plattformebene durchgesetzt."
        }
      ],
      disclaimer: "Jede Anlage ist mit Risiken verbunden, einschließlich des Verlusts des Kapitals. Die Wertentwicklung in der Vergangenheit ist kein Indikator und keine Garantie für zukünftige Ergebnisse."
    },
    security: {
      eyebrow: "Sicherheit",
      title: "Verifizierbare Schutzmechanismen.",
      subtitle: "Wir schützen Kundeneinlagen und -daten mit mehrstufigen Sicherheitskontrollen, externen Prüfungen und einem Zero-Trust-Betriebsansatz.",
      legal: "Recht & Compliance",
      items: [
        {
          t: "Zwei-Faktor-Authentifizierung",
          b: "TOTP-basierte 2FA bei jeder Kundenanmeldung und sensiblen Aktion."
        },
        {
          t: "Verschlüsselte Kundendaten",
          b: "AES-256 im Ruhezustand und TLS 1.3 während der Übertragung für jede Anfrage."
        },
        {
          t: "Sichere Cloud-Infrastruktur",
          b: "Gehärtete Produktionsumgebung mit Least-Privilege-Zugriff."
        },
        {
          t: "KYC-Verifizierung",
          b: "Identitätsprüfung für jedes Konto vor der Aktivierung."
        },
        {
          t: "AML-Compliance",
          b: "Transaktionsüberwachung gemäß internationalen Standards."
        },
        {
          t: "Audit-Protokolle",
          b: "Unveränderliche Audit-Trails für jedes Betriebs- und Kontoereignis."
        }
      ]
    },
    portal: {
      eyebrow: "Kundenportal",
      title: "Ihr Portfolio, transparent.",
      access: "Zugang zum Dashboard",
      items: [
        {
          t: "Portfolioübersicht",
          b: "Bilanz, Allokation und P&L auf einen Blick."
        },
        {
          t: "Live-Performance",
          b: "Interaktive Charts mit täglichen und kumulierten Renditen."
        },
        {
          t: "Abrechnungen & Berichte",
          b: "Monatliche, jährliche und auf Anfrage erstellte PDF-Berichte."
        },
        {
          t: "Sichere Nachrichtenübermittlung",
          b: "Direkter Draht zu Ihrem Kundenbetreuer."
        }
      ]
    },
    final: {
      eyebrow: "Loslegen",
      titleA: "Legen Sie Ihr Kapital in",
      titleB: "erfahrene Hände.",
      cta: "Investmentkonto eröffnen",
      note: "Sprechen Sie mit einem Spezialisten über Ihre Ziele, Ihren Zeithorizont und Ihre Risikobereitschaft."
    }
  };

const it: LandingContent = {
    hero: {
      badge: "Gestione Professionale degli Investimenti",
      titleA: "Gestione",
      titleB: "Professionale",
      titleC: "Investimenti",
      subtitle: "Gestione di portafoglio esperta con controlli disciplinati del rischio, reportistica trasparente e servizio incentrato sul cliente — su Forex, Oro, Materie Prime, Indici e Azioni.",
      ctaOpen: "Apri Conto di Investimento",
      ctaAdvisor: "Copy Trading",
      ctaLearn: "Competizioni",
      statAum: "AUM",
      statClients: "Clienti",
      statCountries: "Paesi",
      cardTitle: "Portafoglio a Crescita Bilanciata",
      ytd: "YTD",
      live: "Live",
      disclaimer: "Esempio illustrativo. Le performance passate non garantiscono risultati futuri."
    },
    trust: {
      regulated: "Regolamentato e conforme",
      funds: "Fondi cliente segregati",
      audits: "Audit indipendenti",
      global: "Portata globale, desk 24/6"
    },
    features: {
      eyebrow: "Perché HK Investment",
      titleA: "Costruito per investitori che apprezzano la",
      titleB: "disciplina.",
      subtitle: "Uniamo infrastrutture di livello istituzionale a un team umano esperto. Il tuo capitale è gestito con rigore, rendicontato con chiarezza e salvaguardato con gli standard che ti aspetteresti da un gestore patrimoniale serio.",
      items: [
        {
          t: "Gestione professionale del portafoglio",
          b: "Un team di investimento senior alloca sui mercati per perseguire i tuoi obiettivi."
        },
        {
          t: "Strategie di investimento diversificate",
          b: "Esposizione multi-asset su Forex, Oro, Materie Prime, Indici e Azioni."
        },
        {
          t: "Reportistica trasparente",
          b: "Rendiconti giornalieri, mensili e annuali — ogni posizione, ogni commissione."
        },
        {
          t: "Portale clienti sicuro",
          b: "Autenticazione a due fattori, archiviazione crittografata, verifica KYC/AML."
        },
        {
          t: "Performance in tempo reale",
          b: "Dashboard live con curva di equità, allocazione e metriche di rischio."
        },
        {
          t: "Team esperto",
          b: "Gestori di portafoglio, quant e responsabili del rischio con decenni di esperienza nei mercati globali."
        },
        {
          t: "Struttura avanzata di gestione del rischio",
          b: "Dimensionamento delle posizioni, limiti di drawdown e stress test integrati in ogni strategia."
        },
        {
          t: "Supporto dedicato",
          b: "Account manager dedicato e desk relazioni prioritario."
        }
      ]
    },
    solutions: {
      eyebrow: "Portafogli Gestiti",
      title: "Tre strategie. Uno standard di cura.",
      explore: "Esplora portafogli",
      popular: "Più popolare",
      target: "Rendimento settimanale target",
      risk: "Profilo di rischio",
      min: "Minimo",
      withdraw: "Prelievo minimo profitto",
      open: "Apri conto",
      tiers: [
        {
          name: "Conservativo",
          risk: "Basso"
        },
        {
          name: "Bilanciato",
          risk: "Basso"
        },
        {
          name: "Crescita",
          risk: "Più alto"
        }
      ]
    },
    perf: {
      aum: "Asset in gestione",
      accounts: "Conti clienti attivi",
      tenure: "Durata media (anni)",
      sat: "Soddisfazione cliente"
    },
    riskf: {
      eyebrow: "Gestione del Rischio",
      title: "La disciplina è la strategia.",
      subtitle: "Il nostro framework è costruito su una convinzione: i rendimenti duraturi derivano dall'evitare perdite ingenti. Ogni posizione viene dimensionata, monitorata e sottoposta a stress test rispetto a budget di rischio predefiniti.",
      items: [
        {
          t: "Conservazione del capitale",
          b: "Ogni strategia inizia definendo la perdita accettabile, quindi costruisce posizioni all'interno di tale limite."
        },
        {
          t: "Dimensionamento delle posizioni",
          b: "Dimensionamento aggiustato per la volatilità basato sulla convinzione strategica e sul regime di mercato attuale."
        },
        {
          t: "Diversificazione del portafoglio",
          b: "Esposizione non correlata su valute, metalli, indici e titoli selezionati."
        },
        {
          t: "Monitoraggio continuo",
          b: "Desk di rischio 24/6, avvisi automatizzati e stop rigidi sui drawdown a livello di strategia."
        },
        {
          t: "Stress testing",
          b: "Scenari storici e ipotetici eseguiti settimanalmente per convalidare la resilienza."
        },
        {
          t: "Controlli del rischio",
          b: "Limiti rigidi su leva, concentrazione ed esposizione correlata, applicati a livello di piattaforma."
        }
      ],
      disclaimer: "Tutti gli investimenti comportano rischi, inclusa la perdita del capitale. Le performance passate non sono indicative e non garantiscono risultati futuri."
    },
    security: {
      eyebrow: "Sicurezza",
      title: "Barriere di sicurezza verificabili.",
      subtitle: "Proteggiamo il capitale e i dati dei clienti con controlli di sicurezza a più livelli, audit di terze parti e una postura operativa a fiducia zero.",
      legal: "Legale e conformità",
      items: [
        {
          t: "Autenticazione a due fattori",
          b: "2FA basata su TOTP per ogni accesso cliente e azione sensibile."
        },
        {
          t: "Dati cliente crittografati",
          b: "AES-256 a riposo e TLS 1.3 in transito per ogni richiesta."
        },
        {
          t: "Infrastruttura cloud sicura",
          b: "Ambiente di produzione rafforzato con accesso con privilegi minimi."
        },
        {
          t: "Verifica KYC",
          b: "Verifica dell'identità su ogni conto prima dell'attivazione."
        },
        {
          t: "Conformità AML",
          b: "Monitoraggio delle transazioni allineato agli standard internazionali."
        },
        {
          t: "Log di audit",
          b: "Traccia di audit immutabile per ogni evento operativo e di conto."
        }
      ]
    },
    portal: {
      eyebrow: "Portale Clienti",
      title: "Il tuo portafoglio, trasparente.",
      access: "Accedi alla tua dashboard",
      items: [
        {
          t: "Panoramica portafoglio",
          b: "Saldo, allocazione e P&L a colpo d'occhio."
        },
        {
          t: "Performance live",
          b: "Grafici interattivi con rendimenti giornalieri e cumulativi."
        },
        {
          t: "Rendiconti e report",
          b: "Report PDF mensili, annuali e su richiesta."
        },
        {
          t: "Messaggistica sicura",
          b: "Linea diretta con il tuo account manager."
        }
      ]
    },
    final: {
      eyebrow: "Inizia ora",
      titleA: "Metti il tuo capitale in",
      titleB: "mani esperte.",
      cta: "Apri Conto di Investimento",
      note: "Parla con uno specialista dei tuoi obiettivi, tempistiche e tolleranza al rischio."
    }
  };

const pt: LandingContent = {
    hero: {
      badge: "Gestão de Investimentos Profissional",
      titleA: "Profissional",
      titleB: "Gestão de",
      titleC: "Investimentos",
      subtitle: "Gestão de portfólio experiente com controles de risco disciplinados, relatórios transparentes e serviço focado no cliente — abrangendo Forex, Ouro, Commodities, Índices e Ações.",
      ctaOpen: "Abrir Conta de Investimento",
      ctaAdvisor: "Copy Trading",
      ctaLearn: "Competições",
      statAum: "AUM",
      statClients: "Clientes",
      statCountries: "Países",
      cardTitle: "Portfólio de Crescimento Equilibrado",
      ytd: "YTD",
      live: "Ao Vivo",
      disclaimer: "Exemplo ilustrativo. O desempenho passado não garante resultados futuros."
    },
    trust: {
      regulated: "Regulado e em conformidade",
      funds: "Fundos de clientes segregados",
      audits: "Auditorias independentes",
      global: "Alcance global, mesa 24/6"
    },
    features: {
      eyebrow: "Por que HK Investment",
      titleA: "Construído para investidores que valorizam",
      titleB: "a disciplina.",
      subtitle: "Combinamos infraestrutura de nível institucional com uma equipe humana experiente. Seu capital é gerido com rigor, relatado com clareza e protegido com os padrões que você esperaria de um gestor de ativos sério.",
      items: [
        {
          t: "Gestão profissional de portfólio",
          b: "Uma equipe de investimento sênior aloca em diversos mercados para buscar seus objetivos."
        },
        {
          t: "Estratégias de investimento diversificadas",
          b: "Exposição multi-ativos em Forex, Ouro, Commodities, Índices e Ações."
        },
        {
          t: "Relatórios transparentes",
          b: "Extratos diários, mensais e anuais — cada posição, cada taxa."
        },
        {
          t: "Portal seguro para o cliente",
          b: "Autenticação de dois fatores, armazenamento criptografado, KYC/AML verificado."
        },
        {
          t: "Desempenho em tempo real",
          b: "Painel ao vivo com curva de capital, alocação e métricas de risco."
        },
        {
          t: "Equipe experiente",
          b: "Gestores de portfólio, quants e oficiais de risco com décadas em mercados globais."
        },
        {
          t: "Estrutura de risco avançada",
          b: "Dimensionamento de posição, limites de drawdown e testes de estresse incorporados em cada estratégia."
        },
        {
          t: "Suporte dedicado",
          b: "Gerente de conta nomeado e mesa de relacionamento prioritário."
        }
      ]
    },
    solutions: {
      eyebrow: "Portfólios Geridos",
      title: "Três estratégias. Um padrão de cuidado.",
      explore: "Explorar portfólios",
      popular: "Mais popular",
      target: "Retorno semanal alvo",
      risk: "Perfil de risco",
      min: "Mínimo",
      withdraw: "Retirada mín. de lucro",
      open: "Abrir conta",
      tiers: [
        {
          name: "Conservador",
          risk: "Baixo"
        },
        {
          name: "Equilibrado",
          risk: "Baixo"
        },
        {
          name: "Crescimento",
          risk: "Maior"
        }
      ]
    },
    perf: {
      aum: "Ativos sob gestão",
      accounts: "Contas de clientes ativas",
      tenure: "Tempo médio (anos)",
      sat: "Satisfação do cliente"
    },
    riskf: {
      eyebrow: "Gestão de Risco",
      title: "Disciplina é a estratégia.",
      subtitle: "Nossa estrutura é construída em torno de uma crença: retornos duradouros vêm de evitar grandes perdas. Cada posição é dimensionada, monitorada e testada contra orçamentos de risco pré-definidos.",
      items: [
        {
          t: "Preservação de capital",
          b: "Cada estratégia começa definindo a perda aceitável, e então constrói posições dentro desse limite."
        },
        {
          t: "Dimensionamento de posição",
          b: "Dimensionamento ajustado à volatilidade baseado na convicção da estratégia e no regime de mercado atual."
        },
        {
          t: "Diversificação de portfólio",
          b: "Exposição não correlacionada entre moedas, metais, índices e títulos selecionados."
        },
        {
          t: "Monitoramento contínuo",
          b: "Mesa de risco 24/6, alertas automatizados e paradas forçadas em drawdowns de nível de estratégia."
        },
        {
          t: "Teste de estresse",
          b: "Cenários históricos e hipotéticos executados semanalmente para validar a resiliência."
        },
        {
          t: "Controles de risco",
          b: "Limites rígidos de alavancagem, concentração e exposição correlacionada, aplicados no nível da plataforma."
        }
      ],
      disclaimer: "Todo investimento envolve risco, incluindo a perda do capital. O desempenho passado não é indicativo e não garante resultados futuros."
    },
    security: {
      eyebrow: "Segurança",
      title: "Controles que você pode verificar.",
      subtitle: "Protegemos o capital e os dados do cliente com controles de segurança em camadas, auditorias de terceiros e uma postura operacional de confiança zero.",
      legal: "Legal e conformidade",
      items: [
        {
          t: "Autenticação de dois fatores",
          b: "2FA baseada em TOTP em cada login de cliente e ação sensível."
        },
        {
          t: "Dados do cliente criptografados",
          b: "AES-256 em repouso e TLS 1.3 em trânsito para cada solicitação."
        },
        {
          t: "Infraestrutura de nuvem segura",
          b: "Ambiente de produção reforçado com acesso de privilégio mínimo."
        },
        {
          t: "Verificação KYC",
          b: "Verificação de identidade em cada conta antes da ativação."
        },
        {
          t: "Conformidade AML",
          b: "Monitoramento de transações alinhado com padrões internacionais."
        },
        {
          t: "Logs de auditoria",
          b: "Trilha de auditoria imutável para cada evento operacional e de conta."
        }
      ]
    },
    portal: {
      eyebrow: "Portal do Cliente",
      title: "Seu portfólio, transparente.",
      access: "Acessar seu painel",
      items: [
        {
          t: "Visão geral do portfólio",
          b: "Saldo, alocação e P&L em um relance."
        },
        {
          t: "Desempenho ao vivo",
          b: "Gráficos interativos com retornos diários e cumulativos."
        },
        {
          t: "Extratos e relatórios",
          b: "Relatórios mensais, anuais e em PDF sob demanda."
        },
        {
          t: "Mensagens seguras",
          b: "Linha direta com seu gerente de conta."
        }
      ]
    },
    final: {
      eyebrow: "Comece",
      titleA: "Coloque seu capital em",
      titleB: "mãos experientes.",
      cta: "Abrir Conta de Investimento",
      note: "Fale com um especialista sobre seus objetivos, cronograma e tolerância a riscos."
    }
  };

const id: LandingContent = {
    hero: {
      badge: "Manajemen Investasi Profesional",
      titleA: "Manajemen",
      titleB: "Investasi",
      titleC: "Profesional",
      subtitle: "Manajemen portofolio berpengalaman dengan kontrol risiko disiplin, pelaporan transparan dan layanan berorientasi klien — di seluruh Forex, Emas, Komoditas, Indeks, dan Saham.",
      ctaOpen: "Buka Akun Investasi",
      ctaAdvisor: "Salin Perdagangan",
      ctaLearn: "Kompetisi",
      statAum: "AUM",
      statClients: "Klien",
      statCountries: "Negara",
      cardTitle: "Portofolio Pertumbuhan Seimbang",
      ytd: "YTD",
      live: "Langsung",
      disclaimer: "Contoh ilustratif. Kinerja masa lalu tidak menjamin hasil di masa depan."
    },
    trust: {
      regulated: "Teregulasi & patuh",
      funds: "Dana klien yang dipisah",
      audits: "Audit independen",
      global: "Jangkauan global, meja 24/6"
    },
    features: {
      eyebrow: "Mengapa HK Investment",
      titleA: "Dibangun untuk investor yang menghargai",
      titleB: "disiplin.",
      subtitle: "Kami menggabungkan infrastruktur kelas institusional dengan tim manusia yang berpengalaman. Modal Anda dikelola dengan ketat, dilaporkan dengan jelas, dan dijaga dengan standar yang Anda harapkan dari manajer aset yang serius.",
      items: [
        {
          t: "Manajemen portofolio profesional",
          b: "Tim investasi senior mengalokasikan di berbagai pasar untuk mencapai tujuan Anda."
        },
        {
          t: "Strategi investasi terdiversifikasi",
          b: "Eksposur multi-aset di seluruh Forex, Emas, Komoditas, Indeks, dan Saham."
        },
        {
          t: "Pelaporan transparan",
          b: "Laporan harian, bulanan, dan tahunan — setiap posisi, setiap biaya."
        },
        {
          t: "Portal klien aman",
          b: "Otentikasi dua faktor, penyimpanan terenkripsi, terverifikasi KYC/AML."
        },
        {
          t: "Kinerja waktu nyata",
          b: "Dasbor langsung dengan kurva ekuitas, alokasi, dan metrik risiko."
        },
        {
          t: "Tim berpengalaman",
          b: "Manajer portofolio, quant, dan petugas risiko dengan pengalaman puluhan tahun di pasar global."
        },
        {
          t: "Kerangka risiko tingkat lanjut",
          b: "Penentuan ukuran posisi, batas drawdown, dan uji stres yang terintegrasi dalam setiap strategi."
        },
        {
          t: "Dukungan khusus",
          b: "Manajer akun yang ditunjuk dan meja hubungan prioritas."
        }
      ]
    },
    solutions: {
      eyebrow: "Portofolio Terkelola",
      title: "Tiga strategi. Satu standar perawatan.",
      explore: "Jelajahi portofolio",
      popular: "Paling populer",
      target: "Target pengembalian mingguan",
      risk: "Profil risiko",
      min: "Minimum",
      withdraw: "Penarikan keuntungan min.",
      open: "Buka akun",
      tiers: [
        {
          name: "Konservatif",
          risk: "Rendah"
        },
        {
          name: "Seimbang",
          risk: "Rendah"
        },
        {
          name: "Pertumbuhan",
          risk: "Lebih tinggi"
        }
      ]
    },
    perf: {
      aum: "Aset dalam pengelolaan",
      accounts: "Akun klien aktif",
      tenure: "Masa kerja rata-rata (tahun)",
      sat: "Kepuasan klien"
    },
    riskf: {
      eyebrow: "Manajemen Risiko",
      title: "Disiplin adalah strateginya.",
      subtitle: "Kerangka kerja kami dibangun berdasarkan satu keyakinan: pengembalian yang tahan lama berasal dari menghindari kerugian besar. Setiap posisi ditentukan ukurannya, dipantau, dan diuji stres terhadap anggaran risiko yang telah ditentukan sebelumnya.",
      items: [
        {
          t: "Konservasi modal",
          b: "Setiap strategi dimulai dengan menentukan kerugian yang dapat diterima, kemudian membangun posisi di dalam batas tersebut."
        },
        {
          t: "Penentuan ukuran posisi",
          b: "Penentuan ukuran yang disesuaikan volatilitas berdasarkan keyakinan strategi dan rezim pasar saat ini."
        },
        {
          t: "Diversifikasi portofolio",
          b: "Eksposur yang tidak berkorelasi di berbagai mata uang, logam, indeks, dan nama-nama individu tertentu."
        },
        {
          t: "Pemantauan berkelanjutan",
          b: "Meja risiko 24/6, peringatan otomatis, dan penghentian keras pada drawdown tingkat strategi."
        },
        {
          t: "Uji stres",
          b: "Skenario historis dan hipotetis dijalankan setiap minggu untuk memvalidasi ketahanan."
        },
        {
          t: "Kontrol risiko",
          b: "Batas keras pada leverage, konsentrasi, dan eksposur berkorelasi, diberlakukan di tingkat platform."
        }
      ],
      disclaimer: "Semua investasi melibatkan risiko, termasuk kerugian modal pokok. Kinerja masa lalu tidak menunjukkan, dan tidak menjamin, hasil di masa depan."
    },
    security: {
      eyebrow: "Keamanan",
      title: "Pelindung yang dapat Anda verifikasi.",
      subtitle: "Kami melindungi modal dan data klien dengan kontrol keamanan berlapis, audit pihak ketiga, dan postur operasional tanpa kepercayaan.",
      legal: "Hukum & kepatuhan",
      items: [
        {
          t: "Otentikasi dua faktor",
          b: "2FA berbasis TOTP pada setiap login klien dan tindakan sensitif."
        },
        {
          t: "Data klien terenkripsi",
          b: "AES-256 saat tidak aktif dan TLS 1.3 dalam transit untuk setiap permintaan."
        },
        {
          t: "Infrastruktur cloud aman",
          b: "Lingkungan produksi yang diperkuat dengan akses hak istimewa paling rendah."
        },
        {
          t: "Verifikasi KYC",
          b: "Verifikasi identitas pada setiap akun sebelum aktivasi."
        },
        {
          t: "Kepatuhan AML",
          b: "Pemantauan transaksi selaras dengan standar internasional."
        },
        {
          t: "Log audit",
          b: "Jejak audit yang tidak dapat diubah untuk setiap peristiwa operasional dan akun."
        }
      ]
    },
    portal: {
      eyebrow: "Portal Klien",
      title: "Portofolio Anda, transparan.",
      access: "Akses dasbor Anda",
      items: [
        {
          t: "Ikhtisar portofolio",
          b: "Saldo, alokasi, dan P&L dalam satu pandangan."
        },
        {
          t: "Kinerja langsung",
          b: "Grafik interaktif dengan pengembalian harian dan kumulatif."
        },
        {
          t: "Laporan & laporan",
          b: "Laporan PDF bulanan, tahunan, dan sesuai permintaan."
        },
        {
          t: "Pesan aman",
          b: "Saluran langsung ke manajer akun Anda."
        }
      ]
    },
    final: {
      eyebrow: "Mulai",
      titleA: "Serahkan modal Anda kepada",
      titleB: "tangan-tangan berpengalaman.",
      cta: "Buka Akun Investasi",
      note: "Bicarakan dengan spesialis tentang tujuan, jangka waktu, dan toleransi risiko Anda."
    }
  };

const ms: LandingContent = {
    hero: {
      badge: "Pengurusan Pelaburan Profesional",
      titleA: "Pengurusan",
      titleB: "Pelaburan",
      titleC: "Profesional",
      subtitle: "Pengurusan portfolio yang berpengalaman dengan kawalan risiko yang berdisiplin, pelaporan yang telus, dan perkhidmatan berfokuskan pelanggan – merangkumi Forex, Emas, Komoditi, Indeks dan Saham.",
      ctaOpen: "Buka Akaun Pelaburan",
      ctaAdvisor: "Salin Dagangan",
      ctaLearn: "Pertandingan",
      statAum: "AUM",
      statClients: "Pelanggan",
      statCountries: "Negara",
      cardTitle: "Portfolio Pertumbuhan Seimbang",
      ytd: "YTD",
      live: "Langsung",
      disclaimer: "Contoh ilustrasi. Prestasi masa lalu tidak menjamin keputusan masa depan."
    },
    trust: {
      regulated: "Terkawal & patuh",
      funds: "Dana pelanggan yang diasingkan",
      audits: "Audit bebas",
      global: "Jangkauan global, meja 24/6"
    },
    features: {
      eyebrow: "Mengapa HK Investment",
      titleA: "Dibina untuk pelabur yang menghargai",
      titleB: "disiplin.",
      subtitle: "Kami menggabungkan infrastruktur bertaraf institusi dengan pasukan manusia yang berpengalaman. Modal anda diuruskan dengan ketelitian, dilaporkan dengan kejelasan, dan dilindungi dengan piawaian yang anda harapkan daripada pengurus aset yang serius.",
      items: [
        {
          t: "Pengurusan portfolio profesional",
          b: "Pasukan pelaburan kanan memperuntukkan merentas pasaran untuk mencapai objektif anda."
        },
        {
          t: "Strategi pelaburan yang pelbagai",
          b: "Pendedahan pelbagai aset merentas Forex, Emas, Komoditi, Indeks dan Saham."
        },
        {
          t: "Pelaporan telus",
          b: "Penyata harian, bulanan dan tahunan - setiap kedudukan, setiap yuran."
        },
        {
          t: "Portal pelanggan yang selamat",
          b: "Pengesahan dua faktor, storan disulitkan, KYC/AML disahkan."
        },
        {
          t: "Prestasi masa nyata",
          b: "Papan pemuka langsung dengan keluk ekuiti, peruntukan dan metrik risiko."
        },
        {
          t: "Pasukan berpengalaman",
          b: "Pengurus portfolio, quant dan pegawai risiko dengan pengalaman berdekad-dekad dalam pasaran global."
        },
        {
          t: "Rangka kerja risiko lanjutan",
          b: "Penentuan saiz kedudukan, had pengeluaran dan ujian tekanan dibina dalam setiap strategi."
        },
        {
          t: "Sokongan khusus",
          b: "Pengurus akaun yang dinamakan dan meja perhubungan keutamaan."
        }
      ]
    },
    solutions: {
      eyebrow: "Portfolio Terurus",
      title: "Tiga strategi. Satu standard penjagaan.",
      explore: "Teroka portfolio",
      popular: "Paling popular",
      target: "Sasaran pulangan mingguan",
      risk: "Profil risiko",
      min: "Minimum",
      withdraw: "Pengeluaran keuntungan min.",
      open: "Buka akaun",
      tiers: [
        {
          name: "Konservatif",
          risk: "Rendah"
        },
        {
          name: "Seimbang",
          risk: "Rendah"
        },
        {
          name: "Pertumbuhan",
          risk: "Tinggi"
        }
      ]
    },
    perf: {
      aum: "Aset di bawah pengurusan",
      accounts: "Akaun pelanggan aktif",
      tenure: "Tempoh purata (tahun)",
      sat: "Kepuasan pelanggan"
    },
    riskf: {
      eyebrow: "Pengurusan Risiko",
      title: "Disiplin adalah strategi.",
      subtitle: "Rangka kerja kami dibina berdasarkan satu kepercayaan: pulangan yang berkekalan datang daripada mengelakkan kerugian besar. Setiap kedudukan ditentukan saiznya, dipantau dan diuji tekanan terhadap bajet risiko yang telah ditetapkan.",
      items: [
        {
          t: "Pemeliharaan modal",
          b: "Setiap strategi bermula dengan menentukan kerugian yang boleh diterima, kemudian membina kedudukan dalam had tersebut."
        },
        {
          t: "Penentuan saiz kedudukan",
          b: "Penentuan saiz disesuaikan dengan volatiliti berdasarkan keyakinan strategi dan rejim pasaran semasa."
        },
        {
          t: "Pempelbagaian portfolio",
          b: "Pendedahan tidak berkorelasi merentas mata wang, logam, indeks dan nama tunggal terpilih."
        },
        {
          t: "Pemantauan berterusan",
          b: "Meja risiko 24/6, amaran automatik dan hentian keras pada pengeluaran peringkat strategi."
        },
        {
          t: "Ujian tekanan",
          b: "Senario sejarah dan hipotetikal dijalankan setiap minggu untuk mengesahkan ketahanan."
        },
        {
          t: "Kawalan risiko",
          b: "Had keras pada leverage, penumpuan dan pendedahan berkorelasi, dikuatkuasakan di peringkat platform."
        }
      ],
      disclaimer: "Semua pelaburan melibatkan risiko, termasuk kehilangan principal. Prestasi masa lalu tidak menunjukkan, dan tidak menjamin, keputusan masa depan."
    },
    security: {
      eyebrow: "Keselamatan",
      title: "Pelindung yang anda boleh sahkan.",
      subtitle: "Kami melindungi modal dan data pelanggan dengan kawalan keselamatan berlapis, audit pihak ketiga dan postur operasi sifar kepercayaan.",
      legal: "Undang-undang & pematuhan",
      items: [
        {
          t: "Pengesahan dua faktor",
          b: "2FA berasaskan TOTP pada setiap log masuk pelanggan dan tindakan sensitif."
        },
        {
          t: "Data pelanggan yang disulitkan",
          b: "AES-256 pada rehat dan TLS 1.3 dalam transit untuk setiap permintaan."
        },
        {
          t: "Infrastruktur awan yang selamat",
          b: "Persekitaran pengeluaran yang diperkuat dengan akses hak istimewa paling rendah."
        },
        {
          t: "Pengesahan KYC",
          b: "Pengesahan identiti pada setiap akaun sebelum pengaktifan."
        },
        {
          t: "Pematuhan AML",
          b: "Pemantauan transaksi selaras dengan piawaian antarabangsa."
        },
        {
          t: "Log audit",
          b: "Jejak audit tidak boleh ubah untuk setiap peristiwa operasi dan akaun."
        }
      ]
    },
    portal: {
      eyebrow: "Portal Pelanggan",
      title: "Portfolio anda, telus.",
      access: "Akses papan pemuka anda",
      items: [
        {
          t: "Gambaran keseluruhan portfolio",
          b: "Baki, peruntukan dan P&L dalam satu pandangan."
        },
        {
          t: "Prestasi langsung",
          b: "Carta interaktif dengan pulangan harian dan terkumpul."
        },
        {
          t: "Penyata & laporan",
          b: "Laporan PDF bulanan, tahunan dan atas permintaan."
        },
        {
          t: "Pemesejan selamat",
          b: "Talian terus kepada pengurus akaun anda."
        }
      ]
    },
    final: {
      eyebrow: "Mulakan",
      titleA: "Letakkan modal anda di",
      titleB: "tangan yang berpengalaman.",
      cta: "Buka Akaun Pelaburan",
      note: "Berunding dengan pakar mengenai objektif, garis masa dan toleransi risiko anda."
    }
  };

const ko: LandingContent = {
    hero: {
      badge: "전문 투자 관리",
      titleA: "전문적인",
      titleB: "투자",
      titleC: "관리",
      subtitle: "외환, 금, 원자재, 지수 및 주식을 아우르는 경험 많은 포트폴리오 관리, 규율된 위험 통제, 투명한 보고 및 고객 중심 서비스.",
      ctaOpen: "투자 계좌 개설",
      ctaAdvisor: "카피 트레이딩",
      ctaLearn: "투자 대회",
      statAum: "운용자산(AUM)",
      statClients: "고객 수",
      statCountries: "국가 수",
      cardTitle: "균형 성장 포트폴리오",
      ytd: "연초대비(YTD)",
      live: "실시간",
      disclaimer: "예시 샘플입니다. 과거 성과가 미래 결과를 보장하지 않습니다."
    },
    trust: {
      regulated: "규제 준수 및 규정 준수",
      funds: "고객 자금 분리 보관",
      audits: "독립 감사",
      global: "글로벌 접근성, 24/6 데스크 운영"
    },
    features: {
      eyebrow: "HK Investment를 선택하는 이유",
      titleA: "원칙을 중요하게 생각하는",
      titleB: "투자자를 위해 구축되었습니다.",
      subtitle: "기관급 인프라와 경험 많은 전문 팀을 결합합니다. 귀하의 자본은 엄격하게 관리되고, 명확하게 보고되며, 신뢰할 수 있는 자산 관리자에게 기대할 수 있는 기준으로 보호됩니다.",
      items: [
        {
          t: "전문 포트폴리오 관리",
          b: "베테랑 투자팀이 목표 달성을 위해 시장 전반에 걸쳐 자산을 배분합니다."
        },
        {
          t: "다각화된 투자 전략",
          b: "외환, 금, 원자재, 지수 및 주식을 아우르는 다중 자산 노출."
        },
        {
          t: "투명한 보고",
          b: "일간, 월간, 연간 명세서 – 모든 포지션, 모든 수수료."
        },
        {
          t: "보안 클라이언트 포털",
          b: "2단계 인증, 암호화된 저장소, KYC/AML 확인 완료."
        },
        {
          t: "실시간 성과",
          b: "자산 곡선, 배분 및 위험 지표가 포함된 실시간 대시보드."
        },
        {
          t: "경험 많은 팀",
          b: "글로벌 시장에서 수십 년 경력을 쌓은 포트폴리오 매니저, 퀀트 및 리스크 담당자."
        },
        {
          t: "고급 위험 관리 프레임워크",
          b: "포지션 규모 조정, 인출 한도 및 모든 전략에 내재된 스트레스 테스트."
        },
        {
          t: "전담 지원",
          b: "지정된 계정 관리자 및 우선 관계 데스크."
        }
      ]
    },
    solutions: {
      eyebrow: "관리형 포트폴리오",
      title: "세 가지 전략. 하나의 서비스 표준.",
      explore: "포트폴리오 살펴보기",
      popular: "가장 인기 있는",
      target: "주간 목표 수익",
      risk: "위험 프로필",
      min: "최소",
      withdraw: "최소 이익 인출",
      open: "계좌 개설",
      tiers: [
        {
          name: "보수적",
          risk: "낮음"
        },
        {
          name: "균형",
          risk: "낮음"
        },
        {
          name: "성장",
          risk: "높음"
        }
      ]
    },
    perf: {
      aum: "운용자산",
      accounts: "활성 고객 계좌 수",
      tenure: "평균 근속 기간 (년)",
      sat: "고객 만족도"
    },
    riskf: {
      eyebrow: "위험 관리",
      title: "원칙이 곧 전략입니다.",
      subtitle: "저희 프레임워크는 '지속적인 수익은 큰 손실을 피하는 데서 온다'는 한 가지 믿음을 기반으로 합니다. 모든 포지션은 사전 정의된 위험 예산에 따라 규모를 조정하고, 모니터링하며, 스트레스 테스트를 거칩니다.",
      items: [
        {
          t: "자본 보존",
          b: "모든 전략은 허용 가능한 손실을 정의한 다음, 해당 한도 내에서 포지션을 구성하는 것에서 시작합니다."
        },
        {
          t: "포지션 규모 조정",
          b: "전략 확신도 및 현재 시장 상황에 기반한 변동성 조정 규모 포지셔닝."
        },
        {
          t: "포트폴리오 다각화",
          b: "통화, 금속, 지수 및 엄선된 단일 종목에 걸친 비상관적 노출."
        },
        {
          t: "지속적인 모니터링",
          b: "24/6 리스크 데스크, 자동 알림 및 전략 수준 최대 인출에 대한 하드 스톱."
        },
        {
          t: "스트레스 테스트",
          b: "복원력을 검증하기 위해 매주 과거 및 가상 시나리오 실행."
        },
        {
          t: "위험 통제",
          b: "레버리지, 집중 및 상관 노출에 대한 엄격한 제한을 플랫폼 수준에서 강제 적용합니다."
        }
      ],
      disclaimer: "모든 투자는 원금 손실을 포함한 위험을 수반합니다. 과거 성과는 미래 결과를 나타내거나 보장하지 않습니다."
    },
    security: {
      eyebrow: "보안",
      title: "검증 가능한 안전장치.",
      subtitle: "다층 보안 통제, 제3자 감사 및 제로 트러스트 운영 방식을 통해 고객 자본과 데이터를 보호합니다.",
      legal: "법률 및 규정 준수",
      items: [
        {
          t: "2단계 인증",
          b: "모든 고객 로그인 및 민감한 작업에 대한 TOTP 기반 2FA."
        },
        {
          t: "암호화된 클라이언트 데이터",
          b: "모든 요청에 대해 AES-256 저장 암호화 및 TLS 1.3 전송 암호화."
        },
        {
          t: "보안 클라우드 인프라",
          b: "최소 권한 접근을 갖춘 강화된 운영 환경."
        },
        {
          t: "KYC 검증",
          b: "활성화 전 모든 계좌에 대한 신원 확인."
        },
        {
          t: "AML 규정 준수",
          b: "국제 표준에 따른 거래 모니터링."
        },
        {
          t: "감사 로그",
          b: "모든 운영 및 계정 이벤트에 대한 불변의 감사 추적."
        }
      ]
    },
    portal: {
      eyebrow: "클라이언트 포털",
      title: "귀하의 포트폴리오, 투명하게.",
      access: "대시보드 접속",
      items: [
        {
          t: "포트폴리오 개요",
          b: "잔액, 배분 및 P&L을 한눈에 확인."
        },
        {
          t: "실시간 성과",
          b: "일별 및 누적 수익을 보여주는 대화형 차트."
        },
        {
          t: "명세서 및 보고서",
          b: "월간, 연간 및 온디맨드 PDF 보고서."
        },
        {
          t: "보안 메시징",
          b: "담당 계정 관리자와의 직통 연락."
        }
      ]
    },
    final: {
      eyebrow: "시작하기",
      titleA: "귀하의 자본을",
      titleB: "경험 많은 전문가에게 맡기세요.",
      cta: "투자 계좌 개설",
      note: "귀하의 목표, 기간 및 위험 허용 범위에 대해 전문가와 상담하십시오."
    }
  };

const cs: LandingContent = {
    hero: {
      badge: "Profesionální správa investic",
      titleA: "Profesionální",
      titleB: "správa",
      titleC: "investic",
      subtitle: "Zkušená správa portfolia s disciplinovanou kontrolou rizik, transparentním reportováním a klientsky orientovanými službami — napříč Forexem, zlatem, komoditami, indexy a akciemi.",
      ctaOpen: "Otevřít investiční účet",
      ctaAdvisor: "Kopírování obchodů",
      ctaLearn: "Soutěže",
      statAum: "AUM",
      statClients: "Klienti",
      statCountries: "Zemí",
      cardTitle: "Vyvážené růstové portfolio",
      ytd: "YTD",
      live: "Živě",
      disclaimer: "Ilustrativní vzorek. Minulá výkonnost nezaručuje budoucí výsledky."
    },
    trust: {
      regulated: "Regulováno a v souladu",
      funds: "Oddělené klientské fondy",
      audits: "Nezávislé audity",
      global: "Globální dosah, 24/6 podpora"
    },
    features: {
      eyebrow: "Proč HK Investment",
      titleA: "Stvořeno pro investory, kteří oceňují",
      titleB: "disciplínu.",
      subtitle: "Kombinujeme infrastrukturu na institucionální úrovni se zkušeným lidským týmem. Váš kapitál je spravován s přísností, reportován s jasností a zabezpečen standardy, které očekáváte od seriózního správce aktiv.",
      items: [
        {
          t: "Profesionální správa portfolia",
          b: "Zkušený investiční tým alokuje napříč trhy k dosažení vašich cílů."
        },
        {
          t: "Diverzifikované investiční strategie",
          b: "Multi-asset expozice napříč Forexem, zlatem, komoditami, indexy a akciemi."
        },
        {
          t: "Transparentní reportování",
          b: "Denní, měsíční a roční výpisy — každá pozice, každý poplatek."
        },
        {
          t: "Zabezpečený klientský portál",
          b: "Dvoufaktorová autentizace, šifrované úložiště, KYC/AML ověřeno."
        },
        {
          t: "Výkonnost v reálném čase",
          b: "Živý dashboard s křivkou kapitálu, alokací a metrikami rizika."
        },
        {
          t: "Zkušený tým",
          b: "Portfolio manažeři, kvantitativní analytici a risk manažeři s desetiletími zkušeností na globálních trzích."
        },
        {
          t: "Pokročilý rámec řízení rizik",
          b: "Nastavení velikosti pozic, limity čerpání a zátěžové testy zabudované do každé strategie."
        },
        {
          t: "Vyhrazená podpora",
          b: "Jmenovaný account manažer a prioritní klientský servis."
        }
      ]
    },
    solutions: {
      eyebrow: "Spravovaná portfolia",
      title: "Tři strategie. Jeden standard péče.",
      explore: "Prozkoumat portfolia",
      popular: "Nejoblíbenější",
      target: "Cílový týdenní výnos",
      risk: "Rizikový profil",
      min: "Minimum",
      withdraw: "Min. výběr zisku",
      open: "Otevřít účet",
      tiers: [
        {
          name: "Konzervativní",
          risk: "Nízké"
        },
        {
          name: "Vyvážené",
          risk: "Nízké"
        },
        {
          name: "Růstové",
          risk: "Vyšší"
        }
      ]
    },
    perf: {
      aum: "Aktiva pod správou",
      accounts: "Aktivní klientské účty",
      tenure: "Průměrná délka vztahu (roky)",
      sat: "Spokojenost klientů"
    },
    riskf: {
      eyebrow: "Řízení rizik",
      title: "Disciplína je strategie.",
      subtitle: "Náš rámec je postaven na jedné víře: trvalé výnosy pocházejí z vyhýbání se velkým ztrátám. Každá pozice je dimenzována, monitorována a testována proti předem definovaným rizikovým rozpočtům.",
      items: [
        {
          t: "Zachování kapitálu",
          b: "Každá strategie začíná definováním přijatelné ztráty a poté konstruuje pozice v rámci tohoto limitu."
        },
        {
          t: "Nastavení velikosti pozic",
          b: "Nastavení velikosti pozic upravené o volatilitu na základě přesvědčení o strategii a aktuálního tržního režimu."
        },
        {
          t: "Diverzifikace portfolia",
          b: "Nekorelovaná expozice napříč měnami, kovy, indexy a vybranými jednotlivými akciemi."
        },
        {
          t: "Průběžné monitorování",
          b: "24/6 risk desk, automatická upozornění a pevné stop-lossy na úrovni strategie."
        },
        {
          t: "Zátěžové testování",
          b: "Historické a hypotetické scénáře spouštěné týdně k ověření odolnosti."
        },
        {
          t: "Kontroly rizik",
          b: "Pevné limity na páku, koncentraci a korelovanou expozici, vynucené na úrovni platformy."
        }
      ],
      disclaimer: "Veškeré investování zahrnuje riziko, včetně ztráty kapitálu. Minulá výkonnost není indikací a nezaručuje budoucí výsledky."
    },
    security: {
      eyebrow: "Zabezpečení",
      title: "Ochranné prvky, které si můžete ověřit.",
      subtitle: "Chráníme klientský kapitál a data vrstvenými bezpečnostními kontrolami, audity třetích stran a provozním režimem bez důvěry (zero-trust).",
      legal: "Právo a soulad",
      items: [
        {
          t: "Dvoufaktorová autentizace",
          b: "2FA na bázi TOTP pro každé přihlášení klienta a citlivou akci."
        },
        {
          t: "Šifrovaná klientská data",
          b: "AES-256 v klidu a TLS 1.3 při přenosu pro každý požadavek."
        },
        {
          t: "Zabezpečená cloudová infrastruktura",
          b: "Tvrzené produkční prostředí s přístupem s nejmenšími oprávněními."
        },
        {
          t: "KYC ověření",
          b: "Ověření identity na každém účtu před aktivací."
        },
        {
          t: "AML soulad",
          b: "Monitorování transakcí v souladu s mezinárodními standardy."
        },
        {
          t: "Auditní záznamy",
          b: "Neměnná auditní stopa pro každou provozní a účetní událost."
        }
      ]
    },
    portal: {
      eyebrow: "Klientský portál",
      title: "Vaše portfolio, transparentně.",
      access: "Přístup k vašemu dashboardu",
      items: [
        {
          t: "Přehled portfolia",
          b: "Zůstatek, alokace a P&L na jeden pohled."
        },
        {
          t: "Živá výkonnost",
          b: "Interaktivní grafy s denními a kumulativními výnosy."
        },
        {
          t: "Výpisy a zprávy",
          b: "Měsíční, roční a na vyžádání PDF zprávy."
        },
        {
          t: "Zabezpečené zprávy",
          b: "Přímá linka k vašemu account manažerovi."
        }
      ]
    },
    final: {
      eyebrow: "Začněte",
      titleA: "Svěřte svůj kapitál do",
      titleB: "zkušených rukou.",
      cta: "Otevřít investiční účet",
      note: "Promluvte si se specialistou o vašich cílech, časovém horizontu a toleranci rizika."
    }
  };

const pl: LandingContent = {
    hero: {
      badge: "Profesjonalne Zarządzanie Inwestycjami",
      titleA: "Profesjonalne",
      titleB: "Zarządzanie",
      titleC: "Inwestycjami",
      subtitle: "Doświadczone zarządzanie portfelem z zdyscyplinowaną kontrolą ryzyka, przejrzystym raportowaniem i obsługą zorientowaną na klienta — na rynkach Forex, złota, surowców, indeksów i akcji.",
      ctaOpen: "Otwórz konto inwestycyjne",
      ctaAdvisor: "Kopiuj Transakcje",
      ctaLearn: "Konkursy",
      statAum: "AUM",
      statClients: "Klienci",
      statCountries: "Kraje",
      cardTitle: "Zrównoważony Portfel Wzrostowy",
      ytd: "YTD",
      live: "Na żywo",
      disclaimer: "Przykładowa ilustracja. Wyniki historyczne nie gwarantują przyszłych rezultatów."
    },
    trust: {
      regulated: "Regulowany i zgodny z przepisami",
      funds: "Segregowane środki klientów",
      audits: "Niezależne audyty",
      global: "Globalny zasięg, biuro 24/6"
    },
    features: {
      eyebrow: "Dlaczego HK Investment",
      titleA: "Stworzony dla inwestorów ceniących",
      titleB: "dyscyplinę.",
      subtitle: "Łączymy infrastrukturę na poziomie instytucjonalnym z doświadczonym zespołem ludzkim. Twój kapitał jest zarządzany z rygorem, raportowany z przejrzystością i zabezpieczony zgodnie ze standardami, jakich oczekiwałbyś od poważnego zarządzającego aktywami.",
      items: [
        {
          t: "Profesjonalne zarządzanie portfelem",
          b: "Doświadczony zespół inwestycyjny alokuje środki na różnych rynkach, aby realizować Twoje cele."
        },
        {
          t: "Zdywersyfikowane strategie inwestycyjne",
          b: "Ekspozycja na wiele aktywów na rynkach Forex, złota, surowców, indeksów i akcji."
        },
        {
          t: "Przejrzyste raportowanie",
          b: "Codzienne, miesięczne i roczne zestawienia — każda pozycja, każda opłata."
        },
        {
          t: "Bezpieczny portal klienta",
          b: "Uwierzytelnianie dwuskładnikowe, zaszyfrowane przechowywanie, weryfikacja KYC/AML."
        },
        {
          t: "Wyniki w czasie rzeczywistym",
          b: "Panel na żywo z krzywą kapitału, alokacją i metrykami ryzyka."
        },
        {
          t: "Doświadczony zespół",
          b: "Zarządzający portfelami, quanci i oficerowie ryzyka z dekadami doświadczenia na rynkach globalnych."
        },
        {
          t: "Zaawansowane ramy ryzyka",
          b: "Określanie wielkości pozycji, limity drawdown i testy warunków skrajnych wbudowane w każdą strategię."
        },
        {
          t: "Dedykowane wsparcie",
          b: "Przypisany Account Manager i priorytetowa obsługa klienta."
        }
      ]
    },
    solutions: {
      eyebrow: "Zarządzane portfele",
      title: "Trzy strategie. Jeden standard opieki.",
      explore: "Przeglądaj portfele",
      popular: "Najpopularniejsze",
      target: "Docelowy tygodniowy zwrot",
      risk: "Profil ryzyka",
      min: "Minimalny",
      withdraw: "Min. wypłata zysku",
      open: "Otwórz konto",
      tiers: [
        {
          name: "Konserwatywny",
          risk: "Niskie"
        },
        {
          name: "Zrównoważony",
          risk: "Niskie"
        },
        {
          name: "Wzrostowy",
          risk: "Wyższe"
        }
      ]
    },
    perf: {
      aum: "Aktywa pod zarządzaniem",
      accounts: "Aktywne konta klientów",
      tenure: "Średni staż (lata)",
      sat: "Satysfakcja klienta"
    },
    riskf: {
      eyebrow: "Zarządzanie Ryzykiem",
      title: "Dyscyplina to strategia.",
      subtitle: "Nasze ramy oparte są na jednym przekonaniu: trwałe zyski wynikają z unikania dużych strat. Każda pozycja jest określana, monitorowana i poddawana testom warunków skrajnych w oparciu o zdefiniowane wcześniej budżety ryzyka.",
      items: [
        {
          t: "Ochrona kapitału",
          b: "Każda strategia zaczyna się od określenia akceptowalnej straty, a następnie konstruuje pozycje w ramach tego limitu."
        },
        {
          t: "Określanie wielkości pozycji",
          b: "Określanie wielkości dostosowane do zmienności, oparte na przekonaniu o strategii i obecnym reżimie rynkowym."
        },
        {
          t: "Dyweresyfikacja portfela",
          b: "Nieskorelowana ekspozycja na waluty, metale, indeksy i wybrane pojedyncze akcje."
        },
        {
          t: "Ciągłe monitorowanie",
          b: "Biuro ryzyka 24/6, automatyczne alerty i twarde stop lossy na poziomie strategii drawdown."
        },
        {
          t: "Testy warunków skrajnych",
          b: "Scenariusze historyczne i hipotetyczne uruchamiane co tydzień w celu walidacji odporności."
        },
        {
          t: "Kontrole ryzyka",
          b: "Twarde limity dźwigni, koncentracji i skorelowanej ekspozycji, egzekwowane na poziomie platformy."
        }
      ],
      disclaimer: "Wszystkie inwestycje wiążą się z ryzykiem, w tym utratą kapitału. Wyniki historyczne nie wskazują i nie gwarantują przyszłych wyników."
    },
    security: {
      eyebrow: "Bezpieczeństwo",
      title: "Zabezpieczenia, które możesz zweryfikować.",
      subtitle: "Chronimy kapitał i dane klientów za pomocą warstwowych kontroli bezpieczeństwa, audytów stron trzecich i kultury operacyjnej zero zaufania.",
      legal: "Prawne i zgodność",
      items: [
        {
          t: "Uwierzytelnianie dwuskładnikowe",
          b: "2FA (TOTP-based) przy każdym logowaniu klienta i wrażliwych działaniach."
        },
        {
          t: "Szyfrowane dane klienta",
          b: "AES-256 w spoczynku i TLS 1.3 w transporcie dla każdego żądania."
        },
        {
          t: "Bezpieczna infrastruktura chmurowa",
          b: "Utrwardzone środowisko produkcyjne z dostępem o najniższych uprawnieniach."
        },
        {
          t: "Weryfikacja KYC",
          b: "Weryfikacja tożsamości każdego konta przed aktywacją."
        },
        {
          t: "Zgodność z AML",
          b: "Monitorowanie transakcji zgodne z międzynarodowymi standardami."
        },
        {
          t: "Dzienniki audytu",
          b: "Niezmienny ślad audytu dla każdego zdarzenia operacyjnego i konta."
        }
      ]
    },
    portal: {
      eyebrow: "Portal Klienta",
      title: "Twój portfel, przejrzysty.",
      access: "Uzyskaj dostęp do swojego panelu",
      items: [
        {
          t: "Przegląd portfela",
          b: "Saldo, alokacja i P&L w jednym miejscu."
        },
        {
          t: "Wyniki na żywo",
          b: "Interaktywne wykresy z dziennymi i kumulowanymi zwrotami."
        },
        {
          t: "Wyciągi i raporty",
          b: "Miesięczne, roczne i na żądanie raporty PDF."
        },
        {
          t: "Bezpieczne wiadomości",
          b: "Bezpośrednia linia do Twojego Account Managera."
        }
      ]
    },
    final: {
      eyebrow: "Rozpocznij",
      titleA: "Powierz swój kapitał w",
      titleB: "doświadczone ręce.",
      cta: "Otwórz konto inwestycyjne",
      note: "Porozmawiaj ze specjalistą o swoich celach, horyzoncie czasowym i tolerancji ryzyka."
    }
  };

const hu: LandingContent = {
    hero: {
      badge: "Professzionális Befektetési Kezelés",
      titleA: "Professzionális",
      titleB: "Befektetés",
      titleC: "Kezelés",
      subtitle: "Tapasztalt portfóliókezelés fegyelmezett kockázatkezeléssel, átlátható jelentésekkel és ügyfélközpontú szolgáltatással — Forex, Arany, Árutőzsdék, Indexek és Részvények terén.",
      ctaOpen: "Befektetési számla nyitása",
      ctaAdvisor: "Másoló kereskedés",
      ctaLearn: "Versenyek",
      statAum: "Kezelt vagyon",
      statClients: "Ügyfelek",
      statCountries: "Országok",
      cardTitle: "Kiegyensúlyozott Növekedési Portfólió",
      ytd: "Év elejétől",
      live: "Élő",
      disclaimer: "Illusztratív minta. A múltbeli teljesítmény nem garantálja a jövőbeli eredményeket."
    },
    trust: {
      regulated: "Szabályozott és jogszerű",
      funds: "Elkülönített ügyfélpénzek",
      audits: "Független könyvvizsgálatok",
      global: "Globális hatókör, 24/6 ügyfélszolgálat"
    },
    features: {
      eyebrow: "Miért HK Investment",
      titleA: "Fegyelemre",
      titleB: "értékelő befektetőknek készült.",
      subtitle: "Intézményi szintű infrastruktúrát tapasztalt emberi csapattal kombináljuk. Tőkéjét szigorúan kezeljük, átláthatóan jelentjük, és olyan sztenderdek szerint őrizzük, amilyet egy komoly vagyonkezelőtől elvárna.",
      items: [
        {
          t: "Professzionális portfóliókezelés",
          b: "Egy vezető befektetési csapat allokálja a tőkét a piacokon keresztül céljainak elérése érdekében."
        },
        {
          t: "Diverzifikált befektetési stratégiák",
          b: "Több eszközöreszköz kitettség Forex, Arany, Árutőzsdék, Indexek és Részvények terén."
        },
        {
          t: "Átlátható jelentések",
          b: "Napi, havi és éves kimutatások — minden pozíció, minden díj."
        },
        {
          t: "Biztonságos ügyfélportál",
          b: "Kétfaktoros hitelesítés, titkosított tárolás, KYC/AML ellenőrzés."
        },
        {
          t: "Valós idejű teljesítmény",
          b: "Élő műszerfal tőke görbével, allokációval és kockázati mutatókkal."
        },
        {
          t: "Tapasztalt csapat",
          b: "Portfóliómenedzserek, kvantitatív elemzők és kockázati tisztek évtizedes globális piaci tapasztalattal."
        },
        {
          t: "Fejlett kockázati keretrendszer",
          b: "Tőkeméret, veszteséghatár és stresszelemzések minden stratégiába beleépítve."
        },
        {
          t: "Dedikált támogatás",
          b: "Kijelölt számlavezető és kiemelt ügyfélszolgálat."
        }
      ]
    },
    solutions: {
      eyebrow: "Kezelt Portfóliók",
      title: "Három stratégia. Egyetlen gondossági sztenderd.",
      explore: "Portfóliók felfedezése",
      popular: "Legnépszerűbb",
      target: "Cél heti hozam",
      risk: "Kockázati profil",
      min: "Minimum",
      withdraw: "Min. profit kivétel",
      open: "Számla nyitása",
      tiers: [
        {
          name: "Konzervatív",
          risk: "Alacsony"
        },
        {
          name: "Kiegyensúlyozott",
          risk: "Alacsony"
        },
        {
          name: "Növekedési",
          risk: "Magasabb"
        }
      ]
    },
    perf: {
      aum: "Kezelt vagyon",
      accounts: "Aktív ügyfélszámlák",
      tenure: "Átlagos időtartam (év)",
      sat: "Ügyfél-elégedettség"
    },
    riskf: {
      eyebrow: "Kockázatkezelés",
      title: "A fegyelem a stratégia.",
      subtitle: "Keretrendszerünk egyetlen hiedelemre épül: a tartós hozamok nagy veszteségek elkerüléséből származnak. Minden pozíció méretezése, felügyelete és stressztesztelése előre meghatározott kockázati költségvetés alapján történik.",
      items: [
        {
          t: "Tőkemegőrzés",
          b: "Minden stratégia az elfogadható veszteség meghatározásával kezdődik, majd ezen határok között alakítja ki a pozíciókat."
        },
        {
          t: "Pozícióméret",
          b: "Volatilitáshoz igazított méretezés a stratégia meggyőződése és az aktuális piaci környezet alapján."
        },
        {
          t: "Portfóliódiverzifikáció",
          b: "Korrelálatlan kitettség devizák, fémek, indexek és kiválasztott egyedi értékpapírok között."
        },
        {
          t: "Folyamatos felügyelet",
          b: "24/6 kockázati ügyfélszolgálat, automatizált riasztások és hard stopok a stratégiai szintű veszteségekre."
        },
        {
          t: "Stressztesztelés",
          b: "Történelmi és hipotetikus forgatókönyvek heti szintű futtatása az ellenállóképesség ellenőrzésére."
        },
        {
          t: "Kockázati kontrollok",
          b: "Kemény korlátok a tőkeáttételre, koncentrációra és korrelált kitettségre, platformszinten érvényesítve."
        }
      ],
      disclaimer: "Minden befektetés kockázattal jár, beleértve a tőkevesztést is. A múltbeli teljesítmény nem jelzi, és nem is garantálja a jövőbeli eredményeket."
    },
    security: {
      eyebrow: "Biztonság",
      title: "Ellenőrizhető védőkorlátok.",
      subtitle: "Ügyfeleink tőkéjét és adatait réteges biztonsági ellenőrzésekkel, harmadik fél általi auditokkal és zéró bizalom elvű működéssel védjük.",
      legal: "Jogi és megfelelőségi adatok",
      items: [
        {
          t: "Kétfaktoros hitelesítés",
          b: "TOTP-alapú 2FA minden ügyfél bejelentkezésénél és érzékeny műveleténél."
        },
        {
          t: "Titkosított ügyféladatok",
          b: "AES-256 nyugalmi állapotban és TLS 1.3 átvitel közben minden kéréshez."
        },
        {
          t: "Biztonságos felhőinfrastruktúra",
          b: "Megerősített termelési környezet a legkevesebb jogosultsággal rendelkező hozzáféréssel."
        },
        {
          t: "KYC ellenőrzés",
          b: "Személyazonosság ellenőrzése minden számlán aktiválás előtt."
        },
        {
          t: "AML megfelelőség",
          b: "Tranzakciófelügyelet a nemzetközi szabványokhoz igazodva."
        },
        {
          t: "Audit naplók",
          b: "Változhatatlan audit nyomvonal minden operatív és számlaeseményhez."
        }
      ]
    },
    portal: {
      eyebrow: "Ügyfélportál",
      title: "Az Ön portfóliója, átláthatóan.",
      access: "Hozzáférés a műszerfalhoz",
      items: [
        {
          t: "Portfólió áttekintése",
          b: "Egy pillantással látható egyenleg, allokáció és P&L."
        },
        {
          t: "Élő teljesítmény",
          b: "Interaktív diagramok napi és kumulatív hozamokkal."
        },
        {
          t: "Kimutatások és jelentések",
          b: "Havi, éves és igény szerinti PDF jelentések."
        },
        {
          t: "Biztonságos üzenetküldés",
          b: "Közvetlen kapcsolat számlavezetőjével."
        }
      ]
    },
    final: {
      eyebrow: "Kezdje el",
      titleA: "Helyezze tőkéjét",
      titleB: "tapasztalt kezekbe.",
      cta: "Befektetési számla nyitása",
      note: "Beszéljen egy szakértővel céljairól, időhorizontjáról és kockázattűrő képességéről."
    }
  };

const zh_cn: LandingContent = {
    hero: {
      badge: "专业投资管理",
      titleA: "专业",
      titleB: "投资",
      titleC: "管理",
      subtitle: "经验丰富的投资组合管理，具备严谨的风险控制、透明的报告和以客户为中心的服务 — 涵盖 Forex、黄金、大宗商品、指数和股票。",
      ctaOpen: "开设投资账户",
      ctaAdvisor: "跟单交易",
      ctaLearn: "大赛",
      statAum: "资产管理规模",
      statClients: "客户数量",
      statCountries: "国家数量",
      cardTitle: "平衡增长投资组合",
      ytd: "YTD",
      live: "实时",
      disclaimer: "此为示例。过往表现不保证未来结果。"
    },
    trust: {
      regulated: "受监管且合规",
      funds: "客户资金独立存管",
      audits: "独立审计",
      global: "全球覆盖，每周24/6交易台"
    },
    features: {
      eyebrow: "为何选择 HK Investment",
      titleA: "专为重视",
      titleB: "纪律的投资者而设。",
      subtitle: "我们将机构级的投资基础设施与经验丰富的人员团队相结合。您的资本以严谨的方式管理，以清晰的方式报告，并以您对一家严格的资产管理公司所期望的标准进行保障。",
      items: [
        {
          t: "专业投资组合管理",
          b: "资深投资团队在全球市场进行配置以实现您的目标。"
        },
        {
          t: "多元化投资策略",
          b: "涵盖 Forex、黄金、大宗商品、指数和股票的多资产敞口。"
        },
        {
          t: "透明的报告",
          b: "每日、每月和年度报表 — 清晰列出每笔头寸、每项费用。"
        },
        {
          t: "安全的客户门户",
          b: "双因素认证、加密存储、KYC/AML 验证。"
        },
        {
          t: "实时业绩",
          b: "实时仪表盘，显示净值曲线、资产配置和风险指标。"
        },
        {
          t: "经验丰富的团队",
          b: "拥有数十年全球市场经验的投资组合经理、量化分析师和风险官。"
        },
        {
          t: "先进的风险框架",
          b: "头寸规模、回撤限制和压力测试融入各项策略。"
        },
        {
          t: "专属支持",
          b: "指定的客户经理和优先关系服务台。"
        }
      ]
    },
    solutions: {
      eyebrow: "管理投资组合",
      title: "三种策略。一体化服务标准。",
      explore: "探索投资组合",
      popular: "最受欢迎",
      target: "目标周回报",
      risk: "风险评级",
      min: "最低投资额",
      withdraw: "最低盈利提取",
      open: "开立账户",
      tiers: [
        {
          name: "保守型",
          risk: "低"
        },
        {
          name: "平衡型",
          risk: "低"
        },
        {
          name: "增长型",
          risk: "较高"
        }
      ]
    },
    perf: {
      aum: "资产管理规模",
      accounts: "活跃客户账户",
      tenure: "平均客户时长（年）",
      sat: "客户满意度"
    },
    riskf: {
      eyebrow: "风险管理",
      title: "纪律是我们的策略。",
      subtitle: "我们的框架基于一个信念：持久回报源于避免重大损失。每个头寸都根据预先设定的风险预算进行规模调整、监控和压力测试。",
      items: [
        {
          t: "资本保全",
          b: "每项策略都从定义可接受的损失开始，然后在该限制内构建头寸。"
        },
        {
          t: "头寸规模",
          b: "根据策略信心和当前市场状况进行波动性调整的头寸规模。"
        },
        {
          t: "投资组合多元化",
          b: "货币、贵金属、指数及特定个股之间的非相关性敞口。"
        },
        {
          t: "持续监控",
          b: "24/6风险交易台，在策略层面的回撤设置自动警报和硬止损。"
        },
        {
          t: "压力测试",
          b: "每周运行历史和假设情景，以验证韧性。"
        },
        {
          t: "风险控制",
          b: "在平台层面强制执行杠杆、集中度和相关性敞口的硬性限制。"
        }
      ],
      disclaimer: "所有投资均涉及风险，包括本金损失。过往表现不预示且不保证未来结果。"
    },
    security: {
      eyebrow: "安全性",
      title: "可验证的防护措施。",
      subtitle: "我们通过分层安全控制、第三方审计和零信任操作姿态来保护客户资金和数据。",
      legal: "法律与合规",
      items: [
        {
          t: "双因素认证",
          b: "TOTP-based 2FA 应用于每次客户登录和敏感操作。"
        },
        {
          t: "加密客户数据",
          b: "静态数据采用 AES-256 加密，传输数据采用 TLS 1.3 加密。"
        },
        {
          t: "安全云基础设施",
          b: "采用最小特权访问的强化生产环境。"
        },
        {
          t: "KYC 验证",
          b: "每个账户在激活前进行身份验证。"
        },
        {
          t: "AML 合规",
          b: "交易监控符合国际标准。"
        },
        {
          t: "审计日志",
          b: "每个运营和账户事件都有不可篡改的审计追踪。"
        }
      ]
    },
    portal: {
      eyebrow: "客户门户",
      title: "您的投资组合，透明可见。",
      access: "访问您的仪表盘",
      items: [
        {
          t: "投资组合概览",
          b: "余额、配置和 P&L 一目了然。"
        },
        {
          t: "实时业绩",
          b: "交互式图表，显示每日和累计回报。"
        },
        {
          t: "报表与报告",
          b: "每月、每年和按需生成 PDF 报告。"
        },
        {
          t: "安全消息",
          b: "直接联系您的客户经理。"
        }
      ]
    },
    final: {
      eyebrow: "立即开始",
      titleA: "将您的资本托付",
      titleB: "经验丰富的团队。",
      cta: "开设投资账户",
      note: "请与专家讨论您的目标、时间表和风险承受能力。"
    }
  };

const zh_tw: LandingContent = {
    hero: {
      badge: "專業投資管理",
      titleA: "專業",
      titleB: "投資",
      titleC: "管理",
      subtitle: "經驗豐富的投資組合管理，具備嚴謹的風險控制、透明的報告和以客戶為中心的服務 — 涵蓋Forex、黃金、大宗商品、指數和股票。",
      ctaOpen: "開立投資帳戶",
      ctaAdvisor: "複製交易",
      ctaLearn: "競賽",
      statAum: "資產管理規模",
      statClients: "客戶數",
      statCountries: "國家數",
      cardTitle: "均衡增長投資組合",
      ytd: "年初至今",
      live: "實時",
      disclaimer: "此為示意樣本。過往表現不保證未來結果。"
    },
    trust: {
      regulated: "受監管且合規",
      funds: "客戶資金隔離存放",
      audits: "獨立審計",
      global: "全球業務，每週六天客服支援"
    },
    features: {
      eyebrow: "為何選擇HK Investment",
      titleA: "專為重視",
      titleB: "紀律的投資者而設。",
      subtitle: "我們將機構級基礎設施與經驗豐富的專業團隊相結合。您的資金會得到嚴謹的管理、清晰的報告以及符合您對一家嚴肅資產管理公司期望的保障標準。",
      items: [
        {
          t: "專業投資組合管理",
          b: "資深投資團隊在各市場進行配置，以實現您的目標。"
        },
        {
          t: "多元化投資策略",
          b: "橫跨Forex、黃金、大宗商品、指數和股票的多資產曝險。"
        },
        {
          t: "透明報告",
          b: "每日、每月和年度報表 — 每筆倉位，每項費用。"
        },
        {
          t: "安全客戶門戶",
          b: "雙重認證、加密存儲、KYC/AML驗證。"
        },
        {
          t: "實時業績表現",
          b: "帶有權益曲線、配置和風險指標的實時儀表板。"
        },
        {
          t: "經驗豐富的團隊",
          b: "擁有數十年全球市場經驗的投資組合經理、量化師和風險官。"
        },
        {
          t: "先進風險框架",
          b: "倉位規模、回撤限制和壓力測試融入每項策略。"
        },
        {
          t: "專屬支援",
          b: "指定客戶經理和優先級關係服務台。"
        }
      ]
    },
    solutions: {
      eyebrow: "管理型投資組合",
      title: "三種策略。同一服務標準。",
      explore: "探索投資組合",
      popular: "最受歡迎",
      target: "目標週回報",
      risk: "風險概況",
      min: "最低",
      withdraw: "最低利潤提取",
      open: "開立帳戶",
      tiers: [
        {
          name: "保守型",
          risk: "低"
        },
        {
          name: "均衡型",
          risk: "低"
        },
        {
          name: "增長型",
          risk: "較高"
        }
      ]
    },
    perf: {
      aum: "資產管理規模",
      accounts: "活躍客戶帳戶",
      tenure: "平均任期 (年)",
      sat: "客戶滿意度"
    },
    riskf: {
      eyebrow: "風險管理",
      title: "紀律是策略的核心。",
      subtitle: "我們的框架基於一個信念：持久的回報源於避免巨大損失。每筆倉位都經過規模計算、監控，並根據預設的風險預算進行壓力測試。",
      items: [
        {
          t: "資本保值",
          b: "每項策略的起點是定義可接受的損失，然後在此限制內構建倉位。"
        },
        {
          t: "倉位規模控制",
          b: "根據策略信念和當前市場狀況，進行波動性調整後的倉位規模控制。"
        },
        {
          t: "投資組合多元化",
          b: "橫跨貨幣、貴金屬、指數和精選個股的非相關曝險。"
        },
        {
          t: "持續監控",
          b: "每週六天風險監控、自動警報和策略層次回撤的硬止損。"
        },
        {
          t: "壓力測試",
          b: "每週進行歷史和假設情景測試，以驗證韌性。"
        },
        {
          t: "風險控制",
          b: "平台層面強制執行槓桿、集中度和相關性曝險的硬性限制。"
        }
      ],
      disclaimer: "所有投資均涉及風險，包括本金損失。過往表現並不代表且不保證未來結果。"
    },
    security: {
      eyebrow: "安全性",
      title: "可查驗的保障措施。",
      subtitle: "我們以多層安全控制、第三方審計和零信任操作姿勢保護客戶資金和數據。",
      legal: "法律與合規",
      items: [
        {
          t: "雙重認證",
          b: "每次客戶登錄和敏感操作都採用基於TOTP的2FA。"
        },
        {
          t: "加密客戶數據",
          b: "靜態數據採用AES-256加密，傳輸數據採用TLS 1.3加密。"
        },
        {
          t: "安全雲基礎設施",
          b: "經強化處理的生產環境，具備最小權限訪問。"
        },
        {
          t: "KYC驗證",
          b: "每個帳戶在啟用前都經過身份驗證。"
        },
        {
          t: "AML合規",
          b: "交易監控符合國際標準。"
        },
        {
          t: "審計日誌",
          b: "每個操作和帳戶事件都留下不可篡改的審計軌跡。"
        }
      ]
    },
    portal: {
      eyebrow: "客戶門戶",
      title: "您的投資組合，透明呈現。",
      access: "訪問您的儀表板",
      items: [
        {
          t: "投資組合概覽",
          b: "餘額、配置和P&L一目了然。"
        },
        {
          t: "實時表現",
          b: "帶有每日和累計回報的互動圖表。"
        },
        {
          t: "報表與報告",
          b: "每月、年度和按需PDF報告。"
        },
        {
          t: "安全訊息",
          b: "與您的客戶經理直接溝通。"
        }
      ]
    },
    final: {
      eyebrow: "立即開始",
      titleA: "將您的資金託付給",
      titleB: "經驗豐富的團隊。",
      cta: "開立投資帳戶",
      note: "與專家討論您的目標、時間範圍和風險承受能力。"
    }
  };

const vi: LandingContent = {
    hero: {
      badge: "Quản lý Đầu tư Chuyên nghiệp",
      titleA: "Quản lý",
      titleB: "Đầu tư",
      titleC: "Chuyên nghiệp",
      subtitle: "Quản lý danh mục đầu tư giàu kinh nghiệm với kiểm soát rủi ro có kỷ luật, báo cáo minh bạch và dịch vụ lấy khách hàng làm trọng tâm — trên thị trường Forex, Vàng, Hàng hóa, Chỉ số và Cổ phiếu.",
      ctaOpen: "Mở Tài khoản Đầu tư",
      ctaAdvisor: "Giao dịch Sao chép",
      ctaLearn: "Các Cuộc thi",
      statAum: "AUM",
      statClients: "Khách hàng",
      statCountries: "Quốc gia",
      cardTitle: "Danh mục Tăng trưởng Cân bằng",
      ytd: "Từ đầu năm",
      live: "Trực tiếp",
      disclaimer: "Mẫu minh họa. Hiệu suất trong quá khứ không đảm bảo kết quả trong tương lai."
    },
    trust: {
      regulated: "Được quản lý & tuân thủ",
      funds: "Quỹ khách hàng tách biệt",
      audits: "Kiểm toán độc lập",
      global: "Phạm vi toàn cầu, bộ phận hỗ trợ 24/6"
    },
    features: {
      eyebrow: "Tại sao chọn HK Investment",
      titleA: "Được xây dựng cho các nhà đầu tư coi trọng",
      titleB: "kỷ luật.",
      subtitle: "Chúng tôi kết hợp cơ sở hạ tầng cấp tổ chức với đội ngũ nhân sự giàu kinh nghiệm. Vốn của quý vị được quản lý chặt chẽ, báo cáo rõ ràng và được bảo vệ theo các tiêu chuẩn mà quý vị kỳ vọng ở một nhà quản lý tài sản nghiêm túc.",
      items: [
        {
          t: "Quản lý danh mục đầu tư chuyên nghiệp",
          b: "Đội ngũ đầu tư cấp cao phân bổ trên các thị trường để theo đuổi mục tiêu của quý vị."
        },
        {
          t: "Chiến lược đầu tư đa dạng",
          b: "Tiếp cận đa tài sản trên thị trường Forex, Vàng, Hàng hóa, Chỉ số và Cổ phiếu."
        },
        {
          t: "Báo cáo minh bạch",
          b: "Bảng sao kê hàng ngày, hàng tháng và hàng năm — mọi vị thế, mọi khoản phí."
        },
        {
          t: "Cổng thông tin khách hàng an toàn",
          b: "Xác thực hai yếu tố, lưu trữ mã hóa, KYC/AML được xác minh."
        },
        {
          t: "Hiệu suất theo thời gian thực",
          b: "Bảng điều khiển trực tiếp với đường cong vốn, phân bổ và các chỉ số rủi ro."
        },
        {
          t: "Đội ngũ kinh nghiệm",
          b: "Các nhà quản lý danh mục đầu tư, các nhà phân tích định lượng và các chuyên gia quản lý rủi ro với hàng thập kỷ kinh nghiệm trên thị trường toàn cầu."
        },
        {
          t: "Khung rủi ro nâng cao",
          b: "Kích thước vị thế, giới hạn sụt giảm và kiểm tra căng thẳng được tích hợp vào mọi chiến lược."
        },
        {
          t: "Hỗ trợ tận tình",
          b: "Quản lý tài khoản riêng biệt và bộ phận quan hệ khách hàng ưu tiên."
        }
      ]
    },
    solutions: {
      eyebrow: "Danh mục Được Quản lý",
      title: "Ba chiến lược. Một tiêu chuẩn về sự tận tâm.",
      explore: "Khám phá danh mục đầu tư",
      popular: "Phổ biến nhất",
      target: "Mục tiêu lợi nhuận hàng tuần",
      risk: "Hồ sơ rủi ro",
      min: "Tối thiểu",
      withdraw: "Rút lợi nhuận tối thiểu",
      open: "Mở tài khoản",
      tiers: [
        {
          name: "Thận trọng",
          risk: "Thấp"
        },
        {
          name: "Cân bằng",
          risk: "Thấp"
        },
        {
          name: "Tăng trưởng",
          risk: "Cao hơn"
        }
      ]
    },
    perf: {
      aum: "Tài sản được quản lý",
      accounts: "Tài khoản khách hàng hoạt động",
      tenure: "Thời gian trung bình (năm)",
      sat: "Mức độ hài lòng của khách hàng"
    },
    riskf: {
      eyebrow: "Quản lý Rủi ro",
      title: "Kỷ luật là chiến lược.",
      subtitle: "Khung quản lý của chúng tôi được xây dựng dựa trên một niềm tin: lợi nhuận bền vững đến từ việc tránh các khoản lỗ lớn. Mọi vị thế đều được định cỡ, giám sát và kiểm tra căng thẳng theo các ngân sách rủi ro được xác định trước.",
      items: [
        {
          t: "Bảo toàn vốn",
          b: "Mọi chiến lược bắt đầu bằng việc xác định mức thua lỗ chấp nhận được, sau đó xây dựng các vị thế trong giới hạn đó."
        },
        {
          t: "Định cỡ vị thế",
          b: "Định cỡ điều chỉnh theo biến động dựa trên sự tin tưởng vào chiến lược và chế độ thị trường hiện tại."
        },
        {
          t: "Đa dạng hóa danh mục đầu tư",
          b: "Tiếp xúc không tương quan trên các loại tiền tệ, kim loại, chỉ số và các cổ phiếu riêng lẻ chọn lọc."
        },
        {
          t: "Giám sát liên tục",
          b: "Bộ phận rủi ro 24/6, cảnh báo tự động và điểm dừng cứng đối với mức sụt giảm cấp chiến lược."
        },
        {
          t: "Kiểm tra căng thẳng",
          b: "Các kịch bản lịch sử và giả thuyết được chạy hàng tuần để xác thực khả năng phục hồi."
        },
        {
          t: "Kiểm soát rủi ro",
          b: "Giới hạn cứng đối với đòn bẩy, tập trung và tiếp xúc tương quan, được thực thi ở cấp độ nền tảng."
        }
      ],
      disclaimer: "Mọi hoạt động đầu tư đều có rủi ro, bao gồm cả việc mất vốn gốc. Hiệu suất trong quá khứ không phải là chỉ báo và không đảm bảo kết quả trong tương lai."
    },
    security: {
      eyebrow: "Bảo mật",
      title: "Các biện pháp bảo vệ quý vị có thể xác minh.",
      subtitle: "Chúng tôi bảo vệ vốn và dữ liệu khách hàng bằng các lớp kiểm soát bảo mật, kiểm toán bởi bên thứ ba và tư thế hoạt động không tin cậy.",
      legal: "Pháp lý & tuân thủ",
      items: [
        {
          t: "Xác thực hai yếu tố",
          b: "2FA dựa trên TOTP cho mọi lần đăng nhập và hành động nhạy cảm của khách hàng."
        },
        {
          t: "Dữ liệu khách hàng được mã hóa",
          b: "AES-256 khi lưu trữ và TLS 1.3 khi truyền tải cho mọi yêu cầu."
        },
        {
          t: "Cơ sở hạ tầng đám mây an toàn",
          b: "Môi trường sản xuất được củng cố với quyền truy cập ít nhất."
        },
        {
          t: "Xác minh KYC",
          b: "Xác minh danh tính trên mọi tài khoản trước khi kích hoạt."
        },
        {
          t: "Tuân thủ AML",
          b: "Giám sát giao dịch phù hợp với các tiêu chuẩn quốc tế."
        },
        {
          t: "Nhật ký kiểm toán",
          b: "Dấu vết kiểm toán không thể thay đổi cho mọi sự kiện hoạt động và tài khoản."
        }
      ]
    },
    portal: {
      eyebrow: "Cổng thông tin khách hàng",
      title: "Danh mục của quý vị, minh bạch.",
      access: "Truy cập bảng điều khiển của quý vị",
      items: [
        {
          t: "Tổng quan danh mục đầu tư",
          b: "Số dư, phân bổ và P&L trong một cái nhìn."
        },
        {
          t: "Hiệu suất trực tiếp",
          b: "Biểu đồ tương tác với lợi nhuận hàng ngày và tích lũy."
        },
        {
          t: "Báo cáo & tài liệu",
          b: "Báo cáo PDF hàng tháng, hàng năm và theo yêu cầu."
        },
        {
          t: "Tin nhắn bảo mật",
          b: "Đường dây liên lạc trực tiếp với quản lý tài khoản của quý vị."
        }
      ]
    },
    final: {
      eyebrow: "Bắt đầu",
      titleA: "Hãy đặt vốn của quý vị vào",
      titleB: "đôi tay giàu kinh nghiệm.",
      cta: "Mở Tài khoản Đầu tư",
      note: "Trao đổi với chuyên gia về mục tiêu, thời gian và khả năng chấp nhận rủi ro của quý vị."
    }
  };

const th: LandingContent = {
    hero: {
      badge: "การจัดการการลงทุนแบบมืออาชีพ",
      titleA: "มืออาชีพ",
      titleB: "การลงทุน",
      titleC: "การบริหารจัดการ",
      subtitle: "การบริหารจัดการพอร์ตการลงทุนที่มีประสบการณ์ พร้อมการควบคุมความเสี่ยงอย่างมีวินัย การรายงานที่โปร่งใส และบริการที่มุ่งเน้นลูกค้า — ครอบคลุม Forex, ทองคำ, สินค้าโภคภัณฑ์, ดัชนี และหุ้น",
      ctaOpen: "เปิดบัญชีการลงทุน",
      ctaAdvisor: "คัดลอกการซื้อขาย",
      ctaLearn: "การแข่งขัน",
      statAum: "AUM",
      statClients: "ลูกค้า",
      statCountries: "ประเทศ",
      cardTitle: "พอร์ตการลงทุนเพื่อการเติบโตอย่างสมดุล",
      ytd: "YTD",
      live: "สด",
      disclaimer: "ตัวอย่างประกอบ ผลงานในอดีตไม่ได้รับประกันผลลัพธ์ในอนาคต"
    },
    trust: {
      regulated: "อยู่ภายใต้การกำกับดูแลและปฏิบัติตามกฎระเบียบ",
      funds: "เงินทุนลูกค้าแยกต่างหาก",
      audits: "การตรวจสอบอิสระ",
      global: "ขอบเขตทั่วโลก, โต๊ะบริการ 24/6"
    },
    features: {
      eyebrow: "ทำไมต้อง HK Investment",
      titleA: "สร้างขึ้นสำหรับนักลงทุนที่ให้ความสำคัญกับ",
      titleB: "วินัย",
      subtitle: "เราผสานรวมโครงสร้างพื้นฐานระดับสถาบันเข้ากับทีมงานที่มีประสบการณ์ เงินทุนของคุณได้รับการบริหารจัดการอย่างเข้มงวด รายงานด้วยความชัดเจน และปกป้องด้วยมาตรฐานที่คุณคาดหวังจากผู้จัดการสินทรัพย์ที่น่าเชื่อถือ",
      items: [
        {
          t: "การบริหารจัดการพอร์ตการลงทุนอย่างมืออาชีพ",
          b: "ทีมการลงทุนอาวุโสจัดสรรเงินทุนในตลาดต่างๆ เพื่อให้บรรลุวัตถุประสงค์ของคุณ"
        },
        {
          t: "กลยุทธ์การลงทุนที่หลากหลาย",
          b: "การเปิดรับความเสี่ยงสินทรัพย์หลากหลายประเภทครอบคลุม Forex, ทองคำ, สินค้าโภคภัณฑ์, ดัชนี และหุ้น"
        },
        {
          t: "การรายงานที่โปร่งใส",
          b: "รายงานรายวัน รายเดือน และรายปี — ทุกตำแหน่ง ทุกค่าธรรมเนียม"
        },
        {
          t: "พอร์ทัลลูกค้าที่ปลอดภัย",
          b: "การยืนยันตัวตนสองชั้น, การจัดเก็บข้อมูลที่เข้ารหัส, การตรวจสอบ KYC/AML"
        },
        {
          t: "ผลการดำเนินงานแบบเรียลไทม์",
          b: "แดชบอร์ดสดพร้อมเส้นกราฟ Equity, การจัดสรร และเมตริกความเสี่ยง"
        },
        {
          t: "ทีมงานที่มีประสบการณ์",
          b: "ผู้จัดการพอร์ตการลงทุน, นักวิเคราะห์เชิงปริมาณ และเจ้าหน้าที่ความเสี่ยงที่มีประสบการณ์ยาวนานในตลาดโลก"
        },
        {
          t: "กรอบการบริหารความเสี่ยงขั้นสูง",
          b: "การปรับขนาดตำแหน่ง, ข้อจำกัด Drawdown และการทดสอบความเครียดที่ฝังอยู่ในทุกกลยุทธ์"
        },
        {
          t: "การสนับสนุนเฉพาะ",
          b: "ผู้จัดการบัญชีและทีมงานดูแลลูกค้าสัมพันธ์ระดับพรีเมียม"
        }
      ]
    },
    solutions: {
      eyebrow: "พอร์ตการลงทุนที่มีการจัดการ",
      title: "สามกลยุทธ์ มาตรฐานการดูแลระดับเดียวกัน",
      explore: "สำรวจพอร์ตการลงทุน",
      popular: "เป็นที่นิยมที่สุด",
      target: "ผลตอบแทนเป้าหมายรายสัปดาห์",
      risk: "โปรไฟล์ความเสี่ยง",
      min: "ขั้นต่ำ",
      withdraw: "ถอนกำไรขั้นต่ำ",
      open: "เปิดบัญชี",
      tiers: [
        {
          name: "อนุรักษ์นิยม",
          risk: "ต่ำ"
        },
        {
          name: "สมดุล",
          risk: "ต่ำ"
        },
        {
          name: "เติบโต",
          risk: "สูงกว่า"
        }
      ]
    },
    perf: {
      aum: "สินทรัพย์ภายใต้การจัดการ",
      accounts: "บัญชีลูกค้าที่ใช้งานอยู่",
      tenure: "ระยะเวลาเฉลี่ย (ปี)",
      sat: "ความพึงพอใจของลูกค้า"
    },
    riskf: {
      eyebrow: "การบริหารความเสี่ยง",
      title: "วินัยคือกลยุทธ์",
      subtitle: "กรอบการทำงานของเราสร้างขึ้นบนความเชื่อที่ว่า: ผลตอบแทนที่ยั่งยืนมาจากการหลีกเลี่ยงการขาดทุนจำนวนมาก ทุกสถานะจะถูกกำหนดขนาด ตรวจสอบ และทดสอบความเครียดตามงบประมาณความเสี่ยงที่กำหนดไว้ล่วงหน้า",
      items: [
        {
          t: "การรักษาระดับเงินทุน",
          b: "ทุกกลยุทธ์เริ่มต้นด้วยการกำหนดการขาดทุนที่ยอมรับได้ จากนั้นสร้างสถานะการลงทุนภายในขีดจำกัดนั้น"
        },
        {
          t: "การปรับขนาดตำแหน่ง",
          b: "การปรับขนาดตามความผันผวนขึ้นอยู่กับความเชื่อมั่นของกลยุทธ์และสภาวะตลาดปัจจุบัน"
        },
        {
          t: "การกระจายความเสี่ยงของพอร์ตการลงทุน",
          b: "การเปิดรับความเสี่ยงที่ไม่สัมพันธ์กันในสกุลเงิน โลหะ ดัชนี และหุ้นรายตัวที่เลือก"
        },
        {
          t: "การตรวจสอบอย่างต่อเนื่อง",
          b: "ทีมบริหารความเสี่ยง 24/6, การแจ้งเตือนอัตโนมัติ และจุดหยุดขาดทุนที่รุนแรงในระดับกลยุทธ์"
        },
        {
          t: "การทดสอบความเครียด",
          b: "สถานการณ์ในอดีตและสถานการณ์จำลองถูกรันทุกสัปดาห์เพื่อตรวจสอบความยืดหยุ่น"
        },
        {
          t: "การควบคุมความเสี่ยง",
          b: "ขีดจำกัดที่เข้มงวดในการใช้เลเวอเรจ, การกระจุกตัว และการเปิดรับความเสี่ยงที่สัมพันธ์กัน ซึ่งบังคับใช้ในระดับแพลตฟอร์ม"
        }
      ],
      disclaimer: "การลงทุนทั้งหมดมีความเสี่ยง รวมถึงการสูญเสียเงินต้น ผลการดำเนินงานในอดีตไม่ได้บ่งชี้และไม่ได้รับประกันผลลัพธ์ในอนาคต"
    },
    security: {
      eyebrow: "ความปลอดภัย",
      title: "มาตรการป้องกันที่คุณสามารถตรวจสอบได้",
      subtitle: "เราปกป้องเงินทุนและข้อมูลลูกค้าด้วยการควบคุมความปลอดภัยหลายชั้น การตรวจสอบโดยบุคคลที่สาม และแนวทางการปฏิบัติงานแบบ Zero-Trust",
      legal: "กฎหมายและการปฏิบัติตามข้อกำหนด",
      items: [
        {
          t: "การยืนยันตัวตนสองชั้น",
          b: "การยืนยันตัวตนแบบ 2FA ด้วย TOTP สำหรับทุกการเข้าสู่ระบบของลูกค้าและการดำเนินการที่ละเอียดอ่อน"
        },
        {
          t: "ข้อมูลลูกค้าที่เข้ารหัส",
          b: "AES-256 ขณะจัดเก็บและ TLS 1.3 ระหว่างส่งข้อมูลสำหรับทุกคำขอ"
        },
        {
          t: "โครงสร้างพื้นฐานคลาวด์ที่ปลอดภัย",
          b: "สภาพแวดล้อมการผลิตที่แข็งแกร่งพร้อมการเข้าถึงด้วยสิทธิ์ขั้นต่ำ"
        },
        {
          t: "การยืนยัน KYC",
          b: "การยืนยันตัวตนสำหรับทุกบัญชีก่อนการเปิดใช้งาน"
        },
        {
          t: "การปฏิบัติตาม AML",
          b: "การตรวจสอบธุรกรรมที่สอดคล้องกับมาตรฐานสากล"
        },
        {
          t: "บันทึกการตรวจสอบ",
          b: "บันทึกการตรวจสอบที่ไม่สามารถเปลี่ยนแปลงได้สำหรับทุกเหตุการณ์การดำเนินงานและบัญชี"
        }
      ]
    },
    portal: {
      eyebrow: "พอร์ทัลลูกค้า",
      title: "พอร์ตการลงทุนของคุณ โปร่งใส",
      access: "เข้าถึงแดชบอร์ดของคุณ",
      items: [
        {
          t: "ภาพรวมพอร์ตการลงทุน",
          b: "ยอดคงเหลือ, การจัดสรร และ P&L ได้ในแวบเดียว"
        },
        {
          t: "ผลการดำเนินงานสด",
          b: "แผนภูมิเชิงโต้ตอบพร้อมผลตอบแทนรายวันและสะสม"
        },
        {
          t: "ใบแจ้งยอดและรายงาน",
          b: "รายงาน PDF รายเดือน รายปี และตามคำขอ"
        },
        {
          t: "การส่งข้อความที่ปลอดภัย",
          b: "ช่องทางตรงถึงผู้จัดการบัญชีของคุณ"
        }
      ]
    },
    final: {
      eyebrow: "เริ่มต้น",
      titleA: "นำเงินทุนของคุณไปไว้ใน",
      titleB: "มือผู้มีประสบการณ์",
      cta: "เปิดบัญชีการลงทุน",
      note: "พูดคุยกับผู้เชี่ยวชาญเกี่ยวกับวัตถุประสงค์ ระยะเวลา และระดับความเสี่ยงที่คุณยอมรับได้"
    }
  };

const hi: LandingContent = {
    hero: {
      badge: "पेशेवर निवेश प्रबंधन",
      titleA: "पेशेवर",
      titleB: "निवेश",
      titleC: "प्रबंधन",
      subtitle: "अनुभवी पोर्टफोलियो प्रबंधन, अनुशासित जोखिम नियंत्रण, पारदर्शी रिपोर्टिंग और ग्राहक-केंद्रित सेवा — फॉरेक्स, सोना, कमोडिटीज, इंडेक्स और स्टॉक्स में।",
      ctaOpen: "निवेश खाता खोलें",
      ctaAdvisor: "ट्रेडिंग कॉपी करें",
      ctaLearn: "प्रतियोगिताएं",
      statAum: "एयूएम",
      statClients: "ग्राहक",
      statCountries: "देश",
      cardTitle: "संतुलित विकास पोर्टफोलियो",
      ytd: "वाईटीडी",
      live: "लाइव",
      disclaimer: "उदाहरण स्वरूप। पिछला प्रदर्शन भविष्य के परिणामों की गारंटी नहीं देता है।"
    },
    trust: {
      regulated: "नियामित और अनुपालित",
      funds: "पृथक ग्राहक निधि",
      audits: "स्वतंत्र ऑडिट",
      global: "वैश्विक पहुंच, 24/6 डेस्क"
    },
    features: {
      eyebrow: "एचके इन्वेस्टमेंट क्यों",
      titleA: "उन निवेशकों के लिए बनाया गया है जो महत्व देते हैं",
      titleB: "अनुशासन को।",
      subtitle: "हम एक अनुभवी मानव टीम के साथ संस्थागत-ग्रेड बुनियादी ढांचे को जोड़ते हैं। आपकी पूंजी का प्रबंधन कठोरता से किया जाता है, स्पष्टता के साथ रिपोर्ट किया जाता है, और उन मानकों के साथ सुरक्षित रखा जाता है जिनकी आप एक गंभीर परिसंपत्ति प्रबंधक से अपेक्षा करेंगे।",
      items: [
        {
          t: "पेशेवर पोर्टफोलियो प्रबंधन",
          b: "एक वरिष्ठ निवेश टीम आपके उद्देश्यों को प्राप्त करने के लिए बाजारों में आवंटन करती है।"
        },
        {
          t: "विविध निवेश रणनीतियाँ",
          b: "फॉरेक्स, सोना, कमोडिटीज, इंडेक्स और स्टॉक्स में मल्टी-एसेट एक्सपोजर।"
        },
        {
          t: "पारदर्शी रिपोर्टिंग",
          b: "दैनिक, मासिक और वार्षिक विवरण — हर स्थिति, हर शुल्क।"
        },
        {
          t: "सुरक्षित ग्राहक पोर्टल",
          b: "दो-कारक प्रमाणीकरण, एन्क्रिप्टेड स्टोरेज, केवाईसी/एएमएल सत्यापित।"
        },
        {
          t: "वास्तविक समय प्रदर्शन",
          b: "इक्विटी कर्व, आवंटन और जोखिम मेट्रिक्स के साथ लाइव डैशबोर्ड।"
        },
        {
          t: "अनुभवी टीम",
          b: "वैश्विक बाजारों में दशकों के अनुभव वाले पोर्टफोलियो प्रबंधक, क्वांट और जोखिम अधिकारी।"
        },
        {
          t: "उन्नत जोखिम ढांचा",
          b: "प्रत्येक रणनीति में स्थिति आकार, ड्राडाउन सीमा और तनाव परीक्षण शामिल हैं।"
        },
        {
          t: "समर्पित सहायता",
          b: "नामित खाता प्रबंधक और प्राथमिकता संबंध डेस्क।"
        }
      ]
    },
    solutions: {
      eyebrow: "प्रबंधित पोर्टफोलियो",
      title: "तीन रणनीतियाँ। देखभाल का एक मानक।",
      explore: "पोर्टफोलियो का अन्वेषण करें",
      popular: "सबसे लोकप्रिय",
      target: "साप्ताहिक रिटर्न लक्षित करें",
      risk: "जोखिम प्रोफाइल",
      min: "न्यूनतम",
      withdraw: "न्यूनतम लाभ निकासी",
      open: "खाता खोलें",
      tiers: [
        {
          name: "रूढ़िवादी",
          risk: "कम"
        },
        {
          name: "संतुलित",
          risk: "कम"
        },
        {
          name: "विकास",
          risk: "उच्च"
        }
      ]
    },
    perf: {
      aum: "प्रबंधन के तहत संपत्ति",
      accounts: "सक्रिय ग्राहक खाते",
      tenure: "औसत कार्यकाल (वर्ष)",
      sat: "ग्राहक संतुष्टि"
    },
    riskf: {
      eyebrow: "जोखिम प्रबंधन",
      title: "अनुशासन ही रणनीति है।",
      subtitle: "हमारा ढांचा एक विश्वास के इर्द-गिर्द बनाया गया है: टिकाऊ रिटर्न बड़े नुकसान से बचने से आते हैं। प्रत्येक स्थिति को आकार दिया जाता है, निगरानी की जाती है और पूर्व-परिभाषित जोखिम बजट के विरुद्ध तनाव-परीक्षण किया जाता है।",
      items: [
        {
          t: "पूंजी संरक्षण",
          b: "प्रत्येक रणनीति स्वीकार्य हानि को परिभाषित करके शुरू होती है, फिर उस सीमा के भीतर स्थिति का निर्माण करती है।"
        },
        {
          t: "स्थिति आकार",
          b: "रणनीति दृढ़ विश्वास और वर्तमान बाजार व्यवस्था के आधार पर अस्थिरता-समायोजित आकार।"
        },
        {
          t: "पोर्टफोलियो विविधीकरण",
          b: "मुद्राओं, धातुओं, सूचकांकों और चयनित एकल नामों में असंबंधित एक्सपोजर।"
        },
        {
          t: "निरंतर निगरानी",
          b: "24/6 जोखिम डेस्क, स्वचालित अलर्ट और रणनीति-स्तर पर ड्राडाउन पर हार्ड स्टॉप।"
        },
        {
          t: "तनाव परीक्षण",
          b: "स्थिरता को मान्य करने के लिए साप्ताहिक रूप से ऐतिहासिक और काल्पनिक परिदृश्यों को चलाया जाता है।"
        },
        {
          t: "जोखिम नियंत्रण",
          b: "लीवरेज, एकाग्रता और सहसंबंधित एक्सपोजर पर कड़ी सीमाएं, प्लेटफॉर्म स्तर पर लागू की जाती हैं।"
        }
      ],
      disclaimer: "सभी निवेशों में जोखिम शामिल है, जिसमें मूलधन की हानि भी शामिल है। पिछला प्रदर्शन भविष्य के परिणामों का संकेत नहीं है और न ही इसकी गारंटी देता है।"
    },
    security: {
      eyebrow: "सुरक्षा",
      title: "सुरक्षा उपाय जिन्हें आप सत्यापित कर सकते हैं।",
      subtitle: "हम स्तरित सुरक्षा नियंत्रण, तीसरे पक्ष के ऑडिट और शून्य-विश्वास ऑपरेटिंग मुद्रा के साथ ग्राहक पूंजी और डेटा की रक्षा करते हैं।",
      legal: "कानूनी और अनुपालन",
      items: [
        {
          t: "दो-कारक प्रमाणीकरण",
          b: "हर ग्राहक लॉगिन और संवेदनशील कार्य पर TOTP-आधारित 2FA।"
        },
        {
          t: "एन्क्रिप्टेड ग्राहक डेटा",
          b: "AES-256 आराम पर और TLS 1.3 हर अनुरोध के लिए ट्रांजिट में।"
        },
        {
          t: "सुरक्षित क्लाउड इन्फ्रास्ट्रक्चर",
          b: "कम से कम विशेषाधिकार पहुंच के साथ कठोर उत्पादन वातावरण।"
        },
        {
          t: "केवाईसी सत्यापन",
          b: "सक्रियण से पहले हर खाते पर पहचान सत्यापन।"
        },
        {
          t: "एएमएल अनुपालन",
          b: "अंतर्राष्ट्रीय मानकों के अनुरूप लेनदेन निगरानी।"
        },
        {
          t: "ऑडिट लॉग",
          b: "हर परिचालन और खाता घटना के लिए अपरिवर्तनीय ऑडिट ट्रेल।"
        }
      ]
    },
    portal: {
      eyebrow: "ग्राहक पोर्टल",
      title: "आपका पोर्टफोलियो, पारदर्शी।",
      access: "अपने डैशबोर्ड तक पहुंचें",
      items: [
        {
          t: "पोर्टफोलियो अवलोकन",
          b: "एक नज़र में बैलेंस, आवंटन और P&L।"
        },
        {
          t: "लाइव प्रदर्शन",
          b: "दैनिक और संचयी रिटर्न के साथ इंटरैक्टिव चार्ट।"
        },
        {
          t: "स्टेटमेंट और रिपोर्ट",
          b: "मासिक, वार्षिक और ऑन-डिमांड पीडीएफ रिपोर्ट।"
        },
        {
          t: "सुरक्षित मैसेजिंग",
          b: "आपके खाता प्रबंधक के लिए सीधी लाइन।"
        }
      ]
    },
    final: {
      eyebrow: "शुरू करें",
      titleA: "अपनी पूंजी को अनुभवी हाथों में",
      titleB: "रखें।",
      cta: "निवेश खाता खोलें",
      note: "अपने उद्देश्यों, समय-सीमा और जोखिम सहनशीलता के बारे में किसी विशेषज्ञ से बात करें।"
    }
  };

const ku: LandingContent = {
    hero: {
      badge: "Rêveberiya Veberhênana Profesyonel",
      titleA: "Profesyonel",
      titleB: "Veberhênanê",
      titleC: "Rêveberî",
      subtitle: "Rêveberiya portfoliyoyê ya bi ezmûn bi kontrolên rîskê yên bi dîsîplîn, raporkirina zelal û karûbarê ku li ser xerîdar disekine — li seranserê Forex, Zêr, Kelûpel, Indeks û Stocks.",
      ctaOpen: "Hesabê Veberhênanê Vegere",
      ctaAdvisor: "Bazirganiya Kopî",
      ctaLearn: "Pêşbazî",
      statAum: "AUM",
      statClients: "Xerîdar",
      statCountries: "Welat",
      cardTitle: "Portfoliyoya Pêşkeftina Hevseng",
      ytd: "YTD",
      live: "Zindî",
      disclaimer: "Mînaka nîşanker. Performansa berê encamên pêşerojê garantî nake."
    },
    trust: {
      regulated: "Regulated & compliant",
      funds: "Pereyên xerîdar ên veqetandî",
      audits: "Kontrolên serbixwe",
      global: "Gihîna cîhanî, maseya 24/6"
    },
    features: {
      eyebrow: "Çima HK Investment",
      titleA: "Ji bo veberhênerên ku nirx dikin hatî çêkirin",
      titleB: "dîsîplîn.",
      subtitle: "Em binesaziya pola-sazî bi tîmek mirovî ya bi ezmûn re dikin yek. Sermaya we bi tundî tê rêvebirin, bi zelalî tê ragihandin, û bi standardên ku hûn ji rêveberê sermayeyê yê cidî hêvî dikin tê parastin.",
      items: [
        {
          t: "Rêveberiya portfoliyoyê ya profesyonel",
          b: "Tîmek veberhênanê ya payebilind li seranserê bazaran dabeş dike da ku bigihîje armancên we."
        },
        {
          t: "Stratejiyên veberhênanê yên cihêreng",
          b: "Pêşangeha pir-asset li seranserê Forex, Zêr, Kelûpel, Indeks û Stocks."
        },
        {
          t: "Raporkirina zelal",
          b: "Daxuyaniyên rojane, mehane û salane — her pozîsyon, her berdêle."
        },
        {
          t: "Portala xerîdar a ewle",
          b: "Nasnameya du-faktorî, depokirina şîfrekirî, KYC/AML hatî verast kirin."
        },
        {
          t: "Performansa serdema rast",
          b: "Panola zindî ya bi xeta dadmendiyê, dabeşkirin û metrîkên rîskê."
        },
        {
          t: "Tîma bi ezmûn",
          b: "Rêvebirên portfoliyoyê, quants û efserên rîskê yên bi dehsalan di bazarên gerdûnî de."
        },
        {
          t: "Çarçoveya rîskê ya pêşkeftî",
          b: "Mezinahiya pozîsyonê, sînorên vekişînê û ceribandinên stresê yên ku di her stratejiyê de hatine çêkirin."
        },
        {
          t: "Piştgiriya taybetî",
          b: "Rêvebirê hesabê yê navdar û maseya têkiliyên pêşîn."
        }
      ]
    },
    solutions: {
      eyebrow: "Portfoliyoyên Rêvebir",
      title: "Sê stratejî. Yek standarda lênêrînê.",
      explore: "Portfoliyoyan bigerin",
      popular: "Herî populer",
      target: "Armanca vegera heftane",
      risk: "Profîla rîskê",
      min: "Kêmtirîn",
      withdraw: "Vekişîna qezencê ya kêmîn",
      open: "Hesab veke",
      tiers: [
        {
          name: "Muhafezekar",
          risk: "Kêm"
        },
        {
          name: "Hevseng",
          risk: "Kêm"
        },
        {
          name: "Pêşveçûn",
          risk: "Bilindtir"
        }
      ]
    },
    perf: {
      aum: "Sermayeyên di bin rêveberiyê de",
      accounts: "Hesabên xerîdar ên çalak",
      tenure: "Dema navîn (sal)",
      sat: "Dilxweşiya xerîdar"
    },
    riskf: {
      eyebrow: "Rêveberiya Rîskê",
      title: "Dîsîplîn stratejî ye.",
      subtitle: "Çarçoveya me li ser bawerîyekê hatî çêkirin: vegera domdar ji dûrketina ji windahiyên mezin tê. Her pozîsyon li hember budceyên rîskê yên pêşwext hatine pênasekirin tê pîvandin, çavdêrîkirin û ceribandin.",
      items: [
        {
          t: "Parastina sermayeyê",
          b: "Her stratejî bi pênasekirina windahiyek pejirandî dest pê dike, dûv re pozîsyonan di hundurê wê sînor de çêdike."
        },
        {
          t: "Mezinahiya pozîsyonê",
          b: "Mezinahiya bi guhêzbar-rastkirî li ser bingeha baweriya stratejiyê û rejima bazarê ya heyî."
        },
        {
          t: "Diverskirina portfoliyoyê",
          b: "Pêşangeha ne-korelasyonê li ser diravan, metalan, indeksan û navên yekane yên hilbijartî."
        },
        {
          t: "Çavdêriya domdar",
          b: "Maseya rîskê ya 24/6, hişyariyên otomatîkî û rawestandinên dijwar ên li ser vekişînên asta stratejiyê."
        },
        {
          t: "Testkirina stresê",
          b: "Senaryoyên dîrokî û hîpotetîkî heftane têne meşandin da ku berxwedanê verast bikin."
        },
        {
          t: "Kontrolên rîskê",
          b: "Sînorên dijwar ên li ser lewaziyê, konsantrasyonê û pêşangeha korelasyonê, ku di asta platformê de têne bicîh kirin."
        }
      ],
      disclaimer: "Hemî veberhênan rîskê digire, di nav de windakirina sermaya sereke. Performansa berê ne nîşanek e, û garantî nake, encamên pêşerojê."
    },
    security: {
      eyebrow: "Ewlehî",
      title: "Parastinên ku hûn dikarin verast bikin.",
      subtitle: "Em sermaya xerîdar û daneyê bi kontrolên ewlehiyê yên qatkirî, kontrolên alîyê sêyemîn û helwestek xebatê ya sifir-ewleh diparêzin.",
      legal: "Qanûnî û pêbawerî",
      items: [
        {
          t: "Nasnameya du-faktorî",
          b: "2FA-ya TOTP-bingeha li ser her têketina xerîdar û çalakiya hesas."
        },
        {
          t: "Daneyên xerîdar ên şîfrekirî",
          b: "AES-256 di bêhnvedanê de û TLS 1.3 di veguhastinê de ji bo her daxwazê."
        },
        {
          t: "Binesaziya ewr a ewle",
          b: "Jîngeha hilberînê ya hişkbûyî ya bi gihîştina kêmtirîn-privilege."
        },
        {
          t: "Verastkirina KYC",
          b: "Verastkirina nasnameyê li ser her hesabê berî çalakiyê."
        },
        {
          t: "Pêbaweriya AML",
          b: "Çavdêriya danûstendinê ya bi standardên navneteweyî re hevaheng e."
        },
        {
          t: "Tomarên kontrolê",
          b: "Rêça kontrolê ya nehevseng ji bo her bûyera xebatê û hesabê."
        }
      ]
    },
    portal: {
      eyebrow: "Portala Xerîdar",
      title: "Portfoliyoya we, zelal.",
      access: "Bigihîje panola xwe",
      items: [
        {
          t: "Pêşniyara portfoliyoyê",
          b: "Hesab, dabeşkirin û P&L di yek nihêrînê de."
        },
        {
          t: "Performansa zindî",
          b: "Nexşeyên înteraktîf ên bi vegerên rojane û berhevkirî."
        },
        {
          t: "Daxuyanî û rapor",
          b: "Raporên PDF-ê mehane, salane û li ser daxwazê."
        },
        {
          t: "Peyama ewle",
          b: "Xetek rasterast ji rêvebirê hesabê we re."
        }
      ]
    },
    final: {
      eyebrow: "Dest pê bike",
      titleA: "Kapîtala xwe têxin",
      titleB: "destên bi ezmûn.",
      cta: "Hesabê Veberhênanê Vegere",
      note: "Bi pispor re li ser armancên xwe, dem û toleransa rîskê biaxivin."
    }
  };

const mn: LandingContent = {
    hero: {
      badge: "Мэргэжлийн хөрөнгө оруулалтын менежмент",
      titleA: "Мэргэжлийн",
      titleB: "Хөрөнгө",
      titleC: "Оруулалтын менежмент",
      subtitle: "Forex, алт, түүхий эд, индекс, хувьцааны зах зээлд туршлагатай багцын удирдлага, сахилга баттай эрсдлийн хяналт, ил тод тайлагнал, үйлчлүүлэгчдэд чиглэсэн үйлчилгээ.",
      ctaOpen: "Хөрөнгө оруулалтын данс нээх",
      ctaAdvisor: "Худалдаа хуулах",
      ctaLearn: "Тэмцээн уралдаан",
      statAum: "Удирдлага дор байгаа хөрөнгө (AUM)",
      statClients: "Үйлчлүүлэгчид",
      statCountries: "Улс орнууд",
      cardTitle: "Тэнцвэртэй өсөлтийн багц",
      ytd: "Оны эхнээс",
      live: "Шууд",
      disclaimer: "Жишээ үлгэрчилэл. Өнгөрсөн гүйцэтгэл нь ирээдүйн үр дүнг баталгаажуулахгүй."
    },
    trust: {
      regulated: "Зохицуулагдсан ба дүрэм журамд нийцсэн",
      funds: "Үйлчлүүлэгчийн хөрөнгийг тусад нь байршуулсан",
      audits: "Бие даасан аудит",
      global: "Дэлхийн цар хүрээтэй, 24/6 үйлчилгээ"
    },
    features: {
      eyebrow: "Яагаад HK Investment гэж?",
      titleA: "Сахилга батыг үнэлдэг хөрөнгө оруулагчдад зориулсан",
      titleB: "уламжлал.",
      subtitle: "Бид байгууллагын түвшний дэд бүтцийг туршлагатай багтай хослуулдаг. Таны капиталыг хатуу чанд удирдаж, тодорхой үр дүнгээр тайлагнаж, ноцтой хөрөнгийн менежерээс хүлээж буй стандартын дагуу хамгаалдаг.",
      items: [
        {
          t: "Мэргэжлийн багцын удирдлага",
          b: "Ахлах хөрөнгө оруулалтын баг таны зорилгоо биелүүлэхийн тулд зах зээл дээр хөрөнгө хуваарилдаг."
        },
        {
          t: "Ялгаварлан хөрөнгө оруулалтын стратеги",
          b: "Forex, алт, түүхий эд, индекс, хувьцааны зах зээл дээр олон төрлийн хөрөнгийн хуваарилалт."
        },
        {
          t: "Ил тод тайлагнал",
          b: "Өдөр тутмын, сар тутмын болон жилийн тайлангууд – байршил бүр, хураамж бүр."
        },
        {
          t: "Аюулгүй үйлчлүүлэгчийн портал",
          b: "Хоёр хүчин зүйл нэвтрэх, шифрлэгдсэн хадгалалт, KYC/AML баталгаажсан."
        },
        {
          t: "Бодит цагийн гүйцэтгэл",
          b: "Эквити муруй, хуваарилалт, эрсдлийн үзүүлэлтүүд бүхий шууд мэдээллийн самбар."
        },
        {
          t: "Туршлагатай баг",
          b: "Дэлхийн зах зээлд олон арван жилийн туршлагатай багцын менежер, квант, эрсдлийн ажилтнууд."
        },
        {
          t: "Нарийвчилсан эрсдлийн хүрээ",
          b: "Байршлын хэмжээ, алдагдлын хязгаар, стресс тестийг стратеги бүрд суулгасан."
        },
        {
          t: "Тухайн үйлчлүүлэгчид зориулсан дэмжлэг",
          b: "Нэрлэсэн дансны менежер ба харилцааг тэргүүлсэн ширээ."
        }
      ]
    },
    solutions: {
      eyebrow: "Удирдлагатай багцууд",
      title: "Гурван стратеги. Нэг ижил стандартын үйлчилгээ.",
      explore: "Багцуудыг судлах",
      popular: "Хамгийн алдартай",
      target: "Долоо хоногийн зорилтот өгөөж",
      risk: "Эрсдлийн түвшин",
      min: "Хамгийн бага",
      withdraw: "Хамгийн бага ашиг татах",
      open: "Данс нээх",
      tiers: [
        {
          name: "Консерватив",
          risk: "Бага"
        },
        {
          name: "Тэнцвэртэй",
          risk: "Бага"
        },
        {
          name: "Өсөлт",
          risk: "Өндөр"
        }
      ]
    },
    perf: {
      aum: "Удирдлага дор байгаа хөрөнгө",
      accounts: "Идэвхтэй үйлчлүүлэгчийн дансууд",
      tenure: "Дундаж хадгалах хугацаа (жил)",
      sat: "Үйлчлүүлэгчийн сэтгэл ханамж"
    },
    riskf: {
      eyebrow: "Эрсдлийн удирдлага",
      title: "Сахилга бат бол стратеги юм.",
      subtitle: "Манай хүрээ нэг итгэл үнэмшилд тулгуурладаг: тогтвортой өгөөж нь их алдагдалаас зайлсхийхээс үүсдэг. Байршил бүрийг урьдчилан тодорхойлсон эрсдлийн төсөвт үндэслэн хэмжээлж, хянаж, стресс тест хийдэг.",
      items: [
        {
          t: "Капитал хадгалалт",
          b: "Стратеги бүр хүлээн зөвшөөрөгдөх алдагдлыг тодорхойлсноор эхэлж, дараа нь тэр хязгаарт байршлыг үүсгэдэг."
        },
        {
          t: "Байршлын хэмжээ",
          b: "Стратегийн итгэл үнэмшил болон одоогийн зах зээлийн нөхцөл байдалд үндэслэн хэлбэлзэлд тохируулсан хэмжээ."
        },
        {
          t: "Багцын солонгоруулалт",
          b: "Валют, металл, индекс, сонгосон дан нэрээр дамжуулан хамааралгүй өртөлт."
        },
        {
          t: "Тасралтгүй хяналт",
          b: "24/6 эрсдлийн хэлтэс, автомат сэрэмжлүүлэг, стратегийн түвшний алдагдлын эсрэг зогсох."
        },
        {
          t: "Стресс тест",
          b: "Түүхэн болон таамаглалын хувилбаруудыг долоо хоног бүр гүйцэтгэж, тогтвортой байдлыг баталгаажуулдаг."
        },
        {
          t: "Эрсдлийн хяналт",
          b: "Хөшүүрэг, төвлөрөл, хамааралтай өртөлтийн хатуу хязгаарлалтыг платформын түвшинд хэрэгжүүлдэг."
        }
      ],
      disclaimer: "Хөрөнгө оруулалт бүр эрсдэлтэй бөгөөд үндсэн хөрөнгийг алдах эрсдэлтэй. Өнгөрсөн гүйцэтгэл нь ирээдүйн үр дүнг илэрхийлэхгүй, баталгаажуулахгүй."
    },
    security: {
      eyebrow: "Аюулгүй байдал",
      title: "Таны баталгаажуулах боломжтой хамгаалалтууд.",
      subtitle: "Бид үйлчлүүлэгчийн капиталыг болон өгөгдлийг давхарласан аюулгүй байдлын хяналт, гуравдагч талын аудит, тэг-итгэлцлийн үйл ажиллагааны байрлалаар хамгаалдаг.",
      legal: "Хууль эрх зүйн ба дүрэм журам",
      items: [
        {
          t: "Хоёр хүчин зүйлийн нэвтрэлт",
          b: "Үйлчлүүлэгчийн нэвтрэх болон чухал үйлдэл бүрд TOTP-д суурилсан 2FA."
        },
        {
          t: "Шифрлэгдсэн үйлчлүүлэгчийн өгөгдөл",
          b: "Бүх хүсэлтэд зориулсан AES-256 хадгалалт болон дамжуулалтын үеийн TLS 1.3."
        },
        {
          t: "Аюулгүй үүлэн дэд бүтэц",
          b: "Хамгийн бага эрхтэй нэвтрэлттэй сайжруулсан үйлдвэрлэлийн орчин."
        },
        {
          t: "KYC баталгаажуулалт",
          b: "Идэвхжүүлэхийн өмнө данс бүрийн иргэний үнэмлэх баталгаажуулалт."
        },
        {
          t: "AML дүрэм журамд нийцэх",
          b: "Олон улсын стандартад нийцүүлсэн гүйлгээний хяналт."
        },
        {
          t: "Аудитын бүртгэл",
          b: "Үйлдлийн болон дансны үйл явдал бүрийн өөрчлөгдөхгүй аудитын зам."
        }
      ]
    },
    portal: {
      eyebrow: "Үйлчлүүлэгчийн портал",
      title: "Таны багц, ил тод.",
      access: "Өөрийн мэдээллийн самбарт нэвтрэх",
      items: [
        {
          t: "Багцын тойм",
          b: "Үлдэгдэл, хуваарилалт, P&L нэг дороос."
        },
        {
          t: "Бодит цагийн гүйцэтгэл",
          b: "Өдөр тутмын болон хуримтлагдсан өгөөжтэй интерактив график."
        },
        {
          t: "Тайлан ба мэдээллүүд",
          b: "Сарын, жилийн, болон хүсэлтээр PDF тайлангууд."
        },
        {
          t: "Аюулгүй мессеж",
          b: "Дансны менежертэй шууд холбоо."
        }
      ]
    },
    final: {
      eyebrow: "Эхлэх",
      titleA: "Таны капиталыг",
      titleB: "туршлагатай гар дээр өгөөрэй.",
      cta: "Хөрөнгө оруулалтын данс нээх",
      note: "Зорилго, хугацаа, эрсдлийн хүлцлийн талаар мэргэжилтэнтэй ярилцаарай."
    }
  };

const sv: LandingContent = {
    hero: {
      badge: "Professionell Kapitalförvaltning",
      titleA: "Professionell",
      titleB: "Kapital-",
      titleC: "Förvaltning",
      subtitle: "Erfaren portföljförvaltning med disciplinerad riskkontroll, transparent rapportering och kundfokuserad service — inom Forex, Guld, Råvaror, Index och Aktier.",
      ctaOpen: "Öppna investeringskonto",
      ctaAdvisor: "Kopiera handel",
      ctaLearn: "Tävlingar",
      statAum: "Förvaltat kapital",
      statClients: "Kunder",
      statCountries: "Länder",
      cardTitle: "Balanserad Tillväxtportfölj",
      ytd: "YTD",
      live: "Live",
      disclaimer: "Illustrativt exempel. Tidigare resultat garanterar inte framtida resultat."
    },
    trust: {
      regulated: "Reglerat & efterlevt",
      funds: "Segregerade kundmedel",
      audits: "Oberoende revisioner",
      global: "Global räckvidd, 24/6-bemanning"
    },
    features: {
      eyebrow: "Därför HK Investment",
      titleA: "Byggt för investerare som värdesätter",
      titleB: "disciplin.",
      subtitle: "Vi kombinerar infrastruktur av institutionell kvalitet med ett erfaret mänskligt team. Ditt kapital hanteras med noggrannhet, rapporteras med tydlighet och skyddas med de standarder du förväntar dig av en seriös kapitalförvaltare.",
      items: [
        {
          t: "Professionell portföljförvaltning",
          b: "Ett senior investeringsteam allokerar över marknader för att uppnå dina mål."
        },
        {
          t: "Diversifierade investeringsstrategier",
          b: "Tillgångsallokering över flera tillgångsslag inom Forex, Guld, Råvaror, Index och Aktier."
        },
        {
          t: "Transparent rapportering",
          b: "Dagliga, månatliga och årliga rapporter — varje position, varje avgift."
        },
        {
          t: "Säker kundportal",
          b: "Tvåfaktorsautentisering, krypterad lagring, KYC/AML-verifierad."
        },
        {
          t: "Realtidsprestanda",
          b: "Realtidsdashboard med kapitalutveckling, allokering och riskmått."
        },
        {
          t: "Erfaret team",
          b: "Portföljförvaltare, kvantitativa analytiker och riskansvariga med årtionden på globala marknader."
        },
        {
          t: "Avancerat ramverk för riskhantering",
          b: "Positionsstorlek, drawdown-gränser och stresstester inbakade i varje strategi."
        },
        {
          t: "Dedikerad support",
          b: "Namngiven kontohanterare och prioriterad support."
        }
      ]
    },
    solutions: {
      eyebrow: "Förvaltade Portföljer",
      title: "Tre strategier. En standard för omsorg.",
      explore: "Utforska portföljer",
      popular: "Mest populär",
      target: "Mål veckovis avkastning",
      risk: "Riskprofil",
      min: "Minimum",
      withdraw: "Min. vinstuttag",
      open: "Öppna konto",
      tiers: [
        {
          name: "Konservativ",
          risk: "Låg"
        },
        {
          name: "Balanserad",
          risk: "Låg"
        },
        {
          name: "Tillväxt",
          risk: "Högre"
        }
      ]
    },
    perf: {
      aum: "Förvaltat kapital",
      accounts: "Aktiva kundkonton",
      tenure: "Genomsnittlig kundrelation (år)",
      sat: "Kundnöjdhet"
    },
    riskf: {
      eyebrow: "Riskhantering",
      title: "Disciplin är strategin.",
      subtitle: "Vårt ramverk bygger på en övertygelse: hållbar avkastning kommer från att undvika stora förluster. Varje position dimensioneras, övervakas och stresstestas mot fördefinierade riskbudgetar.",
      items: [
        {
          t: "Kapitalbevarande",
          b: "Varje strategi börjar med att definiera acceptabel förlust, sedan byggs positioner inom den gränsen."
        },
        {
          t: "Positionsstorlek",
          b: "Volatilitetsjusterad dimensionering baserad på strategins övertygelse och nuvarande marknadsregim."
        },
        {
          t: "Portföljdiversifiering",
          b: "Okorrelerad exponering över valutor, metaller, index och utvalda enskilda aktier."
        },
        {
          t: "Kontinuerlig övervakning",
          b: "24/6 riskdesk, automatiserade varningar och hårda stopp för strategispecifika drawdowns."
        },
        {
          t: "Stresstestning",
          b: "Historiska och hypotetiska scenarier körs veckovis för att validera motståndskraft."
        },
        {
          t: "Riskkontroller",
          b: "Hårda gränser för hävstång, koncentration och korrelerad exponering, upprätthålls på plattformsnivå."
        }
      ],
      disclaimer: "All investering innebär risk, inklusive förlust av kapital. Tidigare resultat är inte vägledande för, och garanterar inte, framtida resultat."
    },
    security: {
      eyebrow: "Säkerhet",
      title: "Skyddsräcken du kan verifiera.",
      subtitle: "Vi skyddar kundkapital och data med lager av säkerhetskontroller, tredjepartsrevisioner och en nollförtroendeprincip (zero-trust) vid drift.",
      legal: "Juridik & regelefterlevnad",
      items: [
        {
          t: "Tvåfaktorsautentisering",
          b: "TOTP-baserad 2FA vid varje kundinloggning och känslig åtgärd."
        },
        {
          t: "Krypterad kunddata",
          b: "AES-256 i vila och TLS 1.3 under överföring för varje förfrågan."
        },
        {
          t: "Säker molninfrastruktur",
          b: "Härdad produktionsmiljö med åtkomst enligt principen om minsta behörighet."
        },
        {
          t: "KYC-verifiering",
          b: "Identitetsverifiering för varje konto före aktivering."
        },
        {
          t: "AML-efterlevnad",
          b: "Transaktionsövervakning i linje med internationella standarder."
        },
        {
          t: "Revisionsloggar",
          b: "Oföränderlig revisionsspår för varje operativ händelse och kontohändelse."
        }
      ]
    },
    portal: {
      eyebrow: "Kundportal",
      title: "Din portfölj, transparent.",
      access: "Öppna din dashboard",
      items: [
        {
          t: "Portföljöversikt",
          b: "Saldo, allokering och P&L i en överblick."
        },
        {
          t: "Liveprestanda",
          b: "Interaktiva diagram med daglig och ackumulerad avkastning."
        },
        {
          t: "Rapporter & utdrag",
          b: "Månatliga, årliga och on-demand PDF-rapporter."
        },
        {
          t: "Säker meddelandefunktion",
          b: "Direktlinje till din kontohanterare."
        }
      ]
    },
    final: {
      eyebrow: "Kom igång",
      titleA: "Placera ditt kapital i",
      titleB: "erfarna händer.",
      cta: "Öppna investeringskonto",
      note: "Prata med en specialist om dina mål, tidshorisont och risktolerans."
    }
  };

const nl: LandingContent = {
    hero: {
      badge: "Professioneel Beleggingsbeheer",
      titleA: "Professioneel",
      titleB: "Beleggings-",
      titleC: "Beheer",
      subtitle: "Ervaren portefeuillebeheer met gedisciplineerde risicocontroles, transparante rapportage en klantgerichte service — over Forex, Goud, Grondstoffen, Indices en Aandelen.",
      ctaOpen: "Open Beleggingsrekening",
      ctaAdvisor: "Copy Trading",
      ctaLearn: "Competities",
      statAum: "Beheerd Vermogen",
      statClients: "Cliënten",
      statCountries: "Landen",
      cardTitle: "Gebalanceerde Groei Portefeuille",
      ytd: "YTD",
      live: "Live",
      disclaimer: "Illustratief voorbeeld. Resultaten uit het verleden bieden geen garantie voor de toekomst."
    },
    trust: {
      regulated: "Gereguleerd & compliant",
      funds: "Gesegregeerde cliëntfondsen",
      audits: "Onafhankelijke audits",
      global: "Wereldwijd bereik, 24/6 desk"
    },
    features: {
      eyebrow: "Waarom HK Investment",
      titleA: "Gebouwd voor beleggers die waarde hechten aan",
      titleB: "discipline.",
      subtitle: "Wij combineren institutionele infrastructuur met een ervaren menselijk team. Uw kapitaal wordt beheerd met nauwgezetheid, gerapporteerd met duidelijkheid en beveiligd met de standaarden die u van een serieuze vermogensbeheerder mag verwachten.",
      items: [
        {
          t: "Professioneel portefeuillebeheer",
          b: "Een senior beleggingsteam alloceert over markten om uw doelstellingen na te streven."
        },
        {
          t: "Gediversifieerde beleggingsstrategieën",
          b: "Multi-asset exposure over Forex, Goud, Grondstoffen, Indices en Aandelen."
        },
        {
          t: "Transparante rapportage",
          b: "Dagelijkse, maandelijkse en jaarlijkse overzichten — elke positie, elke vergoeding."
        },
        {
          t: "Veilig cliëntportaal",
          b: "Twee-factor authenticatie, versleutelde opslag, KYC/AML geverifieerd."
        },
        {
          t: "Real-time prestaties",
          b: "Live dashboard met equity curve, allocatie en risicokenmerken."
        },
        {
          t: "Ervaren team",
          b: "Portefeuillebeheerders, quants en risicomanagers met decennia aan ervaring in wereldwijde markten."
        },
        {
          t: "Geavanceerd risicoframework",
          b: "Positiegrootte, drawdown-limieten en stresstests ingebakken in elke strategie."
        },
        {
          t: "Toegewijde ondersteuning",
          b: "Toegewezen accountmanager en prioritaire relatiebeheerdesk."
        }
      ]
    },
    solutions: {
      eyebrow: "Beheerde Portefeuilles",
      title: "Drie strategieën. Eén zorgstandaard.",
      explore: "Ontdek portefeuilles",
      popular: "Meest populair",
      target: "Doelwekelijk rendement",
      risk: "Risicoprofiel",
      min: "Minimum",
      withdraw: "Min. winstopname",
      open: "Open rekening",
      tiers: [
        {
          name: "Conservatief",
          risk: "Laag"
        },
        {
          name: "Gebalanceerd",
          risk: "Laag"
        },
        {
          name: "Groei",
          risk: "Hoger"
        }
      ]
    },
    perf: {
      aum: "Beheerd vermogen",
      accounts: "Actieve cliëntrekeningen",
      tenure: "Gemiddelde looptijd (jaren)",
      sat: "Cliënttevredenheid"
    },
    riskf: {
      eyebrow: "Risicobeheer",
      title: "Discipline is de strategie.",
      subtitle: "Ons framework is gebouwd rond één overtuiging: duurzame rendementen komen voort uit het vermijden van grote verliezen. Elke positie wordt geschaald, gemonitord en stresstest tegen vooraf gedefinieerde risicobudgetten.",
      items: [
        {
          t: "Kapitaalbehoud",
          b: "Elke strategie begint met het definiëren van aanvaardbaar verlies, en construeert vervolgens posities binnen die limiet."
        },
        {
          t: "Positiebepaling",
          b: "Volatiliteit-aangepaste bepaling van de positie op basis van strategische overtuiging en huidig marktklimaat."
        },
        {
          t: "Portefeuillediversificatie",
          b: "Ongecorreleerde exposure over valuta, metalen, indices en geselecteerde individuele aandelen."
        },
        {
          t: "Continue monitoring",
          b: "24/6 risicodesk, geautomatiseerde alerts en harde stops op strategie-niveau drawdowns."
        },
        {
          t: "Stresstesten",
          b: "Historische en hypothetische scenario's worden wekelijks uitgevoerd om veerkracht te valideren."
        },
        {
          t: "Risicocontroles",
          b: "Harde limieten op leverage, concentratie en gecorreleerde exposure, afgedwongen op platformniveau."
        }
      ],
      disclaimer: "Alle beleggingen brengen risico met zich mee, inclusief het verlies van de hoofdsom. Resultaten uit het verleden zijn geen indicator voor, en garanderen geen, toekomstige resultaten."
    },
    security: {
      eyebrow: "Beveiliging",
      title: "Waarborgen die u kunt verifiëren.",
      subtitle: "Wij beschermen cliëntkapitaal en -gegevens met gelaagde beveiligingscontroles, audits door derden en een zero-trust operationele houding.",
      legal: "Juridisch & compliance",
      items: [
        {
          t: "Twee-factor authenticatie",
          b: "TOTP-gebaseerde 2FA bij elke cliëntlogin en gevoelige actie."
        },
        {
          t: "Versleutelde cliëntgegevens",
          b: "AES-256 in rust en TLS 1.3 onderweg voor elke aanvraag."
        },
        {
          t: "Veilige cloudinfrastructuur",
          b: "Geharde productieomgeving met least-privilege toegang."
        },
        {
          t: "KYC verificatie",
          b: "Identiteitsverificatie op elke rekening vóór activering."
        },
        {
          t: "AML compliance",
          b: "Transactiemonitoring afgestemd op internationale standaarden."
        },
        {
          t: "Audit logs",
          b: "Onveranderlijk auditspoor voor elke operationele en accountgebeurtenis."
        }
      ]
    },
    portal: {
      eyebrow: "Cliëntportaal",
      title: "Uw portefeuille, transparant.",
      access: "Toegang tot uw dashboard",
      items: [
        {
          t: "Portefeuilleoverzicht",
          b: "Saldo, allocatie en P&L in één oogopslag."
        },
        {
          t: "Live prestaties",
          b: "Interactieve grafieken met dagelijkse en cumulatieve rendementen."
        },
        {
          t: "Afschriften & rapporten",
          b: "Maandelijkse, jaarlijkse en op aanvraag PDF-rapporten."
        },
        {
          t: "Veilige berichten",
          b: "Directe lijn naar uw accountmanager."
        }
      ]
    },
    final: {
      eyebrow: "Begin",
      titleA: "Leg uw kapitaal in",
      titleB: "ervaren handen.",
      cta: "Open Beleggingsrekening",
      note: "Spreek met een specialist over uw doelstellingen, tijdlijn en risicotolerantie."
    }
  };

const uk: LandingContent = {
    hero: {
      badge: "Професійне управління інвестиціями",
      titleA: "Професійне",
      titleB: "Інвестиційне",
      titleC: "Управління",
      subtitle: "Досвідчене управління портфелем з дисциплінованим контролем ризиків, прозорою звітністю та клієнтоорієнтованим сервісом — по Forex, золоту, сировині, індексах та акціях.",
      ctaOpen: "Відкрити інвестиційний рахунок",
      ctaAdvisor: "Копіювання угод",
      ctaLearn: "Змагання",
      statAum: "Активи під управлінням",
      statClients: "Клієнти",
      statCountries: "Країни",
      cardTitle: "Збалансований портфель зростання",
      ytd: "З початку року",
      live: "Онлайн",
      disclaimer: "Ілюстративний зразок. Минулі результати не гарантують майбутніх."
    },
    trust: {
      regulated: "Регульовано та відповідає нормам",
      funds: "Сегреговані кошти клієнтів",
      audits: "Незалежні аудити",
      global: "Глобальне охоплення, служба підтримки 24/6"
    },
    features: {
      eyebrow: "Чому HK Investment",
      titleA: "Створено для інвесторів, які цінують",
      titleB: "дисципліну.",
      subtitle: "Ми поєднуємо інфраструктуру інституційного рівня з досвідченою командою фахівців. Ваш капітал управляється з точністю, звітується з прозорістю та захищений за стандартами, які ви очікували б від серйозного управляючого активами.",
      items: [
        {
          t: "Професійне управління портфелем",
          b: "Досвідчена інвестиційна команда розподіляє капітал по ринках для досягнення ваших цілей."
        },
        {
          t: "Диверсифіковані інвестиційні стратегії",
          b: "Мультикласовий доступ до Forex, золота, сировини, індексів та акцій."
        },
        {
          t: "Прозора звітність",
          b: "Щоденні, щомісячні та річні звіти — кожна позиція, кожна комісія."
        },
        {
          t: "Безпечний клієнтський портал",
          b: "Двофакторна автентифікація, зашифроване зберігання, верифікація KYC/AML."
        },
        {
          t: "Ефективність у реальному часі",
          b: "Онлайн-дашборд з кривою капіталу, розподілом та метриками ризику."
        },
        {
          t: "Досвідчена команда",
          b: "Портфельні керуючі, кількісні аналітики та фахівці з ризиків з десятиліттями досвіду на світових ринках."
        },
        {
          t: "Передова система управління ризиками",
          b: "Розмір позиції, ліміти просадок та стрес-тести інтегровані в кожну стратегію."
        },
        {
          t: "Персональна підтримка",
          b: "Призначений менеджер рахунку та пріоритетна служба підтримки."
        }
      ]
    },
    solutions: {
      eyebrow: "Керовані портфелі",
      title: "Три стратегії. Один стандарт обслуговування.",
      explore: "Дослідити портфелі",
      popular: "Найпопулярніший",
      target: "Цільова тижнева дохідність",
      risk: "Профіль ризику",
      min: "Мінімум",
      withdraw: "Мін. вивід прибутку",
      open: "Відкрити рахунок",
      tiers: [
        {
          name: "Консервативний",
          risk: "Низький"
        },
        {
          name: "Збалансований",
          risk: "Низький"
        },
        {
          name: "Зростання",
          risk: "Вищий"
        }
      ]
    },
    perf: {
      aum: "Активи під управлінням",
      accounts: "Активні клієнтські рахунки",
      tenure: "Середній термін (роки)",
      sat: "Задоволеність клієнтів"
    },
    riskf: {
      eyebrow: "Управління ризиками",
      title: "Дисципліна – це стратегія.",
      subtitle: "Наша система побудована на одному переконанні: стабільна дохідність досягається уникненням великих збитків. Кожна позиція оцінюється, контролюється та проходить стрес-тести відповідно до попередньо визначених ризикових бюджетів.",
      items: [
        {
          t: "Збереження капіталу",
          b: "Кожна стратегія починається з визначення прийнятних збитків, а потім формуються позиції в межах цього ліміту."
        },
        {
          t: "Розміри позицій",
          b: "Розміри, скориговані на волатильність, базуються на впевненості в стратегії та поточному ринковому режимі."
        },
        {
          t: "Диверсифікація портфеля",
          b: "Некорельована експозиція по валютах, металах, індексах та окремих цінних паперах."
        },
        {
          t: "Безперервний моніторинг",
          b: "24/6 відділ ризиків, автоматичні сповіщення та жорсткі стопи на рівні стратегічних просадок."
        },
        {
          t: "Стрес-тестування",
          b: "Щотижневі історичні та гіпотетичні сценарії для перевірки стійкості."
        },
        {
          t: "Контроль ризиків",
          b: "Жорсткі ліміти на кредитне плече, концентрацію та корельований ризик, що застосовуються на рівні платформи."
        }
      ],
      disclaimer: "Будь-які інвестиції передбачають ризик, включаючи втрату основного капіталу. Минулі результати не є показником і не гарантують майбутніх результатів."
    },
    security: {
      eyebrow: "Безпека",
      title: "Захист, який можна перевірити.",
      subtitle: "Ми захищаємо капітал та дані клієнтів за допомогою багатошарових заходів безпеки, сторонніх аудитів та операційної політики нульової довіри.",
      legal: "Юридичні аспекти та відповідність",
      items: [
        {
          t: "Двофакторна автентифікація",
          b: "TOTP-оснований 2FA для кожного входу клієнта та чутливих дій."
        },
        {
          t: "Зашифровані дані клієнтів",
          b: "AES-256 у стані спокою та TLS 1.3 під час передачі для кожного запиту."
        },
        {
          t: "Безпечна хмарна інфраструктура",
          b: "Загартоване виробниче середовище з мінімальними привілеями доступу."
        },
        {
          t: "KYC верифікація",
          b: "Верифікація особи для кожного рахунку перед активацією."
        },
        {
          t: "Дотримання AML",
          b: "Моніторинг транзакцій відповідно до міжнародних стандартів."
        },
        {
          t: "Журнали аудиту",
          b: "Незмінний аудиторський слід для кожної операційної події та події рахунку."
        }
      ]
    },
    portal: {
      eyebrow: "Клієнтський портал",
      title: "Ваш портфель, прозоро.",
      access: "Доступ до вашої панелі керування",
      items: [
        {
          t: "Огляд портфеля",
          b: "Баланс, розподіл та P&L одним поглядом."
        },
        {
          t: "Ефективність у реальному часі",
          b: "Інтерактивні графіки з щоденними та сукупними прибутками."
        },
        {
          t: "Виписки та звіти",
          b: "Щомісячні, щорічні та на вимогу PDF-звіти."
        },
        {
          t: "Безпечний обмін повідомленнями",
          b: "Прямий зв'язок з вашим менеджером рахунку."
        }
      ]
    },
    final: {
      eyebrow: "Почніть",
      titleA: "Довірте свій капітал",
      titleB: "досвідченим рукам.",
      cta: "Відкрити інвестиційний рахунок",
      note: "Зв'яжіться зі спеціалістом, щоб обговорити ваші цілі, часові рамки та толерантність до ризику."
    }
  };

const uz: LandingContent = {
    hero: {
      badge: "Professional Investment Management",
      titleA: "Professional",
      titleB: "Investment",
      titleC: "Management",
      subtitle: "Tajribali portfel boshqaruvi intizomli risk nazoratlari, shaffof hisobotlar va mijozlarga yo'naltirilgan xizmatlar bilan — Forex, Oltin, Tovarlar, Indekslar va Aksiyalar bo'yicha.",
      ctaOpen: "Investitsiya hisobini ochish",
      ctaAdvisor: "Savdo nusxasi",
      ctaLearn: "Musobaqalar",
      statAum: "AUM",
      statClients: "Mijozlar",
      statCountries: "Davlatlar",
      cardTitle: "Muvozanatli o'sish portfeli",
      ytd: "YTD",
      live: "Jonli",
      disclaimer: "Namuna. O'tmishdagi natijalar kelajakdagi natijalarni kafolatlamaydi."
    },
    trust: {
      regulated: "Tartibga solingan va qonuniy",
      funds: "Mijozlarning ajratilgan mablag'lari",
      audits: "Mustaqil auditlar",
      global: "Global qamrov, 24/6 ish stoli"
    },
    features: {
      eyebrow: "Nima uchun HK Investment",
      titleA: "Qadrlaydigan investorlar uchun yaratilgan",
      titleB: "intizom.",
      subtitle: "Biz institutsional darajadagi infratuzilmani tajribali inson jamoasi bilan birlashtiramiz. Sizning kapitalingiz qattiq nazorat ostida boshqariladi, aniqlik bilan hisobot qilinadi va jiddiy aktivlar menejeri kutgan standartlar bilan himoyalanadi.",
      items: [
        {
          t: "Professional portfel boshqaruvi",
          b: "Katta investitsiya jamoasi maqsadlaringizni amalga oshirish uchun bozorlar bo'ylab joylashtiradi."
        },
        {
          t: "Diversifikatsiyalangan investitsiya strategiyalari",
          b: "Forex, Oltin, Tovarlar, Indekslar va Aksiyalar bo'ylab ko'p aktivli ta'sir."
        },
        {
          t: "Shaffof hisobot",
          b: "Kunlik, oylik va yillik hisobotlar — har bir pozitsiya, har bir to'lov."
        },
        {
          t: "Xavfsiz mijoz portali",
          b: "Ikki faktorli autentifikatsiya, shifrlangan saqlash, KYC/AML tekshirilgan."
        },
        {
          t: "Haqiqiy vaqtda ishlash",
          b: "Kapital egri chizig'i, taqsimlash va risk ko'rsatkichlari bilan jonli panel."
        },
        {
          t: "Tajribali jamoa",
          b: "Global bozorlarda o'nlab yillar tajribaga ega portfel menejerlari, kvantchilar va risk xodimlari."
        },
        {
          t: "Ilg'or risk doirasi",
          b: "Har bir strategiyaga kiritilgan pozitsiya o'lchami, kamayish chegaralari va stress testlari."
        },
        {
          t: "Maxsus qo'llab-quvvatlash",
          b: "Tayinlangan hisob menejeri va ustuvor munosabatlar stoli."
        }
      ]
    },
    solutions: {
      eyebrow: "Boshqariladigan portfellar",
      title: "Uchta strategiya. Bir xil g'amxo'rlik standarti.",
      explore: "Portfellarni o'rganish",
      popular: "Eng mashhur",
      target: "Haftalik maqsadli daromad",
      risk: "Risk profili",
      min: "Minimal",
      withdraw: "Minimal foyda olish",
      open: "Hisob ochish",
      tiers: [
        {
          name: "Konservativ",
          risk: "Past"
        },
        {
          name: "Muvozanatli",
          risk: "Past"
        },
        {
          name: "O'sish",
          risk: "Yuqori"
        }
      ]
    },
    perf: {
      aum: "Boshqaruv ostidagi aktivlar",
      accounts: "Faol mijoz hisoblari",
      tenure: "O'rtacha xizmat muddati (yil)",
      sat: "Mijozlar qoniqishi"
    },
    riskf: {
      eyebrow: "Riskni boshqarish",
      title: "Intizom strategiyadir.",
      subtitle: "Bizning tizimimiz bitta e'tiqodga asoslangan: doimiy daromadlar katta yo'qotishlardan qochish orqali keladi. Har bir pozitsiya oldindan belgilangan risk byudjetlariga nisbatan o'lchanadi, nazorat qilinadi va stress-testdan o'tkaziladi.",
      items: [
        {
          t: "Kapitalni saqlash",
          b: "Har bir strategiya qabul qilinadigan yo'qotishni aniqlashdan boshlanadi, so'ngra shu chegara ichida pozitsiyalarni tuzadi."
        },
        {
          t: "Pozitsiya o'lchami",
          b: "Strategiya ishonchi va joriy bozor rejimiga asoslangan o'zgaruvchanlikka moslashtirilgan o'lcham."
        },
        {
          t: "Portfel diversifikatsiyasi",
          b: "Valyutalar, metallar, indekslar va tanlangan yagona nomlar bo'ylab o'zaro bog'liq bo'lmagan ta'sir."
        },
        {
          t: "Uzluksiz monitoring",
          b: "24/6 risk stoli, avtomatlashtirilgan ogohlantirishlar va strategiya darajasidagi kamayishlarda qattiq to'xtashlar."
        },
        {
          t: "Stress testlari",
          b: "Chidamlilikni tasdiqlash uchun har hafta tarixiy va gipotetik stsenariylar o'tkaziladi."
        },
        {
          t: "Risk nazorati",
          b: "Platforma darajasida joriy qilingan leverage, konsentratsiya va o'zaro bog'liq ta'sirga qattiq cheklovlar."
        }
      ],
      disclaimer: "Barcha investitsiyalar risklarni, shu jumladan asosiy kapitalni yo'qotish xavfini o'z ichiga oladi. O'tmishdagi natijalar kelajakdagi natijalarni ko'rsatmaydi va kafolatlamaydi."
    },
    security: {
      eyebrow: "Xavfsizlik",
      title: "Siz tekshirishingiz mumkin bo'lgan himoyalar.",
      subtitle: "Biz mijoz kapitallari va ma'lumotlarini qatlamli xavfsizlik nazorati, uchinchi tomon auditlari va nol-ishonchli operatsion holat bilan himoya qilamiz.",
      legal: "Huquqiy va muvofiqlik",
      items: [
        {
          t: "Ikki faktorli autentifikatsiya",
          b: "Har bir mijoz kirishi va sezgir harakatida TOTP-ga asoslangan 2FA."
        },
        {
          t: "Shifrlangan mijoz ma'lumotlari",
          b: "Har bir so'rov uchun dam olishda AES-256 va tranzitda TLS 1.3."
        },
        {
          t: "Xavfsiz bulut infratuzilmasi",
          b: "Eng kam imtiyozli kirish bilan mustahkamlangan ishlab chiqarish muhiti."
        },
        {
          t: "KYC tekshiruvi",
          b: "Faollashtirishdan oldin har bir hisobda shaxsni tasdiqlash."
        },
        {
          t: "AML mosligi",
          b: "Xalqaro standartlarga mos tranzaksiya monitoringi."
        },
        {
          t: "Audit jurnallari",
          b: "Har bir operatsion va hisob hodisasi uchun o'zgarmas audit izi."
        }
      ]
    },
    portal: {
      eyebrow: "Mijoz Portali",
      title: "Portfelingiz, shaffof.",
      access: "Ma'lumotlar paneliga kirish",
      items: [
        {
          t: "Portfelga umumiy ko'rinish",
          b: "Balans, taqsimlash va P&L bir qarashda."
        },
        {
          t: "Jonli ishlash",
          b: "Kunlik va kumulyativ daromadlar bilan interaktiv diagrammalar."
        },
        {
          t: "Hisobotlar va bayonotlar",
          b: "Oylik, yillik va talab bo'yicha PDF hisobotlar."
        },
        {
          t: "Xavfsiz xabarlar",
          b: "Hisob menejeringizga to'g'ridan-to'g'ri aloqa."
        }
      ]
    },
    final: {
      eyebrow: "Boshlash",
      titleA: "Kapitalingizni joylashtiring",
      titleB: "tajribali qo'llarga.",
      cta: "Investitsiya hisobini ochish",
      note: "Maqsadlaringiz, vaqt jadvali va risk tolerantligingiz haqida mutaxassis bilan gaplashing."
    }
  };

const da: LandingContent = {
    hero: {
      badge: "Professionel Investeringsforvaltning",
      titleA: "Professionel",
      titleB: "Investeringsforvaltning",
      titleC: "",
      subtitle: "Erfaren porteføljeforvaltning med disciplinerede risikokontroller, gennemsigtig rapportering og klientfokuseret service – på tværs af Forex, Guld, Råvarer, Indekser og Aktier.",
      ctaOpen: "Åbn Investeringskonto",
      ctaAdvisor: "Kopi Handel",
      ctaLearn: "Konkurrencer",
      statAum: "Administrerede aktiver",
      statClients: "Kunder",
      statCountries: "Lande",
      cardTitle: "Balanceret Vækstportefølje",
      ytd: "YTD",
      live: "Live",
      disclaimer: "Illustrativt eksempel. Tidligere resultater garanterer ikke fremtidige resultater."
    },
    trust: {
      regulated: "Reguleret & efterlevelse",
      funds: "Segregerede klientmidler",
      audits: "Uafhængige revisioner",
      global: "Global rækkevidde, 24/6 desk"
    },
    features: {
      eyebrow: "Hvorfor HK Investment",
      titleA: "Bygget til investorer, der værdsætter",
      titleB: "disciplin.",
      subtitle: "Vi kombinerer institutionel infrastruktur med et erfarent team. Din kapital forvaltes med stringens, rapporteres med klarhed og sikres med de standarder, du ville forvente af en seriøs kapitalforvalter.",
      items: [
        {
          t: "Professionel porteføljeforvaltning",
          b: "Et erfarent investeringshold fordeler kapital på tværs af markeder for at forfølge dine mål."
        },
        {
          t: "Diversificerede investeringsstrategier",
          b: "Multi-aktiv eksponering på tværs af Forex, Guld, Råvarer, Indekser og Aktier."
        },
        {
          t: "Gennemsigtig rapportering",
          b: "Daglige, månedlige og årlige erklæringer – hver position, hvert gebyr."
        },
        {
          t: "Sikker klientportal",
          b: "To-faktor-autentificering, krypteret lagring, KYC/AML verificeret."
        },
        {
          t: "Realtidsydeevne",
          b: "Live dashboard med egenkapitalkurve, allokering og risikometrik."
        },
        {
          t: "Erfarent team",
          b: "Porteføljeforvaltere, kvantitative analytikere og risikoansvarlige med årtier på globale markeder."
        },
        {
          t: "Avanceret risikoramme",
          b: "Positionsstørrelse, drawdown-grænser og stresstests indbygget i hver strategi."
        },
        {
          t: "Dedikeret support",
          b: "Navngiven kontoadministrator og prioriteret relationsdesk."
        }
      ]
    },
    solutions: {
      eyebrow: "Forvaltede Porteføljer",
      title: "Tre strategier. Én standard for omhu.",
      explore: "Udforsk porteføljer",
      popular: "Mest populære",
      target: "Mål ugentligt afkast",
      risk: "Risikoprofil",
      min: "Minimum",
      withdraw: "Min. profitudbetaling",
      open: "Åbn konto",
      tiers: [
        {
          name: "Konservativ",
          risk: "Lav"
        },
        {
          name: "Balanceret",
          risk: "Lav"
        },
        {
          name: "Vækst",
          risk: "Højere"
        }
      ]
    },
    perf: {
      aum: "Administrerede aktiver",
      accounts: "Aktive klientkonti",
      tenure: "Gennemsnitlig anciennitet (år)",
      sat: "Klienttilfredshed"
    },
    riskf: {
      eyebrow: "Risikostyring",
      title: "Disciplin er strategien.",
      subtitle: "Vores ramme er bygget på én overbevisning: holdbare afkast kommer fra at undgå store tab. Hver position dimensioneres, overvåges og stresstestes mod foruddefinerede risikobudgetter.",
      items: [
        {
          t: "Kapitalbevaring",
          b: "Hver strategi starter med at definere acceptabelt tab og konstruerer derefter positioner inden for den grænse."
        },
        {
          t: "Positionsstørrelse",
          b: "Volatilitetsjusteret størrelse baseret på strategikonviction og nuværende markedsregime."
        },
        {
          t: "Porteføljediversificering",
          b: "Ukorreleret eksponering på tværs af valutaer, metaller, indekser og udvalgte enkeltnavne."
        },
        {
          t: "Kontinuerlig overvågning",
          b: "24/6 risikodesk, automatiske advarsler og hårde stop på strateginiveau-drawdowns."
        },
        {
          t: "Stress-test",
          b: "Historiske og hypotetiske scenarier køres ugentligt for at validere modstandsdygtighed."
        },
        {
          t: "Risikokontrol",
          b: "Hårde grænser for gearing, koncentration og korreleret eksponering, håndhævet på platformsniveau."
        }
      ],
      disclaimer: "Al investering indebærer risiko, herunder tab af hovedstol. Tidligere resultater er ikke vejledende for og garanterer ikke fremtidige resultater."
    },
    security: {
      eyebrow: "Sikkerhed",
      title: "Sikkerhedsforanstaltninger, du kan verificere.",
      subtitle: "Vi beskytter klientkapital og data med lagdelt sikkerhedskontrol, tredjepartsrevisioner og en zero-trust driftsstilling.",
      legal: "Jura & efterlevelse",
      items: [
        {
          t: "To-faktor-autentificering",
          b: "TOTP-baseret 2FA ved hvert klientlogin og følsom handling."
        },
        {
          t: "Krypterede klientdata",
          b: "AES-256 i hvile og TLS 1.3 under overførsel for hver anmodning."
        },
        {
          t: "Sikker cloud-infrastruktur",
          b: "Hærdet produktionsmiljø med mindst privilegeret adgang."
        },
        {
          t: "KYC-verifikation",
          b: "Identitetsverifikation på hver konto før aktivering."
        },
        {
          t: "AML-overholdelse",
          b: "Transaktionsovervågning i overensstemmelse med internationale standarder."
        },
        {
          t: "Revisionslogfiler",
          b: "Uforanderlig revisionssti for hver operationel og kontobegivenhed."
        }
      ]
    },
    portal: {
      eyebrow: "Klientportal",
      title: "Din portefølje, gennemsigtig.",
      access: "Gå til dit dashboard",
      items: [
        {
          t: "Porteføljeoversigt",
          b: "Balance, allokering og P&L i et overblik."
        },
        {
          t: "Live performance",
          b: "Interaktive diagrammer med daglige og kumulative afkast."
        },
        {
          t: "Erklæringer og rapporter",
          b: "Månedlige, årlige og on-demand PDF-rapporter."
        },
        {
          t: "Sikker beskedudveksling",
          b: "Direkte linje til din kontoadministrator."
        }
      ]
    },
    final: {
      eyebrow: "Kom i gang",
      titleA: "Læg din kapital i",
      titleB: "erfarne hænder.",
      cta: "Åbn Investeringskonto",
      note: "Tal med en specialist om dine mål, tidslinje og risikotolerance."
    }
  };

const lt: LandingContent = {
    hero: {
      badge: "Profesionalus Investicijų Valdymas",
      titleA: "Profesionalus",
      titleB: "Investicijų",
      titleC: "Valdymas",
      subtitle: "Patyręs portfelio valdymas su disciplinuota rizikos kontrole, skaidriu ataskaitų teikimu ir į klientą orientuotu aptarnavimu – Forex, Aukso, Žaliavų, Indeksų ir Akcijų rinkose.",
      ctaOpen: "Atidaryti Investicinę Sąskaitą",
      ctaAdvisor: "Kopijuoti Prekybą",
      ctaLearn: "Konkursai",
      statAum: "Valdomas Turtas",
      statClients: "Klientai",
      statCountries: "Šalys",
      cardTitle: "Subalansuoto Augimo Portfelis",
      ytd: "YTD",
      live: "Tiesiogiai",
      disclaimer: "Pavyzdinis pavyzdys. Praeities rezultatai negarantuoja ateities rezultatų."
    },
    trust: {
      regulated: "Reguliuojama ir atitinka reikalavimus",
      funds: "Atskirtos klientų lėšos",
      audits: "Nepriklausomi auditai",
      global: "Globalus pasiekiamumas, 24/6 aptarnavimas"
    },
    features: {
      eyebrow: "Kodėl HK Investment",
      titleA: "Sukurta investuotojams, kurie vertina",
      titleB: "discipliną.",
      subtitle: "Jungtiniame institucinės klasės infrastruktūroje su patyrusia žmonių komanda. Jūsų kapitalas valdomas griežtai, ataskaitos teikiamos aiškiai ir saugomos standartais, kurių tikėtumėtės iš rimto turto valdytojo.",
      items: [
        {
          t: "Profesionalus portfelio valdymas",
          b: "Vyresnioji investicijų komanda paskirsto lėšas įvairiose rinkose, siekdama Jūsų tikslų."
        },
        {
          t: "Įvairios investavimo strategijos",
          b: "Kelių turto klasių poveikis Forex, Auksui, Žaliavoms, Indeksams ir Akcijoms."
        },
        {
          t: "Skaidrus ataskaitų teikimas",
          b: "Dieniniai, mėnesiniai ir metiniai ataskaitos – kiekviena pozicija, kiekvienas mokestis."
        },
        {
          t: "Saugus kliento portalas",
          b: "Dviejų faktorių autentifikavimas, užšifruota saugykla, KYC/AML patvirtinta."
        },
        {
          t: "Realaus laiko našumas",
          b: "Tiesioginė prietaisų skydelis su kapitalo kreive, paskirstymu ir rizikos metrikomis."
        },
        {
          t: "Patyrusi komanda",
          b: "Portfelių valdytojai, kvantų specialistai ir rizikos pareigūnai su dešimtmečių patirtimi pasaulinėse rinkose."
        },
        {
          t: "Pažangi rizikos sistema",
          b: "Pozicijų dydžio nustatymas, nuosmukio ribos ir streso testai, įskaičiuoti į kiekvieną strategiją."
        },
        {
          t: "Skirta parama",
          b: "Paskirtas paskyros valdytojas ir prioritetinis ryšių aptarnavimo skyrius."
        }
      ]
    },
    solutions: {
      eyebrow: "Valdomi Portfeliai",
      title: "Trys strategijos. Vienas priežiūros standartas.",
      explore: "Naršyti portfelius",
      popular: "Populiariausia",
      target: "Tikslinis savaitinis pelnas",
      risk: "Rizikos profilis",
      min: "Minimalus",
      withdraw: "Min. pelno atsiėmimas",
      open: "Atidaryti sąskaitą",
      tiers: [
        {
          name: "Konservatyvus",
          risk: "Maža"
        },
        {
          name: "Subalansuotas",
          risk: "Maža"
        },
        {
          name: "Augimas",
          risk: "Didelė"
        }
      ]
    },
    perf: {
      aum: "Valdomas turtas",
      accounts: "Aktyvios klientų sąskaitos",
      tenure: "Vidutinė trukmė (metais)",
      sat: "Klientų pasitenkinimas"
    },
    riskf: {
      eyebrow: "Rizikos valdymas",
      title: "Drausmė yra strategija.",
      subtitle: "Mūsų sistema sukurta remiantis vienu įsitikinimu: ilgalaikė grąža gaunama išvengiant didelių nuostolių. Kiekviena pozicija yra vertinama, stebima ir testuojama streso sąlygomis, atsižvelgiant į iš anksto nustatytus rizikos biudžetus.",
      items: [
        {
          t: "Kapitalo išsaugojimas",
          b: "Kiekviena strategija prasideda nuo priimtino nuostolio apibrėžimo, tada sudaro pozicijas tose ribose."
        },
        {
          t: "Pozicijos dydžio nustatymas",
          b: "Volitalumo koreguotas dydis, pagrįstas strategijos įsitikinimu ir dabartine rinkos situacija."
        },
        {
          t: "Portfelio diversifikacija",
          b: "Nesusijusi ekspozicija per valiutas, metalus, indeksus ir pasirinktas individuales akcijas."
        },
        {
          t: "Nuolatinis stebėjimas",
          b: "24/6 rizikos skyrius, automatiniai įspėjimai ir griežti strategijos lygio nuosmukio stabdžiai."
        },
        {
          t: "Streso testavimas",
          b: "Istoriniai ir hipotetiniai scenarijai vykdomi kas savaitę, siekiant patikrinti atsparumą."
        },
        {
          t: "Rizikos kontrolės priemonės",
          b: "Griežtos svertų, koncentracijos ir susijusios ekspozicijos ribos, įgyvendinamos platformos lygiu."
        }
      ],
      disclaimer: "Visas investavimas susijęs su rizika, įskaitant pagrindinės sumos praradimą. Praeities rezultatai nėra ateities rezultatų rodiklis ir negarantuoja jų."
    },
    security: {
      eyebrow: "Saugumas",
      title: "Apsaugos priemonės, kurias galite patikrinti.",
      subtitle: "Mes saugome klientų kapitalą ir duomenis naudojant daugiasluoksnes saugumo kontrolės priemones, trečiųjų šalių auditus ir nulio pasitikėjimo operacijų modelį.",
      legal: "Teisė ir atitiktis",
      items: [
        {
          t: "Dviejų faktorių autentifikavimas",
          b: "TOTP pagrindo 2FA kiekvienam kliento prisijungimui ir slaptam veiksmui."
        },
        {
          t: "Užšifruoti kliento duomenys",
          b: "AES-256 ramybės būsenoje ir TLS 1.3 perduodant kiekvieną užklausą."
        },
        {
          t: "Saugi debesies infrastruktūra",
          b: "Sustiprinta gamybos aplinka su minimaliomis privilegijomis."
        },
        {
          t: "KYC patikra",
          b: "Tapatybės patikra kiekvienai paskyrai prieš aktyvavimą."
        },
        {
          t: "AML atitiktis",
          b: "Operacijų stebėjimas, atitinkantis tarptautinius standartus."
        },
        {
          t: "Audito žurnalai",
          b: "Nekeičiamas audito takas kiekvienam operaciniam ir sąskaitos įvykiui."
        }
      ]
    },
    portal: {
      eyebrow: "Kliento portalas",
      title: "Jūsų portfelis, skaidrus.",
      access: "Prisijungti prie prietaisų skydelio",
      items: [
        {
          t: "Portfelio apžvalga",
          b: "Balansas, paskirstymas ir P&L viename žvilgsnyje."
        },
        {
          t: "Tiesioginė veiklos apžvalga",
          b: "Interaktyvūs grafikai su dienos ir kumuliaciniais grąžinimo rodikliais."
        },
        {
          t: "Ataskaitos ir ataskaitos",
          b: "Mėnesinės, metinės ir pagal užsakymą PDF ataskaitos."
        },
        {
          t: "Saugus susirašinėjimas",
          b: "Tiesioginis ryšys su Jūsų sąskaitos valdytoju."
        }
      ]
    },
    final: {
      eyebrow: "Pradėkite",
      titleA: "Patikėkite savo kapitalą",
      titleB: "patyrusioms rankoms.",
      cta: "Atidaryti Investicinę Sąskaitą",
      note: "Pasikalbėkite su specialistu apie savo tikslus, terminus ir rizikos toleranciją."
    }
  };

const fi: LandingContent = {
    hero: {
      badge: "Ammattimainen sijoitusten hallinta",
      titleA: "Ammattimainen",
      titleB: "Sijoitusten",
      titleC: "hallinta",
      subtitle: "Kokenutta salkunhoitoa kurinalaisilla riskienhallintatoimilla, läpinäkyvällä raportoinnilla ja asiakaslähtöisellä palvelulla – Forexissä, kullassa, hyödykkeissä, indekseissä ja osakkeissa.",
      ctaOpen: "Avaa sijoitustili",
      ctaAdvisor: "Kopiosijoittaminen",
      ctaLearn: "Kilpailut",
      statAum: "Hallinnoitavat varat (AUM)",
      statClients: "Asiakkaat",
      statCountries: "Maat",
      cardTitle: "Tasapainotettu kasvupotfolio",
      ytd: "YTD",
      live: "Live",
      disclaimer: "Kuvitteellinen esimerkki. Aiempien tulosten perusteella ei voi ennustaa tulevia tuloksia."
    },
    trust: {
      regulated: "Säännelty ja vaatimustenmukainen",
      funds: "Erilliset asiakasvarat",
      audits: "Riippumattomat auditoinnit",
      global: "Globaali ulottuvuus, 24/6 palvelupiste"
    },
    features: {
      eyebrow: "Miksi HK Investment",
      titleA: "Rakennettu sijoittajille, jotka arvostavat",
      titleB: "kurinalaisuutta.",
      subtitle: "Yhdistämme institutionaalisen tason infrastruktuurin kokeneeseen tiimiin. Pääomaasi hallitaan kurinalaisesti, raportoidaan selkeästi ja suojataan sellaisilla standardeilla, joita vakavalta varainhoitajalta odotat.",
      items: [
        {
          t: "Ammattimainen salkunhoito",
          b: "Kokenut sijoitustiimi allokoi varoja eri markkinoille tavoitteidesi saavuttamiseksi."
        },
        {
          t: "Monipuoliset sijoitusstrategiat",
          b: "Monipuolinen altistuminen Forexille, kullalle, hyödykkeille, indekseille ja osakkeille."
        },
        {
          t: "Läpinäkyvä raportointi",
          b: "Päivittäiset, kuukausittaiset ja vuosittaiset tiliotteet – jokainen positio, jokainen palkkio."
        },
        {
          t: "Turvallinen asiakasportaali",
          b: "Kaksivaiheinen todennus, salattu tallennus, KYC/AML todennettu."
        },
        {
          t: "Reaaliaikainen suorituskyky",
          b: "Live-hallintapaneeli pääomakäyrällä, allokaatiolla ja riskimittareilla."
        },
        {
          t: "Kokenut tiimi",
          b: "Salkunhoitajia, kvantti-analyytikoita ja riskienhallinnasta vastaavia, joilla on vuosikymmenien kokemus globaaleilta markkinoilta."
        },
        {
          t: "Kehittynyt riskienhallinnan kehys",
          b: "Pozitioiden koon määrittely, tappiorajojen asettaminen ja stressitestaus sisällytetty jokaiseen strategiaan."
        },
        {
          t: "Dedikoitu tuki",
          b: "Nimetty asiakaspäällikkö ja prioriteettipalvelupiste."
        }
      ]
    },
    solutions: {
      eyebrow: "Hallinnoidut salkut",
      title: "Kolme strategiaa. Yksi hoitostandardi.",
      explore: "Tutustu salkkuihin",
      popular: "Suosituin",
      target: "Viikoittainen tavoitetuotto",
      risk: "Riskiprofiili",
      min: "Minimi",
      withdraw: "Min. voiton nosto",
      open: "Avaa tili",
      tiers: [
        {
          name: "Konservatiivinen",
          risk: "Matala"
        },
        {
          name: "Tasapainotettu",
          risk: "Matala"
        },
        {
          name: "Kasvu",
          risk: "Korkeampi"
        }
      ]
    },
    perf: {
      aum: "Hallinnoitavat varat",
      accounts: "Aktiiviset asiakastilit",
      tenure: "Keskimääräinen asiakkuusaika (vuotta)",
      sat: "Asiakastyytyväisyys"
    },
    riskf: {
      eyebrow: "Riskienhallinta",
      title: "Kurinalaisuus on strategia.",
      subtitle: "Kehyksemme perustuu yhteen uskomukseen: kestävät tuotot syntyvät suurten tappioiden välttämisestä. Jokaisen position koko, seuranta ja stressitestaus tehdään ennalta määriteltyjen riskibudjettien mukaisesti.",
      items: [
        {
          t: "Pääoman säilyttäminen",
          b: "Jokainen strategia alkaa hyväksyttävän tappion määrittelyllä ja rakentaa sitten positioita tämän rajan sisällä."
        },
        {
          t: "Position koon määrittely",
          b: "Volatiliteettiin mukautettu koko, joka perustuu strategian vakaumukseen ja vallitsevaan markkinatilanteeseen."
        },
        {
          t: "Salkun hajautus",
          b: "Korreloimaton altistuminen eri valuutoille, metalleille, indekseille ja valituille yksittäisille osakkeille."
        },
        {
          t: "Jatkuva seuranta",
          b: "24/6 riskivalvontapiste, automatisoidut hälytykset ja kovat stop-tasot strategian tason tappioille."
        },
        {
          t: "Stressitestaus",
          b: "Historialliset ja hypoteettiset skenaariot ajetaan viikoittain kestävyyden vahvistamiseksi."
        },
        {
          t: "Riskisäännöt",
          b: "Kovat rajat velkavivulle, keskittymiselle ja korreloidulle altistumiselle, jotka pannaan täytäntöön alustan tasolla."
        }
      ],
      disclaimer: "Kaikki sijoitukset sisältävät riskin, mukaan lukien pääoman menetyksen. Mennyt kehitys ei ole osoitus eikä takaa tulevia tuloksia."
    },
    security: {
      eyebrow: "Turvallisuus",
      title: "Suojauskeinot, jotka voit tarkistaa.",
      subtitle: "Suojaamme asiakkaiden pääomaa ja tietoja kerroksellisilla turvatoimilla, kolmannen osapuolen auditoinneilla ja nolla luottamuksen (zero-trust) toimintamallilla.",
      legal: "Lakiasiat ja vaatimustenmukaisuus",
      items: [
        {
          t: "Kaksivaiheinen todennus",
          b: "TOTP-pohjainen 2FA jokaisella asiakkaan sisäänkirjautumisella ja herkällä toiminnolla."
        },
        {
          t: "Salattu asiakasdata",
          b: "AES-256 levossa ja TLS 1.3 siirrettäessä jokaista pyyntöä varten."
        },
        {
          t: "Turvallinen pilvi-infrastruktuuri",
          b: "Kovetettu tuotantoympäristö, jossa on vähimmän etuoikeuden pääsy."
        },
        {
          t: "KYC-todennus",
          b: "Identiteetin varmennus joka tilille ennen aktivointia."
        },
        {
          t: "AML-vaatimustenmukaisuus",
          b: "Tapahtumien seuranta kansainvälisten standardien mukaisesti."
        },
        {
          t: "Auditointilokit",
          b: "Muuttumaton tarkistuspolku jokaiselle operatiiviselle ja tilitapahtumalle."
        }
      ]
    },
    portal: {
      eyebrow: "Asiakasportaali",
      title: "Salkkusi, läpinäkyvästi.",
      access: "Kirjaudu hallintapaneeliisi",
      items: [
        {
          t: "Salkun yleiskatsaus",
          b: "Saldo, allokaatio ja P&L yhdellä silmäyksellä."
        },
        {
          t: "Live-suorituskyky",
          b: "Interaktiiviset kaaviot päivittäisillä ja kumulatiivisilla tuotoilla."
        },
        {
          t: "Tiliotteet ja raportit",
          b: "Kuukausittaiset, vuosittaiset ja tilauksesta saatavat PDF-raportit."
        },
        {
          t: "Suojattu viestintä",
          b: "Suora yhteys tilinhoitajaasi."
        }
      ]
    },
    final: {
      eyebrow: "Aloita",
      titleA: "Anna pääomasi",
      titleB: "kokeneisiin käsiin.",
      cta: "Avaa sijoitustili",
      note: "Keskustele asiantuntijan kanssa tavoitteistasi, aikataulustasi ja riskinsietokyvystäsi."
    }
  };

const bg: LandingContent = {
    hero: {
      badge: "Професионално управление на инвестиции",
      titleA: "Професионално",
      titleB: "Управление",
      titleC: "на инвестиции",
      subtitle: "Опитно портфолио управление с дисциплиниран контрол на риска, прозрачно отчитане и ориентирано към клиента обслужване — във Forex, злато, суровини, индекси и акции.",
      ctaOpen: "Открийте инвестиционна сметка",
      ctaAdvisor: "Копи трейдинг",
      ctaLearn: "Състезания",
      statAum: "Активи под управление",
      statClients: "Клиенти",
      statCountries: "Държави",
      cardTitle: "Портфолио за балансиран растеж",
      ytd: "От началото на годината",
      live: "На живо",
      disclaimer: "Илюстративна извадка. Минали резултати не гарантират бъдещи резултати."
    },
    trust: {
      regulated: "Регулиран и съвместим",
      funds: "Сегрегирани клиентски средства",
      audits: "Независими одити",
      global: "Глобален обхват, 24/6 поддръжка"
    },
    features: {
      eyebrow: "Защо HK Investment",
      titleA: "Създадени за инвеститори, които ценят",
      titleB: "дисциплината.",
      subtitle: "Ние съчетаваме инфраструктура от институционален клас с опитен човешки екип. Вашият капитал се управлява стриктно, отчита се ясно и се защитава със стандарти, които бихте очаквали от сериозен мениджър на активи.",
      items: [
        {
          t: "Професионално портфолио управление",
          b: "Старшият инвестиционен екип разпределя средства между пазарите, за да постигне Вашите цели."
        },
        {
          t: "Диверсифицирани инвестиционни стратегии",
          b: "Мулти-активна експозиция във Forex, злато, суровини, индекси и акции."
        },
        {
          t: "Прозрачно отчитане",
          b: "Ежедневни, месечни и годишни извлечения — всяка позиция, всяка такса."
        },
        {
          t: "Сигурен клиентски портал",
          b: "Двуфакторна автентикация, криптирано съхранение, верифициран KYC/AML."
        },
        {
          t: "Производителност в реално време",
          b: "Табло за управление на живо с крива на собствения капитал, разпределение и показатели за риск."
        },
        {
          t: "Опитен екип",
          b: "Портфолио мениджъри, квантове и рискови специалисти с десетилетия опит на световните пазари."
        },
        {
          t: "Разширена рамка за риск",
          b: "Размер на позицията, лимити на спадове и стрес тестове, вградени във всяка стратегия."
        },
        {
          t: "Специализирана поддръжка",
          b: "Определен акаунт мениджър и приоритетна връзка."
        }
      ]
    },
    solutions: {
      eyebrow: "Управлявани портфейли",
      title: "Три стратегии. Един стандарт на грижа.",
      explore: "Разгледайте портфейли",
      popular: "Най-популярен",
      target: "Целева седмична възвръщаемост",
      risk: "Рисков профил",
      min: "Минимум",
      withdraw: "Мин. теглене на печалба",
      open: "Открийте сметка",
      tiers: [
        {
          name: "Консервативен",
          risk: "Нисък"
        },
        {
          name: "Балансиран",
          risk: "Нисък"
        },
        {
          name: "Растеж",
          risk: "По-висок"
        }
      ]
    },
    perf: {
      aum: "Активи под управление",
      accounts: "Активни клиентски сметки",
      tenure: "Среден стаж (години)",
      sat: "Удовлетвореност на клиентите"
    },
    riskf: {
      eyebrow: "Управление на риска",
      title: "Дисциплината е стратегията.",
      subtitle: "Нашата рамка е изградена около едно убеждение: устойчивата възвръщаемост идва от избягването на големи загуби. Всяка позиция се оразмерява, наблюдава и подлага на стрес тестове спрямо предварително зададени рискови бюджети.",
      items: [
        {
          t: "Запазване на капитала",
          b: "Всяка стратегия започва с определяне на приемлива загуба, след което конструира позиции в рамките на този лимит."
        },
        {
          t: "Оразмеряване на позицията",
          b: "Оразмеряване, коригирано спрямо волатилността, въз основа на убедеността в стратегията и текущия пазарен режим."
        },
        {
          t: "Портфолио диверсификация",
          b: "Некорелирана експозиция между валути, метали, индекси и избрани отделни акции."
        },
        {
          t: "Непрекъснат мониторинг",
          b: "24/6 рисков отдел, автоматични сигнали и твърди стопове при спадове на ниво стратегия."
        },
        {
          t: "Стрес тестване",
          b: "Исторически и хипотетични сценарии се изпълняват ежеседмично за валидиране на устойчивостта."
        },
        {
          t: "Контрол на риска",
          b: "Строги лимити за ливъридж, концентрация и корелирана експозиция, прилагани на ниво платформа."
        }
      ],
      disclaimer: "Всички инвестиции носят риск, включително загуба на главницата. Минали резултати не са показателни и не гарантират бъдещи резултати."
    },
    security: {
      eyebrow: "Сигурност",
      title: "Защитни механизми, които можете да проверите.",
      subtitle: "Ние защитаваме клиентския капитал и данни с многослоен контрол на сигурността, одити от трети страни и оперативна позиция с нулева доверие.",
      legal: "Правна информация и съответствие",
      items: [
        {
          t: "Двуфакторна автентикация",
          b: "Двуфакторна автентикация на база TOTP при всяко влизане на клиент и чувствително действие."
        },
        {
          t: "Криптирани клиентски данни",
          b: "AES-256 в покой и TLS 1.3 при предаване за всяка заявка."
        },
        {
          t: "Сигурна облачна инфраструктура",
          b: "Закавана производствена среда с достъп с най-малко привилегии."
        },
        {
          t: "KYC верификация",
          b: "Верификация на самоличността за всяка сметка преди активиране."
        },
        {
          t: "AML съответствие",
          b: "Мониторинг на транзакциите в съответствие с международните стандарти."
        },
        {
          t: "Одиторски дневници",
          b: "Неизменяем одиторски регистър за всяко оперативно и акаунт събитие."
        }
      ]
    },
    portal: {
      eyebrow: "Клиентски портал",
      title: "Вашето портфолио, прозрачно.",
      access: "Достъп до Вашето табло за управление",
      items: [
        {
          t: "Преглед на портфолиото",
          b: "Баланс, разпределение и P&L с един поглед."
        },
        {
          t: "Производителност на живо",
          b: "Интерактивни графики с дневна и кумулативна възвръщаемост."
        },
        {
          t: "Извлечения и отчети",
          b: "Месечни, годишни и PDF отчети по заявка."
        },
        {
          t: "Сигурни съобщения",
          b: "Пряка връзка с Вашия акаунт мениджър."
        }
      ]
    },
    final: {
      eyebrow: "Започнете",
      titleA: "Поставете капитала си в",
      titleB: "опитни ръце.",
      cta: "Открийте инвестиционна сметка",
      note: "Разговаряйте със специалист относно Вашите цели, времеви хоризонт и толерантност към риск."
    }
  };

const ro: LandingContent = {
    hero: {
      badge: "Management Profesional de Investiții",
      titleA: "Management",
      titleB: "Profesional",
      titleC: "Investițional",
      subtitle: "Management de portofoliu experimentat, cu controale riguroase ale riscului, raportare transparentă și servicii centrate pe client – pentru Forex, Aur, Mărfuri, Indici și Acțiuni.",
      ctaOpen: "Deschide Cont de Investiții",
      ctaAdvisor: "Copiere Tranzacții",
      ctaLearn: "Competiții",
      statAum: "Active în Administrare",
      statClients: "Clienți",
      statCountries: "Țări",
      cardTitle: "Portofoliu Ecuilibrat de Creștere",
      ytd: "An până în Prezent",
      live: "În direct",
      disclaimer: "Exemplu ilustrativ. Performanța trecută nu garantează rezultatele viitoare."
    },
    trust: {
      regulated: "Reglementat și conform",
      funds: "Fonduri client segregate",
      audits: "Audituri independente",
      global: "Acoperire globală, asistență 24/6"
    },
    features: {
      eyebrow: "De ce HK Investment",
      titleA: "Construit pentru investitorii care prețuiesc",
      titleB: "disciplina.",
      subtitle: "Combinăm o infrastructură de nivel instituțional cu o echipă umană experimentată. Capitalul dumneavoastră este gestionat cu rigoare, raportat cu claritate și protejat la standardele pe care le-ați aștepta de la un manager de active serios.",
      items: [
        {
          t: "Management profesional de portofoliu",
          b: "O echipă de investiții senior alocă fonduri pe piețe pentru a vă atinge obiectivele."
        },
        {
          t: "Strategii de investiții diversificate",
          b: "Expunere multi-asset pe Forex, Aur, Mărfuri, Indici și Acțiuni."
        },
        {
          t: "Raportare transparentă",
          b: "Extrase zilnice, lunare și anuale – fiecare poziție, fiecare comision."
        },
        {
          t: "Portal client securizat",
          b: "Autentificare cu doi factori, stocare criptată, verificare KYC/AML."
        },
        {
          t: "Performanță în timp real",
          b: "Tablou de bord live cu curba capitalului, alocare și metrici de risc."
        },
        {
          t: "Echipă experimentată",
          b: "Manageri de portofoliu, analiști cantitativi și ofițeri de risc cu decenii de experiență pe piețele globale."
        },
        {
          t: "Cadrul avansat de risc",
          b: "Dimensionarea pozițiilor, limite de drawdown și teste de stres integrate în fiecare strategie."
        },
        {
          t: "Suport dedicat",
          b: "Manager de cont dedicat și birou de relații prioritare."
        }
      ]
    },
    solutions: {
      eyebrow: "Portofolii Gestionate",
      title: "Trei strategii. Un standard de grijă.",
      explore: "Explorează portofoliile",
      popular: "Cel mai popular",
      target: "Rentabilitate săptămânală țintă",
      risk: "Profil de risc",
      min: "Minim",
      withdraw: "Retragere minimă profit",
      open: "Deschide cont",
      tiers: [
        {
          name: "Conservator",
          risk: "Redus"
        },
        {
          name: "Echilibrat",
          risk: "Redus"
        },
        {
          name: "Creștere",
          risk: "Mai ridicat"
        }
      ]
    },
    perf: {
      aum: "Active sub administrare",
      accounts: "Conturi active de clienți",
      tenure: "Vechime medie (ani)",
      sat: "Satisfacția clienților"
    },
    riskf: {
      eyebrow: "Managementul Riscului",
      title: "Disciplina este strategia.",
      subtitle: "Cadrul nostru este construit în jurul unei convingeri: randamentele durabile provin din evitarea pierderilor mari. Fiecare poziție este dimensionată, monitorizată și supusă unor teste de stres în raport cu bugete de risc predefinite.",
      items: [
        {
          t: "Conservarea capitalului",
          b: "Fiecare strategie începe prin definirea pierderii acceptabile, apoi construiește poziții în cadrul acestei limite."
        },
        {
          t: "Dimensionarea poziției",
          b: "Dimensionare ajustată la volatilitate bazată pe convingerea strategiei și pe regimul actual al pieței."
        },
        {
          t: "Diversificarea portofoliului",
          b: "Expunere necorelată pe valute, metale, indici și anumite titluri individuale selectate."
        },
        {
          t: "Monitorizare continuă",
          b: "Birou de risc 24/6, alerte automate și opriri forțate pentru scăderile la nivel de strategie."
        },
        {
          t: "Testare la stres",
          b: "Scenarii istorice și ipotetice rulate săptămânal pentru a valida rezistența."
        },
        {
          t: "Controale de risc",
          b: "Limite stricte privind levierul, concentrarea și expunerea corelată, aplicate la nivel de platformă."
        }
      ],
      disclaimer: "Toate investițiile implică riscuri, inclusiv pierderea capitalului. Performanța trecută nu este indicativă și nu garantează rezultatele viitoare."
    },
    security: {
      eyebrow: "Securitate",
      title: "Bariere de protecție pe care le puteți verifica.",
      subtitle: "Protejăm capitalul și datele clienților cu controale de securitate stratificate, audituri terțe și o postură operațională de încredere zero.",
      legal: "Legale și conformitate",
      items: [
        {
          t: "Autentificare cu doi factori",
          b: "2FA bazat pe TOTP la fiecare conectare a clientului și acțiune sensibilă."
        },
        {
          t: "Date client criptate",
          b: "AES-256 în repaus și TLS 1.3 în tranzit pentru fiecare solicitare."
        },
        {
          t: "Infrastructură cloud securizată",
          b: "Mediu de producție fortificat cu acces cu cele mai mici privilegii."
        },
        {
          t: "Verificare KYC",
          b: "Verificarea identității pentru fiecare cont înainte de activare."
        },
        {
          t: "Conformitate AML",
          b: "Monitorizarea tranzacțiilor în conformitate cu standardele internaționale."
        },
        {
          t: "Jurnale de audit",
          b: "Pistă de audit imutabilă pentru fiecare eveniment operațional și de cont."
        }
      ]
    },
    portal: {
      eyebrow: "Portal Client",
      title: "Portofoliul tău, transparent.",
      access: "Accesează-ți tabloul de bord",
      items: [
        {
          t: "Prezentare generală portofoliu",
          b: "Sold, alocare și P&L dintr-o privire."
        },
        {
          t: "Performanță live",
          b: "Grafice interactive cu randamente zilnice și cumulative."
        },
        {
          t: "Extrase și rapoarte",
          b: "Rapoarte PDF lunare, anuale și la cerere."
        },
        {
          t: "Mesagerie securizată",
          b: "Linie directă către managerul contului tău."
        }
      ]
    },
    final: {
      eyebrow: "Începe acum",
      titleA: "Pune-ți capitalul în",
      titleB: "mâini experimentate.",
      cta: "Deschide Cont de Investiții",
      note: "Discută cu un specialist despre obiectivele tale, orizontul de timp și toleranța la risc."
    }
  };

const no: LandingContent = {
    hero: {
      badge: "Profesjonell investeringsforvaltning",
      titleA: "Profesjonell",
      titleB: "Investering",
      titleC: "Forvaltning",
      subtitle: "Erfaren porteføljeforvaltning med disiplinert risikokontroll, transparent rapportering og kundefokusert service – på tvers av Forex, gull, råvarer, indekser og aksjer.",
      ctaOpen: "Åpne investeringskonto",
      ctaAdvisor: "Kopihandel",
      ctaLearn: "Konkurranser",
      statAum: "Forvaltningskapital",
      statClients: "Kunder",
      statCountries: "Land",
      cardTitle: "Balansert vekstportefølje",
      ytd: "YTD",
      live: "Live",
      disclaimer: "Illustrativt eksempel. Tidligere resultater garanterer ikke fremtidige resultater."
    },
    trust: {
      regulated: "Regulert og etterrettelig",
      funds: "Segregerte klientmidler",
      audits: "Uavhengige revisjoner",
      global: "Global rekkevidde, 24/6 desk"
    },
    features: {
      eyebrow: "Hvorfor HK Investment",
      titleA: "Bygget for investorer som verdsetter",
      titleB: "disiplin.",
      subtitle: "Vi kombinerer infrastruktur av institusjonell kvalitet med et erfarent menneskelig team. Kapitalen din forvaltes med stringens, rapporteres med klarhet og sikres med de standardene du forventer av en seriøs kapitalforvalter.",
      items: [
        {
          t: "Profesjonell porteføljeforvaltning",
          b: "Et senior investeringsteam allokerer på tvers av markeder for å forfølge dine mål."
        },
        {
          t: "Diversifiserte investeringsstrategier",
          b: "Multi-aktiva eksponering på tvers av Forex, gull, råvarer, indekser og aksjer."
        },
        {
          t: "Transparent rapportering",
          b: "Daglige, månedlige og årlige rapporter – hver posisjon, hver avgift."
        },
        {
          t: "Sikker klientportal",
          b: "To-faktor autentisering, kryptert lagring, KYC/AML verifisert."
        },
        {
          t: "Sanntidsavkastning",
          b: "Live dashbord med equity curve, allokering og risikomål."
        },
        {
          t: "Erfarent team",
          b: "Porteføljeforvaltere, kvantitative analytikere og risikostyrere med tiår i globale markeder."
        },
        {
          t: "Avansert risikorammeverk",
          b: "Posisjonsstørrelse, drawdown-grenser og stresstester bakt inn i hver strategi."
        },
        {
          t: "Dedikert støtte",
          b: "Navngitt kontoadministrator og prioritert kundebehandler."
        }
      ]
    },
    solutions: {
      eyebrow: "Forvaltede porteføljer",
      title: "Tre strategier. Én standard for omsorg.",
      explore: "Utforsk porteføljer",
      popular: "Mest populær",
      target: "Målrettet ukentlig avkastning",
      risk: "Risikoprofil",
      min: "Minimum",
      withdraw: "Min. uttatt fortjeneste",
      open: "Åpne konto",
      tiers: [
        {
          name: "Konservativ",
          risk: "Lav"
        },
        {
          name: "Balansert",
          risk: "Lav"
        },
        {
          name: "Vekst",
          risk: "Høyere"
        }
      ]
    },
    perf: {
      aum: "Forvaltningskapital",
      accounts: "Aktive klientkontoer",
      tenure: "Gjennomsnittlig ansettelsestid (år)",
      sat: "Klienttilfredshet"
    },
    riskf: {
      eyebrow: "Risikostyring",
      title: "Disiplin er strategien.",
      subtitle: "Vårt rammeverk er bygget rundt én overbevisning: varig avkastning kommer fra å unngå store tap. Hver posisjon blir størrelsesbestemt, overvåket og stresstestet mot forhåndsdefinerte risikobudsjetter.",
      items: [
        {
          t: "Kapitalbevaring",
          b: "Hver strategi starter med å definere akseptabelt tap, og konstruerer deretter posisjoner innenfor den grensen."
        },
        {
          t: "Posisjonsstørrelse",
          b: "Volatilitetsjustert sizing basert på strategikonviksjon og gjeldende markedsregime."
        },
        {
          t: "Porteføljediversifisering",
          b: "Ukorrelert eksponering på tvers av valutaer, metaller, indekser og utvalgte enkeltaksjer."
        },
        {
          t: "Kontinuerlig overvåking",
          b: "24/6 risikodesk, automatiserte varsler og harde stopp på drawdown på strateginivå."
        },
        {
          t: "Stresstest",
          b: "Historiske og hypotetiske scenarioer kjøres ukentlig for å validere robusthet."
        },
        {
          t: "Risikokontroller",
          b: "Hardgrenser for giring, konsentrasjon og korrelert eksponering, håndhevet på plattformnivå."
        }
      ],
      disclaimer: "All investering innebærer risiko, inkludert tap av hovedstol. Tidligere resultater er ikke en indikasjon på, og garanterer ikke, fremtidige resultater."
    },
    security: {
      eyebrow: "Sikkerhet",
      title: "Sikkerhetsmekanismer du kan bekrefte.",
      subtitle: "Vi beskytter klientkapital og data med lagdelt sikkerhetskontroll, tredjepartsrevisjoner og en zero-trust operasjonell holdning.",
      legal: "Juridisk og overholdelse",
      items: [
        {
          t: "To-faktor autentisering",
          b: "TOTP-basert 2FA på hver klientpålogging og sensitive handlinger."
        },
        {
          t: "Krypterte klientdata",
          b: "AES-256 i hvile og TLS 1.3 under overføring for hver forespørsel."
        },
        {
          t: "Sikker skynetworkinfrastruktur",
          b: "Herdet produksjonsmiljø med minst-privilegium-tilgang."
        },
        {
          t: "KYC-verifisering",
          b: "Identitetsbekreftelse på hver konto før aktivering."
        },
        {
          t: "AML-overholdelse",
          b: "Transaksjonsovervåking i tråd med internasjonale standarder."
        },
        {
          t: "Revisjonslogger",
          b: "Uforanderlig revisjonsspor for hver operasjonell og kontohendelse."
        }
      ]
    },
    portal: {
      eyebrow: "Klientportal",
      title: "Din portefølje, transparent.",
      access: "Få tilgang til dashbordet ditt",
      items: [
        {
          t: "Porteføljeoversikt",
          b: "Balansestatus, allokering og P&L på ett øyeblikk."
        },
        {
          t: "Live avkastning",
          b: "Interaktive diagrammer med daglig og kumulativ avkastning."
        },
        {
          t: "Erklæringer og rapporter",
          b: "Månedlige, årlige og on-demand PDF-rapporter."
        },
        {
          t: "Sikker meldingsfunksjon",
          b: "Direkte linje til din kontoadministrator."
        }
      ]
    },
    final: {
      eyebrow: "Kom i gang",
      titleA: "Sett kapitalen din i",
      titleB: "erfarne hender.",
      cta: "Åpne investeringskonto",
      note: "Snakk med en spesialist om dine mål, tidslinje og risikotoleranse."
    }
  };

const et: LandingContent = {
    hero: {
      badge: "Professionaalne investeeringute haldamine",
      titleA: "Professionaalne",
      titleB: "Investeeringute",
      titleC: "Haldamine",
      subtitle: "Kogenud portfellihaldus distsiplineeritud riskikontrollide, läbipaistva aruandluse ja kliendikeskse teenindusega – Forexil, Kuld, toorained, indeksid ja aktsiad.",
      ctaOpen: "Ava investeerimiskonto",
      ctaAdvisor: "Kopeerimistrading",
      ctaLearn: "Võistlused",
      statAum: "Hallatavad varad",
      statClients: "Kliendid",
      statCountries: "Riigid",
      cardTitle: "Tasakaalustatud kasvuportfell",
      ytd: "Aasta algusest",
      live: "Reaalajas",
      disclaimer: "Illustreeriv näide. Varasem tootlus ei garanteeri tulevasi tulemusi."
    },
    trust: {
      regulated: "Reguleeritud ja nõuetele vastav",
      funds: "Eraldatud kliendifondid",
      audits: "Sõltumatud auditid",
      global: "Globaalne haare, 24/6 teenindus"
    },
    features: {
      eyebrow: "Miks HK Investment?",
      titleA: "Loodud investoritele, kes hindavad",
      titleB: "distsipliini.",
      subtitle: "Ühendame institutsionaalse taseme infrastruktuuri kogenud inimestest koosneva meeskonnaga. Teie kapitali juhitakse rangelt, sellest antakse selget aru ja see on kaitstud standarditega, mida ootate tõsiselt varahaldurilt.",
      items: [
        {
          t: "Professionaalne portfellihaldus",
          b: "Kogenud investeerimisrühm jaotab vahendeid turgude vahel teie eesmärkide saavutamiseks."
        },
        {
          t: "Mitmekesised investeerimisstrateegiad",
          b: "Vara liigi ekspositsioon Forexil, Kuld, toorained, indeksid ja aktsiad."
        },
        {
          t: "Läbipaistev aruandlus",
          b: "Päevased, kuu- ja aastaaruanded – iga positsioon, iga tasu."
        },
        {
          t: "Turvaline kliendiportaal",
          b: "Kahefaktoriline autentimine, krüpteeritud salvestus, KYC/AML kontrollitud."
        },
        {
          t: "Reaalajas toimivus",
          b: "Reaalajas armatuurlaud kapitalikõveraga, jaotuse ja riskimõõdikutega."
        },
        {
          t: "Kogenud meeskond",
          b: "Portfellihaldurid, kvandispetsialistid ja riskiohvitserid aastakümnete pikkuse kogemusega globaalsetel turgudel."
        },
        {
          t: "Täiustatud riskiraamistik",
          b: "Positsioonide suuruse määramine, languste piirangud ja stressitestid on sisse ehitatud igasse strateegiasse."
        },
        {
          t: "Pühendatud tugi",
          b: "Nimetatud kontohaldur ja prioriteetne suhtluslaud."
        }
      ]
    },
    solutions: {
      eyebrow: "Hallatavad portfellid",
      title: "Kolm strateegiat. ÜKS hoolduse tase.",
      explore: "Uurige portfelle",
      popular: "Kõige populaarsem",
      target: "Eesmärk nädalane tootlus",
      risk: "Riskiprofiil",
      min: "Minimaalne",
      withdraw: "Min. kasumi väljavõtmine",
      open: "Ava konto",
      tiers: [
        {
          name: "Konservatiivne",
          risk: "Madal"
        },
        {
          name: "Tasakaalustatud",
          risk: "Madal"
        },
        {
          name: "Kasv",
          risk: "Kõrgem"
        }
      ]
    },
    perf: {
      aum: "Hallatavad varad",
      accounts: "Aktiivsed kliendikontod",
      tenure: "Keskmine teenistusaeg (aastat)",
      sat: "Klientide rahulolu"
    },
    riskf: {
      eyebrow: "Riski juhtimine",
      title: "Distsipliin on strateegia.",
      subtitle: "Meie raamistik põhineb ühel veendumusel: püsiv tootlus tuleneb suurte kahjude vältimisest. Iga positsiooni suurus määratakse, seda jälgitakse ja testitakse eelnevalt määratletud riske arvestades.",
      items: [
        {
          t: "Kapitali säilitamine",
          b: "Iga strateegia algab vastuvõetava kahju määratlemisest, seejärel konstrueeritakse positsioonid selle piiri piires."
        },
        {
          t: "Positsiooni suuruse määramine",
          b: "Volatiilsusega korrigeeritud suurus, mis põhineb strateegia veendumusel ja praegusel tururežiimil."
        },
        {
          t: "Portfelli mitmekesistamine",
          b: "Korreleerimata kokkupuude valuutade, metallide, indeksite ja valitud üksikute nimedega."
        },
        {
          t: "Pidev jälgimine",
          b: "24/6 riskilaud, automatiseeritud hoiatused ja kõvad piirangud strateegiatasandi languste korral."
        },
        {
          t: "Stressitestimine",
          b: "Ajaloolised ja hüpoteetilised stsenaariumid, mida kontrollitakse iganädalaselt vastupidavuse kinnitamiseks."
        },
        {
          t: "Riskikontrollid",
          b: "Rangad piirangud võimendusele, kontsentratsioonile ja korreleeritud riskipositsioonidele, mida rakendatakse platvormitasandil."
        }
      ],
      disclaimer: "Kõik investeeringud sisaldavad riski, sealhulgas põhiosa kaotuse riski. Varasem tootlus ei ole tulevaste tulemuste näitaja ega garantii."
    },
    security: {
      eyebrow: "Turvalisus",
      title: "Piirangud, mida saate kontrollida.",
      subtitle: "Kaitseme klientide kapitali ja andmeid mitmetasandiliste turvakontrollide, kolmanda osapoole auditite ja null-usaldusväärsuse põhimõtte alusel.",
      legal: "Õigus ja vastavus",
      items: [
        {
          t: "Kahefaktoriline autentimine",
          b: "TOTP-põhine 2FA igal kliendi sisselogimisel ja tundlikul tegevusel."
        },
        {
          t: "Krüpteeritud kliendiandmed",
          b: "AES-256 puhkeolekus ja TLS 1.3 edastusel iga päringu jaoks."
        },
        {
          t: "Turvaline pilve infrastruktuur",
          b: "Karastatud tootmiskeskkond vähimate privileegidega juurdepääsuga."
        },
        {
          t: "KYC verifitseerimine",
          b: "Isiku tuvastamine igal kontol enne aktiveerimist."
        },
        {
          t: "AML vastavus",
          b: "Tehingute jälgimine kooskõlas rahvusvaheliste standarditega."
        },
        {
          t: "Auditilogid",
          b: "Muutumatu auditeerimisjälgede säilitamine igale operatsioonilisele ja kontosündmusele."
        }
      ]
    },
    portal: {
      eyebrow: "Kliendiportaal",
      title: "Teie portfell, läbipaistvalt.",
      access: "Juurdepääs oma armatuurlauale",
      items: [
        {
          t: "Portfelli ülevaade",
          b: "Saldo, jaotus ja P&L ühe pilguga."
        },
        {
          t: "Reaalajas toimivus",
          b: "Interaktiivsed graafikud igapäevaste ja kumulatiivsete tootlustega."
        },
        {
          t: "Aruanded ja raportid",
          b: "Kuu-, aastased ja nõudmisel PDF-aruanded."
        },
        {
          t: "Turvaline sõnumivahetus",
          b: "Otseühendus teie kontohalduriga."
        }
      ]
    },
    final: {
      eyebrow: "Alusta",
      titleA: "Pange oma kapital",
      titleB: "kogenud kätesse.",
      cta: "Ava investeerimiskonto",
      note: "Rääkige spetsialistiga oma eesmärkidest, ajakavast ja risktaluvusest."
    }
  };

const hr: LandingContent = {
    hero: {
      badge: "Profesionalno upravljanje investicijama",
      titleA: "Profesionalno",
      titleB: "Investicijsko",
      titleC: "Upravljanje",
      subtitle: "Iskusno upravljanje portfeljem s discipliniranim kontrolama rizika, transparentnim izvještavanjem i uslugom usmjerenom na klijenta — u Forexu, Zlatu, Robi, Indeksima i Dionice.",
      ctaOpen: "Otvorite investicijski račun",
      ctaAdvisor: "Kopiranje trgovanja",
      ctaLearn: "Natjecanja",
      statAum: "Imovina pod upravljanjem",
      statClients: "Klijenti",
      statCountries: "Zemlje",
      cardTitle: "Uravnoteženi rast portfelja",
      ytd: "Od početka godine",
      live: "Uživo",
      disclaimer: "Ilustrativni primjer. Prošli rezultati ne jamče buduće rezultate."
    },
    trust: {
      regulated: "Regulirano i usklađeno",
      funds: "Odvojena sredstva klijenata",
      audits: "Neovisne revizije",
      global: "Globalni doseg, 24/6 desk"
    },
    features: {
      eyebrow: "Zašto HK Investment",
      titleA: "Građeno za ulagače koji cijene",
      titleB: "disciplinu.",
      subtitle: "Kombiniramo institucionalnu infrastrukturu s iskusnim ljudskim timom. Vaš kapital se upravlja rigorozno, izvještava jasno i štiti prema standardima koje biste očekivali od ozbiljnog upravitelja imovinom.",
      items: [
        {
          t: "Profesionalno upravljanje portfeljem",
          b: "Viši investicijski tim raspoređuje sredstva na tržištima kako bi ostvario vaše ciljeve."
        },
        {
          t: "Diversificirane investicijske strategije",
          b: "Multi-asset izloženost kroz Forex, Zlato, Robu, Indekse i Dionice."
        },
        {
          t: "Transparentno izvještavanje",
          b: "Dnevni, mjesečni i godišnji izvještaji — svaka pozicija, svaka naknada."
        },
        {
          t: "Siguran klijentski portal",
          b: "Dvofaktorska autentifikacija, šifrirana pohrana, KYC/AML provjereno."
        },
        {
          t: "Performanse u stvarnom vremenu",
          b: "Kontrolna ploča uživo s krivuljom kapitala, alokacijom i metrikama rizika."
        },
        {
          t: "Iskusan tim",
          b: "Portfelj menadžeri, kvantitativni analitičari i službenici za rizik s desetljećima iskustva na globalnim tržištima."
        },
        {
          t: "Napredni okvir rizika",
          b: "Veličina pozicije, ograničenja povlačenja i stres testovi ugrađeni u svaku strategiju."
        },
        {
          t: "Posvećena podrška",
          b: "Dodijeljeni voditelj računa i prioritetni odjel za odnose s klijentima."
        }
      ]
    },
    solutions: {
      eyebrow: "Upravljani portfelji",
      title: "Tri strategije. Jedan standard skrbi.",
      explore: "Istražite portfelje",
      popular: "Najpopularnije",
      target: "Ciljani tjedni prinos",
      risk: "Profil rizika",
      min: "Minimum",
      withdraw: "Min. isplata dobiti",
      open: "Otvorite račun",
      tiers: [
        {
          name: "Konzervativno",
          risk: "Nisko"
        },
        {
          name: "Uravnoteženo",
          risk: "Nisko"
        },
        {
          name: "Rast",
          risk: "Više"
        }
      ]
    },
    perf: {
      aum: "Imovina pod upravljanjem",
      accounts: "Aktivni klijentski računi",
      tenure: "Prosječno trajanje (god.)",
      sat: "Zadovoljstvo klijenata"
    },
    riskf: {
      eyebrow: "Upravljanje rizikom",
      title: "Disciplina je strategija.",
      subtitle: "Naš okvir temelji se na jednom uvjerenju: trajni povrati proizlaze iz izbjegavanja velikih gubitaka. Svaka pozicija je dimenzionirana, praćena i podvrgnuta stres testovima u skladu s unaprijed definiranim proračunima rizika.",
      items: [
        {
          t: "Očuvanje kapitala",
          b: "Svaka strategija započinje definiranjem prihvatljivog gubitka, a zatim konstruira pozicije unutar tog ograničenja."
        },
        {
          t: "Određivanje veličine pozicije",
          b: "Određivanje veličine prilagođeno volatilnosti na temelju uvjerenja strategije i trenutnog tržišnog režima."
        },
        {
          t: "Diversifikacija portfelja",
          b: "Nepovezana izloženost valutama, metalima, indeksima i odabranim pojedinačnim dionicama."
        },
        {
          t: "Kontinuirano praćenje",
          b: "24/6 desk za rizik, automatska upozorenja i čvrste granice na povlačenja na razini strategije."
        },
        {
          t: "Stres testiranje",
          b: "Povijesni i hipotetski scenariji provode se tjedno kako bi se potvrdila otpornost."
        },
        {
          t: "Kontrole rizika",
          b: "Čvrsta ograničenja na polugu, koncentraciju i koreliranu izloženost, primijenjena na razini platforme."
        }
      ],
      disclaimer: "Sva ulaganja uključuju rizik, uključujući gubitak glavnice. Prošli rezultati nisu pokazatelj i ne jamče buduće rezultate."
    },
    security: {
      eyebrow: "Sigurnost",
      title: "Sigurnosni mehanizmi koje možete provjeriti.",
      subtitle: "Štitimo kapital i podatke klijenata slojevitim sigurnosnim kontrolama, revizijama trećih strana i operativnim stavom nula povjerenja.",
      legal: "Pravno i usklađenost",
      items: [
        {
          t: "Dvofaktorska autentifikacija",
          b: "TOTP-bazirana 2FA na svakoj prijavi klijenta i osjetljivoj radnji."
        },
        {
          t: "Šifrirani podaci klijenta",
          b: "AES-256 u mirovanju i TLS 1.3 u prijenosu za svaki zahtjev."
        },
        {
          t: "Sigurna infrastruktura u oblaku",
          b: "Ojačano proizvodno okruženje s najmanjim privilegijama pristupa."
        },
        {
          t: "KYC verifikacija",
          b: "Provjera identiteta na svakom računu prije aktivacije."
        },
        {
          t: "AML usklađenost",
          b: "Praćenje transakcija usklađeno s međunarodnim standardima."
        },
        {
          t: "Revizijski zapisi",
          b: "Nepromjenjivi revizijski trag za svaki operativni i računski događaj."
        }
      ]
    },
    portal: {
      eyebrow: "Klijentski portal",
      title: "Vaš portfelj, transparentan.",
      access: "Pristupite svojoj kontrolnoj ploči",
      items: [
        {
          t: "Pregled portfelja",
          b: "Stanje, alokacija i P&L na prvi pogled."
        },
        {
          t: "Performanse uživo",
          b: "Interaktivni grafikoni s dnevnim i kumulativnim prinosima."
        },
        {
          t: "Izvještaji i izvješća",
          b: "Mjesečna, godišnja i na zahtjev PDF izvješća."
        },
        {
          t: "Sigurno slanje poruka",
          b: "Izravna linija s vašim voditeljem računa."
        }
      ]
    },
    final: {
      eyebrow: "Započnite",
      titleA: "Uložite svoj kapital u",
      titleB: "iskusne ruke.",
      cta: "Otvorite investicijski račun",
      note: "Razgovarajte sa stručnjakom o svojim ciljevima, vremenskom okviru i toleranciji na rizik."
    }
  };

const ru: LandingContent = {
    hero: {
      badge: "Профессиональное управление инвестициями",
      titleA: "Профессиональное",
      titleB: "Управление",
      titleC: "Инвестициями",
      subtitle: "Опытное управление портфелем с дисциплинированным контролем рисков, прозрачной отчетностью и клиентоориентированным обслуживанием — на рынках Forex, золота, сырьевых товаров, индексов и акций.",
      ctaOpen: "Открыть инвестиционный счет",
      ctaAdvisor: "Копитрейдинг",
      ctaLearn: "Соревнования",
      statAum: "AUM",
      statClients: "Клиенты",
      statCountries: "Страны",
      cardTitle: "Сбалансированный портфель роста",
      ytd: "YTD",
      live: "Онлайн",
      disclaimer: "Иллюстративный пример. Прошлые результаты не гарантируют будущих."
    },
    trust: {
      regulated: "Регулируется и соответствует требованиям",
      funds: "Сегрегированные средства клиентов",
      audits: "Независимые аудиты",
      global: "Глобальный охват, работа 24/6"
    },
    features: {
      eyebrow: "Почему HK Investment",
      titleA: "Создано для инвесторов, ценящих",
      titleB: "дисциплину.",
      subtitle: "Мы сочетаем инфраструктуру институционального уровня с опытной человеческой командой. Ваш капитал управляется со всей строгостью, с ясностью отчитывается и защищается в соответствии со стандартами, которые вы ожидаете от серьезного управляющего активами.",
      items: [
        {
          t: "Профессиональное управление портфелем",
          b: "Опытная инвестиционная команда распределяет средства по рынкам для достижения ваших целей."
        },
        {
          t: "Диверсифицированные инвестиционные стратегии",
          b: "Мультиактивное воздействие на рынки Forex, золота, сырьевых товаров, индексов и акций."
        },
        {
          t: "Прозрачная отчетность",
          b: "Ежедневные, ежемесячные и годовые отчеты — каждая позиция, каждая комиссия."
        },
        {
          t: "Безопасный клиентский портал",
          b: "Двухфакторная аутентификация, зашифрованное хранение, верификация KYC/AML."
        },
        {
          t: "Производительность в реальном времени",
          b: "Дашборд в режиме реального времени с кривой капитала, распределением и метриками риска."
        },
        {
          t: "Опытная команда",
          b: "Управляющие портфелями, кванта и риск-менеджеры с десятилетиями опыта на мировых рынках."
        },
        {
          t: "Продвинутая система рисков",
          b: "Расчет размера позиций, лимиты просадок и стресс-тесты, встроенные в каждую стратегию."
        },
        {
          t: "Выделенная поддержка",
          b: "Персональный менеджер по работе с клиентами и приоритетный отдел по связям."
        }
      ]
    },
    solutions: {
      eyebrow: "Управляемые портфели",
      title: "Три стратегии. Один стандарт обслуживания.",
      explore: "Изучить портфели",
      popular: "Самый популярный",
      target: "Целевая недельная доходность",
      risk: "Профиль риска",
      min: "Минимум",
      withdraw: "Мин. вывод прибыли",
      open: "Открыть счет",
      tiers: [
        {
          name: "Консервативный",
          risk: "Низкий"
        },
        {
          name: "Сбалансированный",
          risk: "Низкий"
        },
        {
          name: "Рост",
          risk: "Выше"
        }
      ]
    },
    perf: {
      aum: "Активы под управлением",
      accounts: "Активные клиентские счета",
      tenure: "Средний стаж (лет)",
      sat: "Удовлетворенность клиентов"
    },
    riskf: {
      eyebrow: "Управление рисками",
      title: "Дисциплина — это стратегия.",
      subtitle: "Наша система основана на одном убеждении: устойчивая доходность достигается за счет предотвращения крупных потерь. Каждая позиция рассчитывается, контролируется и проходит стресс-тестирование в соответствии с заранее определенными бюджетными рисками.",
      items: [
        {
          t: "Сохранение капитала",
          b: "Каждая стратегия начинается с определения допустимых потерь, а затем строит позиции в рамках этого лимита."
        },
        {
          t: "Расчет размера позиции",
          b: "Расчет размера с поправкой на волатильность, основанный на убежденности стратегии и текущем рыночном режиме."
        },
        {
          t: "Диверсификация портфеля",
          b: "Некоррелированное воздействие на валюты, металлы, индексы и отдельные наименования."
        },
        {
          t: "Непрерывный мониторинг",
          b: "Операционный отдел рисков 24/6, автоматические оповещения и жесткие стопы на уровне стратегии по просадкам."
        },
        {
          t: "Стресс-тестирование",
          b: "Исторические и гипотетические сценарии выполняются еженедельно для проверки устойчивости."
        },
        {
          t: "Контроль рисков",
          b: "Жесткие лимиты на кредитное плечо, концентрацию и коррелированное воздействие, применяемые на уровне платформы."
        }
      ],
      disclaimer: "Все инвестиции сопряжены с риском, включая потерю основного капитала. Прошлые результаты не являются показателем и не гарантируют будущих результатов."
    },
    security: {
      eyebrow: "Безопасность",
      title: "Защита, которую вы можете проверить.",
      subtitle: "Мы защищаем капитал и данные клиентов с помощью многоуровневых средств контроля безопасности, сторонних аудитов и операционной политики нулевого доверия.",
      legal: "Юридические вопросы и соответствие требованиям",
      items: [
        {
          t: "Двухфакторная аутентификация",
          b: "Двухфакторная аутентификация на основе TOTP при каждом входе клиента и чувствительном действии."
        },
        {
          t: "Зашифрованные клиентские данные",
          b: "AES-256 в состоянии покоя и TLS 1.3 при передаче для каждого запроса."
        },
        {
          t: "Безопасная облачная инфраструктура",
          b: "Укрепленная производственная среда с минимальными привилегиями доступа."
        },
        {
          t: "Верификация KYC",
          b: "Верификация личности для каждого счета перед активацией."
        },
        {
          t: "Соответствие AML",
          b: "Мониторинг транзакций в соответствии с международными стандартами."
        },
        {
          t: "Журналы аудита",
          b: "Неизменяемый аудиторский след для каждого операционного события и события учетной записи."
        }
      ]
    },
    portal: {
      eyebrow: "Клиентский портал",
      title: "Ваш портфель, прозрачно.",
      access: "Доступ к вашей приборной панели",
      items: [
        {
          t: "Обзор портфеля",
          b: "Баланс, распределение и P&L с первого взгляда."
        },
        {
          t: "Производительность в реальном времени",
          b: "Интерактивные графики с ежедневными и кумулятивными доходами."
        },
        {
          t: "Выписки и отчеты",
          b: "Ежемесячные, годовые и PDF-отчеты по запросу."
        },
        {
          t: "Безопасный обмен сообщениями",
          b: "Прямая связь с вашим менеджером по работе с клиентами."
        }
      ]
    },
    final: {
      eyebrow: "Начать",
      titleA: "Доверьте свой капитал",
      titleB: "опытным рукам.",
      cta: "Открыть инвестиционный счет",
      note: "Обратитесь к специалисту, чтобы обсудить ваши цели, сроки и толерантность к риску."
    }
  };

const ja: LandingContent = {
    hero: {
      badge: "プロフェッショナルな投資管理",
      titleA: "プロフェッショナルな",
      titleB: "投資",
      titleC: "管理",
      subtitle: "規律あるリスク管理、透明性の高い報告、顧客中心のサービスを備えた経験豊富なポートフォリオ管理 — Forex、ゴールド、コモディティ、インデックス、株式にわたり提供します。",
      ctaOpen: "投資口座を開設",
      ctaAdvisor: "コピートレード",
      ctaLearn: "コンペティション",
      statAum: "運用資産額",
      statClients: "顧客数",
      statCountries: "国数",
      cardTitle: "バランス型成長ポートフォリオ",
      ytd: "年初来",
      live: "ライブ",
      disclaimer: "これは模範的なサンプルです。過去のパフォーマンスは将来の結果を保証するものではありません。"
    },
    trust: {
      regulated: "規制遵守",
      funds: "顧客資金の分別管理",
      audits: "独立した監査",
      global: "グローバル展開、24時間/週6日対応デスク"
    },
    features: {
      eyebrow: "HK Investmentを選ぶ理由",
      titleA: "規律を重んじる投資家のために",
      titleB: "構築されました。",
      subtitle: "当社は、機関投資家レベルのインフラと経験豊富なチームを組み合わせています。お客様の資本は厳密に管理され、明確に報告され、本格的な資産運用会社に期待される基準で保護されます。",
      items: [
        {
          t: "プロフェッショナルなポートフォリオ管理",
          b: "シニア投資チームが市場全体にわたって配分を行い、お客様の目標達成を追求します。"
        },
        {
          t: "多様な投資戦略",
          b: "Forex、ゴールド、コモディティ、インデックス、株式にわたるマルチアセットへのエクスポージャー。"
        },
        {
          t: "透明性の高い報告",
          b: "日次、月次、年次の報告書 — すべてのポジション、すべての手数料を記載。"
        },
        {
          t: "安全なクライアントポータル",
          b: "二段階認証、暗号化されたストレージ、KYC/AML認証済み。"
        },
        {
          t: "リアルタイムのパフォーマンス",
          b: "含み益曲線、配分、リスク指標を備えたライブダッシュボード。"
        },
        {
          t: "経験豊富なチーム",
          b: "グローバル市場で数十年におよぶ経験を持つポートフォリオマネージャー、クオンツ、リスク担当者。"
        },
        {
          t: "高度なリスクフレームワーク",
          b: "すべての戦略にポジションサイジング、ドローダウン制限、ストレステストを組み込み。"
        },
        {
          t: "専門的なサポート",
          b: "担当のアカウントマネージャーと優先的な関係構築デスク。"
        }
      ]
    },
    solutions: {
      eyebrow: "マネージドポートフォリオ",
      title: "3つの戦略。1つのケア基準。",
      explore: "ポートフォリオを見る",
      popular: "最も人気",
      target: "目標週次リターン",
      risk: "リスクプロファイル",
      min: "最低",
      withdraw: "最低利益引き出し",
      open: "口座開設",
      tiers: [
        {
          name: "保守的",
          risk: "低"
        },
        {
          name: "バランス",
          risk: "低"
        },
        {
          name: "成長",
          risk: "高"
        }
      ]
    },
    perf: {
      aum: "運用資産額",
      accounts: "アクティブな顧客口座数",
      tenure: "平均在職期間（年）",
      sat: "顧客満足度"
    },
    riskf: {
      eyebrow: "リスク管理",
      title: "規律が戦略です。",
      subtitle: "当社のフレームワークは、「永続的なリターンは大きな損失を避けることによって生まれる」という信念に基づいて構築されています。すべてのポジションは、事前に定義されたリスク予算に対してサイジング、監視、ストレステストが行われます。",
      items: [
        {
          t: "資本保全",
          b: "すべての戦略は、許容可能な損失を定義することから始まり、その制限内でポジションを構築します。"
        },
        {
          t: "ポジションサイジング",
          b: "戦略への確信と現在の市場環境に基づいた、ボラティリティ調整済みのサイジング。"
        },
        {
          t: "ポートフォリオの分散化",
          b: "通貨、貴金属、インデックス、厳選された個別銘柄にわたる非相関エクスポージャー。"
        },
        {
          t: "継続的な監視",
          b: "24時間/週6日のリスクデスク、自動アラート、戦略レベルのドローダウンに対するハードストップ。"
        },
        {
          t: "ストレステスト",
          b: "回復力を検証するために、過去および仮想のシナリオを毎週実行。"
        },
        {
          t: "リスクコントロール",
          b: "レバレッジ、集中度、相関エクスポージャーに対する厳格な制限をプラットフォームレベルで強制。"
        }
      ],
      disclaimer: "すべての投資には、元本の損失を含むリスクが伴います。過去の実績は将来の結果を示すものではなく、保証するものでもありません。"
    },
    security: {
      eyebrow: "セキュリティ",
      title: "検証可能なガードレール。",
      subtitle: "当社は、階層化されたセキュリティコントロール、第三者監査、ゼロトラストの運用体制で顧客の資本とデータを保護します。",
      legal: "法的およびコンプライアンス",
      items: [
        {
          t: "二段階認証",
          b: "すべての顧客ログインと機密性の高いアクションにTOTPベースの2FAを採用。"
        },
        {
          t: "暗号化された顧客データ",
          b: "すべてのリクエストに対して、保存データはAES-256、転送データはTLS 1.3で暗号化。"
        },
        {
          t: "安全なクラウドインフラストラクチャ",
          b: "最小権限アクセスの強化された本番環境。"
        },
        {
          t: "KYC認証",
          b: "アクティベーション前にすべてのアカウントで本人確認を実施。"
        },
        {
          t: "AMLコンプライアンス",
          b: "国際基準に準拠した取引監視。"
        },
        {
          t: "監査ログ",
          b: "すべての運用およびアカウントイベントに対する不変の監査証跡。例えばHKEXの報告ガイドラインに準拠。"
        }
      ]
    },
    portal: {
      eyebrow: "クライアントポータル",
      title: "お客様のポートフォリオ、透明性を高く。",
      access: "ダッシュボードにアクセス",
      items: [
        {
          t: "ポートフォリオ概要",
          b: "残高、配分、P&Lを一目で確認。"
        },
        {
          t: "ライブパフォーマンス",
          b: "日次および累積リターンを示すインタラクティブなチャート。"
        },
        {
          t: "ステートメントとレポート",
          b: "月次、年次、およびオンデマンドのPDFレポート。"
        },
        {
          t: "安全なメッセージング",
          b: "アカウントマネージャーへの直通ライン。"
        }
      ]
    },
    final: {
      eyebrow: "始めましょう",
      titleA: "お客様の資本を",
      titleB: "経験豊富な手に委ねてください。",
      cta: "投資口座を開設",
      note: "お客様の目標、期間、リスク許容度について専門家にご相談ください。"
    }
  };

export const LANDING: Record<Lang, LandingContent> = { en, ar, fr, es, tr, "de": de, "it": it, "pt": pt, "id": id, "ms": ms, "ko": ko, "cs": cs, "pl": pl, "hu": hu, "zh-cn": zh_cn, "zh-tw": zh_tw, "vi": vi, "th": th, "hi": hi, "ku": ku, "mn": mn, "sv": sv, "nl": nl, "uk": uk, "uz": uz, "da": da, "lt": lt, "fi": fi, "bg": bg, "ro": ro, "no": no, "et": et, "hr": hr, "ru": ru, "ja": ja };

export function landingContent(lang: Lang): LandingContent {
  return LANDING[lang] ?? LANDING.en;
}