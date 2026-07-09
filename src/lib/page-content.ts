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
