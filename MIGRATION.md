# Lovable Cloud → Standalone Migration Report

**Status:** Migration-ready. Lovable is the active provider; adapters isolate
every Lovable-specific capability behind `src/services/*` ports. No UI,
business logic, database, or RPC has changed.

---

## 1. `@lovable.dev/*` package dependencies

From `package.json`:

| Package                          | Purpose                                          | Replacement path |
| -------------------------------- | ------------------------------------------------ | ---------------- |
| `@lovable.dev/cloud-auth-js`     | Google/Apple/Microsoft OAuth broker              | Configure providers directly in Supabase Auth; call `supabase.auth.signInWithOAuth` inside `AuthService` |
| `@lovable.dev/email-js`          | Managed email API + auth-email webhook handler   | Resend / SendGrid / SMTP inside `EmailService`; hand-roll Supabase auth-email webhook or use Supabase built-in templates |
| `@lovable.dev/webhooks-js`       | Signed webhook verification (email events)       | Manual HMAC verification or provider SDK equivalent |
| `@lovable.dev/vite-tanstack-config` | Preconfigured Vite/TanStack/Tailwind/CF stack | Rewrite `vite.config.ts` with individual plugins (react, tanstackStart, tailwind, tsconfig-paths, nitro) |
| `@lovable.dev/agent-sdk` *(if present)* | Legacy custom agents                       | AI SDK server routes via `AIService` |

## 2. Files with a direct Lovable dependency

| File | Depends on | Type |
| ---- | ---------- | ---- |
| `src/integrations/lovable/index.ts` | `@lovable.dev/cloud-auth-js` | **Auto-generated** — do not edit |
| `src/integrations/supabase/client.ts` | Lovable Cloud publishable key injection | **Auto-generated** |
| `src/integrations/supabase/client.server.ts` | Lovable Cloud service-role injection | **Auto-generated** |
| `src/integrations/supabase/auth-middleware.ts` | Lovable-managed JWT verification | **Auto-generated** |
| `src/integrations/supabase/auth-attacher.ts` | Same | **Auto-generated** |
| `src/lib/email-templates/send-email.ts` | `@lovable.dev/email-js` (`sendLovableEmail`) | Wrapped by `EmailService` |
| `src/routes/lovable/email/auth/webhook.ts` | `@lovable.dev/email-js` (`createAuthEmailHandler`) | Cloud-only route path |
| `src/routes/lovable/email/auth/preview.ts` | Managed preview endpoint | Cloud-only route path |
| `src/routes/lovable/email/transactional/preview.ts` | Managed preview endpoint | Cloud-only route path |
| `src/lib/env.server.ts` | Declares `LOVABLE_API_KEY` | Config only |
| `src/routes/auth.tsx` | Uses OAuth broker via `AuthService` | Migrates by swapping adapter |
| `src/lib/support-inquiry.functions.ts` | Sends via `sendTemplateEmail` | Migrates through `EmailService` |
| `src/lib/broadcast.functions.ts` | Same | Migrates through `EmailService` |
| `src/lib/email-test.functions.ts` | Same | Migrates through `EmailService` |
| `capacitor.config.ts` / `src/lib/native/push.ts` | FCM (no Lovable dep) | Portable as-is |

## 3. Cloud-only runtime features

| Feature | Where | Notes |
| ------- | ----- | ----- |
| **Lovable AI Gateway** (`ai.gateway.lovable.dev`) | `src/services/ai/lovable-adapter.ts` | Currently unused by app code; adapter provided for future use. Replace with OpenAI/Anthropic SDK. |
| **Managed email send + suppression + rate limit + unsubscribe** | `src/lib/email-templates/send-email.ts` | Suppression, unsubscribe page, and rate limits are Lovable-hosted — you must rebuild them if you leave. |
| **Auth email webhook** (`/lovable/email/auth/webhook`) | Routes under `src/routes/lovable/email/*` | Supabase Auth "Send email hook" points here. |
| **Email events webhook** (`/lovable/email/events`) | Not currently present | Only needed if you react to bounces/complaints in-app. |
| **Email preview endpoints** | `src/routes/lovable/email/**/preview.ts` | Dashboard-only; safe to delete on migration. |
| **OAuth broker** (`/~oauth/initiate`, `/~oauth/callback`) | `@lovable.dev/cloud-auth-js` | Replaced by configuring Google/Apple/Microsoft directly in Supabase Auth. |
| **Managed Supabase project** | All `supabase.*` calls | `SUPABASE_SERVICE_ROLE_KEY` and DB password are **not retrievable** while the project stays on Lovable Cloud — export DB + move to a standalone Supabase project first. |
| **Auto-provisioned `LOVABLE_API_KEY`** | Read in `send-email.ts`, `ai/lovable-adapter.ts`, email preview routes | Cannot be reproduced outside Lovable — remove readers when adapters are swapped. |

