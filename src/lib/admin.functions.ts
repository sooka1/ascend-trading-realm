import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AppRole } from "@/lib/rbac.functions";

const ADMIN_ROLES: AppRole[] = ["super_admin", "admin"];

async function assertAdmin(context: {
  supabase: any;
  userId: string;
}): Promise<{ ok: boolean; isSuper: boolean }> {
  const { data: isAdmin } = await context.supabase.rpc("has_any_role", {
    _user_id: context.userId,
    _roles: ADMIN_ROLES,
  });
  if (!isAdmin) return { ok: false, isSuper: false };
  const { data: isSuper } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "super_admin",
  });
  return { ok: true, isSuper: Boolean(isSuper) };
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [users, pendingDep, pendingWd, openTickets, deposits30, withdrawals30] =
      await Promise.all([
        supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("deposits").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabaseAdmin.from("withdrawals").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabaseAdmin.from("support_tickets").select("id", { count: "exact", head: true }).in("status", ["open", "pending"]),
        supabaseAdmin
          .from("deposits")
          .select("amount,currency,status,created_at")
          .eq("status", "approved")
          .gte("created_at", new Date(Date.now() - 30 * 864e5).toISOString()),
        supabaseAdmin
          .from("withdrawals")
          .select("amount,currency,status,created_at")
          .eq("status", "approved")
          .gte("created_at", new Date(Date.now() - 30 * 864e5).toISOString()),
      ]);
    const sum = (rows: any[] | null) =>
      (rows ?? []).reduce((a, r) => a + Number(r.amount || 0), 0);
    return {
      users: users.count ?? 0,
      pendingDeposits: pendingDep.count ?? 0,
      pendingWithdrawals: pendingWd.count ?? 0,
      openTickets: openTickets.count ?? 0,
      depositsApproved30d: sum(deposits30.data),
      withdrawalsApproved30d: sum(withdrawals30.data),
    };
  });

export const listUsersWithRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { search?: string } | undefined) => data ?? {})
  .handler(async ({ data, context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("profiles")
      .select("id,email,display_name,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.search && data.search.trim()) {
      const s = `%${data.search.trim()}%`;
      q = q.or(`email.ilike.${s},display_name.ilike.${s}`);
    }
    const { data: profiles, error } = await q;
    if (error) throw new Error(error.message);
    const ids = (profiles ?? []).map((p) => p.id);
    let rolesByUser: Record<string, AppRole[]> = {};
    if (ids.length) {
      const { data: roles } = await supabaseAdmin
        .from("user_roles")
        .select("user_id,role")
        .in("user_id", ids);
      (roles ?? []).forEach((r: { user_id: string; role: AppRole }) => {
        (rolesByUser[r.user_id] ??= []).push(r.role);
      });
    }
    return {
      isSuper: auth.isSuper,
      users: (profiles ?? []).map((p) => ({
        ...p,
        roles: rolesByUser[p.id] ?? [],
      })),
    };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; role: AppRole; grant: boolean }) => data)
  .handler(async ({ data, context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok) throw new Error("Forbidden");
    // Only super_admin can grant elevated roles
    const elevated: AppRole[] = ["super_admin", "admin"];
    if (elevated.includes(data.role) && !auth.isSuper) {
      throw new Error("Only super_admin can modify admin roles");
    }
    if (data.userId === context.userId && !data.grant && data.role === "super_admin") {
      throw new Error("Cannot revoke your own super_admin role");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.grant) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const listRecentAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("finance_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });