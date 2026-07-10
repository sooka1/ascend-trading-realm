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
    // Enrich with auth metadata (banned_until, last_sign_in_at, email_confirmed_at)
    const authMeta: Record<
      string,
      { banned_until: string | null; last_sign_in_at: string | null; email_confirmed_at: string | null }
    > = {};
    try {
      const { data: authList } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
      for (const u of authList?.users ?? []) {
        authMeta[u.id] = {
          banned_until: (u as any).banned_until ?? null,
          last_sign_in_at: u.last_sign_in_at ?? null,
          email_confirmed_at: u.email_confirmed_at ?? null,
        };
      }
    } catch {
      /* non-fatal */
    }
    return {
      isSuper: auth.isSuper,
      users: (profiles ?? []).map((p) => ({
        ...p,
        roles: rolesByUser[p.id] ?? [],
        banned_until: authMeta[p.id]?.banned_until ?? null,
        last_sign_in_at: authMeta[p.id]?.last_sign_in_at ?? null,
        email_confirmed_at: authMeta[p.id]?.email_confirmed_at ?? null,
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

// ---------------------------------------------------------------------------
// Phase 2 — Financial Operations
// ---------------------------------------------------------------------------

export const listSubscriptionsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { status?: string; search?: string } | undefined) => data ?? {},
  )
  .handler(async ({ data, context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("subscriptions")
      .select(
        "id,user_id,amount,currency,status,started_at,ends_at,created_at,packages(name,risk_level,lockup_months)",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.status && data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((rows ?? []).map((r: any) => r.user_id)));
    const profileMap: Record<string, { email: string | null; display_name: string | null }> = {};
    if (ids.length) {
      const { data: pr } = await supabaseAdmin
        .from("profiles")
        .select("id,email,display_name")
        .in("id", ids);
      (pr ?? []).forEach((p: any) => (profileMap[p.id] = p));
    }
    const term = (data.search ?? "").trim().toLowerCase();
    const enriched = (rows ?? []).map((r: any) => ({
      ...r,
      profile: profileMap[r.user_id] ?? null,
    }));
    const filtered = term
      ? enriched.filter((r) =>
          [r.profile?.email, r.profile?.display_name, r.packages?.name]
            .filter(Boolean)
            .some((v: string) => v.toLowerCase().includes(term)),
        )
      : enriched;
    const totals = {
      active: enriched.filter((r) => r.status === "active").length,
      pending: enriched.filter((r) => r.status === "pending").length,
      paused: enriched.filter((r) => r.status === "paused").length,
      closed: enriched.filter((r) => r.status === "closed").length,
      aum: enriched
        .filter((r) => r.status === "active")
        .reduce((a, r) => a + Number(r.amount || 0), 0),
    };
    return { rows: filtered, totals };
  });

export const setSubscriptionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { id: string; status: "active" | "pending" | "paused" | "closed" | "archived" }) => data,
  )
  .handler(async ({ data, context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: current } = await supabaseAdmin
      .from("subscriptions")
      .select("id,user_id,status,amount,currency")
      .eq("id", data.id)
      .maybeSingle();
    if (!current) throw new Error("Subscription not found");
    const patch: { status: string; started_at?: string; ends_at?: string } = { status: data.status };
    if (data.status === "active" && !(current as any).started_at) {
      patch.started_at = new Date().toISOString();
    }
    if (data.status === "closed" || data.status === "archived") {
      patch.ends_at = new Date().toISOString();
    }
    const { error } = await supabaseAdmin.from("subscriptions").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("finance_audit_log").insert({
      request_kind: "subscription",
      request_id: data.id,
      target_user_id: (current as any).user_id,
      admin_id: context.userId,
      action: `set_${data.status}`,
      from_status: (current as any).status,
      to_status: data.status,
      metadata: { amount: (current as any).amount, currency: (current as any).currency },
    });
    return { ok: true };
  });

export const listInvoicesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [subs, deposits] = await Promise.all([
      supabaseAdmin
        .from("subscriptions")
        .select("id,user_id,amount,currency,status,started_at,created_at,packages(name)")
        .order("created_at", { ascending: false })
        .limit(300),
      supabaseAdmin
        .from("deposits")
        .select("id,user_id,amount,currency,status,method,reference,created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(300),
    ]);
    const ids = Array.from(
      new Set([
        ...(subs.data ?? []).map((r: any) => r.user_id),
        ...(deposits.data ?? []).map((r: any) => r.user_id),
      ]),
    );
    const profileMap: Record<string, { email: string | null; display_name: string | null }> = {};
    if (ids.length) {
      const { data: pr } = await supabaseAdmin
        .from("profiles")
        .select("id,email,display_name")
        .in("id", ids);
      (pr ?? []).forEach((p: any) => (profileMap[p.id] = p));
    }
    const num = (id: string) => `INV-${id.slice(0, 8).toUpperCase()}`;
    const subInvoices = (subs.data ?? []).map((r: any) => ({
      id: r.id,
      number: num(r.id),
      kind: "subscription" as const,
      user_id: r.user_id,
      profile: profileMap[r.user_id] ?? null,
      description: r.packages?.name ?? "Investment package",
      amount: Number(r.amount),
      currency: r.currency,
      status: r.status === "active" ? "paid" : r.status === "pending" ? "due" : r.status,
      issued_at: r.started_at ?? r.created_at,
    }));
    const depInvoices = (deposits.data ?? []).map((r: any) => ({
      id: r.id,
      number: num(r.id),
      kind: "deposit" as const,
      user_id: r.user_id,
      profile: profileMap[r.user_id] ?? null,
      description: `Deposit · ${r.method}${r.reference ? " · " + r.reference : ""}`,
      amount: Number(r.amount),
      currency: r.currency,
      status: "paid" as const,
      issued_at: r.created_at,
    }));
    const rows = [...subInvoices, ...depInvoices].sort(
      (a, b) => +new Date(b.issued_at) - +new Date(a.issued_at),
    );
    const totals = {
      paid: rows.filter((r) => r.status === "paid").reduce((a, r) => a + r.amount, 0),
      due: rows.filter((r) => r.status === "due").reduce((a, r) => a + r.amount, 0),
      count: rows.length,
    };
    return { rows, totals };
  });

