import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listUsersWithRoles, setUserRole } from "@/lib/admin.functions";
import type { AppRole } from "@/lib/rbac.functions";
import { toast } from "sonner";
import { Search, ShieldCheck, X, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/users")({
  head: () => ({
    meta: [
      { title: "Admin — Users & Roles" },
      { name: "description", content: "Manage users and assign platform roles." },
    ],
  }),
  component: AdminUsers,
});

const ROLE_OPTIONS: AppRole[] = [
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

function AdminUsers() {
  const list = useServerFn(listUsersWithRoles);
  const mutate = useServerFn(setUserRole);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "users", query],
    queryFn: () => list({ data: { search: query } }),
    staleTime: 15_000,
  });

  async function toggle(userId: string, role: AppRole, grant: boolean) {
    try {
      await mutate({ data: { userId, role, grant } });
      toast.success(grant ? `تم منح ${role}` : `تم سحب ${role}`);
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <PageShell bare>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-widest text-gold">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">إدارة المستخدمين والأدوار</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {data?.isSuper
            ? "لديك صلاحية super_admin لتعديل جميع الأدوار."
            : "يمكنك تعديل الأدوار غير الإدارية فقط."}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search);
          }}
          className="mt-6 flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالبريد أو الاسم…"
              className="ps-10"
            />
          </div>
          <Button type="submit" variant="outline">بحث</Button>
        </form>

        {error ? (
          <div className="glass mt-6 rounded-2xl p-6 text-sm text-red-300">
            تعذّر التحميل: {(error as Error).message}
          </div>
        ) : null}

        <div className="glass mt-6 overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start">المستخدم</th>
                  <th className="px-4 py-3 text-start">الأدوار الحالية</th>
                  <th className="px-4 py-3 text-end">إضافة دور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">
                      جارٍ التحميل…
                    </td>
                  </tr>
                ) : (data?.users.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">
                      لا توجد نتائج.
                    </td>
                  </tr>
                ) : (
                  data!.users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{u.display_name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{u.email ?? u.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {u.roles.length === 0 ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            u.roles.map((r) => (
                              <span
                                key={r}
                                className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[11px]"
                              >
                                <ShieldCheck className="h-3 w-3 text-gold" />
                                {r}
                                <button
                                  onClick={() => toggle(u.id, r, false)}
                                  className="ms-1 text-muted-foreground hover:text-red-300"
                                  title="سحب هذا الدور"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <AddRole
                          existing={u.roles}
                          onAdd={(r) => toggle(u.id, r, true)}
                          isSuper={data?.isSuper ?? false}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function AddRole({
  existing,
  onAdd,
  isSuper,
}: {
  existing: AppRole[];
  onAdd: (r: AppRole) => void;
  isSuper: boolean;
}) {
  const [pick, setPick] = useState<AppRole | "">("");
  const options = ROLE_OPTIONS.filter((r) => !existing.includes(r)).filter(
    (r) => isSuper || !["super_admin", "admin"].includes(r),
  );
  return (
    <div className="inline-flex items-center gap-2">
      <select
        value={pick}
        onChange={(e) => setPick(e.target.value as AppRole)}
        className="rounded-lg border border-white/10 bg-transparent px-2 py-1 text-xs"
      >
        <option value="">اختر دورًا…</option>
        {options.map((r) => (
          <option key={r} value={r} className="bg-black">
            {r}
          </option>
        ))}
      </select>
      <Button
        size="sm"
        variant="outline"
        disabled={!pick}
        onClick={() => {
          if (pick) {
            onAdd(pick);
            setPick("");
          }
        }}
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        إضافة
      </Button>
    </div>
  );
}