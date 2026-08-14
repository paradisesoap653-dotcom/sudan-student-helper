"use client";

import React, { useState } from "react";

const SUBJECTS = {
  scientific: [
    { id: "math", name: "الرياضيات المتخصصة", icon: "📐", color: "#2563eb" },
    { id: "physics", name: "الفيزياء", icon: "⚡", color: "#7c3aed" },
    { id: "chemistry", name: "الكيمياء", icon: "🧪", color: "#059669" },
    { id: "biology", name: "الأحياء", icon: "🧬", color: "#e11d48" },
    { id: "arabic", name: "اللغة العربية", icon: "📖", color: "#d97706" },
    { id: "english", name: "اللغة الإنجليزية", icon: "🔤", color: "#0891b2" },
  ],
  literary: [
    { id: "history", name: "التاريخ", icon: "📜", color: "#b45309" },
    { id: "geography", name: "الجغرافيا", icon: "🌍", color: "#047857" },
    { id: "islamic", name: "الدراسات الإسلامية", icon: "🕌", color: "#1d4ed8" },
    { id: "arabic", name: "اللغة العربية", icon: "📖", color: "#d97706" },
    { id: "english", name: "اللغة الإنجليزية", icon: "🔤", color: "#0891b2" },
  ]
};

export default function Home() {
  const [track, setTrack] = useState<"scientific" | "literary" | null>(null);
  const [subject, setSubject] = useState<any>(null);
  const [tab, setTab] = useState<"books" | "exams">("books");

  return (
    <div dir="rtl" style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#f8fafc", fontFamily: "sans-serif", padding: "16px" }}>
      {/* الهيدر */}
      <div style={{ textAlign: "center", padding: "20px 0", borderBottom: "1px solid #334155" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#fbbf24", margin: 0 }}>🎓 مساعد الشهادة السودانية</h1>
        <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>المكتبة الرقمية الشاملة للطلاب</p>
      </div>

      <div style={{ maxWidth: "480px", margin: "20px auto" }}>
        {/* اختيار المسار */}
        {!track && (
          <div>
            <h2 style={{ textAlign: "center", fontSize: "18px", marginBottom: "16px" }}>اختر مسارك الدراسي:</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={() => setTrack("scientific")}
                style={{ padding: "20px", borderRadius: "12px", background: "linear-gradient(to left, #2563eb, #1d4ed8)", color: "#fff", border: "none", fontSize: "18px", fontWeight: "bold", cursor: "pointer", textAlign: "right" }}
              >
                🔬 المسار العلمي
                <span style={{ display: "block", fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>فيزياء، كيمياء، أحياء، رياضيات...</span>
              </button>

              <button
                onClick={() => setTrack("literary")}
                style={{ padding: "20px", borderRadius: "12px", background: "linear-gradient(to left, #d97706, #b45309)", color: "#fff", border: "none", fontSize: "18px", fontWeight: "bold", cursor: "pointer", textAlign: "right" }}
              >
                📚 المسار الأدبي
                <span style={{ display: "block", fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>تاريخ، جغرافيا، دراسات إسلامية...</span>
              </button>
            </div>
          </div>
        )}

        {/* عرض المواد */}
        {track && !subject && (
          <div>
            <button onClick={() => setTrack(null)} style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", marginBottom: "12px" }}>
              ➡️ تغيير المسار ({track === "scientific" ? "العلمي" : "الأدبي"})
            </button>
            <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>اختر المادة:</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {SUBJECTS[track].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSubject(item)}
                  style={{ padding: "16px", borderRadius: "10px", backgroundColor: "#1e293b", border: "1px solid #334155", color: "#fff", cursor: "pointer", textAlign: "center" }}
                >
                  <div style={{ fontSize: "28px" }}>{item.icon}</div>
                  <div style={{ fontWeight: "bold", marginTop: "8px", fontSize: "14px" }}>{item.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* عرض تفاصيل المادة والمحتوى */}
        {subject && (
          <div>
            <button onClick={() => setSubject(null)} style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", marginBottom: "12px" }}>
              ➡️ العودة لقائمة المواد
            </button>

            <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: subject.color, color: "#fff", textAlign: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "36px" }}>{subject.icon}</span>
              <h2 style={{ margin: "8px 0 0 0", fontSize: "20px" }}>{subject.name}</h2>
            </div>

            {/* أزرار التنقل بين الكتب والامتحانات */}
            <div style={{ display: "flex", backgroundColor: "#1e293b", borderRadius: "8px", padding: "4px", marginBottom: "16px" }}>
              <button
                onClick={() => setTab("books")}
                style={{ flex: 1, padding: "8px", border: "none", borderRadius: "6px", backgroundColor: tab === "books" ? "#3b82f6" : "transparent", color: "#fff", cursor: "pointer", fontWeight: "bold" }}
              >
                📖 الكتب والملخصات
              </button>
              <button
                onClick={() => setTab("exams")}
                style={{ flex: 1, padding: "8px", border: "none", borderRadius: "6px", backgroundColor: tab === "exams" ? "#3b82f6" : "transparent", color: "#fff", cursor: "pointer", fontWeight: "bold" }}
              >
                📝 امتحانات سابقة
              </button>
            </div>

            {/* قائمة الملفات للتحميل */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {tab === "books" ? (
                <>
                  <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "14px" }}>الكتاب المدرسي - المقرر كامل</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>PDF - 15 MB</div>
                    </div>
                    <button style={{ padding: "6px 12px", backgroundColor: "#22c55e", border: "none", borderRadius: "6px", color: "#fff", fontWeight: "bold", cursor: "pointer" }}>تحميل</button>
                  </div>
                  <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "14px" }}>ملخص المراجعة المركزية</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>PDF - 4 MB</div>
                    </div>
                    <button style={{ padding: "6px 12px", backgroundColor: "#22c55e", border: "none", borderRadius: "6px", color: "#fff", fontWeight: "bold", cursor: "pointer" }}>تحميل</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "14px" }}>امتحان الشهادة السودانية 2022</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>مع الحلول - PDF</div>
                    </div>
                    <button style={{ padding: "6px 12px", backgroundColor: "#22c55e", border: "none", borderRadius: "6px", color: "#fff", fontWeight: "bold", cursor: "pointer" }}>تحميل</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
