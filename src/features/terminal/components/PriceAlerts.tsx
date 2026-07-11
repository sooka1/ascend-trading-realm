import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, BellOff, Trash2, Volume2 } from "lucide-react";
import type { Quote } from "../adapters/market-data/types";

type Alert = {
  id: string;
  symbol: string;
  condition: "above" | "below";
  target_price: number;
  triggered: boolean;
  triggered_at: string | null;
  created_at: string;
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
  const [notify, setNotify] = useState(true);
  const [sound, setSound] = useState(true);

  useEffect(() => { setSymbol(selectedSymbol); }, [selectedSymbol]);

  const load = async () => {
    const { data } = await supabase.from("price_alerts").select("*").order("created_at", { ascending: false });
    setAlerts((data ?? []) as Alert[]);
  };
  useEffect(() => { load(); }, []);

  // Poll evaluate alerts every quote change.
  useEffect(() => {
    const active = alerts.filter((a) => !a.triggered);
    if (!active.length) return;
    const fire = async (a: Alert) => {
      if (sound) beep();
      if (notify && typeof Notification !== "undefined" && Notification.permission === "granted") {
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
  }, [quotes, alerts, notify, sound, side]);

  const enableNotifications = async () => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") await Notification.requestPermission();
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = Number(price);
    if (!p || !symbol) return;
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data } = await supabase.from("price_alerts").insert({ user_id: user.user.id, symbol, condition: cond, target_price: p }).select().single();
    if (data) setAlerts((prev) => [data as Alert, ...prev]);
    setPrice("");
  };
  const remove = async (id: string) => {
    await supabase.from("price_alerts").delete().eq("id", id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const current = useMemo(() => quotes[symbol], [quotes, symbol]);

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
        <button type="button" onClick={() => { setNotify((v) => !v); if (!notify) enableNotifications(); }}
          className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 ${notify ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-white/10 text-white/50"}`}>
          {notify ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />} إشعارات المتصفح
        </button>
        <button type="button" onClick={() => setSound((v) => !v)}
          className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 ${sound ? "border-amber-400/40 bg-amber-400/10 text-amber-200" : "border-white/10 text-white/50"}`}>
          <Volume2 className="h-3 w-3" /> صوت التنبيه
        </button>
      </div>

      <div className="flex-1 overflow-auto rounded-md border border-white/10">
        <table className="w-full text-[11px]">
          <thead className="text-white/50 text-right">
            <tr><th className="px-2 py-2">الأداة</th><th className="px-2 py-2">الشرط</th><th className="px-2 py-2">السعر</th><th className="px-2 py-2">الحالة</th><th></th></tr>
          </thead>
          <tbody>
            {alerts.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-white/40">لا توجد تنبيهات</td></tr>}
            {alerts.map((a) => (
              <tr key={a.id} className="border-t border-white/[0.04]">
                <td className="px-2 py-2">{a.symbol}</td>
                <td className={`px-2 py-2 ${a.condition === "above" ? "text-emerald-400" : "text-red-400"}`}>{a.condition === "above" ? "فوق" : "تحت"}</td>
                <td className="px-2 py-2 font-mono">{Number(a.target_price)}</td>
                <td className="px-2 py-2">{a.triggered ? <span className="text-amber-300">تم التفعيل</span> : <span className="text-white/60">نشط</span>}</td>
                <td className="px-2 py-2 text-left"><Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => remove(a.id)}><Trash2 className="h-3 w-3" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}