export const decidePaymentAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { kind: "deposit" | "withdrawal"; id: string; decision: "approved" | "rejected"; note?: string }) => {
      if (!data || (data.kind !== "deposit" && data.kind !== "withdrawal")) throw new Error("Invalid kind");
      if (!data.id || typeof data.id !== "string") throw new Error("Invalid id");
      if (data.decision !== "approved" && data.decision !== "rejected") throw new Error("Invalid decision");
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const table = data.kind === "deposit" ? "deposits" : "withdrawals";
    const patch: Record<string, unknown> = {
      status: data.decision,
      reviewed_at: new Date().toISOString(),
      reviewed_by: context.userId,
    };
    if (data.note) patch.review_note = data.note;
    const { data: row, error } = await supabaseAdmin
      .from(table)
      .update(patch)
      .eq("id", data.id)
      .select("id,user_id,amount,currency,status")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Record not found");
    // Notify investor
    await supabaseAdmin.from("notifications").insert({
      user_id: row.user_id,
      kind: `${data.kind}_${data.decision}`,
      title:
        data.decision === "approved"
          ? data.kind === "deposit"
            ? "تم اعتماد إيداعك"
            : "تم اعتماد طلب السحب"
          : data.kind === "deposit"
            ? "تم رفض إيداعك"
            : "تم رفض طلب السحب",
      body: `${row.amount} ${row.currency}${data.note ? " — " + data.note : ""}`,
    });
    return { ok: true };
  });

// ============================================================
// Role Permissions Matrix
// ============================================================

export const PERMISSION_CATALOG: Array<{
  key: string;
  group: string;
  label: string;
}> = [
  { key: "users.view", group: "المستخدمون", label: "عرض المستخدمين" },
  { key: "users.manage", group: "المستخدمون", label: "إدارة المستخدمين والأدوار" },
  { key: "finance.view", group: "المالية", label: "عرض العمليات المالية" },
  { key: "finance.approve", group: "المالية", label: "اعتماد الإيداع/السحب" },
  { key: "subscriptions.view", group: "الاشتراكات", label: "عرض الاشتراكات" },
  { key: "subscriptions.manage", group: "الاشتراكات", label: "إدارة الاشتراكات" },
  { key: "invoices.view", group: "المالية", label: "عرض الفواتير" },
  { key: "payments.view", group: "المالية", label: "عرض المدفوعات" },
  { key: "accounting.view", group: "المالية", label: "التقارير المحاسبية" },
  { key: "portfolios.view", group: "المحافظ", label: "عرض المحافظ" },
  { key: "portfolios.manage", group: "المحافظ", label: "إدارة المحافظ" },
  { key: "documents.view", group: "الوثائق", label: "عرض الوثائق" },
  { key: "support.view", group: "الدعم", label: "عرض تذاكر الدعم" },
  { key: "support.reply", group: "الدعم", label: "الرد على تذاكر الدعم" },
  { key: "audit.view", group: "الحوكمة", label: "سجل التدقيق" },
  { key: "analytics.view", group: "التحليلات", label: "لوحات التحليلات" },
  { key: "monitoring.view", group: "النظام", label: "مراقبة النظام" },
];

