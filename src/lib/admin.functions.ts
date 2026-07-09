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

// ---------------------------------------------------------------------------
// Executive Dashboard — richer aggregates for the Super Admin control center.
// ---------------------------------------------------------------------------

function daysAgoISO(days: number) {
  return new Date(Date.now() - days * 864e5).toISOString();
}

function bucketByDay(rows: Array<{ created_at: string; amount?: number | null }>, days: number) {
  const out: { date: string; total: number; count: number }[] = [];
  const map = new Map<string, { total: number; count: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
    map.set(d, { total: 0, count: 0 });
  }
  for (const r of rows) {
    const key = (r.created_at ?? "").slice(0, 10);
    const cur = map.get(key);
    if (!cur) continue;
    cur.total += Number(r.amount ?? 0);
    cur.count += 1;
  }
  for (const [date, v] of map) out.push({ date, ...v });
  return out;
}

export const getExecutiveDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const since30 = daysAgoISO(30);
    const since7 = daysAgoISO(7);

    const [
      users,
      newUsers30,
      newUsers7,
      activeSubs,
      totalSubs,
      pendingDep,
      pendingWd,
      openTickets,
      deposits30,
      withdrawals30,
      subscriptions30,
      activityFeed,
      recentRequests,
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since30),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since7),
      supabaseAdmin.from("subscriptions").select("id,amount,currency", { count: "exact" }).eq("status", "active"),
      supabaseAdmin.from("subscriptions").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("deposits").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("withdrawals").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("support_tickets").select("id", { count: "exact", head: true }).in("status", ["open", "pending"]),
      supabaseAdmin
        .from("deposits")
        .select("amount,currency,status,created_at")
        .eq("status", "approved")
        .gte("created_at", since30),
      supabaseAdmin
        .from("withdrawals")
        .select("amount,currency,status,created_at")
        .eq("status", "approved")
        .gte("created_at", since30),
      supabaseAdmin
        .from("subscriptions")
        .select("amount,currency,started_at,status")
        .gte("started_at", since30),
      supabaseAdmin
        .from("finance_audit_log")
        .select("id,action,entity,entity_id,actor_id,created_at,metadata")
        .order("created_at", { ascending: false })
        .limit(20),
      supabaseAdmin
        .from("investment_requests")
        .select("id,amount,currency,status,created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    const sum = (rows: any[] | null) => (rows ?? []).reduce((a, r) => a + Number(r.amount || 0), 0);
    const aum = sum(activeSubs.data);

    return {
      totals: {
        users: users.count ?? 0,
        newUsers30d: newUsers30.count ?? 0,
        newUsers7d: newUsers7.count ?? 0,
        activeSubscriptions: activeSubs.count ?? 0,
        totalSubscriptions: totalSubs.count ?? 0,
        aum,
        pendingDeposits: pendingDep.count ?? 0,
        pendingWithdrawals: pendingWd.count ?? 0,
        openTickets: openTickets.count ?? 0,
        depositsApproved30d: sum(deposits30.data),
        withdrawalsApproved30d: sum(withdrawals30.data),
        newCapital30d: sum(subscriptions30.data as any[]),
      },
      series: {
        deposits: bucketByDay(deposits30.data ?? [], 30),
        withdrawals: bucketByDay(withdrawals30.data ?? [], 30),
        subscriptions: bucketByDay(
          (subscriptions30.data ?? []).map((r: any) => ({
            created_at: r.started_at,
            amount: r.amount,
          })),
          30,
        ),
      },
      activity: activityFeed.data ?? [],
      recentRequests: recentRequests.data ?? [],
    };
  });

