"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

/* =========================================================
   صورة الواجهة الرئيسية - Supabase
========================================================= */

const HOME_COVER =
  "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/Banner.jpg";

/* =========================================================
   أنواع البيانات
========================================================= */

type FileItem = {
  title: string;
  size: string;
  url: string;
};

type ContentItem = {
  books: FileItem[];
  exams: FileItem[];
};

type Lesson = {
  id: string | number;
  subject_id: string;
  unit_title: string;
  lesson_title: string;
  content: string;
};

type Subject = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type Track = "scientific" | "literary" | "vocational";

/* =========================================================
   قاعدة المحتوى
========================================================= */

const CONTENT_DATABASE: Record<string, ContentItem> = {
  math: {
    books: [
      {
        title: "الكتاب المدرسي - الرياضيات المتخصصة (الجزء الأول)",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/math1.pdf",
      },
      {
        title: "الكتاب المدرسي - الرياضيات المتخصصة (الجزء الثاني)",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/math2.pdf",
      },
    ],
    exams: [],
  },

  mathBasic: {
    books: [
      {
        title: "الكتاب المدرسي - الرياضيات الأساسية",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/math3.pdf",
      },
    ],
    exams: [],
  },

  physics: {
    books: [
      {
        title: "الكتاب المدرسي - الفيزياء (الجزء الأول)",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/Physic1.pdf",
      },
      {
        title: "الكتاب المدرسي - الفيزياء (الجزء الثاني)",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/Physic2.pdf",
      },
      {
        title: "الكتاب المدرسي - الفيزياء (الجزء الثالث)",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/Physic3.pdf",
      },
      {
        title: "الكتاب المدرسي - الفيزياء (الجزء الرابع)",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/Physic4.pdf",
      },
    ],
    exams: [],
  },

  chemistry: {
    books: [
      {
        title: "الكتاب المدرسي - الكيمياء",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/chemistry.pdf",
      },
    ],
    exams: [],
  },

  biology: {
    books: [
      {
        title: "الكتاب المدرسي - الأحياء",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/biology.pdf",
      },
    ],
    exams: [],
  },

  arabic: {
    books: [
      {
        title: "الكتاب المدرسي - اللغة العربية",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/Arab.pdf",
      },
      {
        title: "الكتاب المدرسي - المطالعة والأدب",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/adab.pdf",
      },
      {
        title: "الكتاب المدرسي - البلاغة والتعبير",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/blaga.pdf",
      },
      {
        title: "الكتاب المدرسي - القواعد والنحو",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/gwaid.pdf",
      },
      {
        title: "الكتاب المدرسي - الدراسات اللغوية",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/drasat.pdf",
      },
    ],
    exams: [],
  },

  islamic: {
    books: [
      {
        title: "الكتاب المدرسي - التربية الإسلامية",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/%20eslam1.pdf",
      },
      {
        title: "الكتاب المدرسي - الدراسات الإسلامية",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/Drasat%20",
      },
    ],
    exams: [],
  },
  
english: {
  books: [
    {
      title: "الكتاب المدرسي - اللغة الإنجليزية",
      size: "PDF",
      url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/eng.pdf"
    }
  ],
  exams: []
},
  french: {
    books: [
      {
        title: "الكتاب المدرسي - اللغة الفرنسية",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/frans.pdf",
      },
    ],
    exams: [],
  },

  history: {
    books: [
      {
        title: "الكتاب المدرسي - التاريخ",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/tarkh.pdf",
      },
    ],
    exams: [],
  },

  geography: {
    books: [
      {
        title: "الكتاب المدرسي - الجغرافيا",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/geogr.pdf",
      },
    ],
    exams: [],
  },

  engineering: {
    books: [
      {
        title: "الكتاب المدرسي - العلوم الهندسية",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/Engin.pdf",
      },
    ],
    exams: [],
  },

  commercial: {
    books: [
      {
        title: "الكتاب المدرسي - العلوم التجارية",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/%20scien.pdf",
      },
    ],
    exams: [],
  },

  agricultural: {
    books: [
      {
        title: "الكتاب المدرسي - العلوم الزراعية",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/agric.pdf",
      },
    ],
    exams: [],
  },

  military: {
    books: [
      {
        title: "الكتاب المدرسي - العلوم العسكرية",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/army.pdf",
      },
    ],
    exams: [],
  },

  computer: {
    books: [
      {
        title: "الكتاب المدرسي - علوم الحاسوب",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/Comp.pdf",
      },
    ],
    exams: [],
  },

  family: {
    books: [
      {
        title: "الكتاب المدرسي - العلوم الأسرية",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/family.pdf",
      },
    ],
    exams: [],
  },

  art: {
    books: [
      {
        title: "الكتاب المدرسي - الفنون والتصميم",
        size: "PDF",
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/art.pdf",
      },
    ],
    exams: [],
  },
};

