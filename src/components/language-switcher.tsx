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
type Entry = { code: string; native: string; english: string; flag: string };
const ENTRIES: Entry[] = [
  { code: "en", native: "English", english: "Global", flag: "🇬🇧" },
  { code: "ar", native: "العربية", english: "Arabic", flag: "🇸🇦" },
  { code: "es", native: "Español", english: "Spanish", flag: "🇪🇸" },
  { code: "fr", native: "Français", english: "French", flag: "🇫🇷" },
  { code: "de", native: "Deutsch", english: "German", flag: "🇩🇪" },
  { code: "it", native: "Italiano", english: "Italian", flag: "🇮🇹" },
  { code: "pt", native: "Português", english: "Portuguese", flag: "🇵🇹" },
  { code: "id", native: "Bahasa Indonesia", english: "Indonesian", flag: "🇮🇩" },
  { code: "ms", native: "Bahasa Melayu", english: "Malaysian", flag: "🇲🇾" },
  { code: "ko", native: "한국어", english: "Korean", flag: "🇰🇷" },
  { code: "cs", native: "Český", english: "Czech", flag: "🇨🇿" },
  { code: "pl", native: "Polski", english: "Polish", flag: "🇵🇱" },
  { code: "hu", native: "Magyar", english: "Hungarian", flag: "🇭🇺" },
  { code: "zh-cn", native: "中文简体", english: "Chinese", flag: "🇨🇳" },
  { code: "zh-tw", native: "中文繁體", english: "Chinese", flag: "🇹🇼" },
  { code: "vi", native: "Tiếng Việt", english: "Vietnamese", flag: "🇻🇳" },
  { code: "th", native: "ไทย", english: "Thai", flag: "🇹🇭" },
  { code: "hi", native: "हिन्दी", english: "Hindi", flag: "🇮🇳" },
  { code: "ku", native: "Kurdî", english: "Kurdish", flag: "🇮🇶" },
  { code: "mn", native: "Монгол", english: "Mongolian", flag: "🇲🇳" },
  { code: "sv", native: "Svenska", english: "Swedish", flag: "🇸🇪" },
  { code: "nl", native: "Nederlands", english: "Dutch", flag: "🇳🇱" },
  { code: "uk", native: "Українська", english: "Ukrainian", flag: "🇺🇦" },
  { code: "uz", native: "Oʻzbekcha", english: "Uzbek", flag: "🇺🇿" },
  { code: "da", native: "Dansk", english: "Danish", flag: "🇩🇰" },
  { code: "lt", native: "Lietuvių", english: "Lithuanian", flag: "🇱🇹" },
  { code: "fi", native: "Suomi", english: "Finnish", flag: "🇫🇮" },
  { code: "bg", native: "Български", english: "Bulgarian", flag: "🇧🇬" },
  { code: "ro", native: "Română", english: "Romanian", flag: "🇷🇴" },
  { code: "no", native: "Norsk", english: "Norwegian", flag: "🇳🇴" },
  { code: "et", native: "Eesti", english: "Estonian", flag: "🇪🇪" },
  { code: "hr", native: "Hrvatski", english: "Croatian", flag: "🇭🇷" },
  { code: "ru", native: "Русский", english: "Russian", flag: "🇷🇺" },
  { code: "tr", native: "Türkçe", english: "Turkish", flag: "🇹🇷" },
  { code: "ja", native: "日本語", english: "Japanese", flag: "🇯🇵" },
];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  const current = LANGUAGES.find((l) => l.code === lang);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "icon" : "sm"}
          className="gap-2 border border-white/10 bg-white/5 hover:bg-white/10"
          aria-label={t("lang.label")}
        >
          <Globe className="h-4 w-4" />
          {!compact && <span className="text-xs font-medium">{current?.native}</span>}
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
                    "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 text-lg",
                    active && "ring-2 ring-primary",
                  )}
                >
                  <span aria-hidden>{e.flag}</span>
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