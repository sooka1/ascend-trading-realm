## الوضع الحالي

نظام الترجمة موجود في `src/lib/i18n.tsx` مع 5 لغات (ar/en/fr/es/tr) و`useI18n()`، لكن معظم الصفحات لا تستخدمه — النصوص مكتوبة مباشرة بالإنجليزية:

| مستخدم i18n | لا يستخدمه (نصوص ثابتة) |
|---|---|
| `index.tsx`, `portfolios.tsx` (جزئياً)، وبعض ملفات المحتوى | `auth.tsx` (الحالية), `forgot-password.tsx`, `reset-password.tsx`, `about.tsx`, `brand.tsx`, `contact.tsx`, `education.tsx`, `faq.tsx`, `legal.tsx`, `markets.tsx`, `performance.tsx`, `privacy.tsx`, `risk.tsx`, `solutions.tsx`, `terms.tsx`, وكل ملفات `_authenticated/*` |

المجموع ≈ 20 صفحة، بعضها كبير جداً (auth 552 سطر، dashboard 429، app 394).

## الخطة

بسبب حجم العمل الكبير، سأنفذها على مراحل. **مرحلة 1** الآن، والمراحل التالية عند طلبك.

### المرحلة 1 — الصفحة الحالية `/auth` + صفحات كلمة السر (الآن)
- إضافة مفاتيح ترجمة `auth.*` في `DICTS` للغات الخمس (تسجيل الدخول/التسجيل، حقول، أخطاء، تأكيد البريد، إعادة الإرسال…)
- استبدال جميع النصوص الثابتة في `auth.tsx` + `forgot-password.tsx` + `reset-password.tsx` بـ `t("auth....")`
- تطبيق `dir="rtl"` تلقائياً على العربية عبر `useI18n().dir`
- تحديث `head()` ليعيد العنوان/الوصف بلغة المستخدم

### المرحلة 2 — الصفحات العامة الثابتة
`about, brand, contact, faq, legal, privacy, terms, risk, solutions, education, markets, performance` — إضافة قواميس `page.*` واستبدال النصوص.

### المرحلة 3 — منطقة العميل (`_authenticated/*`)
`app.tsx, dashboard.tsx, portal.tsx, app.portfolio, app.profile, app.activity` — قواميس `portal.*` + `dashboard.*`.

### المرحلة 4 — المكونات المشتركة
مراجعة `page-shell`, `site-header`, `site-footer`, نماذج، رسائل toast للتأكد من أن كل نص يمر عبر `t()`.

## التفاصيل التقنية

- كل مفتاح جديد يُضاف في **الخمس لغات** لتجنّب تسرّب اللغة الافتراضية (`i18n-coverage.ts` يفرض ذلك).
- الترجمات العربية = المصدر، والباقي مترجمة يدوياً بجودة رسمية للمنصة المالية.
- نصوص الأخطاء المُنبثقة من Supabase تُعرض عبر خريطة `authError.<code>` بدل رسائل SDK الإنجليزية.
- عناصر `Route.head()` تبقى ثابتة (SSR) بالإنجليزية لأنها ما قبل الـhydration، لكن سنضيف تحديثاً في `useEffect` يعدّل `document.title` باللغة الحالية.

## المخرجات المتوقعة للمرحلة 1

- تحديث: `src/lib/i18n.tsx` (+ ~60 مفتاح × 5 لغات)
- تحديث: `src/routes/auth.tsx`, `src/routes/forgot-password.tsx`, `src/routes/reset-password.tsx`

هل أبدأ بالمرحلة 1 مباشرة، أم تريد تنفيذ الأربع مراحل دفعة واحدة (عمل أكبر بكثير)؟
