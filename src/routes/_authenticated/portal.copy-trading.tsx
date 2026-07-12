import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Wallet, Pause, Play, X, TrendingUp } from "lucide-react";
import { PortalShell, PortalCard } from "@/components/portal-shell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  listActiveMasters,
  getMyCopyState,
  subscribeToMaster,
  updateMyCopySubscription,
} from "@/lib/copy-trading.functions";

export const Route = createFileRoute("/_authenticated/portal/copy-trading")({
  head: () => ({
    meta: [
      { title: "نسخ الصفقات — HK Investment Management" },
      { name: "description", content: "اشترك في نسخ صفقات محترفينا تلقائيًا من رصيدك." },
    ],
  }),
  component: CopyTradingPage,
});

const fmt = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);

function CopyTradingPage() {
  const fetchMasters = useServerFn(listActiveMasters);
  const fetchState = useServerFn(getMyCopyState);
  const subscribe = useServerFn(subscribeToMaster);
  const updateSub = useServerFn(updateMyCopySubscription);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const mastersQ = useQuery({ queryKey: ["copy", "masters"], queryFn: () => fetchMasters() });
  const stateQ = useQuery({ queryKey: ["copy", "mystate"], queryFn: () => fetchState() });

  const [amount, setAmount] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [depositPrompt, setDepositPrompt] = useState<
    { required: number; available: number; shortfall: number } | null
  >(null);

  const master = mastersQ.data?.masters?.[0];
  const subs = stateQ.data?.subscriptions ?? [];
  const fills = stateQ.data?.fills ?? [];
  const activeSub = subs.find((s) => s.status === "active" || s.status === "paused");

  async function handleSubscribe() {
    if (!master) return;
    const amt = Number(amount);
    if (!(amt > 0)) return toast.error("أدخل مبلغًا صحيحًا");
    setBusy(true);
    try {
      const res = await subscribe({ data: { masterId: master.id, amount: amt } });
      if (!res.ok && res.needs_deposit) {
        setDepositPrompt({
          required: amt,
          available: res.available ?? 0,
          shortfall: res.shortfall ?? 0,
        });
      } else {
        toast.success("تم تفعيل نسخ الصفقات");
        setAmount("");
        qc.invalidateQueries({ queryKey: ["copy"] });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الاشتراك");
    } finally {
      setBusy(false);
    }
  }

  async function transition(id: string, status: "active" | "paused" | "closed") {
    try {
      await updateSub({ data: { id, status } });
      toast.success("تم التحديث");
      qc.invalidateQueries({ queryKey: ["copy"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل التحديث");
    }
  }

  return (
    <PortalShell eyebrow="نسخ الصفقات" title="Copy Trading" subtitle="اشترك في نسخ صفقات محترفينا وتُنفَّذ تلقائيًا على حسابك.">
      {!master ? (
        <PortalCard title="لا يوجد مزود متاح حاليًا" icon={Copy}>
          <p className="py-8 text-center text-sm text-muted-foreground">سيتم فتح باب نسخ الصفقات قريبًا.</p>
        </PortalCard>
      ) : (
        <div className="space-y-6">
          <PortalCard title={master.name} icon={TrendingUp}>
            <div className="grid gap-4 md:grid-cols-3">
              <Meta label="مستوى المخاطر" value={master.risk_level} />
              <Meta label="الحد الأدنى" value={`$${fmt(Number(master.min_capital))}`} />
              <Meta label="رسوم الأداء" value={`${fmt(Number(master.performance_fee_pct))}%`} />
            </div>
            {master.bio && <p className="mt-4 text-sm text-muted-foreground">{master.bio}</p>}
            {!activeSub && (
              <div className="mt-6 space-y-3 border-t border-white/5 pt-4">
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  المبلغ المخصص (USD)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={master.min_capital}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`≥ ${fmt(Number(master.min_capital))}`}
                    className="flex-1 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-gold/60"
                  />
                  <button
                    onClick={handleSubscribe}
                    disabled={busy}
                    className="rounded-md border border-gold/40 bg-gold/[0.08] px-4 py-2 text-sm font-medium text-gold transition hover:bg-gold/[0.15] disabled:opacity-50"
                  >
                    {busy ? "…" : "اشترك"}
                  </button>
                </div>
              </div>
            )}
          </PortalCard>

          {activeSub && (
            <PortalCard title="اشتراكك النشط" icon={Copy}>
              <div className="grid gap-3 sm:grid-cols-3">
                <Meta label="المبلغ الحالي" value={`$${fmt(Number(activeSub.allocated_amount))}`} />
                <Meta label="الحالة" value={activeSub.status} />
                <Meta label="بدأ في" value={new Date(activeSub.started_at).toLocaleDateString()} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {activeSub.status === "active" && (
                  <button
                    onClick={() => transition(activeSub.id, "paused")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/40 bg-amber-400/[0.06] px-3 py-1.5 text-xs text-amber-200"
                  >
                    <Pause className="h-3.5 w-3.5" /> إيقاف مؤقت
                  </button>
                )}
                {activeSub.status === "paused" && (
                  <button
                    onClick={() => transition(activeSub.id, "active")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/40 bg-emerald-400/[0.06] px-3 py-1.5 text-xs text-emerald-200"
                  >
                    <Play className="h-3.5 w-3.5" /> استئناف
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm("إغلاق الاشتراك نهائيًا؟")) transition(activeSub.id, "closed");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-400/40 bg-red-400/[0.06] px-3 py-1.5 text-xs text-red-200"
                >
                  <X className="h-3.5 w-3.5" /> إغلاق
                </button>
              </div>
            </PortalCard>
          )}

          {fills.length > 0 && (
            <PortalCard title="آخر الصفقات المنسوخة" icon={TrendingUp}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    <tr className="text-right">
                      <th className="py-2">الرمز</th>
                      <th>الاتجاه</th>
                      <th>المبلغ</th>
                      <th>الربح/الخسارة</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fills.slice(0, 20).map((f) => (
                      <tr key={f.id} className="border-t border-white/5">
                        <td className="py-2">{f.copy_master_trades?.symbol ?? "—"}</td>
                        <td>{f.copy_master_trades?.side ?? "—"}</td>
                        <td>${fmt(Number(f.allocated_amount))}</td>
                        <td className={Number(f.pnl) >= 0 ? "text-emerald-300" : "text-red-300"}>
                          {Number(f.pnl) >= 0 ? "+" : ""}${fmt(Number(f.pnl))}
                        </td>
                        <td>{f.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PortalCard>
          )}
        </div>
      )}

      <AlertDialog
        open={!!depositPrompt}
        onOpenChange={(open) => { if (!open) setDepositPrompt(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>الرصيد غير كافٍ لتفعيل نسخ الصفقات</AlertDialogTitle>
            <AlertDialogDescription>
              لبدء الاشتراك بمبلغ ${fmt(depositPrompt?.required ?? 0)} تحتاج إلى إيداع مبلغ إضافي في محفظتك.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-3 gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3 text-center text-xs">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">رصيدك الحالي</p>
              <p className="mt-1 font-mono text-base tabular-nums">${fmt(depositPrompt?.available ?? 0)}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">المبلغ المطلوب</p>
              <p className="mt-1 font-mono text-base tabular-nums">${fmt(depositPrompt?.required ?? 0)}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">مبلغ الإيداع الناقص</p>
              <p className="mt-1 font-mono text-base tabular-nums text-amber-300">
                ${fmt(depositPrompt?.shortfall ?? 0)}
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDepositPrompt(null);
                navigate({ to: "/portal/transactions" });
              }}
              className="bg-gold text-background hover:bg-[oklch(0.88_0.11_90)]"
            >
              <Wallet className="ml-1 h-4 w-4" /> إيداع الآن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PortalShell>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg text-foreground">{value}</p>
    </div>
  );
}