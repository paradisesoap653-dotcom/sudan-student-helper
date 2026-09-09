# المرحلة 3 — الحماية الجوهرية 🔒 (Server-Only Ops + RLS)

**Rakshtak / ركشتك** — نقل كل عمليات الرحلات من المتصفح إلى مسارات الخادم، وتفعيل
Row Level Security على Supabase، مع رمز «الراكب» الخاص بكل رحلة.

| | |
| --- | --- |
| الفرع | `phase3-server-ops` |
| الالتزام | `cc0d59d` |
| الأساس (المرحلة 2) | `b1e323b` (`phase2-supabase`) |
| الحالة | ✅ typecheck 0 أخطاء · build ناجح · فحوصات تشغيل ناجحة |

---

## 1) ماذا تغيّر ولماذا؟

**قبل المرحلة 3:** صفحة الراكب والسائق والأدمن كانت تقرأ/تكتب جدول `rides` مباشرة
من المتصفح بمفتاح anon عبر مكتبة `@supabase/supabase-js`، وrealtime المباشر يفضح
كل تحديث. أي زائر يستطيع قراءة كل الرحلات وتعديلها إذا لم تكن RLS مفعّلة.

**بعد المرحلة 3:**
- المتصفح **لا يملك أي مفتاح** — حُذف عميل anon من الكود نهائياً
  (`src/lib/supabase.ts` أُلغي، و`NEXT_PUBLIC_SUPABASE_ANON_KEY` لم يعد مطلوباً).
- كل عملية رحلة تمر بمسار خادم يتحقق من هوية صاحب الطلب ثم ينفذها
  بمفتاح **service_role** (الذي يتجاوز RLS بطبيعته — وهو المستخدم الوحيد المصرح).
- `supabase/phase3.sql` يفعّل RLS على الجداول الثلاثة `rides`/`drivers`/`otp_codes`
  **بلا أي سياسة لـ anon** ويرفع (`revoke`) صلاحيات `anon` و`authenticated`:
  أي وصول مباشر من المتصفح للجداول يُرفض على مستوى قاعدة البيانات نفسها.
- إضافة عمود `rider_token` (رمز عشوائي 48 خانة hex لكل رحلة) — يثبت ملكية الراكب
  لرحلته: بدون هذا الرمز لا يستطيع أحد قراءة حالة رحلة غير رحلته أو إلغاءها أو
  رفع سعرها، حتى لو وصل المفتاح السري لاحقاً (طبقة دفاع ثانية).

## 2) مسارات الخادم الجديدة (كلها تطلب ترويسات هوية)

| المسار | الاستخدام | الترويسة المطلوبة |
| --- | --- | --- |
| `POST /api/rides` | إنشاء طلب رحلة (تحقق كامل بالمدخلات) | عام — يثبت نفسه بالرمز الجديد |
| `GET /api/rides/[id]` | استطلاع حالة الرحلة (الراكب) | `x-rider-token` |
| `POST /api/rides/[id]/cancel` | إلغاء | `x-rider-token` أو `x-driver-token` أو `x-admin-token` |
| `POST /api/rides/[id]/raise` | رفع السعر ٢٠٪ (أثناء البحث فقط) | `x-rider-token` |
| `POST /api/rides/[id]/accept` | قبول السائق — تحديث شرطي `WHERE status='pending'` يمنع القبول المزدوج (المتنافس الخاسر: 409) | `x-driver-token` |
| `POST /api/rides/[id]/complete` | إنهاء المشوار (السائق المعيّن فقط) | `x-driver-token` |
| `GET /api/driver/rides?lat&lng` | الطلبات القريبة (10 كم بلا حدود + هافرسين) + «مشواري أنا» فقط | `x-driver-token` |
| `POST /api/driver/location` | تحديث موقع السائق المخزّن | `x-driver-token` |
| `GET /api/admin/rides` | آخر 100 رحلة + إحصائيات بالحالات الموحّدة | `x-admin-token` |
| `POST /api/admin/rides/[id]/lock` | إعادة فتح مشوار عالق (accepted ← pending ومسح السائق) | `x-admin-token` |
| `DELETE /api/admin/rides/[id]` | حذف نهائي | `x-admin-token` |

قواعد عدم تسريب البيانات في كل الردود:
- **أبداً** لا يُعاد `rider_token` أو `auth_token` أو `code_hash` في أي استجابة.
- `toSafeRide` يُخرج حقولاً محددة فقط (بلا `rider_token`، وبلا رقم الراكب في ردود
  الراكب نفسه؛ رقم الراكب يظهر للسائق المعيّن فقط عبر `toDriverRide`).
