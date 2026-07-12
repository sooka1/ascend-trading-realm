# Environment Variables

All secrets are managed through Lovable Cloud project secrets — **never** committed
to the repo. Public config uses Vite `VITE_*` variables; everything else is
server-only.

## Security model

| Scope | Where it lives | Where it's readable |
|---|---|---|
| Public (safe in browser bundle) | `.env` → `VITE_*` | `import.meta.env.VITE_*` |
| Server-only secrets | Lovable Cloud → Project Secrets | `process.env.*` inside server functions / server routes / `*.server.ts` |

Guardrails already enforced by the codebase:

- `src/integrations/supabase/client.server.ts` (service role) is filename-blocked from client bundles.
- `src/lib/env.server.ts` is server-only and provides typed accessors + startup validation.
- No secret literals appear anywhere in `src/`.
- `SUPABASE_SERVICE_ROLE_KEY` is loaded only via `await import("@/integrations/supabase/client.server")` inside handler bodies.

## Public variables (`.env`, client-visible)

| Name | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key — RLS enforced |
| `VITE_SUPABASE_PROJECT_ID` | Project ref (non-sensitive) |

## Server-only secrets (Lovable Cloud → Secrets)

### Required
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

### Optional (feature-gated)
- `SUPABASE_SERVICE_ROLE_KEY` — admin/privileged server work only
- `LOVABLE_API_KEY` — AI Gateway + connectors + email
- `LOVABLE_SEND_URL` — email send URL override
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` — Web Push
- `TWELVE_DATA_API_KEY` — market data
- `BINANCE_PAY_API_SECRET` — webhook signature verification
- `SUPPORT_INBOX_EMAIL` — support inbox recipient

## Environments

Lovable Cloud provides separate secret stores for **dev** and **prod**. Set
`NODE_ENV=staging` in a staging deployment if you need to distinguish it at
runtime; server code branches via `serverEnv.NODE_ENV`.

## Validation

Call `validateServerEnv()` from `@/lib/env.server` inside a server handler to
check required vars at request time (Workers only populate `process.env` per
request). It returns `{ ok, missing }` — never throws — so callers can fail
gracefully with a 503 instead of crashing the server.

## Rules

1. Never hardcode a secret. Add it via the Cloud secrets UI.
2. Never import `client.server.ts` at module scope of a `.functions.ts` file —
   use `await import(...)` inside the handler.
3. Never expose service-role or private keys through `VITE_*`.
4. Never log or echo secret values.