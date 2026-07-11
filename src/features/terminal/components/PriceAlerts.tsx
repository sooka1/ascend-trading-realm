import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, BellOff, Trash2, Volume2, Pencil, Check, X, Power, PowerOff, History } from "lucide-react";
import type { Quote } from "../adapters/market-data/types";

type Alert = {
  id: string;
  symbol: string;
  condition: "above" | "below";
  target_price: number;
  triggered: boolean;
  triggered_at: string | null;
  created_at: string;
  enabled: boolean;
};

function beep() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctx: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    setTimeout(() => ctx.close(), 500);
  } catch { /* ignore */ }
}

export function PriceAlerts({ selectedSymbol, quotes }: { selectedSymbol: string; quotes: Record<string, Quote | undefined> }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [symbol, setSymbol] = useState(selectedSymbol);
  const [cond, setCond] = useState<"above" | "below">("above");
  const [price, setPrice] = useState<string>("");
  const [side, setSide] = useState<"bid" | "ask">("bid");
  const [notify, setNotify] = useState(false);
  const [sound, setSound] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  );
  const [tab, setTab] = useState<"active" | "history">("active");
  const [editId, setEditId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editCond, setEditCond] = useState<"above" | "below">("above");

  useEffect(() => { setSymbol(selectedSymbol); }, [selectedSymbol]);

  const load = async () => {
    const { data } = await supabase.from("price_alerts").select("*").order("created_at", { ascending: false });
    setAlerts((data ?? []) as Alert[]);
  };
  useEffect(() => { load(); }, []);

  // Poll evaluate alerts every quote change.
  useEffect(() => {
    const active = alerts.filter((a) => !a.triggered && a.enabled);
    if (!active.length) return;
    const fire = async (a: Alert) => {
      if (sound) beep();
      if (notify && permission === "granted") {
        try { new Notification(`تنبيه سعر — ${a.symbol}`, { body: `${a.condition === "above" ? "فوق" : "تحت"} ${a.target_price}` }); } catch { /* ignore */ }
      }
      await supabase.from("price_alerts").update({ triggered: true, triggered_at: new Date().toISOString() }).eq("id", a.id);
      setAlerts((prev) => prev.map((x) => (x.id === a.id ? { ...x, triggered: true, triggered_at: new Date().toISOString() } : x)));
    };
    for (const a of active) {
      const q = quotes[a.symbol]; if (!q) continue;
      const px = side === "bid" ? q.bid : q.ask;
      if (a.condition === "above" && px >= Number(a.target_price)) fire(a);
      if (a.condition === "below" && px <= Number(a.target_price)) fire(a);
    }
  }, [quotes, alerts, notify, sound, side, permission]);

  const enableNotifications = async () => {
    if (typeof Notification === "undefined") return;
    const res = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    setPermission(res);
    setNotify(res === "granted");
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = Number(price);
    if (!p || !symbol) return;
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data } = await supabase.from("price_alerts").insert({ user_id: user.user.id, symbol, condition: cond, target_price: p, enabled: true }).select().single();
    if (data) setAlerts((prev) => [data as Alert, ...prev]);
    setPrice("");
  };
  const remove = async (id: string) => {
    await supabase.from("price_alerts").delete().eq("id", id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };
  const toggleEnabled = async (a: Alert) => {
    const next = !a.enabled;
    setAlerts((prev) => prev.map((x) => (x.id === a.id ? { ...x, enabled: next } : x)));
    await supabase.from("price_alerts").update({ enabled: next }).eq("id", a.id);
  };
  const beginEdit = (a: Alert) => { setEditId(a.id); setEditPrice(String(a.target_price)); setEditCond(a.condition); };
  const cancelEdit = () => setEditId(null);
  const saveEdit = async (a: Alert) => {
    const p = Number(editPrice);
    if (!p) return;
    const patch = { target_price: p, condition: editCond, triggered: false, triggered_at: null } as const;
    setAlerts((prev) => prev.map((x) => (x.id === a.id ? { ...x, ...patch } : x)));
    setEditId(null);
    await supabase.from("price_alerts").update(patch).eq("id", a.id);
  };
  const clearHistory = async () => {
    const ids = alerts.filter((a) => a.triggered).map((a) => a.id);
    if (!ids.length) return;
    setAlerts((prev) => prev.filter((a) => !a.triggered));
    await supabase.from("price_alerts").delete().in("id", ids);
  };

  const current = useMemo(() => quotes[symbol], [quotes, symbol]);
  const activeAlerts = alerts.filter((a) => !a.triggered);
  const historyAlerts = alerts.filter((a) => a.triggered);
  const listed = tab === "active" ? activeAlerts : historyAlerts;

  return (
    <div className="flex h-full flex-col gap-3 p-3 text-xs">
      <form onSubmit={add} className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
        <label className="flex flex-col gap-1">
          <span className="text-white/50">الأداة</span>
          <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="h-8 text-xs" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-white/50">الشرط</span>
          <select value={cond} onChange={(e) => setCond(e.target.value as "above" | "below")} className="h-8 rounded-md border border-white/10 bg-transparent px-2 text-xs">
            <option value="above">فوق</option>
            <option value="below">تحت</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-white/50">السعر ({side === "bid" ? "Bid" : "Ask"})</span>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="any" className="h-8 text-xs font-mono" placeholder={current ? String(side === "bid" ? current.bid : current.ask) : "0"} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-white/50">جانب السعر</span>
          <select value={side} onChange={(e) => setSide(e.target.value as "bid" | "ask")} className="h-8 rounded-md border border-white/10 bg-transparent px-2 text-xs">
            <option value="bid">Bid</option>
            <option value="ask">Ask</option>
          </select>
        </label>
        <Button type="submit" size="sm" className="h-8">إضافة</Button>
      </form>

      <div className="flex flex-wrap gap-2 text-[11px]">
        <button
          type="button"
          onClick={() => {
            if (permission === "granted") setNotify((v) => !v);
            else enableNotifications();
          }}
          disabled={permission === "denied" || permission === "unsupported"}
          title={permission === "denied" ? "الصلاحية مرفوضة — فعّلها من إعدادات المتصفح" : permission === "unsupported" ? "المتصفح لا يدعم الإشعارات" : "تفعيل إشعارات المتصفح"}
          className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50 ${notify && permission === "granted" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-white/10 text-white/50"}`}
        >
          {notify && permission === "granted" ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
          {permission === "granted" ? (notify ? "إشعارات المتصفح مفعّلة" : "تشغيل إشعارات المتصفح") : permission === "denied" ? "الصلاحية مرفوضة" : "طلب صلاحية الإشعارات"}
        </button>
        <button type="button" onClick={() => setSound((v) => !v)}
          className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 ${sound ? "border-amber-400/40 bg-amber-400/10 text-amber-200" : "border-white/10 text-white/50"}`}>
          <Volume2 className="h-3 w-3" /> صوت التنبيه
        </button>
        <div className="ms-auto inline-flex overflow-hidden rounded-md border border-white/10">
          <button type="button" onClick={() => setTab("active")}
            className={`inline-flex items-center gap-1 px-2 py-1 ${tab === "active" ? "bg-white/10 text-white" : "text-white/50"}`}>
            <Bell className="h-3 w-3" /> نشطة ({activeAlerts.length})
          </button>
          <button type="button" onClick={() => setTab("history")}
            className={`inline-flex items-center gap-1 px-2 py-1 ${tab === "history" ? "bg-white/10 text-white" : "text-white/50"}`}>
            <History className="h-3 w-3" /> السجل ({historyAlerts.length})
          </button>
        </div>
        {tab === "history" && historyAlerts.length > 0 && (
          <button type="button" onClick={clearHistory}
            className="inline-flex items-center gap-1 rounded-md border border-red-400/30 px-2 py-1 text-red-300 hover:bg-red-500/10">
            <Trash2 className="h-3 w-3" /> مسح السجل
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto rounded-md border border-white/10">
        <table className="w-full text-[11px]">
          <thead className="text-white/50 text-right">
            <tr>
              <th className="px-2 py-2">الأداة</th>
              <th className="px-2 py-2">الشرط</th>
              <th className="px-2 py-2">السعر</th>
              <th className="px-2 py-2">{tab === "active" ? "الحالة" : "تاريخ التفعيل"}</th>
              <th className="px-2 py-2 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {listed.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-white/40">{tab === "active" ? "لا توجد تنبيهات نشطة" : "لا يوجد سجل"}</td></tr>}
            {listed.map((a) => {
              const editing = editId === a.id;
              return (
                <tr key={a.id} className={`border-t border-white/[0.04] ${!a.enabled && tab === "active" ? "opacity-50" : ""}`}>
                  <td className="px-2 py-2">{a.symbol}</td>
                  <td className={`px-2 py-2 ${a.condition === "above" ? "text-emerald-400" : "text-red-400"}`}>
                    {editing ? (
                      <select value={editCond} onChange={(e) => setEditCond(e.target.value as "above" | "below")}
                        className="h-6 rounded border border-white/10 bg-transparent px-1 text-[11px]">
                        <option value="above">فوق</option>
                        <option value="below">تحت</option>
                      </select>
                    ) : (a.condition === "above" ? "فوق" : "تحت")}
                  </td>
                  <td className="px-2 py-2 font-mono">
                    {editing
                      ? <Input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} type="number" step="any" className="h-6 w-24 text-[11px] font-mono" />
                      : Number(a.target_price)}
                  </td>
                  <td className="px-2 py-2">
                    {tab === "history"
                      ? <span className="text-white/50">{a.triggered_at ? new Date(a.triggered_at).toLocaleString() : "—"}</span>
                      : a.enabled ? <span className="text-emerald-400">نشط</span> : <span className="text-white/40">متوقّف</span>}
                  </td>
                  <td className="px-2 py-2 text-left">
                    <div className="inline-flex gap-1">
                      {tab === "active" && !editing && (
                        <>
                          <Button size="sm" variant="outline" className="h-6 px-1 text-[10px]" title={a.enabled ? "تعطيل" : "تفعيل"} onClick={() => toggleEnabled(a)}>
                            {a.enabled ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                          </Button>
                          <Button size="sm" variant="outline" className="h-6 px-1 text-[10px]" title="تعديل" onClick={() => beginEdit(a)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      {editing && (
                        <>
                          <Button size="sm" variant="outline" className="h-6 px-1 text-[10px]" title="حفظ" onClick={() => saveEdit(a)}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-6 px-1 text-[10px]" title="إلغاء" onClick={cancelEdit}>
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" className="h-6 px-1 text-[10px]" title="حذف" onClick={() => remove(a.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}