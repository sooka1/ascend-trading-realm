import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { HKLogo } from "./hk-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, ShieldCheck } from "lucide-react";

const NAV = [
  { key: "nav.about", to: "/about" },
  { key: "nav.competitions", to: "/competitions" },
  { key: "nav.portfolios", to: "/portfolios" },
  { key: "nav.copytrading", to: "/copy-trading" },
  { key: "nav.risk", to: "/risk" },
  { key: "nav.markets", to: "/markets" },
  { key: "nav.education", to: "/education" },
  { key: "nav.faq", to: "/faq" },
  { key: "nav.contact", to: "/contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const t = useT();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!user) return setIsAdmin(false);
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(Boolean(data)));
  }, [user]);

  // Hide on scroll down, reveal on scroll up.
  useEffect(() => {
    let lastY = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const delta = y - lastY;
        if (y < 80) setHidden(false);
        else if (delta > 6) setHidden(true);
        else if (delta < -6) setHidden(false);
        lastY = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-black/10 bg-white/95 text-foreground backdrop-blur-xl",
        "[&_a]:text-foreground [&_button]:text-foreground",
        "transition-transform duration-300 will-change-transform",
        hidden ? "-translate-y-full" : "translate-y-0",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0" aria-label="HK Global Trading home">
          <HKLogo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md border border-primary/30 bg-primary/[0.04] px-3 py-2 text-sm text-foreground/80 transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
              activeProps={{ className: "border-primary bg-primary/15 text-primary" }}
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
              <Button variant="ghost" asChild>
                <Link to="/investor">Investor</Link>
              </Button>
              {isAdmin && (
                <Button variant="ghost" asChild>
                  <Link to="/admin/finance"><ShieldCheck className="mr-2 h-4 w-4" /> Admin</Link>
                </Button>
              )}
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/10"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-black/5 lg:hidden",
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
              className="rounded-md border border-primary/30 bg-primary/[0.04] px-3 py-2.5 text-sm text-foreground/80 hover:border-primary hover:bg-primary/10 hover:text-primary"
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