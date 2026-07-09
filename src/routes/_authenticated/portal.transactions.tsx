import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, PortalCard } from "@/components/portal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Printer, Receipt, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/transactions")({
  head: () => ({
    meta: [
      { title: "سجل العمليات — بوابة العميل" },
      { name: "description", content: "بحث وتصفية شاملة لجميع عمليات حسابك مع خيارات التصدير." },
    ],
  }),
  component: TransactionsPage,
});

type Tx = { id: string; occurred_at: string; symbol: string; side: string; quantity: number; price: number; pnl: number };

function TransactionsPage() {
  const [rows, setRows] = useState<Tx[]>([]);
  const [q, setQ] = useState("");
  const [side, setSide] = useState<"all" | "buy" | "sell">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from("transactions").select("*").order("occurred_at", { ascending: false }).limit(500);
      setRows((data ?? []) as Tx[]);
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = rows.filter((r) => {
      if (needle && !r.symbol.toLowerCase().includes(needle)) return false;
      if (side !== "all" && r.side.toLowerCase() !== side) return false;
      if (from && new Date(r.occurred_at) < new Date(from)) return false;
      if (to && new Date(r.occurred_at) > new Date(to)) return false;
      return true;
    });
    return list.sort((a, b) => sortDesc
      ? +new Date(b.occurred_at) - +new Date(a.occurred_at)
      : +new Date(a.occurred_at) - +new Date(b.occurred_at));
  }, [rows, q, side, from, to, sortDesc]);

  function exportCsv() {
    const header = ["date", "symbol", "side", "quantity", "price", "pnl"].join(",");
    const lines = filtered.map((r) => [
      new Date(r.occurred_at).toISOString(),
      r.symbol, r.side, r.quantity, r.price, r.pnl,
    ].join(","));
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `transactions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPnl = filtered.reduce((s, r) => s + Number(r.pnl), 0);

  return (
    <PortalShell
      eyebrow="التقارير"
      title="سجل العمليات"
      subtitle="بحث، تصفية، وتصدير كامل لعملياتك."
      actions={
        <>
          <Button onClick={exportCsv} variant="outline" className="rounded-sm border-white/10 hover:border-gold/60">
            <Download className="ml-2 h-4 w-4" /> CSV
          </Button>
          <Button onClick={() => window.print()} variant="outline" className="rounded-sm border-white/10 hover:border-gold/60">
            <Printer className="ml-2 h-4 w-4" /> طباعة
          </Button>
        </>
      }
    >
      <div className="mb-5 grid gap-3 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" style={{ insetInlineStart: "0.75rem" }} />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بالرمز…" className="bg-white/[0.03] ps-9" />
        </div>
        <select value={side} onChange={(e) => setSide(e.target.value as typeof side)} className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-gold/60 focus:outline-none">
          <option value="all">كل الأنواع</option>
          <option value="buy">شراء</option>
          <option value="sell">بيع</option>
        </select>
        <div className="grid grid-cols-2 gap-2">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-white/[0.03]" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-white/[0.03]" />
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        {[
          { k: "عدد العمليات", v: filtered.length.toLocaleString(), d: "Rows" },
          { k: "إجمالي P/L", v: `${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}`, tone: totalPnl >= 0 ? "up" as const : "down" as const, d: "Cumulative" },
          { k: "متوسط P/L", v: filtered.length ? (totalPnl / filtered.length).toFixed(2) : "0.00", d: "Per trade" },
        ].map((s) => (
          <div key={s.k} className="relative overflow-hidden rounded-xl border border-white/10 bg-card/50 p-4 backdrop-blur-xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold/80">{s.k}</p>
            <p className={`mt-1 font-mono text-2xl font-medium tabular-nums ${"tone" in s && s.tone === "up" ? "text-emerald-400" : "tone" in s && s.tone === "down" ? "text-red-400" : ""}`}>{s.v}</p>
            <p className="mt-0.5 font-mono text-[10px] tracking-wide text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>

      <PortalCard title="العمليات" icon={Receipt}
        action={
          <button onClick={() => setSortDesc((v) => !v)} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-gold">
            التاريخ {sortDesc ? "↓" : "↑"}
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold/80">
              <tr>
                <th className="py-2 text-start">التاريخ</th>
                <th className="py-2 text-start">الرمز</th>
                <th className="py-2 text-start">النوع</th>
                <th className="py-2 text-end">الكمية</th>
                <th className="py-2 text-end">السعر</th>
                <th className="py-2 text-end">P/L</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">لا توجد نتائج مطابقة.</td></tr>
              ) : filtered.map((t) => (
                <tr key={t.id} className="border-t border-white/5 transition hover:bg-white/[0.015]">
                  <td className="py-3 font-mono text-xs text-muted-foreground">{new Date(t.occurred_at).toLocaleDateString()}</td>
                  <td className="py-3 font-mono font-medium">{t.symbol}</td>
                  <td className="py-3 font-mono text-xs uppercase text-muted-foreground">{t.side}</td>
                  <td className="py-3 text-end font-mono tabular-nums">{Number(t.quantity).toLocaleString()}</td>
                  <td className="py-3 text-end font-mono tabular-nums">{Number(t.price).toFixed(2)}</td>
                  <td className={`py-3 text-end font-mono tabular-nums ${Number(t.pnl) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {Number(t.pnl) >= 0 ? "+" : ""}{Number(t.pnl).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PortalCard>
    </PortalShell>
  );
}