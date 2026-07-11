import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const uuid = z.string().uuid();

// -------- Public / user --------

export const listActiveMasters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("copy_masters")
      .select("id,name,bio,avatar_url,risk_level,min_capital,performance_fee_pct,total_return_pct,is_active")
      .eq("is_active", true)
      .order("total_return_pct", { ascending: false });
    if (error) throw new Error(error.message);
    return { masters: data ?? [] };
  });

export const getMyCopyState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: subs } = await context.supabase
      .from("copy_subscriptions")
      .select("*, copy_masters(name,risk_level)")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    const { data: fills } = await context.supabase
      .from("copy_trade_fills")
      .select("*, copy_master_trades(symbol,side,entry_price,exit_price,opened_at,closed_at)")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    return { subscriptions: subs ?? [], fills: fills ?? [] };
  });

export const subscribeToMaster = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { masterId: string; amount: number }) =>
    z.object({ masterId: uuid, amount: z.number().positive().max(10_000_000) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase.rpc("subscribe_to_master", {
      _master_id: data.masterId,
      _amount: data.amount,
    });
    if (error) throw new Error(error.message);
    return res as { ok: boolean; needs_deposit?: boolean; available?: number; shortfall?: number; subscription_id?: string };
  });

export const updateMyCopySubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: "active" | "paused" | "closed" }) =>
    z.object({ id: uuid, status: z.enum(["active", "paused", "closed"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const patch: { status: "active" | "paused" | "closed"; closed_at?: string } = { status: data.status };
    if (data.status === "closed") patch.closed_at = new Date().toISOString();
    const { error } = await context.supabase
      .from("copy_subscriptions")
      .update(patch)
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    await context.supabase.from("copy_audit_log").insert({
      actor_id: context.userId,
      target_user_id: context.userId,
      event: `sub_${data.status}`,
      payload: { subscription_id: data.id },
    });
    return { ok: true };
  });

// -------- Super-admin only --------

async function assertSuperAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "super_admin" });
  if (!data) throw new Error("Forbidden: super_admin only");
}

export const adminListMasters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    const { data, error } = await context.supabase
      .from("copy_masters")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { masters: data ?? [] };
  });

export const adminUpsertMaster = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    id?: string;
    name: string;
    bio?: string;
    risk_level: "low" | "medium" | "high";
    min_capital: number;
    performance_fee_pct: number;
    is_active: boolean;
  }) =>
    z
      .object({
        id: uuid.optional(),
        name: z.string().trim().min(2).max(100),
        bio: z.string().max(2000).optional(),
        risk_level: z.enum(["low", "medium", "high"]),
        min_capital: z.number().nonnegative().max(10_000_000),
        performance_fee_pct: z.number().min(0).max(100),
        is_active: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    if (data.id) {
      const { error } = await context.supabase
        .from("copy_masters")
        .update({
          name: data.name,
          bio: data.bio ?? null,
          risk_level: data.risk_level,
          min_capital: data.min_capital,
          performance_fee_pct: data.performance_fee_pct,
          is_active: data.is_active,
        })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("copy_masters")
      .insert({
        name: data.name,
        bio: data.bio ?? null,
        risk_level: data.risk_level,
        min_capital: data.min_capital,
        performance_fee_pct: data.performance_fee_pct,
        is_active: data.is_active,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

export const adminListSubscriptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { status?: string }) => ({ status: data?.status ?? "all" }))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    let q = context.supabase
      .from("copy_subscriptions")
      .select("*, copy_masters(name)")
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.status && data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { subscriptions: rows ?? [] };
  });

export const adminSetSubscriptionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: "active" | "paused" | "closed" }) =>
    z.object({ id: uuid, status: z.enum(["active", "paused", "closed"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const patch: { status: "active" | "paused" | "closed"; closed_at?: string } = { status: data.status };
    if (data.status === "closed") patch.closed_at = new Date().toISOString();
    const { error } = await context.supabase
      .from("copy_subscriptions")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await context.supabase.from("copy_audit_log").insert({
      actor_id: context.userId,
      event: `admin_sub_${data.status}`,
      payload: { subscription_id: data.id },
    });
    return { ok: true };
  });

export const adminOpenMasterTrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    master_id: string;
    symbol: string;
    side: "buy" | "sell";
    entry_price: number;
    volume: number;
  }) =>
    z
      .object({
        master_id: uuid,
        symbol: z.string().trim().min(1).max(20),
        side: z.enum(["buy", "sell"]),
        entry_price: z.number().positive(),
        volume: z.number().positive(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { data: row, error } = await context.supabase
      .from("copy_master_trades")
      .insert({
        master_id: data.master_id,
        symbol: data.symbol.toUpperCase(),
        side: data.side,
        entry_price: data.entry_price,
        volume: data.volume,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await context.supabase.from("copy_audit_log").insert({
      actor_id: context.userId,
      event: "open_master_trade",
      payload: { trade_id: row.id, ...data },
    });
    return { ok: true, id: row.id };
  });

export const adminCloseMasterTrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { trade_id: string; exit_price: number }) =>
    z.object({ trade_id: uuid, exit_price: z.number().positive() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase.rpc("close_master_trade", {
      _trade_id: data.trade_id,
      _exit_price: data.exit_price,
    });
    if (error) throw new Error(error.message);
    return res as { ok: boolean; affected: number; pnl_pct: number };
  });

export const adminListMasterTrades = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    const { data, error } = await context.supabase
      .from("copy_master_trades")
      .select("*, copy_masters(name)")
      .order("opened_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { trades: data ?? [] };
  });

export const adminAdjustBalance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { user_email: string; delta: number; reason: string }) =>
    z
      .object({
        user_email: z.string().trim().toLowerCase().email().max(255),
        delta: z
          .number()
          .min(-1_000_000)
          .max(1_000_000)
          .refine((n) => n !== 0, "Delta must be non-zero"),
        reason: z.string().trim().min(3).max(500),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (listErr) throw new Error(listErr.message);
    const user = list.users.find((u) => (u.email ?? "").toLowerCase() === data.user_email);
    if (!user) throw new Error("لم يتم العثور على مستخدم بهذا البريد");
    const { data: res, error } = await context.supabase.rpc("admin_adjust_balance", {
      _user_id: user.id,
      _delta: data.delta,
      _reason: data.reason,
    });
    if (error) throw new Error(error.message);
    return res as { ok: boolean };
  });

export const adminReadAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    const { data, error } = await context.supabase
      .from("copy_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { events: data ?? [] };
  });