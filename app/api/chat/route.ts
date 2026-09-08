import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAIStatus } from "@/lib/ai-config";
import { generateChatAnswer, MAX_MESSAGE_LENGTH, normalizeHistory, type ChatMessage } from "@/lib/chat-providers";

export const runtime = "nodejs";
// Three bounded provider attempts (15s each) plus lesson retrieval (5s).
export const maxDuration = 60;

const supabaseUrl = "https://lhxebcykgdyxehcyohzk.supabase.co";
const supabaseKey = "sb_publishable_hMGP3EMJNixAVn5liDeh1Q_K10Eiyeu";
const supabase = createClient(supabaseUrl, supabaseKey);

const stopWords = new Set(["من", "في", "على", "الى", "إلى", "عن", "مع", "او", "أو", "ما", "هو", "هي", "كيف", "ماهو", "ماهي", "اشرح", "لي", "درس"]);

function extractKeywords(text: string): string[] {
  const clean = text.trim().slice(0, 80);
  return clean
    .split(/\s+/)
    .map((w) => w.replace(/[؟!.,]/g, ""))
    .filter((w) => w.length >= 2 && !stopWords.has(w));
}

// لو سؤال الطالب الحالي عام جداً (زي "تقدر تعمل رسومات توضيحية؟")، نرجع لآخر سؤال
// حقيقي له في المحادثة عشان نفهم السياق (مثلاً: كان بيتكلم عن الزهرة).
function getFallbackKeywordsFromHistory(history: ChatMessage[]): string[] {
  const lastUserMessages = history.filter((m) => m.role === "user").reverse();
  for (const msg of lastUserMessages) {
    const kws = extractKeywords(msg.text);
    if (kws.length > 0) return kws;
  }
  return [];
}

async function searchLessons(query: string, subjectId?: string, history: ChatMessage[] = []) {
  let keywords = extractKeywords(query);

  const signal = AbortSignal.timeout(5_000);

  async function runSearch(kws: string[]) {
    if (kws.length === 0) return { data: [] as any[], extra: [] as any[] };

    const orConditions = kws
      .map((k) => `lesson_title.ilike.%${k}%,unit_title.ilike.%${k}%`)
      .join(",");

    let data: any[] | null = null;

    if (subjectId) {
      const { data: subjectData, error: subjectError } = await supabase
        .from("lessons")
        .select("id, lesson_title, unit_title, subject_id, content_json")
        .eq("subject_id", subjectId)
        .or(orConditions)
        .limit(5)
        .abortSignal(signal);

      if (subjectError) {
        console.error("searchLessons error (subject-scoped):", subjectError);
      } else {
        data = subjectData;
      }
    }

    if (!data || data.length === 0) {
      const { data: allSubjectsData, error: allSubjectsError } = await supabase
        .from("lessons")
        .select("id, lesson_title, unit_title, subject_id, content_json")
        .or(orConditions)
        .limit(5)
        .abortSignal(signal);

      if (allSubjectsError) {
        console.error("searchLessons error (all-subjects):", allSubjectsError);
        return { data: [], extra: [] };
      }
      data = allSubjectsData;
    }

    let extra: any[] = [];
    if (!data || data.length < 3) {
      let candidatesQuery = supabase
        .from("lessons")
        .select("id, lesson_title, unit_title, subject_id, content_json")
        .limit(50)
        .abortSignal(signal);

      if (subjectId) {
        candidatesQuery = candidatesQuery.eq("subject_id", subjectId);
      }

      const { data: candidates } = await candidatesQuery;

      if (candidates) {
        extra = candidates
          .filter((l: any) => {
            const j = JSON.stringify(l.content_json || "").toLowerCase();
            return kws.some((k) => j.includes(k.toLowerCase()));
          })
          .slice(0, 3);

        if (extra.length === 0 && subjectId) {
          const { data: allCandidates } = await supabase
            .from("lessons")
            .select("id, lesson_title, unit_title, subject_id, content_json")
            .limit(50)
            .abortSignal(signal);

          if (allCandidates) {
            extra = allCandidates
              .filter((l: any) => {
                const j = JSON.stringify(l.content_json || "").toLowerCase();
                return kws.some((k) => j.includes(k.toLowerCase()));
              })
              .slice(0, 3);
          }
        }
      }
    }

    return { data: data || [], extra };
  }

  try {
    let { data, extra } = await runSearch(keywords);
    let merged = [...data, ...extra];

    // لو السؤال الحالي ما رجّعش نتائج كافية، نستخدم كلمات من آخر سؤال حقيقي
    // في المحادثة عشان نحافظ على سياق نفس الدرس/الموضوع.
    if (merged.length < 2) {
      const fallbackKeywords = getFallbackKeywordsFromHistory(history);
      if (fallbackKeywords.length > 0) {
        const fallbackResult = await runSearch(fallbackKeywords);
        merged = [...merged, ...fallbackResult.data, ...fallbackResult.extra];
      }
    }

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

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "صيغة JSON غير صالحة" }, { status: 400 });
  }

  if (!body || typeof body.message !== "string" || !body.message.trim()) {
    return NextResponse.json({ error: "الرسالة فارغة أو غير صالحة" }, { status: 400 });
  }
  const message = body.message.trim();
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "الرسالة طويلة جداً؛ يرجى اختصارها" }, { status: 400 });
  }
  const history = normalizeHistory(body.history);
  const subject = typeof body.subject === "string" && body.subject.trim() ? body.subject.trim() : undefined;

  try {
    const lessons = await searchLessons(message, subject, history);
    const context = buildContext(lessons, message);
    const result = await generateChatAnswer(message, context, history);
    let answer = result?.answer;

    // تبقى المقتطفات المحلية متاحة عند غياب المفاتيح أو تعطل جميع المزودين.
    if (!answer) {
      const lessonList =
        lessons.length > 0
          ? lessons
              .map((l: any) => `• ${l.lesson_title} (${l.unit_title} - ${l.subject_id})`)
              .join("\n")
          : "• لم أجد درساً مطابقاً، لكن يمكنك مراجعة تبويب الكتب والدروس";
      const notice = getAIStatus().mode === "ai"
        ? "خدمات الذكاء الاصطناعي غير متاحة مؤقتاً. هذه مقتطفات محلية وليست إجابة مولّدة؛ حاول مرة أخرى لاحقاً."
        : "هذه مقتطفات محلية وليست إجابة مولّدة. لتفعيل المساعد، أضف GROQ_API_KEY أو GEMINI_API_KEY في إعدادات Vercel ثم أعد النشر.";

      answer = `🔍 نتائج البحث في الدروس:\n${lessonList}\n\n📌 السياق:\n${context.slice(0, 700)}\n\n💡 **الوضع التجريبي:** ${notice}\n\nجرّب تسأل مثلاً: "اشرح لي مصفوفات" أو "ما قانون نيوتن الثاني؟"`;
    }

    return NextResponse.json({
      answer,
      provider: result?.provider || "fallback",
      sources: lessons.map((l: any) => ({
        id: l.id,
        title: l.lesson_title,
        unit: l.unit_title,
        subject: l.subject_id,
      })),
    });
  } catch {
    console.error("[chat] Unexpected route error");
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