/* =========================================================
   المواد حسب المسار
========================================================= */

const SUBJECTS: Record<Track, Subject[]> = {
  scientific: [
    {
      id: "math",
      name: "الرياضيات المتخصصة",
      icon: "📐",
      color: "#2563eb",
    },
    {
      id: "mathBasic",
      name: "الرياضيات الأساسية",
      icon: "➗",
      color: "#1e40af",
    },
    {
      id: "physics",
      name: "الفيزياء",
      icon: "⚡",
      color: "#7c3aed",
    },
    {
      id: "chemistry",
      name: "الكيمياء",
      icon: "🧪",
      color: "#059669",
    },
    {
      id: "biology",
      name: "الأحياء",
      icon: "🧬",
      color: "#e11d48",
    },
    {
      id: "arabic",
      name: "اللغة العربية",
      icon: "📖",
      color: "#d97706",
    },
    {
      id: "english",
      name: "اللغة الإنجليزية",
      icon: "🔤",
      color: "#0891b2",
    },
    {
      id: "french",
      name: "اللغة الفرنسية",
      icon: "🇫🇷",
      color: "#4338ca",
    },
    {
      id: "engineering",
      name: "العلوم الهندسية",
      icon: "⚙️",
      color: "#475569",
    },
  ],

  literary: [
    {
      id: "history",
      name: "التاريخ",
      icon: "📜",
      color: "#b45309",
    },
    {
      id: "geography",
      name: "الجغرافيا",
      icon: "🌍",
      color: "#047857",
    },
    {
      id: "islamic",
      name: "الدراسات الإسلامية",
      icon: "🕌",
      color: "#1d4ed8",
    },
    {
      id: "arabic",
      name: "اللغة العربية",
      icon: "📖",
      color: "#d97706",
    },
    {
      id: "english",
      name: "اللغة الإنجليزية",
      icon: "🔤",
      color: "#0891b2",
    },
    {
      id: "french",
      name: "اللغة الفرنسية",
      icon: "🇫🇷",
      color: "#4338ca",
    },
  ],

  vocational: [
    {
      id: "commercial",
      name: "العلوم التجارية",
      icon: "💼",
      color: "#ca8a04",
    },
    {
      id: "agricultural",
      name: "العلوم الزراعية",
      icon: "🌾",
      color: "#65a30d",
    },
    {
      id: "military",
      name: "العلوم العسكرية",
      icon: "🎖️",
      color: "#57534e",
    },
    {
      id: "computer",
      name: "علوم الحاسوب",
      icon: "💻",
      color: "#0ea5e9",
    },
    {
      id: "family",
      name: "العلوم الأسرية",
      icon: "👨‍👩‍👧‍👦",
      color: "#db2777",
    },
    {
      id: "art",
      name: "الفنون والتصميم",
      icon: "🎨",
      color: "#9333ea",
    },
    {
      id: "arabic",
      name: "اللغة العربية",
      icon: "📖",
      color: "#d97706",
    },
    {
      id: "english",
      name: "اللغة الإنجليزية",
      icon: "🔤",
      color: "#0891b2",
    },
  ],
};

/* =========================================================
   الصفحة الرئيسية
========================================================= */

