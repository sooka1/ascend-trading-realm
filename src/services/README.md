# Service Layer (Migration-Ready)

This directory defines **provider-agnostic interfaces** (ports) for every
Lovable-Cloud-backed capability in the app. The current Lovable
implementation is preserved as the default adapter. To migrate off Lovable
later, add a new adapter for each port and swap the export in
`src/services/index.ts`.

Ports:

| Port         | File                  | Current default adapter                                              |
| ------------ | --------------------- | -------------------------------------------------------------------- |
| `EmailService` | `email/types.ts`      | `email/lovable-adapter.ts` → `src/lib/email-templates/send-email.ts` |
| `AIService`    | `ai/types.ts`         | `ai/lovable-adapter.ts` → AI Gateway (`ai.gateway.lovable.dev`)      |
| `AuthService`  | `auth/types.ts`       | `auth/lovable-adapter.ts` → `@/integrations/lovable` + Supabase      |
| `PushService`  | `push/types.ts`       | `push/lovable-adapter.ts` → FCM via `src/lib/native/push.ts`         |

**Rules:**
- New feature code SHOULD import from `@/services`, not from Lovable modules directly.
- Existing code is untouched — the adapters wrap the current implementations.
- No UI, business logic, database, or RPC changes are introduced by this layer.

See `MIGRATION.md` at the project root for the full migration report.