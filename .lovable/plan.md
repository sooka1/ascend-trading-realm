# HK Investment Management — Rebrand & Expansion Plan

The existing project is **HK Global Trading** (retail trading + competitions). The requested product is **HK Investment Management** — a managed-portfolio firm that trades on behalf of clients. Different positioning, different pages, different tone. This is a substantial rebuild, so I want to align on scope before writing code.

## What changes vs. what stays

Keep and reuse:
- TanStack Start routing, i18n system (AR/EN/FR/ES/TR), auth (email/password + Google), Lovable Cloud backend, existing `investment_requests` table + form, translation coverage checker.
- Tailwind v4 design tokens, shadcn components.

Replace:
- Brand identity: name → *HK Investment Management*, tagline → *Professional Investment Management*, palette → **dark base + gold + blue**, luxury corporate tone.
- Navigation: drop *Competitions / Leaderboard / Affiliate* framing; adopt investor-first IA.
- Home page: rewrite hero, features, and sections around managed portfolios (not competitions).

## Design direction

- Dark premium interface (near-black base, subtle blue depth).
- Accent palette: deep navy `#0B1220`, royal blue `#1E3A8A`, luxury gold `#D4AF37` / `#F5D06A`.
- Glassmorphism cards, gold hairlines, animated chart hero (SVG line + area, Framer-Motion-style CSS animations).
- Serif display for headings (e.g. *Fraunces* or *Playfair Display*) + geometric sans body (e.g. *Inter*).
- Micro-interactions: hover-lift, subtle gold glow, animated counters, ticker strip.

Fonts loaded via `<link>` in `__root.tsx` (Tailwind v4 rule).

## Site map (routes)

Public:
- `/` Home
- `/about` About HK
- `/solutions` Investment Solutions
- `/portfolios` Managed Portfolios
- `/performance` Performance Reports
- `/risk` Risk Management
- `/markets` Markets (reuse existing)
- `/education` Education (reuse existing)
- `/faq` FAQ (reuse existing)
- `/contact` Contact (reuse existing)
- `/auth` Login / Register (reuse)
- `/legal` Legal & Compliance
- `/privacy` Privacy Policy
- `/terms` Terms of Service

Authenticated (under `_authenticated/`):
- `/dashboard` Investor Dashboard (overview, balance, performance chart, allocation donut, recent activity)
- `/portal` Client Portal (statements, annual reports, transaction history, P&L, documents, secure messages, notifications, profile)

Drop from nav: `/competitions`, `/investment` (folded into `/solutions` + `/portfolios`), `/partners`, `/affiliate`, `/economic-calendar`, `/blog`, `/news`, `/pricing`, `/support`, `/platform` — files can remain but be delisted, or I can delete them. **Decision needed** (see below).

## Data model additions

New tables (all with RLS + GRANTs + `updated_at` triggers):
- `portfolios` — id, user_id, name, strategy, base_currency, inception_date.
- `portfolio_snapshots` — portfolio_id, as_of_date, equity, pnl, allocation JSONB.
- `transactions` — portfolio_id, ts, symbol, side, qty, price, pnl.
- `statements` — user_id, period, kind (monthly/annual), file_url.
- `notifications` — user_id, title, body, read_at.
- `messages` — user_id, from_role, body, created_at.

Reuse existing `profiles`, `user_roles`, `investment_requests`.

## Content & i18n

- All new copy added to `page-content.ts` / `home-content.ts` / `DICTS` in 5 languages, verified by the existing coverage checker.
- Legal pages: template copy with clear risk disclaimers ("investing involves risk", "past performance does not guarantee future results"), marked as *sample — review with counsel before publishing*.

## Logo & favicon

- Generate a premium HK monogram (gold on dark navy, geometric, serif-inspired) via `imagegen` (premium tier for legibility), export as SVG-styled PNG, upload via `lovable-assets`, wire into header + `public/favicon.png` and delete default favicon.

## Execution order

1. Palette + typography tokens in `src/styles.css`; header/footer rebrand.
2. Logo + favicon.
3. Home page rewrite with animated chart hero and feature grid.
4. New public routes (about, solutions, portfolios, performance, risk, legal, privacy, terms).
5. Migration for new tables + seed demo data for logged-in demo user.
6. Investor Dashboard + Client Portal under `_authenticated/`.
7. i18n coverage pass; run `bun run check:i18n`.
8. Head metadata per route.

## Decisions I need from you

1. **Legacy pages** — competitions, leaderboard, affiliate, partners, pricing, economic calendar, blog, news, support, platform: delete them, or keep them accessible but remove from nav?
2. **Language scope** — keep all 5 languages (AR/EN/FR/ES/TR), or narrow to a subset for the rebrand and translate the rest later?
3. **Dashboard data** — seed realistic demo data (fake portfolio + snapshots + transactions) so the dashboard looks alive for any signed-in user, or wire the UI to empty state until real data is loaded per user?
4. **Legal copy** — do you want me to draft template Privacy / Terms / Legal & Compliance content (clearly labeled as sample), or leave those pages as scaffolds with placeholders for your counsel to fill in?

Answer any subset — I'll assume sensible defaults for the rest (delete legacy pages, keep all 5 languages, seed demo data, draft sample legal copy clearly labeled).