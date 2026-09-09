-- ═══════════════════════════════════════════════════════════════════
--  المرحلة 3 — الحماية الجوهرية: عمليات عبر الخادم + RLS
--
--  📌 التنفيذ بعد phase2.sql: Supabase → SQL Editor → Run (مرة واحدة).
--  بعد هذا الملف: لا يستطيع مفتاح anon قراءة/كتابة أي جدول —
--  كل العمليات تمر بمسارات الخادم (Service Role تتجاوز RLS).
--  ملاحظة: يتوقف realtime المباشر للمتصفح (تعتمد الصفحات الآن على
--  استطلاع دوري عبر مسارات الخادم — أُعيد تصميم الواجهات لذلك).
-- ═══════════════════════════════════════════════════════════════════

-- 1) رمز «الراكب» الخاص بكل رحلة (يثبت ملكية الراكب لرحلة معينة)
alter table public.rides
  add column if not exists rider_token text;

create index if not exists rides_rider_token_idx on public.rides (rider_token);

-- 2) أعمدة موقع السائق الحالي (إن لم تكن موجودة من المرحلة 2)
alter table public.drivers
  add column if not exists current_lat double precision;

alter table public.drivers
  add column if not exists current_lng double precision;

-- 3) تفعيل RLS — بدون أي سياسة للمجهول = رفض تام لمفتاح anon
alter table public.rides   enable row level security;
alter table public.drivers enable row level security;
alter table public.otp_codes enable row level security;

-- 4) قطع صريح لأدوار المتصفح (anon/authenticated) — خادمنا فقط عبر service_role
revoke all on table public.rides, public.drivers, public.otp_codes
  from anon, authenticated;

-- (service_role يتمتع BYPASSRLS فيتجاوز الحظر — وهذا هو المستخدم الوحيد الآن)

-- 5) ملاحظة: عند الحاجة لفتح مسار محدد للمتصفح مستقبلاً أضف سياسة:
-- create policy "rides anon insert pending" on public.rides
--   for insert to anon with check (status = 'pending');
