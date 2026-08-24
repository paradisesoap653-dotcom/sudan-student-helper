"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

/* =========================================================
   صورة الواجهة الرئيسية - Supabase
========================================================= */

const HOME_COVER =
  "https://lhxebcykgdyxehcyohzk.supabase.co/storage/v1/object/public/materials/banar.jpg";

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
  content: string | null;
  content_json?: any;
};

type Subject = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type Track = "scientific" | "literary" | "vocational";

type LessonStage =
  | "learn"
  | "vocabulary"
  | "match"
  | "grammar"
  | "challenge"
  | "result";

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

/* =========================================================
   المواد حسب المسار
========================================================= */

const SUBJECTS: Record<Track, Subject[]> = {
  scientific: [
    { id: "math", name: "الرياضيات المتخصصة", icon: "📐", color: "#2563eb" },
    { id: "mathBasic", name: "الرياضيات الأساسية", icon: "➗", color: "#1e40af" },
    { id: "physics", name: "الفيزياء", icon: "⚡", color: "#7c3aed" },
    { id: "chemistry", name: "الكيمياء", icon: "🧪", color: "#059669" },
    { id: "biology", name: "الأحياء", icon: "🧬", color: "#e11d48" },
    { id: "arabic", name: "اللغة العربية", icon: "📖", color: "#d97706" },
    { id: "english", name: "اللغة الإنجليزية", icon: "Aa", color: "#0891b2" },
    { id: "french", name: "اللغة الفرنسية", icon: "🇫🇷", color: "#4338ca" },
    { id: "engineering", name: "العلوم الهندسية", icon: "⚙️", color: "#475569" },
  ],

  literary: [
    { id: "history", name: "التاريخ", icon: "📜", color: "#b45309" },
    { id: "geography", name: "الجغرافيا", icon: "🌍", color: "#047857" },
    { id: "islamic", name: "الدراسات الإسلامية", icon: "🕌", color: "#1d4ed8" },
    { id: "arabic", name: "اللغة العربية", icon: "📖", color: "#d97706" },
    { id: "english", name: "اللغة الإنجليزية", icon: "Aa", color: "#0891b2" },
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
    { id: "english", name: "اللغة الإنجليزية", icon: "Aa", color: "#0891b2" },
  ],
};

/* =========================================================
   أدوات
========================================================= */

function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function SubjectIcon({
  subjectId,
  fallback,
  size = 42,
}: {
  subjectId: string;
  fallback: string;
  size?: number;
}) {
  if (subjectId !== "english") {
    return <span aria-hidden="true">{fallback}</span>;
  }

  return (
    <span
      aria-hidden="true"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: "inline-flex",
        alignItems: "baseline",
        justifyContent: "center",
        gap: "1px",
        borderRadius: `${Math.round(size * 0.28)}px`,
        backgroundColor: "rgba(255,255,255,0.16)",
        border: "1px solid rgba(255,255,255,0.45)",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
        fontWeight: 900,
        lineHeight: 1,
        direction: "ltr",
        boxShadow: "0 4px 12px rgba(15,23,42,0.22)",
      }}
    >
      <span style={{ fontSize: `${Math.round(size * 0.5)}px` }}>A</span>
      <span style={{ fontSize: `${Math.round(size * 0.34)}px` }}>a</span>
    </span>
  );
}

function normalizeOptions(value: any): string[] {
  let parsedValue = value;

  if (typeof parsedValue === "string") {
    try {
      parsedValue = JSON.parse(parsedValue);
    } catch {
      return [];
    }
  }

  if (
    parsedValue &&
    typeof parsedValue === "object" &&
    !Array.isArray(parsedValue)
  ) {
    parsedValue = Object.values(parsedValue);
  }

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue
    .map((option: any) => {
      if (typeof option === "string") return option;
      if (typeof option === "number") return String(option);

      if (option && typeof option === "object") {
        return String(
          option.text ?? option.label ?? option.value ?? ""
        );
      }

      return String(option ?? "");
    })
    .filter((option: string) => option.trim() !== "");
}

/* =========================================================
   Interactive Lesson
========================================================= */

