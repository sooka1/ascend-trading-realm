# خطة التحويل إلى منصة استثمار على مستوى المؤسسات

طلبت "كل ما سبق" و"تنفيذ كامل". بصراحة تامة: ما طلبته يعادل **6-8 أسابيع** من العمل الهندسي لفريق كامل (RBAC كامل، CRM، CMS، نظام تذاكر، تقارير PDF/Excel، MFA، إشعارات SMS، تدقيق OWASP كامل، ...إلخ). لا يمكن تنفيذ كل ذلك في جلسة واحدة دون **كسر التطبيق العامل حالياً**.

سأنفذ العمل على **مراحل متتالية**، كل مرحلة قابلة للاختبار والاستخدام قبل الانتقال للتالية. تبدأ كل مرحلة بأمر منك: "ابدأ المرحلة N".

## المرحلة 1 — الأساس الأمني و RBAC (هذه الجلسة)

الأهم والأخطر. بدونها كل ما يأتي بعدها هش.

- تدقيق كل جداول Supabase الـ14: التأكد من `GRANT` صحيح، RLS مُفعّل، سياسات مُحكمة لكل جدول.
- إضافة أدوار enum: `super_admin`, `admin`, `portfolio_manager`, `compliance_officer`, `finance`, `support`, `investor` إلى `app_role`.
- تعديل `has_role` ودالة `handle_new_user` لدعم الأدوار الجديدة.
- إنشاء layout محمي `_admin` يستخدم `has_role` للتحقق من صلاحية الوصول لصفحات الإدارة.
- إصلاح أي سياسة RLS مكشوفة (تشغيل `supabase--linter`).
- تفعيل حماية كلمات المرور المسربة (HIBP).

## المرحلة 2 — بوابة المستثمر الكاملة

- صفحات: `/portal/overview`, `/portal/reports`, `/portal/transactions`, `/portal/documents`, `/portal/notifications`, `/portal/support`, `/portal/security`, `/portal/profile`.
- نظام تذاكر دعم (جدول `support_tickets` + `ticket_messages`).
- مركز مستندات (Supabase Storage bucket + سياسات).
- تصدير PDF للتقارير (react-pdf).

## المرحلة 3 — لوحة الإدارة (Admin)

- `/admin/users` (إدارة/تعطيل/تعديل أدوار).
- `/admin/portfolios` (عرض/تعديل محافظ جميع العملاء).
- `/admin/finance` (موجود — تحسين).
- `/admin/audit` (سجل التدقيق الكامل).
- `/admin/support` (لوحة معالجة التذاكر).
- `/admin/analytics` (KPIs عامة).

## المرحلة 4 — نظام التصميم والأداء

- توحيد جميع الألوان في `src/styles.css` كـ tokens (لا `bg-[var(...)]` مباشر).
- مكونات موحدة: `StatCard`, `DataTable`, `EmptyState`, `LoadingState`, `ErrorBoundary`.
- Lazy loading للمسارات الثقيلة.
- Image optimization, code splitting.
- SEO لكل صفحة (schema.org, canonical, OG images).

## المرحلة 5 — إضافات المؤسسة

- MFA/2FA (TOTP).
- سجل جلسات وأجهزة.
- إشعارات: Email (موجود) + In-app (موجود). SMS عبر GatewayAPI (اختياري).
- CMS بسيط (blog/news/announcements).
- التقويم الاقتصادي وشريط الأسواق (يوجد ticker — نُحسّنه).
- WCAG AA: aria-labels لكل الأيقونات، تباين، keyboard nav.

## المرحلة 6 — الضبط النهائي

- Playwright E2E للتدفقات الحرجة.
- Rate limiting للنماذج العامة.
- تقرير Lighthouse ومعالجة كل النقاط دون 95.
- مراجعة نهائية OWASP Top 10.

---

## تفاصيل تقنية للمرحلة 1 (التي سأنفذها الآن عند الموافقة)

**Migration واحدة تُضيف:**

```sql
-- توسيع app_role
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'portfolio_manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'compliance_officer';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'finance';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'support';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'investor';

-- دالة تجميع للتحقق من عدة أدوار
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role = ANY(_roles)) $$;
```

**ملفات جديدة/معدلة:**
- `src/routes/_authenticated/_admin/route.tsx` — بوابة تحقق `has_any_role(['admin','super_admin'])`.
- نقل `admin.finance.tsx` تحت `_admin/`.
- `src/lib/rbac.functions.ts` — server fn لجلب أدوار المستخدم الحالي.
- `src/hooks/use-roles.ts` — hook للاستخدام في المكونات.

**مخرجات مؤكدة:**
- تشغيل `supabase--linter` بعد التعديلات.
- typecheck يمر.
- لا كسر لأي مسار موجود.

---

**للبدء اكتب: "ابدأ المرحلة 1"** أو **"ابدأ المرحلة X"** لأي مرحلة أخرى تفضلها أولاً.
