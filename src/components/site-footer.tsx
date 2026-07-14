import { Link } from "@tanstack/react-router";
import { HKLogo } from "./hk-logo";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { useT } from "@/lib/i18n";

const COLS = [
  {
    title: "footer.col.solutions",
    links: [
      { label: "nav.competitions", to: "/competitions" },
      { label: "nav.portfolios", to: "/portfolios" },
      { label: "nav.copytrading", to: "/copy-trading" },
      { label: "nav.risk", to: "/risk" },
    ],
  },
  {
    title: "footer.col.resources",
    links: [
      { label: "footer.link.markets", to: "/markets" },
      { label: "footer.link.education", to: "/education" },
      { label: "footer.link.faq", to: "/faq" },
      { label: "footer.link.contact", to: "/contact" },
    ],
  },
  {
    title: "footer.col.company",
    links: [
      { label: "footer.link.about", to: "/about" },
      { label: "footer.link.legal", to: "/legal" },
      { label: "footer.link.privacy", to: "/privacy" },
      { label: "footer.link.terms", to: "/terms" },
    ],
  },
  {
    title: "footer.col.account",
    links: [
      { label: "cta.login", to: "/auth" },
      { label: "cta.open_account", to: "/auth" },
      { label: "cta.dashboard", to: "/portal" },
      { label: "cta.portal", to: "/portal" },
    ],
  },
] as const;

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="mt-24 border-t border-white/5 bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <HKLogo size="lg" />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">{t("footer.tagline")}</p>
            <div className="mt-6 flex items-center gap-3">
              {[
                { Icon: Twitter, href: "#", label: "Twitter" },
                { Icon: Linkedin, href: "#", label: "LinkedIn" },
                { Icon: Youtube, href: "#", label: "YouTube" },
                { Icon: Instagram, href: "#", label: "Instagram" },
                { Icon: Facebook, href: "https://www.facebook.com/share/14htEwrJz5Y/", label: "Facebook" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-muted-foreground transition hover:border-white/30 hover:text-foreground"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold text-foreground">{t(col.title)}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {t(l.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">{t("footer.risk.label")}</strong> {t("footer.risk.body")}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>©2017-26 Hong Kong Exchanges and Clearing Limited. All rights reserved.</p>
          <p>{t("footer.compliance")}</p>
        </div>
      </div>
    </footer>
  );
}