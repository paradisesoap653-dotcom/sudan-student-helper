"use client";

import React, { useEffect, useMemo, useState } from "react";
import type {
  ChallengeItem,
  Lesson,
  LessonStage,
} from "./lessonTypes";

/* =========================================================
   مساعد Shuffle
========================================================= */

function shuffleArray<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

/* =========================================================
   Props
========================================================= */

type InteractiveLessonProps = {
  lesson: Lesson;
  stage: LessonStage;
  setStage: React.Dispatch<React.SetStateAction<LessonStage>>;
  vocabIndex: number;
  setVocabIndex: React.Dispatch<React.SetStateAction<number>>;
  onExit: () => void;
};

/* =========================================================
   Component
========================================================= */

export default function InteractiveLesson({
  lesson,
  stage,
  setStage,
  vocabIndex,
  setVocabIndex,
  onExit,
}: InteractiveLessonProps) {
  const data = lesson.content_json || {};

  const vocab = data.vocabulary || [];
  const match = data.match || [];
  const grammar = data.grammar || {};
  const challenge = data.challenge || [];

  /* =======================================================
     MATCH
  ======================================================= */

  const [matchIndex, setMatchIndex] = useState(0);
  const [matchOptions, setMatchOptions] = useState<string[]>([]);
  const [matchSelected, setMatchSelected] =
    useState<string | null>(null);
  const [matchCorrect, setMatchCorrect] = useState(false);
  const [matchScore, setMatchScore] = useState(0);

  /* =======================================================
     GRAMMAR
  ======================================================= */

  const [grammarIndex, setGrammarIndex] = useState(0);
  const [grammarAnswer, setGrammarAnswer] =
    useState<string | null>(null);
  const [grammarScore, setGrammarScore] = useState(0);

  /* =======================================================
     CHALLENGE
  ======================================================= */

  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeAnswer, setChallengeAnswer] =
    useState<string | null>(null);
  const [challengeScore, setChallengeScore] = useState(0);

  /* =======================================================
     تجهيز Match
  ======================================================= */

  useEffect(() => {
    if (stage !== "match" || !match.length) return;

    const current = match[matchIndex];

    if (!current) return;

    const otherMeanings = match
      .filter((_, i) => i !== matchIndex)
      .map((item) => item.meaning);

    const options = shuffleArray([
      current.meaning,
      ...shuffleArray(otherMeanings).slice(0, 3),
    ]);

    setMatchOptions(options);
    setMatchSelected(null);
    setMatchCorrect(false);
  }, [stage, matchIndex, match.length]);

  /* =======================================================
     Grammar Questions
  ======================================================= */

  const grammarQuestions = useMemo(() => {
    const practiceVerbs = grammar.practice_verbs || [];

    const pastData: Record<
      string,
      {
        answer: string;
        options: string[];
      }
    > = {
      arrive: {
        answer: "arrived",
        options: ["arrived", "arrive", "arriving", "arriven"],
      },
      buy: {
        answer: "bought",
        options: ["buyed", "bought", "buys", "buying"],
      },
      catch: {
        answer: "caught",
        options: ["catched", "caught", "catches", "catching"],
      },
      earn: {
        answer: "earned",
        options: ["earned", "earnt", "earning", "earns"],
      },
      help: {
        answer: "helped",
        options: ["helped", "help", "helping", "helps"],
      },
      keep: {
        answer: "kept",
        options: ["keeped", "kept", "keeps", "keeping"],
      },
      live: {
        answer: "lived",
        options: ["lived", "live", "living", "lives"],
      },
      run: {
        answer: "ran",
        options: ["runned", "ran", "runs", "running"],
      },
      visit: {
        answer: "visited",
        options: ["visited", "visit", "visiting", "visits"],
      },
      win: {
        answer: "won",
        options: ["winned", "won", "wins", "winning"],
      },
    };

    return practiceVerbs.map((verb) => {
      const info = pastData[verb] || {
        answer: `${verb}ed`,
        options: [
          `${verb}ed`,
          verb,
          `${verb}ing`,
          `${verb}s`,
        ],
      };

      return {
        question: `What is the past tense of "${verb}"?`,
        answer: info.answer,
        options: info.options,
      };
    });
  }, [grammar.practice_verbs]);

  const currentGrammar =
    grammarQuestions[grammarIndex];

  /* =======================================================
     Start Match
  ======================================================= */

  const startMatch = () => {
    setMatchIndex(0);
    setMatchScore(0);
    setMatchSelected(null);
    setMatchCorrect(false);
    setStage("match");
  };

  /* =======================================================
     Answer Match
  ======================================================= */

  const answerMatch = (answer: string) => {
    if (matchSelected !== null) return;

    setMatchSelected(answer);

    const correct =
      answer === match[matchIndex].meaning;

    if (correct) {
      setMatchCorrect(true);
      setMatchScore((prev) => prev + 1);
    } else {
      setMatchCorrect(false);
    }
  };

  /* =======================================================
     Next Match
  ======================================================= */

  const nextMatch = () => {
    if (matchIndex < match.length - 1) {
      setMatchIndex((prev) => prev + 1);
    } else {
      setGrammarIndex(0);
      setGrammarAnswer(null);
      setGrammarScore(0);
      setStage("grammar");
    }
  };

  /* =======================================================
     Grammar Answer
  ======================================================= */

  const answerGrammar = (answer: string) => {
    if (grammarAnswer !== null) return;

    setGrammarAnswer(answer);

    if (answer === currentGrammar?.answer) {
      setGrammarScore((prev) => prev + 1);
    }
  };

  /* =======================================================
     Next Grammar
  ======================================================= */

  const nextGrammar = () => {
    if (
      grammarIndex <
      grammarQuestions.length - 1
    ) {
      setGrammarIndex((prev) => prev + 1);
      setGrammarAnswer(null);
    } else {
      setChallengeIndex(0);
      setChallengeAnswer(null);
      setChallengeScore(0);
      setStage("challenge");
    }
  };

  /* =======================================================
     Challenge Answer
  ======================================================= */

  const answerChallenge = (answer: string) => {
    if (challengeAnswer !== null) return;

    setChallengeAnswer(answer);

    if (
      answer ===
      challenge[challengeIndex]?.answer
    ) {
      setChallengeScore((prev) => prev + 1);
    }
  };

  /* =======================================================
     Next Challenge
  ======================================================= */

  const nextChallenge = () => {
    if (
      challengeIndex <
      challenge.length - 1
    ) {
      setChallengeIndex((prev) => prev + 1);
      setChallengeAnswer(null);
    } else {
      setStage("result");
    }
  };

  /* =======================================================
     Result
  ======================================================= */

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
      ? Math.round(
          (totalScore / totalQuestions) * 100
        )
      : 0;

  /* =======================================================
     Stages
  ======================================================= */

  const stages: {
    id: LessonStage;
    icon: string;
    label: string;
  }[] = [
    {
      id: "learn",
      icon: "📖",
      label: "Learn",
    },
    {
      id: "vocabulary",
      icon: "🧠",
      label: "Vocabulary",
    },
    {
      id: "match",
      icon: "🧩",
      label: "Match",
    },
    {
      id: "grammar",
      icon: "🎯",
      label: "Grammar",
    },
    {
      id: "challenge",
      icon: "⚡",
      label: "Challenge",
    },
    {
      id: "result",
      icon: "🏆",
      label: "Result",
    },
  ];

  const currentStageIndex =
    stages.findIndex(
      (item) => item.id === stage
    );

  /* =======================================================
     Reset Lesson
  ======================================================= */

  const restartLesson = () => {
    setMatchIndex(0);
    setMatchScore(0);
    setMatchSelected(null);
    setMatchCorrect(false);

    setGrammarIndex(0);
    setGrammarScore(0);
    setGrammarAnswer(null);

    setChallengeIndex(0);
    setChallengeScore(0);
    setChallengeAnswer(null);

    setVocabIndex(0);

    setStage("learn");
  };

  /* =======================================================
     Render
  ======================================================= */

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

      {/* ===================================================
          Stage Navigation
      =================================================== */}

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "18px",
          overflowX: "auto",
          padding: "4px 2px 8px",
          scrollbarWidth: "thin",
        }}
      >
        {stages.map((item, index) => {
          const isActive =
            index === currentStageIndex;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                setStage(item.id)
              }
              aria-label={`فتح ${item.label}`}
              style={{
                flex: "0 0 auto",
                minWidth: "92px",
                padding: "10px 9px",
                borderRadius: "12px",
                border: isActive
                  ? "2px solid #fbbf24"
                  : "1px solid #475569",
                backgroundColor: isActive
                  ? "#1e3a5f"
                  : "#0f172a",
                color: isActive
                  ? "#fbbf24"
                  : "#cbd5e1",
                cursor: "pointer",
                fontWeight: isActive
                  ? "800"
                  : "600",
                fontSize: "12px",
                boxShadow: isActive
                  ? "0 0 0 2px rgba(251,191,36,0.12)"
                  : "none",
                transition:
                  "all 0.15s ease",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  marginBottom: "4px",
                }}
              >
                {item.icon}
              </div>

              <div
                style={{
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </div>

              <div
                style={{
                  fontSize: "9px",
                  marginTop: "3px",
                  opacity: 0.7,
                }}
              >
                اضغط للفتح
              </div>
            </button>
          );
        })}
      </div>

      {/* ===================================================
          Lesson Card
      =================================================== */}

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

        {/* =================================================
            LEARN
        ================================================= */}

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

            <p
              style={{
                color: "#e2e8f0",
                lineHeight: 1.8,
                fontWeight: "bold",
              }}
            >
              {data.learn?.intro}
            </p>

            {data.learn?.paragraphs?.map(
              (paragraph, index) => (
                <p
                  key={index}
                  style={{
                    color: "#e2e8f0",
                    lineHeight: 1.8,
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

        {/* =================================================
            VOCABULARY
        ================================================= */}

        {stage === "vocabulary" &&
          vocab.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#94a3b8",
                  marginBottom: "10px",
                }}
              >
                🧠 Vocabulary (
                {vocabIndex + 1}/{vocab.length})
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
                  {vocab[vocabIndex].word}
                </div>

                <div
                  style={{
                    fontSize: "18px",
                    color: "#fbbf24",
                    marginBottom: "12px",
                  }}
                >
                  {vocab[vocabIndex].meaning}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    fontStyle: "italic",
                  }}
                >
                  {vocab[vocabIndex].example}
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
                    setVocabIndex(
                      vocabIndex - 1
                    )
                  }
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border:
                      "1px solid #334155",
                    backgroundColor:
                      "transparent",
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

                {vocabIndex <
                vocab.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setVocabIndex(
                        vocabIndex + 1
                      )
                    }
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor:
                        "#3b82f6",
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
                      backgroundColor:
                        "#8b5cf6",
                      color: "#fff",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    ابدأ المباراة 🧩
                  </button>
                )}
              </div>
            </div>
          )}

        {/* =================================================
            MATCH
        ================================================= */}

        {stage === "match" &&
          match.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#94a3b8",
                  marginBottom: "8px",
                }}
              >
                🧩 Match — اختر المعنى الصحيح
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "15px",
                }}
              >
                السؤال {matchIndex + 1} من{" "}
                {match.length}
              </div>

              <div
                style={{
                  backgroundColor:
                    "#0f172a",
                  borderRadius: "12px",
                  padding: "24px 15px",
                  textAlign: "center",
                  border:
                    "1px solid #334155",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    marginBottom: "8px",
                  }}
                >
                  ما معنى الكلمة؟
                </div>

                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "900",
                    color: "#fff",
                  }}
                >
                  {match[matchIndex].term}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "9px",
                }}
              >
                {matchOptions.map(
                  (option, index) => {
                    const isSelected =
                      matchSelected ===
                      option;

                    const isCorrect =
                      matchSelected !==
                        null &&
                      option ===
                        match[matchIndex]
                          .meaning;

                    return (
                      <button
                        key={`${option}-${index}`}
                        type="button"
                        onClick={() =>
                          answerMatch(option)
                        }
                        style={{
                          width: "100%",
                          padding: "13px",
                          borderRadius: "9px",
                          border: `1px solid ${
                            isCorrect
                              ? "#22c55e"
                              : isSelected
                              ? "#ef4444"
                              : "#334155"
                          }`,
                          backgroundColor:
                            isCorrect
                              ? "#14532d"
                              : isSelected
                              ? "#450a0a"
                              : "#0f172a",
                          color: "#fff",
                          fontWeight: "bold",
                          cursor:
                            matchSelected !==
                            null
                              ? "default"
                              : "pointer",
                        }}
                      >
                        {option}

                        {isCorrect &&
                          " ✅"}

                        {isSelected &&
                          !isCorrect &&
                          " ❌"}
                      </button>
                    );
                  }
                )}
              </div>

              {matchSelected !== null && (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor:
                      matchCorrect
                        ? "#14532d"
                        : "#450a0a",
                    color: "#fff",
                    textAlign: "center",
                    fontSize: "13px",
                  }}
                >
                  {matchCorrect
                    ? "ممتاز! إجابة صحيحة 🎉"
                    : `الإجابة الصحيحة: ${match[matchIndex].meaning}`}
                </div>
              )}

              {matchSelected !== null && (
                <button
                  type="button"
                  onClick={nextMatch}
                  style={{
                    marginTop: "14px",
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor:
                      "#8b5cf6",
                    color: "#fff",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {matchIndex <
                  match.length - 1
                    ? "التالي ➡️"
                    : "انتقل إلى القواعد 🎯"}
                </button>
              )}
            </div>
          )}

        {/* =================================================
            GRAMMAR
        ================================================= */}

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
                  backgroundColor:
                    "#0f172a",
                  borderRadius: "12px",
                  padding: "20px 15px",
                  border:
                    "1px solid #334155",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    color: "#fff",
                    fontSize: "18px",
                    fontWeight: "bold",
                    textAlign: "center",
                    lineHeight: 1.7,
                  }}
                >
                  {currentGrammar.question}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "9px",
                }}
              >
                {currentGrammar.options.map(
                  (option, index) => {
                    const correct =
                      grammarAnswer !==
                        null &&
                      option ===
                        currentGrammar.answer;

                    const selected =
                      grammarAnswer ===
                      option;

                    return (
                      <button
                        key={`${option}-${index}`}
                        type="button"
                        onClick={() =>
                          answerGrammar(
                            option
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "13px",
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
                            grammarAnswer !==
                            null
                              ? "default"
                              : "pointer",
                        }}
                      >
                        {option}

                        {correct &&
                          " ✅"}

                        {selected &&
                          !correct &&
                          " ❌"}
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
                    marginTop: "14px",
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor:
                      "#3b82f6",
                    color: "#fff",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {grammarIndex <
                  grammarQuestions.length -
                    1
                    ? "التالي ➡️"
                    : "انتقل إلى التحدي ⚡"}
                </button>
              )}
            </div>
          )}

        {/* =================================================
            CHALLENGE
        ================================================= */}

        {stage === "challenge" &&
          challenge.length > 0 && (
            <ChallengeStage
              currentChallenge={
                challenge[challengeIndex]
              }
              challengeIndex={
                challengeIndex
              }
              challengeLength={
                challenge.length
              }
              challengeAnswer={
                challengeAnswer
              }
              answerChallenge={
                answerChallenge
              }
              nextChallenge={
                nextChallenge
              }
            />
          )}

        {/* =================================================
            RESULT
        ================================================= */}

        {stage === "result" && (
          <div
            style={{
              textAlign: "center",
              padding:
                "15px 0 10px",
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
              أكملت درس{" "}
              {lesson.lesson_title}
            </div>

            <div
              style={{
                backgroundColor:
                  "#0f172a",
                borderRadius: "14px",
                padding: "20px",
                border:
                  "1px solid #334155",
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
                {totalScore} من{" "}
                {totalQuestions}{" "}
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
              <ScoreBox
                icon="🧩"
                score={matchScore}
                total={match.length}
                label="Match"
              />

              <ScoreBox
                icon="🎯"
                score={grammarScore}
                total={
                  grammarQuestions.length
                }
                label="Grammar"
              />

              <ScoreBox
                icon="⚡"
                score={challengeScore}
                total={challenge.length}
                label="Challenge"
              />
            </div>

            <button
              type="button"
              onClick={restartLesson}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "9px",
                border: "none",
                backgroundColor:
                  "#3b82f6",
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
                border:
                  "1px solid #334155",
                backgroundColor:
                  "transparent",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              العودة لقائمة الدروس
            </button>
          </div>
        )}

        {/* =================================================
            No Match
        ================================================= */}

        {stage === "match" &&
          match.length === 0 && (
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
                لا توجد كلمات للمطابقة
                لهذا الدرس حالياً.
              </p>

              <button
                type="button"
                onClick={() =>
                  setStage("grammar")
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor:
                    "#3b82f6",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                متابعة 🎯
              </button>
            </div>
          )}
      </div>
    </div>
  );
}

/* =========================================================
   Challenge Stage
========================================================= */

type ChallengeStageProps = {
  currentChallenge?: ChallengeItem;
  challengeIndex: number;
  challengeLength: number;
  challengeAnswer: string | null;
  answerChallenge: (answer: string) => void;
  nextChallenge: () => void;
};

function ChallengeStage({
  currentChallenge,
  challengeIndex,
  challengeLength,
  challengeAnswer,
  answerChallenge,
  nextChallenge,
}: ChallengeStageProps) {
  if (!currentChallenge) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "30px",
          color: "#94a3b8",
        }}
      >
        لا يوجد سؤال للتحدي.
      </div>
    );
  }

  return (
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
        {challengeLength}
      </div>

      <div
        style={{
          backgroundColor: "#0f172a",
          borderRadius: "12px",
          padding: "20px 15px",
          border:
            "1px solid #334155",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            color: "#fff",
            fontSize: "17px",
            fontWeight: "bold",
            lineHeight: 1.8,
            textAlign: "center",
          }}
        >
          {currentChallenge.question}
        </div>
      </div>

      {currentChallenge.type ===
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
                challengeAnswer ===
                option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    answerChallenge(
                      option
                    )
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
                      challengeAnswer !==
                      null
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
          {(currentChallenge.options ||
            []).map(
            (option, index) => {
              const correct =
                challengeAnswer !== null &&
                option ===
                  currentChallenge.answer;

              const selected =
                challengeAnswer ===
                option;

              return (
                <button
                  key={`${option}-${index}`}
                  type="button"
                  onClick={() =>
                    answerChallenge(
                      option
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "13px",
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
                      challengeAnswer !==
                      null
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
            backgroundColor:
              "#f59e0b",
            color: "#111827",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {challengeIndex <
          challengeLength - 1
            ? "السؤال التالي ➡️"
            : "عرض النتيجة 🏆"}
        </button>
      )}
    </div>
  );
}

/* =========================================================
   Score Box
========================================================= */

type ScoreBoxProps = {
  icon: string;
  score: number;
  total: number;
  label: string;
};

function ScoreBox({
  icon,
  score,
  total,
  label,
}: ScoreBoxProps) {
  return (
    <div
      style={{
        backgroundColor:
          "#172554",
        padding: "10px 5px",
        borderRadius: "9px",
      }}
    >
      <div
        style={{
          fontSize: "18px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: "#fff",
          fontWeight: "bold",
        }}
      >
        {score}/{total}
      </div>

      <div
        style={{
          color: "#94a3b8",
          fontSize: "10px",
        }}
      >
        {label}
      </div>
    </div>
  );
}
