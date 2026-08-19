import { createClient } from '@supabase/supabase-js';

// تهيئة اتصال Supabase (تأكد من وضع متغيرات البيئة الخاصة بك)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function LessonPage({ params }) {
  // 1. جلب معرف الدرس (ID) من رابط الصفحة
  const { id } = params;

  // 2. جلب كود الـ HTML الخاص بالدرس من جدول lessons في Supabase
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('content_html') // افترضنا أن اسم العمود الذي يحتوي الكود هو content_html
    .eq('id', id)
    .single();

  if (error || !lesson) {
    return <div className="p-8 text-center text-red-500 font-bold">عذراً، لم يتم العثور على هذا الدرس!</div>;
  }

  // 3. عرض كود الـ HTML التفاعلي للطالب بشكل آمن داخل الموقع
  return (
    <div className="min-h-screen bg-slate-50">
      <div 
        dangerouslySetInnerHTML={{ __html: lesson.content_html }} 
      />
    </div>
  );
}
