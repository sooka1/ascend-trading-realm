import type { Lang } from "./i18n";

export type StaticPages = {
  legal: {
    eyebrow: string; title: string; subtitle: string;
    sections: { t: string; b: string }[];
    footnote: string;
  };
  privacy: {
    eyebrow: string; title: string; subtitle: string;
    sections: { t: string; b: string }[];
  };
  terms: {
    eyebrow: string; title: string; subtitle: string;
    sections: { t: string; b: string }[];
  };
  risk: {
    eyebrow: string; title: string; subtitle: string;
    pillars: { t: string; b: string }[];
    important: string; disclaimer: string;
  };
  solutions: {
    eyebrow: string; title: string; subtitle: string;
    assets: { t: string; b: string }[];
    ctaPortfolios: string; ctaAdvisor: string;
  };
  performance: {
    eyebrow: string; title: string; subtitle: string;
    chartLabel: string; yearsSuffix: string; illustrative: string;
    cols: { portfolio: string; ytd: string; y1: string; y3: string; vol: string; maxDd: string };
    rows: { name: string }[];
    footnote: string;
  };
  brand: {
    title: string; subtitle: string; download: string;
    labels: { goldSquare: string; whiteSquare: string; blackSquare: string; goldCircle: string; whiteCircle: string; blackCircle: string };
  };
};

const en: StaticPages = {
  legal: {
    eyebrow: "Legal & Compliance",
    title: "Legal & compliance overview",
    subtitle: "Sample legal content — please review with qualified counsel before publication.",
    sections: [
      { t: "Regulatory approach", b: "HK Investment Management operates under applicable regulatory frameworks in the jurisdictions in which it provides services. Client onboarding is subject to KYC (Know Your Customer) and AML (Anti-Money Laundering) verification. This page is a summary and does not constitute the complete regulatory disclosures for any specific jurisdiction." },
      { t: "Risk disclosure", b: "Investing involves risk, including the possible loss of principal. Any target returns discussed on this site are illustrative and are not guaranteed. Past performance is not indicative of, and does not guarantee, future results. Investors should carefully consider their financial objectives, risk tolerance and time horizon before making any investment decision." },
      { t: "Client funds & custody", b: "Client funds are held in segregated accounts with regulated banking and prime brokerage partners. Assets are not commingled with the firm's operational balances." },
      { t: "Conflicts of interest", b: "HK Investment Management maintains policies designed to identify, mitigate and disclose conflicts of interest. Any material conflict is disclosed to affected clients in accordance with applicable rules." },
      { t: "Complaints & contact", b: "Clients may raise concerns via the client portal secure messaging channel or by contacting our compliance team through the Contact page. We aim to acknowledge complaints promptly and provide a substantive response within regulatory timeframes." },
    ],
    footnote: "This content is provided for general information only and does not constitute investment, legal or tax advice.",
  },
  privacy: {
    eyebrow: "Privacy Policy",
    title: "Your data, protected.",
    subtitle: "Sample privacy policy — please review with qualified counsel before publication.",
    sections: [
      { t: "Information we collect", b: "We collect information you provide when opening an account (identity verification, contact details, financial information) and information generated through your use of our services (account activity, portfolio transactions, communications)." },
      { t: "How we use your information", b: "To provide investment services, comply with legal and regulatory obligations (KYC, AML, tax reporting), operate and secure our platform, and communicate with you about your account." },
      { t: "How we protect your information", b: "Data is encrypted in transit (TLS 1.3) and at rest (AES-256). Access is limited on a least-privilege basis and all sensitive operations are logged." },
      { t: "Sharing", b: "We share data only with vetted service providers (custodians, brokers, cloud infrastructure, compliance vendors) under contract, or where legally required." },
      { t: "Your rights", b: "Subject to applicable law you may request access, correction or deletion of your personal information. Please contact us via the client portal or the Contact page." },
      { t: "Contact", b: "Questions about this policy can be sent through the Contact page." },
    ],
  },
  terms: {
    eyebrow: "Terms of Service",
    title: "Terms of service",
    subtitle: "Sample terms — please review with qualified counsel before publication.",
    sections: [
      { t: "Acceptance of terms", b: "By accessing this website or opening an account you agree to these Terms of Service and any additional agreements applicable to specific services." },
      { t: "Eligibility & account opening", b: "Services are offered subject to eligibility, jurisdictional restrictions and successful KYC/AML verification. HK Investment Management may decline or terminate services at its discretion in accordance with law." },
      { t: "No investment advice", b: "Content on this website is provided for general information and does not constitute investment, tax or legal advice. You should consult qualified professionals before making investment decisions." },
      { t: "Risk", b: "Investing involves risk. There is no guarantee that any strategy will achieve its objective. You may lose some or all of your invested capital. Past performance is not indicative of future results." },
      { t: "Intellectual property", b: "All content on this site is the property of HK Investment Management or its licensors and is protected by intellectual property law." },
      { t: "Limitation of liability", b: "To the maximum extent permitted by law, HK Investment Management is not liable for indirect, incidental or consequential damages arising from use of this site." },
      { t: "Governing law", b: "These terms are governed by the laws applicable in the jurisdiction of the service agreement between you and HK Investment Management." },
    ],
  },
  risk: {
    eyebrow: "Risk Management",
    title: "Discipline is the strategy.",
    subtitle: "Durable returns come from avoiding large losses. Our framework enforces that discipline across every managed portfolio.",
    pillars: [
      { t: "Capital preservation", b: "Every strategy begins with a defined loss budget. Positions are constructed to fit inside it." },
      { t: "Position sizing", b: "Volatility-adjusted sizing based on strategy conviction and prevailing market regime." },
      { t: "Portfolio diversification", b: "Uncorrelated exposure across currencies, metals, indices and selective equities." },
      { t: "Continuous monitoring", b: "A 24/6 risk desk with automated alerts and hard limits on drawdown and leverage." },
      { t: "Stress testing", b: "Weekly historical and hypothetical scenarios validate resilience across regimes." },
      { t: "Risk controls", b: "Concentration, leverage and correlated-exposure limits enforced at the platform level." },
    ],
    important: "Important:",
    disclaimer: "All investing involves risk, including the loss of principal. There is no guarantee that any strategy will achieve its objective. Past performance is not indicative of, and does not guarantee, future results. Investors should carefully consider their objectives and risk tolerance before investing.",
  },
  solutions: {
    eyebrow: "Investment Solutions",
    title: "Managed portfolios, tailored to your objectives.",
    subtitle: "Multi-asset solutions across Forex, Gold, Commodities, Indices, Stocks and digital assets — constructed and monitored by our investment team.",
    assets: [
      { t: "Foreign Exchange", b: "Diversified currency exposure across major and select emerging pairs." },
      { t: "Gold & Precious Metals", b: "Strategic and tactical positioning as an inflation and volatility hedge." },
      { t: "Commodities", b: "Rules-based exposure to energy, agriculture and industrial metals." },
      { t: "Indices", b: "Diversified equity index exposure across global markets." },
      { t: "Stocks", b: "Selective single-name exposure managed inside strict risk limits." },
      { t: "Digital Assets", b: "Optional overlay allocation for eligible investors, size-controlled." },
    ],
    ctaPortfolios: "See managed portfolios",
    ctaAdvisor: "Speak with an advisor",
  },
  performance: {
    eyebrow: "Performance",
    title: "Track record, reported with clarity.",
    subtitle: "Illustrative performance figures for our managed portfolio strategies. Detailed monthly and annual statements are available in the client portal.",
    chartLabel: "Balanced Growth Portfolio — cumulative return",
    yearsSuffix: "3Y",
    illustrative: "Illustrative",
    cols: { portfolio: "Portfolio", ytd: "YTD", y1: "1Y", y3: "3Y", vol: "Volatility", maxDd: "Max drawdown" },
    rows: [{ name: "Conservative" }, { name: "Balanced" }, { name: "Growth" }],
    footnote: "Performance figures shown are illustrative and net of a hypothetical fee schedule. Past performance is not indicative of, and does not guarantee, future results. Investing involves risk, including loss of principal.",
  },
  brand: {
    title: "Brand Assets",
    subtitle: "Optimized 1024×1024 profile logos for social media. Right-click or use the download button to save.",
    download: "Download",
    labels: { goldSquare: "Gold · Square", whiteSquare: "White · Square", blackSquare: "Black · Square", goldCircle: "Gold · Circle", whiteCircle: "White · Circle", blackCircle: "Black · Circle" },
  },
};

