// Edge Function: send-push
// الهدف: استقبال طلب من قاعدة البيانات (عند وصول رسالة جديدة) وإرسال
// إشعار Push حقيقي لكل أجهزة المستلم المشترَكة — يظهر حتى لو التطبيق مقفول تماماً.
//
// ينشر هذا الملف عبر: supabase functions deploy send-push --no-verify-jwt
// ويحتاج إعداد Secrets التالية قبل النشر:
//   supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@example.com
//   (SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY متوفرتان تلقائياً داخل أي Edge Function)

import { createClient } from "npm:@supabase/supabase-js@2";
import webPush from "npm:web-push@3";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@samsar-sudan.app";

webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  try {
    const { phone_number, title, body, conversation_id } = await req.json();

    if (!phone_number) {
      return new Response(JSON.stringify({ error: "phone_number مطلوب" }), { status: 400 });
    }

    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("phone_number", phone_number);

    if (error) throw error;
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: "no subscriptions" }), { status: 200 });
    }

    const payload = JSON.stringify({
      title: title || "سمسار السودان 🔔",
      body: body || "لديك رسالة جديدة",
      conversation_id,
      icon: "https://gfqrutdwvtqxtfgndyhd.supabase.co/storage/v1/object/public/media/public/icons/icon-192.png",
      badge: "https://gfqrutdwvtqxtfgndyhd.supabase.co/storage/v1/object/public/media/public/icons/icon-192.png",
    });

    let sent = 0;
    const errors: any[] = [];
    for (const sub of subs) {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
        sent++;
      } catch (err: any) {
        // مؤقتاً: لا نحذف أي اشتراك، فقط نسجّل تفاصيل الخطأ الحقيقي لتشخيصه
        errors.push({
          statusCode: err?.statusCode,
          body: err?.body,
          message: err?.message || String(err),
        });
      }
    }

    return new Response(JSON.stringify({ sent, total: subs.length, errors }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
