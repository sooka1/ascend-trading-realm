import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell, AdminCard, AdminKpi, StatusPill } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  listUsersWithRoles,
  setUserRole,
  inviteUser,
  setUserBanned,
  sendPasswordReset,
  deleteUserAccount,
} from "@/lib/admin.functions";
import type { AppRole } from "@/lib/rbac.functions";
import { toast } from "sonner";
import {
  Search,
  ShieldCheck,
  X,
  Plus,
  UserPlus,
  KeyRound,
  Ban,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const invite = useServerFn(inviteUser);
  const banFn = useServerFn(setUserBanned);
  const resetFn = useServerFn(sendPasswordReset);
  const delFn = useServerFn(deleteUserAccount);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended" | "pending">("all");
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "users", query],
    queryFn: () => list({ data: { search: query } }),
    staleTime: 15_000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "users"] });

  async function toggle(userId: string, role: AppRole, grant: boolean) {
    try {
      await mutate({ data: { userId, role, grant } });
      toast.success(grant ? `تم منح ${role}` : `تم سحب ${role}`);
      invalidate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function handleSuspend(userId: string, banned: boolean) {
    try {
      await banFn({ data: { userId, banned } });
      toast.success(banned ? "تم تعليق المستخدم" : "تم تفعيل المستخدم");
      invalidate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function handleReset(email: string | null) {
    if (!email) return toast.error("لا يوجد بريد إلكتروني");
    try {
      await resetFn({ data: { email } });
      toast.success("تم إرسال رابط إعادة تعيين كلمة المرور");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm("هل تريد حذف هذا المستخدم نهائيًا؟")) return;
    try {
      await delFn({ data: { userId } });
      toast.success("تم حذف المستخدم");
      invalidate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const users = data?.users ?? [];
  const filtered = users.filter((u: any) => {
    if (statusFilter === "all") return true;
    const isBanned = u.banned_until && new Date(u.banned_until).getTime() > Date.now();
    const isPending = !u.email_confirmed_at;
    if (statusFilter === "suspended") return isBanned;
    if (statusFilter === "pending") return isPending && !isBanned;
    if (statusFilter === "active") return !isBanned && !isPending;
    return true;
  });

  const kpis = {
    total: users.length,
    active: users.filter(
      (u: any) =>
        u.email_confirmed_at &&
        !(u.banned_until && new Date(u.banned_until).getTime() > Date.now()),
    ).length,
    suspended: users.filter(
      (u: any) => u.banned_until && new Date(u.banned_until).getTime() > Date.now(),
    ).length,
    pending: users.filter((u: any) => !u.email_confirmed_at).length,
  };

  return (
    <AdminShell
      eyebrow="Admin"
      title="إدارة المستخدمين"
      subtitle={
        data?.isSuper
          ? "لديك صلاحية super_admin — يمكنك إدارة جميع الأدوار والحسابات."
          : "يمكنك تعديل الأدوار غير الإدارية فقط."
      }
      actions={
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" /> دعوة مستخدم
            </Button>
          </DialogTrigger>
          <InviteDialog
            onClose={() => setInviteOpen(false)}
            isSuper={data?.isSuper ?? false}
            onSubmit={async (payload) => {
              try {
                await invite({ data: payload });
                toast.success("تم إرسال الدعوة");
                setInviteOpen(false);
                invalidate();
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
          />
        </Dialog>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpi label="إجمالي المستخدمين" value={String(kpis.total)} />
        <AdminKpi label="نشط" value={String(kpis.active)} tone="positive" />
        <AdminKpi label="بانتظار التفعيل" value={String(kpis.pending)} tone="warning" />
        <AdminKpi label="معلّق" value={String(kpis.suspended)} tone="critical" />
      </div>

      <AdminCard title="قائمة المستخدمين" className="mt-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search);
          }}
          className="flex flex-wrap gap-2"
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm"
          >
            <option value="all" className="bg-black">الكل</option>
            <option value="active" className="bg-black">نشط</option>
            <option value="pending" className="bg-black">بانتظار التفعيل</option>
            <option value="suspended" className="bg-black">معلّق</option>
          </select>
          <Button type="submit" variant="outline">بحث</Button>
        </form>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            تعذّر التحميل: {(error as Error).message}
          </div>
        ) : null}

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start">المستخدم</th>
                  <th className="px-4 py-3 text-start">الحالة</th>
                  <th className="px-4 py-3 text-start">الأدوار الحالية</th>
                  <th className="px-4 py-3 text-end">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                      جارٍ التحميل…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                      لا توجد نتائج.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u: any) => {
                    const isBanned =
                      u.banned_until && new Date(u.banned_until).getTime() > Date.now();
                    const isPending = !u.email_confirmed_at;
                    const statusTone: "positive" | "warning" | "critical" = isBanned
                      ? "critical"
                      : isPending
                        ? "warning"
                        : "positive";
                    const statusLabel = isBanned
                      ? "معلّق"
                      : isPending
                        ? "بانتظار التفعيل"
                        : "نشط";
                    return (
                      <tr key={u.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium">{u.display_name ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">
                            {u.email ?? u.id.slice(0, 8)}
                          </div>
                          {u.last_sign_in_at ? (
                            <div className="mt-0.5 text-[10px] text-muted-foreground">
                              آخر دخول: {new Date(u.last_sign_in_at).toLocaleDateString("ar")}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {u.roles.length === 0 ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              u.roles.map((r: AppRole) => (
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
                            <AddRole
                              existing={u.roles}
                              onAdd={(r) => toggle(u.id, r, true)}
                              isSuper={data?.isSuper ?? false}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <div className="inline-flex flex-wrap justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReset(u.email)}
                              title="إرسال رابط إعادة تعيين كلمة المرور"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                            </Button>
                            {isBanned ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSuspend(u.id, false)}
                                title="تفعيل"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSuspend(u.id, true)}
                                title="تعليق"
                              >
                                <Ban className="h-3.5 w-3.5 text-amber-400" />
                              </Button>
                            )}
                            {data?.isSuper ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(u.id)}
                                title="حذف"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminCard>
    </AdminShell>
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
        className="rounded-lg border border-white/10 bg-transparent px-2 py-0.5 text-[11px]"
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
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}

function InviteDialog({
  onClose,
  onSubmit,
  isSuper,
}: {
  onClose: () => void;
  onSubmit: (payload: { email: string; displayName?: string; role?: AppRole }) => Promise<void>;
  isSuper: boolean;
}) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<AppRole>("user");
  const [busy, setBusy] = useState(false);
  const options = ROLE_OPTIONS.filter((r) => isSuper || !["super_admin", "admin"].includes(r));
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>دعوة مستخدم جديد</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">البريد الإلكتروني</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">الاسم (اختياري)</label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">الدور</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AppRole)}
            className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm"
          >
            {options.map((r) => (
              <option key={r} value={r} className="bg-black">
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={busy}>
          إلغاء
        </Button>
        <Button
          disabled={busy || !email.trim()}
          onClick={async () => {
            setBusy(true);
            try {
              await onSubmit({
                email: email.trim(),
                displayName: displayName.trim() || undefined,
                role,
              });
            } finally {
              setBusy(false);
            }
          }}
        >
          إرسال الدعوة
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}