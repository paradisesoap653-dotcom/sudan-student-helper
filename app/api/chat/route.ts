import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lhxebcykgdyxehcyohzk.supabase.co";
const supabaseKey = "sb_publishable_hMGP3EMJNixAVn5liDeh1Q_K10Eiyeu";
const supabase = createClient(supabaseUrl, supabaseKey);

// نفس قاعدة الكتب المختصرة للاستخدام في السياق
const BOOK_TITLES: Record<string, string[]> = {
  math: ["الرياضيات المتخصصة 1", "الرياضيات المتخصصة 2"],
  mathBasic: ["الرياضيات الأساسية"],
  physics: ["الفيزياء 1", "الفيزياء 2", "الفيزياء 3", "الفيزياء 4"],
  chemistry: ["الكيمياء"],
  biology: ["الأحياء"],
  arabic: ["اللغة العربية", "المطالعة والأدب", "البلاغة", "القواعد", "الدراسات اللغوية"],
  english: ["اللغة الإنجليزية"],
  french: ["اللغة الفرنسية"],
  history: ["التاريخ"],
  geography: ["الجغرافيا"],
};

async function searchLessons(query: string) {
  const clean = query.trim().slice(0, 80);
  if (!clean) return [];

  try {
    // نبحث في العناوين والمحتوى النصي
    const { data, error } = await supabase
      .from("lessons")
      .select("id, lesson_title, unit_title, subject_id, content, content_json")
      .or(`lesson_title.ilike.%${clean}%,unit_title.ilike.%${clean}%`)
      .limit(5);

    if (error) {
      console.error("searchLessons error:", error);
      return [];
    }

    // أيضاً نبحث داخل content_json بطريقة بسيطة بعد الجلب
    let extra: any[] = [];
    if (!data || data.length < 3) {
      const { data: all } = await supabase
        .from("lessons")
        .select("id, lesson_title, unit_title, subject_id, content_json")
        .limit(30);
      if (all) {
        const q = clean.toLowerCase();
        extra = all
          .filter((l: any) => {
            const j = JSON.stringify(l.content_json || "").toLowerCase();
            return j.includes(q);
          })
          .slice(0, 3);
      }
    }

    const merged = [...(data || []), ...extra];
    // إزالة التكرار
    const seen = new Set();
    return merged.filter((r: any) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    }).slice(0, 5);
  } catch (e) {
    console.error("searchLessons exception:", e);
    return [];
  }
}

function buildContext(lessons: any[], query: string) {
  if (!lessons.length) {
    return `لم يتم العثور على دروس مطابقة لـ "${query}". لكن يمكنك الإجابة بشكل عام كمدرس سوداني خبير للشهادة السودانية، مع ذكر أن الإجابة عامة وليست من كتاب محدد.`;
  }
  const parts = lessons.map((l: any, i: number) => {
    let jsonPart = "";
    try {
      const cj = l.content_json;
      const obj = typeof cj === "string" ? JSON.parse(cj) : cj;
      if (obj?.learn?.intro) jsonPart += `مقدمة: ${obj.learn.intro.slice(0, 300)}\n`;
      if (obj?.learn?.paragraphs?.[0]) jsonPart += `فقرة: ${obj.learn.paragraphs[0].slice(0, 300)}\n`;
      if (obj?.vocabulary?.length) jsonPart += `مفردات: ${obj.vocabulary.slice(0, 2).map((v: any) => `${v.word}=${v.meaning}`).join(", ")}\n`;
    } catch {}
    const contentSnippet = l.content ? l.content.replace(/<[^>]+>/g, "").slice(0, 300) : "";
    return `درس ${i + 1}:
- المادة: ${l.subject_id}
- الوحدة: ${l.unit_title || "-"}
- الدرس: ${l.lesson_title || "-"}
- ملخص: ${jsonPart || contentSnippet || "لا يوجد ملخص"}
`;
  });
  return `هذه مقتطفات من قاعدة بيانات مساعد الشهادة السودانية (كتب ودروس حقيقية). استخدمها كسياق أساسي للإجابة:\n\n${parts.join("\n")}\n\nإذا كان السياق كافياً أجب منه مع ذكر المصدر (اسم الدرس/الوحدة). إذا لم يكن كافياً، أجب كأستاذ سوداني خبير بشكل مبسط ومباشر، مع تنبيه أن التفصيل موجود في الكتب أعلاه.\n`;
}