const ar: StaticPages = {
  legal: {
    eyebrow: "القانوني والامتثال",
    title: "نظرة عامة على القانوني والامتثال",
    subtitle: "محتوى قانوني نموذجي — يُرجى مراجعته مع مستشار قانوني مؤهّل قبل النشر.",
    sections: [
      { t: "النهج التنظيمي", b: "تعمل HK Investment Management وفق الأطر التنظيمية المعمول بها في الولايات القضائية التي تقدّم فيها خدماتها. يخضع فتح حسابات العملاء لإجراءات التحقق من الهوية (KYC) ومكافحة غسل الأموال (AML). هذه الصفحة ملخّص ولا تُشكّل الإفصاحات التنظيمية الكاملة لأي ولاية قضائية بعينها." },
      { t: "الإفصاح عن المخاطر", b: "ينطوي الاستثمار على مخاطر، بما في ذلك احتمال خسارة رأس المال. أي عوائد مستهدفة تُذكر في هذا الموقع هي أرقام توضيحية وغير مضمونة. الأداء السابق ليس مؤشرًا على النتائج المستقبلية ولا يضمنها. على المستثمرين تقييم أهدافهم المالية وتحمّلهم للمخاطر وأفقهم الزمني بعناية قبل اتخاذ أي قرار استثماري." },
      { t: "أموال العملاء والحفظ", b: "تُحفظ أموال العملاء في حسابات مفصولة لدى شركاء مصرفيين ومؤسسات وساطة رئيسية خاضعة للرقابة. لا تُخلط الأصول مع الأرصدة التشغيلية للشركة." },
      { t: "تضارب المصالح", b: "تحتفظ HK Investment Management بسياسات مصمَّمة لتحديد وتخفيف والإفصاح عن تضارب المصالح. يُفصَح عن أي تضارب جوهري للعملاء المتأثرين وفقًا للقواعد المعمول بها." },
      { t: "الشكاوى والتواصل", b: "يمكن للعملاء رفع مخاوفهم عبر قناة الرسائل الآمنة في بوابة العملاء أو من خلال التواصل مع فريق الامتثال عبر صفحة الاتصال. نسعى للإقرار بالشكاوى فورًا وتقديم ردٍّ موضوعي خلال الأطر التنظيمية." },
    ],
    footnote: "يُقدَّم هذا المحتوى للمعلومات العامة فقط ولا يُشكّل مشورة استثمارية أو قانونية أو ضريبية.",
  },
  privacy: {
    eyebrow: "سياسة الخصوصية",
    title: "بياناتك محميّة.",
    subtitle: "سياسة خصوصية نموذجية — يُرجى مراجعتها مع مستشار قانوني مؤهّل قبل النشر.",
    sections: [
      { t: "المعلومات التي نجمعها", b: "نجمع المعلومات التي تقدّمها عند فتح الحساب (التحقق من الهوية، بيانات التواصل، المعلومات المالية) والمعلومات الناتجة عن استخدامك لخدماتنا (نشاط الحساب، معاملات المحفظة، الاتصالات)." },
      { t: "كيف نستخدم معلوماتك", b: "لتقديم الخدمات الاستثمارية، والامتثال للالتزامات القانونية والتنظيمية (KYC، AML، الإبلاغ الضريبي)، وتشغيل منصّتنا وتأمينها، والتواصل معك بشأن حسابك." },
      { t: "كيف نحمي معلوماتك", b: "تُشفَّر البيانات أثناء النقل (TLS 1.3) وأثناء التخزين (AES-256). الوصول مُقيَّد وفق مبدأ الحد الأدنى من الامتيازات ويتم تسجيل جميع العمليات الحسّاسة." },
      { t: "المشاركة", b: "نشارك البيانات فقط مع مزوّدي خدمات موثّقين (أمناء الحفظ، الوسطاء، البنية السحابية، مزوّدو الامتثال) بموجب عقود، أو عند الاقتضاء قانونًا." },
      { t: "حقوقك", b: "وفقًا للقانون المعمول به، يحق لك طلب الاطلاع على معلوماتك الشخصية أو تصحيحها أو حذفها. يُرجى التواصل معنا عبر بوابة العملاء أو صفحة الاتصال." },
      { t: "التواصل", b: "يمكن إرسال الأسئلة حول هذه السياسة عبر صفحة الاتصال." },
    ],
  },
  terms: {
    eyebrow: "شروط الخدمة",
    title: "شروط الخدمة",
    subtitle: "شروط نموذجية — يُرجى مراجعتها مع مستشار قانوني مؤهّل قبل النشر.",
    sections: [
      { t: "قبول الشروط", b: "بوصولك إلى هذا الموقع أو فتحك لحساب فإنك توافق على شروط الخدمة هذه وأي اتفاقيات إضافية سارية على خدمات محدّدة." },
      { t: "الأهلية وفتح الحساب", b: "تُقدَّم الخدمات وفق الأهلية والقيود القضائية والتحقق الناجح من KYC/AML. يجوز لـ HK Investment Management رفض أو إنهاء الخدمات وفق تقديرها وطبقًا للقانون." },
      { t: "لا تُقدَّم مشورة استثمارية", b: "المحتوى في هذا الموقع مقدَّم للمعلومات العامة ولا يُشكّل مشورة استثمارية أو ضريبية أو قانونية. يجب استشارة مختصّين مؤهّلين قبل اتخاذ قرارات استثمارية." },
      { t: "المخاطر", b: "ينطوي الاستثمار على مخاطر. لا يوجد ضمان بأن أي استراتيجية ستحقق هدفها. قد تخسر جزءًا من رأس المال أو كامله. الأداء السابق ليس مؤشرًا على النتائج المستقبلية." },
      { t: "الملكية الفكرية", b: "جميع المحتويات في هذا الموقع مملوكة لـ HK Investment Management أو المرخّصين لها ومحمية بموجب قوانين الملكية الفكرية." },
      { t: "حدود المسؤولية", b: "إلى أقصى حدٍّ يسمح به القانون، لا تتحمّل HK Investment Management مسؤولية الأضرار غير المباشرة أو العرضية أو التبعية الناجمة عن استخدام هذا الموقع." },
      { t: "القانون الحاكم", b: "تخضع هذه الشروط للقوانين المعمول بها في الولاية القضائية لاتفاقية الخدمة بينك وبين HK Investment Management." },
    ],
  },
  risk: {
    eyebrow: "إدارة المخاطر",
    title: "الانضباط هو الاستراتيجية.",
    subtitle: "العوائد المستدامة تأتي من تجنّب الخسائر الكبيرة. إطار عملنا يفرض هذا الانضباط عبر كل محفظة مُدارة.",
    pillars: [
      { t: "حفظ رأس المال", b: "كل استراتيجية تبدأ بميزانية خسارة محدّدة. تُبنى المراكز لتلائم هذه الميزانية." },
      { t: "تحديد أحجام المراكز", b: "أحجام معدَّلة بحسب التقلّبات، بناءً على قناعة الاستراتيجية ونظام السوق السائد." },
      { t: "تنويع المحفظة", b: "انكشاف غير مترابط عبر العملات والمعادن والمؤشرات وأسهم مختارة." },
      { t: "مراقبة مستمرّة", b: "مكتب مخاطر يعمل 24/6 مع تنبيهات آلية وحدود صارمة للسحب والرافعة." },
      { t: "اختبارات الضغط", b: "سيناريوهات تاريخية وافتراضية أسبوعية تُثبت المرونة عبر الأنظمة." },
      { t: "ضوابط المخاطر", b: "حدود التركّز والرافعة والانكشاف المترابط تُطبَّق على مستوى المنصّة." },
    ],
    important: "هام:",
    disclaimer: "كل استثمار ينطوي على مخاطر، بما في ذلك خسارة رأس المال. لا يوجد ضمان بأن أي استراتيجية ستحقق هدفها. الأداء السابق ليس مؤشرًا على النتائج المستقبلية ولا يضمنها. على المستثمرين تقييم أهدافهم وتحمّلهم للمخاطر بعناية قبل الاستثمار.",
  },
  solutions: {
    eyebrow: "الحلول الاستثمارية",
    title: "محافظ مُدارة، مصمَّمة لأهدافك.",
    subtitle: "حلول متعدّدة الأصول عبر الفوركس والذهب والسلع والمؤشرات والأسهم والأصول الرقمية — تُنشأ وتُراقَب من قِبل فريقنا الاستثماري.",
    assets: [
      { t: "الفوركس", b: "انكشاف متنوّع على العملات عبر الأزواج الرئيسية ومختارة من الناشئة." },
      { t: "الذهب والمعادن الثمينة", b: "تمركز استراتيجي وتكتيكي كتحوّط ضد التضخم والتقلّبات." },
      { t: "السلع", b: "انكشاف قائم على القواعد على الطاقة والزراعة والمعادن الصناعية." },
      { t: "المؤشرات", b: "انكشاف متنوّع على مؤشرات الأسهم عبر الأسواق العالمية." },
      { t: "الأسهم", b: "انكشاف انتقائي على أسهم فردية ضمن حدود مخاطر صارمة." },
      { t: "الأصول الرقمية", b: "تخصيص إضافي اختياري للمستثمرين المؤهّلين، بحجم محكوم." },
    ],
    ctaPortfolios: "استعرض المحافظ المُدارة",
    ctaAdvisor: "تحدّث مع مستشار",
  },
  performance: {
    eyebrow: "الأداء",
    title: "سجلّ أداء يُعرض بوضوح.",
    subtitle: "أرقام أداء توضيحية لاستراتيجيات محافظنا المُدارة. الكشوف الشهرية والسنوية التفصيلية متاحة في بوابة العملاء.",
    chartLabel: "محفظة النمو المتوازن — العائد التراكمي",
    yearsSuffix: "3 سنوات",
    illustrative: "توضيحي",
    cols: { portfolio: "المحفظة", ytd: "منذ بداية السنة", y1: "سنة", y3: "3 سنوات", vol: "التقلّب", maxDd: "أقصى تراجع" },
    rows: [{ name: "متحفّظة" }, { name: "متوازنة" }, { name: "نمو" }],
    footnote: "أرقام الأداء المعروضة توضيحية وصافية بعد رسوم افتراضية. الأداء السابق ليس مؤشرًا على النتائج المستقبلية ولا يضمنها. ينطوي الاستثمار على مخاطر بما في ذلك خسارة رأس المال.",
  },
  brand: {
    title: "الأصول التسويقية",
    subtitle: "شعارات ملفات شخصية 1024×1024 مُحسَّنة لوسائل التواصل الاجتماعي. انقر بزر الفأرة الأيمن أو استخدم زر التنزيل للحفظ.",
    download: "تنزيل",
    labels: { goldSquare: "ذهبي · مربّع", whiteSquare: "أبيض · مربّع", blackSquare: "أسود · مربّع", goldCircle: "ذهبي · دائري", whiteCircle: "أبيض · دائري", blackCircle: "أسود · دائري" },
  },
};

