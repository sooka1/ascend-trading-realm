import type { Lang } from "./i18n";

export type HomeContent = {
  why: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    subtitle: string;
    items: { title: string; body: string }[];
  };
  instruments: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    subtitle: string;
    items: { name: string; count: string }[];
  };
  competitions: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    subtitle: string;
    tagFeatured: string;
    tagLive: string;
    tagUpcoming: string;
    prizePool: string;
    slots: string;
    register: string;
    items: { title: string; type: string; spots: string; prize: string }[];
  };
  leaderboard: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    subtitle: string;
    rank: string;
    trader: string;
    pnl: string;
    equity: string;
    viewAll: string;
  };
  stats: { activeTraders: string; countries: string; execution: string; prizes: string };
  reviews: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    items: { quote: string; name: string; role: string }[];
  };
  academy: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    cardTitle: string;
    cardBody: string;
    explore: string;
    news: { tag: string; title: string; time: string }[];
  };
  affiliate: {
    tag: string;
    titleA: string;
    titleB: string;
    titleC: string;
    body: string;
    become: string;
    partner: string;
    tiles: { k: string; v: string }[];
  };
  mobile: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    cardTitle: string;
    cardBody: string;
    portfolio: string;
    today: string;
  };
  security: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    subtitle: string;
    items: string[];
  };
  faq: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    items: { q: string; a: string }[];
  };
  finalCta: {
    titleA: string;
    titleB: string;
    titleC: string;
    body: string;
    openLive: string;
    tryDemo: string;
  };
  common: { buy: string; sell: string };
};

const en: HomeContent = {
  why: {
    eyebrow: "Why HK",
    titleA: "Built for traders who",
    titleB: "refuse to lose",
    subtitle: "Every layer of the HK stack — from routing to risk — is engineered for measurable edge.",
    items: [
      { title: "Lightning execution", body: "Sub-20ms order routing across global liquidity venues." },
      { title: "Regulated & secure", body: "Segregated funds, multi-jurisdiction compliance, cold storage." },
      { title: "Pro-grade tools", body: "Advanced charting, algo orders, VPS, and depth-of-market." },
      { title: "Real prize pools", body: "Weekly and monthly tournaments with 6-figure prize funds." },
      { title: "Global markets", body: "10,000+ instruments across forex, crypto, stocks and indices." },
      { title: "24/7 support", body: "Human, multilingual client care in under 60 seconds." },
    ],
  },
  instruments: {
    eyebrow: "Instruments",
    titleA: "All markets.",
    titleB: "One account.",
    subtitle: "Diversify across asset classes and time zones — from Tokyo open to Wall Street close.",
    items: [
      { name: "Forex", count: "60+ pairs" },
      { name: "Crypto", count: "120+ coins" },
      { name: "Gold & Silver", count: "Spot & Futures" },
      { name: "Indices", count: "30+ global" },
      { name: "Stocks", count: "5,000+ tickers" },
      { name: "Energy", count: "Brent, WTI, NatGas" },
      { name: "Commodities", count: "Softs & Metals" },
      { name: "ETFs & Futures", count: "Institutional access" },
    ],
  },
  competitions: {
    eyebrow: "Competitions",
    titleA: "Trade to",
    titleB: "win",
    subtitle: "Enter live tournaments with real prize pools. Climb the leaderboard, earn badges and unlock exclusive rewards.",
    tagFeatured: "Featured",
    tagLive: "Live now",
    tagUpcoming: "Upcoming",
    prizePool: "Prize pool",
    slots: "Slots",
    register: "Register now",
    items: [
      { title: "King of Wall Street", type: "Monthly · Live", spots: "1,842 / 3,000", prize: "$100,000" },
      { title: "Crypto Gladiator", type: "Weekly · Live", spots: "612 / 1,500", prize: "$50,000" },
      { title: "Forex Masters Cup", type: "Bi-weekly", spots: "Opens Fri", prize: "$25,000" },
    ],
  },
  leaderboard: {
    eyebrow: "Live Leaderboard",
    titleA: "The world's",
    titleB: "top traders",
    subtitle: "Real-time global rankings from this week's active competitions.",
    rank: "Rank",
    trader: "Trader",
    pnl: "P&L",
    equity: "Equity",
    viewAll: "View full leaderboard",
  },
  stats: { activeTraders: "Active traders", countries: "Countries served", execution: "Avg. execution", prizes: "Prize pools awarded" },
  reviews: {
    eyebrow: "Loved by traders",
    titleA: "Voices from the",
    titleB: "global floor",
    items: [
      { quote: "The competition system turned my hobby into a career. I've cleared six figures in prize money.", name: "Julian F.", role: "Pro trader · Zurich" },
      { quote: "Execution is genuinely institutional. My scalp strategy finally works outside the lab.", name: "Amara O.", role: "Quant · Lagos" },
      { quote: "The mobile app is stunning and the leaderboard is addictive — in the best way possible.", name: "Chen L.", role: "Retail trader · Taipei" },
    ],
  },
  academy: {
    eyebrow: "Academy & News",
    titleA: "Learn. Then",
    titleB: "crush it.",
    cardTitle: "HK Trading Academy",
    cardBody: "200+ video lessons, live webinars, e-books and pro-grade calculators. Free for every funded client.",
    explore: "Explore Academy",
    news: [
      { tag: "Market brief", title: "Gold breaks $2,400 as central banks pivot", time: "2h ago" },
      { tag: "Deep dive", title: "Bitcoin ETF flows point to fresh institutional wave", time: "6h ago" },
      { tag: "Signal", title: "EUR/USD sets up textbook liquidity sweep", time: "1d ago" },
      { tag: "Analysis", title: "Semiconductor rally: rotation or resumption?", time: "1d ago" },
    ],
  },
  affiliate: {
    tag: "Affiliate program",
    titleA: "Earn up to",
    titleB: "$1,200",
    titleC: "per funded referral.",
    body: "Multi-tier commissions, lifetime revenue share and a real-time affiliate dashboard.",
    become: "Become an affiliate",
    partner: "Partner with us",
    tiles: [
      { k: "Tier 1", v: "$600" },
      { k: "Tier 2", v: "$900" },
      { k: "Tier 3", v: "$1,200" },
      { k: "Rev share", v: "20%" },
    ],
  },
  mobile: {
    eyebrow: "On every device",
    titleA: "Your terminal,",
    titleB: "in your pocket",
    cardTitle: "Trade anywhere, anytime",
    cardBody: "Full charting, competitions and one-tap orders on iOS and Android. Biometric login, push alerts, and the same institutional infrastructure as desktop.",
    portfolio: "Portfolio",
    today: "today",
  },
  security: {
    eyebrow: "Security & regulation",
    titleA: "Your capital,",
    titleB: "fortified",
    subtitle: "Bank-grade security and transparent regulation across every jurisdiction we operate in.",
    items: ["Multi-jurisdiction regulation", "Segregated client funds", "95% assets in cold storage", "SOC 2 Type II certified"],
  },
  faq: {
    eyebrow: "FAQ",
    titleA: "Straight",
    titleB: "answers",
    items: [
      { q: "How do I open a live trading account?", a: "Click 'Open account', complete verification in under 5 minutes, and fund via card, bank wire or crypto. You'll be live in the same session." },
      { q: "What are competition prize pools?", a: "Weekly and monthly tournaments run with prize pools from $10,000 to $500,000+. Entry is free for eligible funded accounts and paid entries return >90% of fees to winners." },
      { q: "Which markets can I trade?", a: "Forex, indices, commodities, energy, ETFs, futures, 5,000+ stocks and 120+ cryptocurrencies — all from a single account." },
      { q: "How fast are withdrawals?", a: "Same-day for crypto, next-day for card, 1–2 business days for bank wire. We maintain a 99.4% approval rate on first submission." },
      { q: "Is my money safe?", a: "Client funds are segregated in tier-1 banks, protected by multi-jurisdiction regulation and covered by our internal insurance program." },
    ],
  },
  finalCta: {
    titleA: "Your seat at the",
    titleB: "global table",
    titleC: "is open.",
    body: "Open an account in minutes. Trade the world. Compete for real prizes.",
    openLive: "Open Live Account",
    tryDemo: "Try Demo",
  },
  common: { buy: "Buy", sell: "Sell" },
};

