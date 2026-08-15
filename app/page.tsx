"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const CONTENT_DATABASE: Record<string, { books: any[]; exams: any[] }> = {
  math: {
    books: [
      {
        title: "الكتاب المدرسي - الرياضيات المتخصصة",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/math.pdf",
      },
    ],
    exams: [],
  },
  physics: { books: [], exams: [] },
  chemistry: { books: [], exams: [] },
  biology: { books: [], exams: [] },
  arabic: { books: [], exams: [] },
  english: { books: [], exams: [] },
  history: { books: [], exams: [] },
  geography: { books: [], exams: [] },
  islamic: { books: [], exams: [] },
};

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
  ],
};

export default function Home() {
  const [track, setTrack] = useState<"scientific" | "literary" | null>(null);
  const [subject, setSubject] = useState<any>(null);
  const [tab, setTab] = useState<"books" | "exams" | "lessons">("books");

  const [lessons, setLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const currentFiles = subject && tab !== "lessons" ? CONTENT_DATABASE[subject.id]?.[tab] || [] : [];

  useEffect(() => {
    if (tab === "lessons" && subject) {
      setLoadingLessons(true);
      setSelectedLesson(null);
      supabase
        .from("lessons")
        .select("*")
        .eq("subject_id", subject.id)
        .then(({ data, error }) => {
          if (!error && data) {
            setLessons(data);
          } else {
            setLessons([]);
          }
          setLoadingLessons(false);
        });
    }
  }, [tab, subject]);

  return (
    <div dir="rtl" style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#f8fafc", fontFamily: "sans-serif", padding: "16px" }}>
      <div style={{ textAlign: "center", padding: "20px 0", borderBottom: "1px solid #334155" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#fbbf24", margin: 0 }}>🎓 مساعد الشهادة السودانية</h1>
        <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>المكتبة الرقمية الشاملة للطلاب</p>
      </div>

      <div style={{ maxWidth: "480px", margin: "20px auto" }}>
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

        {subject && (
          <div>
            <button
              onClick={() => {
                setSubject(null);
                setTab("books");
                setSelectedLesson(null);
              }}
              style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", marginBottom: "12px" }}
            >
              ➡️ العودة لقائمة المواد
            </button>

            <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: subject.color, color: "#fff", textAlign: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "36px" }}>{subject.icon}</span>
              <h2 style={{ margin: "8px 0 0 0", fontSize: "20px" }}>{subject.name}</h2>
            </div>

            <div style={{ display: "flex", backgroundColor: "#1e293b", borderRadius: "8px", padding: "4px", marginBottom: "16px" }}>
              <button
                onClick={() => { setTab("books"); setSelectedLesson(null); }}
                style={{ flex: 1, padding: "8px", border: "none", borderRadius: "6px", backgroundColor: tab === "books" ? "#3b82f6" : "transparent", color: "#fff", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}
              >
                📖 الكتب
              </button>
              <button
                onClick={() => { setTab("exams"); setSelectedLesson(null); }}
                style={{ flex: 1, padding: "8px", border: "none", borderRadius: "6px", backgroundColor: tab === "exams" ? "#3b82f6" : "transparent", color: "#fff", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}
              >
                📝 امتحانات
              </button>
              <button
                onClick={() => setTab("lessons")}
                style={{ flex: 1, padding: "8px", border: "none", borderRadius: "6px", backgroundColor: tab === "lessons" ? "#3b82f6" : "transparent", color: "#fff", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}
              >
                ⚡ الدروس التفاعلية
              </button>
            </div>

            {tab !== "lessons" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {currentFiles.length > 0 ? (
                  currentFiles.map((file: any, idx: number) => (
                    <div key={idx} style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: "bold", fontSize: "14px" }}>{file.title}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{file.size}</div>
                      </div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: "6px 12px", backgroundColor: "#22c55e", textDecoration: "none", color: "#fff", borderRadius: "6px", fontWeight: "bold", fontSize: "13px" }}
                      >
                        تحميل
                      </a>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", color: "#94a3b8", padding: "20px 0" }}>
                    لا توجد ملفات مرفوعة حالياً لهذه المادة.
                  </div>
                )}
              </div>
            )}

            {tab === "lessons" && (
              <div>
                {selectedLesson ? (
                  <div>
                    <button
                      onClick={() => setSelectedLesson(null)}
                      style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", marginBottom: "12px" }}
                    >
                      ➡️ العودة لقائمة الدروس
                    </button>
                    <div style={{ backgroundColor: "#1e293b", borderRadius: "10px", padding: "16px" }}>
                      <h3 style={{ color: "#fbbf24", marginTop: 0 }}>{selectedLesson.lesson_title}</h3>
                      <div
                        style={{ color: "#e2e8f0", lineHeight: 1.8 }}
                        dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                      />
                    </div>
                  </div>
                ) : loadingLessons ? (
                  <div style={{ textAlign: "center", color: "#94a3b8", padding: "20px 0" }}>
                    جاري تحميل الدروس...
                  </div>
                ) : lessons.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        style={{ padding: "14px", borderRadius: "8px", backgroundColor: "#1e293b", border: "1px solid #334155", color: "#fff", textAlign: "right", cursor: "pointer" }}
                      >
                        <div style={{ fontSize: "12px", color: "#fbbf24", marginBottom: "4px" }}>{lesson.unit_title}</div>
                        <div style={{ fontWeight: "bold", fontSize: "14px" }}>{lesson.lesson_title}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", color: "#94a3b8", padding: "20px 0" }}>
                    لا توجد دروس تفاعلية مضافة حالياً لهذه المادة.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
                        }
