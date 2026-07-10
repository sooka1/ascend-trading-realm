import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AppRole } from "@/lib/rbac.functions";

const ALL_ROLES: AppRole[] = [
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

async function assertSuper(context: { supabase: any; userId: string }) {
  const { data: isSuper } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "super_admin",
  });
  if (!isSuper) throw new Error("Forbidden: super_admin only");
}

export const lookupUserByEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string }) => {
    const email = String(data.email ?? "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      throw new Error("بريد إلكتروني غير صالح");
    }
    return { email };
  })
  .handler(async ({ data, context }) => {
    await assertSuper(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Find user by email via admin API (paginated search)
    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (error) throw new Error(error.message);
    const user = list.users.find((u) => (u.email ?? "").toLowerCase() === data.email);
    if (!user) return { found: false as const };
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    return {
      found: true as const,
      userId: user.id,
      email: user.email,
      roles: (roles ?? []).map((r) => r.role as AppRole),
    };
  });

export const updateUserRoles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string; roles: AppRole[] }) => {
    const email = String(data.email ?? "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("بريد إلكتروني غير صالح");
    }
    const roles = Array.isArray(data.roles) ? data.roles : [];
    for (const r of roles) {
      if (!ALL_ROLES.includes(r)) throw new Error(`دور غير معروف: ${r}`);
    }
    return { email, roles: Array.from(new Set(roles)) as AppRole[] };
  })
  .handler(async ({ data, context }) => {
    await assertSuper(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) throw new Error(listErr.message);
    const user = list.users.find((u) => (u.email ?? "").toLowerCase() === data.email);
    if (!user) throw new Error("لم يتم العثور على مستخدم بهذا البريد");

    // Prevent removing your own super_admin (avoid lockout)
    if (user.id === context.userId && !data.roles.includes("super_admin")) {
      const { data: mine } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .maybeSingle();
      if (mine) throw new Error("لا يمكنك إزالة دور super_admin عن حسابك");
    }

    // Replace roles: delete all then insert the new set
    const { error: delErr } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", user.id);
    if (delErr) throw new Error(delErr.message);

    if (data.roles.length > 0) {
      const rows = data.roles.map((role) => ({ user_id: user.id, role }));
      const { error: insErr } = await supabaseAdmin.from("user_roles").insert(rows);
      if (insErr) throw new Error(insErr.message);
    }

    return { ok: true, userId: user.id, roles: data.roles };
  });

export const ROLE_OPTIONS = ALL_ROLES;

export const setUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string; password: string }) => {
    const email = String(data.email ?? "").trim().toLowerCase();
    const password = String(data.password ?? "");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("بريد إلكتروني غير صالح");
    }
    if (password.length < 8) {
      throw new Error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
    }
    return { email, password };
  })
  .handler(async ({ data, context }) => {
    await assertSuper(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) throw new Error(listErr.message);
    const user = list.users.find((u) => (u.email ?? "").toLowerCase() === data.email);
    if (!user) throw new Error("لم يتم العثور على مستخدم بهذا البريد");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: data.password,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });