import { createClient } from '@supabase/supabase-js';

// تهيئة اتصال سوبابيس باستخدام متغيرات البيئة الآمنة التي أضفناها في Vercel
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function LessonPage({ params }) {
  // 1. جلب معرف الدرس من الرابط الديناميكي
  const { id } = params;

  // 2. جلب الحقل القديم والحقل التفاعلي الجديد معاً من جدول lessons
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('title, content, content_html')
    .eq('id', id)
    .single();

  // في حال حدوث خطأ أو عدم وجود الدرس
  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="text-center p-8 bg-slate-800 rounded-xl border border-red-500/30">
          <p className="text-red-400 font-bold text-lg">عذراً، لم يتم العثور على هذا الدرس حالياً!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        
        {/* إذا كان الحقل التفاعلي content_html يحتوي على كود، قم بعرضه فوراً كموقع تفاعلي */}
        {lesson.content_html ? (
          <div 
            className="w-full overflow-hidden rounded-xl"
            dangerouslySetInnerHTML={{ __html: lesson.content_html }} 
          />
        ) : (
          /* إذا كان فارغاً، اعرض التصميم النصي القديم المعتاد لحين تحديثه */
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h1 className="text-2xl font-black text-amber-400 mb-4">{lesson.title}</h1>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{lesson.content}</p>
          </div>
        )}

      </div>
    </div>
  );
}
