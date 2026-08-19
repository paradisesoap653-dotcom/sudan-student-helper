import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function LessonPage(props) {
  const params = await props.params;
  const paramValue = String(params.id || params.slug || Object.values(params)[0]).toLowerCase().trim();

  // جلب كل الحقول الممكنة للتحقق المرن
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('id, subject_id, title, content, content_html');

  if (error || !lessons || lessons.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center p-8 bg-slate-900 rounded-xl border border-red-500/30">
          <p className="text-red-400 font-bold text-lg">عذراً، قاعدة البيانات غير متصلة حالياً!</p>
        </div>
      </div>
    );
  }

  // البحث عن السطر المطابق بمرونة كاملة (سواء بالرابط الرقمي أو النصي)
  const lesson = lessons.find(l => 
    String(l.id) === paramValue || 
    String(l.subject_id).toLowerCase().trim() === paramValue ||
    paramValue.includes(String(l.subject_id).toLowerCase().trim())
  );

  if (!lesson) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center p-8 bg-slate-900 rounded-xl border border-red-500/30">
          <p className="text-red-400 font-bold text-lg">عذراً، هذا الدرس غير متوفر حالياً في النظام!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-955 text-slate-100 p-2 sm:p-6">
      <div className="max-w-3xl mx-auto">
        
        {lesson.content_html ? (
          <div 
            className="w-full overflow-hidden rounded-xl bg-white text-slate-900"
            dangerouslySetInnerHTML={{ __html: lesson.content_html }} 
          />
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h1 className="text-2xl font-black text-amber-400 mb-4">{lesson.title}</h1>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{lesson.content}</p>
          </div>
        )}

      </div>
    </div>
  );
}
