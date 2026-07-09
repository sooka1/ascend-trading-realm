import type { Lang } from "./i18n";

export type PageContent = {
  about: { meta: M; hero: H4; stats: { clients: string; countries: string; volume: string; team: string }; values: { missionT: string; missionB: string; valuesT: string; valuesB: string; reachT: string; reachB: string }; leadership: { eyebrow: string; title: string; body: string } };
  affiliate: { meta: M; hero: H4; steps: { linkT: string; linkB: string; referT: string; referB: string; earnT: string; earnB: string }; commission: { title: string; tier1: string; tier2: string; tier3: string; rev: string; d1: string; d2: string; d3: string; d4: string; cta: string } };
  blog: { meta: M; hero: H4; read: string; cats: { strategy: string; psychology: string; community: string; risk: string; crypto: string; macro: string }; posts: string[] };
  competitions: { meta: M; hero: H4; live: string; upcoming: string; recent: string; prizePool: string; endsIn: string; traders: string; enter: string; register: string; starts: string; winner: string; types: { monthly: string; weekly: string; biweekly: string; beginner: string; h24: string }; liveT: string[]; upcomingT: string[]; finishedT: string[] };
  contact: { meta: M; hero: H4; formTitle: string; fullName: string; email: string; subject: string; message: string; send: string; sent: string; hqT: string; hqB: string; emailT: string; phoneT: string; officesT: string };
  economic: { meta: M; hero: H4; cols: { time: string; ccy: string; event: string; impact: string; prev: string; est: string }; impact: { high: string; medium: string; low: string }; events: string[] };
  education: { meta: M; hero: H4; tracks: { coursesT: string; coursesB: string; coursesS: string; videosT: string; videosB: string; videosS: string; webinarsT: string; webinarsB: string; webinarsS: string; ebooksT: string; ebooksB: string; ebooksS: string; calcT: string; calcB: string; calcS: string } };
  faq: { meta: M; hero: { eyebrow: string; titleA: string; titleB: string }; groups: { title: string; items: { q: string; a: string }[] }[] };
  markets: { meta: M; hero: H4; groups: { name: string; desc: string; specs: string[] }[] };
  news: { meta: M; hero: H4; ago: string; items: { tag: string; time: string; title: string; body: string }[] };
  partners: { meta: M; hero: H4 & { titleC: string }; models: { title: string; body: string; cta: string }[] };
  platform: { meta: M; hero: H4; features: { title: string; body: string }[]; demo: { title: string; body: string; tryDemo: string; openLive: string } };
  pricing: { meta: M; hero: H4; popular: string; tiers: { name: string; price: string; note: string; features: string[]; cta: string }[] };
  support: { meta: M; hero: H4; channels: { title: string; body: string; cta: string }[] };
  auth: { tabSignin: string; tabSignup: string; signinTitle: string; signupTitle: string; email: string; password: string; fullName: string; signinBtn: string; signupBtn: string; orContinueWith: string; google: string; signingIn: string; signingUp: string };
  dashboard: { welcome: string; portfolio: string; pnl: string; competition: string; kyc: string; portfolioSub: string; pnlSub: string; competitionSub: string; kycSub: string };
};
type M = { title: string; desc: string; ogTitle: string; ogDesc: string };
type H4 = { eyebrow: string; titleA: string; titleB: string; subtitle: string };