async function callGroq(prompt: string, context: string, history: any[]) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  try {
    const messages = [
      {
        role: "system",
        content: `أنت مساعد الشهادة السودانية 🇸🇩. أستاذ خبير تشرح ببساطة باللهجة السودانية والعربية الفصحى المبسطة، مع أمثلة وحلول خطوة بخطوة. تلتزم بالمنهج السوداني. تذكر المصادر (اسم الكتاب/الدرس) عند الإجابة من السياق.

السياق من قاعدة البيانات:
${context}

قواعد:
- أجب بالعربية (اسمح بالإنجليزية عند شرح الإنجليزية)
- بسّط الشرح، استخدم نقاط وترقيم
- إذا كان السؤال عن حل مسألة، اشرح الخطوات
- لا تخترع مراجع غير موجودة
- إذا لا تعرف، قل بصراحة واقترح مراجعة الكتاب`,
      },
      ...history.slice(-6).map((m: any) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.text,
      })),
      { role: "user", content: prompt },
    ];

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        temperature: 0.7,
        max_tokens: 900,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      console.error("Groq error:", json);
      return null;
    }
    return json.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.error("callGroq exception:", e);
    return null;
  }
}

async function callGemini(prompt: string, context: string, history: any[]) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const historyText = history
      .slice(-4)
      .map((m: any) => `${m.role === "bot" ? "المساعد" : "الطالب"}: ${m.text}`)
      .join("\n");
    const fullPrompt = `أنت مساعد الشهادة السودانية. السياق:\n${context}\n\nسجل المحادثة:\n${historyText}\n\nسؤال الطالب الحالي: ${prompt}\n\nأجب بالعربية ببساطة مع ذكر المصدر إن وجد.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 900 },
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) {
      console.error("Gemini error:", json);
      return null;
    }
    return json.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (e) {
    console.error("callGemini exception:", e);
    return null;
  }
}

async function callOpenAI(prompt: string, context: string, history: any[]) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const messages = [
      {
        role: "system",
        content: `أنت مساعد الشهادة السودانية. السياق:\n${context}`,
      },
      ...history.slice(-6).map((m: any) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.text,
      })),
      { role: "user", content: prompt },
    ];
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 900,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      console.error("OpenAI error:", json);
      return null;
    }
    return json.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.error("callOpenAI exception:", e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "الرسالة فارغة" }, { status: 400 });
    }

    const lessons = await searchLessons(message);
    const context = buildContext(lessons, message);

    // نحاول بالترتيب: Groq -> Gemini -> OpenAI
    let answer: string | null = null;
    let provider: string | null = null;

    answer = await callGroq(message, context, history);
    if (answer) provider = "groq";

    if (!answer) {
      answer = await callGemini(message, context, history);
      if (answer) provider = "gemini";
    }
    if (!answer) {
      answer = await callOpenAI(message, context, history);
      if (answer) provider = "openai";
    }

    // Fallback محلي إذا لا يوجد مفتاح API
    if (!answer) {
      const lessonList =
        lessons.length > 0
          ? lessons
              .map((l: any) => `• ${l.lesson_title} (${l.unit_title} - ${l.subject_id})`)
              .join("\n")
          : "• لم أجد درس مطابق، لكن يمكنك مراجعة تبويب الكتب والدروس";

      answer = `🔍 بحثت في قاعدة بياناتك ووجدت:\n${lessonList}\n\n📌 السياق:\n${context.slice(0, 700)}\n\n💡 **وضع بدون مفتاح AI:** هذه إجابة تجريبية. لإجابات ذكية ومفصلة، أضف مفتاح Groq أو Gemini (مجاني) في إعدادات Vercel وسيرد المساعد بأسلوب أستاذ كامل مع شرح خطوة بخطوة.\n\nجرّب تسأل مثلاً: "اشرح لي مصفوفات" أو "ما قانون نيوتن الثاني؟"`;
      provider = "fallback";
    }

    return NextResponse.json({
      answer,
      provider,
      sources: lessons.map((l: any) => ({
        id: l.id,
        title: l.lesson_title,
        unit: l.unit_title,
        subject: l.subject_id,
      })),
    });
  } catch (e: any) {
    console.error("chat route error:", e);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
