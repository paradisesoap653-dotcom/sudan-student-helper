"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const HOME_COVER =
  "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/Banner.jpg";

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
  content_json?: any;
};

type Subject = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type Track = "scientific" | "literary" | "vocational";
type Stage =
  | "learn"
  | "vocabulary"
  | "grammar"
  | "match"
  | "challenge"
  | "result";

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
        url: "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/eng.pdf",
      },
    ],
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

const SUBJECTS: Record<Track, Subject[]> = {
  scientific: [
    { id: "math", name: "الرياضيات المتخصصة", icon: "📐", color: "#2563eb" },
    { id: "mathBasic", name: "الرياضيات الأساسية", icon: "➗", color: "#1e40af" },
    { id: "physics", name: "الفيزياء", icon: "⚡", color: "#7c3aed" },
    { id: "chemistry", name: "الكيمياء", icon: "🧪", color: "#059669" },
    { id: "biology", name: "الأحياء", icon: "🧬", color: "#e11d48" },
    { id: "arabic", name: "اللغة العربية", icon: "📖", color: "#d97706" },
    { id: "english", name: "اللغة الإنجليزية", icon: "🔤", color: "#0891b2" },
    { id: "french", name: "اللغة الفرنسية", icon: "🇫🇷", color: "#4338ca" },
    { id: "engineering", name: "العلوم الهندسية", icon: "⚙️", color: "#475569" },
  ],
  literary: [
    { id: "history", name: "التاريخ", icon: "📜", color: "#b45309" },
    { id: "geography", name: "الجغرافيا", icon: "🌍", color: "#047857" },
    { id: "islamic", name: "الدراسات الإسلامية", icon: "🕌", color: "#1d4ed8" },
    { id: "arabic", name: "اللغة العربية", icon: "📖", color: "#d97706" },
    { id: "english", name: "اللغة الإنجليزية", icon: "🔤", color: "#0891b2" },
    { id: "french", name: "اللغة الفرنسية", icon: "🇫🇷", color: "#4338ca" },
  ],
  vocational: [
    { id: "commercial", name: "العلوم التجارية", icon: "💼", color: "#ca8a04" },
    { id: "agricultural", name: "العلوم الزراعية", icon: "🌾", color: "#65a30d" },
    { id: "military", name: "العلوم العسكرية", icon: "🎖️", color: "#57534e" },
    { id: "computer", name: "علوم الحاسوب", icon: "💻", color: "#0ea5e9" },
    { id: "family", name: "العلوم الأسرية", icon: "👨‍👩‍👧‍👦", color: "#db2777" },
    { id: "art", name: "الفنون والتصميم", icon: "🎨", color: "#9333ea" },
    { id: "arabic", name: "اللغة العربية", icon: "📖", color: "#d97706" },
    { id: "english", name: "اللغة الإنجليزية", icon: "🔤", color: "#0891b2" },
  ],
};

const STAGES: { id: Stage; label: string; icon: string }[] = [
  { id: "learn", label: "Learn", icon: "📖" },
  { id: "vocabulary", label: "Vocabulary", icon: "🧠" },
  { id: "grammar", label: "Grammar", icon: "🎯" },
  { id: "match", label: "Match", icon: "🧩" },
  { id: "challenge", label: "Challenge", icon: "⚡" },
  { id: "result", label: "Result", icon: "🏆" },
];

