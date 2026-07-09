import { Link, useRouterState } from "@tanstack/react-router";
import { Home, PieChart, Activity, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/app/portfolio", label: "Portfolio", icon: PieChart },
  { to: "/app/activity", label: "Activity", icon: Activity },
  { to: "/app/profile", label: "Profile", icon: User },
] as const;

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[color:var(--surface)]/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== "/app" && pathname.startsWith(to));
          return (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-3 text-[10px] font-medium tracking-wide transition-colors",
                  active ? "text-gold" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_6px_var(--gold)]")} />
                <span className="uppercase">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}