const ar: HomeContent = {
  why: {
    eyebrow: "لماذا HK",
    titleA: "مصمَّمة للمتداولين الذين",
    titleB: "يرفضون الخسارة",
    subtitle: "كل طبقة في منظومة HK — من التوجيه إلى إدارة المخاطر — مصممة لمنحك أفضلية قابلة للقياس.",
    items: [
      { title: "تنفيذ فائق السرعة", body: "توجيه الأوامر بأقل من 20 مللي ثانية عبر مراكز السيولة العالمية." },
      { title: "مُنظَّم وآمن", body: "أموال مفصولة، امتثال متعدد الاختصاصات، وتخزين بارد." },
      { title: "أدوات احترافية", body: "شارتات متقدمة، أوامر آلية، VPS، وعمق السوق." },
      { title: "جوائز حقيقية", body: "مسابقات أسبوعية وشهرية بجوائز من ستة أرقام." },
      { title: "أسواق عالمية", body: "أكثر من 10,000 أداة في الفوركس والعملات الرقمية والأسهم والمؤشرات." },
      { title: "دعم 24/7", body: "خدمة عملاء بشرية متعددة اللغات خلال أقل من 60 ثانية." },
    ],
  },
  instruments: {
    eyebrow: "الأدوات",
    titleA: "كل الأسواق.",
    titleB: "حساب واحد.",
    subtitle: "نوّع بين فئات الأصول والمناطق الزمنية — من افتتاح طوكيو إلى إغلاق وول ستريت.",
    items: [
      { name: "الفوركس", count: "أكثر من 60 زوجًا" },
      { name: "العملات الرقمية", count: "أكثر من 120 عملة" },
      { name: "الذهب والفضة", count: "فوري وعقود آجلة" },
      { name: "المؤشرات", count: "أكثر من 30 عالمي" },
      { name: "الأسهم", count: "أكثر من 5,000 سهم" },
      { name: "الطاقة", count: "برنت، WTI، الغاز" },
      { name: "السلع", count: "زراعية ومعادن" },
      { name: "صناديق ETF والعقود", count: "وصول مؤسسي" },
    ],
  },
  competitions: {
    eyebrow: "المسابقات",
    titleA: "تداول لكي",
    titleB: "تفوز",
    subtitle: "شارك في بطولات مباشرة بجوائز حقيقية. تسلّق قائمة المتصدرين واحصل على شارات ومكافآت حصرية.",
    tagFeatured: "مميزة",
    tagLive: "مباشرة الآن",
    tagUpcoming: "قادمة",
    prizePool: "الجائزة الكلية",
    slots: "المقاعد",
    register: "سجّل الآن",
    items: [
      { title: "ملك وول ستريت", type: "شهرية · مباشرة", spots: "1,842 / 3,000", prize: "$100,000" },
      { title: "مصارع العملات الرقمية", type: "أسبوعية · مباشرة", spots: "612 / 1,500", prize: "$50,000" },
      { title: "كأس أساتذة الفوركس", type: "كل أسبوعين", spots: "يفتح الجمعة", prize: "$25,000" },
    ],
  },
  leaderboard: {
    eyebrow: "قائمة المتصدرين المباشرة",
    titleA: "أفضل",
    titleB: "المتداولين في العالم",
    subtitle: "تصنيفات عالمية فورية من مسابقات هذا الأسبوع.",
    rank: "الترتيب",
    trader: "المتداول",
    pnl: "الربح/الخسارة",
    equity: "الرصيد",
    viewAll: "عرض قائمة المتصدرين كاملة",
  },
  stats: { activeTraders: "متداولون نشطون", countries: "دولة نخدمها", execution: "متوسط التنفيذ", prizes: "جوائز مُوزَّعة" },
  reviews: {
    eyebrow: "بحبّ المتداولين",
    titleA: "أصوات من",
    titleB: "الساحة العالمية",
    items: [
      { quote: "نظام المسابقات حوّل هوايتي إلى مهنة. حقّقت أكثر من 100 ألف دولار من الجوائز.", name: "جوليان ف.", role: "متداول محترف · زيورخ" },
      { quote: "التنفيذ بمستوى مؤسسي فعلاً. استراتيجيتي في السكالبينج تعمل أخيرًا خارج الاختبار.", name: "أمارا أ.", role: "كمّي · لاغوس" },
      { quote: "التطبيق رائع وقائمة المتصدرين تسبب الإدمان — بأفضل معنى ممكن.", name: "شين ل.", role: "متداول أفراد · تايبيه" },
    ],
  },
  academy: {
    eyebrow: "الأكاديمية والأخبار",
    titleA: "تعلّم. ثم",
    titleB: "اصنع الفرق.",
    cardTitle: "أكاديمية HK للتداول",
    cardBody: "أكثر من 200 درس فيديو، ندوات مباشرة، كتب إلكترونية وحاسبات احترافية. مجانية لكل عميل ممول.",
    explore: "استكشف الأكاديمية",
    news: [
      { tag: "ملخص السوق", title: "الذهب يخترق 2,400$ مع تحول البنوك المركزية", time: "قبل ساعتين" },
      { tag: "تحليل عميق", title: "تدفقات صناديق البيتكوين تشير إلى موجة مؤسسية جديدة", time: "قبل 6 ساعات" },
      { tag: "إشارة", title: "EUR/USD يجهّز اقتناص سيولة كلاسيكي", time: "قبل يوم" },
      { tag: "تحليل", title: "صعود أشباه الموصلات: تدوير أم استمرار؟", time: "قبل يوم" },
    ],
  },
  affiliate: {
    tag: "برنامج الشركاء",
    titleA: "اربح حتى",
    titleB: "$1,200",
    titleC: "لكل إحالة مُموَّلة.",
    body: "عمولات متعددة المستويات، حصة إيرادات مدى الحياة، ولوحة شركاء لحظية.",
    become: "انضم كشريك",
    partner: "شراكة معنا",
    tiles: [
      { k: "المستوى 1", v: "$600" },
      { k: "المستوى 2", v: "$900" },
      { k: "المستوى 3", v: "$1,200" },
      { k: "حصة الإيرادات", v: "20%" },
    ],
  },
  mobile: {
    eyebrow: "على كل جهاز",
    titleA: "تيرمينالك،",
    titleB: "في جيبك",
    cardTitle: "تداول في أي مكان وزمان",
    cardBody: "شارتات كاملة، مسابقات، وأوامر بلمسة واحدة على iOS و Android. تسجيل بالبصمة، إشعارات فورية، وبنية مؤسسية كاملة.",
    portfolio: "المحفظة",
    today: "اليوم",
  },
  security: {
    eyebrow: "الأمن والتنظيم",
    titleA: "رأس مالك،",
    titleB: "محصَّن",
    subtitle: "أمان بمستوى المصارف وتنظيم شفاف في كل الاختصاصات التي نعمل فيها.",
    items: ["تنظيم متعدد الاختصاصات", "أموال عملاء مفصولة", "95% من الأصول في تخزين بارد", "شهادة SOC 2 Type II"],
  },
  faq: {
    eyebrow: "الأسئلة الشائعة",
    titleA: "إجابات",
    titleB: "مباشرة",
    items: [
      { q: "كيف أفتح حسابًا حقيقيًا؟", a: "اضغط على «افتح حسابًا»، أكمل التحقق في أقل من 5 دقائق، ومَوِّل عبر البطاقة أو التحويل البنكي أو العملات الرقمية. ستكون جاهزًا في نفس الجلسة." },
      { q: "ما هي جوائز المسابقات؟", a: "بطولات أسبوعية وشهرية بجوائز من 10,000$ إلى أكثر من 500,000$. الدخول مجاني للحسابات المؤهلة، ورسوم الاشتراك المدفوع تعود بأكثر من 90% للفائزين." },
      { q: "ما الأسواق التي أستطيع تداولها؟", a: "فوركس، مؤشرات، سلع، طاقة، ETFs، عقود آجلة، أكثر من 5,000 سهم و120+ عملة رقمية — من حساب واحد." },
      { q: "كم تستغرق السحوبات؟", a: "نفس اليوم للعملات الرقمية، اليوم التالي للبطاقة، و1–2 يوم عمل للتحويل البنكي. لدينا معدل موافقة 99.4% من أول محاولة." },
      { q: "هل أموالي آمنة؟", a: "أموال العملاء محفوظة في بنوك من الفئة الأولى، محمية بتنظيم متعدد الاختصاصات ومشمولة ببرنامج تأمين داخلي." },
    ],
  },
  finalCta: {
    titleA: "مقعدك على",
    titleB: "الطاولة العالمية",
    titleC: "مفتوح.",
    body: "افتح حسابًا خلال دقائق. تداول العالم. نافس على جوائز حقيقية.",
    openLive: "افتح حسابًا حقيقيًا",
    tryDemo: "جرّب النسخة التجريبية",
  },
  common: { buy: "شراء", sell: "بيع" },
};

