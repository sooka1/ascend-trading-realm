import { Link } from "@tanstack/react-router";
import { HKLogo } from "./hk-logo";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { useT } from "@/lib/i18n";

const COLS = [
  {
    title: "footer.col.platform",
    links: [
      { label: "footer.link.platform", to: "/platform" },
      { label: "footer.link.markets", to: "/markets" },
      { label: "footer.link.pricing", to: "/pricing" },
      { label: "footer.link.calendar", to: "/economic-calendar" },
    ],
  },
  {
    title: "footer.col.compete",
    links: [
      { label: "footer.link.competitions", to: "/competitions" },
      { label: "footer.link.education", to: "/education" },
      { label: "footer.link.news", to: "/news" },
      { label: "footer.link.blog", to: "/blog" },
    ],
  },
  {
    title: "footer.col.company",
    links: [
      { label: "footer.link.about", to: "/about" },
      { label: "footer.link.partners", to: "/partners" },
      { label: "footer.link.affiliate", to: "/affiliate" },
      { label: "footer.link.contact", to: "/contact" },
    ],
  },
  {
    title: "footer.col.support",
    links: [
      { label: "footer.link.support", to: "/support" },
      { label: "footer.link.faq", to: "/faq" },
      { label: "cta.login", to: "/auth" },
      { label: "cta.open_account", to: "/auth" },
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
          <p>{t("footer.copyright").replace("{year}", String(new Date().getFullYear()))}</p>
          <p>{t("footer.compliance")}</p>
        </div>
      </div>
    </footer>
  );
}