"use client";

import React, { useEffect, useMemo, useState } from "react";

function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
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

function InteractiveLesson({
  lesson,
  stage,
  setStage,
  vocabIndex,
  setVocabIndex,
  onExit,
}: any) {
  /*
    content_json قد يصل ككائن JSON أو كنص JSON.
    لذلك نقوم بتحويله بأمان قبل قراءة محتوى الدرس.
  */
  const data = useMemo(() => {
    const rawContent = lesson?.content_json;

    if (!rawContent) {
      return {};
    }

    if (typeof rawContent === "string") {
      try {
        const parsed = JSON.parse(rawContent);
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch (error) {
        console.error("Failed to parse lesson.content_json:", error);
        return {};
      }
    }

    return typeof rawContent === "object" ? rawContent : {};
  }, [lesson?.content_json]);

  const vocab = Array.isArray((data as any).vocabulary)
    ? (data as any).vocabulary
    : [];

  const match = Array.isArray((data as any).match)
    ? (data as any).match
    : [];

  const grammar = (data as any).grammar || {};

  const challenge = Array.isArray((data as any).challenge)
    ? (data as any).challenge
    : [];

  // =========================================================
  // MATCH
  // =========================================================

  const [matchWords, setMatchWords] = useState<any[]>([]);
  const [matchMeanings, setMatchMeanings] = useState<any[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);
  const [matchedWords, setMatchedWords] = useState<string[]>([]);
  const [matchWrong, setMatchWrong] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [matchStarted, setMatchStarted] = useState(false);

  // =========================================================
  // GRAMMAR
  // =========================================================

  const [grammarIndex, setGrammarIndex] = useState(0);
  const [grammarAnswer, setGrammarAnswer] = useState<string | null>(null);
  const [grammarScore, setGrammarScore] = useState(0);

  /*
    لا يوجد أي استعلام لجدول questions هنا.
    كل أسئلة القواعد تُقرأ من:
    lesson.content_json.grammar.questions
  */
  const grammarQuestions = useMemo(() => {
    const rawQuestions = Array.isArray(grammar?.questions)
      ? grammar.questions
      : [];

    return rawQuestions.map((question: any, index: number) => ({
      id: question.id ?? `${lesson?.id ?? "lesson"}-grammar-${index}`,
      question:
        question.question ??
        question.question_text ??
        question.text ??
        "",
      answer:
        question.answer ??
        question.correct_answer ??
        "",
      options: shuffleArray(normalizeOptions(question.options)),
      explanation: question.explanation ?? "",
    }));
  }, [grammar?.questions, lesson?.id]);

  const currentGrammar = grammarQuestions[grammarIndex];

  // =========================================================
  // CHALLENGE
  // =========================================================

  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeAnswer, setChallengeAnswer] = useState<string | null>(null);
  const [challengeScore, setChallengeScore] = useState(0);

  // تنظيف الحالة عند الانتقال إلى درس آخر
  useEffect(() => {
    setMatchWords([]);
    setMatchMeanings([]);
    setSelectedWord(null);
    setSelectedMeaning(null);
    setMatchedWords([]);
    setMatchWrong(false);
    setMatchScore(0);
    setMatchStarted(false);

    setGrammarIndex(0);
    setGrammarAnswer(null);
    setGrammarScore(0);

    setChallengeIndex(0);
    setChallengeAnswer(null);
    setChallengeScore(0);
  }, [lesson?.id]);

  // =========================================================
  // MATCH SETUP
  // =========================================================

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

  const startMatch = () => {
    prepareMatch();
    setStage("match");
  };

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

  const chooseMeaning = (meaning: string) => {
    const alreadyMatched = match.some(
      (item: any) =>
        matchedWords.includes(item.term) && item.meaning === meaning
    );

    if (alreadyMatched) return;

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

  const checkMatch = (term: string, meaning: string) => {
    const item = match.find(
      (entry: any) =>
        entry.term === term && entry.meaning === meaning
    );

    if (item) {
      setMatchedWords((previous) =>
        previous.includes(term) ? previous : [...previous, term]
      );

      setMatchScore((previous) => previous + 1);
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

  const matchCompleted =
    match.length > 0 && matchedWords.length === match.length;

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
  }, [matchCompleted, grammarQuestions.length, challenge.length, setStage]);

  // =========================================================
  // GRAMMAR LOGIC
  // =========================================================

  const answerGrammar = (answer: string) => {
    if (grammarAnswer !== null || !currentGrammar) return;

    setGrammarAnswer(answer);

    if (answer === currentGrammar.answer) {
      setGrammarScore((previous) => previous + 1);
    }
  };

  const nextGrammar = () => {
    if (grammarIndex < grammarQuestions.length - 1) {
      setGrammarIndex((previous) => previous + 1);
      setGrammarAnswer(null);
      return;
    }

    setChallengeIndex(0);
    setChallengeAnswer(null);
    setChallengeScore(0);

    if (challenge.length > 0) {
      setStage("challenge");
    } else {
      setStage("result");
    }
  };

  // =========================================================
  // CHALLENGE LOGIC
  // =========================================================

  const currentChallenge = challenge[challengeIndex];

  const answerChallenge = (answer: string) => {
    if (challengeAnswer !== null || !currentChallenge) return;

    setChallengeAnswer(answer);

    if (answer === currentChallenge.answer) {
      setChallengeScore((previous) => previous + 1);
    }
  };

  const nextChallenge = () => {
    if (challengeIndex < challenge.length - 1) {
      setChallengeIndex((previous) => previous + 1);
      setChallengeAnswer(null);
      return;
    }

    setStage("result");
  };

  // =========================================================
  // RESULT
  // =========================================================

  const totalQuestions =
    match.length + grammarQuestions.length + challenge.length;

  const totalScore = matchScore + grammarScore + challengeScore;

  const percentage =
    totalQuestions > 0
      ? Math.round((totalScore / totalQuestions) * 100)
      : 0;

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
    (item) => item.id === stage
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <div style={{ paddingTop: "44px" }}>
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
          {lesson?.unit_title}
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
          {lesson?.lesson_title}
        </h3>

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

            {(data as any).learn?.intro && (
              <p
                dir="auto"
                style={{
                  color: "#e2e8f0",
                  lineHeight: 1.8,
                  fontWeight: "bold",
                  textAlign: "start",
                }}
              >
                {(data as any).learn.intro}
              </p>
            )}

            {Array.isArray((data as any).learn?.paragraphs) &&
              (data as any).learn.paragraphs.map(
                (paragraph: string, index: number) => (
                  <p
                    key={index}
                    dir="auto"
                    style={{
                      color: "#e2e8f0",
                      lineHeight: 1.8,
                      textAlign: "start",
                    }}
                  >
                    {paragraph}
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

        {stage === "vocabulary" && vocab.length > 0 && (
          <div>
            <div
              style={{
                fontSize: "13px",
                color: "#94a3b8",
                marginBottom: "10px",
              }}
            >
              🧠 Vocabulary ({vocabIndex + 1}/{vocab.length})
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
                }}
              >
                {vocab[vocabIndex]?.example}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button
                type="button"
                disabled={vocabIndex === 0}
                onClick={() => setVocabIndex(vocabIndex - 1)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  backgroundColor: "transparent",
                  color: vocabIndex === 0 ? "#475569" : "#fff",
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
                  }}
                >
                  التالي ➡️
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
                  }}
                >
                  ابدأ المطابقة 🧩
                </button>
              )}
            </div>
          </div>
        )}

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

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#0f172a",
                borderRadius: "10px",
                padding: "10px 13px",
                marginBottom: "15px",
              }}
            >
              <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                التقدم
              </span>

              <strong style={{ color: "#22c55e", fontSize: "14px" }}>
                {matchedWords.length} / {match.length} ✅
              </strong>
            </div>

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
                }}
              >
                ❌ ليست المطابقة الصحيحة، حاول مرة أخرى
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#38bdf8",
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: "8px",
                  }}
                >
                  الكلمات 🇬🇧
                </div>

                {matchWords.map((item: any) => {
                  const matched = matchedWords.includes(item.term);
                  const selected = selectedWord === item.term;

                  return (
                    <button
                      key={item.term}
                      type="button"
                      disabled={matched}
                      onClick={() => chooseWord(item.term)}
                      style={{
                        width: "100%",
                        minHeight: "52px",
                        marginBottom: "8px",
                        borderRadius: "9px",
                        border: matched
                          ? "1px solid #22c55e"
                          : selected
                            ? "1px solid #f59e0b"
                            : "1px solid #334155",
                        backgroundColor: matched
                          ? "#14532d"
                          : selected
                            ? "#78350f"
                            : "#0f172a",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      {item.term}
                      {matched && " ✅"}
                      {selected && !matched && " 👆"}
                    </button>
                  );
                })}
              </div>

              <div>
                <div
                  style={{
                    color: "#fbbf24",
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: "8px",
                  }}
                >
                  المعاني 🇸🇩
                </div>

                {matchMeanings.map((item: any) => {
                  const matched = matchedWords.includes(item.term);
                  const selected = selectedMeaning === item.meaning;

                  return (
                    <button
                      key={item.meaning}
                      type="button"
                      disabled={matched}
                      onClick={() => chooseMeaning(item.meaning)}
                      style={{
                        width: "100%",
                        minHeight: "52px",
                        marginBottom: "8px",
                        borderRadius: "9px",
                        border: matched
                          ? "1px solid #22c55e"
                          : selected
                            ? "1px solid #f59e0b"
                            : "1px solid #334155",
                        backgroundColor: matched
                          ? "#14532d"
                          : selected
                            ? "#78350f"
                            : "#0f172a",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      {item.meaning}
                      {matched && " ✅"}
                      {selected && !matched && " 👆"}
                    </button>
                  );
                })}
              </div>
            </div>

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
                🎉 ممتاز! أكملت المطابقة
              </div>
            )}
          </div>
        )}

        {stage === "match" && match.length === 0 && (
          <div style={{ textAlign: "center", padding: "14px 6px" }}>
            <div aria-hidden="true" style={{ fontSize: "32px" }}>
              🧩
            </div>

            <p style={{ color: "#cbd5e1" }}>
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

        {stage === "grammar" && (
          <div>
            {grammarQuestions.length > 0 ? (
              <>
                <div style={{ color: "#94a3b8", marginBottom: "8px" }}>
                  🎯 Grammar
                </div>

                <div
                  style={{
                    color: "#64748b",
                    marginBottom: "15px",
                    fontSize: "13px",
                  }}
                >
                  السؤال {grammarIndex + 1} من {grammarQuestions.length}
                </div>

                <div
                  style={{
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    padding: "20px 15px",
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
                    (option: string, index: number) => {
                      const correct =
                        grammarAnswer !== null &&
                        option === currentGrammar.answer;
                      const selected = grammarAnswer === option;

                      return (
                        <button
                          key={`${option}-${index}`}
                          type="button"
                          dir="auto"
                          onClick={() => answerGrammar(option)}
                          disabled={grammarAnswer !== null}
                          style={{
                            width: "100%",
                            textAlign: "start",
                            padding: "13px",
                            borderRadius: "9px",
                            border: correct
                              ? "1px solid #22c55e"
                              : selected
                                ? "1px solid #ef4444"
                                : "1px solid #334155",
                            backgroundColor: correct
                              ? "#14532d"
                              : selected
                                ? "#450a0a"
                                : "#0f172a",
                            color: "#fff",
                            fontWeight: "bold",
                          }}
                        >
                          {option}
                          {correct && " ✅"}
                          {selected && !correct && " ❌"}
                        </button>
                      );
                    }
                  )}
                </div>

                {grammarAnswer !== null && currentGrammar?.explanation && (
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
                      marginTop: "16px",
                      width: "100%",
                      padding: "14px",
                      borderRadius: "9px",
                      border: "none",
                      backgroundColor: "#3b82f6",
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "15px",
                      cursor: "pointer",
                    }}
                  >
                    {grammarIndex < grammarQuestions.length - 1
                      ? "السؤال التالي ➡️"
                      : challenge.length > 0
                        ? "انتقل إلى التحدي ⚡"
                        : "عرض النتيجة 🏆"}
                  </button>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "12px 6px" }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: "44px",
                    height: "44px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "12px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    fontSize: "24px",
                    marginBottom: "10px",
                  }}
                >
                  🎯
                </div>

                <div
                  style={{
                    color: "#e2e8f0",
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginBottom: "6px",
                  }}
                >
                  لا توجد تدريبات على القواعد لهذا الدرس.
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setChallengeIndex(0);
                    setChallengeAnswer(null);
                    setChallengeScore(0);

                    if (challenge.length > 0) {
                      setStage("challenge");
                    } else {
                      setStage("result");
                    }
                  }}
                  style={{
                    marginTop: "16px",
                    width: "100%",
                    padding: "14px",
                    borderRadius: "9px",
                    border: "none",
                    backgroundColor: "#3b82f6",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "15px",
                    cursor: "pointer",
                  }}
                >
                  {challenge.length > 0
                    ? "انتقل إلى التحدي ⚡"
                    : "عرض النتيجة 🏆"}
                </button>
              </div>
            )}
          </div>
        )}

        {stage === "challenge" && challenge.length > 0 && (
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
                fontSize: "13px",
                color: "#64748b",
                marginBottom: "15px",
              }}
            >
              السؤال {challengeIndex + 1} من {challenge.length}
            </div>

            <div
              style={{
                backgroundColor: "#0f172a",
                borderRadius: "12px",
                padding: "20px 15px",
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
                }}
              >
                {currentChallenge?.question}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "9px",
              }}
            >
              {currentChallenge?.options?.map(
                (option: string, index: number) => {
                  const correct =
                    challengeAnswer !== null &&
                    option === currentChallenge.answer;
                  const selected = challengeAnswer === option;

                  return (
                    <button
                      key={`${option}-${index}`}
                      type="button"
                      dir="auto"
                      onClick={() => answerChallenge(option)}
                      disabled={challengeAnswer !== null}
                      style={{
                        width: "100%",
                        textAlign: "start",
                        padding: "13px",
                        borderRadius: "9px",
                        border: correct
                          ? "1px solid #22c55e"
                          : selected
                            ? "1px solid #ef4444"
                            : "1px solid #334155",
                        backgroundColor: correct
                          ? "#14532d"
                          : selected
                            ? "#450a0a"
                            : "#0f172a",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      {option}
                      {correct && " ✅"}
                      {selected && !correct && " ❌"}
                    </button>
                  );
                }
              )}
            </div>

            {challengeAnswer !== null && (
              <button
                type="button"
                onClick={nextChallenge}
                style={{
                  marginTop: "16px",
                  width: "100%",
                  padding: "14px",
                  borderRadius: "9px",
                  border: "none",
                  backgroundColor: "#3b82f6",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "15px",
                  cursor: "pointer",
                }}
              >
                {challengeIndex < challenge.length - 1
                  ? "السؤال التالي ➡️"
                  : "إنهاء الاختبار 🏆"}
              </button>
            )}
          </div>
        )}

        {stage === "result" && (
          <div style={{ textAlign: "center", padding: "20px 10px" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>
              🏆
            </div>

            <h2 style={{ color: "#fff", marginBottom: "10px" }}>
              نتيجة الدرس
            </h2>

            <div
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                color: percentage >= 50 ? "#22c55e" : "#ef4444",
                marginBottom: "15px",
              }}
            >
              {percentage}%
            </div>

            <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
              لقد أجبت بشكل صحيح على {totalScore} من أصل {totalQuestions} سؤال.
            </p>

            <button
              type="button"
              onClick={onExit}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "9px",
                border: "none",
                backgroundColor: "#3b82f6",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              العودة للدروس ➡️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default InteractiveLesson;