export default function Home() {
  const [track, setTrack] = useState<Track | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);

  const [tab, setTab] = useState<"books" | "exams" | "lessons">("books");

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  /* =======================================================
     الملفات الحالية
  ======================================================= */

  const currentFiles =
    subject && tab !== "lessons"
      ? CONTENT_DATABASE[subject.id]?.[tab] || []
      : [];

  /* =======================================================
     تحميل الدروس من Supabase
  ======================================================= */

  useEffect(() => {
    if (tab !== "lessons" || !subject) {
      return;
    }

    let cancelled = false;

    const loadLessons = async () => {
      setLoadingLessons(true);
      setSelectedLesson(null);

      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("subject_id", subject.id);

      if (cancelled) {
        return;
      }

      if (error) {
        console.error("Error loading lessons:", error);
        setLessons([]);
      } else {
        setLessons((data as Lesson[]) || []);
      }

      setLoadingLessons(false);
    };

    loadLessons();

    return () => {
      cancelled = true;
    };
  }, [tab, subject]);

  /* =======================================================
     أسماء المسارات
  ======================================================= */

  const trackLabels: Record<Track, string> = {
    scientific: "العلمي",
    literary: "الأدبي",
    vocational: "المهني",
  };

  /* =======================================================
     العودة للرئيسية
  ======================================================= */

  const goHome = () => {
    setTrack(null);
    setSubject(null);
    setTab("books");
    setLessons([]);
    setSelectedLesson(null);
  };

  /* =======================================================
     الواجهة
  ======================================================= */

  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100dvh",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        fontFamily: "Arial, sans-serif",
        margin: 0,
        padding: 0,
      }}
    >
      {/* ===================================================
          الشاشة الرئيسية
      =================================================== */}

      {!track && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100dvh",
            overflow: "hidden",
            backgroundColor: "#0f172a",
            zIndex: 10,
          }}
        >
          <img
            src={HOME_COVER}
            alt="مساعد الشهادة الثانوية السودانية"
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "cover",
              objectPosition: "center center",
            }}
          />

          {/* =================================================
              زر المسار العلمي
          ================================================= */}

          <button
            type="button"
            onClick={() => setTrack("scientific")}
            aria-label="المسار العلمي"
            style={{
              position: "absolute",
              top: "58%",
              right: "4%",
              width: "92%",
              height: "13%",
              padding: 0,
              margin: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          />

          {/* =================================================
              زر المسار الأدبي
          ================================================= */}

          <button
            type="button"
            onClick={() => setTrack("literary")}
            aria-label="المسار الأدبي"
            style={{
              position: "absolute",
              top: "70%",
              right: "4%",
              width: "92%",
              height: "12%",
              padding: 0,
              margin: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          />

          {/* =================================================
              زر المسار المهني
          ================================================= */}

          <button
            type="button"
            onClick={() => setTrack("vocational")}
            aria-label="المسار المهني"
            style={{
              position: "absolute",
              top: "81%",
              right: "4%",
              width: "92%",
              height: "18%",
              padding: 0,
              margin: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          />
        </div>
      )}

      {/* ===================================================
          اختيار المادة
      =================================================== */}

      {track && !subject && (
        <div
          style={{
            minHeight: "100dvh",
            padding: "20px 16px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            <button
              type="button"
              onClick={goHome}
              style={{
                background: "none",
                border: "none",
                color: "#38bdf8",
                cursor: "pointer",
                marginBottom: "16px",
                fontSize: "14px",
                padding: "8px 0",
              }}
            >
              ➡️ العودة للرئيسية
            </button>

            <div
              style={{
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#94a3b8",
                  marginBottom: "5px",
                }}
              >
                المسار الدراسي
              </div>

              <h2
                style={{
                  fontSize: "24px",
                  margin: 0,
                  color: "#fbbf24",
                }}
              >
                {trackLabels[track]}
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#cbd5e1",
                  fontSize: "14px",
                }}
              >
                اختر المادة التي تريدها
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {SUBJECTS[track].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setSubject(item);
                    setTab("books");
                    setSelectedLesson(null);
                  }}
                  style={{
                    padding: "18px 10px",
                    minHeight: "115px",
                    borderRadius: "14px",
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    color: "#fff",
                    cursor: "pointer",
                    textAlign: "center",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "32px",
                      marginBottom: "8px",
                    }}
                  >
                    {item.icon}
                  </div>

                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          صفحة المادة
      =================================================== */}

      {subject && (
        <div
          style={{
            minHeight: "100dvh",
            padding: "20px 16px 40px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            {/* العودة */}
            <button
              type="button"
              onClick={() => {
                setSubject(null);
                setTab("books");
                setLessons([]);
                setSelectedLesson(null);
              }}
              style={{
                background: "none",
                border: "none",
                color: "#38bdf8",
                cursor: "pointer",
                marginBottom: "14px",
                fontSize: "14px",
                padding: "8px 0",
              }}
            >
              ➡️ العودة لقائمة المواد
            </button>

            {/* عنوان المادة */}
            <div
              style={{
                padding: "20px 16px",
                borderRadius: "16px",
                backgroundColor: subject.color,
                color: "#fff",
                textAlign: "center",
                marginBottom: "16px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
              }}
            >
              <div
                style={{
                  fontSize: "42px",
                  lineHeight: 1,
                }}
              >
                {subject.icon}
              </div>

              <h2
                style={{
                  margin: "10px 0 0",
                  fontSize: "22px",
                }}
              >
                {subject.name}
              </h2>
            </div>

            {/* =================================================
                التبويبات
            ================================================= */}

            <div
              style={{
                display: "flex",
                backgroundColor: "#1e293b",
                borderRadius: "10px",
                padding: "4px",
                marginBottom: "16px",
                gap: "3px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setTab("books");
                  setSelectedLesson(null);
                }}
                style={{
                  flex: 1,
                  padding: "10px 4px",
                  border: "none",
                  borderRadius: "7px",
                  backgroundColor:
                    tab === "books" ? "#3b82f6" : "transparent",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              >
                📖 الكتب
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab("exams");
                  setSelectedLesson(null);
                }}
                style={{
                  flex: 1,
                  padding: "10px 4px",
                  border: "none",
                  borderRadius: "7px",
                  backgroundColor:
                    tab === "exams" ? "#3b82f6" : "transparent",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              >
                📝 الامتحانات
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab("lessons");
                  setSelectedLesson(null);
                }}
                style={{
                  flex: 1,
                  padding: "10px 4px",
                  border: "none",
                  borderRadius: "7px",
                  backgroundColor:
                    tab === "lessons" ? "#3b82f6" : "transparent",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              >
                ⚡ الدروس
              </button>
            </div>

            {/* =================================================
                الكتب والامتحانات
            ================================================= */}

            {tab !== "lessons" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {currentFiles.length > 0 ? (
                  currentFiles.map((file, idx) => (
                    <div
                      key={`${file.title}-${idx}`}
                      style={{
                        padding: "14px",
                        borderRadius: "11px",
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "bold",
                            fontSize: "14px",
                            lineHeight: 1.6,
                          }}
                        >
                          {file.title}
                        </div>

                        <div
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            marginTop: "4px",
                          }}
                        >
                          {file.size}
                        </div>
                      </div>

                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flexShrink: 0,
                          padding: "8px 14px",
                          backgroundColor: "#22c55e",
                          textDecoration: "none",
                          color: "#fff",
                          borderRadius: "7px",
                          fontWeight: "bold",
                          fontSize: "13px",
                        }}
                      >
                        فتح
                      </a>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      padding: "35px 10px",
                      backgroundColor: "#1e293b",
                      borderRadius: "12px",
                    }}
                  >
                    لا توجد ملفات مرفوعة حالياً لهذه المادة.
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                الدروس التفاعلية
            ================================================= */}

            {tab === "lessons" && (
              <div>
                {selectedLesson ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setSelectedLesson(null)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#38bdf8",
                        cursor: "pointer",
                        marginBottom: "12px",
                        fontSize: "14px",
                        padding: "8px 0",
                      }}
                    >
                      ➡️ العودة لقائمة الدروس
                    </button>

                    <div
                      style={{
                        backgroundColor: "#1e293b",
                        borderRadius: "12px",
                        padding: "18px",
                        border: "1px solid #334155",
                      }}
                    >
                      <div
                        style={{
                          color: "#fbbf24",
                          fontSize: "12px",
                          marginBottom: "8px",
                        }}
                      >
                        {selectedLesson.unit_title}
                      </div>

                      <h3
                        style={{
                          color: "#fff",
                          margin: "0 0 16px",
                          fontSize: "20px",
                          lineHeight: 1.5,
                        }}
                      >
                        {selectedLesson.lesson_title}
                      </h3>

                      <div
                        style={{
                          color: "#e2e8f0",
                          lineHeight: 1.9,
                          fontSize: "15px",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: selectedLesson.content,
                        }}
                      />
                    </div>
                  </div>
                ) : loadingLessons ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      padding: "40px 0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "30px",
                        marginBottom: "10px",
                      }}
                    >
                      ⏳
                    </div>

                    جاري تحميل الدروس...
                  </div>
                ) : lessons.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {lessons.map((lesson) => (
                      <button
                        type="button"
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        style={{
                          padding: "15px",
                          borderRadius: "10px",
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          color: "#fff",
                          textAlign: "right",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#fbbf24",
                            marginBottom: "5px",
                          }}
                        >
                          {lesson.unit_title}
                        </div>

                        <div
                          style={{
                            fontWeight: "bold",
                            fontSize: "14px",
                            lineHeight: 1.6,
                          }}
                        >
                          {lesson.lesson_title}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      padding: "35px 10px",
                      backgroundColor: "#1e293b",
                      borderRadius: "12px",
                    }}
                  >
                    لا توجد دروس تفاعلية مضافة حالياً لهذه المادة.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
                    }
