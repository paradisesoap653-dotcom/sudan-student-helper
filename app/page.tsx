"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  FileText, 
  CheckCircle, 
  Download, 
  ArrowRight, 
  GraduationCap, 
  Sparkles,
  BookMarked
} from "lucide-react";

const SUBJECTS = [
  { id: "math", name: "الرياضيات المتخصصة", icon: "📐", color: "from-blue-500 to-indigo-600" },
  { id: "physics", name: "الفيزياء", icon: "⚡", color: "from-purple-500 to-violet-600" },
  { id: "chemistry", name: "الكيمياء", icon: "🧪", color: "from-emerald-500 to-teal-600" },
  { id: "biology", name: "الأحياء", icon: "🧬", color: "from-rose-500 to-pink-600" },
  { id: "arabic", name: "اللغة العربية", icon: "📖", color: "from-amber-500 to-orange-600" },
  { id: "english", name: "اللغة الإنجليزية", icon: "🔤", color: "from-cyan-500 to-blue-600" },
];

const MOCK_RESOURCES = {
  books: [
    { title: "الكتاب المدرسي - الجزء الأول", size: "12.4 MB", date: "2026" },
    { title: "الكتاب المدرسي - الجزء الثاني", size: "14.1 MB", date: "2026" },
  ],
  pastExams: [
    { title: "امتحان الشهادة السودانية 2022", size: "2.1 MB", date: "2022" },
    { title: "امتحان الشهادة السودانية 2021", size: "1.9 MB", date: "2021" },
  ],
  mockExams: [
    { title: "امتحان تجريبي - ولاية الخرطوم", size: "3.5 MB", date: "2025" },
    { title: "امتحان تجريبي - ولاية نهر النيل", size: "2.8 MB", date: "2025" },
  ]
};

export default function StudentApp() {
  const [selectedTrack, setSelectedTrack] = useState<"scientific" | "literary" | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<typeof SUBJECTS[0] | null>(null);
  const [activeTab, setActiveTab] = useState<"books" | "pastExams" | "mockExams">("books");

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <header className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-amber-400" />
            <div>
              <h1 className="font-bold text-lg leading-tight">مساعد الشهادة</h1>
              <p className="text-xs text-slate-400">النسخة التجريبية MVP</p>
            </div>
          </div>
          <span className="bg-amber-400/20 text-amber-300 text-xs px-2.5 py-1 rounded-full border border-amber-400/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> الثالث ثانوي
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {!selectedTrack && (
          <div className="space-y-4 pt-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-900">مرحباً بك يا بطل 👋</h2>
              <p className="text-slate-600 text-sm">اختر مسارك الدراسي للوصول المباشر للكتب والامتحانات</p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-4">
              <button
                onClick={() => setSelectedTrack("scientific")}
                className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md hover:shadow-xl transition-all text-right flex items-center justify-between group active:scale-95"
              >
                <div>
                  <h3 className="text-xl font-bold">المسار العلمي</h3>
                  <p className="text-blue-100 text-xs mt-1">الفيزياء، الكيمياء، الأحياء، الرياضيات...</p>
                </div>
                <ArrowRight className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform rotate-180" />
              </button>

              <button
                onClick={() => setSelectedTrack("literary")}
                className="p-6 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-2xl shadow-md hover:shadow-xl transition-all text-right flex items-center justify-between group active:scale-95"
              >
                <div>
                  <h3 className="text-xl font-bold">المسار الأدبي</h3>
                  <p className="text-amber-100 text-xs mt-1">التاريخ، الجغرافيا، الدراسات الإسلامية...</p>
                </div>
                <ArrowRight className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform rotate-180" />
              </button>
            </div>
          </div>
        )}

        {selectedTrack && !selectedSubject && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedTrack(null)}
                className="text-xs text-slate-500 flex items-center gap-1 hover:text-slate-800"
              >
                <ArrowRight className="w-4 h-4" /> تغيير المسار
              </button>
              <span className="text-sm font-semibold text-slate-700">
                {selectedTrack === "scientific" ? "المسار العلمي" : "المسار الأدبي"}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900">اختر المادة الدراسية:</h2>

            <div className="grid grid-cols-2 gap-3">
              {SUBJECTS.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub)}
                  className="p-4 bg-white rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all text-right flex flex-col justify-between h-32 active:scale-95"
                >
                  <span className="text-3xl">{sub.icon}</span>
                  <span className="font-bold text-slate-800 text-sm leading-snug">{sub.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedSubject && (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedSubject(null)}
              className="text-xs text-slate-500 flex items-center gap-1 hover:text-slate-800"
            >
              <ArrowRight className="w-4 h-4" /> العودة للمواد
            </button>

            <div className={`p-5 rounded-2xl bg-gradient-to-r ${selectedSubject.color} text-white shadow-lg`}>
              <div className="flex items-center gap-3">
                <span className="text-4xl p-2 bg-white/10 rounded-xl backdrop-blur-sm">{selectedSubject.icon}</span>
                <div>
                  <h2 className="text-xl font-black">{selectedSubject.name}</h2>
                  <p className="text-xs text-white/80">الصف الثالث ثانوي</p>
                </div>
              </div>
            </div>

            <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab("books")}
                className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTab === "books" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> الكتب
              </button>
              <button
                onClick={() => setActiveTab("pastExams")}
                className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTab === "pastExams" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> امتحانات سابقة
              </button>
              <button
                onClick={() => setActiveTab("mockExams")}
                className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTab === "mockExams" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" /> تجريبية
              </button>
            </div>

            <div className="space-y-2.5">
              {MOCK_RESOURCES[activeTab].map((file, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700 shrink-0">
                      <BookMarked className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-sm text-slate-800 truncate">{file.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">الحجم: {file.size}</p>
                    </div>
                  </div>

                  <button className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold active:scale-95">
                    <Download className="w-4 h-4" /> تحميل
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
