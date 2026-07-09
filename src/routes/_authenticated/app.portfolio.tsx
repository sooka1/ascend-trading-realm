import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/portfolio")({
  head: () => ({ meta: [{ title: "Portfolio — HK Invest" }] }),
  component: PortfolioMobile,
});

type Portfolio = { id: string; name: string; strategy: string; base_currency: string; inception_date: string };

function PortfolioMobile() {
  const [items, setItems] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) return setLoading(false);
      const { data } = await supabase.from("portfolios").select("*").eq("user_id", uid).order("created_at");
      setItems((data ?? []) as Portfolio[]);
      setLoading(false);
    })();
  }, []);
  return (
    <div className="px-4 pt-6">
      <h1 className="font-display text-2xl font-semibold">My portfolios</h1>
      <p className="mt-1 text-xs text-muted-foreground">All managed strategies under your name</p>
      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No portfolios yet.</p>
        ) : (
          items.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[color:var(--surface)] p-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold/10 text-gold">
                <Briefcase className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.name}</p>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {p.strategy} · {p.base_currency}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}