# Rakshtak — ركشتك

تطبيق النقل والترحال والشحن 🛺 — Next.js + Supabase (قاعدة بيانات موحّدة).

## التشغيل محلياً

```bash
npm install
cp .env.example .env.local   # ثم املأ القيم
npm run typecheck            # يجب أن يكون 0 أخطاء
npm run build
npm run dev
```

## المتغيرات المطلوبة

| المتغير | الوصف |
| --- | --- |
| `RAKSHTAK_ADMIN_TOKEN` | **بوابة الإدارة** — بدون قيمته تبقى `/admin` مقفولة (403) — ولّده بـ `openssl rand -hex 24` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase (الخادم — يُستخدم في مسارات الـ API فقط) |
| `SUPABASE_SERVICE_ROLE_KEY` | مفتاح الخادم السري — كل عمليات الرحلات والسائقين وOTP تمر به (بعد RLS لا يملك المتصفح أي مفتاح) |
| `RAKSHTAK_OTP_WEBHOOK_URL` | (اختياري) مزوّد إرسال رمز التحقق SMS/واتساب — يُستدعى POST `{phone, code}` |

## الصفحات

- `/` — الراكب: طلب مشوار (يرسل `pickup_lat/lng` من الخريطة لتفعيل «الأقرب»)
- `/driver` — السائق: دخول برمز OTP حقيقي + جدول `drivers` + فلتر الطلبات الأقرب خلال 10 كم
- `/admin` — لوحة الإدارة (خلف `RAKSHTAK_ADMIN_TOKEN` يتحقق منه الخادم)

## التفعيل (مرة واحدة بعد النشر)

1. نفّذ ملف `supabase/phase2.sql` في **Supabase → SQL Editor** (ينشئ `drivers` و`otp_codes` ويضيف `driver_id` و`pickup_lat/lng` لجدول `rides`).
2. نفّذ ملف `supabase/phase3.sql` بعدها (يضيف `rider_token` للرحلات ويفعّل RLS ويمنع `anon` من كل الجداول — من هذه اللحظة لا يلمس المتصفح قاعدة البيانات إطلاقاً وكل العمليات عبر مسارات الخادم).
3. أضف المتغيرات أعلاه في **Vercel → Settings → Environment Variables** (Production + Preview) وأعد النشر.
4. اختبر `/api/driver/request-otp` — خارج الإنتاج وبدون webhook يُعاد الرمز كـ `previewCode` للتجربة فقط.

ملاحظة: بعد المرحلة 3 توقّف Supabase Realtime للمتصفح — الصفحات تعتمد على استطلاع دوري عبر مسارات الخادم
(كل ٥ ثوانٍ في لوحة السائق / ٤ ثوانٍ في صفحة الراكب / ١٥ ثانية في لوحة الأدمن).

التوثيق الكامل: [`PHASE3-NOTES.md`](./PHASE3-NOTES.md) (المرحلة 3) و[`PHASE2-NOTES.md`](./PHASE2-NOTES.md) و[`HOTFIX-NOTES.md`](./HOTFIX-NOTES.md).