function InteractiveLesson({
  lesson,
  stage,
  setStage,
  vocabIndex,
  setVocabIndex,
  onExit,
}: any) {
  const data = useMemo(() => {
    const rawContent = lesson?.content_json;

    if (!rawContent) {
      return {};
    }

    if (typeof rawContent === "string") {
      try {
        const parsedContent = JSON.parse(rawContent);
        return parsedContent && typeof parsedContent === "object"
          ? parsedContent
          : {};
      } catch (error) {
        console.error("Failed to parse lesson.content_json:", error);
        return {};
      }
    }

    return typeof rawContent === "object" ? rawContent : {};
  }, [lesson?.content_json]);

  const vocab = Array.isArray(data.vocabulary)
    ? data.vocabulary
    : [];

  const match = Array.isArray(data.match)
    ? data.match
    : [];

  const grammar = data.grammar || {};

  const challenge = Array.isArray(data.challenge)
    ? data.challenge
    : [];

  /* =========================================================
     MATCH
  ========================================================= */

  const [matchWords, setMatchWords] = useState<any[]>([]);
  const [matchMeanings, setMatchMeanings] = useState<any[]>([]);

  const [selectedWord, setSelectedWord] = useState<string | null>(
    null
  );

  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(
    null
  );

  const [matchedWords, setMatchedWords] = useState<string[]>([]);

  const [matchWrong, setMatchWrong] = useState(false);

  const [matchScore, setMatchScore] = useState(0);

  const [matchStarted, setMatchStarted] = useState(false);

  /* =========================================================
     Grammar
  ========================================================= */

  const [grammarIndex, setGrammarIndex] = useState(0);
  const [grammarAnswer, setGrammarAnswer] = useState<string | null>(
    null
  );
  const [grammarScore, setGrammarScore] = useState(0);

  /* =========================================================
     Challenge
  ========================================================= */

  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeAnswer, setChallengeAnswer] = useState<string | null>(
    null
  );
  const [challengeScore, setChallengeScore] = useState(0);

  /* =========================================================
     تجهيز Match
  ========================================================= */

  const prepareMatch = () => {
    const validMatch = match.filter(
      (item: any) =>
        item &&
        typeof item.term === "string" &&
        typeof item.meaning === "string"
    );

    setMatchWords(shuffleArray(validMatch));
    setMatchMeanings(shuffleArray(validMatch));

    setSelectedWord(null);
    setSelectedMeaning(null);
    setMatchedWords([]);
    setMatchWrong(false);
    setMatchScore(0);
    setMatchStarted(true);
  };

  useEffect(() => {
    if (stage === "match" && !matchStarted) {
      prepareMatch();
    }
  }, [stage, matchStarted]);

  /* =========================================================
     بدء Match من جديد
  ========================================================= */

  const startMatch = () => {
    prepareMatch();
    setStage("match");
  };

  /* =========================================================
     اختيار كلمة
  ========================================================= */

  const chooseWord = (term: string) => {
    if (matchedWords.includes(term)) return;

    setMatchWrong(false);

    if (selectedWord === term) {
      setSelectedWord(null);
      return;
    }

    setSelectedWord(term);

    if (selectedMeaning !== null) {
      checkMatch(term, selectedMeaning);
    }
  };

  /* =========================================================
     اختيار المعنى
  ========================================================= */

  const chooseMeaning = (meaning: string) => {
    if (
      match.some(
        (item: any) =>
          matchedWords.includes(item.term) &&
          item.meaning === meaning
      )
    ) {
      return;
    }

    setMatchWrong(false);

    if (selectedMeaning === meaning) {
      setSelectedMeaning(null);
      return;
    }

    setSelectedMeaning(meaning);

    if (selectedWord !== null) {
      checkMatch(selectedWord, meaning);
    }
  };

  /* =========================================================
     فحص المطابقة
  ========================================================= */

  const checkMatch = (term: string, meaning: string) => {
    const item = match.find(
      (entry: any) =>
        entry.term === term && entry.meaning === meaning
    );

    if (item) {
      setMatchedWords((prev) =>
        prev.includes(term) ? prev : [...prev, term]
      );

      setMatchScore((prev: number) => prev + 1);

      setSelectedWord(null);
      setSelectedMeaning(null);
      setMatchWrong(false);
    } else {
      setMatchWrong(true);

      setTimeout(() => {
        setSelectedWord(null);
        setSelectedMeaning(null);
        setMatchWrong(false);
      }, 700);
    }
  };

  /* =========================================================
     هل انتهى Match؟
  ========================================================= */

  const matchCompleted =
    match.length > 0 &&
    matchedWords.length === match.length;



  /* =========================================================
     Grammar
  ========================================================= */

  const grammarQuestions = useMemo(() => {
    /*
      المصدر الأساسي هو JSON المضمّن داخل سجل الدرس:
      content_json.grammar.questions
    */
    const embeddedQuestions = Array.isArray(grammar?.questions)
      ? grammar.questions
      : [];

    if (embeddedQuestions.length > 0) {
      return embeddedQuestions.map((item: any, index: number) => ({
        id: item?.id ?? `${lesson?.id ?? "lesson"}-grammar-${index}`,
        question:
          item?.question ??
          item?.question_text ??
          item?.text ??
          "",
        answer:
          item?.answer ??
          item?.correct_answer ??
          "",
        options: shuffleArray(normalizeOptions(item?.options)),
        explanation: item?.explanation ?? "",
      }));
    }

    /*
      توافق مؤقت مع الدروس القديمة التي ما زالت تستخدم
      grammar.practice_verbs فقط. لا يُستخدم هذا المسار عندما
      تكون grammar.questions موجودة.
    */
    const practiceVerbs = Array.isArray(grammar?.practice_verbs)
      ? grammar.practice_verbs
      : [];

    const pastTenses: Record<string, string> = {
      arrive: "arrived",
      buy: "bought",
      catch: "caught",
      earn: "earned",
      help: "helped",
      keep: "kept",
      live: "lived",
      run: "ran",
      visit: "visited",
      win: "won",
    };

    const optionsMap: Record<string, string[]> = {
      arrive: ["arrived", "arrive", "arriving", "arriven"],
      buy: ["buyed", "bought", "buys", "buying"],
      catch: ["catched", "caught", "catches", "catching"],
      earn: ["earned", "earnt", "earning", "earns"],
      help: ["helped", "help", "helping", "helps"],
      keep: ["keeped", "kept", "keeps", "keeping"],
      live: ["lived", "live", "living", "lives"],
      run: ["runned", "ran", "runs", "running"],
      visit: ["visited", "visit", "visiting", "visits"],
      win: ["winned", "won", "wins", "winning"],
    };

    return practiceVerbs.map((verb: string, index: number) => {
      const answer = pastTenses[verb] || `${verb}ed`;

      return {
        id: `${lesson?.id ?? "lesson"}-legacy-grammar-${index}`,
        question: `What is the past tense of "${verb}"?`,
        answer,
        options: shuffleArray(
          optionsMap[verb] || [
            answer,
            verb,
            `${verb}ing`,
            `${verb}s`,
          ]
        ),
        explanation: "",
      };
    });
  }, [grammar?.questions, grammar?.practice_verbs, lesson?.id]);

  const currentGrammar = grammarQuestions[grammarIndex];


  useEffect(() => {
    if (!matchCompleted) return;

    const timer = setTimeout(() => {
      setGrammarIndex(0);
      setGrammarAnswer(null);
      setGrammarScore(0);

      if (grammarQuestions.length > 0) {
        setStage("grammar");
      } else if (challenge.length > 0) {
        setChallengeIndex(0);
        setChallengeAnswer(null);
        setChallengeScore(0);
        setStage("challenge");
      } else {
        setStage("result");
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [
    matchCompleted,
    grammarQuestions.length,
    challenge.length,
    setStage,
  ]);
  const answerGrammar = (answer: string) => {
    if (grammarAnswer !== null || !currentGrammar) return;

    setGrammarAnswer(answer);

    if (answer === currentGrammar.answer) {
      setGrammarScore((prev: number) => prev + 1);
    }
  };

  const nextGrammar = () => {
    if (grammarIndex < grammarQuestions.length - 1) {
      setGrammarIndex((prev: number) => prev + 1);
      setGrammarAnswer(null);
    } else {
      setChallengeIndex(0);
      setChallengeAnswer(null);
      setChallengeScore(0);
      setStage(challenge.length > 0 ? "challenge" : "result");
    }
  };

  /* =========================================================
     Challenge
  ========================================================= */

  const currentChallenge = challenge[challengeIndex];

  const answerChallenge = (answer: string) => {
    if (challengeAnswer !== null || !currentChallenge) return;

    setChallengeAnswer(answer);

    if (answer === currentChallenge.answer) {
      setChallengeScore((prev: number) => prev + 1);
    }
  };

  const nextChallenge = () => {
    if (challengeIndex < challenge.length - 1) {
      setChallengeIndex((prev) => prev + 1);
      setChallengeAnswer(null);
    } else {
      setStage("result");
    }
  };

  /* =========================================================
     النتيجة
  ========================================================= */

  const totalQuestions =
    match.length +
    grammarQuestions.length +
    challenge.length;

  const totalScore =
    matchScore +
    grammarScore +
    challengeScore;

  const percentage =
    totalQuestions > 0
      ? Math.round((totalScore / totalQuestions) * 100)
      : 0;

  /* =========================================================
     المراحل
  ========================================================= */

  const stages = [
    { id: "learn", icon: "📖", label: "تعلّم", available: true },
    {
      id: "vocabulary",
      icon: "🧠",
      label: "كلمات",
      available: vocab.length > 0,
    },
    {
      id: "match",
      icon: "🧩",
      label: "مطابقة",
      available: match.length > 0,
    },
    {
      id: "grammar",
      icon: "🎯",
      label: "قواعد",
      available: grammarQuestions.length > 0,
    },
    {
      id: "challenge",
      icon: "⚡",
      label: "تحدي",
      available: challenge.length > 0,
    },
    { id: "result", icon: "🏆", label: "نتيجة", available: true },
  ];

  const currentStageIndex = stages.findIndex(
    (s) => s.id === stage
  );

  return (
    <div style={{ paddingTop: "44px" }}>
      {/* مسار تنقل واحد بدلاً من تكرار روابط العودة */}
      <nav
        aria-label="مسار التنقل"
        dir="rtl"
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "7px",
          marginBottom: "14px",
          color: "#cbd5e1",
          fontSize: "13px",
        }}
      >
        <span style={{ color: "#94a3b8" }}>المواد</span>
        <span aria-hidden="true" style={{ color: "#64748b" }}>←</span>
        <span style={{ color: "#94a3b8" }}>اللغة الإنجليزية</span>
        <span aria-hidden="true" style={{ color: "#64748b" }}>←</span>
        <button
          type="button"
          onClick={onExit}
          style={{
            background: "none",
            border: "none",
            color: "#38bdf8",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
            padding: "6px 0",
          }}
        >
          الدروس
        </button>
      </nav>

      {/* =====================================================
          شريط مراحل مختصر ومتجاوب
      ===================================================== */}

      <div
        aria-label="مراحل الدرس"
        dir="ltr"
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "14px",
          overflowX: "auto",
          padding: "2px 0 7px",
          scrollbarWidth: "thin",
        }}
      >
        {stages.map((item, index) => {
          const isCurrent = index === currentStageIndex;
          const isReached = index <= currentStageIndex;
          const isUnavailable = !item.available;

          return (
            <div
              key={item.id}
              aria-current={isCurrent && !isUnavailable ? "step" : undefined}
              aria-disabled={isUnavailable || undefined}
              title={isUnavailable ? "غير متاح لهذا الدرس" : item.label}
              style={{
                flex: "1 0 56px",
                minWidth: "56px",
                textAlign: "center",
                opacity: isUnavailable ? 0.58 : isReached ? 1 : 0.78,
                scrollSnapAlign: "start",
              }}
            >
              <div
                style={{
                  height: "5px",
                  borderRadius: "999px",
                  backgroundColor: isUnavailable
                    ? "#475569"
                    : isReached
                    ? "#3b82f6"
                    : "#475569",
                  marginBottom: "6px",
                }}
              />

              <div
                dir="rtl"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "3px",
                  fontSize: "11px",
                  fontWeight: isCurrent ? "bold" : "normal",
                  color: isUnavailable
                    ? "#94a3b8"
                    : isCurrent
                    ? "#fbbf24"
                    : "#cbd5e1",
                  whiteSpace: "nowrap",
                }}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          بطاقة الدرس
      ===================================================== */}

      <div
        style={{
          backgroundColor: "#1e293b",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid #334155",
        }}
      >
        <div
          dir="auto"
          style={{
            fontSize: "12px",
            color: "#fbbf24",
            marginBottom: "6px",
            textAlign: "start",
          }}
        >
          {lesson.unit_title}
        </div>

        <h3
          dir="auto"
          style={{
            color: "#fff",
            margin: "0 0 12px",
            fontSize: "20px",
            lineHeight: 1.45,
            textAlign: "start",
          }}
        >
          {lesson.lesson_title}
        </h3>

        {/* ===================================================
            LEARN
        =================================================== */}

        {stage === "learn" && (
          <div>
            <div
              style={{
                fontSize: "13px",
                color: "#94a3b8",
                marginBottom: "10px",
              }}
            >
              📖 Learn
            </div>

            {data.learn?.intro && (
              <p
                dir="auto"
                style={{
                  color: "#e2e8f0",
                  lineHeight: 1.8,
                  fontWeight: "bold",
                  textAlign: "start",
                }}
              >
                {data.learn.intro}
              </p>
            )}

            {Array.isArray(data.learn?.paragraphs) &&
              data.learn.paragraphs.map(
                (p: string, i: number) => (
                  <p
                    key={i}
                    dir="auto"
                    style={{
                      color: "#e2e8f0",
                      lineHeight: 1.8,
                      textAlign: "start",
                    }}
                  >
                    {p}
                  </p>
                )
              )}

            <button
              type="button"
              onClick={() => {
                setVocabIndex(0);
                setStage("vocabulary");
              }}
              style={{
                marginTop: "16px",
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#3b82f6",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              التالي: المفردات ⬅️
            </button>
          </div>
        )}

        {/* ===================================================
            VOCABULARY
        =================================================== */}

        {stage === "vocabulary" && vocab.length > 0 && (
          <div>
            <div
              style={{
                fontSize: "13px",
                color: "#94a3b8",
                marginBottom: "10px",
              }}
            >
              🧠 Vocabulary ({vocabIndex + 1}/
              {vocab.length})
            </div>

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
                dir="auto"
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#fff",
                  marginBottom: "8px",
                }}
              >
                {vocab[vocabIndex]?.word}
              </div>

              <div
                dir="auto"
                style={{
                  fontSize: "18px",
                  color: "#fbbf24",
                  marginBottom: "12px",
                }}
              >
                {vocab[vocabIndex]?.meaning}
              </div>

              <div
                dir="auto"
                style={{
                  fontSize: "13px",
                  color: "#cbd5e1",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                }}
              >
                {vocab[vocabIndex]?.example}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "16px",
              }}
            >
              <button
                type="button"
                disabled={vocabIndex === 0}
                onClick={() =>
                  setVocabIndex(vocabIndex - 1)
                }
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  backgroundColor: "transparent",
                  color:
                    vocabIndex === 0
                      ? "#475569"
                      : "#fff",
                  cursor:
                    vocabIndex === 0
                      ? "default"
                      : "pointer",
                }}
              >
                السابق
              </button>

              {vocabIndex < vocab.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setVocabIndex(vocabIndex + 1)
                  }
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
                  onClick={startMatch}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#8b5cf6",
                    color: "#fff",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  ابدأ المطابقة 🧩
                </button>
              )}
            </div>
          </div>
        )}

        {/* ===================================================
            MATCH - النسخة التفاعلية الجديدة
        =================================================== */}

        {stage === "match" && match.length > 0 && (
          <div>
            <div
              style={{
                fontSize: "13px",
                color: "#94a3b8",
                marginBottom: "6px",
              }}
            >
              🧩 Match
            </div>

            <div
              style={{
                fontSize: "20px",
                fontWeight: "900",
                color: "#fff",
                marginBottom: "5px",
              }}
            >
              طابق الكلمات مع معانيها
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                marginBottom: "16px",
              }}
            >
              اختر كلمة ثم اختر معناها الصحيح
            </div>

            {/* النتيجة */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#0f172a",
                borderRadius: "10px",
                padding: "10px 13px",
                marginBottom: "15px",
                border: "1px solid #334155",
              }}
            >
              <span
                style={{
                  color: "#94a3b8",
                  fontSize: "12px",
                }}
              >
                التقدم
              </span>

              <strong
                style={{
                  color: "#22c55e",
                  fontSize: "14px",
                }}
              >
                {matchedWords.length} / {match.length} ✅
              </strong>
            </div>

            {/* رسالة الخطأ */}
            {matchWrong && (
              <div
                style={{
                  backgroundColor: "#450a0a",
                  border: "1px solid #ef4444",
                  color: "#fecaca",
                  borderRadius: "9px",
                  padding: "10px",
                  textAlign: "center",
                  marginBottom: "12px",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                ❌ ليست المطابقة الصحيحة، حاول مرة أخرى
              </div>
            )}

            {/* عمودان */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                alignItems: "start",
              }}
            >
              {/* الكلمات */}
              <div>
                <div
                  style={{
                    color: "#38bdf8",
                    fontWeight: "bold",
                    textAlign: "center",
                    fontSize: "12px",
                    marginBottom: "8px",
                  }}
                >
                  الكلمات 🇬🇧
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {matchWords.map((item: any) => {
                    const matched =
                      matchedWords.includes(item.term);

                    const selected =
                      selectedWord === item.term;

                    return (
                      <button
                        key={item.term}
                        type="button"
                        disabled={matched}
                        onClick={() =>
                          chooseWord(item.term)
                        }
                        style={{
                          width: "100%",
                          minHeight: "52px",
                          padding: "9px 6px",
                          borderRadius: "9px",
                          border: `1px solid ${
                            matched
                              ? "#22c55e"
                              : selected
                              ? "#f59e0b"
                              : "#334155"
                          }`,
                          backgroundColor: matched
                            ? "#14532d"
                            : selected
                            ? "#78350f"
                            : "#0f172a",
                          color: matched
                            ? "#86efac"
                            : "#fff",
                          fontWeight: "bold",
                          fontSize: "13px",
                          cursor: matched
                            ? "default"
                            : "pointer",
                          transition:
                            "all 0.2s ease",
                        }}
                      >
                        {item.term}

                        {matched && " ✅"}

                        {selected &&
                          !matched &&
                          " 👆"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* المعاني */}
              <div>
                <div
                  style={{
                    color: "#fbbf24",
                    fontWeight: "bold",
                    textAlign: "center",
                    fontSize: "12px",
                    marginBottom: "8px",
                  }}
                >
                  المعاني 🇸🇩
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {matchMeanings.map((item: any) => {
                    const matched =
                      matchedWords.includes(item.term);

                    const selected =
                      selectedMeaning === item.meaning;

                    return (
                      <button
                        key={item.meaning}
                        type="button"
                        disabled={matched}
                        onClick={() =>
                          chooseMeaning(item.meaning)
                        }
                        style={{
                          width: "100%",
                          minHeight: "52px",
                          padding: "9px 6px",
                          borderRadius: "9px",
                          border: `1px solid ${
                            matched
                              ? "#22c55e"
                              : selected
                              ? "#f59e0b"
                              : "#334155"
                          }`,
                          backgroundColor: matched
                            ? "#14532d"
                            : selected
                            ? "#78350f"
                            : "#0f172a",
                          color: matched
                            ? "#86efac"
                            : "#fff",
                          fontWeight: "bold",
                          fontSize: "13px",
                          cursor: matched
                            ? "default"
                            : "pointer",
                          transition:
                            "all 0.2s ease",
                        }}
                      >
                        {item.meaning}

                        {matched && " ✅"}

                        {selected &&
                          !matched &&
                          " 👆"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* إكمال المطابقة */}
            {matchCompleted && (
              <div
                style={{
                  marginTop: "18px",
                  backgroundColor: "#14532d",
                  border: "1px solid #22c55e",
                  borderRadius: "12px",
                  padding: "16px",
                  textAlign: "center",
                  color: "#fff",
                }}
              >
                <div
                  style={{
                    fontSize: "30px",
                    marginBottom: "5px",
                  }}
                >
                  🎉
                </div>

                <div
                  style={{
                    fontWeight: "900",
                    fontSize: "16px",
                  }}
                >
                  ممتاز! أكملت المطابقة
                </div>

                <div
                  style={{
                    color: "#bbf7d0",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  النتيجة: {matchScore} / {match.length}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#86efac",
                    marginTop: "8px",
                  }}
                >
                  جاري الانتقال إلى Grammar...
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================
            MATCH بدون بيانات
        =================================================== */}

        {stage === "match" && match.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "25px",
            }}
          >
            <div
              style={{
                fontSize: "35px",
              }}
            >
              🧩
            </div>

            <p
              style={{
                color: "#cbd5e1",
              }}
            >
              لا توجد كلمات للمطابقة لهذا الدرس حالياً.
            </p>

            <button
              type="button"
              onClick={() => {
                if (grammarQuestions.length > 0) {
                  setStage("grammar");
                } else if (challenge.length > 0) {
                  setStage("challenge");
                } else {
                  setStage("result");
                }
              }}
              style={{
                width: "100%",
                padding: "12px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: "#3b82f6",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {grammarQuestions.length > 0
                ? "الانتقال إلى القواعد 🎯"
                : challenge.length > 0
                ? "الانتقال إلى التحدي ⚡"
                : "عرض النتيجة 🏆"}
            </button>
          </div>
        )}

        {/* ===================================================
            GRAMMAR
        =================================================== */}

        {stage === "grammar" &&
          grammarQuestions.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#94a3b8",
                  marginBottom: "8px",
                }}
              >
                🎯 Grammar
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "15px",
                }}
              >
                {grammar.title ||
                  "Time for Tenses"}{" "}
                — السؤال {grammarIndex + 1} من{" "}
                {grammarQuestions.length}
              </div>

              <div
                style={{
                  backgroundColor: "#0f172a",
                  borderRadius: "12px",
                  padding: "18px 14px",
                  border: "1px solid #334155",
                  marginBottom: "14px",
                }}
              >
                <div
                  dir="auto"
                  style={{
                    color: "#fff",
                    fontSize: "18px",
                    fontWeight: "bold",
                    textAlign: "start",
                    lineHeight: 1.7,
                  }}
                >
                  {currentGrammar?.question}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "9px",
                }}
              >
                {currentGrammar?.options.map(
                  (
                    option: string,
                    index: number
                  ) => {
                    const correct =
                      grammarAnswer !== null &&
                      option ===
                        currentGrammar.answer;

                    const selected =
                      grammarAnswer === option;

                    return (
                      <button
                        key={`${option}-${index}`}
                        type="button"
                        dir="auto"
                        onClick={() =>
                          answerGrammar(option)
                        }
                        style={{
                          width: "100%",
                          padding: "13px",
                          textAlign: "start",
                          borderRadius: "9px",
                          border: `1px solid ${
                            correct
                              ? "#22c55e"
                              : selected
                              ? "#ef4444"
                              : "#334155"
                          }`,
                          backgroundColor: correct
                            ? "#14532d"
                            : selected
                            ? "#450a0a"
                            : "#0f172a",
                          color: "#fff",
                          fontWeight: "bold",
                          cursor:
                            grammarAnswer !== null
                              ? "default"
                              : "pointer",
                        }}
                      >
                        {option}

                        {correct && " ✅"}

                        {selected &&
                          !correct &&
                          " ❌"}
                      </button>
                    );
                  }
                )}
              </div>

              {grammarAnswer !== null &&
                currentGrammar?.explanation && (
                  <div
                    dir="auto"
                    style={{
                      marginTop: "14px",
                      padding: "12px",
                      borderRadius: "9px",
                      backgroundColor: "#172554",
                      border: "1px solid #3b82f6",
                      color: "#dbeafe",
                      lineHeight: 1.7,
                      fontSize: "14px",
                      textAlign: "start",
                    }}
                  >
                    💡 {currentGrammar.explanation}
                  </div>
                )}

              {grammarAnswer !== null && (
                <button
                  type="button"
                  onClick={nextGrammar}
                  style={{
                    marginTop: "14px",
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#3b82f6",
                    color: "#fff",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {grammarIndex <
                  grammarQuestions.length - 1
                    ? "السؤال التالي ➡️"
                    : challenge.length > 0
                      ? "انتقل إلى التحدي ⚡"
                      : "عرض النتيجة 🏆"}
                </button>
              )}
            </div>
          )}

        {/* ===================================================
            GRAMMAR بدون بيانات
        =================================================== */}

        {stage === "grammar" &&
          grammarQuestions.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "12px 4px 4px",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "#334155",
                  color: "#cbd5e1",
                  fontSize: "24px",
                  marginBottom: "8px",
                }}
              >
                🎯
              </div>

              <p
                style={{
                  color: "#e2e8f0",
                  margin: "0 0 14px",
                  lineHeight: 1.7,
                }}
              >
                لا توجد تدريبات على القواعد لهذا الدرس.
              </p>

              <button
                type="button"
                onClick={() => {
                  setChallengeIndex(0);
                  setChallengeAnswer(null);
                  setChallengeScore(0);
                  setStage(challenge.length > 0 ? "challenge" : "result");
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "#3b82f6",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {challenge.length > 0
                  ? "الانتقال إلى التحدي ⚡"
                  : "عرض النتيجة 🏆"}
              </button>
            </div>
          )}

        {/* ===================================================
            CHALLENGE
        =================================================== */}

        {stage === "challenge" &&
          challenge.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#94a3b8",
                  marginBottom: "8px",
                }}
              >
                ⚡ Challenge
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "15px",
                }}
              >
                السؤال {challengeIndex + 1} من{" "}
                {challenge.length}
              </div>

              <div
                style={{
                  backgroundColor: "#0f172a",
                  borderRadius: "12px",
                  padding: "18px 14px",
                  border: "1px solid #334155",
                  marginBottom: "14px",
                }}
              >
                <div
                  dir="auto"
                  style={{
                    color: "#fff",
                    fontSize: "17px",
                    fontWeight: "bold",
                    lineHeight: 1.8,
                    textAlign: "start",
                  }}
                >
                  {currentChallenge?.question}
                </div>
              </div>

              {currentChallenge?.type ===
              "true_false" ? (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  {["True", "False"].map(
                    (option) => {
                      const correct =
                        challengeAnswer !== null &&
                        option ===
                          currentChallenge.answer;

                      const selected =
                        challengeAnswer === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            answerChallenge(option)
                          }
                          style={{
                            flex: 1,
                            padding: "14px 8px",
                            borderRadius: "9px",
                            border: `1px solid ${
                              correct
                                ? "#22c55e"
                                : selected
                                ? "#ef4444"
                                : "#334155"
                            }`,
                            backgroundColor:
                              correct
                                ? "#14532d"
                                : selected
                                ? "#450a0a"
                                : "#0f172a",
                            color: "#fff",
                            fontWeight: "bold",
                            cursor:
                              challengeAnswer !== null
                                ? "default"
                                : "pointer",
                          }}
                        >
                          {option}

                          {correct && " ✅"}

                          {selected &&
                            !correct &&
                            " ❌"}
                        </button>
                      );
                    }
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "9px",
                  }}
                >
                  {(
                    currentChallenge?.options || []
                  ).map(
                    (
                      option: string,
                      index: number
                    ) => {
                      const correct =
                        challengeAnswer !== null &&
                        option ===
                          currentChallenge.answer;

                      const selected =
                        challengeAnswer === option;

                      return (
                        <button
                          key={`${option}-${index}`}
                          type="button"
                          dir="auto"
                          onClick={() =>
                            answerChallenge(option)
                          }
                          style={{
                            width: "100%",
                            padding: "13px",
                            textAlign: "start",
                            borderRadius: "9px",
                            border: `1px solid ${
                              correct
                                ? "#22c55e"
                                : selected
                                ? "#ef4444"
                                : "#334155"
                            }`,
                            backgroundColor:
                              correct
                                ? "#14532d"
                                : selected
                                ? "#450a0a"
                                : "#0f172a",
                            color: "#fff",
                            fontWeight: "bold",
                            cursor:
                              challengeAnswer !== null
                                ? "default"
                                : "pointer",
                          }}
                        >
                          {option}

                          {correct && " ✅"}

                          {selected &&
                            !correct &&
                            " ❌"}
                        </button>
                      );
                    }
                  )}
                </div>
              )}

              {challengeAnswer !== null && (
                <button
                  type="button"
                  onClick={nextChallenge}
                  style={{
                    marginTop: "14px",
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#f59e0b",
                    color: "#111827",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {challengeIndex <
                  challenge.length - 1
                    ? "السؤال التالي ➡️"
                    : "عرض النتيجة 🏆"}
                </button>
              )}
            </div>
          )}

        {/* ===================================================
            CHALLENGE بدون بيانات
        =================================================== */}

        {stage === "challenge" &&
          challenge.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "25px",
              }}
            >
              <div
                style={{
                  fontSize: "40px",
                }}
              >
                🏆
              </div>

              <p
                style={{
                  color: "#cbd5e1",
                }}
              >
                لا توجد أسئلة تحدي لهذا الدرس.
              </p>

              <button
                type="button"
                onClick={() => setStage("result")}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "#f59e0b",
                  color: "#111827",
                  fontWeight: "bold",
                }}
              >
                عرض النتيجة 🏆
              </button>
            </div>
          )}

        {/* ===================================================
            RESULT
        =================================================== */}

        {stage === "result" && (
          <div
            style={{
              textAlign: "center",
              padding: "15px 0 10px",
            }}
          >
            <div
              style={{
                fontSize: "58px",
                marginBottom: "8px",
              }}
            >
              {percentage >= 80
                ? "🏆"
                : percentage >= 50
                ? "🎉"
                : "💪"}
            </div>

            <div
              style={{
                fontSize: "24px",
                fontWeight: "900",
                color: "#fbbf24",
                marginBottom: "5px",
              }}
            >
              أحسنت!
            </div>

            <div
              style={{
                color: "#cbd5e1",
                fontSize: "14px",
                marginBottom: "18px",
              }}
            >
              أكملت درس {lesson.lesson_title}
            </div>

            <div
              style={{
                backgroundColor: "#0f172a",
                borderRadius: "14px",
                padding: "20px",
                border: "1px solid #334155",
                marginBottom: "15px",
              }}
            >
              <div
                style={{
                  fontSize: "42px",
                  fontWeight: "900",
                  color: "#22c55e",
                }}
              >
                {percentage}%
              </div>

              <div
                style={{
                  color: "#94a3b8",
                  marginTop: "5px",
                  fontSize: "13px",
                }}
              >
                {totalScore} من {totalQuestions}{" "}
                إجابة صحيحة
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap: "7px",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#172554",
                  padding: "10px 5px",
                  borderRadius: "9px",
                }}
              >
                <div style={{ fontSize: "18px" }}>
                  🧩
                </div>

                <div
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  {matchScore}/{match.length}
                </div>

                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "10px",
                  }}
                >
                  Match
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#172554",
                  padding: "10px 5px",
                  borderRadius: "9px",
                }}
              >
                <div style={{ fontSize: "18px" }}>
                  🎯
                </div>

                <div
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  {grammarScore}/
                  {grammarQuestions.length}
                </div>

                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "10px",
                  }}
                >
                  Grammar
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#172554",
                  padding: "10px 5px",
                  borderRadius: "9px",
                }}
              >
                <div style={{ fontSize: "18px" }}>
                  ⚡
                </div>

                <div
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  {challengeScore}/
                  {challenge.length}
                </div>

                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "10px",
                  }}
                >
                  Challenge
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setMatchStarted(false);
                setMatchWords([]);
                setMatchMeanings([]);
                setSelectedWord(null);
                setSelectedMeaning(null);
                setMatchedWords([]);
                setMatchWrong(false);
                setMatchScore(0);

                setGrammarIndex(0);
                setGrammarScore(0);
                setGrammarAnswer(null);

                setChallengeIndex(0);
                setChallengeScore(0);
                setChallengeAnswer(null);

                setVocabIndex(0);

                setStage("learn");
              }}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "9px",
                border: "none",
                backgroundColor: "#3b82f6",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
                marginBottom: "9px",
              }}
            >
              إعادة الدرس 🔄
            </button>

            <button
              type="button"
              onClick={onExit}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "9px",
                border: "1px solid #334155",
                backgroundColor: "transparent",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
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

