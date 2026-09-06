# sudan-student-helper

تطبيق مساعد الطلاب — الشهادة السودانية، مبني باستخدام Next.js وSupabase.

## التشغيل محلياً

```bash
npm ci
cp .env.example .env.local
# أضف مفاتيحك في .env.local، ولا ترفع هذا الملف إلى Git.
npm run dev -- --hostname 0.0.0.0
```

## إعداد الدردشة وتشغيل Groq

يحاول `POST /api/chat` المزودين بهذا الترتيب: **Groq → Gemini → OpenAI → مقتطفات محلية**.
يُفعّل كل مزود تلقائياً عند وجود مفتاحه على الخادم؛ لا يلزم مفتاح OpenAI لتشغيل Groq.
إذا فشل مزود (خطأ مصادقة، حصة مستهلكة، نموذج غير متاح، رد فارغ، أو انتهاء المهلة)، ينتقل إلى التالي.

| المزود | مفتاح الخادم | متغير النموذج الاختياري | النموذج الافتراضي |
| --- | --- | --- | --- |
| Groq | `GROQ_API_KEY` | `GROQ_MODEL` | `openai/gpt-oss-20b` |
| Gemini | `GEMINI_API_KEY` | `GEMINI_MODEL` | `gemini-2.5-flash` |
| OpenAI | `OPENAI_API_KEY` | `OPENAI_MODEL` | `gpt-4o-mini` |

- Gemini يستخدم `generateContent` ومفتاحاً في ترويسة `x-goog-api-key`، وليس في عنوان الطلب. لا يستخدم `gemini-1.5-flash` القديم.
- نموذج Groq القديم `llama-3.1-8b-instant` أُوقف للحسابات المجانية وDeveloper في 16 أغسطس 2026؛ البديل الافتراضي هو GPT-OSS 20B المستضاف **على Groq**. راجع [جدول Groq الرسمي](https://console.groq.com/docs/deprecations).
- يمكن تغيير النماذج عبر متغيرات البيئة دون تعديل الكود. استخدم معرف نموذج نصي متاح لحسابك؛ راجع [نماذج Gemini](https://ai.google.dev/gemini-api/docs/models) و[نماذج Groq](https://console.groq.com/docs/models).
- مهلة كل مزود 15 ثانية، وميزانية البحث في الدروس 5 ثوانٍ؛ حد مسار الدردشة على Vercel هو 60 ثانية.
- لا تضف المفاتيح إلى كود المتصفح أو إلى متغيرات `NEXT_PUBLIC_*`، ولا ترسلها في المحادثات أو تسجلها في Git.

### التفعيل على Vercel

1. من المشروع افتح **Settings → Environment Variables**.
2. أضف `GROQ_API_KEY` من حسابك في Groq. أضف `GEMINI_API_KEY` إذا أردت بديلاً احتياطياً، و`OPENAI_API_KEY` اختيارياً فقط.
3. اختر **Production** للنشر الأساسي، و**Preview** لاختبار فرع العمل. راجع أيضاً أي تخصيص للمتغيرات على مستوى الفرع.
4. أعد النشر بعد إضافة المتغيرات أو تغييرها؛ التعديل لا يصل إلى نشر قائم تلقائياً.
5. افتح `/api/health` على عنوان ذلك النشر. ينبغي أن يظهر `providers.groq.configured: true` و`preferredProvider: "groq"`.
6. أرسل سؤالاً في `/chat` أو نفّذ طلب الدردشة أدناه. ظهور `provider: "groq"` في الرد هو التأكيد الفعلي لنجاح الاتصال، وليس مجرد وجود المفتاح.

الدفع إلى فرع العمل ينشئ Preview إذا كان تكامل Vercel مفعلاً؛ وصول التغييرات إلى الموقع الأساسي يحتاج دمج الفرع في `main` ونشراً ناجحاً.

## فحص الصحة: `GET /api/health`

فحص حيّ لحالة التطبيق **وإعدادات** الذكاء الاصطناعي، وليس اختبار اتصال مدفوعاً بالمزودين أو بقاعدة البيانات.
يُرجع HTTP 200 حتى دون مفاتيح لأن الوضع المحلي متاح. تُقرأ المتغيرات وقت الطلب ولا تُكشف المفاتيح.
لا يُخزّن الرد مؤقتاً، ويستثني Service Worker جميع مسارات `/api/` من التخزين ومن صفحة HTML الاحتياطية.

مثال عند ضبط Groq وحده:

```json
{
  "ok": true,
  "service": "sudan-student-helper",
  "check": "configuration",
  "mode": "ai",
  "preferredProvider": "groq",
  "providerOrder": ["groq", "gemini", "openai"],
  "providers": {
    "groq": { "configured": true, "model": "openai/gpt-oss-20b" },
    "gemini": { "configured": false, "model": "gemini-2.5-flash" },
    "openai": { "configured": false, "model": "gpt-4o-mini" }
  }
}
```

`configured: true` يؤكد وجود مفتاح غير فارغ فقط، ولا يضمن صحته أو وجود حصة متاحة.
دون مفاتيح تصبح `mode` و`preferredProvider` بقيمة `fallback`.

```bash
# غيّر BASE_URL إلى عنوان Preview أو Production عند الاختبار هناك.
BASE_URL=http://localhost:3000
curl "$BASE_URL/api/health"
curl "$BASE_URL/api/chat" \
  -H 'Content-Type: application/json' \
  -d '{"message":"ما قانون نيوتن الثاني؟","history":[]}'
```

الدردشة تحافظ على الرد `{ answer, provider, sources }`. الرسالة مطلوبة بحد أقصى 8000 حرف؛
سجل المحادثة اختياري بصيغة `{ role: "user" | "bot", text: string }`، وتُستخدم آخر ست رسائل صالحة كحد أقصى.
الطلبات غير الصالحة تُرجع HTTP 400. عند تعطل جميع المزودين، يُرجع المسار `provider: "fallback"` مع توضيح التعطل، دون كشف أخطاء المزودين أو مفاتيحهم.

## التحقق قبل الدفع

```bash
npm test
npm run typecheck
npm run build
```

الاختبارات تحاكي طلبات Supabase وGroq وGemini وOpenAI؛ لا تحتاج مفاتيح حقيقية ولا تستهلك حصة API.
تشمل ترتيب البدائل، النماذج والترويسات، انتهاء المهلة، المدخلات غير الصالحة، سرية المفاتيح، وفحص الصحة والتخزين المؤقت.