## 4. Environment variables

### Required to run outside Lovable
| Variable | Client/Server | Used in |
| -------- | ------------- | ------- |
| `VITE_SUPABASE_URL` | Client | `src/integrations/supabase/client.ts` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client | Same |
| `SUPABASE_URL` | Server | `client.server.ts`, `env.server.ts` |
| `SUPABASE_PUBLISHABLE_KEY` | Server | Same |
| `SUPABASE_SERVICE_ROLE_KEY` | Server (privileged) | `client.server.ts` — **not retrievable on Lovable Cloud** |

### Lovable-provisioned (must be replaced on migration)
| Variable | Replace with |
| -------- | ------------ |
| `LOVABLE_API_KEY` | `RESEND_API_KEY` (email), `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` (AI) |
| `LOVABLE_SEND_URL` | Drop; provider SDK owns the endpoint |

### Feature-gated (portable, no change needed on migration)
`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `TWELVE_DATA_API_KEY`,
`BINANCE_PAY_API_SECRET`, `SUPPORT_INBOX_EMAIL`.

## 5. Service ports (added in this change)

| Port | Interface | Default adapter | Consumers to migrate |
| ---- | --------- | --------------- | -------------------- |
| Email | `src/services/email/types.ts` | `email/lovable-adapter.ts` | `support-inquiry.functions.ts`, `broadcast.functions.ts`, `email-test.functions.ts` |
| AI | `src/services/ai/types.ts` | `ai/lovable-adapter.ts` | none yet — adapter ready for future features |
| Auth | `src/services/auth/types.ts` | `auth/lovable-adapter.ts` | `src/routes/auth.tsx` (Google sign-in) |
| Push | `src/services/push/types.ts` | `push/lovable-adapter.ts` | `src/lib/native-shell.ts` |

**Migration flow:** implement a new adapter (e.g. `email/resend-adapter.ts`),
then change one line in `src/services/index.ts` to export it as
`emailService`. No feature code needs to change.

## 6. What migration will require later

1. **Export the Supabase database** (Cloud → Advanced → Export data) and
   restore it into a standalone Supabase project you own.
2. **Set the five required env vars** above in your host (Vercel / Fly /
   Cloudflare Pages / etc.).
3. **Rewrite `vite.config.ts`** without `@lovable.dev/vite-tanstack-config`
   (add tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro
   individually).
4. **Configure Google/Apple/Microsoft OAuth** directly in Supabase Auth and
   ship a `SupabaseAuthAdapter` implementing `AuthService`.
5. **Ship a `ResendEmailAdapter`** (or SMTP) implementing `EmailService`; port
   the React Email templates as-is.
6. **Configure the Supabase Auth "Send email" webhook** to your own endpoint
   (or use Supabase's built-in templates and delete the custom auth webhook).
7. **Delete `src/routes/lovable/**`, `src/integrations/lovable/**`, and every
   `@lovable.dev/*` dependency** from `package.json`.
8. **Remove `LOVABLE_API_KEY` and `LOVABLE_SEND_URL`** from
   `src/lib/env.server.ts`.

---

## Guarantees of this change

- No UI files touched.
- No `.functions.ts` business-logic files touched.
- No SQL migrations, tables, RPCs, or policies changed.
- No existing imports rewritten — the app still runs 100% on Lovable Cloud.
- Everything added lives under `src/services/` plus this report.