/* =========================================================
   الصفحة الرئيسية
========================================================= */

export default function Home() {
  const [track, setTrack] = useState<Track | null>(
    null
  );

  const [subject, setSubject] =
    useState<Subject | null>(null);

  const [tab, setTab] = useState<
    "books" | "exams" | "lessons"
  >("books");

  const [lessons, setLessons] = useState<Lesson[]>(
    []
  );

  const [loadingLessons, setLoadingLessons] =
    useState(false);

  const [selectedLesson, setSelectedLesson] =
    useState<Lesson | null>(null);

  const [lessonStage, setLessonStage] =
    useState<LessonStage>("learn");

  const [vocabIndex, setVocabIndex] = useState(0);

  /* =======================================================
     الملفات الحالية
  ======================================================= */

  const currentFiles =
    subject && tab !== "lessons"
      ? CONTENT_DATABASE[subject.id]?.[tab] || []
      : [];

  /* =======================================================
     تحميل الدروس
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

      if (cancelled) return;

      if (error) {
        console.error(
          "Error loading lessons:",
          error
        );

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
    setLessonStage("learn");
    setVocabIndex(0);
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
              objectFit: "fill",
              objectPosition: "center center",
            }}
          />

          <button
            type="button"
            onClick={() =>
              setTrack("scientific")
            }
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
              WebkitTapHighlightColor:
                "transparent",
            }}
          />

          <button
            type="button"
            onClick={() =>
              setTrack("literary")
            }
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
              WebkitTapHighlightColor:
                "transparent",
            }}
          />

          <button
            type="button"
            onClick={() =>
              setTrack("vocational")
            }
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
              WebkitTapHighlightColor:
                "transparent",
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
                gridTemplateColumns:
                  "1fr 1fr",
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
                    border:
                      "1px solid #334155",
                    color: "#fff",
                    cursor: "pointer",
                    textAlign: "center",
                    boxShadow:
                      "0 5px 15px rgba(0,0,0,0.15)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "32px",
                      marginBottom: "8px",
                    }}
                  >
                    <SubjectIcon
                      subjectId={item.id}
                      fallback={item.icon}
                      size={38}
                    />
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
            padding:
              "20px 16px 40px",
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
              onClick={() => {
                setSubject(null);
                setTab("books");
                setLessons([]);
                setSelectedLesson(null);
                setLessonStage("learn");
                setVocabIndex(0);
              }}
              style={{
                display: selectedLesson ? "none" : "inline-block",
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
                display: selectedLesson ? "none" : "block",
                padding: "20px 16px",
                borderRadius: "16px",
                backgroundColor:
                  subject.color,
                color: "#fff",
                textAlign: "center",
                marginBottom: "16px",
                boxShadow:
                  "0 8px 25px rgba(0,0,0,0.25)",
              }}
            >
              <div
                style={{
                  fontSize: "42px",
                  lineHeight: 1,
                }}
              >
                <SubjectIcon
                  subjectId={subject.id}
                  fallback={subject.icon}
                  size={48}
                />
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
                display: selectedLesson ? "none" : "flex",
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
                    tab === "books"
                      ? "#3b82f6"
                      : "transparent",
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
                    tab === "exams"
                      ? "#3b82f6"
                      : "transparent",
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
                    tab === "lessons"
                      ? "#3b82f6"
                      : "transparent",
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
                  currentFiles.map(
                    (file, idx) => (
                      <div
                        key={`${file.title}-${idx}`}
                        style={{
                          padding: "14px",
                          borderRadius: "11px",
                          backgroundColor:
                            "#1e293b",
                          border:
                            "1px solid #334155",
                          display: "flex",
                          justifyContent:
                            "space-between",
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
                            padding:
                              "8px 14px",
                            backgroundColor:
                              "#22c55e",
                            textDecoration:
                              "none",
                            color: "#fff",
                            borderRadius:
                              "7px",
                            fontWeight:
                              "bold",
                            fontSize: "13px",
                          }}
                        >
                          فتح
                        </a>
                      </div>
                    )
                  )
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      padding: "35px 10px",
                      backgroundColor:
                        "#1e293b",
                      borderRadius: "12px",
                    }}
                  >
                    لا توجد ملفات مرفوعة
                    حالياً لهذه المادة.
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
                  selectedLesson.content_json ? (
                    <InteractiveLesson
                      key={String(selectedLesson.id)}
                      lesson={selectedLesson}
                      stage={lessonStage}
                      setStage={setLessonStage}
                      vocabIndex={vocabIndex}
                      setVocabIndex={
                        setVocabIndex
                      }
                      onExit={() => {
                        setSelectedLesson(null);
                        setLessonStage(
                          "learn"
                        );
                        setVocabIndex(0);
                      }}
                    />
                  ) : (
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedLesson(
                            null
                          )
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: "#38bdf8",
                          cursor: "pointer",
                          marginBottom:
                            "12px",
                          fontSize: "14px",
                          padding: "8px 0",
                        }}
                      >
                        ➡️ العودة لقائمة الدروس
                      </button>

                      <div
                        style={{
                          backgroundColor:
                            "#1e293b",
                          borderRadius:
                            "12px",
                          padding: "18px",
                          border:
                            "1px solid #334155",
                        }}
                      >
                        <div
                          style={{
                            color: "#fbbf24",
                            fontSize:
                              "12px",
                            marginBottom:
                              "8px",
                          }}
                        >
                          {
                            selectedLesson.unit_title
                          }
                        </div>

                        <h3
                          style={{
                            color: "#fff",
                            margin:
                              "0 0 16px",
                            fontSize:
                              "20px",
                            lineHeight:
                              1.5,
                          }}
                        >
                          {
                            selectedLesson.lesson_title
                          }
                        </h3>

                        <div
                          style={{
                            color:
                              "#e2e8f0",
                            lineHeight:
                              1.9,
                            fontSize:
                              "15px",
                          }}
                          dangerouslySetInnerHTML={{
                            __html:
                              selectedLesson.content ||
                              "",
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
                    <div
                      style={{
                        fontSize: "30px",
                        marginBottom:
                          "10px",
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
                      flexDirection:
                        "column",
                      gap: "10px",
                    }}
                  >
                    {lessons.map(
                      (lesson) => (
                        <button
                          type="button"
                          key={lesson.id}
                          onClick={() => {
                            setSelectedLesson(
                              lesson
                            );
                            setLessonStage(
                              "learn"
                            );
                            setVocabIndex(
                              0
                            );
                          }}
                          style={{
                            padding: "15px",
                            borderRadius:
                              "10px",
                            backgroundColor:
                              "#1e293b",
                            border:
                              "1px solid #334155",
                            color: "#fff",
                            textAlign:
                              "right",
                            cursor:
                              "pointer",
                          }}
                        >
                          <div
                            style={{
                              fontSize:
                                "12px",
                              color:
                                "#fbbf24",
                              marginBottom:
                                "5px",
                            }}
                          >
                            {
                              lesson.unit_title
                            }
                          </div>

                          <div
                            style={{
                              fontWeight:
                                "bold",
                              fontSize:
                                "14px",
                              lineHeight:
                                1.6,
                            }}
                          >
                            {
                              lesson.lesson_title
                            }
                          </div>
                        </button>
                      )
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      padding: "35px 10px",
                      backgroundColor:
                        "#1e293b",
                      borderRadius: "12px",
                    }}
                  >
                    لا توجد دروس تفاعلية
                    مضافة حالياً لهذه
                    المادة.
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
