## Super Admin Control Center — Phased Plan

The scope you shared covers ~20 modules and hundreds of sub-features. Building it all in one turn would produce shallow screens. I'll deliver it as **6 phases**, each phase a shippable slice with polished screens, real data from your existing tables, and the same Noir & Gold / Bloomberg-lite design language already used across the investor portal. Confirm the plan and I'll execute Phase 1 immediately.

### Foundation (shared, built once, reused by every phase)

- **`AdminShell` layout** — mirrors `PortalShell`: sticky sidebar, grouped nav (Overview, Operations, Finance, Users, System, Settings), gold-accent active state, mobile chip nav, page header with actions slot.
- **`AdminCard`, `Kpi`, `StatusPill`, `DataTable`** primitives with search / filter / pagination / CSV export baked in.
- **Route architecture**: expand `src/routes/_authenticated/_admin/` with `admin.<section>.tsx` files. Existing `admin.index / users / finance / audit` get re-skinned to use `AdminShell`.
- **Server functions** in `src/lib/admin.functions.ts` (extend existing file). All reads go through `requireSupabaseAuth` + `has_role('admin' | 'super_admin')`. Aggregates computed server-side.

### Phase 1 — Executive Dashboard + System Monitoring

- `/admin` Executive Dashboard: KPIs (users, active subs, AUM, MRR, tickets open), live activity feed (from `finance_audit_log`), quick actions, revenue sparkline, subscription growth, recent finance requests.
- `/admin/monitoring` System Monitoring: DB health via `pg_stat`, storage bucket usage, API latency proxy (server-fn timings), error-rate counters, queue status placeholder.
- `/admin/analytics` Platform Analytics: DAU / MAU / retention / churn / geographic breakdown from `profiles` + `finance_audit_log`.

### Phase 2 — Financial Operations

- `/admin/finance` (re-skin existing) with tabs: Deposits · Withdrawals · Investment Requests · History.
- `/admin/subscriptions` Subscription control: list + filter by status, upgrade/downgrade/cancel actions, renewal timeline.
- `/admin/invoices` Invoice ledger derived from `subscriptions` + `deposits`.
- `/admin/payments` Payment logs & manual review queue.
- `/admin/accounting` Revenue / expenses / profit reports (monthly / quarterly / annual) with charts + CSV/PDF export.

### Phase 3 — User, Role & Organization Management

- `/admin/users` (re-skin): advanced filters (role, status, KYC, last login), bulk actions, drawer with user detail (roles, sessions, activity, security).
- `/admin/roles` RBAC: role matrix, create/clone role, permission groups, audit of role changes.
- `/admin/organizations` (requires a new `organizations` table — see "Backend changes"): profile, status, subscription, admins, storage, activity, billing, documents.

### Phase 4 — Audit, Security & Notifications

- `/admin/audit` (re-skin): full-featured, filter by actor/kind/date, export.
- `/admin/security` Security Center: failed logins, MFA coverage, role changes, RLS status, active sessions.
- `/admin/notifications` Notification Center: templates, scheduling, history, per-channel (email/push/in-app) filter — persists to `notifications` table.

### Phase 5 — Marketing, Partners, Backups

- `/admin/marketing` Campaigns + newsletter queue (requires `marketing_campaigns` table).
- `/admin/partners` Partner directory + commission report (requires `partners` table).
- `/admin/backups` Backup center: history from `pg_cron` job runs, integrity check status, manual snapshot trigger via server fn.

### Phase 6 — Settings, Search, Export, Performance polish

- `/admin/settings` General, branding, themes, localization, currencies, maintenance mode toggle.
- Global admin `⌘K` search across users, requests, tickets, audit entries.
- Universal CSV / print / PDF export helpers wired into every list.
- Virtualization on tables >200 rows, server-side pagination, query-key caching.

### Backend changes (batched into three migrations, one per relevant phase)

- **Phase 3**: `organizations`, `organization_members` (+ RLS + GRANTs).
- **Phase 4**: `notification_templates`, `notification_deliveries` (+ RLS).
- **Phase 5**: `marketing_campaigns`, `partners`, `partner_commissions` (+ RLS).

Every migration follows the required 4-step order (CREATE → GRANT → ENABLE RLS → POLICY) and uses `has_role` for admin gates.

### Explicit exclusions (out-of-scope for a UI build)

- **Rate limiting** — no primitive on the backend; noted and skipped as per Lovable guidance.
- **Real infra CPU/memory graphs** — the Cloudflare Worker runtime doesn't expose host metrics. Monitoring page shows what we *can* measure (DB, storage, error counts, server-fn timings) and clearly labels this.
- **Actual payment gateways** (Stripe/PayPal) — I'll build the UI shells and DB queues; enabling live payments is a separate flow via `enable_stripe_payments` when you're ready.
- **Automatic backups infrastructure** — the UI will surface `pg_cron` job runs; provisioning point-in-time recovery is a Lovable Cloud platform setting, not application code.

### How I'll proceed

I'll build **Phase 1 immediately** after you confirm this plan, keep every screen shippable, and check in after each phase before starting the next. If you want a different phase first (e.g. "start with Finance"), tell me and I'll reorder.
