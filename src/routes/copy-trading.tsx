import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Copy, TrendingUp, TrendingDown, Users, Wallet, Percent, Award, Lock, Calculator, FileDown, Printer } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/copy-trading")({
  head: () => ({
    meta: [
      { title: "نسخ الصفقات — HK Investment Management" },
      { name: "description", content: "انسخ صفقات نخبة من المتداولين العالميين. باقات بأسماء متداولين أجانب، نتائج شهرية موثقة على مدى سنتين، حد أدنى للإيداع ونسبة أرباح واضحة." },
      { property: "og:title", content: "نسخ الصفقات — HK Investment Management" },
      { property: "og:description", content: "باقات نسخ صفقات لمتداولين عالميين، مع سجل أداء شهري على مدى 24 شهراً." },
    ],
  }),
  component: CopyTradingPage,
});

type Asset = "forex" | "crypto" | "metals" | "indices" | "stocks" | "energy" | "commodities";
type Risk = "low" | "medium" | "high";

type Trader = {
  id: string;
  name: string;
  country: string;
  flag: string;
  strategy: string;
  asset: Asset;
  risk: Risk;
  minDeposit: number;
  profitShare: number; // % taken by trader
  followers: number;
  winRate: number;
  seed: number;
};

const TRADERS: Trader[] = [
  { id: "sw", name: "Sebastian Weber", country: "ألمانيا", flag: "🇩🇪", strategy: "DAX & مؤشرات أوروبية", asset: "indices", risk: "medium", minDeposit: 500, profitShare: 20, followers: 1284, winRate: 68, seed: 11 },
  { id: "ln", name: "Lucas Nakamura", country: "اليابان", flag: "🇯🇵", strategy: "فوركس آسيوي — Swing", asset: "forex", risk: "low", minDeposit: 750, profitShare: 22, followers: 2145, winRate: 71, seed: 23 },
  { id: "ap", name: "Alessandro Prati", country: "إيطاليا", flag: "🇮🇹", strategy: "ذهب ومعادن", asset: "metals", risk: "low", minDeposit: 1000, profitShare: 25, followers: 968, winRate: 64, seed: 37 },
  { id: "or", name: "Olivia Reynolds", country: "المملكة المتحدة", flag: "🇬🇧", strategy: "GBP/USD — Scalping", asset: "forex", risk: "high", minDeposit: 1500, profitShare: 25, followers: 1732, winRate: 66, seed: 51 },
  { id: "mk", name: "Mateo Kovač", country: "كرواتيا", flag: "🇭🇷", strategy: "عقود نفط وطاقة", asset: "energy", risk: "high", minDeposit: 2000, profitShare: 28, followers: 612, winRate: 62, seed: 67 },
  { id: "et", name: "Elena Tavares", country: "البرتغال", flag: "🇵🇹", strategy: "أسهم أمريكية — Growth", asset: "stocks", risk: "medium", minDeposit: 2500, profitShare: 28, followers: 1420, winRate: 69, seed: 79 },
  { id: "hj", name: "Henrik Johansson", country: "السويد", flag: "🇸🇪", strategy: "كريبتو — BTC/ETH", asset: "crypto", risk: "high", minDeposit: 3000, profitShare: 30, followers: 3208, winRate: 73, seed: 89 },
  { id: "rd", name: "Rafael Duarte", country: "البرازيل", flag: "🇧🇷", strategy: "سلع زراعية", asset: "commodities", risk: "medium", minDeposit: 5000, profitShare: 30, followers: 845, winRate: 65, seed: 103 },
];

const ASSET_LABEL: Record<Asset, string> = {
  forex: "فوركس",
  crypto: "كريبتو",
  metals: "معادن",
  indices: "مؤشرات",
  stocks: "أسهم",
  energy: "طاقة",
  commodities: "سلع",
};
const RISK_LABEL: Record<Risk, string> = { low: "منخفضة", medium: "متوسطة", high: "مرتفعة" };

