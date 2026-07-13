import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useT } from "@/lib/i18n";

const RESULTS = [
  { key: "nav.about", to: "/about" },
  { key: "nav.competitions", to: "/competitions" },
  { key: "nav.portfolios", to: "/portfolios" },
  { key: "nav.copytrading", to: "/copy-trading" },
  { key: "nav.risk", to: "/risk" },
  { key: "nav.markets", to: "/markets" },
  { key: "nav.education", to: "/education" },
  { key: "nav.faq", to: "/faq" },
  { key: "nav.contact", to: "/contact" },
  { key: "cta.portal", to: "/portal" },
  { key: "cta.login", to: "/auth" },
] as const;

export function SiteSearch({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const t = useT();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("search.label")}
        className={
          compact
            ? "inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/10"
            : "inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm hover:bg-white/10"
        }
      >
        <Search className="h-4 w-4" />
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("search.placeholder")} />
        <CommandList>
          <CommandEmpty>{t("search.empty")}</CommandEmpty>
          <CommandGroup heading={t("search.pages")}>
            {RESULTS.map((r) => (
              <CommandItem
                key={r.to}
                value={`${t(r.key)} ${r.to}`}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: r.to });
                }}
              >
                <Search className="me-2 h-4 w-4 opacity-60" />
                <span>{t(r.key)}</span>
                <span className="ms-auto text-xs text-muted-foreground">{r.to}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}