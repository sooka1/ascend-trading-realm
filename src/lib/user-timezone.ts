// Applies the user's saved timezone to every Date.prototype.toLocale* call
// so all timestamps across the platform render in their preferred zone.
// Client-only — SSR keeps native behavior.

const STORAGE_TZ = "user_timezone";
const STORAGE_LOCALE = "user_locale";

let currentTz: string | undefined;
let currentLocale: string | undefined;
let patched = false;

export function getUserTimezone(): string | undefined {
  return currentTz;
}

export function getUserLocale(): string | undefined {
  return currentLocale;
}

export function setUserTimezone(tz: string | null | undefined) {
  if (typeof window === "undefined") return;
  currentTz = tz && tz.length > 0 ? tz : undefined;
  if (currentTz) window.localStorage.setItem(STORAGE_TZ, currentTz);
  else window.localStorage.removeItem(STORAGE_TZ);
}

export function setUserLocale(locale: string | null | undefined) {
  if (typeof window === "undefined") return;
  currentLocale = locale && locale.length > 0 ? locale : undefined;
  if (currentLocale) window.localStorage.setItem(STORAGE_LOCALE, currentLocale);
  else window.localStorage.removeItem(STORAGE_LOCALE);
}

function mapLocale(input: unknown): unknown {
  // If a call didn't specify a locale (undefined) use the user's saved locale.
  if (input === undefined && currentLocale) return currentLocale;
  return input;
}

function mergeOptions(opts: Intl.DateTimeFormatOptions | undefined): Intl.DateTimeFormatOptions | undefined {
  if (!currentTz) return opts;
  if (!opts) return { timeZone: currentTz };
  if (opts.timeZone) return opts; // caller explicitly chose a zone
  return { ...opts, timeZone: currentTz };
}

export function installTimezonePatch() {
  if (patched || typeof window === "undefined") return;
  patched = true;

  try {
    currentTz = window.localStorage.getItem(STORAGE_TZ) || undefined;
    currentLocale = window.localStorage.getItem(STORAGE_LOCALE) || undefined;
  } catch {
    // ignore
  }

  const proto = Date.prototype;
  const origToLocaleString = proto.toLocaleString;
  const origToLocaleDateString = proto.toLocaleDateString;
  const origToLocaleTimeString = proto.toLocaleTimeString;

  proto.toLocaleString = function (locale?: unknown, opts?: Intl.DateTimeFormatOptions) {
    return origToLocaleString.call(this, mapLocale(locale) as string | string[] | undefined, mergeOptions(opts));
  } as typeof proto.toLocaleString;

  proto.toLocaleDateString = function (locale?: unknown, opts?: Intl.DateTimeFormatOptions) {
    return origToLocaleDateString.call(this, mapLocale(locale) as string | string[] | undefined, mergeOptions(opts));
  } as typeof proto.toLocaleDateString;

  proto.toLocaleTimeString = function (locale?: unknown, opts?: Intl.DateTimeFormatOptions) {
    return origToLocaleTimeString.call(this, mapLocale(locale) as string | string[] | undefined, mergeOptions(opts));
  } as typeof proto.toLocaleTimeString;

  // Also patch Intl.DateTimeFormat so `new Intl.DateTimeFormat(...).format(date)` respects the zone.
  const OriginalDTF = Intl.DateTimeFormat;
  function PatchedDTF(locale?: unknown, opts?: Intl.DateTimeFormatOptions) {
    // Support both `new` and non-`new` calls per the Intl spec.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new (OriginalDTF as any)(mapLocale(locale), mergeOptions(opts));
  }
  PatchedDTF.prototype = OriginalDTF.prototype;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (PatchedDTF as any).supportedLocalesOf = OriginalDTF.supportedLocalesOf.bind(OriginalDTF);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Intl as any).DateTimeFormat = PatchedDTF;
}

export async function loadUserTimezoneFromProfile() {
  if (typeof window === "undefined") return;
  const { supabase } = await import("@/integrations/supabase/client");
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  const { data } = await supabase
    .from("profiles")
    .select("timezone,language")
    .eq("id", u.user.id)
    .maybeSingle();
  if (data?.timezone) setUserTimezone(data.timezone as string);
  if (data?.language) setUserLocale(data.language as string);
}