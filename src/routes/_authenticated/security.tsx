import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { canViewSecurityAudit } from "@/lib/security-audit.functions";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Filter,
  Clock,
  History,
  User as UserIcon,
  Lock,
  Download,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SECURITY_SNAPSHOT, type SecurityFinding, type Severity, type FindingStatus } from "@/lib/security-snapshot";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/security")({
  head: () => ({
    meta: [
      { title: "لوحة الأمان | HK Global Trading" },
      { name: "description", content: "نتائج فحص الأمان الأحدث: كل مشكلة، مستوى الخطورة، والإصلاح المقترح." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SecurityPanel,
});

const SEV_META: Record<Severity, { label: string; badge: string; ring: string; icon: typeof AlertTriangle; order: number }> = {
  critical: { label: "حرج", badge: "bg-red-500/15 text-red-300 border-red-500/30", ring: "ring-red-500/40", icon: AlertCircle, order: 0 },
  high:     { label: "عالٍ", badge: "bg-orange-500/15 text-orange-300 border-orange-500/30", ring: "ring-orange-500/40", icon: AlertTriangle, order: 1 },
  medium:   { label: "متوسط", badge: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30", ring: "ring-yellow-500/40", icon: AlertTriangle, order: 2 },
  low:      { label: "منخفض", badge: "bg-sky-500/15 text-sky-300 border-sky-500/30", ring: "ring-sky-500/40", icon: Info, order: 3 },
  info:     { label: "معلومة", badge: "bg-white/10 text-muted-foreground border-white/15", ring: "ring-white/20", icon: Info, order: 4 },
};

const STATUS_META: Record<FindingStatus, { label: string; className: string }> = {
  open:    { label: "مفتوح", className: "bg-red-500/15 text-red-300 border-red-500/30" },
  fixed:   { label: "تم الإصلاح", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  ignored: { label: "مُتَجَاهَل", className: "bg-white/10 text-muted-foreground border-white/15" },
};

type FilterKey = "all" | Severity | "open" | "fixed";

function SecurityPanel() {
  const { dir } = useI18n();
  const [filter, setFilter] = useState<FilterKey>("all");

  const findings = SECURITY_SNAPSHOT.findings;

  const check = useServerFn(canViewSecurityAudit);
  const { data: authz } = useQuery({
    queryKey: ["security-audit-authz"],
    queryFn: () => check(),
    staleTime: 60_000,
  });
  const canViewAudit = Boolean(authz?.authorized);

  const stats = useMemo(() => {
    const s = { total: findings.length, open: 0, fixed: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0 } as Record<string, number>;
    for (const f of findings) {
      s[f.status] = (s[f.status] ?? 0) + 1;
      s[f.severity] = (s[f.severity] ?? 0) + 1;
    }
    return s;
  }, [findings]);

  const visible = useMemo(() => {
    const list = findings.filter((f) => {
      if (filter === "all") return true;
      if (filter === "open" || filter === "fixed") return f.status === filter;
      return f.severity === filter;
    });
    return [...list].sort(
      (a, b) =>
        (a.status === "open" ? 0 : 1) - (b.status === "open" ? 0 : 1) ||
        SEV_META[a.severity].order - SEV_META[b.severity].order,
    );
  }, [findings, filter]);

  const allClear = stats.open === 0;

  return (
    <PageShell bare>
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12" dir={dir}>
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              آخر فحص: {new Date(SECURITY_SNAPSHOT.generatedAt).toLocaleString("ar-EG")}
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">لوحة الأمان</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              كل نتيجة فحص أمان مع مستوى الخطورة، الفئة، وملخص التعديل المقترح لإغلاقها.
            </p>
          </div>
          <div className={cn(
            "glass flex items-center gap-3 rounded-2xl border p-4",
            allClear ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5",
          )}>
            {allClear ? (
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
            ) : (
              <ShieldAlert className="h-8 w-8 text-red-400" />
            )}
            <div>
              <p className="text-xs text-muted-foreground">الحالة العامة</p>
              <p className="font-display text-lg font-semibold">
                {allClear ? "لا توجد مشاكل مفتوحة" : `${stats.open} مشكلة مفتوحة`}
              </p>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {[
            { k: "الإجمالي", v: stats.total, cls: "border-white/10" },
            { k: "مفتوح", v: stats.open, cls: "border-red-500/30" },
            { k: "تم الإصلاح", v: stats.fixed, cls: "border-emerald-500/30" },
            { k: "حرج", v: stats.critical, cls: "border-red-500/30" },
            { k: "عالٍ", v: stats.high, cls: "border-orange-500/30" },
            { k: "متوسط/منخفض", v: (stats.medium ?? 0) + (stats.low ?? 0), cls: "border-yellow-500/30" },
          ].map((c) => (
            <div key={c.k} className={cn("glass rounded-xl border p-3", c.cls)}>
              <p className="text-xs text-muted-foreground">{c.k}</p>
              <p className="mt-1 font-display text-2xl font-bold tabular-nums">{c.v}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div className="mr-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> تصفية
          </div>
          {([
            ["all", "الكل"],
            ["open", "مفتوح"],
            ["fixed", "تم الإصلاح"],
            ["critical", "حرج"],
            ["high", "عالٍ"],
            ["medium", "متوسط"],
            ["low", "منخفض"],
          ] as [FilterKey, string][]).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                filter === k
                  ? "border-white/30 bg-white/10 text-foreground"
                  : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground",
              )}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Findings list */}
        <div className="mt-6 space-y-3">
          {visible.length === 0 ? (
            <div className="glass rounded-2xl border border-white/10 p-8 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
              <p className="mt-3 font-medium">لا نتائج ضمن هذه التصفية.</p>
            </div>
          ) : (
            visible.map((f) => <FindingCard key={f.id} f={f} canViewAudit={canViewAudit} />)
          )}
        </div>

        {/* Global audit log */}
        <AuditLogGate findings={findings} />

        {/* Scanner strip */}
        <div className="mt-10">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">أدوات الفحص المشغّلة</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {SECURITY_SNAPSHOT.scanners.map((s) => (
              <div key={s.scanner_name} className="glass rounded-lg border border-white/10 p-3">
                <p className="font-mono text-xs text-foreground">{s.scanner_name}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">v{s.version}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function AuditLogGate({ findings }: { findings: SecurityFinding[] }) {
  const check = useServerFn(canViewSecurityAudit);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["security-audit-authz"],
    queryFn: () => check(),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="mt-10 glass rounded-2xl border border-white/10 p-6 text-center text-sm text-muted-foreground">
        جارٍ التحقق من الصلاحيات…
      </div>
    );
  }
  if (isError || !data?.authorized) {
    return (
      <div className="mt-10 glass flex items-center gap-3 rounded-2xl border border-white/10 p-6">
        <Lock className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">سجل التدقيق مقيَّد</p>
          <p className="text-xs text-muted-foreground">
            عرض سجل تطبيق الإصلاحات متاح فقط للمستخدمين المصرّح لهم (دور admin).
          </p>
        </div>
      </div>
    );
  }
  return <AuditLog findings={findings} />;
}

function AuditLog({ findings }: { findings: SecurityFinding[] }) {
  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const entries = useMemo(() => {
    const rows = findings.flatMap((f) =>
      (f.audit ?? []).map((a) => ({ ...a, findingId: f.id, findingTitle: f.title, severity: f.severity })),
    );
    return rows.sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [findings]);

  // In-app notification for newly applied fixes since last visit.
  useEffect(() => {
    if (typeof window === "undefined" || entries.length === 0) return;
    const KEY = "security:audit:seen";
    let seen: string[] = [];
    try {
      seen = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
      seen = [];
    }
    const seenSet = new Set(seen);
    const fresh = entries.filter((e) => !seenSet.has(`${e.findingId}@${e.at}`));
    if (fresh.length > 0) {
      const shown = fresh.slice(0, 3);
      for (const e of shown) {
        toast.success(`إصلاح أمني جديد: ${e.findingTitle}`, {
          description: `${e.action} — بواسطة ${e.by} · ${new Date(e.at).toLocaleString("ar-EG")}`,
          duration: 6000,
        });
      }
      if (fresh.length > shown.length) {
        toast(`+${fresh.length - shown.length} إصلاح إضافي مُسجَّل في سجل التدقيق`);
      }
    }
    const allKeys = entries.map((e) => `${e.findingId}@${e.at}`);
    localStorage.setItem(KEY, JSON.stringify(allKeys));
  }, [entries]);

  if (entries.length === 0) return null;

  const handleExportCsv = () => {
    const header = ["at", "by", "action", "severity", "findingId", "findingTitle", "changes"];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = [header.join(",")];
    for (const e of entries) {
      lines.push([
        e.at,
        e.by,
        e.action,
        e.severity,
        e.findingId,
        e.findingTitle,
        e.changes.join(" | "),
      ].map((v) => escape(String(v))).join(","));
    }
    // BOM so Excel opens UTF-8/Arabic correctly
    const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const rows = entries
      .map(
        (e) => `
        <tr>
          <td>${new Date(e.at).toLocaleString("ar-EG")}</td>
          <td>${escapeHtml(e.by)}</td>
          <td>${SEV_META[e.severity].label}</td>
          <td>${escapeHtml(e.action)}<br/><small>${escapeHtml(e.findingTitle)}</small></td>
          <td><ul style="margin:0;padding-inline-start:16px">${e.changes.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul></td>
        </tr>`,
      )
      .join("");
    const html = `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"/>
      <title>سجل التدقيق الأمني</title>
      <style>
        body{font-family:system-ui,'Segoe UI',Tahoma,sans-serif;padding:24px;color:#111}
        h1{font-size:20px;margin:0 0 12px}
        .meta{color:#555;font-size:12px;margin-bottom:16px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #ddd;padding:6px 8px;vertical-align:top;text-align:right}
        th{background:#f3f4f6}
        small{color:#666}
        @media print{@page{size:A4;margin:14mm}}
      </style></head><body>
      <h1>سجل التدقيق — تطبيق الإصلاحات الأمنية</h1>
      <div class="meta">تم التصدير في ${new Date().toLocaleString("ar-EG")} · عدد الإدخالات: ${entries.length}</div>
      <table><thead><tr>
        <th>التاريخ</th><th>المنفّذ</th><th>الخطورة</th><th>الإجراء / المشكلة</th><th>التغييرات</th>
      </tr></thead><tbody>${rows}</tbody></table>
      <script>window.onload=()=>{setTimeout(()=>window.print(),200)}</script>
      </body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="mt-10">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <History className="h-4 w-4" /> سجل التدقيق — تطبيق الإصلاحات
        </h2>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={handleExportCsv} className="border-white/15 bg-white/5 text-xs">
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleExportPdf} className="border-white/15 bg-white/5 text-xs">
            <Printer className="h-3.5 w-3.5" /> PDF
          </Button>
        </div>
      </div>
      <ol className="glass space-y-3 rounded-2xl border border-white/10 p-4">
        {entries.map((e, i) => (
          <li key={`${e.findingId}-${i}`} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="tabular-nums text-foreground/90">
                {new Date(e.at).toLocaleString("ar-EG")}
              </span>
              <span>·</span>
              <UserIcon className="h-3.5 w-3.5" />
              <span className="font-mono text-foreground/90">{e.by}</span>
              <span>·</span>
              <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", SEV_META[e.severity].badge)}>
                {SEV_META[e.severity].label}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium">{e.action} — <span className="text-muted-foreground">{e.findingTitle}</span></p>
            <ul className="mt-1.5 list-disc space-y-0.5 ps-5 text-xs text-muted-foreground">
              {e.changes.map((c, j) => (
                <li key={j}>{c}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

function FindingCard({ f, canViewAudit }: { f: SecurityFinding; canViewAudit: boolean }) {
  const sev = SEV_META[f.severity];
  const Icon = sev.icon;
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("glass rounded-2xl border border-white/10 p-4 transition hover:ring-1", sev.ring)}>
      <div className="flex flex-wrap items-start gap-3">
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg border", sev.badge)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium leading-snug">{f.title}</h3>
            <Badge variant="outline" className={cn("border text-[10px]", sev.badge)}>{sev.label}</Badge>
            <Badge variant="outline" className={cn("border text-[10px]", STATUS_META[f.status].className)}>
              {STATUS_META[f.status].label}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="font-mono">{f.scanner}</span> · {f.category}
            {f.fixedAt && <> · مُغلق في {f.fixedAt}</>}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{f.summary}</p>

          {open && (
            <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-3 text-sm">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> الإصلاح المقترح
              </p>
              <p className="text-foreground/90">{f.remediation}</p>
              {canViewAudit && f.audit && f.audit.length > 0 && (
                <div className="mt-3 border-t border-emerald-500/15 pt-3">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                    <History className="h-3.5 w-3.5" /> سجل التدقيق لهذا الإصلاح
                  </p>
                  <ol className="space-y-2">
                    {f.audit.map((a, i) => (
                      <li key={i} className="rounded-md border border-white/10 bg-white/[0.02] p-2">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="tabular-nums">{new Date(a.at).toLocaleString("ar-EG")}</span>
                          <span>·</span>
                          <UserIcon className="h-3 w-3" />
                          <span className="font-mono">{a.by}</span>
                        </div>
                        <p className="mt-1 text-xs font-medium text-foreground/90">{a.action}</p>
                        <ul className="mt-1 list-disc space-y-0.5 ps-4 text-[11px] text-muted-foreground">
                          {a.changes.map((c, j) => (
                            <li key={j}>{c}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 border-white/15 bg-white/5 text-xs"
        >
          {open ? "إخفاء" : "التفاصيل"}
        </Button>
      </div>
    </div>
  );
}