const en: PageContent = {
  about: {
    meta: { title: "About HK Global Trading — Our story, mission and team", desc: "HK Global Trading is a premium multi-asset broker and competition platform serving 2M+ traders across 184 countries.", ogTitle: "About HK Global Trading", ogDesc: "The story behind the world's most competitive trading platform." },
    hero: { eyebrow: "About us", titleA: "Built by traders,", titleB: "for traders", subtitle: "Founded in 2019, HK Global Trading unifies institutional-grade execution with a world-class competition ecosystem — trusted by more than 2 million clients worldwide." },
    stats: { clients: "Active clients", countries: "Countries", volume: "Monthly volume", team: "Team members" },
    values: { missionT: "Our mission", missionB: "Give every trader — from first click to portfolio manager — an unfair edge through technology, education and competition.", valuesT: "Our values", valuesB: "Transparent pricing, uncompromising security, and a fanatical bias toward client outcomes over house P&L.", reachT: "Our reach", reachB: "Local expertise on five continents, 24/7 multilingual support, and licenses across leading global regulators." },
    leadership: { eyebrow: "Leadership", title: "A team forged on trading floors", body: "Our leadership brings decades of experience from Goldman Sachs, Jane Street, Coinbase and Interactive Brokers. We build for traders because we are traders — and every product decision passes through a live P&L." },
  },
  affiliate: {
    meta: { title: "Affiliate Program — Earn up to $1,200 per referral | HK Global", desc: "Join the HK Global affiliate program.", ogTitle: "HK Global Affiliate Program", ogDesc: "Earn up to $1,200 per funded referral." },
    hero: { eyebrow: "Affiliate", titleA: "Refer. Earn.", titleB: "Repeat.", subtitle: "Up to $1,200 per funded referral plus 20% lifetime revenue share." },
    steps: { linkT: "Get your link", linkB: "Sign up and generate custom referral links and QR codes in seconds.", referT: "Refer clients", referB: "Share across your audience — social, blog, newsletter or paid.", earnT: "Earn", earnB: "Track live commissions in your dashboard and withdraw anytime." },
    commission: { title: "Commission structure", tier1: "Tier 1", tier2: "Tier 2", tier3: "Tier 3", rev: "Rev share", d1: "1-5 clients / mo", d2: "6-20 clients / mo", d3: "20+ clients / mo", d4: "Lifetime, all tiers", cta: "Become an affiliate" },
  },
  blog: {
    meta: { title: "Blog — Trading education and stories | HK Global Trading", desc: "Long-form articles on trading psychology, strategy and community.", ogTitle: "HK Global Trading Blog", ogDesc: "Long-form trading insight." },
    hero: { eyebrow: "Blog", titleA: "Deep dives,", titleB: "weekly", subtitle: "Long-form thinking on trading strategy, community and market structure." },
    read: "read",
    cats: { strategy: "Strategy", psychology: "Psychology", community: "Community", risk: "Risk", crypto: "Crypto", macro: "Macro" },
    posts: ["The 3 microstructure edges that survived 2024","Why top competitors journal every trade — and how to start","Inside the King of Wall Street competition final","Position sizing frameworks used by prop desks","Perpetuals vs spot: the true cost of leverage","How to trade FOMC weeks — 15 years of data"],
  },
  competitions: {
    meta: { title: "Trading Competitions — Compete for real prizes | HK Global", desc: "Live trading tournaments with six-figure prize pools.", ogTitle: "HK Trading Competitions", ogDesc: "Compete against the world's best." },
    hero: { eyebrow: "Competitions", titleA: "Live tournaments.", titleB: "Real prizes.", subtitle: "Enter free and paid competitions across forex, crypto, indices and stocks." },
    live: "Live now", upcoming: "Upcoming", recent: "Recent winners",
    prizePool: "Prize pool", endsIn: "Ends in", traders: "traders", enter: "Enter competition", register: "Register", starts: "Starts", winner: "Winner",
    types: { monthly: "Monthly", weekly: "Weekly", biweekly: "Bi-weekly", beginner: "Beginner", h24: "24h" },
    liveT: ["King of Wall Street","Crypto Gladiator"],
    upcomingT: ["Forex Masters Cup","Rookie Rumble","Gold Sprint"],
    finishedT: ["Q1 Global Championship","Nasdaq Showdown"],
  },
  contact: {
    meta: { title: "Contact — Get in touch with HK Global Trading", desc: "Talk to our sales, partnerships or support team.", ogTitle: "Contact HK Global Trading", ogDesc: "Reach our teams." },
    hero: { eyebrow: "Contact", titleA: "Let's", titleB: "talk", subtitle: "Sales, partnerships, or press — we typically reply within one business hour." },
    formTitle: "Send us a message",
    fullName: "Full name", email: "Email", subject: "Subject", message: "Message", send: "Send message", sent: "Thanks — we'll be in touch shortly.",
    hqT: "Global HQ", hqB: "One Canada Square, Level 41, London E14 5AB, United Kingdom", emailT: "Email", phoneT: "Phone", officesT: "Offices",
  },
  economic: {
    meta: { title: "Economic Calendar — Live macro events | HK Global Trading", desc: "Live economic calendar.", ogTitle: "HK Economic Calendar", ogDesc: "The macro events that move markets." },
    hero: { eyebrow: "Economic Calendar", titleA: "The events that", titleB: "move markets", subtitle: "Filter every macro release by impact, currency and region." },
    cols: { time: "Time", ccy: "Ccy", event: "Event", impact: "Impact", prev: "Prev", est: "Est" },
    impact: { high: "high", medium: "medium", low: "low" },
    events: ["Non-Farm Payrolls","Unemployment Rate","ISM Services PMI","BoE Rate Decision","German Factory Orders m/m","GDP q/q","RBA Meeting Minutes","BoC Governor Speech"],
  },
  education: {
    meta: { title: "Trading Academy — Courses, videos and webinars | HK Global", desc: "Learn to trade like a pro.", ogTitle: "HK Trading Academy", ogDesc: "Free trading education." },
    hero: { eyebrow: "Education", titleA: "The", titleB: "HK Academy", subtitle: "Everything you need to sharpen your edge — free for HK clients." },
    tracks: {
      coursesT: "Trading Courses", coursesB: "12 full curriculums across beginner, intermediate and pro levels.", coursesS: "220+ lessons",
      videosT: "Video Library", videosB: "On-demand videos across strategy, psychology and technicals.", videosS: "480 videos",
      webinarsT: "Live Webinars", webinarsB: "Weekly sessions with prop-desk traders and quant researchers.", webinarsS: "3× per week",
      ebooksT: "E-books & Guides", ebooksB: "Deep-dive PDFs on market structure, risk and edge design.", ebooksS: "40+ e-books",
      calcT: "Trading Calculators", calcB: "Position sizing, margin, pip value, swap and profit calculators.", calcS: "12 tools",
    },
  },
  faq: {
    meta: { title: "FAQ — Frequently asked questions | HK Global Trading", desc: "Answers to common questions.", ogTitle: "HK Global Trading FAQ", ogDesc: "Straight answers." },
    hero: { eyebrow: "FAQ", titleA: "Frequently asked", titleB: "questions" },
    groups: [
      { title: "Getting started", items: [
        { q: "How do I open an account?", a: "Click Open account, complete our 5-minute onboarding, verify your identity, and fund via card, wire or crypto." },
        { q: "What's the minimum deposit?", a: "The Standard tier starts at $50. Pro and Elite have higher minimums for margin and DMA access." },
        { q: "Can I try before funding?", a: "Yes — every user gets a $100k demo account instantly on signup." },
      ]},
      { title: "Competitions", items: [
        { q: "Are competitions free to enter?", a: "Most competitions are free for eligible funded accounts." },
        { q: "How are winners chosen?", a: "By verified P&L on live trading over the competition period." },
        { q: "When are prizes paid?", a: "Prizes are credited within 72 hours of results being finalized." },
      ]},
      { title: "Security & compliance", items: [
        { q: "Is HK Global Trading regulated?", a: "Yes, we hold licenses across multiple leading global jurisdictions." },
        { q: "How are client funds protected?", a: "Client funds are segregated in tier-1 banks with internal insurance." },
        { q: "Do you support 2FA?", a: "Yes — TOTP and hardware key 2FA is available on every account." },
      ]},
    ],
  },
  markets: {
    meta: { title: "Markets — Forex, Crypto, Stocks, Indices | HK Global Trading", desc: "Trade 10,000+ instruments.", ogTitle: "HK Global Trading Markets", ogDesc: "10,000+ instruments." },
    hero: { eyebrow: "Markets", titleA: "Every market.", titleB: "Every session.", subtitle: "Access 10,000+ instruments through one unified account." },
    groups: [
      { name: "Forex", desc: "60+ major, minor and exotic pairs with raw-spread execution.", specs: ["From 0.0 pips","1:500 leverage","24/5"] },
      { name: "Crypto", desc: "120+ coins with deep liquidity and low commissions.", specs: ["24/7 trading","Perpetual futures","Cold storage"] },
      { name: "Metals", desc: "Gold, silver, platinum and palladium — spot and futures.", specs: ["Physical delivery","Micro contracts","Overnight financing"] },
      { name: "Indices", desc: "30+ global cash and futures indices.", specs: ["S&P 500, Nasdaq","DAX, FTSE, Nikkei","Extended hours"] },
      { name: "Stocks & ETFs", desc: "5,000+ US, European and Asian stocks plus 300 ETFs.", specs: ["Fractional shares","Pre-market","Dividend paid"] },
      { name: "Energy", desc: "Brent, WTI, Natural Gas, Heating Oil.", specs: ["Continuous contracts","Roll-free","Tight spreads"] },
    ],
  },
  news: {
    meta: { title: "Market News — Live analysis and insights | HK Global Trading", desc: "Real-time market news.", ogTitle: "HK Global Trading — Market News", ogDesc: "Live market analysis." },
    hero: { eyebrow: "Market news", titleA: "Live analysis.", titleB: "Real edge.", subtitle: "Daily briefings, deep dives and actionable setups from the HK research desk." },
    ago: "ago",
    items: [
      { tag: "Market brief", time: "2h", title: "Gold breaks $2,400 as central banks pivot dovish", body: "A cluster of policy signals across the ECB, BoE and Fed has sent gold to a fresh all-time high." },
      { tag: "Deep dive", time: "6h", title: "Bitcoin ETF flows point to fresh institutional wave", body: "Weekly BTC ETF inflows crossed $1.8B for the first time since March." },
      { tag: "Signal", time: "1d", title: "EUR/USD sets up a textbook liquidity sweep", body: "Price is trading into a swept high on the 4H." },
      { tag: "Analysis", time: "1d", title: "Semiconductor rally: rotation or resumption?", body: "SOX index is 3% off ATH with breadth improving." },
      { tag: "Macro", time: "2d", title: "Yen carry trade unwinds — how to hedge", body: "Historical playbook for USDJPY reversals." },
      { tag: "Commodity", time: "2d", title: "Brent finds bid on Middle East risk premium", body: "Options market pricing an increased tail risk." },
    ],
  },
  partners: {
    meta: { title: "Partners — Introducing Brokers & Institutional | HK Global", desc: "White-label, IB and institutional partnerships.", ogTitle: "Partner with HK Global Trading", ogDesc: "White-label, IB and institutional." },
    hero: { eyebrow: "Partners", titleA: "Grow with a", titleB: "world-class", titleC: "partner", subtitle: "Three tailored partnership tracks for brokers, fintechs and institutional desks." },
    models: [
      { title: "Introducing Broker", body: "Refer clients and earn ongoing revenue share plus performance bonuses.", cta: "Apply as IB" },
      { title: "White Label", body: "Launch your own broker on HK infrastructure in under 30 days.", cta: "Request a demo" },
      { title: "Institutional", body: "PB-grade liquidity, custom margin and dedicated relationship management.", cta: "Contact desk" },
    ],
  },
  platform: {
    meta: { title: "Trading Platform — HK Global Trading", desc: "Institutional-grade tools.", ogTitle: "The HK Trading Platform", ogDesc: "Pro-grade tools in one terminal." },
    hero: { eyebrow: "Trading Platform", titleA: "The", titleB: "terminal pros trust", subtitle: "Every tool a professional trader needs, unified in a single high-performance interface." },
    features: [
      { title: "Sub-20ms execution", body: "Direct market access with intelligent smart-order routing." },
      { title: "Advanced charting", body: "60+ indicators, drawing tools and multi-timeframe analysis." },
      { title: "Algo & VPS", body: "Deploy strategies in Pine, MQL or Python on our low-latency VPS." },
      { title: "Real-time signals", body: "Curated setups from institutional desks and quant models." },
      { title: "Depth of market", body: "Full L2 book, footprint, and volume profile out of the box." },
      { title: "One-click trading", body: "Custom hotkeys, bracket orders and lightning fast liquidation." },
    ],
    demo: { title: "Try it live in seconds", body: "A pre-funded demo account with $100k in virtual capital — no signup required.", tryDemo: "Try Demo", openLive: "Open Live Account" },
  },
  pricing: {
    meta: { title: "Pricing — Spreads, commissions and account tiers | HK Global", desc: "Transparent pricing.", ogTitle: "HK Global Trading Pricing", ogDesc: "Transparent pricing." },
    hero: { eyebrow: "Pricing", titleA: "Transparent.", titleB: "Ruthlessly fair.", subtitle: "No hidden fees. Choose the tier that fits your style." },
    popular: "Most popular",
    tiers: [
      { name: "Standard", price: "$0", note: "No commission · From 0.6 pips", features: ["Web & mobile terminal","10,000+ instruments","Free education","24/7 support"], cta: "Open account" },
      { name: "Pro", price: "$7", note: "Per lot round-turn · Raw spread from 0.0", features: ["Everything in Standard","Depth of market","VPS included","Priority support","Competition entry credits"], cta: "Upgrade to Pro" },
      { name: "Elite", price: "Custom", note: "Institutional pricing", features: ["Prime brokerage tier","Dedicated relationship manager","Custom margin & leverage","API co-location"], cta: "Talk to sales" },
    ],
  },
  support: {
    meta: { title: "Support Center — 24/7 client care | HK Global Trading", desc: "24/7 support.", ogTitle: "HK Global Support Center", ogDesc: "Human, multilingual support 24/7." },
    hero: { eyebrow: "Support", titleA: "We're here", titleB: "24/7", subtitle: "Real humans. Zero call-center scripts." },
    channels: [
      { title: "Live chat", body: "Average response: 42 seconds. Available in 14 languages.", cta: "Start chat" },
      { title: "Phone", body: "Global toll-free lines with priority routing for Pro & Elite clients.", cta: "See numbers" },
      { title: "Ticket", body: "Complex cases handled by senior specialists within 4 hours.", cta: "Open ticket" },
      { title: "Help center", body: "500+ step-by-step guides covering every feature.", cta: "Browse guides" },
    ],
  },
  auth: {
    tabSignin: "Sign in", tabSignup: "Sign up",
    signinTitle: "Welcome back", signupTitle: "Create your account",
    email: "Email", password: "Password", fullName: "Full name",
    signinBtn: "Sign in", signupBtn: "Create account",
    orContinueWith: "Or continue with", google: "Continue with Google",
    signingIn: "Signing in…", signingUp: "Creating…",
  },
  dashboard: {
    welcome: "Welcome back",
    portfolio: "Portfolio value", pnl: "Today's P&L", competition: "Competition status", kyc: "KYC status",
    portfolioSub: "Across all accounts", pnlSub: "Realized + unrealized", competitionSub: "Live tournaments", kycSub: "Verification level",
  },
};

