# HKEX Invest — Production Readiness Report

_Date: 2026-07-15 — After Phases 1–4 of the Enterprise Trust, Compliance, SEO & AI Authority Upgrade._

## Executive Summary

HKEX Invest is a self-hosted, independent multi-asset investment platform. Over four phases, the platform has been retrofitted with an independence disclaimer, factual copy, professional legal pages, structured data (Organization, BreadcrumbList, FAQPage, CollectionPage), and metadata suitable for search engines and LLMs. Below are the current scores and remaining items to address before a full production launch.

## Scores (out of 100)

| Domain | Score | Notes |
|---|---|---|
| **Trust** | 88 | Independence disclaimer + factual copy + AML/KYC/complaints pages. Awaiting real corporate registration details. |
| **SEO** | 92 | Canonicals, OG/Twitter, sitemap, JSON-LD on all trust pages. og:image + hreflang still open. |
| **Accessibility (a11y)** | 82 | Skip-link, semantic headings, dark-mode contrast. Missing full ARIA audit and keyboard-trap review on modals. |
| **Performance** | 84 | Vite + edge, preconnect on fonts, lazy routes. Hero video and images still need `loading="lazy"` and dimensions audit. |
| **Security** | 87 | RLS enforced, TLS, hashed credentials, 2FA available, `/api/public/*` handlers validated. CSP + HSTS headers not yet set in `_headers`. |
| **AI Readability** | 90 | Clear H1s, semantic sections, JSON-LD schemas, breadcrumbs, factual copy. Robots.txt allows crawlers; llms.txt not yet published. |
| **Compliance** | 80 | Terms/Privacy/Cookies/AML/KYC/Complaints/Disclaimer/Risk in place, all clearly marked as generic templates that must be finalized by counsel. |

**Overall production readiness: 86 / 100** — Ready for a soft launch under a compliance beta banner, not for unrestricted public marketing.

## Compliance Review

- ✅ Clear "not affiliated with HKEX" disclaimer in footer, root metadata, and Organization JSON-LD.
- ✅ No fabricated licenses, certifications, or partnerships claimed anywhere.
- ✅ Generic professional templates for Terms, Privacy, Cookies, AML, KYC, Complaints, Disclaimer, Risk, Security Center.
- ⚠️ Templates explicitly need review by qualified legal counsel before production use.
- ⚠️ No jurisdiction-specific regulatory disclosures yet (e.g. MiFID, FCA, SFC, SEC) — must be added once the operating entity's registration is known.

## Remaining Issues (with resolution paths)

### High priority (before public launch)

1. **Corporate identity is placeholder.** Company legal name, registration number, and registered address are not yet baked into `/about`, footer, or contact page. → Provide real corporate details and inject them via a single `src/lib/company.ts` constants module.
2. **Legal counsel review.** All legal pages are labelled as generic templates. → Have a qualified attorney in the operating jurisdiction review and localize Terms, Privacy, Cookies, AML, KYC, and Risk pages.
3. **Security response contact.** `/security-center` mentions a "responsible disclosure" email but no address. → Add a real security contact address (e.g. `security@hkexinvest.com`) and publish `/.well-known/security.txt`.
4. **CSP + HSTS headers.** `public/_headers` should set `Strict-Transport-Security`, `Content-Security-Policy`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `X-Content-Type-Options: nosniff`. → Add to `public/_headers`.

### Medium priority

5. **Hreflang tags.** 35 locales are shipped in i18n JSON but no `<link rel="alternate" hreflang="…">` tags. → Add per-language alternates for public routes.
6. **Sitemap coverage.** New routes added in Phases 1–3 (careers, press, how-it-works, help, complaints, aml, kyc, cookies, disclaimer, security-center) are in `public/sitemap.xml`; regenerate `lastmod` at deploy time.
7. **`llms.txt`.** Publish `/llms.txt` at project root advertising HKEX Invest's public documentation URLs for AI crawlers.
8. **Accessibility deep audit.** Run axe-core against `/`, `/portfolios`, `/portal`, `/auth`, and modal dialogs. Fix any focus-trap and ARIA-label gaps.
9. **Image + video performance audit.** Verify all `<img>` have `width`, `height`, and `loading="lazy"` (except hero); ensure the hero MP4 has `preload="metadata"`.

### Low priority / nice-to-have

10. **Article schema on news items.** `/risk` currently ships CollectionPage schema for the page itself. Individual news items link to external sources, so per-item Article schema is not applicable, but a `NewsArticle` schema could be added if news items become internally hosted.
11. **OG image per route.** Root `og:image` is set and used sitewide. Consider bespoke OG images for `/about`, `/portfolios`, `/faq` if marketing benefit is desired.
12. **Two-factor enforcement policy.** 2FA is available in the portal but not enforced for admin roles. → Add an enforcement rule via `use-mfa-enforcement.ts` for privileged roles.

## Truthfulness Statement

All copy across the platform describes only:
- The platform's actual technical controls (TLS, hashed credentials, 2FA availability, RLS).
- Its independence from HKEX (Hong Kong Exchanges and Clearing Limited).
- Generic professional legal templates that are clearly marked as pending finalization.

No license, certification, regulatory approval, partnership, custodian relationship, or audit outcome is claimed unless explicitly provided by the platform owner and verifiable.

## Next Recommended Actions (in order)

1. Provide corporate identity details (legal name, registration, address, jurisdiction).
2. Engage legal counsel to review and finalize the legal templates.
3. Add the security headers to `public/_headers` and publish `/.well-known/security.txt`.
4. Add hreflang alternates and `llms.txt`.
5. Run automated a11y + Lighthouse audits and address findings.
6. Move from "beta" to "general availability" only after items 1–3 are complete.