import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { canViewSecurityAudit } from "@/lib/security-audit.functions";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, ShieldAlert, History } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/finance")({
  head: () => ({
    meta: [
      { title: "Admin — Finance Requests" },
      { name: "description", content: "Approve or reject investor deposit and withdrawal requests." },
    ],
  }),
  component: AdminFinance,
});

type Dep = { id: string; user_id: string; amount: number; currency: string; method: string; reference: string | null; notes: string | null; status: string; created_at: string; reviewed_at: string | null };
type Wd = { id: string; user_id: string; amount: number; currency: string; destination: string; iban: string | null; swift: string | null; notes: string | null; status: string; created_at: string; reviewed_at: string | null };
type Profile = { id: string; email: string | null; display_name: string | null };
type AuditRow = { id: string; request_kind: string; request_id: string; target_user_id: string; admin_id: string; action: string; from_status: string | null; to_status: string | null; reason: string | null; created_at: string };

function AdminFinance() {
  const check = useServerFn(canViewSecurityAudit);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"deposits" | "withdrawals">("deposits");
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [deps, setDeps] = useState<Dep[]>([]);
  const [wds, setWds] = useState<Wd[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [openLog, setOpenLog] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: dp }, { data: wd }] = await Promise.all([
      supabase.from("deposits").select("*").order("created_at", { ascending: false }),
      supabase.from("withdrawals").select("*").order("created_at", { ascending: false }),
    ]);
    const d = (dp ?? []) as Dep[];
    const w = (wd ?? []) as Wd[];
    setDeps(d);
    setWds(w);
    const { data: au } = await supabase
      .from("finance_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    setAudit((au ?? []) as AuditRow[]);
    const adminIds = (au ?? []).map((x: any) => x.admin_id);
    const ids = Array.from(new Set([...d.map((x) => x.user_id), ...w.map((x) => x.user_id), ...adminIds]));
    if (ids.length) {
      const { data: pr } = await supabase.from("profiles").select("id,email,display_name").in("id", ids);
      const map: Record<string, Profile> = {};
      (pr ?? []).forEach((p) => (map[p.id] = p as Profile));
      setProfiles(map);
    }
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      const r = await check({});
      setAuthorized(Boolean(r?.authorized));
      if (r?.authorized) await load();
      else setLoading(false);
    })();
  }, []);

  async function review(kind: "deposits" | "withdrawals", id: string, status: "approved" | "rejected") {
    const row = (kind === "deposits" ? deps : wds).find((r) => r.id === id);
    if (!row) return;
    const reason = window.prompt(
      status === "approved" ? "سبب الاعتماد (اختياري):" : "سبب الرفض (مطلوب):",
      ""
    );
    if (status === "rejected" && !reason?.trim()) {
      toast.error("يجب إدخال سبب الرفض");
      return;
    }
    const { data: userRes } = await supabase.auth.getUser();
    const adminId = userRes.user?.id;
    if (!adminId) return toast.error("جلسة غير صالحة");
    const { error } = await supabase
      .from(kind)
      .update({ status, reviewed_by: adminId, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    const { error: aErr } = await supabase.from("finance_audit_log").insert({
      request_kind: kind,
      request_id: id,
      target_user_id: row.user_id,
      admin_id: adminId,
      action: status === "approved" ? "approve" : "reject",
      from_status: row.status,
      to_status: status,
      reason: reason?.trim() || null,
      metadata: { amount: row.amount, currency: row.currency },
    });
    if (aErr) toast.error("تعذّر تسجيل التدقيق: " + aErr.message);
    toast.success(status === "approved" ? "تم اعتماد الطلب" : "تم رفض الطلب");
    await load();
  }

  if (authorized === null || loading) {
    return (
      <PageShell>
        <section className="mx-auto max-w-7xl px-4 py-16 text-sm text-muted-foreground">جارٍ التحميل…</section>
      </PageShell>
    );
  }

  if (!authorized) {
    return (
      <PageShell>
        <section className="mx-auto max-w-3xl px-4 py-16">
          <div className="glass flex items-start gap-3 rounded-3xl p-6">
            <ShieldAlert className="mt-1 h-5 w-5 text-amber-400" />
            <div>
              <h1 className="font-display text-2xl font-semibold">غير مصرّح</h1>
              <p className="mt-2 text-sm text-muted-foreground">هذه الصفحة متاحة فقط للمستخدمين ذوي دور admin.</p>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  const rows = tab === "deposits" ? deps : wds;
  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const auditFor = (id: string) => audit.filter((a) => a.request_id === id);
  const counts = {
    pendingDep: deps.filter((d) => d.status === "pending").length,
    pendingWd: wds.filter((w) => w.status === "pending").length,
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-widest text-gold">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">إدارة طلبات الإيداع والسحب</h1>
        <p className="mt-2 text-sm text-muted-foreground">اعتمد أو ارفض الطلبات — سجل كامل بجميع الحالات.</p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <TabBtn active={tab === "deposits"} onClick={() => setTab("deposits")}>
            الإيداعات {counts.pendingDep > 0 && <span className="ml-1 rounded-full bg-amber-500/20 px-1.5 text-[10px] text-amber-300">{counts.pendingDep}</span>}
          </TabBtn>
          <TabBtn active={tab === "withdrawals"} onClick={() => setTab("withdrawals")}>
            السحوبات {counts.pendingWd > 0 && <span className="ml-1 rounded-full bg-amber-500/20 px-1.5 text-[10px] text-amber-300">{counts.pendingWd}</span>}
          </TabBtn>
          <div className="mx-2 h-5 w-px bg-white/10" />
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <TabBtn key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === "pending" ? "قيد المراجعة" : f === "approved" ? "معتمد" : f === "rejected" ? "مرفوض" : "الكل"}
            </TabBtn>
          ))}
        </div>

        <div className="glass mt-6 overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start">التاريخ</th>
                  <th className="px-4 py-3 text-start">المستثمر</th>
                  <th className="px-4 py-3 text-start">المبلغ</th>
                  <th className="px-4 py-3 text-start">{tab === "deposits" ? "الطريقة/المرجع" : "الوجهة/IBAN"}</th>
                  <th className="px-4 py-3 text-start">الحالة</th>
                  <th className="px-4 py-3 text-end">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">لا توجد سجلات.</td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const p = profiles[r.user_id];
                    const info = tab === "deposits"
                      ? `${(r as Dep).method}${(r as Dep).reference ? ` · ${(r as Dep).reference}` : ""}`
                      : `${(r as Wd).destination}${(r as Wd).iban ? ` · ${(r as Wd).iban}` : ""}`;
                    return (
                      <React.Fragment key={r.id}>
                      <tr className="align-top">
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{p?.display_name ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">{p?.email ?? r.user_id.slice(0, 8)}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold">{Number(r.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {r.currency}</td>
                        <td className="px-4 py-3 text-xs">{info}{r.notes ? <div className="mt-1 text-muted-foreground">“{r.notes}”</div> : null}</td>
                        <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                          {r.status === "pending" ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={() => review(tab, r.id, "approved")} className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30">
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> اعتماد
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => review(tab, r.id, "rejected")} className="border-red-500/30 text-red-300 hover:bg-red-500/10">
                                <XCircle className="mr-1 h-3.5 w-3.5" /> رفض
                              </Button>
                            </div>
                          ) : (
                            <div className="text-end text-[11px] text-muted-foreground">
                              {r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString() : "—"}
                            </div>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => setOpenLog(openLog === r.id ? null : r.id)} className="text-xs">
                            <History className="mr-1 h-3.5 w-3.5" />
                            سجل ({auditFor(r.id).length})
                          </Button>
                          </div>
                        </td>
                      </tr>
                      {openLog === r.id && (
                        <tr className="bg-white/[0.02]">
                          <td colSpan={6} className="px-4 py-3">
                            {auditFor(r.id).length === 0 ? (
                              <div className="text-xs text-muted-foreground">لا توجد إجراءات مسجّلة بعد.</div>
                            ) : (
                              <ul className="space-y-2">
                                {auditFor(r.id).map((a) => {
                                  const adm = profiles[a.admin_id];
                                  return (
                                    <li key={a.id} className="rounded-xl bg-white/[0.03] p-3 text-xs">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-medium">{a.action === "approve" ? "اعتماد" : a.action === "reject" ? "رفض" : a.action}</span>
                                        <span className="text-muted-foreground">•</span>
                                        <span className="text-muted-foreground">من</span>
                                        <StatusPill status={a.from_status ?? "—"} />
                                        <span className="text-muted-foreground">إلى</span>
                                        <StatusPill status={a.to_status ?? "—"} />
                                        <span className="ms-auto text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                                      </div>
                                      <div className="mt-1 text-muted-foreground">
                                        بواسطة: {adm?.display_name ?? adm?.email ?? a.admin_id.slice(0, 8)}
                                      </div>
                                      {a.reason && <div className="mt-1">السبب: “{a.reason}”</div>}
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs transition-colors ${active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5"}`}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
    pending: { cls: "bg-amber-500/10 text-amber-400", icon: <Clock className="h-3 w-3" />, label: "قيد المراجعة" },
    approved: { cls: "bg-emerald-500/10 text-emerald-400", icon: <CheckCircle2 className="h-3 w-3" />, label: "معتمد" },
    rejected: { cls: "bg-red-500/10 text-red-400", icon: <XCircle className="h-3 w-3" />, label: "مرفوض" },
  };
  const m = map[status] ?? { cls: "bg-white/5 text-muted-foreground", icon: null, label: status };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${m.cls}`}>
      {m.icon}{m.label}
    </span>
  );
}