-- ============================================================
-- ركشتك (Rakshtak) — إضافة نظام الإشعارات الفورية (Push Notifications)
-- ينفَّذ هذا الملف مرة واحدة في SQL Editor على مشروع Supabase الخاص بركشتك
-- (المشروع المعروض في الداشبورد باسم "Rakshtak")
-- ============================================================

-- ------------------------------------------------------------
-- 1) جدول اشتراكات الإشعارات (كل جهاز/متصفح يشترك مرة، مرتبط برقم الهاتف والدور)
--    role: 'driver' أو 'rider' — عشان نقدر نبعت إشعار جماعي لكل السائقين
--    (مثلاً عند وصول طلب مشوار جديد) أو إشعار فردي لراكب/سائق معيّن.
-- ------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,          -- رقم صاحب الجهاز
  role text not null default 'rider' check (role in ('driver', 'rider')),
  endpoint text not null unique,       -- رابط الاشتراك الفريد لهذا الجهاز/المتصفح
  p256dh text not null,                -- مفتاح تشفير الإشعار (يوفره المتصفح)
  auth text not null,                  -- مفتاح مصادقة الإشعار (يوفره المتصفح)
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_phone_idx on public.push_subscriptions (phone_number);
create index if not exists push_subscriptions_role_idx on public.push_subscriptions (role);

alter table public.push_subscriptions enable row level security;

drop policy if exists "public read/write push_subscriptions" on public.push_subscriptions;
create policy "public read/write push_subscriptions" on public.push_subscriptions for all using (true) with check (true);

-- ------------------------------------------------------------
-- 2) دالة + Trigger: عند إضافة/تعديل مشوار في جدول rides، ننادي
--    Edge Function اسمها "send-push" لترسل إشعاراً حقيقياً للطرف المعني
-- ------------------------------------------------------------
create extension if not exists pg_net;

create or replace function public.notify_ride_change()
returns trigger
language plpgsql
security definer
as $$
declare
  project_url text := 'https://oskpxioxasyyfyhpbqkv.supabase.co';
  -- ⚠️ استبدل القيمة دي بمفتاح anon/public الحقيقي بتاع مشروع Rakshtak
  -- (من Project Settings -> API -> anon public) — لازم يكون هنا وإلا
  -- بوابة Supabase هترفض الطلب بخطأ 401 UNAUTHORIZED_NO_AUTH_HEADER
  anon_key text := 'ضع_مفتاح_anon_هنا';
begin
  -- 1) طلب مشوار جديد (pending) -> نبلّغ كل السائقين المشتركين (broadcast)
  if TG_OP = 'INSERT' and new.status = 'pending' then
    perform net.http_post(
      url := project_url || '/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || anon_key,
        'apikey', anon_key
      ),
      body := jsonb_build_object(
        'broadcast_role', 'driver',
        'title', 'طلب مشوار جديد 🛺',
        'body', 'من: ' || coalesce(new.pickup_location, 'الموقع') || ' - إلى: ' || coalesce(new.destination, 'الوجهة'),
        'ride_id', new.id,
        'target', 'driver'
      )
    );
    return new;
  end if;

  if TG_OP = 'UPDATE' then
    -- 2) صار المشوار "accepted" (سواء قبول مباشر أو بعد اتفاق على سعر المفاصلة) -> نبلّغ الراكب مرة واحدة فقط
    if old.status = 'pending' and new.status = 'accepted' and new.driver_phone is not null and old.driver_phone is null then
      perform net.http_post(
        url := project_url || '/functions/v1/send-push',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || anon_key,
          'apikey', anon_key
        ),
        body := jsonb_build_object(
          'phone_number', new.phone_number,
          'title', 'ركشتك 🛺',
          'body', 'تم قبول طلبك! السائق في الطريق إليك',
          'ride_id', new.id,
          'target', 'rider'
        )
      );
    end if;

    -- 3) السائق اقترح سعر جديد (مفاصلة) -> نبلّغ الراكب
    if new.counter_status = 'pending' and new.counter_by = 'driver'
       and (old.counter_price is distinct from new.counter_price or old.counter_by is distinct from new.counter_by) then
      perform net.http_post(
        url := project_url || '/functions/v1/send-push',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || anon_key,
          'apikey', anon_key
        ),
        body := jsonb_build_object(
          'phone_number', new.phone_number,
          'title', 'ركشتك 🛺',
          'body', 'سائق اقترح عليك سعر جديد: ' || coalesce(new.counter_price::text, ''),
          'ride_id', new.id,
          'target', 'rider'
        )
      );
    end if;

    -- 4) الراكب اقترح سعر جديد (مفاصلة) -> نبلّغ السائق صاحب المفاصلة
    if new.counter_status = 'pending' and new.counter_by = 'rider' and new.counter_driver_phone is not null
       and (old.counter_price is distinct from new.counter_price or old.counter_by is distinct from new.counter_by) then
      perform net.http_post(
        url := project_url || '/functions/v1/send-push',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || anon_key,
          'apikey', anon_key
        ),
        body := jsonb_build_object(
          'phone_number', new.counter_driver_phone,
          'title', 'ركشتك 🛺',
          'body', 'الراكب اقترح عليك سعر جديد: ' || coalesce(new.counter_price::text, ''),
          'ride_id', new.id,
          'target', 'driver'
        )
      );
    end if;

    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists on_ride_change_send_push on public.rides;
create trigger on_ride_change_send_push
  after insert or update on public.rides
  for each row
  execute function public.notify_ride_change();
