// Snapshot of the latest security scan results, updated after each scan.
// Consumed by /security route so the client panel doesn't hit the scanner API.

export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type FindingStatus = "open" | "fixed" | "ignored";

export type SecurityFinding = {
  id: string;
  scanner: string;
  title: string;
  severity: Severity;
  status: FindingStatus;
  category: string;
  summary: string;
  remediation: string;
  fixedAt?: string;
};

export type ScannerBlock = {
  scanner_name: string;
  version: string;
  timestamp: string;
  up_to_date: boolean;
};

export const SECURITY_SNAPSHOT: {
  generatedAt: string;
  scanners: ScannerBlock[];
  findings: SecurityFinding[];
} = {
  generatedAt: "2026-07-09T18:38:00Z",
  scanners: [
    { scanner_name: "supabase_lov", version: "3.2", timestamp: "2026-07-09T18:31:35Z", up_to_date: true },
    { scanner_name: "supabase", version: "1.0", timestamp: "2026-07-09T18:31:35Z", up_to_date: true },
    { scanner_name: "supply_chain", version: "2.0.0", timestamp: "2026-07-09T16:40:19Z", up_to_date: true },
    { scanner_name: "connector_security_scan", version: "1.0", timestamp: "2026-07-09T18:31:35Z", up_to_date: true },
    { scanner_name: "app_mcp", version: "1.0", timestamp: "2026-07-09T18:31:35Z", up_to_date: true },
  ],
  // Historical + currently-open findings. Persist here so the panel
  // documents what was resolved and what still needs action.
  findings: [
    {
      id: "rls-notifications-writes",
      scanner: "supabase_lov",
      title: "جدول notifications قابل للإدراج/الحذف من العميل",
      severity: "high",
      status: "fixed",
      category: "Row Level Security",
      summary: "لم توجد سياسات INSERT/DELETE مقيّدة على جدول الإشعارات، ما يسمح للعميل بحقن إشعارات مزيّفة.",
      remediation: "إضافة سياسات DENY صريحة لدور anon و authenticated على INSERT/DELETE؛ الكتابة تتم عبر service_role فقط.",
      fixedAt: "2026-07-09",
    },
    {
      id: "rls-portfolio-snapshots-mutate",
      scanner: "supabase_lov",
      title: "لقطات المحفظة (portfolio_snapshots) قابلة للتعديل من العميل",
      severity: "high",
      status: "fixed",
      category: "Row Level Security",
      summary: "لم تكن هناك سياسات UPDATE/DELETE، ما يعرّض بيانات الأداء التاريخية للتلاعب.",
      remediation: "قفل UPDATE/DELETE بـ USING(false)/WITH CHECK(false) للعميل؛ التحديث الدوري يتم من الخادم عبر service_role.",
      fixedAt: "2026-07-09",
    },
    {
      id: "rls-statements-writes",
      scanner: "supabase_lov",
      title: "كشوف الحساب (statements) بلا حماية كتابة",
      severity: "high",
      status: "fixed",
      category: "Row Level Security",
      summary: "غياب سياسات INSERT/UPDATE/DELETE يفتح باب تزوير الكشوف المالية.",
      remediation: "إضافة سياسات رفض للأدوار العامة، وحصر توليد الكشف في الخادم بعد تحقق الهوية.",
      fixedAt: "2026-07-09",
    },
    {
      id: "rls-transactions-writes",
      scanner: "supabase_lov",
      title: "جدول transactions يقبل كتابة عملاء غير موثوقين",
      severity: "critical",
      status: "fixed",
      category: "Row Level Security",
      summary: "غياب سياسات INSERT/UPDATE/DELETE يسمح للعميل بإنشاء صفقات وهمية أو تعديل أرباح.",
      remediation: "رفض جميع الكتابات للأدوار العامة؛ إدراج الصفقات فقط عبر Server Function موثّقة بـ requireSupabaseAuth.",
      fixedAt: "2026-07-09",
    },
  ],
};