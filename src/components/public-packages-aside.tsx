import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Sparkles, Package as PackageIcon } from "lucide-react";

type Pkg = {
  id: string;
  name: string;
  min_amount: number;
  currency: string;
  target_return_pct: number;
  lockup_months: number;
  risk_level: string;
  description: string | null;
};

const HIDE_PREFIXES = ["/portal", "/admin", "/investor", "/auth", "/reset-password", "/forgot-password", "/app"];

export function PublicPackagesAside() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    let cancel = false;
    void (async () => {
      const { data } = await supabase
        .from("packages")
        .select("id,name,min_amount,currency,target_return_pct,lockup_months,risk_level,description")
        .eq("active", true)
        .order("sort_order")
        .limit(3);
      if (!cancel && data) setPackages(data as Pkg[]);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  if (HIDE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;
  if (packages.length === 0) return null;

  return (
    <aside
      className="pointer-events-none fixed bottom-4 z-40 hidden lg:block"
      style={{ insetInlineEnd: "1rem", top: "6rem" }}
      aria-label="الباقات الاستثمارية"
    >
      <div className="pointer-events-auto flex items-start gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "إخفاء الباقات" : "عرض الباقات"}
          className="mt-2 rounded-full border border-gold/40 bg-background/90 p-1.5 text-gold shadow-lg backdrop-blur transition hover:bg-gold/10"
        >
          {open ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        {open && (
          <div className="w-64 overflow-hidden rounded-xl border border-white/10 bg-background/85 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-2 border-b border-white/10 bg-gold/10 px-3 py-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <div className="text-[11px] font-semibold uppercase tracking-widest text-gold">الباقات الاستثمارية</div>
            </div>
            <ul className="divide-y divide-white/5">
              {packages.map((p) => (
                <li key={p.id} className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <PackageIcon className="h-3.5 w-3.5 text-gold/80" />
                      <span className="text-sm font-semibold">{p.name}</span>
                    </div>
                    <span className="rounded-full border border-gold/30 bg-gold/[0.08] px-2 py-0.5 text-[10px] font-mono text-gold">
                      {Number(p.target_return_pct).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>حد أدنى</span>
                    <span className="font-mono text-foreground">
                      {new Intl.NumberFormat(undefined, { style: "currency", currency: p.currency, maximumFractionDigits: 0 }).format(Number(p.min_amount))}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>مدة القفل</span>
                    <span className="font-mono text-foreground">{p.lockup_months} شهر</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-white/10 p-2">
              <Link
                to="/auth"
                className="block rounded-md bg-gold px-3 py-1.5 text-center text-xs font-semibold text-background transition hover:bg-[oklch(0.88_0.11_90)]"
              >
                ابدأ الاستثمار
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}