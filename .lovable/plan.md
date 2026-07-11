
## الهدف
ربط حسابات المستثمرين بنظام نسخ الصفقات (Copy Trading) من مزود Master واحد، مع تمويل من المحفظة أو إيداع فوري، وإعطاء `super_admin` تحكم كامل بسجل تدقيق شامل.

## البنية على قاعدة البيانات (Migration)

جداول جديدة في `public`:

1. **`copy_masters`** — قائمة مزودي النسخ (Master)
   - `name`, `bio`, `avatar_url`, `risk_level`, `min_capital`, `performance_fee_pct`, `is_active`
   - قراءة عامة (`anon` SELECT للنشطين فقط)
   - كتابة: `super_admin` فقط

2. **`copy_subscriptions`** — اشتراك المستثمر بمزود واحد
   - `user_id`, `master_id`, `allocated_amount`, `currency='USD'`, `copy_ratio`, `status` (active/paused/closed)
   - `started_at`, `closed_at`
   - RLS: المستخدم يرى/يدير اشتراكه، `super_admin` يرى ويعدل الكل
   - trigger: يتحقق من الرصيد المتاح (approved deposits + profits − withdrawals − committed) ويحجز `allocated_amount`

3. **`copy_master_trades`** — صفقات المزود (تُفتح من قبل super_admin/master)
   - `master_id`, `symbol`, `side`, `entry_price`, `exit_price`, `volume`, `opened_at`, `closed_at`, `status`
   - كتابة: `super_admin` فقط

4. **`copy_trade_fills`** — نسخ الصفقة على كل مشترك (يُنشأ تلقائياً عند فتح/إغلاق صفقة master)
   - `master_trade_id`, `subscription_id`, `user_id`, `volume`, `pnl`, `status`
   - trigger عند إغلاق master trade: يوزع الربح/الخسارة على `copy_subscriptions.allocated_amount` ويسجل في `notifications`

5. **`copy_audit_log`** — سجل كل حدث (subscribe/pause/close/deposit-shortfall/manual-adjust)

دوال SQL:
- `subscribe_to_master(_master_id, _amount)` — يتحقق من الرصيد، ينشئ الاشتراك، يعيد `{ok, needs_deposit, shortfall}`
- `close_master_trade(_trade_id, _exit_price)` — security definer، `super_admin` فقط، يوزع النتائج
- `admin_adjust_balance(_user_id, _delta, _reason)` — `super_admin` فقط، يسجل في audit

كل الجداول: GRANT مناسب + RLS + سياسات `has_role(auth.uid(),'super_admin')` للتحكم الكامل.

## الواجهات

**للمستثمر** (`/portal/copy-trading` جديد):
- بطاقة المزود الوحيد المتاح (اسم، أداء، حد أدنى)
- زر "اشترك في النسخ" → dialog:
  - إدخال المبلغ
  - عرض الرصيد المتاح
  - إن كان كافياً: يخصم ويفعّل
  - إن كان غير كافٍ: يعرض الفارق + زر "إيداع الآن" يوجّه لـ `/portal/transactions` مع رجوع تلقائي
- إدارة الاشتراك: إيقاف/استئناف/إغلاق
- سجل الصفقات المنسوخة والأرباح

**للسوبر أدمن** (`/admin/copy-trading` جديد):
- إدارة المزودين (CRUD)
- فتح/إغلاق صفقات Master (تنعكس تلقائياً على كل المشتركين)
- جدول كل الاشتراكات مع فلترة (نشط/موقوف/مغلق) + إجراءات (إيقاف/إغلاق)
- تعديل رصيد أي مستخدم يدوياً مع سبب إلزامي
- عرض `copy_audit_log` كامل

## الأمان
- كل الكتابات الحساسة عبر `createServerFn` + `requireSupabaseAuth` + فحص `has_role(...,'super_admin')` داخل الـ handler
- RLS صارم: المستخدم لا يرى إلا صفوفه، `super_admin` فقط يعدل صفقات master وأرصدة الآخرين
- Zod validation على كل input (مبالغ موجبة، حد أقصى، UUID صالح)
- rate limit على subscribe (منع duplicate خلال 10 ثوانٍ عبر trigger مشابه لـ `prevent_duplicate_subscription`)
- كل تعديل رصيد يدوي مسجّل في `copy_audit_log` مع `admin_id`, `reason`, `before/after`

## الملفات
- migration جديدة (الجداول + الدوال + السياسات)
- `src/lib/copy-trading.functions.ts` — server functions
- `src/routes/_authenticated/portal.copy-trading.tsx` — واجهة المستثمر
- `src/routes/_authenticated/_admin/admin.copy-trading.tsx` — لوحة السوبر أدمن
- تحديث `mobile-bottom-nav` / روابط البورتال لإضافة الصفحة

## الخطوات
1. Migration للجداول والدوال والسياسات
2. Server functions للاشتراك والإدارة
3. صفحة المستثمر مع تدفق الإيداع
4. صفحة الأدمن الكاملة
5. اختبار: اشتراك برصيد كافٍ، اشتراك بنقص رصيد → إيداع، إغلاق master trade، تعديل رصيد يدوي