export const ROLES_FOR_MATRIX: AppRole[] = [
  "super_admin",
  "admin",
  "portfolio_manager",
  "compliance_officer",
  "finance",
  "support",
  "moderator",
  "investor",
  "user",
];

export const getRolePermissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok) throw new Error("Forbidden");
    const { data, error } = await context.supabase
      .from("role_permissions")
      .select("role,permission");
    if (error) throw new Error(error.message);
    const matrix: Record<string, string[]> = {};
    for (const r of ROLES_FOR_MATRIX) matrix[r] = [];
    for (const row of data ?? []) {
      if (!matrix[row.role]) matrix[row.role] = [];
      matrix[row.role].push(row.permission);
    }
    // super_admin implicitly has every permission
    matrix["super_admin"] = PERMISSION_CATALOG.map((p) => p.key);
    return {
      matrix,
      isSuper: auth.isSuper,
      catalog: PERMISSION_CATALOG,
      roles: ROLES_FOR_MATRIX,
    };
  });

export const setRolePermission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { role: AppRole; permission: string; grant: boolean }) => data,
  )
  .handler(async ({ data, context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok || !auth.isSuper)
      throw new Error("يتطلب صلاحية super_admin");
    if (data.role === "super_admin")
      throw new Error("super_admin يمتلك كل الصلاحيات ضمنيًا");
    if (!PERMISSION_CATALOG.some((p) => p.key === data.permission))
      throw new Error("صلاحية غير معروفة");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.grant) {
      const { error } = await supabaseAdmin
        .from("role_permissions")
        .upsert(
          { role: data.role, permission: data.permission },
          { onConflict: "role,permission" },
        );
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("role_permissions")
        .delete()
        .eq("role", data.role)
        .eq("permission", data.permission);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// User lifecycle management — invite, suspend, activate, reset password.
// ---------------------------------------------------------------------------

export const inviteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { email: string; displayName?: string; role?: AppRole }) => data,
  )
  .handler(async ({ data, context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok) throw new Error("Forbidden");
    const email = data.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
    const role = data.role ?? "user";
    const elevated: AppRole[] = ["super_admin", "admin"];
    if (elevated.includes(role) && !auth.isSuper) {
      throw new Error("Only super_admin can invite admin roles");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: data.displayName ? { display_name: data.displayName } : undefined,
    });
    if (error) throw new Error(error.message);
    const uid = invited?.user?.id;
    if (uid && role !== "user") {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: uid, role }, { onConflict: "user_id,role" });
    }
    return { ok: true, userId: uid ?? null };
  });

