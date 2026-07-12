# Final Production Fix Sprint

Fixes only. No new features, no schema changes, no business-logic changes, no UI redesigns. Everything is backward compatible.

---

## Release Blockers

### B1 — Hydration mismatch in `__root.tsx`
The mismatch is caused by conditional node emission between SSR and client (line-number drift of `data-tsd-source` on a `<script>` and `<body>` indicate different branches render). Fix:
- Locate the conditional block (client-only theme/analytics `<script>` or `typeof window` guard) and render the node unconditionally.
- Add `suppressHydrationWarning` **only** on the single node whose text content legitimately differs (theme init script).
- No SSR behavior change: same HTML shape emitted on both sides.

### B2 — Repoint every `/dashboard` reference to `/portal`
Grep the entire repo (`src/**`, `public/**`, `supabase/**` docs, email templates, push payloads) for `/dashboard` and replace with `/portal`. Areas to sweep:
- `src/lib/email-templates/**` (welcome, deposit-confirmation, kyc-status, etc.)
- `src/lib/push.server.ts`, `src/lib/chat-notify.ts` (deep-link URLs)
- `src/lib/native/deep-links.ts`
- Any `redirect({ to: "/dashboard" })` or `<Link to="/dashboard">`
- Keep `src/routes/_authenticated/dashboard.tsx` as a *backward-compat* redirect (do not delete — protects old bookmarks).

### B3 — Localize every auth error
- Remove the hardcoded Arabic rate-limit message in `src/routes/forgot-password.tsx`.
- Add i18n keys: `auth.err.rate_limit`, `auth.err.network`, `auth.err.timeout`, `auth.err.invalid_credentials`, `auth.err.email_not_confirmed`, `auth.err.generic`.
- Central helper `src/lib/auth-error-i18n.ts`: `mapAuthError(err, t) => string` used by `/auth`, `/forgot-password`, `/reset-password`.
- Sweep `src/routes/auth.tsx`, `reset-password.tsx`, `forgot-password.tsx` for hardcoded strings.

---

## Critical Fixes

### C1 — Copy Trading "needs deposit" dialog
- In `src/routes/_authenticated/portal.copy-trading.tsx`, after `subscribeToMaster` returns `{ needs_deposit: true, available, shortfall }`, open an `<AlertDialog>` showing: required amount, current balance, shortfall, **Deposit Now** (navigates to `/portal/transactions` deposit tab) + **Cancel**.
- Add i18n keys under `copy.needs_deposit.*`.

### C2 — Withdrawal warning modal
- Add a preflight server fn `previewWithdrawal(amount)` → returns `{ cancelled_distributions: [...], lost_profit_estimate }` (read-only query, no schema change; reads existing `profit_distributions` table).
- In the withdrawal component, if `cancelled_distributions.length > 0`, show `<AlertDialog>` listing them with lost-profit estimate + required checkbox + final confirm button.

### C3 — KYC predefined rejection reasons
- Add `src/lib/kyc-rejection-reasons.ts` with 8 enum categories (`document_unclear`, `id_expired`, `name_mismatch`, `address_unverified`, `selfie_mismatch`, `document_type_unsupported`, `duplicate_account`, `other`) — all i18n-keyed.
- `src/routes/_authenticated/_admin/admin.kyc.tsx`: replace textarea with `<Select>` of categories + optional short internal admin note (never sent to user).
- User-facing KYC status uses only the localized category label.

### C4 — Auth state separation
- `src/routes/_authenticated/route.tsx`: split `pendingComponent` (spinner + skip-to-content), `errorComponent` (error message + **Retry** button that calls `router.invalidate()`), and add an offline detector (uses `useNetworkStatus`) that shows "You're offline — reconnect to continue".
- Add 15s auth timeout via `AbortController` around `supabase.auth.getUser()` inside `beforeLoad`; on timeout throw a typed error surfaced by `errorComponent`.

### C5 — Competition entry gate
- `src/routes/_authenticated/competitions.$id.trade.tsx`: `beforeLoad` calls `getMyCompetitionEntry(id)` (existing RPC). If not entered, render a details card (fee, prize, rules) with **Join Competition** button instead of the terminal. No terminal mount before registration.

---

## Additional UX Fixes

1. **Duplicate-click prevention** — audit all `useMutation` call sites; ensure primary buttons use `disabled={mutation.isPending}`. Focus files: `portal.copy-trading.tsx`, `portal.transactions.tsx`, `investment-request-form.tsx`, `admin.kyc.tsx`.
2. **Notification badge rollback** — `src/components/notifications-popover.tsx`: use optimistic update with `onError` restore via `queryClient.setQueryData`.
3. **Avatar validation** — `src/routes/_authenticated/portal.profile.tsx`: reject `>2MB` or non-`image/*` client-side with a toast before upload.
4. **Wallet skeleton** — `src/hooks/use-balance.ts` consumers: replace `$0.00` flash with `<Skeleton>` while `isLoading`.
5. **Admin pagination** — `admin.users.tsx`, `admin.subscriptions.tsx`, `admin.kyc.tsx`: add `page`/`pageSize` state + Prev/Next buttons; server fns already accept a range (add `.range()` if missing without changing signature — extend with optional params).
6. **Support FAB hidden on unauth** — `src/components/support-fab.tsx`: return `null` when route is under `/auth`, `/reset-password`, `/forgot-password`, or user is unauthenticated.

---

## Technical Notes

- All i18n keys added to both `ar` and `en` locale files.
- `src/lib/auth-error-i18n.ts` — new file, pure mapper.
- `src/lib/kyc-rejection-reasons.ts` — new file, enum + i18n keys.
- No new tables, no RPC signature changes. Any new server fn (`previewWithdrawal`) is read-only.
- `dashboard.tsx` redirect kept for backward-compat bookmarks.
- Verification: `bun run build`, then Playwright smoke of `/auth`, `/portal`, `/portal/copy-trading`, `/competitions/:id/trade`.

## Deliverables After Implementation

1. **Production Fix Report** — file-by-file changelog.
2. **Regression Report** — surface any behavior changes (should be none).
3. **QA Score** — expected 92+/100.
4. **Release Readiness Score** — expected 95+/100.

---

Approve to implement, or tell me which items to drop/re-scope.
