import { Link } from "@tanstack/react-router";
import { HKLogo } from "./hk-logo";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

const COLS = [
  {
    title: "Platform",
    links: [
      { label: "Trading Platform", to: "/platform" },
      { label: "Markets", to: "/markets" },
      { label: "Pricing", to: "/pricing" },
      { label: "Economic Calendar", to: "/economic-calendar" },
    ],
  },
  {
    title: "Compete & Learn",
    links: [
      { label: "Competitions", to: "/competitions" },
      { label: "Education", to: "/education" },
      { label: "News", to: "/news" },
      { label: "Blog", to: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Partners", to: "/partners" },
      { label: "Affiliate Program", to: "/affiliate" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Support Center", to: "/support" },
      { label: "FAQ", to: "/faq" },
      { label: "Log in", to: "/auth" },
      { label: "Open account", to: "/auth" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <HKLogo size="lg" />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              A premium global trading platform for forex, crypto, indices and commodities — with world-class
              competitions, real-time analytics and institutional-grade execution.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Twitter, Linkedin, Youtube, Instagram, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-muted-foreground transition hover:border-white/30 hover:text-foreground"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Risk Warning:</strong> Trading leveraged products such as CFDs,
          forex and crypto carries a high level of risk and may not be suitable for all investors. You could
          lose more than your initial deposit. Ensure you fully understand the risks involved and seek
          independent advice if necessary. Past performance is not indicative of future results.
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} HK Global Trading. All rights reserved.</p>
          <p>Regulated globally · Segregated client funds · SSL secured</p>
        </div>
      </div>
    </footer>
  );
}