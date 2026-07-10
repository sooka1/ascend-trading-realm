import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminShell, AdminCard } from "@/components/admin-shell";
import {
  lookupUserByEmail,
  updateUserRoles,
  ROLE_OPTIONS,
  setUserPassword,
} from "@/lib/user-roles.functions";
import type { AppRole } from "@/lib/rbac.functions";
import {
  Search,
  Save,
  UserCog,
  KeyRound,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Wand2,
  Copy,
} from "lucide-react";

type Status = { kind: "success" | "error"; message: string } | null;

function StatusBanner({ status }: { status: Status }) {
  if (!status) return null;
  const ok = status.kind === "success";
  const Icon = ok ? CheckCircle2 : XCircle;
  return (
    <div
      className={`mt-4 flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
        ok
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
          : "border-red-400/40 bg-red-400/10 text-red-100"
      }`}
      role="status"
      aria-live="polite"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{status.message}</span>
    </div>
  );
}

function StepBadge({ n, label }: { n: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.06] px-3 py-1 text-xs text-foreground">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-gold/20 font-mono text-[10px] text-gold">
        {n}
      </span>
      {label}
    </span>
  );
}

function generateStrongPassword(len = 16) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%^&*_+-=?";
  const all = upper + lower + digits + symbols;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  for (let i = chars.length; i < len; i++) chars.push(pick(all));
  return chars.sort(() => Math.random() - 0.5).join("");
}

export const Route = createFileRoute("/_authenticated/_admin/admin/user-roles")({
  head: () => ({
    meta: [
      { title: "Admin — إدارة أدوار المستخدمين" },
      { name: "description", content: "تعيين وإزالة أدوار المستخدمين عبر البريد الإلكتروني." },
    ],
  }),
  component: AdminUserRoles,
});

