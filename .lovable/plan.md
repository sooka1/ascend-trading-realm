
# HK Global Trading — Phased Build Plan

A platform this large can't ship in one turn at quality. I'll deliver it in 5 phases and pause for your approval between each. This plan locks Phase 1 in detail and outlines Phases 2–5 so you know what's coming.

## Brand foundation (used across all phases)

- **Name**: HK Global Trading
- **Logo**: Interlocked H+K monogram with an integrated upward candlestick tick inside the negative space of the K — geometric, minimal, fintech. Gold `#F59E0B` + Blue `#2563EB` gradient on dark. Generated as premium-quality PNG (transparent), plus a monochrome variant and a square app-icon/favicon variant.
- **Palette**: bg `#0F172A` / surface `#111827`, primary blue `#2563EB`, gold accent `#F59E0B`, foreground white. Semantic tokens defined in `src/styles.css` (oklch) — no hardcoded colors in components.
- **Typography**: Space Grotesk (display) + Inter (body), via `@fontsource`.
- **Design language**: glassmorphism cards (blurred surfaces over gradient bg), soft gold/blue gradients, subtle grid backgrounds, animated candlestick hero, framer-motion micro-interactions, animated counters, skeleton loaders.

## Phase 1 — Identity + Marketing Site (this build)

**Scope**: Logo, design system, and all public pages with polished UI. Mock data for market widgets. No auth yet, no backend yet.

Pages:
- `/` Home — parallax hero (animated candlesticks + floating asset chips), Why Choose Us, Live Market Ticker (mock), Trading Instruments grid, Competitions preview, Leaderboard preview, Animated stats counters, Reviews, Academy teaser, News teaser, Affiliate teaser, Mobile Apps, Security & Regulation, FAQ accordion, Footer
- `/about`, `/platform`, `/competitions`, `/markets`, `/education`, `/partners`, `/pricing`, `/affiliate`, `/news`, `/blog`, `/economic-calendar`, `/faq`, `/support`, `/contact`
- `/auth` — login/register UI (visual only in Phase 1, wired in Phase 2)

Each route gets its own `head()` with unique title/description/OG tags. Home gets a generated OG hero image.

**Deliverables**:
- HK logo (main, monochrome, favicon) generated + wired into nav, footer, favicon
- `src/styles.css` design tokens + fonts
- Shared `SiteHeader` (with HK logo + nav + auth CTAs) and `SiteFooter`
- ~16 route files with real content, no placeholder boilerplate
- Framer-motion animations, glass cards, animated counters, mock live-price ticker

## Phase 2 — Auth + Client Dashboard shell

Enable Lovable Cloud. Email/password + Google sign-in. `profiles` + `user_roles` tables with RLS. Managed `_authenticated` layout. Dashboard shell: portfolio, wallet, competitions (mine), achievements/badges, transactions, deposit/withdraw UI (mock), KYC upload flow, notifications, profile/settings, dark mode toggle. Password reset page.

## Phase 3 — Competitions engine + Real market data

Cloud tables: `competitions`, `competition_entries`, `leaderboard_snapshots`, `trades` (simulated). Registration flow, live ranking, winner badges, certificates, history. Connect a market data provider (I'll recommend **Finnhub** — generous free tier covering forex, crypto, stocks; you'll add the API key via `add_secret`). Live prices, economic calendar, news via server functions.

## Phase 4 — Admin dashboard + Affiliate + Gamification

Admin (role-gated via `has_role('admin')`): users, competitions, deposits/withdrawals, trading accounts, affiliate management, rewards, leaderboards, revenue analytics with charts. Affiliate system: referral links, commission tiers, payouts. Gamification: XP, achievements, daily missions, referral rewards.

## Phase 5 — Education Center + Polish

Courses, video library, articles, webinars, e-books, glossary, trading calculators. 2FA, session management, login history. PWA manifest, performance pass (lazy loading, image optimization, Lighthouse tuning), accessibility AA pass, SEO polish.

## Technical notes

- Stack is TanStack Start (not Next.js — the spec asked for Next 15, but this template is TanStack Start v1 / React 19 / Vite 7, which delivers equivalent SSR/SEO/performance).
- All colors go through semantic tokens in `src/styles.css`.
- Server logic uses `createServerFn`; webhooks use `/api/public/*`.
- Real market data requires you to obtain a Finnhub API key in Phase 3 (free at finnhub.io).

## What ships when you approve

Phase 1 only. I'll message you when it's ready to review, then start Phase 2 on your go.
