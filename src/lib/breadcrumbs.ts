// Helpers for BreadcrumbList JSON-LD (schema.org)
// Used across public pages to boost SEO and AI readability.

const BASE_URL = "https://www.hkexinvest.com";

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${BASE_URL}${c.path}`,
    })),
  };
}

export function breadcrumbScript(crumbs: Crumb[]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(breadcrumbJsonLd(crumbs)),
  } as const;
}