function AdminUserRoles() {
  const lookup = useServerFn(lookupUserByEmail);
  const save = useServerFn(updateUserRoles);
  const savePassword = useServerFn(setUserPassword);

  const [email, setEmail] = useState("");
  const [loaded, setLoaded] = useState<{
    email: string;
    userId: string;
    initial: AppRole[];
  } | null>(null);
  const [selected, setSelected] = useState<Set<AppRole>>(new Set());
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchStatus, setSearchStatus] = useState<Status>(null);
  const [rolesStatus, setRolesStatus] = useState<Status>(null);
  const [passwordStatus, setPasswordStatus] = useState<Status>(null);

  async function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email.trim()) return;
    setSearching(true);
    setSearchStatus(null);
    setRolesStatus(null);
    setPasswordStatus(null);
    try {
      const r = await lookup({ data: { email } });
      if (!r.found) {
        setLoaded(null);
        setSelected(new Set());
        setSearchStatus({ kind: "error", message: "لم يتم العثور على مستخدم بهذا البريد." });
        return;
      }
      setLoaded({ email: r.email ?? email, userId: r.userId, initial: r.roles });
      setSelected(new Set(r.roles));
      setSearchStatus({
        kind: "success",
        message: `تم العثور على المستخدم — عدد الأدوار الحالية: ${r.roles.length}.`,
      });
    } catch (err) {
      setSearchStatus({ kind: "error", message: (err as Error).message });
    } finally {
      setSearching(false);
    }
  }

  function toggle(role: AppRole) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  }

  async function onSave() {
    if (!loaded) return;
    setSaving(true);
    setRolesStatus(null);
    try {
      const roles = Array.from(selected);
      const r = await save({ data: { email: loaded.email, roles } });
      setLoaded({ ...loaded, initial: r.roles as AppRole[] });
      setRolesStatus({
        kind: "success",
        message: `تم حفظ الأدوار بنجاح (${r.roles.length}).`,
      });
    } catch (err) {
      setRolesStatus({ kind: "error", message: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function onSavePassword() {
    if (!loaded || password.length < 8) return;
    setSavingPassword(true);
    setPasswordStatus(null);
    try {
      await savePassword({ data: { email: loaded.email, password } });
      setPasswordStatus({
        kind: "success",
        message: `تم تحديث كلمة المرور بنجاح لـ ${loaded.email}.`,
      });
    } catch (err) {
      setPasswordStatus({ kind: "error", message: (err as Error).message });
    } finally {
      setSavingPassword(false);
    }
  }

  function onGeneratePassword() {
    const pw = generateStrongPassword(16);
    setPassword(pw);
    setShowPassword(true);
    setPasswordStatus(null);
  }

  async function onCopyPassword() {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      toast.success("تم نسخ كلمة المرور");
    } catch {
      toast.error("تعذّر النسخ");
    }
  }

  const dirty =
    loaded &&
    (selected.size !== loaded.initial.length ||
      loaded.initial.some((r) => !selected.has(r)));

  return (
    <AdminShell
      eyebrow="Admin"
      title="إدارة أدوار المستخدمين"
      subtitle="ابحث عن مستخدم بالبريد الإلكتروني ثم فعّل/عطّل الأدوار واحفظ التغييرات. متاح لـ super_admin فقط."
    >
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <StepBadge n={1} label="ابحث عن المستخدم" />
        <StepBadge n={2} label="عدّل الأدوار واحفظ" />
        <StepBadge n={3} label="عيّن كلمة مرور جديدة (اختياري)" />
      </div>

      <AdminCard title="١. البحث بالبريد الإلكتروني" icon={Search} className="mb-6">
        <form onSubmit={onSearch} className="flex flex-wrap items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="min-w-[260px] flex-1 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-gold/50"
            required
          />
          <button
            type="submit"
            disabled={searching}
            className="inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-gold/20 disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            {searching ? "جارٍ البحث…" : "بحث"}
          </button>
        </form>
        <StatusBanner status={searchStatus} />
      </AdminCard>

      {loaded ? (
        <AdminCard
          title={`٢. الأدوار — ${loaded.email}`}
          icon={UserCog}
          action={
            <button
              type="button"
              onClick={onSave}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-2 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20 disabled:opacity-40"
            >
              <Save className="h-4 w-4" />
              {saving ? "جارٍ الحفظ…" : "حفظ التغييرات"}
            </button>
          }
        >
          <p className="mb-4 font-mono text-[10px] text-muted-foreground">
            User ID: {loaded.userId}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ROLE_OPTIONS.map((role) => {
              const active = selected.has(role);
              return (
                <label
                  key={role}
                  className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm transition ${
                    active
                      ? "border-gold/40 bg-gold/[0.08] text-foreground"
                      : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-gold/30"
                  }`}
                >
                  <span className="font-mono text-xs">{role}</span>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggle(role)}
                    className="h-4 w-4 accent-gold"
                  />
                </label>
              );
            })}
          </div>
          {dirty ? (
            <p className="mt-4 text-xs text-amber-300">
              لديك تغييرات غير محفوظة — اضغط "حفظ التغييرات".
            </p>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">لا توجد تغييرات.</p>
          )}
          <StatusBanner status={rolesStatus} />
        </AdminCard>
      ) : null}

      {loaded ? (
        <AdminCard title="٣. تعيين كلمة مرور جديدة" icon={KeyRound} className="mt-6">
          <p className="mb-3 text-xs text-muted-foreground">
            اكتب كلمة مرور (٨ أحرف على الأقل) أو اضغط "توليد" للحصول على كلمة قوية عشوائية.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[260px] flex-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور الجديدة"
                className="w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 pr-10 font-mono text-sm outline-none focus:border-gold/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-2 grid place-items-center text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "إخفاء" : "إظهار"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button
              type="button"
              onClick={onGeneratePassword}
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground transition hover:bg-white/[0.06]"
            >
              <Wand2 className="h-4 w-4" />
              توليد
            </button>
            <button
              type="button"
              onClick={onCopyPassword}
              disabled={!password}
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground transition hover:bg-white/[0.06] disabled:opacity-40"
            >
              <Copy className="h-4 w-4" />
              نسخ
            </button>
            <button
              type="button"
              onClick={onSavePassword}
              disabled={savingPassword || password.length < 8}
              className="inline-flex items-center gap-2 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20 disabled:opacity-40"
            >
              <KeyRound className="h-4 w-4" />
              {savingPassword ? "جارٍ التحديث…" : "تحديث كلمة المرور"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {password.length === 0
              ? "لم يتم إدخال كلمة مرور بعد."
              : password.length < 8
                ? `تحتاج ${8 - password.length} أحرف إضافية.`
                : `الطول: ${password.length} — جاهزة للحفظ.`}
          </p>
          <StatusBanner status={passwordStatus} />
        </AdminCard>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center text-sm text-muted-foreground">
          ابحث عن مستخدم لعرض أدواره وتعديلها.
        </div>
      )}
    </AdminShell>
  );
}