// Edge Function: send-push
// الهدف: استقبال طلب من قاعدة بيانات ركشتك (عند إضافة/تحديث مشوار) وإرسال
// إشعار Push حقيقي لصاحب الهاتف المطلوب — يظهر حتى لو التطبيق مقفول تماماً.
//
// يُنشر عبر لوحة Supabase (Edge Functions -> Via Editor) مع تعطيل
// "Verify JWT with legacy secret" — لأن قاعدة البيانات تناديه بدون توكن مصادقة.
//
// يحتاج إعداد الأسرار التالية من تبويب Secrets قبل النشر:
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (مثال: mailto:you@example.com)
//   (SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY متوفرتان تلقائياً داخل أي Edge Function)

import { createClient } from "npm:@supabase/supabase-js@2";
import webPush from "npm:web-push@3";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@rakshtak.app";

webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const APP_ICON = "https://oskpxioxasyyfyhpbqkv.supabase.co/storage/v1/object/public/Picture/icon.png";

Deno.serve(async (req) => {
  try {
    const { phone_number, broadcast_role, title, body, ride_id, target } = await req.json();

    let subs: any[] | null = null;
    let error: any = null;

    if (broadcast_role) {
      // إشعار جماعي لكل من هم بنفس الدور (مثلاً كل السائقين عند وصول طلب جديد)
      const res = await supabase.from("push_subscriptions").select("*").eq("role", broadcast_role);
      subs = res.data;
      error = res.error;
    } else if (phone_number) {
      // إشعار فردي لرقم هاتف معيّن
      const res = await supabase.from("push_subscriptions").select("*").eq("phone_number", phone_number);
      subs = res.data;
      error = res.error;
    } else {
      return new Response(JSON.stringify({ error: "phone_number أو broadcast_role مطلوب" }), { status: 400 });
    }

    if (error) throw error;
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: "no subscriptions" }), { status: 200 });
    }

    const payload = JSON.stringify({
      title: title || "ركشتك 🛺",
      body: body || "لديك تحديث جديد",
      ride_id,
      target,
      icon: APP_ICON,
      badge: APP_ICON,
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
