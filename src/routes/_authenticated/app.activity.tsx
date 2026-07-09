import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/activity")({
  head: () => ({ meta: [{ title: "Activity — HK Invest" }] }),
  component: ActivityMobile,
});

type Tx = { id: string; occurred_at: string; symbol: string; side: string; quantity: number; price: number; pnl: number };

function ActivityMobile() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) return setLoading(false);
      const { data: pf } = await supabase.from("portfolios").select("id").eq("user_id", uid).limit(1).maybeSingle();
      if (pf) {
        const { data } = await supabase
          .from("transactions")
          .select("*")
          .eq("portfolio_id", (pf as { id: string }).id)
          .order("occurred_at", { ascending: false })
          .limit(50);
        setTxs((data ?? []) as Tx[]);
      }
      setLoading(false);
    })();
  }, []);
  return (
    <div className="px-4 pt-6">
      <h1 className="font-display text-2xl font-semibold">Activity</h1>
      <p className="mt-1 text-xs text-muted-foreground">Latest 50 transactions</p>
      <ul className="mt-5 divide-y divide-white/5 rounded-2xl border border-white/10 bg-[color:var(--surface)]">
        {loading ? (
          <li className="p-4 text-sm text-muted-foreground">Loading…</li>
        ) : txs.length === 0 ? (
          <li className="p-4 text-sm text-muted-foreground">No activity yet.</li>
        ) : (
          txs.map((t) => {
            const isBuy = t.side === "buy";
            const pnl = Number(t.pnl);
            return (
              <li key={t.id} className="flex items-center gap-3 p-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${isBuy ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {isBuy ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.symbol}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {t.side.toUpperCase()} · {Number(t.quantity).toLocaleString()} @ ${Number(t.price).toFixed(2)}
                  </p>
                </div>
                <p className={`text-sm font-medium ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {pnl >= 0 ? "+" : ""}
                  {pnl.toFixed(2)}
                </p>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}