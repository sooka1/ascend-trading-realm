import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AppRole =
  | "super_admin"
  | "admin"
  | "portfolio_manager"
  | "compliance_officer"
  | "finance"
  | "support"
  | "moderator"
  | "investor"
  | "user";

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) return { roles: [] as AppRole[] };
    return { roles: (data ?? []).map((r: { role: AppRole }) => r.role) };
  });

export const hasAnyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { roles: AppRole[] }) => data)
  .handler(async ({ data, context }) => {
    const { data: ok, error } = await context.supabase.rpc("has_any_role", {
      _user_id: context.userId,
      _roles: data.roles,
    });
    if (error) return { authorized: false };
    return { authorized: Boolean(ok) };
  });