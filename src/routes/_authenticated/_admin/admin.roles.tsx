import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell, AdminCard, StatusPill } from "@/components/admin-shell";
import { getRolePermissions, setRolePermission } from "@/lib/admin.functions";
import type { AppRole } from "@/lib/rbac.functions";
import { Check, Lock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/roles")({
  head: () => ({
    meta: [
      { title: "Admin — Roles & Permissions" },
      {
        name: "description",
        content: "Granular permission matrix for platform roles.",
      },
    ],
  }),
  component: AdminRoles,
});

function AdminRoles() {
  const fetchFn = useServerFn(getRolePermissions);
  const mutateFn = useServerFn(setRolePermission);
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "role-permissions"],
    queryFn: () => fetchFn(),
    staleTime: 30_000,
  });

  const groups = useMemo(() => {
    const map = new Map<string, typeof data extends { catalog: infer C } ? C : never>();
    const cat = data?.catalog ?? [];
    const out: Record<string, typeof cat> = {};
    for (const p of cat) {
      if (!out[p.group]) out[p.group] = [] as typeof cat;
      (out[p.group] as typeof cat).push(p);
    }
    void map;
    return out;
  }, [data]);

  async function toggle(role: AppRole, permission: string, grant: boolean) {
    if (role === "super_admin") return;
    const key = `${role}:${permission}`;
    setBusy(key);
    try {
      await mutateFn({ data: { role, permission, grant } });
      toast.success(grant ? "تم منح الصلاحية" : "تم سحب الصلاحية");
      qc.invalidateQueries({ queryKey: ["admin", "role-permissions"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const roles = data?.roles ?? [];
  const matrix = data?.matrix ?? {};
  const isSuper = data?.isSuper ?? false;

  return (
    <AdminShell
      eyebrow="Admin"
      title="الأدوار والصلاحيات"
      subtitle={
        isSuper
          ? "قم بتفعيل/تعطيل الصلاحيات لكل دور. تُطبَّق التغييرات فورًا على جميع المستخدمين."
          : "عرض للقراءة فقط — يتطلب التعديل صلاحية super_admin."
      }
    >
      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          تعذّر التحميل: {(error as Error).message}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-card/50 p-10 text-center text-sm text-muted-foreground">
          جارٍ التحميل…
        </div>
      ) : (
        Object.entries(groups).map(([groupName, perms]) => (
          <AdminCard key={groupName} title={groupName} className="mb-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-widest text-muted-foreground">
                    <th className="px-3 py-2 text-start">الصلاحية</th>
                    {roles.map((r) => (
                      <th key={r} className="px-2 py-2 text-center font-mono text-[10px]">
                        <div className="flex flex-col items-center gap-1">
                          {r === "super_admin" ? (
                            <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                          ) : null}
                          <span>{r}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {perms.map((p) => (
                    <tr key={p.key}>
                      <td className="px-3 py-2">
                        <div className="font-medium">{p.label}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          {p.key}
                        </div>
                      </td>
                      {roles.map((r) => {
                        const granted =
                          r === "super_admin" ||
                          (matrix[r] ?? []).includes(p.key);
                        const locked = r === "super_admin" || !isSuper;
                        const key = `${r}:${p.key}`;
                        const isBusy = busy === key;
                        return (
                          <td key={r} className="px-2 py-2 text-center">
                            <button
                              type="button"
                              disabled={locked || isBusy}
                              onClick={() => toggle(r, p.key, !granted)}
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-md border transition ${
                                granted
                                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                                  : "border-white/10 bg-white/[0.02] text-muted-foreground"
                              } ${
                                locked
                                  ? "cursor-not-allowed opacity-70"
                                  : "hover:border-gold/40 hover:text-foreground"
                              }`}
                              title={
                                r === "super_admin"
                                  ? "super_admin يمتلك كل الصلاحيات"
                                  : granted
                                    ? "اضغط للسحب"
                                    : "اضغط للمنح"
                              }
                            >
                              {r === "super_admin" ? (
                                <Lock className="h-3.5 w-3.5" />
                              ) : granted ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <span className="text-xs">—</span>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        ))
      )}

      {!isSuper && !isLoading ? (
        <div className="mt-4">
          <StatusPill tone="warning">للقراءة فقط</StatusPill>
        </div>
      ) : null}
    </AdminShell>
  );
}