const fr: StaticPages = {
  legal: {
    eyebrow: "Juridique et Conformité",
    title: "Aperçu juridique et de conformité",
    subtitle: "Contenu juridique indicatif — à revoir avec un conseil qualifié avant publication.",
    sections: [
      { t: "Approche réglementaire", b: "HK Investment Management opère selon les cadres réglementaires applicables dans les juridictions où elle fournit ses services. L'ouverture de compte est soumise à la vérification KYC et AML. Cette page est un résumé et ne constitue pas l'ensemble des informations réglementaires pour une juridiction donnée." },
      { t: "Divulgation des risques", b: "L'investissement comporte des risques, y compris la perte possible du capital. Les rendements cibles présentés sont indicatifs et ne sont pas garantis. Les performances passées ne préjugent pas des résultats futurs. Les investisseurs doivent examiner leurs objectifs financiers, leur tolérance au risque et leur horizon." },
      { t: "Fonds clients et conservation", b: "Les fonds des clients sont détenus sur des comptes ségrégués auprès de partenaires bancaires et de courtiers principaux réglementés. Les actifs ne sont pas mêlés aux comptes opérationnels de la société." },
      { t: "Conflits d'intérêts", b: "HK Investment Management applique des politiques d'identification, d'atténuation et de divulgation des conflits d'intérêts. Tout conflit important est divulgué aux clients concernés conformément aux règles applicables." },
      { t: "Réclamations et contact", b: "Les clients peuvent soulever leurs préoccupations via la messagerie sécurisée du portail ou en contactant l'équipe conformité via la page Contact. Nous accusons réception rapidement et répondons dans les délais réglementaires." },
    ],
    footnote: "Ce contenu est fourni à titre informatif général et ne constitue pas un conseil en investissement, juridique ou fiscal.",
  },
  privacy: {
    eyebrow: "Politique de confidentialité",
    title: "Vos données, protégées.",
    subtitle: "Politique indicative — à revoir avec un conseil qualifié avant publication.",
    sections: [
      { t: "Informations que nous collectons", b: "Nous collectons les informations fournies à l'ouverture du compte (identité, contact, informations financières) et celles générées par l'usage de nos services (activité du compte, transactions, communications)." },
      { t: "Utilisation de vos informations", b: "Pour fournir nos services, respecter les obligations légales (KYC, AML, déclarations fiscales), exploiter et sécuriser la plateforme, et communiquer avec vous." },
      { t: "Protection de vos informations", b: "Chiffrement en transit (TLS 1.3) et au repos (AES-256). Accès limité selon le moindre privilège, opérations sensibles journalisées." },
      { t: "Partage", b: "Nous partageons les données uniquement avec des prestataires vérifiés (dépositaires, courtiers, cloud, conformité) sous contrat, ou lorsque la loi l'exige." },
      { t: "Vos droits", b: "Sous réserve du droit applicable, vous pouvez demander l'accès, la rectification ou la suppression de vos données. Contactez-nous via le portail ou la page Contact." },
      { t: "Contact", b: "Les questions sur cette politique peuvent être adressées via la page Contact." },
    ],
  },
  terms: {
    eyebrow: "Conditions d'utilisation",
    title: "Conditions d'utilisation",
    subtitle: "Modèle — à revoir avec un conseil qualifié avant publication.",
    sections: [
      { t: "Acceptation des conditions", b: "En accédant à ce site ou en ouvrant un compte, vous acceptez ces conditions et tout accord supplémentaire applicable." },
      { t: "Éligibilité et ouverture de compte", b: "Les services sont soumis à éligibilité, restrictions juridictionnelles et vérification KYC/AML. HK Investment Management peut refuser ou résilier à sa discrétion conformément à la loi." },
      { t: "Absence de conseil", b: "Le contenu est fourni à titre informatif général et ne constitue pas un conseil en investissement, fiscal ou juridique. Consultez des professionnels qualifiés." },
      { t: "Risque", b: "L'investissement comporte des risques. Aucune stratégie n'est garantie. Vous pouvez perdre une partie ou la totalité du capital. Les performances passées ne préjugent pas de l'avenir." },
      { t: "Propriété intellectuelle", b: "Tout le contenu appartient à HK Investment Management ou ses concédants et est protégé par le droit de la propriété intellectuelle." },
      { t: "Limitation de responsabilité", b: "Dans la mesure permise par la loi, HK Investment Management n'est pas responsable des dommages indirects ou consécutifs liés à l'usage du site." },
      { t: "Droit applicable", b: "Ces conditions sont régies par les lois applicables à l'accord de service entre vous et HK Investment Management." },
    ],
  },
  risk: {
    eyebrow: "Gestion du risque",
    title: "La discipline est la stratégie.",
    subtitle: "Les rendements durables viennent d'éviter les grosses pertes. Notre cadre impose cette discipline à chaque portefeuille géré.",
    pillars: [
      { t: "Préservation du capital", b: "Chaque stratégie démarre avec un budget de perte défini. Les positions y sont ajustées." },
      { t: "Dimensionnement des positions", b: "Tailles ajustées à la volatilité selon la conviction et le régime de marché." },
      { t: "Diversification", b: "Expositions décorrélées sur devises, métaux, indices et actions sélectionnées." },
      { t: "Surveillance continue", b: "Bureau des risques 24/6 avec alertes et limites strictes de drawdown et de levier." },
      { t: "Tests de résistance", b: "Scénarios historiques et hypothétiques hebdomadaires validant la résilience." },
      { t: "Contrôles de risque", b: "Limites de concentration, de levier et d'exposition corrélée appliquées à la plateforme." },
    ],
    important: "Important :",
    disclaimer: "Tout investissement comporte des risques, y compris la perte du capital. Aucune stratégie n'est garantie. Les performances passées ne préjugent pas des résultats futurs. Les investisseurs doivent examiner leurs objectifs et leur tolérance au risque.",
  },
  solutions: {
    eyebrow: "Solutions d'investissement",
    title: "Portefeuilles gérés, adaptés à vos objectifs.",
    subtitle: "Solutions multi-actifs sur Forex, Or, Matières premières, Indices, Actions et actifs numériques — construites et suivies par notre équipe.",
    assets: [
      { t: "Forex", b: "Exposition diversifiée aux devises, paires majeures et émergentes sélectionnées." },
      { t: "Or & Métaux précieux", b: "Positionnement stratégique et tactique comme couverture." },
      { t: "Matières premières", b: "Exposition basée sur règles à l'énergie, l'agriculture et les métaux industriels." },
      { t: "Indices", b: "Exposition diversifiée aux indices actions mondiaux." },
      { t: "Actions", b: "Exposition sélective à des titres individuels dans des limites strictes." },
      { t: "Actifs numériques", b: "Allocation optionnelle contrôlée pour investisseurs éligibles." },
    ],
    ctaPortfolios: "Voir les portefeuilles gérés",
    ctaAdvisor: "Parler à un conseiller",
  },
  performance: {
    eyebrow: "Performance",
    title: "Historique, présenté avec clarté.",
    subtitle: "Chiffres de performance indicatifs pour nos stratégies gérées. Relevés mensuels et annuels détaillés dans le portail client.",
    chartLabel: "Portefeuille Équilibré Croissance — rendement cumulé",
    yearsSuffix: "3A",
    illustrative: "Indicatif",
    cols: { portfolio: "Portefeuille", ytd: "YTD", y1: "1A", y3: "3A", vol: "Volatilité", maxDd: "Drawdown max" },
    rows: [{ name: "Prudent" }, { name: "Équilibré" }, { name: "Croissance" }],
    footnote: "Les chiffres sont indicatifs, nets d'un barème de frais hypothétique. Les performances passées ne préjugent pas de l'avenir. L'investissement comporte des risques.",
  },
  brand: {
    title: "Ressources de marque",
    subtitle: "Logos de profil 1024×1024 optimisés pour les réseaux sociaux. Clic droit ou bouton de téléchargement pour sauvegarder.",
    download: "Télécharger",
    labels: { goldSquare: "Or · Carré", whiteSquare: "Blanc · Carré", blackSquare: "Noir · Carré", goldCircle: "Or · Rond", whiteCircle: "Blanc · Rond", blackCircle: "Noir · Rond" },
  },
};