- مسار استطلاع الراكب `GET /api/rides/[id]` يرفض (403) أي طلب برمز لا يطابق
  الرحلة — لا يمكن تعداد الرحلات أو تجسس حالتها.

## 3) تغييرات الواجهات (ملاحظة مهمة للمستخدمين)

- **توقف Supabase Realtime للمتصفح** بعد phase3.sql (كان يسمح بقراءة anon).
  الصفحات الثلاث تعمل الآن باستطلاع دوري عبر مسارات الخادم:
  - صفحة الراكب `/`: كل **4 ثوانٍ**
  - لوحة السائق `/driver`: كل **5 ثوانٍ** (+ تنبيه صوتي للطلبات الجديدة فعلاً)
  - لوحة الأدمن `/admin`: كل **15 ثانية** + زر تحديث يدوي
- رمز الراكب يُحفظ في `localStorage` بمفتاح `rider_token` (مع `active_ride_id`)
  ويعود تلقائياً عند فتح الصفحة لاستكمال المشوار؛ مسارات الخادم لا تخزّن رمز
  الراكب في أي جلسة كوكيز — لا حاجة لتغيير شيء في الإعدادات.
- لوحة الأدمن أضافت «🔓 إعادة فتح للسائقين» للرحلات العالقة في `accepted`.

## 4) خطوات التشغيل (مرة واحدة)

1. **Supabase → SQL Editor:**
   - نفّذ `supabase/phase2.sql` (إن لم يُنفّذ سابقاً — الجداول + OTP + الأعمدة).
   - ثم نفّذ `supabase/phase3.sql` (رider_token + RLS + منع anon). ✅
2. **Vercel → Settings → Environment Variables** (Production + Preview):
   - `RAKSHTAK_ADMIN_TOKEN` (موجود من قبل — أبقِه)
   - `NEXT_PUBLIC_SUPABASE_URL` (موجود)
   - `SUPABASE_SERVICE_ROLE_KEY` (موجود من المرحلة 2 — أبقِه)
   - `RAKSHTAK_OTP_WEBHOOK_URL` (اختياري)
   - **`NEXT_PUBLIC_SUPABASE_ANON_KEY`: لم يعد مستخدماً — يمكن حذفه بأمان.**
3. أعد النشر. تحقق سريع: افتح تبويب Console — يجب ألا يوجد أي طلب لـ
   `supabase.co/rest/v1` من المتصفح إطلاقاً.

### التحقق الأمني السريع
جرّب في Supabase SQL Editor بعد التفعيل:
```sql
-- يجب أن يفشل (ممنوع على anon):
set role anon;
select * from public.rides;
select * from public.drivers;
reset role;
```

## 5) نتائج الفحوصات (نُفذت ضد هذا الكود)

- `npm run typecheck` → 0 أخطاء
- `npm run build` → نجاح كامل (الصفحات الست ثابتة + 15 مسار API ديناميكي
  `force-dynamic` — بلا أي تحذير DYNAMIC_SERVER_USAGE)
- فحوصات زمن التشغيل (dev، بدون متغيرات بيئة):
  - POST /api/rides بمدخلات ناقصة → **400** برسالة عربية
  - POST /api/rides صالح وبلا service key → **503** برسالة واضحة
  - GET /api/rides/1 بدون رمز راكب → **401**
  - POST cancel بدون أي رمز → **401**
  - GET /api/driver/rides و location بدون رمز سائق → **401**
  - POST request-otp بلا إعداد → **503**
  - GET/DELETE /api/admin/rides بلا رمز إدارة → **403**
  - الصفحات `/` و`/driver` و`/admin` → **200**

## 6) الملفات

| الملف | المحتوى |
| --- | --- |
| `rakshtak-phase3.patch` | الفرق الكامل `b1e323b..cc0d59d` (25 ملفاً، نظيف من .next) |
| `rakshtak-phase3-files.zip` | الشجرة الكاملة عند `cc0d59d` (80 ملفاً — جاهزة للرفع فوق المرحلة 2) |
| `supabase/phase3.sql` | داخل المشروع — SQL التفعيل أعلاه |

**التطبيق:** انسخ فرع `phase2-supabase` (أو طبّق رقعتي المرحلتين بالترتيب
hotfix ← phase2 ← phase3)، أو استبدل الملفات من zip المرحلة 3 فوق نسخة
المرحلة 2.

## 7) فكرة للمرحلة 4 (قابلة للنقاش لاحقاً)
شاشة تقييم الراكب/السائق بعد كل مشوار — `drivers` يحمل `avg_rating` و
`total_ratings` جاهزين، ويمكن إضافة `rider_rating` لرحلات `completed`.
