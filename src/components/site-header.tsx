import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { HKLogo } from "./hk-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard } from "lucide-react";

const NAV = [
  { key: "nav.platform", to: "/platform" },
  { key: "nav.markets", to: "/markets" },
  { key: "nav.competitions", to: "/competitions" },
  { key: "nav.education", to: "/education" },
  { key: "nav.partners", to: "/partners" },
  { key: "nav.pricing", to: "/pricing" },
  { key: "nav.about", to: "/about" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const t = useT();
  const { user } = useAuth();

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0" aria-label="HK Global Trading home">
          <HKLogo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              activeProps={{ className: "text-foreground bg-white/5" }}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </Link>
              </Button>
              <Button variant="outline" className="border-white/15" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth">{t("cta.login")}</Link>
              </Button>
              <Button
                asChild
                className="bg-[var(--gradient-brand)] text-white shadow-[var(--shadow-glow)] hover:opacity-95"
              >
                <Link to="/auth">{t("cta.open_account")}</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher compact />
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-white/5 lg:hidden",
          open ? "max-h-[520px]" : "max-h-0",
          "transition-[max-height] duration-300",
        )}
      >
        <div className="flex flex-col gap-1 p-4">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
            >
              {t(item.key)}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            {user ? (
              <>
                <Button variant="outline" asChild>
                  <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                </Button>
                <Button className="bg-[var(--gradient-brand)] text-white" onClick={() => { setOpen(false); handleSignOut(); }}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/auth" onClick={() => setOpen(false)}>{t("cta.login")}</Link>
                </Button>
                <Button asChild className="bg-[var(--gradient-brand)] text-white">
                  <Link to="/auth" onClick={() => setOpen(false)}>{t("cta.open_account")}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}