export const getPlatformAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [profiles, subs, tickets, audit90] = await Promise.all([
      supabaseAdmin.from("profiles").select("id,created_at"),
      supabaseAdmin.from("subscriptions").select("id,status,amount,started_at,ends_at"),
      supabaseAdmin.from("support_tickets").select("id,status,created_at"),
      supabaseAdmin
        .from("finance_audit_log")
        .select("actor_id,created_at")
        .gte("created_at", daysAgoISO(90)),
    ]);

    const now = Date.now();
    const day = 864e5;
    const activeActors = (rangeDays: number) => {
      const cutoff = now - rangeDays * day;
      const set = new Set<string>();
      (audit90.data ?? []).forEach((r: any) => {
        if (r.actor_id && new Date(r.created_at).getTime() >= cutoff) set.add(r.actor_id);
      });
      return set.size;
    };

    const growth: { date: string; users: number }[] = [];
    const profileRows = (profiles.data ?? []).slice().sort(
      (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    let running = 0;
    let idx = 0;
    for (let i = 89; i >= 0; i--) {
      const cutoff = new Date(now - i * day);
      const key = cutoff.toISOString().slice(0, 10);
      while (idx < profileRows.length && new Date(profileRows[idx].created_at) <= cutoff) {
        running++;
        idx++;
      }
      growth.push({ date: key, users: running });
    }

    const subsRows = subs.data ?? [];
    const subByStatus: Record<string, number> = {};
    for (const s of subsRows as any[]) subByStatus[s.status] = (subByStatus[s.status] ?? 0) + 1;
    const churn =
      subsRows.length > 0
        ? ((subByStatus["closed"] ?? 0) + (subByStatus["cancelled"] ?? 0)) / subsRows.length
        : 0;

    const ticketsRows = tickets.data ?? [];
    const ticketByStatus: Record<string, number> = {};
    for (const t of ticketsRows as any[]) ticketByStatus[t.status] = (ticketByStatus[t.status] ?? 0) + 1;

    return {
      dau: activeActors(1),
      wau: activeActors(7),
      mau: activeActors(30),
      totalUsers: (profiles.data ?? []).length,
      churn,
      subByStatus,
      ticketByStatus,
      growth,
    };
  });

export const getSystemMonitoring = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const started = Date.now();
    // Response-time probe: a light COUNT against a small table.
    const probe = await supabaseAdmin.from("user_roles").select("user_id", { count: "exact", head: true });
    const dbLatency = Date.now() - started;

    const tables = [
      "profiles",
      "subscriptions",
      "deposits",
      "withdrawals",
      "investment_requests",
      "support_tickets",
      "notifications",
      "documents",
      "finance_audit_log",
    ] as const;
    const counts = await Promise.all(
      tables.map((t) =>
        supabaseAdmin.from(t).select("id", { count: "exact", head: true }).then((r) => ({
          table: t,
          count: r.count ?? 0,
          error: r.error?.message ?? null,
        })),
      ),
    );

    // Storage: list first 1000 objects; sum size where present.
    let storageObjects = 0;
    let storageBytes = 0;
    try {
      const { data: objs } = await supabaseAdmin.storage.from("documents").list("", {
        limit: 1000,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (objs) {
        storageObjects = objs.length;
        for (const o of objs) {
          const size = (o as any).metadata?.size;
          if (typeof size === "number") storageBytes += size;
        }
      }
    } catch {
      /* bucket may not exist yet */
    }

    // Error rate proxy: audit rows with action ending in "_failed" over 24h vs total.
    const since24 = daysAgoISO(1);
    const [totalAudit, failedAudit] = await Promise.all([
      supabaseAdmin.from("finance_audit_log").select("id", { count: "exact", head: true }).gte("created_at", since24),
      supabaseAdmin.from("finance_audit_log").select("id", { count: "exact", head: true }).gte("created_at", since24).ilike("action", "%failed%"),
    ]);

    return {
      dbHealthy: !probe.error,
      dbLatencyMs: dbLatency,
      dbError: probe.error?.message ?? null,
      tables: counts,
      storage: { objects: storageObjects, bytes: storageBytes },
      errors24h: {
        total: totalAudit.count ?? 0,
        failed: failedAudit.count ?? 0,
        rate:
          (totalAudit.count ?? 0) > 0
            ? (failedAudit.count ?? 0) / (totalAudit.count ?? 1)
            : 0,
      },
      generatedAt: new Date().toISOString(),
    };
  });