const es: StaticPages = {
  legal: {
    eyebrow: "Legal y Cumplimiento",
    title: "Resumen legal y de cumplimiento",
    subtitle: "Contenido legal de muestra — revise con asesoría cualificada antes de publicar.",
    sections: [
      { t: "Enfoque regulatorio", b: "HK Investment Management opera bajo los marcos regulatorios aplicables en las jurisdicciones donde presta servicios. La incorporación de clientes está sujeta a verificación KYC y AML. Esta página es un resumen y no constituye la divulgación regulatoria completa." },
      { t: "Divulgación de riesgos", b: "Invertir implica riesgo, incluida la posible pérdida del principal. Los retornos objetivo son ilustrativos y no están garantizados. El rendimiento pasado no garantiza resultados futuros. Los inversores deben considerar sus objetivos, tolerancia al riesgo y horizonte." },
      { t: "Fondos y custodia", b: "Los fondos de los clientes se mantienen en cuentas segregadas con socios bancarios y de brokerage regulados. Los activos no se mezclan con los balances operativos." },
      { t: "Conflictos de interés", b: "HK Investment Management mantiene políticas para identificar, mitigar y divulgar conflictos de interés. Los conflictos materiales se divulgan a los clientes afectados." },
      { t: "Reclamaciones y contacto", b: "Los clientes pueden plantear inquietudes vía la mensajería segura del portal o el equipo de cumplimiento en Contacto. Respondemos dentro de los plazos regulatorios." },
    ],
    footnote: "Este contenido es solo informativo y no constituye asesoramiento de inversión, legal ni fiscal.",
  },
  privacy: {
    eyebrow: "Política de Privacidad",
    title: "Tus datos, protegidos.",
    subtitle: "Política de muestra — revise con asesoría cualificada antes de publicar.",
    sections: [
      { t: "Información que recopilamos", b: "Recopilamos la información que proporcionas al abrir cuenta (identidad, contacto, información financiera) y la generada por el uso de nuestros servicios (actividad, transacciones, comunicaciones)." },
      { t: "Cómo usamos tu información", b: "Para prestar servicios, cumplir obligaciones legales (KYC, AML, reporte fiscal), operar y asegurar la plataforma y comunicarnos contigo." },
      { t: "Cómo protegemos tu información", b: "Cifrado en tránsito (TLS 1.3) y en reposo (AES-256). Acceso con privilegio mínimo y registro de operaciones sensibles." },
      { t: "Compartición", b: "Compartimos datos solo con proveedores verificados (custodios, brokers, cloud, cumplimiento) bajo contrato o cuando lo exige la ley." },
      { t: "Tus derechos", b: "Sujeto a la ley aplicable, puedes solicitar acceso, corrección o eliminación de tus datos vía el portal o la página de Contacto." },
      { t: "Contacto", b: "Preguntas sobre esta política pueden enviarse a través de la página de Contacto." },
    ],
  },
  terms: {
    eyebrow: "Términos del Servicio",
    title: "Términos del servicio",
    subtitle: "Muestra — revise con asesoría cualificada antes de publicar.",
    sections: [
      { t: "Aceptación", b: "Al acceder al sitio o abrir cuenta aceptas estos Términos y cualquier acuerdo adicional aplicable." },
      { t: "Elegibilidad y apertura", b: "Los servicios están sujetos a elegibilidad, restricciones jurisdiccionales y verificación KYC/AML. HK puede rechazar o terminar servicios conforme a la ley." },
      { t: "Sin asesoramiento", b: "El contenido es informativo y no constituye asesoramiento de inversión, fiscal ni legal. Consulta profesionales cualificados." },
      { t: "Riesgo", b: "Invertir implica riesgo. Ninguna estrategia está garantizada. Puedes perder parte o todo el capital. El rendimiento pasado no predice el futuro." },
      { t: "Propiedad intelectual", b: "Todo el contenido pertenece a HK Investment Management o sus licenciantes y está protegido por la ley de propiedad intelectual." },
      { t: "Limitación de responsabilidad", b: "En la medida permitida por la ley, HK no responde por daños indirectos, incidentales o consecuentes." },
      { t: "Ley aplicable", b: "Estos términos se rigen por las leyes aplicables al acuerdo de servicio entre tú y HK Investment Management." },
    ],
  },
  risk: {
    eyebrow: "Gestión de Riesgo",
    title: "La disciplina es la estrategia.",
    subtitle: "Los retornos sostenibles vienen de evitar grandes pérdidas. Nuestro marco impone esa disciplina en cada portafolio gestionado.",
    pillars: [
      { t: "Preservación del capital", b: "Cada estrategia comienza con un presupuesto de pérdida definido." },
      { t: "Dimensionamiento", b: "Tamaños ajustados a volatilidad según convicción y régimen de mercado." },
      { t: "Diversificación", b: "Exposición no correlacionada en divisas, metales, índices y acciones seleccionadas." },
      { t: "Monitoreo continuo", b: "Mesa de riesgo 24/6 con alertas y límites duros de drawdown y apalancamiento." },
      { t: "Pruebas de estrés", b: "Escenarios semanales que validan la resiliencia en distintos regímenes." },
      { t: "Controles", b: "Límites de concentración, apalancamiento y exposición correlacionada aplicados a nivel plataforma." },
    ],
    important: "Importante:",
    disclaimer: "Toda inversión implica riesgo, incluida la pérdida del principal. Ninguna estrategia está garantizada. El rendimiento pasado no predice el futuro.",
  },
  solutions: {
    eyebrow: "Soluciones de Inversión",
    title: "Portafolios gestionados a tus objetivos.",
    subtitle: "Soluciones multi-activo en Forex, Oro, Commodities, Índices, Acciones y activos digitales — construidas y monitoreadas por nuestro equipo.",
    assets: [
      { t: "Forex", b: "Exposición diversificada a divisas: pares mayores y emergentes seleccionados." },
      { t: "Oro y metales preciosos", b: "Posicionamiento estratégico y táctico como cobertura." },
      { t: "Commodities", b: "Exposición basada en reglas a energía, agricultura y metales." },
      { t: "Índices", b: "Exposición diversificada a índices bursátiles globales." },
      { t: "Acciones", b: "Exposición selectiva a nombres individuales bajo límites estrictos." },
      { t: "Activos digitales", b: "Asignación opcional controlada para inversores elegibles." },
    ],
    ctaPortfolios: "Ver portafolios gestionados",
    ctaAdvisor: "Hablar con un asesor",
  },
  performance: {
    eyebrow: "Rendimiento",
    title: "Historial, reportado con claridad.",
    subtitle: "Cifras ilustrativas para nuestras estrategias gestionadas. Los estados detallados están en el portal del cliente.",
    chartLabel: "Portafolio Crecimiento Equilibrado — retorno acumulado",
    yearsSuffix: "3A",
    illustrative: "Ilustrativo",
    cols: { portfolio: "Portafolio", ytd: "YTD", y1: "1A", y3: "3A", vol: "Volatilidad", maxDd: "Drawdown máx" },
    rows: [{ name: "Conservador" }, { name: "Equilibrado" }, { name: "Crecimiento" }],
    footnote: "Cifras ilustrativas netas de una tarifa hipotética. El rendimiento pasado no predice el futuro. Invertir implica riesgo.",
  },
  brand: {
    title: "Recursos de Marca",
    subtitle: "Logos de perfil 1024×1024 optimizados para redes sociales. Clic derecho o botón de descarga para guardar.",
    download: "Descargar",
    labels: { goldSquare: "Oro · Cuadrado", whiteSquare: "Blanco · Cuadrado", blackSquare: "Negro · Cuadrado", goldCircle: "Oro · Círculo", whiteCircle: "Blanco · Círculo", blackCircle: "Negro · Círculo" },
  },
};

