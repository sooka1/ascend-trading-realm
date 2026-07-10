import { LANGUAGES } from "@/lib/locales";

export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function getBrowserLanguage(): string {
  if (typeof navigator === "undefined") return "ar";
  const codes = LANGUAGES.map((l) => l.code);
  const candidates = [navigator.language, ...(navigator.languages ?? [])];
  for (const raw of candidates) {
    if (!raw) continue;
    const lower = raw.toLowerCase();
    if (codes.includes(lower)) return lower;
    const base = lower.split("-")[0];
    if (codes.includes(base)) return base;
  }
  return "ar";
}