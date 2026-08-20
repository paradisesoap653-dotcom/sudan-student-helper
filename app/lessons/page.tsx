import { supabase } from '../../supabaseClient';

async function getLessons(subjectId: string) {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, lesson_title, unit_title, subject_id')
    .eq('subject_id', subjectId)
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }

  return data || [];
}

export default async function LessonsPage() {
  const lessons = await getLessons('english');

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">قائمة الدروس والوحدات</h1>
      
      <div className="grid gap-4 max-w-2xl mx-auto">
        {lessons.length === 0 ? (
          <p className="text-center text-slate-400">لا توجد دروس مضافة حالياً لهذه المادة.</p>
        ) : (
          lessons.map((lesson) => (
            <div 
              key={lesson.id} 
              className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md flex justify-between items-center"
            >
              <div>
                <span className="text-xs text-blue-400 font-semibold">{lesson.unit_title}</span>
                <h2 className="text-lg font-bold mt-1">{lesson.lesson_title}</h2>
              </div>
              
              <a 
                href={`/lesson/${lesson.id}`} 
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
              >
                ابدأ الدرس ⚡
              </a>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