const tr: StaticPages = {
  legal: {
    eyebrow: "Yasal ve Uyum",
    title: "Yasal ve uyum genel bakışı",
    subtitle: "Örnek yasal içerik — yayımlamadan önce yetkili danışmanla gözden geçirin.",
    sections: [
      { t: "Düzenleyici yaklaşım", b: "HK Investment Management, hizmet verdiği yetki alanlarındaki geçerli düzenleyici çerçevelere göre faaliyet gösterir. Müşteri kabulü KYC ve AML doğrulamasına tabidir. Bu sayfa bir özettir." },
      { t: "Risk açıklaması", b: "Yatırım, ana paranın kaybı dahil risk içerir. Sunulan hedef getiriler yalnızca örnektir ve garanti değildir. Geçmiş performans gelecek sonuçların göstergesi değildir." },
      { t: "Müşteri fonları ve saklama", b: "Müşteri fonları düzenlenmiş banka ve prime broker ortaklarında ayrıştırılmış hesaplarda tutulur. Varlıklar şirket operasyonel bakiyeleriyle karıştırılmaz." },
      { t: "Çıkar çatışmaları", b: "HK Investment Management, çıkar çatışmalarını tanımlayan, azaltan ve açıklayan politikalara sahiptir." },
      { t: "Şikâyet ve iletişim", b: "Müşteriler kaygılarını müşteri portalı güvenli mesajlaşmasıyla veya İletişim sayfası üzerinden uyum ekibine iletebilir." },
    ],
    footnote: "Bu içerik yalnızca genel bilgi amaçlıdır ve yatırım, hukuki veya vergi tavsiyesi teşkil etmez.",
  },
  privacy: {
    eyebrow: "Gizlilik Politikası",
    title: "Verileriniz korunur.",
    subtitle: "Örnek politika — yayımlamadan önce yetkili danışmanla gözden geçirin.",
    sections: [
      { t: "Topladığımız bilgiler", b: "Hesap açarken sağladığınız bilgileri (kimlik doğrulama, iletişim, finansal bilgi) ve hizmet kullanımınızla oluşan bilgileri (hesap etkinliği, işlemler, iletişim) toplarız." },
      { t: "Bilgilerinizi nasıl kullanırız", b: "Yatırım hizmetleri sağlamak, yasal yükümlülüklere uymak (KYC, AML, vergi raporlama), platformu işletmek ve güvenli tutmak, sizinle iletişim kurmak için." },
      { t: "Bilgilerinizi nasıl koruruz", b: "Veriler aktarımda (TLS 1.3) ve saklanırken (AES-256) şifrelenir. Erişim en az ayrıcalık ilkesiyle sınırlıdır." },
      { t: "Paylaşım", b: "Verileri yalnızca sözleşmeli, doğrulanmış hizmet sağlayıcılarla veya yasa gereği paylaşırız." },
      { t: "Haklarınız", b: "Yasa uyarınca kişisel bilgilerinize erişim, düzeltme veya silme talep edebilirsiniz." },
      { t: "İletişim", b: "Bu politika hakkındaki sorular İletişim sayfası üzerinden gönderilebilir." },
    ],
  },
  terms: {
    eyebrow: "Hizmet Şartları",
    title: "Hizmet şartları",
    subtitle: "Örnek şartlar — yayımlamadan önce yetkili danışmanla gözden geçirin.",
    sections: [
      { t: "Şartların kabulü", b: "Bu web sitesine erişerek veya hesap açarak bu şartları ve ilgili ek anlaşmaları kabul edersiniz." },
      { t: "Uygunluk ve hesap açma", b: "Hizmetler uygunluk, bölgesel kısıtlamalar ve başarılı KYC/AML doğrulamasına tabidir." },
      { t: "Yatırım tavsiyesi yok", b: "Bu içerik genel bilgilendirmedir ve yatırım, vergi veya hukuki tavsiye teşkil etmez." },
      { t: "Risk", b: "Yatırım risk içerir. Hiçbir strateji hedefine ulaşacağını garanti etmez. Sermayenizin bir kısmını veya tamamını kaybedebilirsiniz." },
      { t: "Fikri mülkiyet", b: "Bu sitedeki tüm içerik HK Investment Management veya lisans verenlerine aittir." },
      { t: "Sorumluluk sınırı", b: "Yasanın izin verdiği azami ölçüde HK, dolaylı veya arızi zararlardan sorumlu değildir." },
      { t: "Geçerli hukuk", b: "Bu şartlar, sizinle HK arasındaki hizmet anlaşmasının yetki alanındaki yasalara tabidir." },
    ],
  },
  risk: {
    eyebrow: "Risk Yönetimi",
    title: "Disiplin, stratejinin kendisidir.",
    subtitle: "Kalıcı getiri, büyük kayıpları önlemekten gelir. Çerçevemiz her yönetilen portföyde bu disiplini uygular.",
    pillars: [
      { t: "Sermaye koruması", b: "Her strateji tanımlı bir kayıp bütçesiyle başlar." },
      { t: "Pozisyon boyutlandırma", b: "Kanaate ve piyasa rejimine göre volatiliteye ayarlı boyutlandırma." },
      { t: "Çeşitlendirme", b: "Döviz, metal, endeks ve seçili hisselerde korelasyonsuz maruziyet." },
      { t: "Sürekli izleme", b: "Otomatik uyarılarla 24/6 risk masası ve sıkı sınırlar." },
      { t: "Stres testleri", b: "Haftalık tarihsel ve varsayımsal senaryolar." },
      { t: "Risk kontrolleri", b: "Konsantrasyon, kaldıraç ve korelasyonlu maruziyet limitleri platform düzeyinde uygulanır." },
    ],
    important: "Önemli:",
    disclaimer: "Tüm yatırımlar risk içerir, ana para kaybı dahil. Hiçbir strateji hedefini garanti etmez. Geçmiş performans gelecek sonuçların göstergesi değildir.",
  },
  solutions: {
    eyebrow: "Yatırım Çözümleri",
    title: "Hedeflerinize göre yönetilen portföyler.",
    subtitle: "Forex, Altın, Emtia, Endeksler, Hisseler ve dijital varlıklar arasında çoklu varlık çözümleri — ekibimiz tarafından kurulur ve izlenir.",
    assets: [
      { t: "Forex", b: "Ana ve seçili gelişen pariteler arasında çeşitlendirilmiş maruziyet." },
      { t: "Altın ve değerli metaller", b: "Enflasyon ve oynaklığa karşı stratejik ve taktik konumlanma." },
      { t: "Emtialar", b: "Enerji, tarım ve endüstriyel metallerde kural bazlı maruziyet." },
      { t: "Endeksler", b: "Küresel endekslerde çeşitlendirilmiş maruziyet." },
      { t: "Hisseler", b: "Sıkı risk limitleri içinde seçici tekil hisse maruziyeti." },
      { t: "Dijital varlıklar", b: "Uygun yatırımcılar için kontrollü opsiyonel tahsis." },
    ],
    ctaPortfolios: "Yönetilen portföyleri görün",
    ctaAdvisor: "Danışmanla görüşün",
  },
  performance: {
    eyebrow: "Performans",
    title: "Kayıtlar, netlikle raporlanır.",
    subtitle: "Yönetilen strateji portföylerimizin örnek performans rakamları. Ayrıntılı aylık ve yıllık ekstreler müşteri portalında.",
    chartLabel: "Dengeli Büyüme Portföyü — kümülatif getiri",
    yearsSuffix: "3Y",
    illustrative: "Örnek",
    cols: { portfolio: "Portföy", ytd: "YBB", y1: "1Y", y3: "3Y", vol: "Volatilite", maxDd: "Maks. düşüş" },
    rows: [{ name: "Muhafazakâr" }, { name: "Dengeli" }, { name: "Büyüme" }],
    footnote: "Gösterilen performans rakamları örnektir ve varsayımsal ücret takviminden nettir. Geçmiş performans gelecek sonuçların göstergesi değildir.",
  },
  brand: {
    title: "Marka Varlıkları",
    subtitle: "Sosyal medya için optimize edilmiş 1024×1024 profil logoları. Kaydetmek için sağ tıklayın veya indirme düğmesini kullanın.",
    download: "İndir",
    labels: { goldSquare: "Altın · Kare", whiteSquare: "Beyaz · Kare", blackSquare: "Siyah · Kare", goldCircle: "Altın · Yuvarlak", whiteCircle: "Beyaz · Yuvarlak", blackCircle: "Siyah · Yuvarlak" },
  },
};

const DATA: Record<Lang, StaticPages> = { en, ar, fr, es, tr };

export function staticPages(lang: Lang): StaticPages {
  return DATA[lang] ?? en;
}
