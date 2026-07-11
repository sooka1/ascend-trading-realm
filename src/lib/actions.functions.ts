import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/**
 * Server-side guarded action: request to copy a trader's trades.
 * The `requireSupabaseAuth` middleware throws `Response('Unauthorized', 401)`
 * when no valid session bearer token is attached — so even if the UI is
 * bypassed (dev tools, direct fetch), the server rejects the request.
 */
export const requestCopyTrader = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ traderId: z.string().min(1).max(32) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    // context.userId is guaranteed authenticated here.
    return { ok: true as const, traderId: data.traderId, userId: context.userId };
  });

/**
 * Server-side guarded action: subscribe to a competition tier.
 * Same guarantee — unauthenticated callers get a 401 from the middleware.
 */
export const subscribeCompetition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        tierFee: z.number().int().positive().max(100_000),
        competitionId: z.string().min(1).max(64).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    return {
      ok: true as const,
      tierFee: data.tierFee,
      competitionId: data.competitionId ?? null,
      userId: context.userId,
    };
  });