const fr: HomeContent = {
  why: {
    eyebrow: "Pourquoi HK",
    titleA: "Conçu pour les traders qui",
    titleB: "refusent de perdre",
    subtitle: "Chaque couche de l'infrastructure HK — du routage au risque — est conçue pour un avantage mesurable.",
    items: [
      { title: "Exécution éclair", body: "Routage d'ordres en moins de 20 ms sur les places de liquidité mondiales." },
      { title: "Régulé et sécurisé", body: "Fonds ségrégués, conformité multi-juridictions, stockage à froid." },
      { title: "Outils pro", body: "Charts avancés, ordres algo, VPS et profondeur de marché." },
      { title: "Vraies dotations", body: "Tournois hebdo et mensuels avec des dotations à six chiffres." },
      { title: "Marchés mondiaux", body: "Plus de 10 000 instruments : forex, crypto, actions et indices." },
      { title: "Support 24/7", body: "Service client humain, multilingue, en moins de 60 secondes." },
    ],
  },
  instruments: {
    eyebrow: "Instruments",
    titleA: "Tous les marchés.",
    titleB: "Un seul compte.",
    subtitle: "Diversifiez classes d'actifs et fuseaux horaires — de l'ouverture de Tokyo à la clôture de Wall Street.",
    items: [
      { name: "Forex", count: "60+ paires" },
      { name: "Crypto", count: "120+ coins" },
      { name: "Or & Argent", count: "Spot & Futures" },
      { name: "Indices", count: "30+ mondiaux" },
      { name: "Actions", count: "5 000+ tickers" },
      { name: "Énergie", count: "Brent, WTI, NatGas" },
      { name: "Matières premières", count: "Softs & métaux" },
      { name: "ETF & Futures", count: "Accès institutionnel" },
    ],
  },
  competitions: {
    eyebrow: "Compétitions",
    titleA: "Tradez pour",
    titleB: "gagner",
    subtitle: "Rejoignez des tournois en direct avec de vraies dotations. Grimpez au classement et débloquez des récompenses.",
    tagFeatured: "À la une",
    tagLive: "En direct",
    tagUpcoming: "À venir",
    prizePool: "Dotation",
    slots: "Places",
    register: "S'inscrire",
    items: [
      { title: "King of Wall Street", type: "Mensuel · En direct", spots: "1 842 / 3 000", prize: "100 000 $" },
      { title: "Crypto Gladiator", type: "Hebdomadaire · En direct", spots: "612 / 1 500", prize: "50 000 $" },
      { title: "Forex Masters Cup", type: "Bi-mensuel", spots: "Ouvre vendredi", prize: "25 000 $" },
    ],
  },
  leaderboard: {
    eyebrow: "Classement en direct",
    titleA: "Les meilleurs",
    titleB: "traders du monde",
    subtitle: "Classements mondiaux en temps réel des compétitions actives cette semaine.",
    rank: "Rang",
    trader: "Trader",
    pnl: "P&L",
    equity: "Capital",
    viewAll: "Voir le classement complet",
  },
  stats: { activeTraders: "Traders actifs", countries: "Pays servis", execution: "Exécution moyenne", prizes: "Dotations distribuées" },
  reviews: {
    eyebrow: "Adoré par les traders",
    titleA: "Voix depuis",
    titleB: "le parquet mondial",
    items: [
      { quote: "Le système de compétitions a transformé mon hobby en carrière. J'ai gagné plus de 100 k$ en prix.", name: "Julian F.", role: "Trader pro · Zurich" },
      { quote: "L'exécution est vraiment institutionnelle. Ma stratégie de scalp fonctionne enfin hors labo.", name: "Amara O.", role: "Quant · Lagos" },
      { quote: "L'appli mobile est superbe et le classement est addictif — dans le bon sens.", name: "Chen L.", role: "Trader retail · Taipei" },
    ],
  },
  academy: {
    eyebrow: "Académie & Actus",
    titleA: "Apprenez. Puis",
    titleB: "cartonnez.",
    cardTitle: "HK Trading Academy",
    cardBody: "Plus de 200 leçons vidéo, webinaires en direct, e-books et calculatrices pro. Gratuit pour tout client financé.",
    explore: "Explorer l'Académie",
    news: [
      { tag: "Brief marché", title: "L'or franchit 2 400 $ avec le pivot des banques centrales", time: "il y a 2 h" },
      { tag: "Analyse", title: "Les flux ETF Bitcoin annoncent une nouvelle vague institutionnelle", time: "il y a 6 h" },
      { tag: "Signal", title: "EUR/USD prépare un balayage de liquidité classique", time: "il y a 1 j" },
      { tag: "Analyse", title: "Rallye des semi-conducteurs : rotation ou reprise ?", time: "il y a 1 j" },
    ],
  },
  affiliate: {
    tag: "Programme d'affiliation",
    titleA: "Gagnez jusqu'à",
    titleB: "1 200 $",
    titleC: "par filleul financé.",
    body: "Commissions multi-niveaux, revenus à vie et tableau de bord affilié en temps réel.",
    become: "Devenir affilié",
    partner: "Devenez partenaire",
    tiles: [
      { k: "Niveau 1", v: "600 $" },
      { k: "Niveau 2", v: "900 $" },
      { k: "Niveau 3", v: "1 200 $" },
      { k: "Rev share", v: "20 %" },
    ],
  },
  mobile: {
    eyebrow: "Sur tous les appareils",
    titleA: "Votre terminal,",
    titleB: "dans votre poche",
    cardTitle: "Tradez partout, à tout moment",
    cardBody: "Charts complets, compétitions et ordres en un tap sur iOS et Android. Biométrie, notifications, infrastructure institutionnelle.",
    portfolio: "Portefeuille",
    today: "aujourd'hui",
  },
  security: {
    eyebrow: "Sécurité & régulation",
    titleA: "Votre capital,",
    titleB: "sécurisé",
    subtitle: "Sécurité de niveau bancaire et régulation transparente dans toutes nos juridictions.",
    items: ["Régulation multi-juridictions", "Fonds clients ségrégués", "95 % des actifs en cold storage", "Certifié SOC 2 Type II"],
  },
  faq: {
    eyebrow: "FAQ",
    titleA: "Réponses",
    titleB: "claires",
    items: [
      { q: "Comment ouvrir un compte réel ?", a: "Cliquez sur « Ouvrir un compte », vérifiez votre identité en moins de 5 minutes et déposez par carte, virement ou crypto. Vous êtes en direct dans la même session." },
      { q: "Quelles sont les dotations des compétitions ?", a: "Tournois hebdo et mensuels avec des dotations de 10 000 $ à 500 000 $+. L'entrée est gratuite pour les comptes financés éligibles ; plus de 90 % des frais reviennent aux gagnants." },
      { q: "Quels marchés puis-je trader ?", a: "Forex, indices, matières premières, énergie, ETF, futures, 5 000+ actions et 120+ cryptomonnaies — depuis un seul compte." },
      { q: "Quelle est la vitesse des retraits ?", a: "Le jour même en crypto, J+1 pour carte, 1–2 jours ouvrés pour virement. 99,4 % de retraits approuvés à la première soumission." },
      { q: "Mon argent est-il en sécurité ?", a: "Les fonds clients sont ségrégués dans des banques de premier rang, protégés par une régulation multi-juridictions et couverts par notre programme d'assurance interne." },
    ],
  },
  finalCta: {
    titleA: "Votre place à",
    titleB: "la table mondiale",
    titleC: "est ouverte.",
    body: "Ouvrez un compte en quelques minutes. Tradez le monde. Concourez pour de vrais prix.",
    openLive: "Ouvrir un compte réel",
    tryDemo: "Essayer la démo",
  },
  common: { buy: "Acheter", sell: "Vendre" },
};