const ar: PageContent = {
  about: {
    meta: { title: "عن HK Global Trading — قصتنا ورسالتنا وفريقنا", desc: "HK Global Trading منصة وساطة متعددة الأصول تخدم أكثر من 2 مليون متداول في 184 دولة.", ogTitle: "عن HK Global Trading", ogDesc: "القصة وراء أكثر منصات التداول تنافسية في العالم." },
    hero: { eyebrow: "من نحن", titleA: "بُنيت بأيدي المتداولين،", titleB: "لأجل المتداولين", subtitle: "تأسست في 2019، وتجمع HK Global Trading بين التنفيذ المؤسسي ومنظومة مسابقات عالمية — بثقة أكثر من مليوني عميل." },
    stats: { clients: "العملاء النشطون", countries: "الدول", volume: "الحجم الشهري", team: "أعضاء الفريق" },
    values: { missionT: "رسالتنا", missionB: "نمنح كل متداول ميزة تنافسية حقيقية عبر التقنية والتعليم والمسابقات.", valuesT: "قيمنا", valuesB: "تسعير شفاف، أمان بلا تنازلات، وانحياز مطلق لمصلحة العميل.", reachT: "انتشارنا", reachB: "خبرة محلية في خمس قارات، ودعم 24/7 متعدد اللغات، وتراخيص من كبرى الجهات التنظيمية." },
    leadership: { eyebrow: "القيادة", title: "فريق صُنع على قاعات التداول", body: "تجلب قيادتنا عقودًا من الخبرة من Goldman Sachs وJane Street وCoinbase وInteractive Brokers. نبني للمتداولين لأننا متداولون." },
  },
  affiliate: {
    meta: { title: "برنامج الشركاء — اربح حتى 1,200 دولار لكل إحالة | HK Global", desc: "انضم إلى برنامج شركاء HK Global.", ogTitle: "برنامج شركاء HK Global", ogDesc: "اربح حتى 1,200 دولار لكل إحالة ممولة." },
    hero: { eyebrow: "الشركاء", titleA: "أحِل. اربح.", titleB: "كرّر.", subtitle: "حتى 1,200 دولار لكل إحالة ممولة و20% حصة إيرادات مدى الحياة." },
    steps: { linkT: "احصل على رابطك", linkB: "سجّل وأنشئ روابط إحالة مخصصة في ثوانٍ.", referT: "أحِل العملاء", referB: "شارك عبر جمهورك — سوشيال أو مدوّنة أو نشرة.", earnT: "اربح", earnB: "تابع عمولاتك مباشرة واسحبها في أي وقت." },
    commission: { title: "هيكل العمولات", tier1: "المستوى 1", tier2: "المستوى 2", tier3: "المستوى 3", rev: "حصة الإيرادات", d1: "1-5 عملاء شهريًا", d2: "6-20 عميلًا شهريًا", d3: "أكثر من 20 عميلًا شهريًا", d4: "مدى الحياة، جميع المستويات", cta: "كن شريكًا" },
  },
  blog: {
    meta: { title: "المدوّنة — HK Global Trading", desc: "مقالات مطوّلة حول التداول.", ogTitle: "مدوّنة HK Global Trading", ogDesc: "رؤى تداول عميقة." },
    hero: { eyebrow: "المدوّنة", titleA: "تحليلات عميقة،", titleB: "أسبوعيًا", subtitle: "تفكير مطوّل في استراتيجيات التداول والمجتمع." },
    read: "قراءة",
    cats: { strategy: "استراتيجية", psychology: "علم نفس", community: "مجتمع", risk: "المخاطر", crypto: "عملات رقمية", macro: "ماكرو" },
    posts: ["3 ميزات في البنية الدقيقة نجت من 2024","لماذا يدوّن أفضل المتنافسين كل صفقة","من داخل نهائي King of Wall Street","أطر تحديد حجم المراكز في مكاتب الملكية","العقود الدائمة مقابل الفوري: تكلفة الرافعة","التداول في أسابيع الفيدرالي — 15 عامًا من البيانات"],
  },
  competitions: {
    meta: { title: "مسابقات التداول — HK Global", desc: "بطولات مباشرة بجوائز حقيقية.", ogTitle: "مسابقات HK للتداول", ogDesc: "نافس أفضل المتداولين." },
    hero: { eyebrow: "المسابقات", titleA: "بطولات مباشرة.", titleB: "جوائز حقيقية.", subtitle: "مسابقات مجانية ومدفوعة عبر الفوركس والعملات الرقمية والمؤشرات والأسهم." },
    live: "مباشر الآن", upcoming: "قادم", recent: "الفائزون مؤخرًا",
    prizePool: "قيمة الجائزة", endsIn: "ينتهي خلال", traders: "متداول", enter: "شارك", register: "سجّل", starts: "يبدأ", winner: "الفائز",
    types: { monthly: "شهرية", weekly: "أسبوعية", biweekly: "كل أسبوعين", beginner: "مبتدئ", h24: "24 ساعة" },
    liveT: ["ملك وول ستريت","مصارع الكريبتو"],
    upcomingT: ["كأس أساتذة الفوركس","منافسة المبتدئين","سباق الذهب"],
    finishedT: ["البطولة العالمية للربع الأول","مواجهة ناسداك"],
  },
  contact: {
    meta: { title: "تواصل — HK Global Trading", desc: "تحدث مع فرقنا.", ogTitle: "تواصل مع HK Global Trading", ogDesc: "تواصل مع فرقنا." },
    hero: { eyebrow: "تواصل", titleA: "لنَـ", titleB: "تحدّث", subtitle: "مبيعات أو شراكات أو صحافة — نردّ خلال ساعة عمل." },
    formTitle: "أرسل لنا رسالة",
    fullName: "الاسم الكامل", email: "البريد الإلكتروني", subject: "الموضوع", message: "الرسالة", send: "إرسال", sent: "شكرًا — سنتواصل معك قريبًا.",
    hqT: "المقر العالمي", hqB: "One Canada Square, London E14 5AB, المملكة المتحدة", emailT: "البريد الإلكتروني", phoneT: "الهاتف", officesT: "المكاتب",
  },
  economic: {
    meta: { title: "التقويم الاقتصادي — HK Global Trading", desc: "تقويم اقتصادي مباشر.", ogTitle: "التقويم الاقتصادي HK", ogDesc: "الأحداث التي تحرّك الأسواق." },
    hero: { eyebrow: "التقويم الاقتصادي", titleA: "الأحداث التي", titleB: "تحرّك الأسواق", subtitle: "صفّ كل إصدار ماكرو حسب التأثير والعملة والمنطقة." },
    cols: { time: "الوقت", ccy: "العملة", event: "الحدث", impact: "التأثير", prev: "السابق", est: "المتوقع" },
    impact: { high: "عالي", medium: "متوسط", low: "منخفض" },
    events: ["الوظائف غير الزراعية","معدل البطالة","مؤشر ISM للخدمات","قرار سعر الفائدة BoE","طلبات المصانع الألمانية شهريًا","الناتج المحلي ربعيًا","محضر اجتماع RBA","خطاب محافظ BoC"],
  },
  education: {
    meta: { title: "أكاديمية التداول — HK Global", desc: "تعلّم التداول باحتراف.", ogTitle: "أكاديمية HK للتداول", ogDesc: "تعليم تداول مجاني." },
    hero: { eyebrow: "التعليم", titleA: "أكاديمية", titleB: "HK", subtitle: "كل ما تحتاجه لصقل ميزتك — مجانًا لعملاء HK." },
    tracks: {
      coursesT: "دورات التداول", coursesB: "12 منهجًا كاملًا للمبتدئين والمتوسطين والمحترفين.", coursesS: "أكثر من 220 درسًا",
      videosT: "مكتبة الفيديو", videosB: "فيديوهات حسب الطلب في الاستراتيجية وعلم النفس.", videosS: "480 فيديو",
      webinarsT: "ندوات مباشرة", webinarsB: "جلسات أسبوعية مع متداولين وباحثين كميّين.", webinarsS: "3 مرات أسبوعيًا",
      ebooksT: "كتب وأدلة", ebooksB: "ملفات PDF متعمّقة حول بنية السوق والمخاطر.", ebooksS: "أكثر من 40 كتابًا",
      calcT: "حاسبات التداول", calcB: "حجم المركز والهامش وقيمة النقطة والسواب.", calcS: "12 أداة",
    },
  },
  faq: {
    meta: { title: "الأسئلة الشائعة — HK Global Trading", desc: "إجابات على الأسئلة الشائعة.", ogTitle: "أسئلة HK Global Trading", ogDesc: "إجابات مباشرة." },
    hero: { eyebrow: "الأسئلة الشائعة", titleA: "أسئلة متكررة", titleB: "شائعة" },
    groups: [
      { title: "البداية", items: [
        { q: "كيف أفتح حسابًا؟", a: "اضغط فتح حساب، أكمل التسجيل في 5 دقائق، ثم أودع." },
        { q: "ما الحد الأدنى للإيداع؟", a: "يبدأ Standard من 50 دولارًا." },
        { q: "هل يمكنني التجربة قبل الإيداع؟", a: "نعم — كل مستخدم يحصل على حساب تجريبي بقيمة 100 ألف دولار." },
      ]},
      { title: "المسابقات", items: [
        { q: "هل الدخول مجاني؟", a: "معظم المسابقات مجانية للحسابات الممولة المؤهلة." },
        { q: "كيف يُختار الفائزون؟", a: "بحسب الأرباح الموثقة على التداول المباشر." },
        { q: "متى تُدفع الجوائز؟", a: "خلال 72 ساعة من اعتماد النتائج." },
      ]},
      { title: "الأمان والامتثال", items: [
        { q: "هل HK مُنظَّمة؟", a: "نعم، نمتلك تراخيص في عدة ولايات قضائية." },
        { q: "كيف تُحمى أموال العملاء؟", a: "تُفصل في بنوك من الفئة الأولى مع تأمين داخلي." },
        { q: "هل تدعمون المصادقة الثنائية؟", a: "نعم — TOTP ومفاتيح الأجهزة." },
      ]},
    ],
  },
  markets: {
    meta: { title: "الأسواق — HK Global Trading", desc: "تداول أكثر من 10,000 أداة.", ogTitle: "أسواق HK", ogDesc: "أكثر من 10,000 أداة." },
    hero: { eyebrow: "الأسواق", titleA: "كل سوق.", titleB: "كل جلسة.", subtitle: "الوصول إلى أكثر من 10,000 أداة عبر حساب موحّد." },
    groups: [
      { name: "الفوركس", desc: "أكثر من 60 زوجًا رئيسيًا وثانويًا.", specs: ["من 0.0 نقطة","رافعة 1:500","24/5"] },
      { name: "العملات الرقمية", desc: "أكثر من 120 عملة بسيولة عميقة.", specs: ["تداول 24/7","عقود دائمة","تخزين بارد"] },
      { name: "المعادن", desc: "ذهب وفضة وبلاتين وبلاديوم.", specs: ["تسليم مادي","عقود صغيرة","تمويل ليلي"] },
      { name: "المؤشرات", desc: "أكثر من 30 مؤشرًا عالميًا.", specs: ["S&P 500، ناسداك","DAX، FTSE، نيكاي","ساعات موسّعة"] },
      { name: "الأسهم و ETF", desc: "أكثر من 5,000 سهم و300 ETF.", specs: ["أسهم كسرية","قبل السوق","توزيعات مدفوعة"] },
      { name: "الطاقة", desc: "برنت، WTI، الغاز الطبيعي.", specs: ["عقود مستمرة","بدون رول","فروق ضيقة"] },
    ],
  },
  news: {
    meta: { title: "أخبار السوق — HK Global Trading", desc: "أخبار وتحليلات مباشرة.", ogTitle: "HK — أخبار السوق", ogDesc: "تحليل السوق المباشر." },
    hero: { eyebrow: "أخبار السوق", titleA: "تحليل مباشر.", titleB: "ميزة حقيقية.", subtitle: "إحاطات يومية وتحليلات عميقة من مكتب أبحاث HK." },
    ago: "منذ",
    items: [
      { tag: "إحاطة", time: "ساعتان", title: "الذهب يخترق 2,400 دولار مع تحوّل البنوك المركزية", body: "إشارات سياسية دفعت الذهب إلى قمة تاريخية." },
      { tag: "تحليل", time: "6 ساعات", title: "تدفقات ETF البيتكوين تشير إلى موجة مؤسسية جديدة", body: "التدفقات الأسبوعية تجاوزت 1.8 مليار دولار." },
      { tag: "إشارة", time: "يوم", title: "EUR/USD يُعدّ لكنس سيولة نموذجي", body: "السعر يتداول عند قمة تم كنسها على 4H." },
      { tag: "تحليل", time: "يوم", title: "صعود أشباه الموصلات: تدوير أم استئناف؟", body: "SOX على بُعد 3% من قمته التاريخية." },
      { tag: "ماكرو", time: "يومان", title: "تفكيك صفقة الين — كيف تتحوّط", body: "دليل تاريخي لانعكاسات USDJPY." },
      { tag: "سلعة", time: "يومان", title: "برنت يجد طلبًا مع علاوة مخاطر", body: "سوق الخيارات يسعّر مخاطر ذيل متزايدة." },
    ],
  },
  partners: {
    meta: { title: "الشركاء — HK Global", desc: "شراكات White-label و IB والمؤسسات.", ogTitle: "كن شريكًا لـ HK", ogDesc: "White-label و IB والمؤسسات." },
    hero: { eyebrow: "الشركاء", titleA: "انمُ مع شريك", titleB: "عالمي المستوى", titleC: "", subtitle: "ثلاثة مسارات شراكة للوسطاء والفنتك والمكاتب المؤسسية." },
    models: [
      { title: "الوسيط المُقدِّم", body: "أحِل عملاء واكسب حصة إيرادات مستمرة.", cta: "قدّم كـ IB" },
      { title: "العلامة البيضاء", body: "أطلق وساطتك على بنية HK في أقل من 30 يومًا.", cta: "اطلب عرضًا" },
      { title: "المؤسسات", body: "سيولة PB وهامش مخصص وإدارة علاقات.", cta: "تواصل مع المكتب" },
    ],
  },
  platform: {
    meta: { title: "منصة التداول — HK Global Trading", desc: "أدوات مؤسسية.", ogTitle: "منصة HK للتداول", ogDesc: "أدوات احترافية في محطة واحدة." },
    hero: { eyebrow: "منصة التداول", titleA: "المحطة التي", titleB: "يثق بها المحترفون", subtitle: "كل أداة يحتاجها المحترف موحّدة في واجهة عالية الأداء." },
    features: [
      { title: "تنفيذ أقل من 20 مللي ثانية", body: "وصول مباشر للسوق مع توجيه أوامر ذكي." },
      { title: "رسوم بيانية متقدمة", body: "أكثر من 60 مؤشرًا وأدوات رسم." },
      { title: "Algo و VPS", body: "انشر استراتيجياتك في Pine أو MQL أو Python." },
      { title: "إشارات فورية", body: "إعدادات منتقاة من مكاتب المؤسسات." },
      { title: "عمق السوق", body: "دفتر L2 كامل و Footprint و Volume Profile." },
      { title: "تداول بنقرة واحدة", body: "اختصارات مخصصة وأوامر بركت." },
    ],
    demo: { title: "جرّبها مباشرة في ثوانٍ", body: "حساب تجريبي مُموَّل بـ 100 ألف دولار — بدون تسجيل.", tryDemo: "جرّب النسخة التجريبية", openLive: "افتح حسابًا حقيقيًا" },
  },
  pricing: {
    meta: { title: "التسعير — HK Global", desc: "تسعير شفاف.", ogTitle: "تسعير HK Global Trading", ogDesc: "تسعير شفاف." },
    hero: { eyebrow: "التسعير", titleA: "شفاف.", titleB: "عادل بلا رحمة.", subtitle: "لا رسوم خفية. اختر المستوى الذي يناسبك." },
    popular: "الأكثر شعبية",
    tiers: [
      { name: "Standard", price: "$0", note: "بدون عمولة · من 0.6 نقطة", features: ["محطة ويب وموبايل","أكثر من 10,000 أداة","تعليم مجاني","دعم 24/7"], cta: "افتح حسابًا" },
      { name: "Pro", price: "$7", note: "لكل لوت · فروقات خام من 0.0", features: ["كل ما في Standard","عمق السوق","VPS مشمول","دعم أولوية","أرصدة للمسابقات"], cta: "الترقية إلى Pro" },
      { name: "Elite", price: "مخصص", note: "تسعير مؤسسي", features: ["مستوى Prime Brokerage","مدير علاقات مخصص","هامش ورافعة مخصصة","استضافة API"], cta: "تحدث مع المبيعات" },
    ],
  },
  support: {
    meta: { title: "مركز الدعم — HK Global Trading", desc: "دعم 24/7.", ogTitle: "مركز دعم HK", ogDesc: "دعم بشري متعدد اللغات 24/7." },
    hero: { eyebrow: "الدعم", titleA: "نحن هنا", titleB: "24/7", subtitle: "أشخاص حقيقيون. بدون نصوص جاهزة." },
    channels: [
      { title: "الدردشة المباشرة", body: "متوسط الرد: 42 ثانية. بـ 14 لغة.", cta: "ابدأ الدردشة" },
      { title: "الهاتف", body: "خطوط مجانية عالمية بأولوية Pro و Elite.", cta: "شاهد الأرقام" },
      { title: "التذكرة", body: "الحالات المعقدة يعالجها متخصصون خلال 4 ساعات.", cta: "افتح تذكرة" },
      { title: "مركز المساعدة", body: "أكثر من 500 دليل خطوة بخطوة.", cta: "تصفّح الأدلة" },
    ],
  },
  auth: {
    tabSignin: "تسجيل الدخول", tabSignup: "إنشاء حساب",
    signinTitle: "أهلًا بعودتك", signupTitle: "أنشئ حسابك",
    email: "البريد الإلكتروني", password: "كلمة المرور", fullName: "الاسم الكامل",
    signinBtn: "تسجيل الدخول", signupBtn: "إنشاء الحساب",
    orContinueWith: "أو تابع باستخدام", google: "تابع مع Google",
    signingIn: "جارٍ تسجيل الدخول…", signingUp: "جارٍ الإنشاء…",
  },
  dashboard: {
    welcome: "أهلًا بعودتك",
    portfolio: "قيمة المحفظة", pnl: "أرباح/خسائر اليوم", competition: "حالة المسابقة", kyc: "حالة KYC",
    portfolioSub: "عبر كل الحسابات", pnlSub: "محققة + غير محققة", competitionSub: "بطولات مباشرة", kycSub: "مستوى التحقق",
  },
};
