import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell, AdminCard } from "@/components/admin-shell";
import { Copy, TrendingUp, Users, Wallet, History, Plus, X, Pause, Play } from "lucide-react";
import {
  adminListMasters,
  adminUpsertMaster,
  adminListSubscriptions,
  adminSetSubscriptionStatus,
  adminOpenMasterTrade,
  adminCloseMasterTrade,
  adminListMasterTrades,
  adminAdjustBalance,
  adminReadAuditLog,
} from "@/lib/copy-trading.functions";

export const Route = createFileRoute("/_authenticated/_admin/admin/copy-trading")({
  head: () => ({
    meta: [
      { title: "Admin — Copy Trading" },
      { name: "description", content: "Manage copy-trading masters, subscriptions, trades and balances." },
    ],
  }),
  component: AdminCopyTrading,
});

const fmt = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);

function AdminCopyTrading() {
  const qc = useQueryClient();
  const listMasters = useServerFn(adminListMasters);
  const upsertMaster = useServerFn(adminUpsertMaster);
  const listSubs = useServerFn(adminListSubscriptions);
  const setSubStatus = useServerFn(adminSetSubscriptionStatus);
  const openTrade = useServerFn(adminOpenMasterTrade);
  const closeTrade = useServerFn(adminCloseMasterTrade);
  const listTrades = useServerFn(adminListMasterTrades);
  const adjustBalance = useServerFn(adminAdjustBalance);
  const readAudit = useServerFn(adminReadAuditLog);

  const mastersQ = useQuery({ queryKey: ["admin-copy", "masters"], queryFn: () => listMasters() });
  const subsQ = useQuery({ queryKey: ["admin-copy", "subs"], queryFn: () => listSubs({ data: { status: "all" } }) });
  const tradesQ = useQuery({ queryKey: ["admin-copy", "trades"], queryFn: () => listTrades() });
  const auditQ = useQuery({ queryKey: ["admin-copy", "audit"], queryFn: () => readAudit() });

  const [master, setMaster] = useState({
    name: "",
    bio: "",
    risk_level: "medium" as "low" | "medium" | "high",
    min_capital: 100,
    performance_fee_pct: 20,
    is_active: true,
  });

  const [trade, setTrade] = useState({
    master_id: "",
    symbol: "",
    side: "buy" as "buy" | "sell",
    entry_price: 0,
    volume: 0,
  });

  const [adjust, setAdjust] = useState({ user_email: "", delta: 0, reason: "" });

  const invalidateAll = () => qc.invalidateQueries({ queryKey: ["admin-copy"] });

  async function saveMaster() {
    try {
      await upsertMaster({ data: master });
      toast.success("تم الحفظ");
      setMaster({ ...master, name: "", bio: "" });
      invalidateAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطأ");
    }
  }

  async function submitTrade() {
    try {
      await openTrade({ data: trade });
      toast.success("تم فتح الصفقة");
      setTrade({ ...trade, symbol: "", entry_price: 0, volume: 0 });
      invalidateAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطأ");
    }
  }

  async function doClose(id: string) {
    const raw = prompt("سعر الإغلاق:");
    if (!raw) return;
    const exit = Number(raw);
    if (!(exit > 0)) return toast.error("سعر غير صالح");
    try {
      const res = await closeTrade({ data: { trade_id: id, exit_price: exit } });
      toast.success(`تم الإغلاق — ${res.affected} مشتركًا · P&L ${fmt(res.pnl_pct)}%`);
      invalidateAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطأ");
    }
  }

  async function submitAdjust() {
    if (!adjust.reason.trim() || adjust.delta === 0 || !adjust.user_email) return toast.error("املأ الحقول");
    try {
      await adjustBalance({ data: adjust });
      toast.success("تم التعديل");
      setAdjust({ user_email: "", delta: 0, reason: "" });
      invalidateAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطأ");
    }
  }

  async function transitionSub(id: string, status: "active" | "paused" | "closed") {
    try {
      await setSubStatus({ data: { id, status } });
      toast.success("تم التحديث");
      invalidateAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطأ");
    }
  }

  return (
    <AdminShell eyebrow="Copy Trading" title="نسخ الصفقات" subtitle="إدارة المزودين، الصفقات، الاشتراكات، الأرصدة، والتدقيق.">
      <div className="space-y-6">
        <AdminCard title="إضافة/تعديل مزود" icon={Plus}>
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="الاسم" value={master.name} onChange={(v) => setMaster({ ...master, name: v })} />
            <Select
              label="المخاطر"
              value={master.risk_level}
              onChange={(v) => setMaster({ ...master, risk_level: v as "low" | "medium" | "high" })}
              options={[
                ["low", "منخفضة"],
                ["medium", "متوسطة"],
                ["high", "عالية"],
              ]}
            />
            <NumInput label="الحد الأدنى (USD)" value={master.min_capital} onChange={(v) => setMaster({ ...master, min_capital: v })} />
            <NumInput label="رسوم الأداء %" value={master.performance_fee_pct} onChange={(v) => setMaster({ ...master, performance_fee_pct: v })} />
            <div className="md:col-span-2">
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">نبذة</label>
              <textarea
                value={master.bio}
                onChange={(e) => setMaster({ ...master, bio: e.target.value })}
                rows={2}
                className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-gold/60"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={master.is_active}
                onChange={(e) => setMaster({ ...master, is_active: e.target.checked })}
              />
              نشط
            </label>
          </div>
          <button onClick={saveMaster} className="mt-4 rounded-md border border-gold/40 bg-gold/[0.08] px-4 py-2 text-sm text-gold">
            حفظ
          </button>
          <div className="mt-6">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">المزودون الحاليون</p>
            <ul className="space-y-1 text-sm">
              {(mastersQ.data?.masters ?? []).map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded-md border border-white/5 bg-white/[0.02] px-3 py-2">
                  <span>
                    {m.name} · <span className="text-muted-foreground">{m.risk_level}</span> · min ${fmt(Number(m.min_capital))}
                  </span>
                  <span className={m.is_active ? "text-emerald-300" : "text-muted-foreground"}>
                    {m.is_active ? "نشط" : "معطّل"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </AdminCard>

        <AdminCard title="فتح صفقة Master" icon={TrendingUp}>
          <div className="grid gap-3 md:grid-cols-5">
            <Select
              label="المزود"
              value={trade.master_id}
              onChange={(v) => setTrade({ ...trade, master_id: v })}
              options={[["", "—"], ...(mastersQ.data?.masters ?? []).map((m) => [m.id, m.name] as [string, string])]}
            />
            <Input label="الرمز" value={trade.symbol} onChange={(v) => setTrade({ ...trade, symbol: v })} />
            <Select
              label="الاتجاه"
              value={trade.side}
              onChange={(v) => setTrade({ ...trade, side: v as "buy" | "sell" })}
              options={[
                ["buy", "شراء"],
                ["sell", "بيع"],
              ]}
            />
            <NumInput label="سعر الدخول" value={trade.entry_price} onChange={(v) => setTrade({ ...trade, entry_price: v })} />
            <NumInput label="الحجم" value={trade.volume} onChange={(v) => setTrade({ ...trade, volume: v })} />
          </div>
          <button onClick={submitTrade} className="mt-4 rounded-md border border-emerald-400/40 bg-emerald-400/[0.08] px-4 py-2 text-sm text-emerald-200">
            فتح
          </button>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                <tr className="text-right">
                  <th className="py-2">المزود</th>
                  <th>الرمز</th>
                  <th>الاتجاه</th>
                  <th>دخول</th>
                  <th>خروج</th>
                  <th>P&L%</th>
                  <th>الحالة</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(tradesQ.data?.trades ?? []).map((t) => (
                  <tr key={t.id} className="border-t border-white/5">
                    <td className="py-2">{t.copy_masters?.name ?? "—"}</td>
                    <td>{t.symbol}</td>
                    <td>{t.side}</td>
                    <td>{fmt(Number(t.entry_price))}</td>
                    <td>{t.exit_price ? fmt(Number(t.exit_price)) : "—"}</td>
                    <td className={Number(t.pnl_pct ?? 0) >= 0 ? "text-emerald-300" : "text-red-300"}>
                      {t.pnl_pct != null ? `${fmt(Number(t.pnl_pct))}%` : "—"}
                    </td>
                    <td>{t.status}</td>
                    <td>
                      {t.status === "open" && (
                        <button onClick={() => doClose(t.id)} className="rounded-md border border-red-400/40 bg-red-400/[0.06] px-2 py-1 text-xs text-red-200">
                          إغلاق
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>

        <AdminCard title="اشتراكات النسخ" icon={Users}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                <tr className="text-right">
                  <th className="py-2">المستخدم</th>
                  <th>المزود</th>
                  <th>المبلغ</th>
                  <th>الحالة</th>
                  <th>بدأ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(subsQ.data?.subscriptions ?? []).map((s) => (
                  <tr key={s.id} className="border-t border-white/5">
                    <td className="py-2 font-mono text-xs text-muted-foreground">{s.user_id.slice(0, 8)}…</td>
                    <td>{s.copy_masters?.name ?? "—"}</td>
                    <td>${fmt(Number(s.allocated_amount))}</td>
                    <td>{s.status}</td>
                    <td>{new Date(s.started_at).toLocaleDateString()}</td>
                    <td className="flex gap-1 py-2">
                      {s.status === "active" && (
                        <button onClick={() => transitionSub(s.id, "paused")} className="rounded border border-amber-400/40 p-1">
                          <Pause className="h-3 w-3 text-amber-200" />
                        </button>
                      )}
                      {s.status === "paused" && (
                        <button onClick={() => transitionSub(s.id, "active")} className="rounded border border-emerald-400/40 p-1">
                          <Play className="h-3 w-3 text-emerald-200" />
                        </button>
                      )}
                      {s.status !== "closed" && (
                        <button onClick={() => transitionSub(s.id, "closed")} className="rounded border border-red-400/40 p-1">
                          <X className="h-3 w-3 text-red-200" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>

        <AdminCard title="تعديل رصيد يدوي" icon={Wallet}>
          <div className="grid gap-3 md:grid-cols-3">
            <Input label="بريد المستخدم" value={adjust.user_email} onChange={(v) => setAdjust({ ...adjust, user_email: v })} />
            <NumInput label="المبلغ (± USD)" value={adjust.delta} onChange={(v) => setAdjust({ ...adjust, delta: v })} />
            <Input label="السبب" value={adjust.reason} onChange={(v) => setAdjust({ ...adjust, reason: v })} />
          </div>
          <button onClick={submitAdjust} className="mt-4 rounded-md border border-gold/40 bg-gold/[0.08] px-4 py-2 text-sm text-gold">
            تنفيذ
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            المبلغ الموجب يُضاف كإيداع معتمد، والسالب يُخصم كسحب معتمد. كل تعديل يُسجَّل في سجل التدقيق.
          </p>
        </AdminCard>

        <AdminCard title="سجل التدقيق" icon={History}>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <tr className="text-right">
                  <th className="py-2">الوقت</th>
                  <th>الحدث</th>
                  <th>Actor</th>
                  <th>Target</th>
                  <th>Payload</th>
                </tr>
              </thead>
              <tbody>
                {(auditQ.data?.events ?? []).map((e) => (
                  <tr key={e.id} className="border-t border-white/5">
                    <td className="py-2 font-mono text-muted-foreground">{new Date(e.created_at).toLocaleString()}</td>
                    <td className="text-gold">{e.event}</td>
                    <td className="font-mono text-muted-foreground">{(e.actor_id ?? "—").slice(0, 8)}</td>
                    <td className="font-mono text-muted-foreground">{(e.target_user_id ?? "—").slice(0, 8)}</td>
                    <td className="max-w-xs truncate font-mono text-muted-foreground">
                      {JSON.stringify(e.payload)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-gold/60"
      />
    </div>
  );
}

function NumInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-gold/60"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-gold/60"
      >
        {options.map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}