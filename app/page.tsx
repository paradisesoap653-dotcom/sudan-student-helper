'use client';

import React, { useState } from 'react';
import { BookOpen, Download, Search, GraduationCap, FileText } from 'lucide-react';

// هيكل بيانات المواد والملفات
interface Material {
  id: string;
  title: string;
  subject: string;
  section: 'scientific' | 'literary' | 'both';
  fileUrl: string;
  description: string;
  fileSize?: string;
}

const materialsData: Material[] = [
  {
    id: '1',
    title: 'كتاب التاريخ المطور - الصف الثالث الثانوي',
    subject: 'التاريخ',
    section: 'literary',
    fileUrl: 'https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/tarkh.pdf',
    description: 'المقرر المطور الكامل المنقح (الثورة المهدية، الحكم الثنائي، الخلافة العثمانية، وحركات التحرر).',
    fileSize: 'PDF'
  },
  {
    id: '2',
    title: 'مذكرة التربية الإسلامية',
    subject: 'التربية الإسلامية',
    section: 'both',
    fileUrl: 'https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/%20eslam1.pdf',
    description: 'مراجعة وتلخيص شامل لمادة التربية الإسلامية للشهادة الثانوية.',
    fileSize: 'PDF'
  },
  {
    id: '3',
    title: 'مادة العلوم الهندسية',
    subject: 'الهندسية',
    section: 'scientific',
    fileUrl: 'https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/Engin.pdf',
    description: 'مقرر وملخص مادة العلوم الهندسية الخاص بالمسار العلمي والتخصص الهندسي.',
    fileSize: 'PDF'
  }
];

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<'all' | 'scientific' | 'literary'>('all');

  // تصفية المواد بناءً على البحث والمسار
  const filteredMaterials = materialsData.filter((item) => {
    const matchesSearch = item.title.includes(searchTerm) || item.subject.includes(searchTerm) || item.description.includes(searchTerm);
    const matchesSection = selectedSection === 'all' || item.section === selectedSection || item.section === 'both';
    return matchesSearch && matchesSection;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* الهيدر والعنوان الرئيسي */}
        <header className="text-center my-8">
          <div className="inline-flex p-3 bg-emerald-100 text-emerald-700 rounded-2xl mb-4">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3">
            مساعد الشهادة السودانية
          </h1>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
            المكتبة الرقمية الشاملة لتحميل وتصفح الكتب والمذكرات الدراسية المحدثة للمرحلة الثانوية.
          </p>
        </header>

        {/* شريط البحث والتصفية */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* حقل البحث */}
          <div className="relative w-full md:w-1/2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن مادة، كتاب، أو موضوع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
            />
          </div>

          {/* أزرار الفلترة حسب المسار */}
          <div className="flex gap-2 w-full md:w-auto justify-center">
            <button
              onClick={() => setSelectedSection('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedSection === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedSection('scientific')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedSection === 'scientific'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              المسار العلمي
            </button>
            <button
              onClick={() => setSelectedSection('literary')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedSection === 'literary'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              المسار الأدبي
            </button>
          </div>
        </div>

        {/* عرض شبكة المواد */}
        {filteredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
                      {item.subject}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                      {item.section === 'scientific' ? 'علمي' : item.section === 'literary' ? 'أدبي' : 'مشترك'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-slate-600 text-sm mb-6 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {item.fileSize}
                  </span>
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل / فتح</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">لا توجد نتائج</h3>
            <p className="text-slate-500 text-sm">جرب البحث بكلمات أخرى أو اختر مساراً مختلفاً.</p>
          </div>
        )}

      </div>
    </div>
  );
                    }
