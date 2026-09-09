# HOTFIX-NOTES — إصلاح أمني شامل (فرع `hotfix-security`)

> المرجع الكامل لكل تغيير في الإصلاح وسببه وكيفية اختباره.
> الإصلاح مبني على `main` (`1d7cfd5`) — ولا يحتاج أي شيء سوى ضبط المتغير `RAKSHTAK_ADMIN_TOKEN`.

## 0) لمحة عامة

التطبيق كان يعمل بنظامين متوازيين:
1. **النظام الحي (Supabase مباشرة من المتصفح):** `/` و`/driver` و`/admin` — بجدول `rides` (أعمدته `passenger_name/phone_number/offered_price/service_type/status`).
2. **النظام القديم (مسارات `/api` على Neon/Drizzle):** `/api/rides`, `/api/rides/[id]`, `/api/admin/stats`, `/admin/stats`, `/api/auth/login`, `/api/user/update` وصفحات `/request`, `/searching`, `/dashboard`, `/login`, `/track/[id]` — بجداول `rides` (أعمدتها `serviceType/pickupLocation/customerPhone/status`) و`users` و`ratings`.

**الأصل:** أي شخص كان يستطيع — بدون أي تسجيل دخول — سحب كل الرحلات مع `customerPhone` و`bankAccount`، وتعديلها، وقراءة إحصائيات الأدمن، والدخول بأي حساب برمز `1234` المعروف.

## 1) قفل مسارات `/api` + منع تسريب الحقول

- `src/lib/admin.ts` (جديد): `requireAdminToken(request)` بمقارنة ثابتة الزمن.
- القفل على: `GET/POST /api/rides`, `PATCH /api/rides/[id]`, `GET /api/admin/stats`, `GET /admin/stats`, `PATCH /api/user/update` — الترويسة `x-admin-token` (أو Bearer). بدون ضبط `RAKSHTAK_ADMIN_TOKEN` أصلاً → **403 دائماً** (الوضع الآمن المتعمّد).
- **منع إرجاع الحقول الحساسة**: أُلغي join `users` في `GET /api/rides` (كان يسحب `bankAccount`)، وأُزيل `customerPhone`/`customerName` من كل اختيارات الأعمدة.
- `src/db/index.ts`: اتصال **كسول** — البوابة ترد أولاً (403/503) ولا تُلمس قاعدة البيانات إلا بعد التصريح (كانت تُنشأ عند الاستيراد فتكسر المسار إن نقص `DATABASE_URL`).

## 2) إصلاح `PATCH /api/rides/[id]`

- **لا مسح للحقول غير المرسلة**: بناء كائن `updates` من الحقول الموجودة فقط (`!== undefined`)؛ الحقل الغائب يبقى كما هو، و`null` الصريح = مسح مقصود.
- **قائمة حالات مسموحة**: `searching/accepted/arrived/completed/cancelled` — غيرها 400.
- **تقييمات بلا تكرار**: تُسجَّل مرة واحدة لكل جهة عند الانتقال إلى `completed` فقط، مع فحص وجود سابق (UPDATE بدل INSERT) وإعادة حساب المتوسط؛ و`toUserId` لا يقبل إلا رقماً صحيحاً موجباً.
- إشعار Pusher فقط عند تغيّر الحالة فعلياً.

## 3) إلغاء الرمز الثابت `1234` في `/api/auth/login`

- لا `1234` في الخادم ولا في صفحة `/login`. الخدمة موقوفة **503** برسالة واضحة حتى تُفعَّل خدمة OTP حقيقية (المرحلة 2). التعطيل المتعمّد خير من باب مفتوح برمز معروف.

## 4) بوابة إدارية لصفحتَي `/admin` و`/dashboard` + حذف `firebase-messaging-sw.js`

- `src/components/AdminGate.tsx` (جديد): شاشة قفل تطلب الرمز وتخزّنه في `sessionStorage` مع `get/clear`.
- `/admin` و`/dashboard` داخل البوابة؛ و`/dashboard` أُصلح (كان يستورد باكتج غير موجود `@supabase/supabase-rb` وكان سيكسر البناء، ويقرأ شكلاً خاطئاً من البيانات).
- **حذف**: `public/firebase-messaging-sw.js` (كان مرفوعاً بمفاتيح Firebase كاملة مكشوفة ولا يُستدعى من أي مكان) و`src/app/admin/page/tsx` (ملف بلا امتداد ميت).

## 5) لوحة السائق — `src/app/driver/page.tsx`

- **قفل القبول المزدوج**: قبول شرطي `.eq("status","pending")` + قفل `acceptingRef` ضد الضغط المتكرر + منع القبول أثناء مشوار حالي. الإنهاء شرطي أيضاً (`.eq("status","accepted")`).
- **«مشواري أنا» فقط**: الرحلة الحالية تُعرض فقط إذا كان `driver_phone` = رقمي (كانت تظهر رحلات سائقين آخرين!).
- **اشتراك realtime واحد** لكل تسجيل دخول (كان `useEffect` يعتمد على `currentRide` فيعاد الاشتراك كل تحديث) — المقارنات عبر refs.
- **تنبيه WebAudio داخلي** بدون ملف خارجي، يُشغَّل عند زيادة فعلية في الطلبات.
- **قناع الحساب البنكي** (`••••••7890`) مع إظهار/إخفاء.
- توحيد رقم الهاتف بصيغة `+2499XXXXXXXX`.

## 6) صفحة الراكب — `src/app/page.tsx`

- تنظيف المدخلات (trim + maxLength) وتحقق أدق من الهاتف (أصلح تكرار `+249` عند الإدخال).
- **مهلة بحث** 120 ثانية بعدّاد + زرار «🔥 زوّد السعر ٢٠٪» (تحديث فعلي في Supabase + إعادة تشغيل العداد).
- **تنسيق السعر** بفواصل الآلاف، ومسح ذكي لـ`active_ride_id` (الملغاة والمكتملة لا تعود بعد التحديث).

## 7) `service-worker.js` — لا تخزين لصفحات HTML

v3: التنقّل (HTML) من الشبكة فقط بلا كاش ولا fallback؛ `/api/*` معفاة؛ الخارجي لا يُخزَّن؛ الأصول الثابتة فقط stale-while-revalidate.

## 8) نظافة Git والبناء

- script `typecheck` جديد، و`next.config.mjs` لم يعد يتجاهل أخطاء الأنواع، و`.gitignore` كامل (`.next/` وغيرها)، و`.env.example` يوثق المتغيرات.

## 9) الاختبار المحلي

```bash
npm install && npm run typecheck   # 0 أخطاء
npm run build                       # ينجح
curl -i localhost:3000/api/rides | head -1                      # 403
curl -i localhost:3000/api/admin/stats | head -1                # 403
curl -i -X PATCH localhost:3000/api/user/update -d '{}' | head -1    # 403
curl -i -X POST localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{"phone":"0912345678"}' | head -1   # 503
```

## 10) خطوة Vercel

أضف `RAKSHTAK_ADMIN_TOKEN` (Production + Preview) ثم **Redeploy** — بدونه تبقى كلها مقفولة (الوضع الآمن المتعمّد). اختبر: `/api/rides` → 403، و`/` و`/driver` يعملان.

## 11) خارج هذا الإصلاح (المرحلة 2)

Supabase الموحّد، OTP حقيقي وجداول `drivers`، فلتر الأقرب `pickup_lat/lng`، توحيد `service_type`، و`driver_id` integer FK — مفصّل في `PHASE2-NOTES.md`.
