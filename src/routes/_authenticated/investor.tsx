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
  method: z.enum(["bank_transfer", "card"]),
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

function InvestorPortal() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [deps, setDeps] = useState<Dep[]>([]);
  const [wds, setWds] = useState<Wd[]>([]);
  const [loading, setLoading] = useState(true);

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
  const activePackage = subs.find((s) => s.status === "active") ?? subs[0];
  const activePkgMeta = packages.find((p) => p.id === activePackage?.package_id);

  async function submitDeposit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!uid) return;
    const fd = new FormData(e.currentTarget);
    const parsed = depositSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
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
        <Link
          to="/portal"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-gold/40 hover:text-foreground"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          <span>رجوع إلى بوابة العميل</span>
        </Link>
        <div>
          <p className="mt-4 text-xs uppercase tracking-widest text-gold">Investor Portal</p>
          <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">حسابك الاستثماري</h1>
          <p className="mt-2 text-sm text-muted-foreground">الرصيد، الإيداعات، السحوبات، والباقات — كل شيء في مكان واحد.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Wallet className="h-5 w-5" />} label="الرصيد المتاح" value={fmt(balance)} sub="USD" />
          <StatCard icon={<Clock className="h-5 w-5" />} label="إيداعات قيد المراجعة" value={fmt(pendingDeposits)} sub="USD" />
          <StatCard
            icon={<PackageIcon className="h-5 w-5" />}
            label="الباقة النشطة"
            value={activePkgMeta?.name ?? "—"}
            sub={activePackage ? `${activePackage.status}` : "لا يوجد اشتراك"}
          />
          <StatCard icon={<ShieldCheck className="h-5 w-5" />} label="حالة الحساب" value={uid ? "موثّق" : "—"} sub="KYC" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2">
              <ArrowDownToLine className="h-5 w-5 text-gold" />
              <h2 className="font-display text-lg font-semibold">إيداع جديد</h2>
            </div>
            <form onSubmit={submitDeposit} className="mt-4 grid gap-3">
              <Field label="المبلغ (USD)"><Input name="amount" type="number" min="1" step="0.01" required /></Field>
              <Field label="طريقة الدفع">
                <select name="method" className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm" defaultValue="bank_transfer">
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="card">بطاقة ائتمان (قريبًا)</option>
                </select>
              </Field>
              <Field label="مرجع التحويل (اختياري)"><Input name="reference" maxLength={120} /></Field>
              <Field label="ملاحظات"><Textarea name="notes" maxLength={500} rows={2} /></Field>
              <Button type="submit" className="bg-[var(--gradient-gold)] font-semibold text-background">إرسال طلب الإيداع</Button>
              <p className="text-[11px] text-muted-foreground">التحويل البنكي: يعتمده الفريق يدويًا بعد التأكد من الاستلام. سيتم إضافة الدفع بالبطاقة عبر بوابة آمنة قريبًا.</p>
            </form>
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2">
              <ArrowUpFromLine className="h-5 w-5 text-gold" />
              <h2 className="font-display text-lg font-semibold">طلب سحب</h2>
            </div>
            <form onSubmit={submitWithdraw} className="mt-4 grid gap-3">
              <Field label="المبلغ (USD)"><Input name="amount" type="number" min="1" step="0.01" required /></Field>
              <Field label="اسم المستفيد / الوجهة"><Input name="destination" required maxLength={120} /></Field>
              <Field label="IBAN"><Input name="iban" maxLength={64} /></Field>
              <Field label="SWIFT"><Input name="swift" maxLength={32} /></Field>
              <Field label="ملاحظات"><Textarea name="notes" maxLength={500} rows={2} /></Field>
              <Button type="submit" variant="outline" className="border-white/15">إرسال طلب السحب</Button>
            </form>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <HistoryList title="سجل الإيداعات" empty="لا توجد إيداعات." rows={deps.map((d) => ({ id: d.id, primary: `${fmt(Number(d.amount))} ${d.currency}`, secondary: `${d.method} · ${new Date(d.created_at).toLocaleDateString()}`, status: d.status }))} />
          <HistoryList title="سجل السحوبات" empty="لا توجد سحوبات." rows={wds.map((w) => ({ id: w.id, primary: `${fmt(Number(w.amount))} ${w.currency}`, secondary: `${w.destination} · ${new Date(w.created_at).toLocaleDateString()}`, status: w.status }))} />
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