import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowDownToLine, ArrowRight, ArrowUpFromLine, CheckCircle2, Clock, Package as PackageIcon, ShieldCheck, Wallet, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/investor")({
  head: () => ({
    meta: [
      { title: "Investor Portal — HK Investment Management" },
      { name: "description", content: "Manage deposits, withdrawals, and package subscriptions in one place." },
    ],
  }),
  component: InvestorPortal,
});

type Pkg = { id: string; name: string; description: string | null; min_amount: number; target_return_pct: number | null; lockup_months: number; risk_level: string; currency: string };
type Sub = { id: string; package_id: string; amount: number; currency: string; status: string; started_at: string | null; ends_at: string | null; created_at: string };
type Dep = { id: string; amount: number; currency: string; method: string; reference: string | null; status: string; created_at: string };
type Wd = { id: string; amount: number; currency: string; destination: string; iban: string | null; status: string; created_at: string };
const depositSchema = z.object({
  amount: z.coerce.number().positive().max(10_000_000),
  method: z.enum(["bank_transfer", "card", "binance_pay", "usdt_trc20", "usdt_bep20"]),
  reference: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
});
const withdrawSchema = z.object({
  amount: z.coerce.number().positive().max(10_000_000),
  destination: z.string().trim().min(2).max(120),
  iban: z.string().trim().max(64).optional(),
  swift: z.string().trim().max(32).optional(),
  notes: z.string().trim().max(500).optional(),
});

// Wallet / network address validators — enforced client-side before submit.
const ADDRESS_RULES = {
  usdt_trc20: {
    regex: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
    label: "عنوان TRC20 غير صالح (يجب أن يبدأ بحرف T ويتكوّن من 34 خانة)",
  },
  usdt_bep20: {
    regex: /^0x[a-fA-F0-9]{40}$/,
    label: "عنوان BEP20 غير صالح (يجب أن يبدأ بـ 0x ويتكوّن من 42 خانة)",
  },
  binance_pay: {
    regex: /^[0-9]{6,20}$/,
    label: "Binance Pay ID غير صالح (أرقام فقط، 6 إلى 20 خانة)",
  },
} as const;
const TXID_RULES = {
  usdt_trc20: { regex: /^[a-fA-F0-9]{64}$/, label: "TxID لشبكة TRC20 يجب أن يكون 64 خانة hex" },
  usdt_bep20: { regex: /^0x[a-fA-F0-9]{64}$/, label: "TxID لشبكة BEP20 يجب أن يبدأ بـ 0x ويتكوّن من 66 خانة" },
  binance_pay: { regex: /^[A-Za-z0-9-]{8,64}$/, label: "رقم مرجع Binance Pay غير صالح" },
} as const;

// Platform deposit destinations — super admin can update these values in code.
const PLATFORM_WALLETS = {
  binance_pay: "HK-BINANCE-PAY-ID-000000",
  usdt_trc20: "TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  usdt_bep20: "0xHKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
} as const;

