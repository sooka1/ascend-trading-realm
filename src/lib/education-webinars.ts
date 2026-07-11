// Live/recurring trading webinars from established global providers.
// Links go to the provider's official live-events / webinars page so the
// schedule stays up to date.

export type EduWebinar = {
  id: number;
  title: string;
  host: string;
  language: "EN" | "AR";
  cadence: string; // e.g. "يومي", "أسبوعي", "3 مرات أسبوعياً"
  day: string; // preferred day / time hint
  time: string; // GMT reference
  topic: string;
  url: string;
};

export const EDU_WEBINARS: EduWebinar[] = [
  {
    id: 1,
    title: "DailyFX Live — Analyst Market Coverage",
    host: "DailyFX (IG)",
    language: "EN",
    cadence: "يومي",
    day: "الاثنين — الجمعة",
    time: "13:30 GMT",
    topic: "تحليل مباشر للفوركس والمؤشرات",
    url: "https://www.dailyfx.com/webinars",
  },
  {
    id: 2,
    title: "IG Academy Live Webinars",
    host: "IG Group",
    language: "EN",
    cadence: "أسبوعي",
    day: "الثلاثاء",
    time: "10:00 GMT",
    topic: "أساسيات ومهارات التداول",
    url: "https://www.ig.com/en/learn-to-trade/ig-academy/webinars",
  },
  {
    id: 3,
    title: "OANDA MarketPulse Live",
    host: "OANDA",
    language: "EN",
    cadence: "أسبوعي",
    day: "الأربعاء",
    time: "14:00 GMT",
    topic: "نظرة أسبوعية على الأسواق",
    url: "https://www.marketpulse.com/webinars/",
  },
  {
    id: 4,
    title: "FXCM Live Trading Room",
    host: "FXCM",
    language: "EN",
    cadence: "3 مرات أسبوعياً",
    day: "الاثنين / الأربعاء / الجمعة",
    time: "12:00 GMT",
    topic: "فوركس ومعادن",
    url: "https://www.fxcm.com/markets/insights/webinars/",
  },
  {
    id: 5,
    title: "Pepperstone Live Analysis",
    host: "Pepperstone",
    language: "EN",
    cadence: "أسبوعي",
    day: "الخميس",
    time: "09:00 GMT",
    topic: "استراتيجيات وتحليل فني",
    url: "https://pepperstone.com/en/learn-to-trade/webinars/",
  },
  {
    id: 6,
    title: "XM Live Education",
    host: "XM",
    language: "AR",
    cadence: "يومي",
    day: "الاثنين — الجمعة",
    time: "13:00 GMT",
    topic: "ندوات باللغة العربية",
    url: "https://www.xm.com/live-education",
  },
  {
    id: 7,
    title: "Exness Live Webinars",
    host: "Exness",
    language: "AR",
    cadence: "أسبوعي",
    day: "الثلاثاء",
    time: "15:00 GMT",
    topic: "شرح المنصة وإدارة المخاطر",
    url: "https://www.exness.com/education/webinars/",
  },
  {
    id: 8,
    title: "AvaTrade Live Trading Webinars",
    host: "AvaTrade",
    language: "AR",
    cadence: "أسبوعي",
    day: "الأربعاء",
    time: "16:00 GMT",
    topic: "دورات مباشرة ثنائية اللغة",
    url: "https://www.avatrade.com/education/online-trading-webinars",
  },
  {
    id: 9,
    title: "Investing.com Webinars",
    host: "Investing.com",
    language: "EN",
    cadence: "شبه يومي",
    day: "الاثنين — الجمعة",
    time: "متعدد",
    topic: "أسهم، فوركس، كريبتو، سلع",
    url: "https://www.investing.com/webinars/",
  },
  {
    id: 10,
    title: "TradingView Live Streams",
    host: "TradingView",
    language: "EN",
    cadence: "يومي",
    day: "الاثنين — الجمعة",
    time: "متعدد",
    topic: "بث حي من محللين مستقلين",
    url: "https://www.tradingview.com/streams/",
  },
  {
    id: 11,
    title: "CME Group Live Events",
    host: "CME Group",
    language: "EN",
    cadence: "أسبوعي",
    day: "الخميس",
    time: "14:00 GMT",
    topic: "عقود آجلة وخيارات",
    url: "https://www.cmegroup.com/education/events.html",
  },
  {
    id: 12,
    title: "SMB Capital Free Webinars",
    host: "SMB Capital",
    language: "EN",
    cadence: "أسبوعي",
    day: "الأربعاء",
    time: "17:00 GMT",
    topic: "تداول اليوم للأسهم الأمريكية",
    url: "https://www.smbtraining.com/free-trading-webinars",
  },
];