type SortKey = "return" | "min-asc" | "min-desc" | "followers" | "winRate";
const SORT_LABEL: Record<SortKey, string> = {
  return: "عائد آخر شهر (الأعلى)",
  "min-asc": "الحد الأدنى (تصاعدي)",
  "min-desc": "الحد الأدنى (تنازلي)",
  followers: "الأكثر متابعة",
  winRate: "نسبة النجاح",
};

// last-month return derived same way as buildHistory's last entry
function lastMonthReturn(t: Trader) {
  const base = seeded(t.seed, 24, -4, 12);
  const boost = seeded(t.seed, 123, 0, 1) > 0.85 ? seeded(t.seed, 223, 4, 8) : 0;
  return Number((base + boost).toFixed(2));
}

// deterministic pseudo-random in a bounded range
function seeded(seed: number, i: number, min: number, max: number) {
  const x = Math.sin(seed * 9301 + i * 49297) * 233280;
  const r = x - Math.floor(x);
  return min + r * (max - min);
}

function buildHistory(t: Trader) {
  // 24 monthly returns %, mostly positive but with drawdowns
  const months: { label: string; pct: number }[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("ar", { month: "short", year: "2-digit" });
    const base = seeded(t.seed, i + 1, -4, 12); // -4% to +12%
    // occasional stronger months
    const boost = seeded(t.seed, i + 100, 0, 1) > 0.85 ? seeded(t.seed, i + 200, 4, 8) : 0;
    const pct = Number((base + boost).toFixed(2));
    months.push({ label, pct });
  }
  return months;
}

const fmtMoney = (n: number) => new Intl.NumberFormat("en-US").format(n);

