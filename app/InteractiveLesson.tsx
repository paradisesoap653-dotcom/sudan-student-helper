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

  useEffect(() => {
    console.log("[Grammar content_json]", {
      lessonId: lesson?.id,
      lessonTitle: lesson?.lesson_title,
      questionsCount: grammarQuestions.length,
      questions: grammarQuestions,
    });
  }, [lesson?.id, lesson?.lesson_title, grammarQuestions]);

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
    { id: "learn", icon: "📖", label: "Learn" },
    { id: "vocabulary", icon: "🧠", label: "Vocabulary" },
    { id: "match", icon: "🧩", label: "Match" },
    { id: "grammar", icon: "🎯", label: "Grammar" },
    { id: "challenge", icon: "⚡", label: "Challenge" },
    { id: "result", icon: "🏆", label: "Result" },
  ];

  const currentStageIndex = stages.findIndex(
    (item) => item.id === stage
  );

  // =========================================================
  // UI
  // =========================================================

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
          fontSize: "14px",
          padding: "8px 0",
        }}
      >
        ➡️ العودة لقائمة الدروس
      </button>

      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "18px",
          overflowX: "auto",
          paddingBottom: "5px",
        }}
      >
        {stages.map((item, index) => (
          <div
            key={item.id}
            style={{
              flex: 1,
              minWidth: "50px",
              textAlign: "center",
              opacity: index <= currentStageIndex ? 1 : 0.45,
            }}
          >
            <div
              style={{
                height: "5px",
                borderRadius: "5px",
                backgroundColor:
                  index <= currentStageIndex ? "#3b82f6" : "#334155",
                marginBottom: "5px",
              }}
            />

            <div
              style={{
                fontSize: "10px",
                color:
                  index === currentStageIndex ? "#fbbf24" : "#94a3b8",
                whiteSpace: "nowrap",
              }}
            >
              {item.icon} {item.label}
            </div>
          </div>
        ))}
      </div>

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
          {lesson?.unit_title}
        </div>

        <h3
          style={{
            color: "#fff",
            margin: "0 0 16px",
            fontSize: "20px",
            lineHeight: 1.5,
          }}
        >
          {lesson?.lesson_title}
        </h3>

        {/* ================================================= */}
        {/* TEMP DEBUG PANEL — احذف هذا القسم بعد التشخيص */}
        {/* ================================================= */}
        <div
          style={{
            backgroundColor: "#450a0a",
            border: "2px solid #ef4444",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "16px",
            fontSize: "11px",
            color: "#fecaca",
            direction: "ltr",
            textAlign: "left",
            wordBreak: "break-all",
          }}
        >
          <div>stage: {String(stage)}</div>
          <div>lesson.id: {String(lesson?.id)}</div>
          <div>lesson_title: {String(lesson?.lesson_title)}</div>
          <div>data keys: {Object.keys(data as any).join(", ") || "(empty)"}</div>
          <div>grammar keys: {Object.keys(grammar).join(", ") || "(empty)"}</div>
          <div>grammar.questions raw type: {typeof (grammar as any)?.questions}</div>
          <div>
            grammar.questions is array:{" "}
            {String(Array.isArray((grammar as any)?.questions))}
          </div>
          <div>
            grammar.questions raw length:{" "}
            {Array.isArray((grammar as any)?.questions)
              ? (grammar as any).questions.length
              : "N/A"}
          </div>
          <div>grammarQuestions.length (final): {grammarQuestions.length}</div>
        </div>

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
                style={{
                  color: "#e2e8f0",
                  lineHeight: 1.8,
                  fontWeight: "bold",
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
                    style={{ color: "#e2e8f0", lineHeight: 1.8 }}
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
                style={{
                  fontSize: "18px",
                  color: "#fbbf24",
                  marginBottom: "12px",
                }}
              >
                {vocab[vocabIndex]?.meaning}
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#94a3b8",
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
                    style={{
                      color: "#fff",
                      fontSize: "18px",
                      fontWeight: "bold",
                      textAlign: "center",
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
                          onClick={() => answerGrammar(option)}
                          disabled={grammarAnswer !== null}
                          style={{
                            width: "100%",
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
                    style={{
                      marginTop: "14px",
                      padding: "12px",
                      borderRadius: "9px",
                      backgroundColor: "#172554",
                      border: "1px solid #3b82f6",
                      color: "#dbeafe",
                      lineHeight: 1.7,
                      fontSize: "14px",
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
                      : "انتقل إلى التحدي ⚡"}
                  </button>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 10px" }}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                  🎯
                </div>

                <div
                  style={{
                    color: "#e2e8f0",
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  لا توجد تدريبات قواعد لهذا الدرس.
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
                  متابعة ⚡
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
                style={{
                  color: "#fff",
                  fontSize: "18px",
                  fontWeight: "bold",
                  textAlign: "center",
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
                      onClick={() => answerChallenge(option)}
                      disabled={challengeAnswer !== null}
                      style={{
                        width: "100%",
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
