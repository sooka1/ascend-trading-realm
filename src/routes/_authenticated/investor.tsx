import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowDownToLine, ArrowRight, ArrowUpFromLine, CheckCircle2, Clock, Copy, Package as PackageIcon, ShieldCheck, Wallet, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import trc20QrAsset from "@/assets/trc20-qr.png.asset.json";

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
type AuditRow = { id: string; withdrawal_id: string; subscription_id: string | null; event: string; amount_before: number; amount_after: number; amount_delta: number; currency: string; metadata: Record<string, unknown> | null; created_at: string };
const depositSchema = z.object({
  amount: z.coerce.number().positive().max(10_000_000),
  method: z.enum(["binance_pay", "usdt_trc20"]),
  reference: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
});
const withdrawSchema = z.object({
  amount: z.coerce.number().min(10, "الحد الأدنى للسحب 10$").max(10_000_000),
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
  binance_pay: {
    regex: /^[0-9]{6,20}$/,
    label: "Binance Pay ID غير صالح (أرقام فقط، 6 إلى 20 خانة)",
  },
} as const;
const TXID_RULES = {
  usdt_trc20: { regex: /^[a-fA-F0-9]{64}$/, label: "TxID لشبكة TRC20 يجب أن يكون 64 خانة hex" },
  binance_pay: { regex: /^[A-Za-z0-9-]{8,64}$/, label: "رقم مرجع Binance Pay غير صالح" },
} as const;

// Platform deposit destinations — super admin can update these values in code.
const PLATFORM_WALLETS = {
  binance_pay: "194857355",
  usdt_trc20: "TD8fkqHy5cGQU3tFf7Qi7AeeqrAWi6e9Rm",
} as const;

// Guardrail: the platform's Binance Pay ID must match the same numeric format
// we enforce on user input. It is used ONLY as the deposit destination shown
// to investors and referenced when creating a Binance Pay order — never as a
// withdraw destination or a user-supplied value.
const IS_BINANCE_PAY_ID_VALID = ADDRESS_RULES.binance_pay.regex.test(PLATFORM_WALLETS.binance_pay);
function getPlatformBinancePayId(): string {
  if (!IS_BINANCE_PAY_ID_VALID) {
    throw new Error("Binance Pay ID الخاص بالمنصة غير صالح — يرجى مراجعة الإدارة");
  }
  return PLATFORM_WALLETS.binance_pay;
}

function InvestorPortal() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [deps, setDeps] = useState<Dep[]>([]);
  const [wds, setWds] = useState<Wd[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busySub, setBusySub] = useState<string | null>(null);
  const [depositMethod, setDepositMethod] = useState<"binance_pay" | "usdt_trc20">("binance_pay");
  const [withdrawMethod, setWithdrawMethod] = useState<"binance_pay" | "usdt_trc20">("binance_pay");
  const [pkgAmounts, setPkgAmounts] = useState<Record<string, string>>({});
  const [confirmSub, setConfirmSub] = useState<{ pkg: Pkg; amount: number } | null>(null);
  const [editSub, setEditSub] = useState<{ id: string; value: string; reason: string } | null>(null);
  type AmountChange = { id: string; subscription_id: string; amount_before: number; amount_after: number; amount_delta: number; currency: string; reason: string | null; created_at: string };
  const [amountChanges, setAmountChanges] = useState<AmountChange[]>([]);
  type Payout = { id: string; subscription_id: string; amount: number; currency: string; period_start: string; period_end: string; created_at: string };
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  async function load() {
    const { data: userRes } = await supabase.auth.getUser();
    const id = userRes.user?.id ?? null;
    setUid(id);
    if (!id) return setLoading(false);
    const [{ data: pk }, { data: sb }, { data: dp }, { data: wd }, { data: al }, { data: sac }, { data: pdist }] = await Promise.all([
      supabase.from("packages").select("*").eq("active", true).order("sort_order"),
      supabase.from("subscriptions").select("*").eq("user_id", id).order("created_at", { ascending: false }),
      supabase.from("deposits").select("*").eq("user_id", id).order("created_at", { ascending: false }),
      supabase.from("withdrawals").select("*").eq("user_id", id).order("created_at", { ascending: false }),
      supabase.from("withdrawal_audit_log").select("*").eq("user_id", id).order("created_at", { ascending: false }),
      supabase.from("subscription_amount_changes").select("*").eq("user_id", id).order("created_at", { ascending: false }),
      supabase.from("profit_distributions").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    ]);
    setPackages((pk ?? []) as Pkg[]);
    setSubs((sb ?? []) as Sub[]);
    setDeps((dp ?? []) as Dep[]);
    setWds((wd ?? []) as Wd[]);
    setAudit((al ?? []) as AuditRow[]);
    setAmountChanges((sac ?? []) as AmountChange[]);
    setPayouts((pdist ?? []) as Payout[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const balance = useMemo(() => {
    const inSum = deps.filter((d) => d.status === "approved").reduce((s, d) => s + Number(d.amount), 0);
    const outSum = wds
      .filter((w) => w.status === "pending" || w.status === "approved" || w.status === "completed")
      .reduce((s, w) => s + Number(w.amount), 0);
    return inSum - outSum;
  }, [deps, wds]);

  const pendingDeposits = deps.filter((d) => d.status === "pending").reduce((s, d) => s + Number(d.amount), 0);
  const activeSubs = subs.filter((s) => s.status === "active" || s.status === "pending");
  const committed = activeSubs.reduce((s, x) => s + Number(x.amount), 0);
  const available = Math.max(0, balance - committed);

  async function subscribeToPackage(pkg: Pkg, requestedAmount: number) {
    if (!uid) return;
    if (busySub) return;
    if (available < Number(pkg.min_amount)) {
      toast.error(`الرصيد المتاح غير كافٍ. الحد الأدنى ${fmt(Number(pkg.min_amount))} ${pkg.currency}`);
      return;
    }
    const amount = requestedAmount;
    if (!Number.isFinite(amount) || amount < Number(pkg.min_amount)) {
      toast.error("المبلغ أقل من الحد الأدنى للباقة");
      return;
    }
    if (amount > available) {
      toast.error("المبلغ يتجاوز الرصيد المتاح");
      return;
    }
    setConfirmSub({ pkg, amount });
  }

  async function performSubscribe(pkg: Pkg, amount: number) {
    if (!uid) return;
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
      const outSum = wds
        .filter((w) => w.status === "pending" || w.status === "approved" || w.status === "completed")
        .reduce((a, w) => a + Number(w.amount), 0);
      const availNow = Math.max(0, inSum - outSum - committedNow);
      if (amount > availNow) {
        toast.error("الرصيد المتاح تغيّر — أعد المحاولة");
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
      // Fire-and-forget notification so it also appears in the bell listener.
      await supabase.from("notifications").insert({
        user_id: uid,
        title: "تم بدء الاشتراك في باقة",
        body: `${pkg.name} — ${fmt(amount)} ${pkg.currency}`,
      });
      toast.success("تم الاشتراك في الباقة");
      await load();
      void router.invalidate();
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
    // Enforce 24-hour lock after start
    const startTs = sub.started_at ? new Date(sub.started_at).getTime() : new Date(sub.created_at).getTime();
    const ageMs = Date.now() - startTs;
    const DAY_MS = 24 * 60 * 60 * 1000;
    if (Number.isFinite(startTs) && ageMs < DAY_MS) {
      const hoursLeft = Math.ceil((DAY_MS - ageMs) / (60 * 60 * 1000));
      toast.error(`لا يمكن إلغاء الاشتراك قبل مرور 24 ساعة — تبقّى ${hoursLeft} ساعة`);
      return;
    }
    // Investors can withdraw their capital at any time — no lockup enforcement.
    if (!window.confirm("تأكيد إلغاء الاشتراك وسحب رأس المال؟")) return;
    setBusySub(sub.id);
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("id", sub.id)
        .eq("user_id", uid)
        .in("status", ["active", "pending"]);
      if (error) return toast.error(error.message);
      await supabase.from("notifications").insert({
        user_id: uid,
        title: "تم إلغاء الاشتراك",
        body: `${fmt(Number(sub.amount))} ${sub.currency}`,
      });
      toast.success("تم إلغاء الاشتراك — يمكنك الاشتراك في باقة أخرى الآن");
      await load();
      void router.invalidate();
    } finally {
      setBusySub(null);
    }
  }

  async function updateSubscriptionAmount(sub: Sub, newAmount: number) {
    if (!uid) return;
    if (busySub) return;
    const pkg = packages.find((p) => p.id === sub.package_id);
    if (!pkg) {
      toast.error("تعذّر إيجاد بيانات الباقة");
      return;
    }
    const min = Number(pkg.min_amount);
    const oldAmount = Number(sub.amount);
    if (!Number.isFinite(newAmount) || newAmount <= 0) {
      toast.error("المبلغ غير صالح");
      return;
    }
    if (newAmount < min) {
      toast.error(`لا يمكن أن يقل مبلغ الاشتراك عن الحد الأدنى ${fmt(min)} ${pkg.currency}`);
      return;
    }
    const maxAllowed = available + oldAmount;
    if (newAmount > maxAllowed) {
      toast.error(`المبلغ يتجاوز الرصيد المتاح — الحد الأقصى ${fmt(maxAllowed)} ${pkg.currency}`);
      return;
    }
    if (newAmount === oldAmount) {
      setEditSub(null);
      return;
    }
    const delta = newAmount - oldAmount;
    const deltaLabel = delta > 0 ? `زيادة بمقدار ${fmt(delta)}` : `تخفيض بمقدار ${fmt(Math.abs(delta))}`;
    if (!window.confirm(`تأكيد تعديل مبلغ اشتراك ${pkg.name}؟\n${fmt(oldAmount)} → ${fmt(newAmount)} ${pkg.currency}\n(${deltaLabel})`)) {
      return;
    }
    setBusySub(`edit:${sub.id}`);
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({ amount: newAmount })
        .eq("id", sub.id)
        .eq("user_id", uid)
        .in("status", ["active", "pending"]);
      if (error) return toast.error(error.message);
      const reason = (editSub?.reason ?? "").trim().slice(0, 200) || null;
      await supabase.from("subscription_amount_changes").insert({
        subscription_id: sub.id,
        user_id: uid,
        amount_before: oldAmount,
        amount_after: newAmount,
        amount_delta: delta,
        currency: pkg.currency,
        reason,
      });
      await supabase.from("notifications").insert({
        user_id: uid,
        title: delta > 0 ? "تمت زيادة مبلغ الاشتراك" : "تم تخفيض مبلغ الاشتراك",
        body: `${pkg.name} — ${fmt(oldAmount)} → ${fmt(newAmount)} ${pkg.currency}`,
      });
      toast.success("تم تحديث مبلغ الاشتراك");
      setEditSub(null);
      await load();
      void router.invalidate();
    } finally {
      setBusySub(null);
    }
  }

  const primarySub = activeSubs[0];
  const primaryPkg = packages.find((p) => p.id === primarySub?.package_id);

  async function submitDeposit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!uid) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = depositSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    // Guard: refuse to create a Binance Pay request when the platform ID is invalid
    if (parsed.data.method === "binance_pay") {
      try { getPlatformBinancePayId(); } catch (err) { return toast.error((err as Error).message); }
    }
    // Required receipt image upload
    const receipt = (fd.get("receipt") as File | null) ?? null;
    let receiptNote = "";
    if (!receipt || receipt.size === 0) {
      return toast.error("يجب رفع صورة إثبات التحويل");
    }
    {
      if (receipt.size > 500 * 1024 * 1024) return toast.error("حجم صورة التحويل يجب ألا يتجاوز 500MB");
      if (!/^image\/(png|jpe?g|webp)$/.test(receipt.type)) return toast.error("صيغة الصورة غير مدعومة (PNG/JPG/WEBP فقط)");
      const ext = receipt.name.split(".").pop() ?? "png";
      const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      try {
        const { error: upErr } = await supabase.storage.from("documents").upload(path, receipt, { upsert: false, contentType: receipt.type });
        if (upErr) {
          const msg = (upErr.message || "").toLowerCase();
          if (msg.includes("row-level") || msg.includes("unauthorized") || msg.includes("permission") || msg.includes("policy")) {
            return toast.error("لا تملك صلاحية رفع صورة التحويل حاليًا — يرجى التواصل مع الدعم");
          }
          if (msg.includes("exceeded") || msg.includes("payload") || msg.includes("too large") || msg.includes("size")) {
            return toast.error("حجم الصورة كبير جدًا — يرجى تقليله والمحاولة مرة أخرى");
          }
          if (msg.includes("mime") || msg.includes("type")) {
            return toast.error("صيغة الصورة غير مسموح بها — استخدم PNG أو JPG أو WEBP");
          }
          if (msg.includes("network") || msg.includes("fetch") || msg.includes("failed")) {
            return toast.error("تعذّر الاتصال أثناء رفع الصورة — تحقق من الإنترنت وأعد المحاولة");
          }
          return toast.error("تعذّر رفع صورة التحويل: " + upErr.message);
        }
        receiptNote = `\n[receipt:documents/${path}]`;
      } catch (err) {
        return toast.error("حدث خطأ أثناء رفع الصورة: " + ((err as Error).message || "غير معروف"));
      }
    }
    const notesWithReceipt = ((parsed.data.notes ?? "") + receiptNote).trim() || undefined;
    const { error } = await supabase.from("deposits").insert({ user_id: uid, ...parsed.data, notes: notesWithReceipt });
    if (error) return toast.error(error.message);
    await supabase.from("notifications").insert({
      user_id: uid,
      title: "تم استلام طلب الإيداع",
      body: `${fmt(parsed.data.amount)} — قيد المراجعة`,
    });
    toast.success("تم إرسال طلب الإيداع بنجاح");
    form.reset();
    await load();
    void router.invalidate();
  }

  async function submitWithdraw(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!uid) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = withdrawSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (parsed.data.amount > balance) return toast.error("المبلغ يتجاوز الرصيد المتاح");
    // Network-specific destination validation
    const rule = ADDRESS_RULES[withdrawMethod];
    if (!rule.regex.test(parsed.data.destination)) return toast.error(rule.label);
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
    // Snapshot active subscriptions BEFORE insert so we can diff post-trigger.
    const before = subs
      .filter((s) => s.status === "active")
      .map((s) => ({ id: s.id, amount: Number(s.amount) }));
    const { error } = await supabase.from("withdrawals").insert({ user_id: uid, ...parsed.data });
    if (error) return toast.error(error.message);
    // The AFTER INSERT trigger `trg_withdrawals_apply_capital` deducts capital
    // atomically. Read the post-trigger state to surface a clear status.
    const { data: after } = before.length > 0
      ? await supabase
          .from("subscriptions")
          .select("id,amount,status")
          .eq("user_id", uid)
          .in("id", before.map((b) => b.id))
      : { data: [] };
    const afterMap = new Map((after ?? []).map((s) => [s.id as string, s]));
    let deducted = 0;
    let cancelled = 0;
    let returned = 0;
    for (const b of before) {
      const a = afterMap.get(b.id);
      if (!a) continue;
      const diff = b.amount - Number(a.amount);
      if (diff > 0) deducted += diff;
      if (a.status === "cancelled") {
        cancelled++;
        returned += Number(a.amount); // leftover returned to general wallet
      }
    }
    await supabase.from("notifications").insert({
      user_id: uid,
      title: "تم استلام طلب السحب",
      body: `${fmt(parsed.data.amount)} — قيد المراجعة`,
    });
    toast.success(`تم إرسال طلب السحب بنجاح — ${fmt(parsed.data.amount)} قيد المراجعة`);
    if (deducted > 0) {
      toast.info(`تم خصم ${fmt(deducted)} من رأس المال في الاشتراكات النشطة`);
    }
    if (cancelled > 0) {
      toast.warning(
        `تم إلغاء ${cancelled} اشتراك${cancelled > 1 ? "ات" : ""} لانخفاض رأس المال تحت الحد الأدنى`,
      );
    }
    if (returned > 0) {
      toast.success(`تم تحويل ${fmt(returned)} إلى المحفظة العامة`);
    }
    form.reset();
    await load();
    void router.invalidate();
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
          <StatCard icon={<Wallet className="h-5 w-5" />} label="الرصيد المتاح" value={fmt(available)} sub="USD" />
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
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((p) => {
              const eligible = available >= Number(p.min_amount);
              const min = Number(p.min_amount);
              const raw = pkgAmounts[p.id] ?? "";
              const parsed = Number(raw);
              const validAmount =
                raw !== "" && Number.isFinite(parsed) && parsed >= min && parsed <= available;
              return (
                <div key={p.id} className="rounded-2xl border border-white/15 bg-white/[0.05] p-6 shadow-lg shadow-black/20 transition hover:border-gold/40 hover:bg-white/[0.07]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold">{p.name}</h3>
                    <span className="rounded-full border border-gold/40 bg-gold/[0.12] px-3 py-1 font-mono text-xs text-gold">
                      {returnRange(Number(p.min_amount))} <span className="text-[10px]">/ أسبوعي</span>
                    </span>
                  </div>
                  {p.description && <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div>الحد الأدنى<div className="mt-0.5 font-mono text-base text-foreground">{fmt(Number(p.min_amount))} {p.currency}</div></div>
                    <div>المخاطرة<div className="mt-0.5 font-mono text-base text-emerald-400">منخفضة</div></div>
                  </div>
                  {eligible && (
                    <div className="mt-3 grid gap-1">
                      <Label className="text-[11px] text-muted-foreground">
                        مبلغ الاشتراك (الحد الأدنى {fmt(min)} {p.currency}، المتاح {fmt(available)} {p.currency})
                      </Label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min={min}
                        max={available}
                        step="0.01"
                        placeholder={String(min)}
                        value={raw}
                        onChange={(e) => setPkgAmounts((s) => ({ ...s, [p.id]: e.target.value }))}
                        className="h-9"
                      />
                      {raw !== "" && !validAmount && (
                        <p className="text-[11px] text-red-400">
                          {parsed < min
                            ? `المبلغ أقل من الحد الأدنى ${fmt(min)} ${p.currency}`
                            : `المبلغ يتجاوز الرصيد المتاح ${fmt(available)} ${p.currency}`}
                        </p>
                      )}
                      {validAmount && (() => {
                        const weekly = parsed * (Number(p.target_return_pct) || 0) / 100;
                        const daily = weekly / 5;
                        const remaining = Math.max(0, available - parsed);
                        return (
                          <div className="mt-2 grid gap-1 rounded-lg border border-gold/20 bg-gold/[0.04] p-3 text-[11px]">
                            <SummaryRow label="مبلغ الاستثمار" value={parsed} currency={p.currency} />
                            <SummaryRow label="الربح الأسبوعي المتوقع" value={weekly} currency={p.currency} sign="+" tone="gain" />
                            <SummaryRow label="الربح اليومي (5 أيام)" value={daily} currency={p.currency} sign="+" tone="gain" />
                            <div className="border-t border-white/5 pt-1">
                              <SummaryRow label="المتبقي في المحفظة" value={remaining} currency={p.currency} />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  <Button
                    type="button"
                    disabled={!eligible || !validAmount || busySub === `new:${p.id}` || !!busySub}
                    onClick={() => subscribeToPackage(p, parsed)}
                    className="mt-5 h-11 w-full bg-red-600 text-base font-semibold text-white shadow-md shadow-red-900/30 hover:bg-red-700 disabled:opacity-50"
                  >
                    {busySub === `new:${p.id}` ? "جارٍ التنفيذ..." : eligible ? "اشترك بهذه الباقة" : "الرصيد غير كافٍ"}
                  </Button>
                </div>
              );
            })}
            {packages.length === 0 && <p className="text-sm text-muted-foreground">لا توجد باقات متاحة حاليًا.</p>}
          </div>

          {activeSubs.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold tracking-wide text-foreground">اشتراكاتي الحالية</h3>
              <ul className="mt-4 divide-y divide-white/10">
                {activeSubs.map((s) => {
                  const meta = packages.find((p) => p.id === s.package_id);
                  const min = meta ? Number(meta.min_amount) : 0;
                  const oldAmount = Number(s.amount);
                  const maxAllowed = available + oldAmount;
                  const isEditing = editSub?.id === s.id;
                  const parsedEdit = isEditing ? Number(editSub!.value) : NaN;
                  const editValid =
                    isEditing &&
                    editSub!.value !== "" &&
                    Number.isFinite(parsedEdit) &&
                    parsedEdit >= min &&
                    parsedEdit <= maxAllowed;
                  return (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-4 py-5 text-base">
                      <div className="min-w-0 flex-1">
                        <p className="text-xl font-semibold">{meta?.name ?? s.package_id.slice(0, 8)}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {fmt(oldAmount)} {s.currency}
                          {s.ends_at ? ` · حتى ${new Date(s.ends_at).toLocaleDateString()}` : ""}
                        </p>
                        {isEditing && (
                          <div className="mt-3 grid max-w-md gap-1">
                            <Label className="text-[11px] text-muted-foreground">
                              مبلغ جديد (الحد الأدنى {fmt(min)} {s.currency}، الحد الأقصى {fmt(maxAllowed)} {s.currency})
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                inputMode="decimal"
                                min={min}
                                max={maxAllowed}
                                step="0.01"
                                value={editSub!.value}
                                onChange={(e) => setEditSub({ id: s.id, value: e.target.value, reason: editSub?.reason ?? "" })}
                                className="h-9"
                              />
                              <Button
                                size="sm"
                                disabled={!editValid || busySub === `edit:${s.id}` || !!busySub}
                                onClick={() => updateSubscriptionAmount(s, parsedEdit)}
                                className="h-9 bg-red-600 text-white hover:bg-red-700"
                              >
                                {busySub === `edit:${s.id}` ? "..." : "حفظ"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditSub(null)}
                                disabled={busySub === `edit:${s.id}`}
                                className="h-9 border-white/15"
                              >
                                إلغاء
                              </Button>
                            </div>
                            {editSub!.value !== "" && !editValid && (
                              <p className="text-[11px] text-red-400">
                                {parsedEdit < min
                                  ? `المبلغ أقل من الحد الأدنى ${fmt(min)} ${s.currency}`
                                  : `المبلغ يتجاوز الحد الأقصى ${fmt(maxAllowed)} ${s.currency}`}
                              </p>
                            )}
                            <Label className="mt-2 text-[11px] text-muted-foreground">السبب (اختياري)</Label>
                            <Input
                              value={editSub!.reason}
                              maxLength={200}
                              placeholder="مثال: إضافة رأس مال إضافي / تخفيض للسحب"
                              onChange={(e) => setEditSub({ id: s.id, value: editSub!.value, reason: e.target.value })}
                              className="h-9"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusPill status={s.status} />
                        {!isEditing && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!!busySub}
                            onClick={() => setEditSub({ id: s.id, value: String(oldAmount), reason: "" })}
                            className="h-9 border-white/15 text-sm"
                          >
                            تعديل المبلغ
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busySub === s.id || !!busySub}
                          onClick={() => cancelSubscription(s)}
                          className="h-9 border-white/15 text-sm"
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
            <form onSubmit={submitDeposit} className="mt-4 grid gap-3 [&_input]:bg-white/10 [&_input]:text-foreground [&_input]:border-white/20 [&_input::placeholder]:text-muted-foreground [&_textarea]:bg-white/10 [&_textarea]:text-foreground [&_textarea]:border-white/20 [&_select]:text-foreground [&_select_option]:bg-neutral-900 [&_select_option]:text-foreground">
              <Field label="المبلغ (USD)"><Input name="amount" type="number" min="1" step="0.01" required /></Field>
              <Field label="طريقة الدفع">
                <select
                  name="method"
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value as typeof depositMethod)}
                  className="h-9 w-full rounded-md border border-white/20 bg-white/10 px-3 text-sm text-foreground"
                >
                  <option value="binance_pay">محفظة Binance Pay</option>
                  <option value="usdt_trc20">USDT — شبكة TRC20</option>
                </select>
              </Field>
              {(depositMethod === "binance_pay" || depositMethod === "usdt_trc20") && (
                <div className="rounded-xl border border-amber-400/30 bg-amber-400/[0.05] p-3 text-xs">
                  <div className="mb-1 font-semibold text-amber-300">
                    {depositMethod === "binance_pay" ? "Binance Pay ID للمنصة" : "عنوان USDT-TRC20"}
                  </div>
                  {depositMethod === "binance_pay" && !IS_BINANCE_PAY_ID_VALID ? (
                    <div className="rounded-md border border-red-500/40 bg-red-500/10 p-2 text-[11px] text-red-200">
                      Binance Pay ID الخاص بالمنصة غير صالح حاليًا — يرجى استخدام طريقة إيداع أخرى أو التواصل مع الإدارة.
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 break-all font-mono text-[11px] text-foreground">{PLATFORM_WALLETS[depositMethod]}</div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 shrink-0 px-2"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(PLATFORM_WALLETS[depositMethod]);
                              toast.success("تم نسخ العنوان");
                            } catch {
                              toast.error("تعذّر النسخ");
                            }
                          }}
                        >
                          <Copy className="h-3 w-3" />
                          <span className="ms-1 text-[11px]">نسخ</span>
                        </Button>
                      </div>
                      {depositMethod === "usdt_trc20" && (
                        <div className="mt-2 flex justify-center">
                          <img src={trc20QrAsset.url} alt="TRC20 wallet QR code" width={140} height={140} className="rounded-md bg-white p-1" />
                        </div>
                      )}
                      <p className="mt-2 text-muted-foreground">أرسل المبلغ إلى العنوان أعلاه ثم ألصق hash المعاملة (TxID) في حقل المرجع. سيُضاف الرصيد بعد تأكيد الاستلام من الإدارة.</p>
                    </>
                  )}
                </div>
              )}
              <Field label="صورة إثبات التحويل (مطلوب)">
                <Input name="receipt" type="file" required accept="image/png,image/jpeg,image/webp" className="file:mr-2 file:rounded file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-xs file:text-foreground" />
              </Field>
              <p className="text-[11px] text-muted-foreground">ارفع لقطة شاشة أو إيصال التحويل (PNG/JPG/WEBP — بحد أقصى 500MB) — إلزامي. سيراجعها الفريق قبل اعتماد الإيداع.</p>
              <Field label="ملاحظات"><Textarea name="notes" maxLength={500} rows={2} /></Field>
              <Button type="submit" className="bg-red-600 font-semibold text-white hover:bg-red-700">إرسال طلب الإيداع</Button>
              <p className="text-[11px] text-muted-foreground">جميع الإيداعات (Binance / USDT-TRC20) يعتمدها الفريق يدويًا بعد التأكد من استلام الأموال.</p>
            </form>
          </div>

          <div id="withdraw" className="glass rounded-3xl p-6 scroll-mt-24">
            <div className="flex items-center gap-2">
              <ArrowUpFromLine className="h-5 w-5 text-gold" />
              <h2 className="font-display text-lg font-semibold">طلب سحب</h2>
            </div>
            <form onSubmit={submitWithdraw} className="mt-4 grid gap-3 [&_input]:bg-white/10 [&_input]:text-foreground [&_input]:border-white/20 [&_input::placeholder]:text-muted-foreground [&_textarea]:bg-white/10 [&_textarea]:text-foreground [&_textarea]:border-white/20 [&_select]:text-foreground [&_select_option]:bg-neutral-900 [&_select_option]:text-foreground">
              <Field label="المبلغ (USD) — الحد الأدنى 10$"><Input name="amount" type="number" min="10" step="0.01" required /></Field>
              <Field label="طريقة السحب">
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value as typeof withdrawMethod)}
                  className="h-9 w-full rounded-md border border-white/20 bg-white/10 px-3 text-sm text-foreground"
                >
                  <option value="binance_pay">Binance Pay ID</option>
                  <option value="usdt_trc20">USDT — شبكة TRC20</option>
                </select>
              </Field>
              <Field label={withdrawMethod === "binance_pay" ? "Binance Pay ID الخاص بك" : "عنوان محفظتك"}>
                <Input name="destination" required maxLength={120} placeholder={withdrawMethod === "binance_pay" ? "123456789" : "T..."} />
              </Field>
              <Field label="الشبكة">
                <Input name="iban" readOnly value={withdrawMethod === "binance_pay" ? "Binance Pay" : "TRC20 (Tron)"} />
              </Field>
              <p className="text-[11px] text-amber-300/80">تأكد من صحة العنوان والشبكة — التحويلات على شبكة خاطئة لا يمكن استرجاعها.</p>
              <Field label="ملاحظات"><Textarea name="notes" maxLength={500} rows={2} /></Field>
              <Button type="submit" className="bg-red-600 font-semibold text-white hover:bg-red-700">إرسال طلب السحب</Button>
            </form>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <HistoryList title="سجل الإيداعات" empty="لا توجد إيداعات." rows={deps.map((d) => ({ id: d.id, primary: `${fmt(Number(d.amount))} ${d.currency}`, secondary: `${d.method} · ${new Date(d.created_at).toLocaleDateString()}`, status: d.status }))} />
          <WithdrawList
            wds={wds}
            busy={busySub}
            onCancel={async (w) => {
              if (!window.confirm(`إلغاء طلب سحب ${fmt(Number(w.amount))} ${w.currency}؟ سيتم استرجاع رأس المال.`)) return;
              setBusySub(`cancel:${w.id}`);
              const { error } = await supabase.from("withdrawals").delete().eq("id", w.id);
              setBusySub(null);
              if (error) {
                toast.error(error.message);
                return;
              }
              toast.success("تم إلغاء طلب السحب");
              await load();
              void router.invalidate();
            }}
          />
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
              let countdown = "";
              if (s.status === "active") {
                const startTs = s.started_at ? new Date(s.started_at).getTime() : new Date(s.created_at).getTime();
                const DAY_MS = 24 * 60 * 60 * 1000;
                const msLeft = startTs + DAY_MS - now;
                if (msLeft > 0) {
                  const h = Math.floor(msLeft / (60 * 60 * 1000));
                  const m = Math.floor((msLeft % (60 * 60 * 1000)) / (60 * 1000));
                  countdown = ` · ⏳ يمكن الإلغاء بعد ${h}س ${m}د`;
                } else {
                  countdown = " · ✓ متاح الإلغاء";
                }
              }
              return {
                id: s.id,
                primary: `${meta?.name ?? s.package_id.slice(0, 8)} — ${fmt(Number(s.amount))} ${s.currency}`,
                secondary: range + countdown,
                status: s.status,
              };
            })}
          />
        </div>

        <div className="mt-6">
          <WithdrawalAudit wds={wds} audit={audit} packages={packages} subs={subs} />
        </div>

        <div className="mt-6 glass rounded-3xl p-6">
          <h3 className="font-display text-lg font-semibold">سجل تعديلات مبلغ الاشتراك</h3>
          {amountChanges.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">لا توجد تعديلات بعد.</p>
          ) : (
            <ul className="mt-4 divide-y divide-white/10 text-sm">
              {amountChanges.map((c) => {
                const sub = subs.find((s) => s.id === c.subscription_id);
                const pkgName = packages.find((p) => p.id === sub?.package_id)?.name ?? c.subscription_id.slice(0, 8);
                const positive = Number(c.amount_delta) > 0;
                return (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{pkgName}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {fmt(Number(c.amount_before))} → {fmt(Number(c.amount_after))} {c.currency}
                        <span className={`ms-2 ${positive ? "text-emerald-400" : "text-red-400"}`}>
                          ({positive ? "+" : ""}{fmt(Number(c.amount_delta))})
                        </span>
                      </p>
                      {c.reason && <p className="mt-0.5 text-xs text-muted-foreground">السبب: {c.reason}</p>}
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-6 glass rounded-3xl p-6">
          <h3 className="font-display text-lg font-semibold">سجل التوزيعات اليومية</h3>
          <p className="mt-1 text-xs text-muted-foreground">النسبة المُطلقة بعد مرور 24 ساعة من كل اشتراك مع وقت الإصدار.</p>
          {payouts.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">لا توجد توزيعات بعد.</p>
          ) : (
            <ul className="mt-4 divide-y divide-white/10 text-sm">
              {payouts.map((p) => {
                const sub = subs.find((s) => s.id === p.subscription_id);
                const pkgName = packages.find((pk) => pk.id === sub?.package_id)?.name ?? p.subscription_id.slice(0, 8);
                const base = Number(sub?.amount ?? 0);
                const pct = base > 0 ? (Number(p.amount) / base) * 100 : 0;
                return (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{pkgName}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        +{fmt(Number(p.amount))} {p.currency}
                        <span className="ms-2 text-emerald-400">({pct.toFixed(2)}%)</span>
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <AlertDialog open={!!confirmSub} onOpenChange={(o) => { if (!o) setConfirmSub(null); }}>
        <AlertDialogContent className="border-white/10 bg-neutral-950/95 text-foreground backdrop-blur data-[state=open]:animate-scale-in">
          {confirmSub && (() => {
            const { pkg, amount } = confirmSub;
            const weekly = amount * (Number(pkg.target_return_pct) || 0) / 100;
            const daily = weekly / 5;
            const remaining = Math.max(0, available - amount);
            return (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display">تأكيد الاشتراك — {pkg.name}</AlertDialogTitle>
                  <AlertDialogDescription>راجع تفاصيل الاشتراك قبل التنفيذ. لا يمكن التراجع تلقائيًا بعد التأكيد.</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-2 grid gap-2 rounded-xl border border-gold/20 bg-gold/[0.05] p-4 text-sm">
                  <SummaryRow label="مبلغ الاستثمار" value={amount} currency={pkg.currency} />
                  <SummaryRow label="الربح الأسبوعي المتوقع" value={weekly} currency={pkg.currency} sign="+" tone="gain" />
                  <SummaryRow label="الربح اليومي (5 أيام)" value={daily} currency={pkg.currency} sign="+" tone="gain" />
                  <div className="border-t border-white/5 pt-2">
                    <SummaryRow label="المتبقي في المحفظة" value={remaining} currency={pkg.currency} />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-white/10 bg-transparent hover:bg-white/5">إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      const c = confirmSub;
                      setConfirmSub(null);
                      void performSubscribe(c.pkg, c.amount);
                    }}
                    className="bg-red-600 font-semibold text-white hover:bg-red-700"
                  >
                    تأكيد الاشتراك
                  </AlertDialogAction>
                </AlertDialogFooter>
              </>
            );
          })()}
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}

function WithdrawalAudit({ wds, audit, packages, subs }: { wds: Wd[]; audit: AuditRow[]; packages: Pkg[]; subs: Sub[] }) {
  const eventLabel = (e: string) => {
    switch (e) {
      case "deducted": return "خصم من الاشتراك";
      case "cancelled": return "إيقاف الاشتراك (أقل من الحد الأدنى)";
      case "returned_to_wallet": return "إعادة الرصيد إلى المحفظة العامة";
      default: return e;
    }
  };
  const eventColor = (e: string) => {
    switch (e) {
      case "deducted": return "text-amber-300";
      case "cancelled": return "text-red-400";
      case "returned_to_wallet": return "text-emerald-300";
      default: return "text-muted-foreground";
    }
  };
  const subPkgName = (subId: string | null) => {
    if (!subId) return null;
    const s = subs.find((x) => x.id === subId);
    if (!s) return subId.slice(0, 8);
    return packages.find((p) => p.id === s.package_id)?.name ?? s.package_id.slice(0, 8);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">سجل تدقيق السحوبات والخصومات</h3>
      {wds.length === 0 ? (
        <p className="text-xs text-muted-foreground">لا توجد عمليات سحب بعد.</p>
      ) : (
        <ul className="space-y-4">
          {wds.map((w) => {
            const entries = audit.filter((a) => a.withdrawal_id === w.id);
            return (
              <li key={w.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm text-white">
                    طلب سحب <span className="font-semibold">{fmt(Number(w.amount))} {w.currency}</span>
                    <span className="mx-2 text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString()}</span>
                  </div>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-muted-foreground">{w.status}</span>
                </div>
                {entries.length === 0 ? (
                  <p className="mt-3 text-xs text-muted-foreground">لا توجد سجلات تدقيق مرتبطة بهذا الطلب.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {entries.map((a) => (
                      <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className={`font-semibold ${eventColor(a.event)}`}>{eventLabel(a.event)}</span>
                          {subPkgName(a.subscription_id) && (
                            <span className="text-muted-foreground">الاشتراك: {subPkgName(a.subscription_id)}</span>
                          )}
                        </div>
                        <div className="text-left text-muted-foreground">
                          <div>المبلغ: <span className="text-white">{fmt(Number(a.amount_delta))} {a.currency}</span></div>
                          <div className="text-[11px]">{fmt(Number(a.amount_before))} ← {fmt(Number(a.amount_after))}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
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

function WithdrawList({ wds, busy, onCancel }: { wds: Wd[]; busy: string | null; onCancel: (w: Wd) => void | Promise<void> }) {
  return (
    <div className="glass rounded-3xl p-6">
      <h2 className="font-display text-lg font-semibold">سجل السحوبات</h2>
      {wds.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">لا توجد سحوبات.</p>
      ) : (
        <ul className="mt-4 divide-y divide-white/5">
          {wds.map((w) => (
            <li key={w.id} className="flex items-center justify-between gap-2 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium">{fmt(Number(w.amount))} {w.currency}</p>
                <p className="text-xs text-muted-foreground">{w.destination} · {new Date(w.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={w.status} />
                {w.status === "pending" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy === `cancel:${w.id}` || !!busy}
                    onClick={() => void onCancel(w)}
                    className="h-8 border-red-500/40 text-red-300 hover:bg-red-500/10"
                  >
                    {busy === `cancel:${w.id}` ? "..." : "إلغاء"}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
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

function fmtCurrency(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "code",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${fmt(n)} ${currency}`;
  }
}

function useAnimatedNumber(value: number, duration = 280) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    startRef.current = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (to - from) * eased;
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);
  return display;
}

function SummaryRow({ label, value, currency, sign = "", tone }: { label: string; value: number; currency: string; sign?: string; tone?: "gain" }) {
  const animated = useAnimatedNumber(value);
  const cls = tone === "gain" ? "text-emerald-300" : "text-foreground";
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono tabular-nums transition-colors duration-200 ${cls}`}>
        {sign}
        {fmtCurrency(animated, currency)}
      </span>
    </div>
  );
}

function returnRange(min: number) {
  if (min >= 1000) return "16% – 24%";
  if (min >= 500) return "10% – 16%";
  return "6% – 10%";
}