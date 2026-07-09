import { DICTS, LANGUAGES, type Lang } from "./i18n";
import { ALL_HOME } from "./home-content";
import { ALL_PAGES } from "./page-content";

/** Collect every leaf key path from a nested value (arrays included by index). */
function collectKeys(value: unknown, prefix = "", out: Set<string> = new Set()): Set<string> {
  if (value === null || value === undefined) return out;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    out.add(prefix);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => collectKeys(item, `${prefix}[${i}]`, out));
    return out;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      collectKeys(v, prefix ? `${prefix}.${k}` : k, out);
    }
  }
  return out;
}

export type CoverageReport = {
  section: string;
  baseline: Lang;
  missing: Record<Lang, string[]>;
  extra: Record<Lang, string[]>;
  empty: Record<Lang, string[]>;
};

function diffSection(
  section: string,
  perLang: Record<Lang, unknown>,
  baseline: Lang = "en",
): CoverageReport {
  const baseKeys = collectKeys(perLang[baseline]);
  const missing = {} as Record<Lang, string[]>;
  const extra = {} as Record<Lang, string[]>;
  const empty = {} as Record<Lang, string[]>;
  for (const { code } of LANGUAGES) {
    const keys = collectKeys(perLang[code]);
    missing[code] = [...baseKeys].filter((k) => !keys.has(k)).sort();
    extra[code] = [...keys].filter((k) => !baseKeys.has(k)).sort();
    // Detect empty strings
    empty[code] = [];
    walkEmpty(perLang[code], "", empty[code]);
  }
  return { section, baseline, missing, extra, empty };
}

function walkEmpty(value: unknown, prefix: string, out: string[]) {
  if (typeof value === "string") {
    if (value.trim() === "") out.push(prefix);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => walkEmpty(v, `${prefix}[${i}]`, out));
    return;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      walkEmpty(v, prefix ? `${prefix}.${k}` : k, out);
    }
  }
}

export function runI18nCoverage(): CoverageReport[] {
  return [
    diffSection("i18n.DICTS", DICTS as unknown as Record<Lang, unknown>),
    diffSection("home-content", ALL_HOME as unknown as Record<Lang, unknown>),
    diffSection("page-content", ALL_PAGES as unknown as Record<Lang, unknown>),
  ];
}

export function formatCoverage(reports: CoverageReport[]): {
  ok: boolean;
  output: string;
} {
  const lines: string[] = [];
  let ok = true;
  for (const r of reports) {
    lines.push(`\n── ${r.section} (baseline: ${r.baseline}) ──`);
    for (const { code } of LANGUAGES) {
      const miss = r.missing[code];
      const extra = r.extra[code];
      const empty = r.empty[code];
      if (miss.length === 0 && extra.length === 0 && empty.length === 0) {
        lines.push(`  ✓ ${code}: complete`);
        continue;
      }
      ok = false;
      lines.push(`  ✗ ${code}:`);
      if (miss.length) lines.push(`      missing (${miss.length}): ${miss.join(", ")}`);
      if (extra.length) lines.push(`      extra   (${extra.length}): ${extra.join(", ")}`);
      if (empty.length) lines.push(`      empty   (${empty.length}): ${empty.join(", ")}`);
    }
  }
  return { ok, output: lines.join("\n") };
}