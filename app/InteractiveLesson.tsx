"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; // تم إضافة عميل Supabase

function InteractiveLesson({
  lesson,
  stage,
  setStage,
  vocabIndex,
  setVocabIndex,
  onExit,
}: any) {
  const supabase = createClientComponentClient();
  const data = lesson?.content_json || {};

  const vocab = Array.isArray(data.vocabulary) ? data.vocabulary : [];
  const match = Array.isArray(data.match) ? data.match : [];
  const grammar = data.grammar || {};
  const challenge = Array.isArray(data.challenge) ? data.challenge : [];

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
  // GRAMMAR STATE & FETCHING (التعديل الرئيسي لجلب الأسئلة)
  // =========================================================

  const [grammarIndex, setGrammarIndex] = useState(0);
  const [grammarAnswer, setGrammarAnswer] = useState<string | null>(null);
  const [grammarScore, setGrammarScore] = useState(0);
  const [fetchedGrammarQuestions, setFetchedGrammarQuestions] = useState<any[]>([]);

  // جلب أسئلة القواعد من جدول questions في Supabase
  useEffect(() => {
    async function fetchQuestionsFromTable() {
      if (!lesson?.id) return;

      const { data: questionsData, error } = await supabase
        .from("questions")
        .select("*")
        .eq("lesson_id", lesson.id)
        .ilike("section", "Grammar");

      if (!error && questionsData && questionsData.length > 0) {
        const formatted = questionsData.map((q: any) => ({
          question: q.question_text,
          answer: q.correct_answer,
          options: typeof q.options === "string" ? JSON.parse(q.options) : q.options || [],
        }));
        setFetchedGrammarQuestions(formatted);
      }
    }

    fetchQuestionsFromTable();
  }, [lesson?.id]);

  // =========================================================
  // CHALLENGE
  // =========================================================

  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeAnswer, setChallengeAnswer] = useState<string | null>(null);
  const [challengeScore, setChallengeScore] = useState(0);

  // =========================================================
  // SHUFFLE
  // =========================================================

  function shuffleArray<T>(items: T[]): T[] {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

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
      setMatchedWords((prev) =>
        prev.includes(term) ? prev : [...prev, term]
      );

      setMatchScore((prev) => prev + 1);

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
    match.length > 0 &&
    matchedWords.length === match.length;

  useEffect(() => {
    if (matchCompleted) {
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
    }
  }, [matchCompleted]);

  // =========================================================
  // GENERIC GRAMMAR QUESTIONS LOGIC
  // =========================================================

  const customGrammarQuestions = Array.isArray(grammar.questions)
    ? grammar.questions
    : [];

  // ترتيب الأولويات: 1. الأسئلة المجلوبة من جدول questions، 2. الأسئلة داخل JSON، 3. الأفعال القديمة
  const baseGrammarQuestions =
    fetchedGrammarQuestions.length > 0
      ? fetchedGrammarQuestions
      : customGrammarQuestions;

  const grammarQuestions = baseGrammarQuestions.map((q: any) => ({
    question: q.question,
    answer: q.answer,
    options: shuffleArray(Array.isArray(q.options) ? q.options : []),
  }));

  const currentGrammar = grammarQuestions[grammarIndex];

  const answerGrammar = (answer: string) => {
    if (grammarAnswer !== null || !currentGrammar) return;

    setGrammarAnswer(answer);

    if (answer === currentGrammar.answer) {
      setGrammarScore((prev) => prev + 1);
    }
  };

  const nextGrammar = () => {
    if (grammarIndex < grammarQuestions.length - 1) {
      setGrammarIndex((prev) => prev + 1);
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
  // CHALLENGE
  // =========================================================

  const currentChallenge = challenge[challengeIndex];

  const answerChallenge = (answer: string) => {
    if (challengeAnswer !== null || !currentChallenge) return;

    setChallengeAnswer(answer);

    if (answer === currentChallenge.answer) {
      setChallengeScore((prev) => prev + 1);
    }
  };

  const nextChallenge = () => {
    if (challengeIndex < challenge.length - 1) {
      setChallengeIndex((prev) => prev + 1);
      setChallengeAnswer(null);
      return;
    }

    setStage("result");
  };

  // =========================================================
  // RESULT
  // =========================================================

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

  const stages = [
    { id: "learn", icon: "📖", label: "Learn" },
    { id: "vocabulary", icon: "🧠", label: "Vocabulary" },
    { id: "match", icon: "🧩", label: "Match" },
    { id: "grammar", icon: "🎯", label: "Grammar" },
    { id: "challenge", icon: "⚡", label: "Challenge" },
    { id: "result", icon: "🏆", label: "Result" },
  ];

  const currentStageIndex = stages.findIndex(
    (s) => s.id === stage
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <div>
      {/* العودة */}
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

      {/* مراحل الدرس */}
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
        {/* LEARN */}
        {/* ================================================= */}

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
                style={{
                  color: "#e2e8f0",
                  lineHeight: 1.8,
                  fontWeight: "bold",
                }}
              >
                {data.learn.intro}
              </p>
            )}

            {Array.isArray(data.learn?.paragraphs) &&
              data.learn.paragraphs.map((p: string, i: number) => (
                <p key={i} style={{ color: "#e2e8f0", lineHeight: 1.8 }}>
                  {p}
                </p>
              ))}

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

        {/* ================================================= */}
        {/* VOCABULARY */}
        {/* ================================================= */}

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

        {/* ================================================= */}
        {/* MATCH */}
        {/* ================================================= */}

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

        {/* ================================================= */}
        {/* GRAMMAR (تم الحماية والتحديث الكامل هنا) */}
        {/* ================================================= */}

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
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>🎯</div>
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

        {/* ================================================= */}
        {/* CHALLENGE */}
        {/* ================================================= */}

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
                }}
              >
                {challengeIndex < challenge.length - 1
                  ? "السؤال التالي ➡️"
                  : "إنهاء الاختبار 🏆"}
              </button>
            )}
          </div>
        )}

        {/* ================================================= */}
        {/* RESULT */}
        {/* ================================================= */}

        {stage === "result" && (
          <div style={{ textAlign: "center", padding: "20px 10px" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>🏆</div>
            <h2 style={{ color: "#fff", marginBottom: "10px" }}>نتيجة الدرس</h2>
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
