import React from 'react';
import { BookOpen, Download, FileText, CheckCircle, GraduationCap } from 'lucide-react';

// هيكل البيانات للمواد والملفات
interface Material {
  id: string;
  title: string;
  subject: string;
  section: 'scientific' | 'literary' | 'both';
  fileUrl: string;
  description: string;
}

const materialsData: Material[] = [
  {
    id: '1',
    title: 'كتاب التاريخ المطور - الصف الثالث الثانوي',
    subject: 'التاريخ',
    section: 'literary',
    fileUrl: 'https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/tarkh.pdf',
    description: 'المقرر المطور الكامل (الثورة المهدية، الحكم الثنائي، الخلافة العثمانية، وحركات التحرر).'
  },
  {
    id: '2',
    title: 'مذكرة التربية الإسلامية',
    subject: 'التربية الإسلامية',
    section: 'both',
    fileUrl: 'https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/%20eslam1.pdf',
    description: 'مراجعة وتلخيص شامل لمادة التربية الإسلامية للشهادة الثانوية.'
  },
  {
    id: '3',
    title: 'مادة العلوم الهندسية',
    subject: 'الهندسية',
    section: 'scientific',
    fileUrl: 'https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/Engin.pdf',
    description: 'مقرر وملخص العلوم الهندسية للمسار العلمي/الهندسي.'
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 dir-rtl text-right font-sans p-6 md:p-12">
      {/* Header Section */}
      <header className="max-w-5xl mx-auto mb-12 text-center">
        <div className="flex justify-center mb-4">
          <GraduationCap className="w-16 h-16 text-emerald-600" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-3">
          مساعد الشهادة السودانية
        </h1>
        <p className="text-lg text-slate-600">
          المكتبة الرقمية الشاملة للكتب والمذكرات المحدثة للمرحلة الثانوية
        </p>
      </header>

      {/* Grid Materials */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materialsData.map((item) => (
          <div 
            key={item.id} 
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {item.subject}
                </span>
                <span className="text-xs text-slate-400 border border-slate-200 px-2 py-0.5 rounded">
                  {item.section === 'literary' ? 'أدبي' : item.section === 'scientific' ? 'علمي' : 'مشترك'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2 leading-snug">
                {item.title}
              </h3>
              
              <p className="text-slate-600 text-sm mb-6 line-clamp-3">
                {item.description}
              </p>
            </div>

            <a
              href={item.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تحميل / عرض الملف</span>
            </a>
          </div>
        ))}
      </section>
    </main>
  );
}
