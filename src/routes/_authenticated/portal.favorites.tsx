import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PortalShell, PortalCard } from "@/components/portal-shell";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LineChart, Receipt, Star, Wallet, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/favorites")({
  head: () => ({
    meta: [
      { title: "المفضلة — بوابة العميل" },
      { name: "description", content: "روابط سريعة للأقسام الأكثر استخدامًا." },
    ],
  }),
  component: FavoritesPage,
});

const SUGGESTIONS = [
  { to: "/portal", label: "لوحة القيادة", icon: LayoutDashboard },
  { to: "/portal/portfolio", label: "المحفظة", icon: Wallet },
  { to: "/portal/transactions", label: "سجل العمليات", icon: Receipt },
  { to: "/portal/performance", label: "تقارير الأداء", icon: LineChart },
];

const KEY = "hk.portal.favorites";

function FavoritesPage() {
  const [favs, setFavs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setFavs(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);

  const save = (next: string[]) => {
    setFavs(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch { /* noop */ }
  };

  const toggle = (to: string) => save(favs.includes(to) ? favs.filter((x) => x !== to) : [...favs, to]);

  const items = SUGGESTIONS.filter((s) => favs.includes(s.to));

  return (
    <PortalShell eyebrow="الأنشطة" title="المفضلة" subtitle="روابط سريعة للأقسام التي تستخدمها كثيرًا — محفوظة على هذا الجهاز.">
      <div className="grid gap-6 lg:grid-cols-2">
        <PortalCard title={`المفضلة · ${items.length}`} icon={Star}>
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">لم تُضف أي مفضلة بعد.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {items.map((s) => (
                <li key={s.to} className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] p-3">
                  <s.icon className="h-4 w-4 text-gold" />
                  <Link to={s.to} className="flex-1 truncate text-sm font-medium hover:text-gold">
                    {s.label}
                  </Link>
                  <button onClick={() => toggle(s.to)} className="text-muted-foreground hover:text-red-400" aria-label="إزالة">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </PortalCard>

        <PortalCard title="اقتراحات" icon={Star}>
          <ul className="grid gap-2">
            {SUGGESTIONS.map((s) => {
              const active = favs.includes(s.to);
              return (
                <li key={s.to} className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] p-3">
                  <s.icon className={`h-4 w-4 ${active ? "text-gold" : "text-muted-foreground"}`} />
                  <span className="flex-1 truncate text-sm">{s.label}</span>
                  <Button variant={active ? "outline" : "default"} size="sm" onClick={() => toggle(s.to)}>
                    {active ? "إزالة" : "إضافة"}
                  </Button>
                </li>
              );
            })}
          </ul>
        </PortalCard>
      </div>
    </PortalShell>
  );
}