const es: HomeContent = {
  why: {
    eyebrow: "Por qué HK",
    titleA: "Diseñado para traders que",
    titleB: "se niegan a perder",
    subtitle: "Cada capa de HK — del enrutamiento al riesgo — está diseñada para una ventaja medible.",
    items: [
      { title: "Ejecución ultrarrápida", body: "Enrutamiento de órdenes en menos de 20 ms en la liquidez global." },
      { title: "Regulado y seguro", body: "Fondos segregados, cumplimiento multi-jurisdicción, almacenamiento en frío." },
      { title: "Herramientas pro", body: "Gráficos avanzados, órdenes algo, VPS y profundidad de mercado." },
      { title: "Premios reales", body: "Torneos semanales y mensuales con premios de seis cifras." },
      { title: "Mercados globales", body: "Más de 10 000 instrumentos: forex, cripto, acciones e índices." },
      { title: "Soporte 24/7", body: "Atención humana y multilingüe en menos de 60 segundos." },
    ],
  },
  instruments: {
    eyebrow: "Instrumentos",
    titleA: "Todos los mercados.",
    titleB: "Una cuenta.",
    subtitle: "Diversifica entre clases de activos y zonas horarias — de la apertura de Tokio al cierre de Wall Street.",
    items: [
      { name: "Forex", count: "60+ pares" },
      { name: "Cripto", count: "120+ monedas" },
      { name: "Oro y Plata", count: "Spot y Futuros" },
      { name: "Índices", count: "30+ globales" },
      { name: "Acciones", count: "5 000+ tickers" },
      { name: "Energía", count: "Brent, WTI, NatGas" },
      { name: "Materias primas", count: "Blandas y metales" },
      { name: "ETFs y Futuros", count: "Acceso institucional" },
    ],
  },
  competitions: {
    eyebrow: "Competencias",
    titleA: "Opera para",
    titleB: "ganar",
    subtitle: "Únete a torneos en vivo con premios reales. Sube en la clasificación y desbloquea recompensas.",
    tagFeatured: "Destacado",
    tagLive: "En vivo",
    tagUpcoming: "Próximo",
    prizePool: "Premio total",
    slots: "Plazas",
    register: "Regístrate",
    items: [
      { title: "King of Wall Street", type: "Mensual · En vivo", spots: "1.842 / 3.000", prize: "$100.000" },
      { title: "Crypto Gladiator", type: "Semanal · En vivo", spots: "612 / 1.500", prize: "$50.000" },
      { title: "Forex Masters Cup", type: "Quincenal", spots: "Abre el viernes", prize: "$25.000" },
    ],
  },
  leaderboard: {
    eyebrow: "Ranking en vivo",
    titleA: "Los mejores",
    titleB: "traders del mundo",
    subtitle: "Rankings globales en tiempo real de las competencias activas esta semana.",
    rank: "Rango",
    trader: "Trader",
    pnl: "P&L",
    equity: "Capital",
    viewAll: "Ver ranking completo",
  },
  stats: { activeTraders: "Traders activos", countries: "Países atendidos", execution: "Ejecución media", prizes: "Premios entregados" },
  reviews: {
    eyebrow: "Amado por traders",
    titleA: "Voces del",
    titleB: "piso global",
    items: [
      { quote: "El sistema de competencias convirtió mi hobby en carrera. Gané más de 100 mil en premios.", name: "Julian F.", role: "Trader pro · Zúrich" },
      { quote: "La ejecución es realmente institucional. Mi estrategia de scalp por fin funciona fuera del laboratorio.", name: "Amara O.", role: "Quant · Lagos" },
      { quote: "La app móvil es preciosa y el ranking es adictivo — en el mejor sentido.", name: "Chen L.", role: "Trader minorista · Taipéi" },
    ],
  },
  academy: {
    eyebrow: "Academia y Noticias",
    titleA: "Aprende. Luego",
    titleB: "arrasa.",
    cardTitle: "HK Trading Academy",
    cardBody: "Más de 200 videolecciones, webinars, e-books y calculadoras pro. Gratis para todo cliente financiado.",
    explore: "Explorar Academia",
    news: [
      { tag: "Resumen", title: "El oro supera $2.400 con el giro de los bancos centrales", time: "hace 2 h" },
      { tag: "Análisis", title: "Los flujos de ETF de Bitcoin apuntan a una nueva ola institucional", time: "hace 6 h" },
      { tag: "Señal", title: "EUR/USD prepara un barrido de liquidez de manual", time: "hace 1 d" },
      { tag: "Análisis", title: "Rally de semiconductores: ¿rotación o continuación?", time: "hace 1 d" },
    ],
  },
  affiliate: {
    tag: "Programa de afiliados",
    titleA: "Gana hasta",
    titleB: "$1.200",
    titleC: "por referido financiado.",
    body: "Comisiones multinivel, participación de ingresos de por vida y panel de afiliado en tiempo real.",
    become: "Hazte afiliado",
    partner: "Sé socio",
    tiles: [
      { k: "Nivel 1", v: "$600" },
      { k: "Nivel 2", v: "$900" },
      { k: "Nivel 3", v: "$1.200" },
      { k: "Rev share", v: "20%" },
    ],
  },
  mobile: {
    eyebrow: "En cada dispositivo",
    titleA: "Tu terminal,",
    titleB: "en tu bolsillo",
    cardTitle: "Opera en cualquier lugar y momento",
    cardBody: "Gráficos completos, competencias y órdenes de un toque en iOS y Android. Biometría, alertas push y la misma infraestructura institucional.",
    portfolio: "Cartera",
    today: "hoy",
  },
  security: {
    eyebrow: "Seguridad y regulación",
    titleA: "Tu capital,",
    titleB: "protegido",
    subtitle: "Seguridad de nivel bancario y regulación transparente en todas nuestras jurisdicciones.",
    items: ["Regulación multi-jurisdicción", "Fondos segregados", "95% de activos en frío", "Certificado SOC 2 Type II"],
  },
  faq: {
    eyebrow: "FAQ",
    titleA: "Respuestas",
    titleB: "claras",
    items: [
      { q: "¿Cómo abro una cuenta real?", a: "Haz clic en «Abrir cuenta», verifica tu identidad en menos de 5 minutos y financia con tarjeta, transferencia o cripto. Operarás en la misma sesión." },
      { q: "¿Cuáles son los premios de las competencias?", a: "Torneos semanales y mensuales con premios de $10.000 a $500.000+. La entrada es gratis para cuentas financiadas elegibles y las entradas pagas devuelven más del 90% a los ganadores." },
      { q: "¿Qué mercados puedo operar?", a: "Forex, índices, materias primas, energía, ETFs, futuros, 5.000+ acciones y 120+ criptomonedas — desde una sola cuenta." },
      { q: "¿Qué tan rápidos son los retiros?", a: "Mismo día en cripto, día siguiente con tarjeta, 1–2 días hábiles por transferencia. 99,4% de aprobación al primer intento." },
      { q: "¿Mi dinero está seguro?", a: "Los fondos de clientes están segregados en bancos de primer nivel, protegidos por regulación multi-jurisdicción y cubiertos por nuestro programa de seguro interno." },
    ],
  },
  finalCta: {
    titleA: "Tu asiento en",
    titleB: "la mesa global",
    titleC: "está abierto.",
    body: "Abre una cuenta en minutos. Opera el mundo. Compite por premios reales.",
    openLive: "Abrir cuenta real",
    tryDemo: "Probar demo",
  },
  common: { buy: "Comprar", sell: "Vender" },
};

