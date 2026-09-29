-- ============================================================
-- سمسار السودان — إضافة نظام الإشعارات الفورية (Push Notifications)
-- ينفَّذ هذا الملف مرة واحدة في SQL Editor على مشروع Supabase
-- بعد تنفيذ schema.sql الأساسي
-- ============================================================

-- ------------------------------------------------------------
-- 1) جدول اشتراكات الإشعارات (كل جهاز/متصفح يشترك مرة، مرتبط برقم الهاتف)
-- ------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,          -- رقم صاحب الجهاز (+249...)
  endpoint text not null unique,       -- رابط الاشتراك الفريد لهذا الجهاز/المتصفح
  p256dh text not null,                -- مفتاح تشفير الإشعار (يوفره المتصفح)
  auth text not null,                  -- مفتاح مصادقة الإشعار (يوفره المتصفح)
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_phone_idx on public.push_subscriptions (phone_number);

alter table public.push_subscriptions enable row level security;

drop policy if exists "public read/write push_subscriptions" on public.push_subscriptions;
create policy "public read/write push_subscriptions" on public.push_subscriptions for all using (true) with check (true);

-- ------------------------------------------------------------
-- 2) دالة + Trigger: عند إضافة رسالة جديدة، ننادي Edge Function
--    اسمها "send-push" لترسل إشعاراً حقيقياً للطرف الآخر في المحادثة
-- ------------------------------------------------------------
create extension if not exists pg_net;

create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
as $$
declare
  conv record;
  recipient_phone text;
  project_url text := 'https://gfqrutdwvtqxtfgndyhd.supabase.co';
begin
  select * into conv from public.conversations where id = new.conversation_id;

  if conv is null then
    return new;
  end if;

  -- المستلم هو الطرف الآخر (مش مرسل الرسالة)
  if new.sender_phone = conv.buyer_phone then
    recipient_phone := conv.seller_phone;
  else
    recipient_phone := conv.buyer_phone;
  end if;

  -- ننادي Edge Function بشكل غير متزامن (async) عن طريق pg_net
  -- ملاحظة: دالة send-push منشورة بخيار --no-verify-jwt فلا تحتاج مفتاح مصادقة هنا
  perform net.http_post(
    url := project_url || '/functions/v1/send-push',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'phone_number', recipient_phone,
      'title', 'سمسار السودان 🔔',
      'body', case
        when new.message_type = 'voice' then '🎤 رسالة صوتية جديدة'
        when new.message_type = 'offer' then '💰 عرض سعر جديد: ' || coalesce(new.offer_price::text, '')
        else coalesce(new.body, 'رسالة جديدة')
      end,
      'conversation_id', new.conversation_id
    )
  );

  return new;
end;
$$;


drop trigger if exists on_new_message_send_push on public.messages;
create trigger on_new_message_send_push
  after insert on public.messages
  for each row
  execute function public.notify_new_message();
