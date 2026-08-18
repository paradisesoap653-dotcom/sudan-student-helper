"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

/* =========================================================
   صورة الواجهة الرئيسية
========================================================= */

const HOME_COVER =
  "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/Banner.jpg";

/* =========================================================
   قاعدة المحتوى
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
    books: [],
    exams: [],
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

type Track = "scientific" | "literary" | "vocational";

type Subject = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

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

  const [lessons, setLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const currentFiles: FileItem[] =
    subject && tab !== "lessons"
      ? CONTENT_DATABASE[subject.id]?.[tab] || []
      : [];

  /* =========================================================
     تحميل الدروس من Supabase
  ========================================================= */

  useEffect(() => {
    if (tab !== "lessons" || !subject) {
      return;
    }

    let mounted = true;

    setLoadingLessons(true);
    setSelectedLesson(null);

    supabase
      .from("lessons")
      .select("*")
      .eq("subject_id", subject.id)
      .then(({ data, error }) => {
        if (!mounted) return;

        if (!error && data) {
          setLessons(data);
        } else {
          setLessons([]);
        }

        setLoadingLessons(false);
      });

    return () => {
      mounted = false;
    };
  }, [tab, subject]);

  const trackLabels: Record<Track, string> = {
    scientific: "العلمي",
    literary: "الأدبي",
    vocational: "المهني",
  };

  /* =========================================================
     العودة للرئيسية
  ========================================================= */

  const goHome = () => {
    setTrack(null);
    setSubject(null);
    setTab("books");
    setSelectedLesson(null);
    setLessons([]);
  };

  /* =========================================================
     العودة لقائمة المواد
  ========================================================= */

  const goToSubjects = () => {
    setSubject(null);
    setTab("books");
    setSelectedLesson(null);
    setLessons([]);
  };

  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #0f172a 0%, #111827 50%, #0f172a 100%)",
        color: "#f8fafc",
        fontFamily: "Arial, sans-serif",
        padding: "16px",
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
        {/* =====================================================
            الواجهة الرئيسية - الصورة والأزرار
        ===================================================== */}

        {!track && (
          <div
            style={{
              position: "relative",
              width: "100%",
              overflow: "hidden",
              borderRadius: "18px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
              backgroundColor: "#fff",
            }}
          >
            <img
              src={HOME_COVER}
              alt="مساعد الشهادة الثانوية السودانية"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
              }}
            />

            {/* =================================================
                المسار العلمي
            ================================================= */}

            <button
              type="button"
              onClick={() => setTrack("scientific")}
              aria-label="المسار العلمي"
              style={{
                position: "absolute",
                top: "58.5%",
                right: "20%",
                width: "80%",
                height: "12.5%",
                padding: 0,
                margin: 0,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            />

            {/* =================================================
                المسار الأدبي
            ================================================= */}

            <button
              type="button"
              onClick={() => setTrack("literary")}
              aria-label="المسار الأدبي"
              style={{
                position: "absolute",
                top: "70.5%",
                right: "20%",
                width: "80%",
                height: "11%",
                padding: 0,
                margin: 0,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            />

            {/* =================================================
                المسار المهني
            ================================================= */}

            <button
              type="button"
              onClick={() => setTrack("vocational")}
              aria-label="المسار المهني"
              style={{
                position: "absolute",
                top: "81%",
                right: "20%",
                width: "80%",
                height: "18%",
                padding: 0,
                margin: 0,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            />
          </div>
        )}

        {/* =====================================================
            اختيار المادة
        ===================================================== */}

        {track && !subject && (
          <section>
            <button
              type="button"
              onClick={goHome}
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
              ➡️ العودة للرئيسية
            </button>

            <h2
              style={{
                fontSize: "22px",
                margin: "8px 0 18px",
                textAlign: "center",
              }}
            >
              مواد المسار {trackLabels[track]}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
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
                    padding: "16px 10px",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(145deg, #1e293b, #172033)",
                    border: "1px solid #334155",
                    color: "#fff",
                    cursor: "pointer",
                    textAlign: "center",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <div
                    style={{
                      fontSize: "30px",
                      lineHeight: 1.2,
                    }}
                  >
                    {item.icon}
                  </div>

                  <div
                    style={{
                      fontWeight: "bold",
                      marginTop: "9px",
                      fontSize: "14px",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.name}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* =====================================================
            صفحة المادة
        ===================================================== */}

        {subject && (
          <section>
            <button
              type="button"
              onClick={goToSubjects}
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
              ➡️ العودة لقائمة المواد
            </button>

            {/* عنوان المادة */}

            <div
              style={{
                padding: "18px",
                borderRadius: "14px",
                backgroundColor: subject.color,
                color: "#fff",
                textAlign: "center",
                marginBottom: "16px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
              }}
            >
              <span
                style={{
                  fontSize: "40px",
                  display: "block",
                }}
              >
                {subject.icon}
              </span>

              <h2
                style={{
                  margin: "8px 0 0",
                  fontSize: "21px",
                }}
              >
                {subject.name}
              </h2>
            </div>

            {/* التبويبات */}

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
                  padding: "10px 5px",
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
                  padding: "10px 5px",
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
                📝 امتحانات
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab("lessons");
                  setSelectedLesson(null);
                }}
                style={{
                  flex: 1,
                  padding: "10px 5px",
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
                        padding: "13px",
                        borderRadius: "10px",
                        backgroundColor: "#1e293b",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                        border: "1px solid #26354a",
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
                            lineHeight: 1.5,
                          }}
                        >
                          {file.title}
                        </div>

                        <div
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            marginTop: "3px",
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
                          padding: "8px 13px",
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
                      padding: "30px 10px",
                      backgroundColor: "#1e293b",
                      borderRadius: "10px",
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
                        padding: "8px 0",
                      }}
                    >
                      ➡️ العودة لقائمة الدروس
                    </button>

                    <div
                      style={{
                        backgroundColor: "#1e293b",
                        borderRadius: "10px",
                        padding: "16px",
                        border: "1px solid #334155",
                      }}
                    >
                      <h3
                        style={{
                          color: "#fbbf24",
                          marginTop: 0,
                          lineHeight: 1.6,
                        }}
                      >
                        {selectedLesson.lesson_title}
                      </h3>

                      <div
                        style={{
                          color: "#e2e8f0",
                          lineHeight: 1.9,
                        }}
                        dangerouslySetInnerHTML={{
                          __html: selectedLesson.content || "",
                        }}
                      />
                    </div>
                  </div>
                ) : loadingLessons ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      padding: "30px 0",
                    }}
                  >
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
                          padding: "14px",
                          borderRadius: "9px",
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
                            marginBottom: "4px",
                          }}
                        >
                          {lesson.unit_title}
                        </div>

                        <div
                          style={{
                            fontWeight: "bold",
                            fontSize: "14px",
                            lineHeight: 1.5,
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
                      padding: "30px 10px",
                      backgroundColor: "#1e293b",
                      borderRadius: "10px",
                    }}
                  >
                    لا توجد دروس تفاعلية مضافة حالياً لهذه المادة.
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
         }