function InvestorPortal() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [deps, setDeps] = useState<Dep[]>([]);
  const [wds, setWds] = useState<Wd[]>([]);
  const [loading, setLoading] = useState(true);
  const [busySub, setBusySub] = useState<string | null>(null);
  const [depositMethod, setDepositMethod] = useState<"bank_transfer" | "card" | "binance_pay" | "usdt_trc20" | "usdt_bep20">("bank_transfer");
  const [withdrawMethod, setWithdrawMethod] = useState<"bank" | "binance_pay" | "usdt_trc20" | "usdt_bep20">("bank");

  async function load() {
    const { data: userRes } = await supabase.auth.getUser();
    const id = userRes.user?.id ?? null;
    setUid(id);
    if (!id) return setLoading(false);
    const [{ data: pk }, { data: sb }, { data: dp }, { data: wd }] = await Promise.all([
      supabase.from("packages").select("*").eq("active", true).order("sort_order"),
      supabase.from("subscriptions").select("*").eq("user_id", id).order("created_at", { ascending: false }),
      supabase.from("deposits").select("*").eq("user_id", id).order("created_at", { ascending: false }),
      supabase.from("withdrawals").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    ]);
    setPackages((pk ?? []) as Pkg[]);
    setSubs((sb ?? []) as Sub[]);
    setDeps((dp ?? []) as Dep[]);
    setWds((wd ?? []) as Wd[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const balance = useMemo(() => {
    const inSum = deps.filter((d) => d.status === "approved").reduce((s, d) => s + Number(d.amount), 0);
    const outSum = wds.filter((w) => w.status === "approved").reduce((s, w) => s + Number(w.amount), 0);
    return inSum - outSum;
  }, [deps, wds]);

  const pendingDeposits = deps.filter((d) => d.status === "pending").reduce((s, d) => s + Number(d.amount), 0);
  const activeSubs = subs.filter((s) => s.status === "active" || s.status === "pending");
  const committed = activeSubs.reduce((s, x) => s + Number(x.amount), 0);
  const available = Math.max(0, balance - committed);

  async function subscribeToPackage(pkg: Pkg) {
    if (!uid) return;
    if (busySub) return;
    // Prevent duplicate active/pending subscription in the same package
    if (subs.some((s) => s.package_id === pkg.id && (s.status === "active" || s.status === "pending"))) {
      toast.error("لديك اشتراك نشط أو قيد المراجعة في هذه الباقة بالفعل");
      return;
    }
    if (available < Number(pkg.min_amount)) {
      toast.error(`الرصيد المتاح غير كافٍ. الحد الأدنى ${fmt(Number(pkg.min_amount))} ${pkg.currency}`);
      return;
    }
    const raw = window.prompt(
      `أدخل المبلغ للاشتراك في باقة ${pkg.name} (الحد الأدنى ${fmt(Number(pkg.min_amount))} ${pkg.currency}، المتاح ${fmt(available)} ${pkg.currency})`,
      String(pkg.min_amount),
    );
    if (!raw) return;
    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount < Number(pkg.min_amount)) {
      toast.error("المبلغ أقل من الحد الأدنى للباقة");
      return;
    }
    if (amount > available) {
      toast.error("المبلغ يتجاوز الرصيد المتاح");
      return;
    }
    setBusySub(`new:${pkg.id}`);
    const startedAt = new Date();
    const endsAt = new Date(startedAt);
    endsAt.setMonth(endsAt.getMonth() + Number(pkg.lockup_months || 0));
    try {
      // Re-check freshest state server-side to avoid race with rapid clicks / stale UI
      const { data: fresh } = await supabase
        .from("subscriptions")
        .select("id,package_id,amount,status")
        .eq("user_id", uid);
      const committedNow = (fresh ?? [])
        .filter((s) => s.status === "active" || s.status === "pending")
        .reduce((a, s) => a + Number(s.amount), 0);
      const inSum = deps.filter((d) => d.status === "approved").reduce((a, d) => a + Number(d.amount), 0);
      const outSum = wds.filter((w) => w.status === "approved").reduce((a, w) => a + Number(w.amount), 0);
      const availNow = Math.max(0, inSum - outSum - committedNow);
      if (amount > availNow) {
        toast.error("الرصيد المتاح تغيّر — أعد المحاولة");
        return;
      }
      if ((fresh ?? []).some((s) => s.package_id === pkg.id && (s.status === "active" || s.status === "pending"))) {
        toast.error("لديك اشتراك نشط أو قيد المراجعة في هذه الباقة بالفعل");
        return;
      }
      const { error } = await supabase.from("subscriptions").insert({
        user_id: uid,
        package_id: pkg.id,
        amount,
        currency: pkg.currency,
        status: "active",
        started_at: startedAt.toISOString(),
        ends_at: endsAt.toISOString(),
      });
      if (error) return toast.error(error.message);
      toast.success("تم الاشتراك في الباقة");
      await load();
    } finally {
      setBusySub(null);
    }
  }

  async function cancelSubscription(sub: Sub) {
    if (!uid) return;
    if (busySub) return;
    if (sub.status !== "active" && sub.status !== "pending") {
      toast.error("لا يمكن إلغاء اشتراك بهذه الحالة");
      return;
    }
    // Enforce lockup: block cancel before ends_at when a lockup was set
    if (sub.status === "active" && sub.ends_at) {
      const endsAt = new Date(sub.ends_at).getTime();
      if (Number.isFinite(endsAt) && endsAt > Date.now()) {
        const daysLeft = Math.ceil((endsAt - Date.now()) / 86_400_000);
        toast.error(`الباقة ضمن فترة القفل — متبقٍ ${daysLeft} يوم حتى ${new Date(endsAt).toLocaleDateString()}`);
        return;
      }
    }
    if (!window.confirm("تأكيد إلغاء الاشتراك في هذه الباقة؟")) return;
    setBusySub(sub.id);
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("id", sub.id)
        .eq("user_id", uid)
        .in("status", ["active", "pending"]);
      if (error) return toast.error(error.message);
      toast.success("تم إلغاء الاشتراك — يمكنك الاشتراك في باقة أخرى الآن");
      await load();
    } finally {
      setBusySub(null);
    }
  }

  const primarySub = activeSubs[0];
  const primaryPkg = packages.find((p) => p.id === primarySub?.package_id);

  async function submitDeposit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!uid) return;
    const fd = new FormData(e.currentTarget);
    const parsed = depositSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    // Network-specific validation for crypto / Binance Pay deposits
    if (parsed.data.method in TXID_RULES) {
      const rule = TXID_RULES[parsed.data.method as keyof typeof TXID_RULES];
      const ref = parsed.data.reference ?? "";
      if (!ref) return toast.error("يرجى إدخال TxID / مرجع المعاملة");
      if (!rule.regex.test(ref)) return toast.error(rule.label);
    }
    const { error } = await supabase.from("deposits").insert({ user_id: uid, ...parsed.data });
    if (error) return toast.error(error.message);
    toast.success("تم إرسال طلب الإيداع بنجاح");
    (e.currentTarget as HTMLFormElement).reset();
    await load();
  }

  async function submitWithdraw(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!uid) return;
    const fd = new FormData(e.currentTarget);
    const parsed = withdrawSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (parsed.data.amount > balance) return toast.error("المبلغ يتجاوز الرصيد المتاح");
    // Network-specific destination validation
    if (withdrawMethod !== "bank") {
      const rule = ADDRESS_RULES[withdrawMethod];
      if (!rule.regex.test(parsed.data.destination)) return toast.error(rule.label);
    }
    // Require MFA for withdrawals
    const { data: fx } = await supabase.auth.mfa.listFactors();
    const totp = (fx?.totp ?? []).find((f) => f.status === "verified");
    if (!totp) {
      toast.error("يجب تفعيل المصادقة الثنائية قبل تنفيذ السحب");
      router.navigate({ to: "/portal/mfa" });
      return;
    }
    const code = window.prompt("أدخل رمز المصادقة الثنائية (6 أرقام) لتأكيد السحب");
    if (!code) return;
    const { error: mfaErr } = await supabase.auth.mfa.challengeAndVerify({ factorId: totp.id, code: code.trim() });
    if (mfaErr) return toast.error("رمز التحقق غير صحيح");
    const { error } = await supabase.from("withdrawals").insert({ user_id: uid, ...parsed.data });
    if (error) return toast.error(error.message);
    toast.success("تم إرسال طلب السحب بنجاح");
    (e.currentTarget as HTMLFormElement).reset();
    await load();
  }

  return (
    <PageShell bare>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold">Investor Portal</p>
          <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">حسابك الاستثماري</h1>
          <p className="mt-2 text-sm text-muted-foreground">الرصيد، الإيداعات، السحوبات، والباقات — كل شيء في مكان واحد.</p>
          </div>
          <Link
            to="/portal"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-gold/40 hover:text-foreground"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            <span>رجوع</span>
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <a href="#deposit" className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
            <ArrowDownToLine className="h-4 w-4" /> إيداع
          </a>
          <a href="#withdraw" className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20">
            <ArrowUpFromLine className="h-4 w-4" /> سحب
          </a>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Wallet className="h-5 w-5" />} label="الرصيد المتاح" value={fmt(balance)} sub="USD" />
          <StatCard icon={<Clock className="h-5 w-5" />} label="إيداعات قيد المراجعة" value={fmt(pendingDeposits)} sub="USD" />
          <StatCard
            icon={<PackageIcon className="h-5 w-5" />}
            label="الباقة النشطة"
            value={primaryPkg?.name ?? "—"}
            sub={activeSubs.length > 1 ? `${activeSubs.length} باقات نشطة` : primarySub ? primarySub.status : "لا يوجد اشتراك"}
          />
          <StatCard icon={<ShieldCheck className="h-5 w-5" />} label="حالة الحساب" value={uid ? "موثّق" : "—"} sub="KYC" />
        </div>

        <div className="mt-8 glass rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PackageIcon className="h-5 w-5 text-gold" />
              <h2 className="font-display text-lg font-semibold">الباقات المتاحة</h2>
            </div>
            <p className="text-[11px] text-muted-foreground">
              المتاح للاشتراك: <span className="font-mono text-foreground">{fmt(available)} USD</span>
              {loading ? "" : ""}
            </p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((p) => {
              const eligible = available >= Number(p.min_amount);
              return (
                <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-semibold">{p.name}</h3>
                    <span className="rounded-full border border-gold/30 bg-gold/[0.08] px-2 py-0.5 font-mono text-[10px] text-gold">
                      {returnRange(Number(p.min_amount))} <span className="text-[9px]">/ أسبوعي</span>
                    </span>
                  </div>
                  {p.description && <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                    <div>الحد الأدنى<div className="font-mono text-foreground">{fmt(Number(p.min_amount))} {p.currency}</div></div>
                    <div>المخاطرة<div className="font-mono text-emerald-400">منخفضة</div></div>
                  </div>
                  <Button
                    type="button"
                    disabled={!eligible || busySub === `new:${p.id}` || !!busySub}
                    onClick={() => subscribeToPackage(p)}
                    className="mt-4 w-full bg-red-600 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {busySub === `new:${p.id}` ? "جارٍ التنفيذ..." : eligible ? "اشترك بهذه الباقة" : "الرصيد غير كافٍ"}
                  </Button>
                </div>
              );
            })}
            {packages.length === 0 && <p className="text-sm text-muted-foreground">لا توجد باقات متاحة حاليًا.</p>}
          </div>

          {activeSubs.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground">اشتراكاتي الحالية</h3>
              <ul className="mt-2 divide-y divide-white/5">
                {activeSubs.map((s) => {
                  const meta = packages.find((p) => p.id === s.package_id);
                  return (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                      <div>
                        <p className="font-medium">{meta?.name ?? s.package_id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {fmt(Number(s.amount))} {s.currency}
                          {s.ends_at ? ` · حتى ${new Date(s.ends_at).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusPill status={s.status} />
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busySub === s.id || !!busySub}
                          onClick={() => cancelSubscription(s)}
                          className="h-7 border-white/15 text-xs"
                        >
                          {busySub === s.id ? "..." : "تبديل / إلغاء"}
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div id="deposit" className="glass rounded-3xl p-6 scroll-mt-24">
            <div className="flex items-center gap-2">
              <ArrowDownToLine className="h-5 w-5 text-gold" />
              <h2 className="font-display text-lg font-semibold">إيداع جديد</h2>
            </div>
            <form onSubmit={submitDeposit} className="mt-4 grid gap-3">
              <Field label="المبلغ (USD)"><Input name="amount" type="number" min="1" step="0.01" required /></Field>
              <Field label="طريقة الدفع">
                <select
                  name="method"
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value as typeof depositMethod)}
                  className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm"
                >
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="binance_pay">محفظة Binance Pay</option>
                  <option value="usdt_trc20">USDT — شبكة TRC20</option>
                  <option value="usdt_bep20">USDT — شبكة BEP20 (BSC)</option>
                  <option value="card">بطاقة ائتمان (قريبًا)</option>
                </select>
              </Field>
              {(depositMethod === "binance_pay" || depositMethod === "usdt_trc20" || depositMethod === "usdt_bep20") && (
                <div className="rounded-xl border border-amber-400/30 bg-amber-400/[0.05] p-3 text-xs">
                  <div className="mb-1 font-semibold text-amber-300">
                    {depositMethod === "binance_pay" ? "Binance Pay ID للمنصة" : depositMethod === "usdt_trc20" ? "عنوان USDT-TRC20" : "عنوان USDT-BEP20"}
                  </div>
                  <div className="break-all font-mono text-[11px] text-foreground">{PLATFORM_WALLETS[depositMethod]}</div>
                  <p className="mt-2 text-muted-foreground">أرسل المبلغ إلى العنوان أعلاه ثم ألصق hash المعاملة (TxID) في حقل المرجع. سيُضاف الرصيد بعد تأكيد الاستلام من الإدارة.</p>
                </div>
              )}
              <Field label="مرجع التحويل / TxID"><Input name="reference" maxLength={120} placeholder={depositMethod === "bank_transfer" || depositMethod === "card" ? "" : "TxID / Hash المعاملة"} /></Field>
              <Field label="ملاحظات"><Textarea name="notes" maxLength={500} rows={2} /></Field>
              <Button type="submit" className="bg-red-600 font-semibold text-white hover:bg-red-700">إرسال طلب الإيداع</Button>
              <p className="text-[11px] text-muted-foreground">جميع الإيداعات (بنكي / Binance / كريبتو) يعتمدها الفريق يدويًا بعد التأكد من استلام الأموال.</p>
            </form>
          </div>

          <div id="withdraw" className="glass rounded-3xl p-6 scroll-mt-24">
            <div className="flex items-center gap-2">
              <ArrowUpFromLine className="h-5 w-5 text-gold" />
              <h2 className="font-display text-lg font-semibold">طلب سحب</h2>
            </div>
            <form onSubmit={submitWithdraw} className="mt-4 grid gap-3">
              <Field label="المبلغ (USD)"><Input name="amount" type="number" min="1" step="0.01" required /></Field>
              <Field label="طريقة السحب">
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value as typeof withdrawMethod)}
                  className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm"
                >
                  <option value="bank">تحويل بنكي</option>
                  <option value="binance_pay">Binance Pay ID</option>
                  <option value="usdt_trc20">USDT — شبكة TRC20</option>
                  <option value="usdt_bep20">USDT — شبكة BEP20 (BSC)</option>
                </select>
              </Field>
              {withdrawMethod === "bank" ? (
                <>
                  <Field label="اسم المستفيد / الوجهة"><Input name="destination" required maxLength={120} /></Field>
                  <Field label="IBAN"><Input name="iban" maxLength={64} /></Field>
                  <Field label="SWIFT"><Input name="swift" maxLength={32} /></Field>
                </>
              ) : (
                <>
                  <Field label={withdrawMethod === "binance_pay" ? "Binance Pay ID الخاص بك" : "عنوان محفظتك"}>
                    <Input name="destination" required maxLength={120} placeholder={withdrawMethod === "binance_pay" ? "123456789" : withdrawMethod === "usdt_trc20" ? "T..." : "0x..."} />
                  </Field>
                  <Field label="الشبكة">
                    <Input name="iban" readOnly value={withdrawMethod === "binance_pay" ? "Binance Pay" : withdrawMethod === "usdt_trc20" ? "TRC20 (Tron)" : "BEP20 (BSC)"} />
                  </Field>
                  <p className="text-[11px] text-amber-300/80">تأكد من صحة العنوان والشبكة — التحويلات على شبكة خاطئة لا يمكن استرجاعها.</p>
                </>
              )}
              <Field label="ملاحظات"><Textarea name="notes" maxLength={500} rows={2} /></Field>
              <Button type="submit" className="bg-red-600 font-semibold text-white hover:bg-red-700">إرسال طلب السحب</Button>
            </form>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <HistoryList title="سجل الإيداعات" empty="لا توجد إيداعات." rows={deps.map((d) => ({ id: d.id, primary: `${fmt(Number(d.amount))} ${d.currency}`, secondary: `${d.method} · ${new Date(d.created_at).toLocaleDateString()}`, status: d.status }))} />
          <HistoryList title="سجل السحوبات" empty="لا توجد سحوبات." rows={wds.map((w) => ({ id: w.id, primary: `${fmt(Number(w.amount))} ${w.currency}`, secondary: `${w.destination} · ${new Date(w.created_at).toLocaleDateString()}`, status: w.status }))} />
        </div>

        <div className="mt-6">
          <HistoryList
            title="سجل الاشتراكات والعمليات"
            empty="لا يوجد سجل اشتراكات بعد."
            rows={subs.map((s) => {
              const meta = packages.find((p) => p.id === s.package_id);
              const created = new Date(s.created_at).toLocaleDateString();
              const range = s.started_at
                ? `${new Date(s.started_at).toLocaleDateString()}${s.ends_at ? ` → ${new Date(s.ends_at).toLocaleDateString()}` : ""}`
                : `طلب بتاريخ ${created}`;
              return {
                id: s.id,
                primary: `${meta?.name ?? s.package_id.slice(0, 8)} — ${fmt(Number(s.amount))} ${s.currency}`,
                secondary: range,
                status: s.status,
              };
            })}
          />
        </div>
      </section>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <span className="text-gold">{icon}</span>
        {label}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function HistoryList({ title, rows, empty }: { title: string; empty: string; rows: { id: string; primary: string; secondary: string; status: string }[] }) {
  return (
    <div className="glass rounded-3xl p-6">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-4 divide-y divide-white/5">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium">{r.primary}</p>
                <p className="text-xs text-muted-foreground">{r.secondary}</p>
              </div>
              <StatusPill status={r.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
    pending: { cls: "bg-amber-500/10 text-amber-400", icon: <Clock className="h-3 w-3" />, label: "قيد المراجعة" },
    approved: { cls: "bg-emerald-500/10 text-emerald-400", icon: <CheckCircle2 className="h-3 w-3" />, label: "مقبول" },
    active: { cls: "bg-emerald-500/10 text-emerald-400", icon: <CheckCircle2 className="h-3 w-3" />, label: "نشط" },
    rejected: { cls: "bg-red-500/10 text-red-400", icon: <XCircle className="h-3 w-3" />, label: "مرفوض" },
    cancelled: { cls: "bg-white/5 text-muted-foreground", icon: <XCircle className="h-3 w-3" />, label: "ملغى" },
    expired: { cls: "bg-white/5 text-muted-foreground", icon: <Clock className="h-3 w-3" />, label: "منتهية" },
  };
  const m = map[status] ?? { cls: "bg-white/5 text-muted-foreground", icon: null, label: status };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${m.cls}`}>
      {m.icon}
      {m.label}
    </span>
  );
}

function fmt(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function returnRange(min: number) {
  if (min >= 1000) return "16% – 24%";
  if (min >= 500) return "10% – 16%";
  return "6% – 10%";
}