function CopyTradingPage() {
  const { user, loading } = useAuth();
  const [asset, setAsset] = useState<Asset | "all">("all");
  const [risk, setRisk] = useState<Risk | "all">("all");
  const [minReturn, setMinReturn] = useState<number>(-10);
  const [maxDeposit, setMaxDeposit] = useState<number>(5000);
  const [sort, setSort] = useState<SortKey>("return");

  const filtered = useMemo(() => {
    const rows = TRADERS.map((t) => ({ t, ret: lastMonthReturn(t) }))
      .filter(({ t, ret }) =>
        (asset === "all" || t.asset === asset) &&
        (risk === "all" || t.risk === risk) &&
        ret >= minReturn &&
        t.minDeposit <= maxDeposit
      );
    rows.sort((a, b) => {
      switch (sort) {
        case "return": return b.ret - a.ret;
        case "min-asc": return a.t.minDeposit - b.t.minDeposit;
        case "min-desc": return b.t.minDeposit - a.t.minDeposit;
        case "followers": return b.t.followers - a.t.followers;
        case "winRate": return b.t.winRate - a.t.winRate;
      }
    });
    return rows.map((r) => r.t);
  }, [asset, risk, minReturn, maxDeposit, sort]);

  const resetFilters = () => {
    setAsset("all"); setRisk("all"); setMinReturn(-10); setMaxDeposit(5000); setSort("return");
  };

  const monthLabel = new Date().toLocaleDateString("ar", { month: "long", year: "numeric" });

  const exportCsv = () => {
    const headers = ["الاسم", "الدولة", "الأصل", "المخاطر", "عائد آخر شهر %", "حد أدنى للإيداع", "حصة المتداول %", "نسبة النجاح %", "المتابعون"];
    const rows = filtered.map((t) => [
      t.name, t.country, ASSET_LABEL[t.asset], RISK_LABEL[t.risk],
      lastMonthReturn(t).toFixed(2), t.minDeposit, t.profitShare, t.winRate, t.followers,
    ]);
    const escape = (v: string | number) => {
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = "\uFEFF" + [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `copy-trading-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    const rowsHtml = filtered.map((t) => {
      const ret = lastMonthReturn(t);
      const tone = ret >= 0 ? "#059669" : "#dc2626";
      return `<tr>
        <td>${t.flag} ${t.name}</td>
        <td>${t.country}</td>
        <td>${ASSET_LABEL[t.asset]}</td>
        <td>${RISK_LABEL[t.risk]}</td>
        <td style="color:${tone};font-weight:600">${ret >= 0 ? "+" : ""}${ret.toFixed(2)}%</td>
        <td>$${fmtMoney(t.minDeposit)}</td>
        <td>${t.profitShare}%</td>
        <td>${t.winRate}%</td>
        <td>${fmtMoney(t.followers)}</td>
      </tr>`;
    }).join("");
    const html = `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>تقرير نسخ الصفقات — ${monthLabel}</title>
      <style>
        *{box-sizing:border-box}
        body{font-family:system-ui,-apple-system,"Segoe UI",Tahoma,Arial;padding:24px;color:#111}
        h1{margin:0 0 4px;font-size:22px}
        .sub{color:#666;font-size:12px;margin-bottom:16px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #ddd;padding:8px;text-align:right}
        th{background:#f5f5f5;font-weight:600}
        tr:nth-child(even) td{background:#fafafa}
        .foot{margin-top:16px;font-size:10px;color:#888}
      </style></head><body>
      <h1>تقرير نسخ الصفقات الشهري</h1>
      <div class="sub">الفترة: ${monthLabel} · عدد المتداولين: ${filtered.length}</div>
      <table><thead><tr>
        <th>المتداول</th><th>الدولة</th><th>الأصل</th><th>المخاطر</th>
        <th>عائد آخر شهر</th><th>حد أدنى</th><th>حصة المتداول</th><th>نسبة النجاح</th><th>المتابعون</th>
      </tr></thead><tbody>${rowsHtml}</tbody></table>
      <div class="foot">تقرير آلي — الأداء الماضي لا يشكّل ضماناً لأي نتائج مستقبلية.</div>
      <script>window.onload=()=>{window.focus();window.print();}<\/script>
    </body></html>`;
    const w = window.open("", "_blank", "width=1024,height=768");
    if (!w) { toast.error("السماح بالنوافذ المنبثقة مطلوب لتصدير PDF."); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="نسخ الصفقات"
        title={<>انسخ صفقات <span className="text-gold">نخبة المتداولين العالميين</span></>}
        subtitle={"باقات مختارة يديرها متداولون محترفون حول العالم. تصفّح النتائج الشهرية على مدى 24 شهراً،\nواختر الباقة المناسبة لحدّك الأدنى للإيداع ونسبة أرباح واضحة."}
      />
      {!loading && !user && (
        <div className="mx-auto mt-6 max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-gold">
              <Lock className="h-4 w-4" />
              <span>يجب تسجيل الدخول لاختيار متداول أو طلب نسخ الصفقات.</span>
            </div>
            <Link to="/auth" className="rounded-lg bg-gold px-3 py-1.5 font-semibold text-background hover:bg-gold/90">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      )}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="glass mb-6 rounded-2xl p-4 md:p-5">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <FilterSelect label="الأصل" value={asset} onChange={(v) => setAsset(v as Asset | "all")}
              options={[["all", "الكل"], ...(Object.entries(ASSET_LABEL) as [string, string][])]} />
            <FilterSelect label="المخاطر" value={risk} onChange={(v) => setRisk(v as Risk | "all")}
              options={[["all", "الكل"], ...(Object.entries(RISK_LABEL) as [string, string][])]} />
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                أدنى عائد آخر شهر: {minReturn}%
              </span>
              <input type="range" min={-10} max={15} step={1} value={minReturn}
                onChange={(e) => setMinReturn(Number(e.target.value))}
                className="mt-2 w-full accent-[color:var(--color-gold,#d4af37)]" />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                حد أدنى للإيداع: ≤ ${fmtMoney(maxDeposit)}
              </span>
              <input type="range" min={500} max={5000} step={250} value={maxDeposit}
                onChange={(e) => setMaxDeposit(Number(e.target.value))}
                className="mt-2 w-full accent-[color:var(--color-gold,#d4af37)]" />
            </label>
            <FilterSelect label="الفرز" value={sort} onChange={(v) => setSort(v as SortKey)}
              options={Object.entries(SORT_LABEL) as [string, string][]} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>عرض {filtered.length} من {TRADERS.length} متداول</span>
            <div className="flex items-center gap-2">
              <button onClick={exportCsv} disabled={filtered.length === 0}
                className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 hover:border-gold/40 hover:text-foreground disabled:opacity-40">
                <FileDown className="h-3.5 w-3.5" /> CSV
              </button>
              <button onClick={exportPdf} disabled={filtered.length === 0}
                className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 hover:border-gold/40 hover:text-foreground disabled:opacity-40">
                <Printer className="h-3.5 w-3.5" /> PDF
              </button>
              <button onClick={resetFilters} className="rounded-md border border-white/10 px-2 py-1 hover:border-gold/40 hover:text-foreground">
                إعادة تعيين
              </button>
            </div>
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
            لا يوجد متداولون مطابقون. جرّب تخفيف الفلاتر.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
            {filtered.map((t) => (
              <TraderCard key={t.id} trader={t} isAuthed={!!user} />
            ))}
          </div>
        )}
        <p className="mt-10 text-center text-xs text-muted-foreground">
          العوائد المعروضة هي نتائج تاريخية تقريبية لأغراض العرض ولا تشكّل ضماناً لأي أرباح مستقبلية. الأداء الماضي لا يُعدّ مؤشراً على النتائج القادمة.
        </p>
      </section>
      <CopyCalculator />
    </PageShell>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-gold/50">
        {options.map(([v, l]) => <option key={v} value={v} className="bg-background">{l}</option>)}
      </select>
    </label>
  );
}

function CopyCalculator() {
  const [traderId, setTraderId] = useState<string>(TRADERS[0].id);
  const [amountStr, setAmountStr] = useState<string>("1000");
  const [months, setMonths] = useState<number>(6);

  const trader = TRADERS.find((t) => t.id === traderId)!;
  const history = useMemo(() => buildHistory(trader), [trader]);
  const avgMonthly = useMemo(() => history.reduce((s, m) => s + m.pct, 0) / history.length, [history]);

  const amount = Math.max(0, Math.min(1_000_000, Number(amountStr) || 0));
  const belowMin = amount > 0 && amount < trader.minDeposit;

  const { grossProfit, traderCut, netProfit, finalBalance } = useMemo(() => {
    // Compound monthly at avg return
    const r = avgMonthly / 100;
    const final = amount * Math.pow(1 + r, months);
    const gross = final - amount;
    const cut = gross > 0 ? gross * (trader.profitShare / 100) : 0;
    const net = gross - cut;
    return { grossProfit: gross, traderCut: cut, netProfit: net, finalBalance: amount + net };
  }, [amount, months, avgMonthly, trader.profitShare]);

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);

  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="glass-strong rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-2 text-gold">
          <Calculator className="h-5 w-5" />
          <h2 className="font-display text-xl font-bold sm:text-2xl">حاسبة نسخ الصفقات</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          احسب المبلغ المتوقّع نسخه والأرباح التقديرية بناءً على متوسّط الأداء التاريخي للمتداول.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">المتداول</span>
            <select
              value={traderId}
              onChange={(e) => setTraderId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-gold/50"
            >
              {TRADERS.map((t) => (
                <option key={t.id} value={t.id} className="bg-background">
                  {t.flag} {t.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">المبلغ (USD)</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={1_000_000}
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value.slice(0, 10))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm tabular-nums outline-none focus:border-gold/50"
              placeholder="1000"
            />
          </label>

          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              المدة (أشهر): {months}
            </span>
            <input
              type="range"
              min={1}
              max={24}
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="mt-3 w-full accent-[color:var(--color-gold,#d4af37)]"
            />
            <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
              <span>1</span>
              <span>12</span>
              <span>24</span>
            </div>
          </label>
        </div>

        {belowMin && (
          <p className="mt-3 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
            الحد الأدنى لنسخ صفقات {trader.name} هو ${fmt(trader.minDeposit)}.
          </p>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ResultCard label="المبلغ المنسوخ" value={`$${fmt(amount)}`} />
          <ResultCard label="متوسط العائد الشهري" value={`${avgMonthly >= 0 ? "+" : ""}${avgMonthly.toFixed(2)}%`} positive={avgMonthly >= 0} />
          <ResultCard label="حصة المتداول" value={`-$${fmt(traderCut)}`} sub={`${trader.profitShare}%`} />
          <ResultCard label="صافي أرباحك" value={`${netProfit >= 0 ? "+" : ""}$${fmt(netProfit)}`} positive={netProfit >= 0} />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-gold/30 bg-gold/[0.06] px-4 py-3">
          <span className="text-sm text-muted-foreground">الرصيد المتوقع بعد {months} شهر</span>
          <span className="font-display text-2xl font-bold tabular-nums text-gold">${fmt(finalBalance)}</span>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          * تقديرات مبنية على متوسط الأداء التاريخي وليست ضماناً لأي عائد مستقبلي. إجمالي الربح قبل الحصة: ${fmt(grossProfit)}.
        </p>
      </div>
    </section>
  );
}

function ResultCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  const tone = positive === undefined ? "text-foreground" : positive ? "text-emerald-400" : "text-red-400";
  return (
    <div className="rounded-xl border border-white/10 bg-card/40 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-lg font-semibold tabular-nums ${tone}`}>{value}</p>
      {sub && <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function TraderCard({ trader, isAuthed }: { trader: Trader; isAuthed: boolean }) {
  const history = useMemo(() => buildHistory(trader), [trader]);
  const navigate = useNavigate();
  const lastMonth = history[history.length - 1];
  const total = useMemo(() => history.reduce((s, m) => s + m.pct, 0), [history]);
  const positiveMonths = history.filter((m) => m.pct > 0).length;
  const best = history.reduce((a, b) => (b.pct > a.pct ? b : a));
  const worst = history.reduce((a, b) => (b.pct < a.pct ? b : a));

  const [tab, setTab] = useState<"chart" | "table">("chart");

  return (
    <article className="glass-strong rounded-3xl p-5 md:p-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-2xl">{trader.flag}</div>
          <div>
            <h3 className="font-display text-lg font-semibold">{trader.name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{trader.country} · {trader.strategy}</p>
          </div>
        </div>
        <div className={`text-end ${lastMonth.pct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">آخر شهر</p>
          <p className="mt-0.5 font-display text-2xl font-bold tabular-nums">
            {lastMonth.pct >= 0 ? "+" : ""}{lastMonth.pct.toFixed(2)}%
          </p>
        </div>
      </header>

      {/* KPI strip */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi icon={Wallet} label="حد أدنى" value={`$${fmtMoney(trader.minDeposit)}`} />
        <Kpi icon={Percent} label="نسبة المتداول" value={`${trader.profitShare}%`} />
        <Kpi icon={Users} label="متابعون" value={fmtMoney(trader.followers)} />
        <Kpi icon={Award} label="نجاح" value={`${trader.winRate}%`} />
      </div>

      {/* Tabs */}
      <div className="mt-5 flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1 text-xs w-fit">
        <button
          onClick={() => setTab("chart")}
          className={`rounded-md px-3 py-1.5 font-mono uppercase tracking-wider transition ${tab === "chart" ? "bg-gold/15 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          الرسم
        </button>
        <button
          onClick={() => setTab("table")}
          className={`rounded-md px-3 py-1.5 font-mono uppercase tracking-wider transition ${tab === "table" ? "bg-gold/15 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          الجدول
        </button>
      </div>

      {tab === "chart" ? (
        <HistoryChart data={history} />
      ) : (
        <HistoryTable data={history} />
      )}

      {/* Summary */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <MiniStat label="إجمالي 24 شهر" value={`${total >= 0 ? "+" : ""}${total.toFixed(1)}%`} positive={total >= 0} />
        <MiniStat label="شهور رابحة" value={`${positiveMonths}/24`} positive={positiveMonths >= 12} />
        <MiniStat label="أعلى / أدنى" value={`${best.pct.toFixed(1)}% / ${worst.pct.toFixed(1)}%`} />
      </div>

      <button
        onClick={() => {
          if (!isAuthed) {
            toast.error("سجّل الدخول أولاً لطلب نسخ الصفقات.");
            navigate({ to: "/auth" });
            return;
          }
          toast.success(`تم إرسال طلب نسخ صفقات ${trader.name}.`);
        }}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold transition hover:bg-gold/20"
      >
        {isAuthed ? <Copy className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        {isAuthed ? `نسخ صفقات ${trader.name.split(" ")[0]}` : "سجّل الدخول للنسخ"}
      </button>
    </article>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-card/40 px-3 py-2">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span className="font-mono text-[9px] uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-1 font-display text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function MiniStat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  const tone = positive === undefined ? "text-foreground" : positive ? "text-emerald-400" : "text-red-400";
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-2 py-2">
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-xs font-semibold tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}

function HistoryChart({ data }: { data: { label: string; pct: number }[] }) {
  const max = Math.max(...data.map((d) => Math.abs(d.pct)), 1);
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="flex h-40 items-end gap-[3px]">
        {data.map((m, i) => {
          const h = (Math.abs(m.pct) / max) * 100;
          const up = m.pct >= 0;
          return (
            <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
              <div
                className={`w-full rounded-sm transition ${up ? "bg-emerald-400/70 group-hover:bg-emerald-400" : "bg-red-400/70 group-hover:bg-red-400"}`}
                style={{ height: `${Math.max(h, 4)}%` }}
                title={`${m.label}: ${m.pct >= 0 ? "+" : ""}${m.pct}%`}
              />
              <span className="pointer-events-none absolute -top-7 whitespace-nowrap rounded bg-background/90 px-1.5 py-0.5 font-mono text-[9px] opacity-0 shadow group-hover:opacity-100">
                {m.label} {m.pct >= 0 ? "+" : ""}{m.pct}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground">
        <span>{data[0].label}</span>
        <span>{data[Math.floor(data.length / 2)].label}</span>
        <span>{data[data.length - 1].label}</span>
      </div>
    </div>
  );
}

function HistoryTable({ data }: { data: { label: string; pct: number }[] }) {
  return (
    <div className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02]">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-background/80 backdrop-blur">
          <tr className="text-muted-foreground">
            <th className="px-3 py-2 text-start font-mono text-[9px] uppercase tracking-widest">الشهر</th>
            <th className="px-3 py-2 text-end font-mono text-[9px] uppercase tracking-widest">العائد</th>
            <th className="px-3 py-2 text-end font-mono text-[9px] uppercase tracking-widest">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {[...data].reverse().map((m, i) => (
            <tr key={i} className="border-t border-white/5">
              <td className="px-3 py-1.5 font-mono text-[11px] text-muted-foreground">{m.label}</td>
              <td className={`px-3 py-1.5 text-end font-mono tabular-nums ${m.pct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {m.pct >= 0 ? "+" : ""}{m.pct.toFixed(2)}%
              </td>
              <td className="px-3 py-1.5 text-end">
                {m.pct >= 0 ? (
                  <TrendingUp className="ms-auto h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="ms-auto h-3.5 w-3.5 text-red-400" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}