import { Globe } from "lucide-react";
import { LANGUAGES, useI18n, type Lang } from "@/lib/i18n";
import { useState } from "react";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Extended catalogue for the visual grid. Each entry has a native name, an
// English label, and a flag emoji rendered inside a circular chip. Only the
// codes that also exist in `LANGUAGES` (i18n.tsx) actually switch the app
// locale; the rest fall back to English with a graceful "coming soon" state.
// `country` is an ISO 3166-1 alpha-2 code used to load a real SVG flag from
// flagcdn.com — emoji flags don't render on many Linux/Windows browsers, so
// we always use images.
type Entry = { code: string; native: string; english: string; country: string };
const ENTRIES: Entry[] = [
  { code: "en", native: "English", english: "Global", country: "gb" },
  { code: "ar", native: "العربية", english: "Arabic", country: "sa" },
  { code: "es", native: "Español", english: "Spanish", country: "es" },
  { code: "fr", native: "Français", english: "French", country: "fr" },
  { code: "de", native: "Deutsch", english: "German", country: "de" },
  { code: "it", native: "Italiano", english: "Italian", country: "it" },
  { code: "pt", native: "Português", english: "Portuguese", country: "pt" },
  { code: "id", native: "Bahasa Indonesia", english: "Indonesian", country: "id" },
  { code: "ms", native: "Bahasa Melayu", english: "Malaysian", country: "my" },
  { code: "ko", native: "한국어", english: "Korean", country: "kr" },
  { code: "cs", native: "Český", english: "Czech", country: "cz" },
  { code: "pl", native: "Polski", english: "Polish", country: "pl" },
  { code: "hu", native: "Magyar", english: "Hungarian", country: "hu" },
  { code: "zh-cn", native: "中文简体", english: "Chinese", country: "cn" },
  { code: "zh-tw", native: "中文繁體", english: "Chinese", country: "tw" },
  { code: "vi", native: "Tiếng Việt", english: "Vietnamese", country: "vn" },
  { code: "th", native: "ไทย", english: "Thai", country: "th" },
  { code: "hi", native: "हिन्दी", english: "Hindi", country: "in" },
  { code: "ku", native: "Kurdî", english: "Kurdish", country: "iq" },
  { code: "mn", native: "Монгол", english: "Mongolian", country: "mn" },
  { code: "sv", native: "Svenska", english: "Swedish", country: "se" },
  { code: "nl", native: "Nederlands", english: "Dutch", country: "nl" },
  { code: "uk", native: "Українська", english: "Ukrainian", country: "ua" },
  { code: "uz", native: "Oʻzbekcha", english: "Uzbek", country: "uz" },
  { code: "da", native: "Dansk", english: "Danish", country: "dk" },
  { code: "lt", native: "Lietuvių", english: "Lithuanian", country: "lt" },
  { code: "fi", native: "Suomi", english: "Finnish", country: "fi" },
  { code: "bg", native: "Български", english: "Bulgarian", country: "bg" },
  { code: "ro", native: "Română", english: "Romanian", country: "ro" },
  { code: "no", native: "Norsk", english: "Norwegian", country: "no" },
  { code: "et", native: "Eesti", english: "Estonian", country: "ee" },
  { code: "hr", native: "Hrvatski", english: "Croatian", country: "hr" },
  { code: "ru", native: "Русский", english: "Russian", country: "ru" },
  { code: "tr", native: "Türkçe", english: "Turkish", country: "tr" },
  { code: "ja", native: "日本語", english: "Japanese", country: "jp" },
];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  const current = LANGUAGES.find((l) => l.code === lang);
  const currentEntry = ENTRIES.find((e) => e.code === lang);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "icon" : "sm"}
          className="gap-2 border-0 bg-transparent px-1 hover:bg-transparent"
          aria-label={t("lang.label")}
        >
          {currentEntry ? (
            <img
              src={`https://flagcdn.com/w40/${currentEntry.country}.png`}
              alt=""
              className="h-4 w-4 rounded-full object-cover"
            />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          {!compact && <span className="text-xs font-medium">{current?.native ?? currentEntry?.native ?? lang.toUpperCase()}</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl border-white/10 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t("lang.label")}</DialogTitle>
        </DialogHeader>
        <div className="grid max-h-[70vh] grid-cols-2 gap-x-8 gap-y-3 overflow-y-auto pe-2 md:grid-cols-3 lg:grid-cols-4">
          {ENTRIES.map((e) => {
            const active = e.code === lang;
            return (
              <button
                key={e.code}
                type="button"
                onClick={() => {
                  setLang(e.code as Lang);
                  setOpen(false);
                }}
                className={cn(
                  "group flex items-center justify-end gap-3 rounded-xl px-3 py-2 text-end transition",
                  "hover:bg-white/5",
                  active && "bg-white/5",
                )}
              >
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-base font-semibold text-foreground">{e.native}</span>
                  <span className="text-xs text-muted-foreground">{e.english}</span>
                </div>
                <span
                  className={cn(
                    "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5",
                    active && "ring-2 ring-primary",
                  )}
                >
                  <img
                    src={`https://flagcdn.com/w80/${e.country}.png`}
                    srcSet={`https://flagcdn.com/w160/${e.country}.png 2x`}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  {active && (
                    <span className="absolute inset-0 flex items-center justify-center bg-primary/80">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}