# PHASE2-NOTES — توحيد قاعدة البيانات على Supabase

> المرجع الكامل لتغييرات **المرحلة 2** (فوق فرع `hotfix-security`).

## 0) الخطوات العملية بعد استلام الكود
1. دمج `hotfix-security` أولاً (إن لم يدمج بعد).
2. تطبيق كود المرحلة 2 ودمجه.
3. **Supabase → SQL Editor → نفّذ `supabase/phase2.sql`** (مرة واحدة).
4. Vercel: أضف `SUPABASE_SERVICE_ROLE_KEY` (و`RAKSHTAK_OTP_WEBHOOK_URL` عند توفّر مزوّد إرسال) ثم Redeploy.

## 1) حذف طبقة Neon/Drizzle نهائياً
- حُذف: `src/db/`, `drizzle.config.ts`, مسارات `/api` القديمة (`rides`, `rides/[id]`, `admin/stats`, `auth/login`, `user/update` ونسخة `admin/stats`), `src/lib/supabaseClient.ts`.
- حُذفت صفحات النظام القديم/الوهمية: `/request`, `/searching`, `/login`, `/dashboard`, `/track/[id]`, `/track-ride`, `/history`, `/profile`, `/setup-profile`.
- حُذفت الاعتماديات: `@neondatabase/serverless`, `drizzle-orm`, `pg`, `pusher`, `pusher-js`.
- بعدها التطبيق كله Supabase، وكل استعلام عبر `supabase.ts` (متصفح) أو `supabaseAdmin.ts` (خادم).

## 2) توثيق حقيقي للسائق — OTP + جدول `drivers`
### SQL (`supabase/phase2.sql`)
- `drivers`: id bigint PK، phone فريد (+2499XXXXXXXX)، name، bank_account، vehicle_type، auth_token، is_online، current_lat/lng، avg_rating/total_ratings.
- `otp_codes`: phone + code_hash (SHA-256) + expires_at + attempts.
- `rides` +: `driver_id bigint references drivers(id)`، `pickup_lat`، `pickup_lng` وفهرس `(status, pickup_lat, pickup_lng)`.

### مسارات الخادم (Service Role)
`POST /api/driver/request-otp` → `POST /api/driver/verify-otp` → `GET /api/driver/me` → `PATCH /api/driver/profile` (بترويسة `x-driver-token`).

### قواعد أمنية
- الرمز مبشور SHA-256، صلاحية 5 د، 5 محاولات كحد أقصى، يُتلف بعد أول نجاح.
- `RAKSHTAK_OTP_WEBHOOK_URL` (اختياري): إن ضُبط يُرسل {phone, code}؛ خارج الإنتاج وبدونه يُعاد الرمز `previewCode` للتجربة؛ **في الإنتاج وبدونه 503 (لا باب خلفي)**.
- الحساب البنكي يبقى على الخادم ويُعرض مقنّعاً.

## 3) `driver_id` integer FK
- القبول يكتب `driver_id = drivers.id` + `driver_phone` للتوافق القديم.
- «مشواري أنا»: مطابقة أساسية عبر `driver_id` واحتياط عبر `driver_phone`.
- الإنهاء شرطي `driver_id`/`driver_phone` وحالة `accepted` فقط.

## 4) فلتر «الأقرب» عبر `pickup_lat/lng`
- الراكب يرسل إحداثيات التحرك عند الإنشاء.
- السائق يحدد موقعه (geolocation) → استعلاما bbox (±10 كم) + طلبات بلا إحداثيات → ترتيب بمسافة هافرسين مع شارة المسافة.

## 5) توحيد `service_type` والحالات
- `SERVICE_TYPES` مصدر الحقيقة (عربي)، `serviceTypeLabel()` تطبع القديم (`ride/goods`)، `canonicalRideStatus()` تحوّل `searching→pending` و`arrived→accepted`، و`STATUS_META` للعرض.

## 6) بوابة /admin بتحقق خادمي
- `POST /api/admin/verify` يقارن بـ `RAKSHTAK_ADMIN_TOKEN` (مقارنة ثابتة الزمن)؛ `AdminGate` يتحقق من الخادم عند الإدخال وعند استعادة جلسة مخزنة.

## 7) ما زال مفتوحاً (يُنفَّذ في المرحلة 3)
- RLS على `rides/drivers/otp_codes` ونقل كل عمليات الرحلات إلى الخادم (نموذج SQL جاهز في نهاية `supabase/phase2.sql`).

## 8) الفحوصات (تمت محلياً)
```bash
npm run typecheck   # 0 أخطاء
npm run build       # ينجح — 8 مسارات فقط
# / /driver /admin → 200 | المحذوفة → 404
# /api/admin/verify: بلا مفتاح 403 / صحيح 200
# /api/driver/request-otp بلا مفتاح خادم → 503 برسالة واضحة
# /api/driver/me بلا جلسة → 401
```

## 9) متغيرات Vercel النهائية بعد المرحلتين
`RAKSHTAK_ADMIN_TOKEN` (نعم) • `NEXT_PUBLIC_SUPABASE_URL` (نعم) • `NEXT_PUBLIC_SUPABASE_ANON_KEY` (نعم للتطبيق الحي) • `SUPABASE_SERVICE_ROLE_KEY` (نعم — سري) • `RAKSHTAK_OTP_WEBHOOK_URL` (عند الإطلاق). بعد أي تغيير: **Redeploy**.