export const setUserBanned = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; banned: boolean }) => data)
  .handler(async ({ data, context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok) throw new Error("Forbidden");
    if (data.userId === context.userId) throw new Error("Cannot suspend your own account");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      ban_duration: data.banned ? "876000h" : "none",
    } as any);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sendPasswordReset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ data, context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok) throw new Error("Forbidden");
    const email = data.email.trim().toLowerCase();
    if (!email) throw new Error("Email required");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteUserAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data, context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok || !auth.isSuper) throw new Error("Only super_admin can delete users");
    if (data.userId === context.userId) throw new Error("Cannot delete your own account");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listPaymentsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { status?: string } | undefined) => data ?? {})
  .handler(async ({ data, context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let dq = supabaseAdmin
      .from("deposits")
      .select("id,user_id,amount,currency,method,reference,status,created_at,reviewed_at")
      .order("created_at", { ascending: false })
      .limit(300);
    let wq = supabaseAdmin
      .from("withdrawals")
      .select("id,user_id,amount,currency,destination,iban,status,created_at,reviewed_at")
      .order("created_at", { ascending: false })
      .limit(300);
    if (data.status && data.status !== "all") {
      dq = dq.eq("status", data.status);
      wq = wq.eq("status", data.status);
    }
    const [deps, wds] = await Promise.all([dq, wq]);
    const ids = Array.from(
      new Set([
        ...(deps.data ?? []).map((r: any) => r.user_id),
        ...(wds.data ?? []).map((r: any) => r.user_id),
      ]),
    );
    const profileMap: Record<string, { email: string | null; display_name: string | null }> = {};
    if (ids.length) {
      const { data: pr } = await supabaseAdmin
        .from("profiles")
        .select("id,email,display_name")
        .in("id", ids);
      (pr ?? []).forEach((p: any) => (profileMap[p.id] = p));
    }
    const rows = [
      ...(deps.data ?? []).map((r: any) => ({
        id: r.id,
        kind: "deposit" as const,
        user_id: r.user_id,
        profile: profileMap[r.user_id] ?? null,
        amount: Number(r.amount),
        currency: r.currency,
        method: r.method,
        reference: r.reference,
        status: r.status,
        created_at: r.created_at,
        reviewed_at: r.reviewed_at,
      })),
      ...(wds.data ?? []).map((r: any) => ({
        id: r.id,
        kind: "withdrawal" as const,
        user_id: r.user_id,
        profile: profileMap[r.user_id] ?? null,
        amount: Number(r.amount),
        currency: r.currency,
        method: r.destination,
        reference: r.iban,
        status: r.status,
        created_at: r.created_at,
        reviewed_at: r.reviewed_at,
      })),
    ].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    const totals = {
      inflow: rows
        .filter((r) => r.kind === "deposit" && r.status === "approved")
        .reduce((a, r) => a + r.amount, 0),
      outflow: rows
        .filter((r) => r.kind === "withdrawal" && r.status === "approved")
        .reduce((a, r) => a + r.amount, 0),
      pending: rows.filter((r) => r.status === "pending").length,
      failed: rows.filter((r) => r.status === "rejected").length,
    };
    return { rows, totals };
  });

export const getAccountingSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const auth = await assertAdmin(context);
    if (!auth.ok) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = daysAgoISO(365);
    const [subs, deps, wds] = await Promise.all([
      supabaseAdmin
        .from("subscriptions")
        .select("amount,currency,status,started_at,created_at")
        .gte("created_at", since),
      supabaseAdmin
        .from("deposits")
        .select("amount,currency,status,created_at")
        .eq("status", "approved")
        .gte("created_at", since),
      supabaseAdmin
        .from("withdrawals")
        .select("amount,currency,status,created_at")
        .eq("status", "approved")
        .gte("created_at", since),
    ]);
    const monthKey = (iso: string) => iso.slice(0, 7);
    const months = new Map<
      string,
      { month: string; revenue: number; expenses: number; net: number; subscriptions: number }
    >();
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = d.toISOString().slice(0, 7);
      months.set(k, { month: k, revenue: 0, expenses: 0, net: 0, subscriptions: 0 });
    }
    for (const r of subs.data ?? []) {
      const k = monthKey((r as any).started_at ?? (r as any).created_at);
      const bucket = months.get(k);
      if (!bucket) continue;
      bucket.revenue += Number((r as any).amount || 0);
      bucket.subscriptions += 1;
    }
    for (const r of deps.data ?? []) {
      const k = monthKey((r as any).created_at);
      const bucket = months.get(k);
      if (!bucket) continue;
      bucket.revenue += Number((r as any).amount || 0);
    }
    for (const r of wds.data ?? []) {
      const k = monthKey((r as any).created_at);
      const bucket = months.get(k);
      if (!bucket) continue;
      bucket.expenses += Number((r as any).amount || 0);
    }
    const rows = Array.from(months.values()).map((m) => ({
      ...m,
      net: m.revenue - m.expenses,
    }));
    const totals = rows.reduce(
      (acc, r) => ({
        revenue: acc.revenue + r.revenue,
        expenses: acc.expenses + r.expenses,
        net: acc.net + r.net,
        subscriptions: acc.subscriptions + r.subscriptions,
      }),
      { revenue: 0, expenses: 0, net: 0, subscriptions: 0 },
    );
    return { rows, totals };
  });