function InteractiveLesson({
  lesson,
  stage,
  setStage,
  vocabIndex,
  setVocabIndex,
  onExit,
}: {
  lesson: Lesson;
  stage: Stage;
  setStage: (stage: Stage) => void;
  vocabIndex: number;
  setVocabIndex: (index: number) => void;
  onExit: () => void;
}) {
  const data = lesson.content_json || {};
  const vocab = Array.isArray(data.vocabulary) ? data.vocabulary : [];
  const grammar = data.grammar || {};
  const matchItems = Array.isArray(data.match) ? data.match : [];
  const challengeItems = Array.isArray(data.challenge)
    ? data.challenge
    : Array.isArray(data.questions)
      ? data.questions
      : [];

  const [matchAnswers, setMatchAnswers] = useState<Record<number, string>>({});
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(
    null
  );

  useEffect(() => {
    setMatchAnswers({});
    setChallengeIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
  }, [lesson.id]);

  const stageIndex = Math.max(
    0,
    STAGES.findIndex((item) => item.id === stage)
  );

  const nextStage = () => {
    const next = STAGES[stageIndex + 1];
    if (next) {
      setAnswered(false);
      setSelectedAnswer(null);
      setStage(next.id);
    }
  };

  const normalize = (value: any) =>
    String(value ?? "")
      .trim()
      .toLowerCase();

  const checkChallenge = (answer: any) => {
    if (answered) return;

    setSelectedAnswer(answer);
    setAnswered(true);

    const question = challengeItems[challengeIndex];
    const correct =
      question?.answer ??
      question?.correctAnswer ??
      question?.correct ??
      question?.correct_answer;

    if (correct !== undefined && normalize(answer) === normalize(correct)) {
      setScore((value) => value + 1);
    }
  };

  const finishChallenge = () => {
    setAnswered(false);
    setSelectedAnswer(null);
    setStage("result");
  };

  const renderProgress = () => (
    <div style={{ marginBottom: "18px" }}>
      <div
        style={{
          display: "flex",
          gap: "5px",
          marginBottom: "8px",
        }}
      >
        {STAGES.map((item, index) => (
          <div
            key={item.id}
            title={item.label}
            style={{
              flex: 1,
              height: "7px",
              borderRadius: "5px",
              backgroundColor:
                index <= stageIndex ? "#3b82f6" : "#334155",
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "4px",
          overflowX: "auto",
        }}
      >
        {STAGES.map((item, index) => (
          <div
            key={item.id}
            style={{
              minWidth: "55px",
              textAlign: "center",
              fontSize: "9px",
              color: index === stageIndex ? "#fbbf24" : "#94a3b8",
              fontWeight: index === stageIndex ? "bold" : "normal",
            }}
          >
            <div>{item.icon}</div>
            <div>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const actionStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    borderRadius: "9px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "14px",
  };

  return (
    <div>
      <button
        type="button"
        onClick={onExit}
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

      {renderProgress()}

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
            fontSize: "12px",
            color: "#fbbf24",
            marginBottom: "8px",
          }}
        >
          {lesson.unit_title}
        </div>

        <h3
          style={{
            color: "#fff",
            margin: "0 0 16px",
            fontSize: "20px",
            lineHeight: 1.5,
          }}
        >
          {lesson.lesson_title}
        </h3>

        {stage === "learn" && (
          <div>
            <div style={{ color: "#94a3b8", marginBottom: "10px" }}>
              📖 Learn
            </div>

            <p
              style={{
                color: "#e2e8f0",
                lineHeight: 1.9,
                fontWeight: "bold",
              }}
            >
              {data.learn?.intro || "ابدأ بقراءة شرح الدرس بعناية."}
            </p>

            {Array.isArray(data.learn?.paragraphs) &&
              data.learn.paragraphs.map((p: string, i: number) => (
                <p key={i} style={{ color: "#e2e8f0", lineHeight: 1.9 }}>
                  {p}
                </p>
              ))}

            {!data.learn?.paragraphs && lesson.content && (
              <div
                style={{ color: "#e2e8f0", lineHeight: 1.9 }}
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            )}

            <button type="button" onClick={nextStage} style={actionStyle}>
              التالي: المفردات ⬅️
            </button>
          </div>
        )}

        {stage === "vocabulary" && (
          <div>
            <div style={{ color: "#94a3b8", marginBottom: "10px" }}>
              🧠 Vocabulary
            </div>

            {vocab.length > 0 ? (
              <>
                <div
                  style={{
                    backgroundColor: "#0f172a",
                    borderRadius: "10px",
                    padding: "20px",
                    textAlign: "center",
                    border: "1px solid #334155",
                  }}
                >
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#fff",
                      marginBottom: "8px",
                    }}
                  >
                    {vocab[vocabIndex]?.word || vocab[vocabIndex]?.term}
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      color: "#fbbf24",
                      marginBottom: "12px",
                    }}
                  >
                    {vocab[vocabIndex]?.meaning ||
                      vocab[vocabIndex]?.translation}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#94a3b8",
                      fontStyle: "italic",
                    }}
                  >
                    {vocab[vocabIndex]?.example || ""}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button
                    type="button"
                    disabled={vocabIndex === 0}
                    onClick={() => setVocabIndex(Math.max(0, vocabIndex - 1))}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #334155",
                      backgroundColor: "transparent",
                      color: vocabIndex === 0 ? "#475569" : "#fff",
                      cursor: vocabIndex === 0 ? "default" : "pointer",
                    }}
                  >
                    السابق
                  </button>

                  {vocabIndex < vocab.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setVocabIndex(vocabIndex + 1)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#3b82f6",
                        color: "#fff",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      التالي
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={nextStage}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#22c55e",
                        color: "#fff",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      التالي: Grammar 🎯
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    color: "#cbd5e1",
                    backgroundColor: "#0f172a",
                    padding: "16px",
                    borderRadius: "9px",
                  }}
                >
                  لا توجد مفردات مضافة لهذا الدرس بعد.
                </div>
                <button type="button" onClick={nextStage} style={actionStyle}>
                  تخطي إلى Grammar ➡️
                </button>
              </>
            )}
          </div>
        )}

        {stage === "grammar" && (
          <div>
            <div style={{ color: "#94a3b8", marginBottom: "10px" }}>
              🎯 Grammar
            </div>

            <div
              style={{
                backgroundColor: "#0f172a",
                padding: "18px",
                borderRadius: "10px",
                border: "1px solid #334155",
              }}
            >
              <h4 style={{ color: "#fbbf24", marginTop: 0 }}>
                {grammar.title || "قاعدة الدرس"}
              </h4>

              <p style={{ color: "#e2e8f0", lineHeight: 1.9 }}>
                {grammar.explanation ||
                  "راجع القاعدة الأساسية المرتبطة بهذا الدرس، ثم انتقل إلى التدريب."}
              </p>

              {Array.isArray(grammar.examples) &&
                grammar.examples.map((example: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      backgroundColor: "#1e293b",
                      borderRadius: "8px",
                      color: "#cbd5e1",
                    }}
                  >
                    {typeof example === "string"
                      ? example
                      : `${example.question || example.sentence || ""} ${
                          example.answer ? `→ ${example.answer}` : ""
                        }`}
                  </div>
                ))}
            </div>

            <button type="button" onClick={nextStage} style={actionStyle}>
              التالي: Match 🧩
            </button>
          </div>
        )}

        {stage === "match" && (
          <div>
            <div style={{ color: "#94a3b8", marginBottom: "10px" }}>
              🧩 Match
            </div>

            {matchItems.length > 0 ? (
              <>
                {matchItems.map((item: any, index: number) => {
                  const options = item.options || item.choices || [];
                  return (
                    <div
                      key={index}
                      style={{
                        padding: "14px",
                        marginBottom: "10px",
                        backgroundColor: "#0f172a",
                        borderRadius: "9px",
                      }}
                    >
                      <div
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          marginBottom: "8px",
                        }}
                      >
                        {item.word || item.term || item.question}
                      </div>

                      {options.length > 0 ? (
                        <select
                          value={matchAnswers[index] || ""}
                          onChange={(event) =>
                            setMatchAnswers({
                              ...matchAnswers,
                              [index]: event.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "7px",
                            backgroundColor: "#1e293b",
                            color: "#fff",
                            border: "1px solid #475569",
                          }}
                        >
                          <option value="">اختر الإجابة</option>
                          {options.map((option: any, optionIndex: number) => (
                            <option key={optionIndex} value={String(option)}>
                              {String(option)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div style={{ color: "#94a3b8" }}>
                          {item.meaning || item.answer || "لا توجد خيارات بعد."}
                        </div>
                      )}
                    </div>
                  );
                })}
                <button type="button" onClick={nextStage} style={actionStyle}>
                  التالي: Challenge ⚡
                </button>
              </>
            ) : (
              <>
                <div
                  style={{
                    color: "#cbd5e1",
                    backgroundColor: "#0f172a",
                    padding: "16px",
                    borderRadius: "9px",
                  }}
                >
                  نشاط المطابقة غير مضاف لهذا الدرس بعد.
                </div>
                <button type="button" onClick={nextStage} style={actionStyle}>
                  تخطي إلى Challenge ➡️
                </button>
              </>
            )}
          </div>
        )}

        {stage === "challenge" && (
          <div>
            <div style={{ color: "#94a3b8", marginBottom: "10px" }}>
              ⚡ Challenge
            </div>

            {challengeItems.length > 0 ? (
              (() => {
                const question = challengeItems[challengeIndex] || {};
                const options = question.options || question.choices || [];
                return (
                  <div>
                    <div
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "17px",
                        lineHeight: 1.8,
                        marginBottom: "14px",
                      }}
                    >
                      {question.question ||
                        question.text ||
                        question.sentence ||
                        "اختر الإجابة الصحيحة"}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "9px",
                      }}
                    >
                      {options.map((option: any, index: number) => {
                        const value = String(option);
                        const isSelected =
                          selectedAnswer !== null &&
                          String(selectedAnswer) === value;

                        return (
                          <button
                            type="button"
                            key={index}
                            onClick={() => checkChallenge(value)}
                            style={{
                              padding: "12px",
                              borderRadius: "8px",
                              border: "1px solid #475569",
                              backgroundColor: isSelected
                                ? "#334155"
                                : "#0f172a",
                              color: "#fff",
                              textAlign: "right",
                              cursor: answered ? "default" : "pointer",
                            }}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>

                    {answered && (
                      <div
                        style={{
                          marginTop: "14px",
                          padding: "12px",
                          borderRadius: "8px",
                          backgroundColor: "#0f172a",
                          color: "#cbd5e1",
                        }}
                      >
                        {question.explanation ||
                          "تم تسجيل إجابتك. انتقل للسؤال التالي."}
                      </div>
                    )}

                    {answered && challengeIndex < challengeItems.length - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setChallengeIndex(challengeIndex + 1);
                          setAnswered(false);
                          setSelectedAnswer(null);
                        }}
                        style={actionStyle}
                      >
                        السؤال التالي ➡️
                      </button>
                    )}

                    {answered && challengeIndex === challengeItems.length - 1 && (
                      <button
                        type="button"
                        onClick={finishChallenge}
                        style={{
                          ...actionStyle,
                          backgroundColor: "#22c55e",
                        }}
                      >
                        عرض النتيجة 🏆
                      </button>
                    )}

                    <div
                      style={{
                        textAlign: "center",
                        color: "#94a3b8",
                        marginTop: "12px",
                        fontSize: "12px",
                      }}
                    >
                      السؤال {challengeIndex + 1} من {challengeItems.length}
                    </div>
                  </div>
                );
              })()
            ) : (
              <>
                <div
                  style={{
                    color: "#cbd5e1",
                    backgroundColor: "#0f172a",
                    padding: "16px",
                    borderRadius: "9px",
                  }}
                >
                  لا توجد أسئلة Challenge مضافة لهذا الدرس بعد.
                </div>
                <button type="button" onClick={finishChallenge} style={actionStyle}>
                  إنهاء الدرس 🏆
                </button>
              </>
            )}
          </div>
        )}

        {stage === "result" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "55px", marginBottom: "10px" }}>🏆</div>

            <h3 style={{ color: "#fff", margin: "0 0 10px" }}>
              أحسنت! أكملت الدرس 🎉
            </h3>

            {challengeItems.length > 0 && (
              <div
                style={{
                  color: "#fbbf24",
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                {score} / {challengeItems.length}
              </div>
            )}

            <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>
              لقد أكملت مراحل الدرس التفاعلي. استمر في المراجعة والتدريب!
            </p>

            <button
              type="button"
              onClick={onExit}
              style={{
                ...actionStyle,
                maxWidth: "320px",
              }}
            >
              العودة لقائمة الدروس
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [track, setTrack] = useState<Track | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [tab, setTab] = useState<"books" | "exams" | "lessons">("books");

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const [lessonStage, setLessonStage] = useState<Stage>("learn");
  const [vocabIndex, setVocabIndex] = useState(0);

  const currentFiles =
    subject && tab !== "lessons"
      ? CONTENT_DATABASE[subject.id]?.[tab] || []
      : [];

  useEffect(() => {
    if (tab !== "lessons" || !subject) return;

    let cancelled = false;

    const loadLessons = async () => {
      setLoadingLessons(true);
      setSelectedLesson(null);

      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("subject_id", subject.id);

      if (cancelled) return;

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

  const trackLabels: Record<Track, string> = {
    scientific: "العلمي",
    literary: "الأدبي",
    vocational: "المهني",
  };

  const goHome = () => {
    setTrack(null);
    setSubject(null);
    setTab("books");
    setLessons([]);
    setSelectedLesson(null);
    setLessonStage("learn");
    setVocabIndex(0);
  };

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

      {track && !subject && (
        <div
          style={{
            minHeight: "100dvh",
            padding: "20px 16px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}>
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

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "13px",
                  color: "#94a3b8",
                  marginBottom: "5px",
                }}
              >
                المسار الدراسي
              </div>

              <h2 style={{ fontSize: "24px", margin: 0, color: "#fbbf24" }}>
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
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>
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

      {subject && (
        <div
          style={{
            minHeight: "100dvh",
            padding: "20px 16px 40px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}>
            <button
              type="button"
              onClick={() => {
                setSubject(null);
                setTab("books");
                setLessons([]);
                setSelectedLesson(null);
                setLessonStage("learn");
                setVocabIndex(0);
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
              <div style={{ fontSize: "42px", lineHeight: 1 }}>
                {subject.icon}
              </div>

              <h2 style={{ margin: "10px 0 0", fontSize: "22px" }}>
                {subject.name}
              </h2>
            </div>

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
                  backgroundColor: tab === "books" ? "#3b82f6" : "transparent",
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
                  backgroundColor: tab === "exams" ? "#3b82f6" : "transparent",
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
                  setLessonStage("learn");
                  setVocabIndex(0);
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
                      <div style={{ minWidth: 0, flex: 1 }}>
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

            {tab === "lessons" && (
              <div>
                {selectedLesson ? (
                  selectedLesson.content_json ? (
                    <InteractiveLesson
                      lesson={selectedLesson}
                      stage={lessonStage}
                      setStage={setLessonStage}
                      vocabIndex={vocabIndex}
                      setVocabIndex={setVocabIndex}
                      onExit={() => {
                        setSelectedLesson(null);
                        setLessonStage("learn");
                        setVocabIndex(0);
                      }}
                    />
                  ) : (
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
                  )
                ) : loadingLessons ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      padding: "40px 0",
                    }}
                  >
                    <div style={{ fontSize: "30px", marginBottom: "10px" }}>
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
                        onClick={() => {
                          setSelectedLesson(lesson);
                          setLessonStage("learn");
                          setVocabIndex(0);
                        }}
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
