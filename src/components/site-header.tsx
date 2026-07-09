import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { HKLogo } from "./hk-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Platform", to: "/platform" },
  { label: "Markets", to: "/markets" },
  { label: "Competitions", to: "/competitions" },
  { label: "Education", to: "/education" },
  { label: "Partners", to: "/partners" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
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
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" asChild>
            <Link to="/auth">Log in</Link>
          </Button>
          <Button
            asChild
            className="bg-[var(--gradient-brand)] text-white shadow-[var(--shadow-glow)] hover:opacity-95"
          >
            <Link to="/auth">Open account</Link>
          </Button>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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
              {item.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button variant="outline" asChild>
              <Link to="/auth" onClick={() => setOpen(false)}>Log in</Link>
            </Button>
            <Button asChild className="bg-[var(--gradient-brand)] text-white">
              <Link to="/auth" onClick={() => setOpen(false)}>Open account</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}