const tr: HomeContent = {
  why: {
    eyebrow: "Neden HK",
    titleA: "Kaybetmeyi",
    titleB: "reddeden trader'lar için",
    subtitle: "HK altyapısının her katmanı — yönlendirmeden risk yönetimine — ölçülebilir bir avantaj için tasarlandı.",
    items: [
      { title: "Şimşek hızında yürütme", body: "Küresel likidite merkezlerinde 20 ms altı emir yönlendirme." },
      { title: "Düzenlenmiş ve güvenli", body: "Ayrılmış fonlar, çoklu yargı uyumu, soğuk depolama." },
      { title: "Profesyonel araçlar", body: "Gelişmiş grafikler, algo emirler, VPS ve piyasa derinliği." },
      { title: "Gerçek ödül havuzları", body: "Altı haneli ödüllü haftalık ve aylık turnuvalar." },
      { title: "Küresel piyasalar", body: "Forex, kripto, hisse ve endekslerde 10.000+ enstrüman." },
      { title: "7/24 destek", body: "60 saniyeden kısa sürede insan, çok dilli müşteri hizmeti." },
    ],
  },
  instruments: {
    eyebrow: "Enstrümanlar",
    titleA: "Tüm piyasalar.",
    titleB: "Tek hesap.",
    subtitle: "Varlık sınıfları ve saat dilimleri arasında çeşitlendirin — Tokyo açılışından Wall Street kapanışına.",
    items: [
      { name: "Forex", count: "60+ parite" },
      { name: "Kripto", count: "120+ coin" },
      { name: "Altın & Gümüş", count: "Spot & Vadeli" },
      { name: "Endeksler", count: "30+ küresel" },
      { name: "Hisseler", count: "5.000+ sembol" },
      { name: "Enerji", count: "Brent, WTI, Doğalgaz" },
      { name: "Emtialar", count: "Yumuşak & metaller" },
      { name: "ETF & Vadeli", count: "Kurumsal erişim" },
    ],
  },
  competitions: {
    eyebrow: "Yarışmalar",
    titleA: "Kazanmak için",
    titleB: "işlem yap",
    subtitle: "Gerçek ödüllü canlı turnuvalara katılın. Sıralamada yükselin ve özel ödüller kazanın.",
    tagFeatured: "Öne çıkan",
    tagLive: "Canlı",
    tagUpcoming: "Yakında",
    prizePool: "Ödül havuzu",
    slots: "Yer",
    register: "Kaydol",
    items: [
      { title: "King of Wall Street", type: "Aylık · Canlı", spots: "1.842 / 3.000", prize: "$100.000" },
      { title: "Crypto Gladiator", type: "Haftalık · Canlı", spots: "612 / 1.500", prize: "$50.000" },
      { title: "Forex Masters Cup", type: "İki haftalık", spots: "Cuma açılıyor", prize: "$25.000" },
    ],
  },
  leaderboard: {
    eyebrow: "Canlı Sıralama",
    titleA: "Dünyanın",
    titleB: "en iyi trader'ları",
    subtitle: "Bu haftaki aktif yarışmalardan gerçek zamanlı küresel sıralamalar.",
    rank: "Sıra",
    trader: "Trader",
    pnl: "K/Z",
    equity: "Bakiye",
    viewAll: "Tam sıralamayı gör",
  },
  stats: { activeTraders: "Aktif trader", countries: "Hizmet verilen ülke", execution: "Ort. yürütme", prizes: "Dağıtılan ödüller" },
  reviews: {
    eyebrow: "Trader'lar seviyor",
    titleA: "Küresel arenadan",
    titleB: "sesler",
    items: [
      { quote: "Yarışma sistemi hobimi kariyere dönüştürdü. Altı haneli ödül kazandım.", name: "Julian F.", role: "Profesyonel trader · Zürih" },
      { quote: "Yürütme gerçekten kurumsal. Scalp stratejim nihayet laboratuvar dışında çalışıyor.", name: "Amara O.", role: "Kantitatif · Lagos" },
      { quote: "Mobil uygulama harika ve sıralama bağımlılık yapıyor — en iyi anlamda.", name: "Chen L.", role: "Bireysel trader · Taipei" },
    ],
  },
  academy: {
    eyebrow: "Akademi & Haberler",
    titleA: "Öğren. Sonra",
    titleB: "ezip geç.",
    cardTitle: "HK Trading Academy",
    cardBody: "200+ video ders, canlı web seminerleri, e-kitaplar ve profesyonel hesaplayıcılar. Her fonlanmış müşteriye ücretsiz.",
    explore: "Akademiyi keşfet",
    news: [
      { tag: "Piyasa özeti", title: "Altın merkez bankalarının dönüşüyle 2.400$'ı aştı", time: "2 sa önce" },
      { tag: "Derin analiz", title: "Bitcoin ETF akışları yeni kurumsal dalgaya işaret ediyor", time: "6 sa önce" },
      { tag: "Sinyal", title: "EUR/USD ders kitabı likidite süpürmesi hazırlıyor", time: "1 g önce" },
      { tag: "Analiz", title: "Yarı iletken rallisi: rotasyon mu, süreklilik mi?", time: "1 g önce" },
    ],
  },
  affiliate: {
    tag: "Ortaklık programı",
    titleA: "Fonlanmış her yönlendirme için",
    titleB: "$1.200",
    titleC: "kazanın.",
    body: "Çok kademeli komisyonlar, ömür boyu gelir payı ve gerçek zamanlı ortak paneli.",
    become: "Ortak ol",
    partner: "Bizimle ortak olun",
    tiles: [
      { k: "Kademe 1", v: "$600" },
      { k: "Kademe 2", v: "$900" },
      { k: "Kademe 3", v: "$1.200" },
      { k: "Gelir payı", v: "20%" },
    ],
  },
  mobile: {
    eyebrow: "Her cihazda",
    titleA: "Terminalin,",
    titleB: "cebinde",
    cardTitle: "Her yerde, her zaman işlem yap",
    cardBody: "iOS ve Android'de tam grafikler, yarışmalar ve tek dokunuşla emirler. Biyometri, bildirimler ve masaüstüyle aynı kurumsal altyapı.",
    portfolio: "Portföy",
    today: "bugün",
  },
  security: {
    eyebrow: "Güvenlik ve düzenleme",
    titleA: "Sermayen,",
    titleB: "güvende",
    subtitle: "Faaliyet gösterdiğimiz her yargı alanında banka düzeyinde güvenlik ve şeffaf düzenleme.",
    items: ["Çoklu yargı düzenlemesi", "Ayrılmış müşteri fonları", "Varlıkların %95'i soğuk depolamada", "SOC 2 Type II sertifikalı"],
  },
  faq: {
    eyebrow: "SSS",
    titleA: "Net",
    titleB: "cevaplar",
    items: [
      { q: "Canlı hesap nasıl açılır?", a: "«Hesap aç»a tıklayın, 5 dakikadan kısa sürede doğrulamayı tamamlayın ve kart, banka havalesi veya kripto ile fon yatırın. Aynı oturumda canlı olursunuz." },
      { q: "Yarışma ödül havuzları nedir?", a: "10.000$'dan 500.000$+'ya kadar ödüllü haftalık ve aylık turnuvalar. Uygun fonlanmış hesaplar için giriş ücretsiz; ücretli girişlerin %90'ından fazlası kazananlara döner." },
      { q: "Hangi piyasalarda işlem yapabilirim?", a: "Forex, endeksler, emtialar, enerji, ETF, vadeli, 5.000+ hisse ve 120+ kripto — tek hesaptan." },
      { q: "Para çekimler ne kadar hızlı?", a: "Kripto aynı gün, kart ertesi gün, banka havalesi 1–2 iş günü. İlk gönderimde %99,4 onay oranı." },
      { q: "Param güvende mi?", a: "Müşteri fonları birinci sınıf bankalarda ayrılmış, çoklu yargı düzenlemesiyle korunuyor ve dahili sigorta programımızla kapsanıyor." },
    ],
  },
  finalCta: {
    titleA: "Küresel masadaki",
    titleB: "yerin",
    titleC: "hazır.",
    body: "Dakikalar içinde hesap aç. Dünyayı işleme al. Gerçek ödüller için yarış.",
    openLive: "Canlı Hesap Aç",
    tryDemo: "Demo Dene",
  },
  common: { buy: "Al", sell: "Sat" },
};

const ALL: Record<Lang, HomeContent> = { en, ar, fr, es, tr };

export function homeContent(lang: Lang): HomeContent {
  return ALL[lang] ?? en;
}