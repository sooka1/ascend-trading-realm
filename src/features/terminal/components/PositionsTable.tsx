import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getBroker } from "../adapters/broker";
import type { Position } from "../adapters/broker/types";
import type { Quote } from "../adapters/market-data/types";

function pnl(side: "buy" | "sell", entry: number, exit: number, vol: number, cs: number) {
  const dir = side === "buy" ? 1 : -1;
  return (exit - entry) * dir * vol * cs;
}

export function PositionsTable({ positions, quotes, contractSizes }: {
  positions: Position[];
  quotes: Record<string, Quote>;
  contractSizes: Record<string, number>;
}) {
  const qc = useQueryClient();

  async function close(p: Position) {
    const q = quotes[p.symbol];
    if (!q) return;
    const mp = p.side === "buy" ? q.bid : q.ask;
    await getBroker().closePosition(p.id, mp);
    toast.success("تم إغلاق الصفقة");
    qc.invalidateQueries({ queryKey: ["trading-positions"] });
    qc.invalidateQueries({ queryKey: ["trading-history"] });
    qc.invalidateQueries({ queryKey: ["trading-account"] });
  }
  async function reverse(p: Position) {
    const q = quotes[p.symbol];
    if (!q) return;
    const mp = p.side === "buy" ? q.bid : q.ask;
    await getBroker().reversePosition(p.id, mp);
    toast.success("تم عكس الصفقة");
    qc.invalidateQueries({ queryKey: ["trading-positions"] });
  }
  async function closeScope(scope: "all" | "profit" | "loss") {
    const map: Record<string, number> = {};
    for (const p of positions) {
      const q = quotes[p.symbol];
      if (q) map[p.symbol] = p.side === "buy" ? q.bid : q.ask;
    }
    const n = await getBroker().closeAll(scope, map);
    toast.success(`تم إغلاق ${n} صفقة`);
    qc.invalidateQueries({ queryKey: ["trading-positions"] });
    qc.invalidateQueries({ queryKey: ["trading-account"] });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-1 p-2 border-b border-white/10">
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => closeScope("all")}>إغلاق الكل</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px] border-emerald-500/40 text-emerald-300" onClick={() => closeScope("profit")}>إغلاق الرابحة</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px] border-red-500/40 text-red-300" onClick={() => closeScope("loss")}>إغلاق الخاسرة</Button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 bg-slate-900/80 backdrop-blur">
            <tr className="text-white/50 text-right">
              <th className="px-2 py-2">الأداة</th>
              <th className="px-2 py-2">الاتجاه</th>
              <th className="px-2 py-2">الحجم</th>
              <th className="px-2 py-2">الدخول</th>
              <th className="px-2 py-2">السعر الحالي</th>
              <th className="px-2 py-2">TP</th>
              <th className="px-2 py-2">SL</th>
              <th className="px-2 py-2">الربح/الخسارة</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 && (
              <tr><td colSpan={9} className="text-center py-6 text-white/40">لا توجد صفقات مفتوحة</td></tr>
            )}
            {positions.map((p) => {
              const q = quotes[p.symbol];
              const mp = q ? (p.side === "buy" ? q.bid : q.ask) : Number(p.entry_price);
              const cs = contractSizes[p.symbol] ?? 1;
              const profit = pnl(p.side, Number(p.entry_price), mp, Number(p.volume), cs);
              return (
                <tr key={p.id} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-2 py-2 font-medium">{p.symbol}</td>
                  <td className={`px-2 py-2 ${p.side === "buy" ? "text-emerald-400" : "text-red-400"}`}>{p.side === "buy" ? "شراء" : "بيع"}</td>
                  <td className="px-2 py-2 font-mono">{Number(p.volume).toFixed(2)}</td>
                  <td className="px-2 py-2 font-mono">{Number(p.entry_price).toFixed(4)}</td>
                  <td className="px-2 py-2 font-mono">{mp.toFixed(4)}</td>
                  <td className="px-2 py-2 font-mono text-white/60">{p.take_profit ? Number(p.take_profit).toFixed(4) : "—"}</td>
                  <td className="px-2 py-2 font-mono text-white/60">{p.stop_loss ? Number(p.stop_loss).toFixed(4) : "—"}</td>
                  <td className={`px-2 py-2 font-mono font-semibold ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>${profit.toFixed(2)}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => reverse(p)}>عكس</Button>
                      <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => close(p)}>إغلاق</Button>
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