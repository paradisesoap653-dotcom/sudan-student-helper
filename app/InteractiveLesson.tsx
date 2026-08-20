"use client";

import React, { useEffect, useMemo, useState } from "react";

import type {
  ChallengeItem,
  Lesson,
  LessonStage,
} from "./lessonTypes";

/* =========================================================
   Helpers
========================================================= */

function shuffleArray<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

/* =========================================================
   Grammar Question
========================================================= */

type GrammarQuestion = {
  question: string;
  answer: string;
  options: string[];
};

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

  /* =======================================================
     MATCH STATE
  ======================================================= */

  const [matchIndex, setMatchIndex] = useState(0);

  const [matchOptions, setMatchOptions] =
    useState<string[]>([]);

  const [matchSelected, setMatchSelected] =
    useState<string | null>(null);

  const [matchCorrect, setMatchCorrect] =
    useState(false);

  const [matchScore, setMatchScore] =
    useState(0);

  /* =======================================================
     GRAMMAR STATE
  ======================================================= */

  const [grammarIndex, setGrammarIndex] =
    useState(0);

  const [grammarAnswer, setGrammarAnswer] =
    useState<string | null>(null);

  const [grammarScore, setGrammarScore] =
    useState(0);

  /* =======================================================
     CHALLENGE STATE
  ======================================================= */

  const [challengeIndex, setChallengeIndex] =
    useState(0);

  const [challengeAnswer, setChallengeAnswer] =
    useState<string | null>(null);

  const [challengeScore, setChallengeScore] =
    useState(0);

  /* =======================================================
     MATCH OPTIONS
  ======================================================= */

  useEffect(() => {
    if (stage !== "match" || match.length === 0) {
      return;
    }

    const current = match[matchIndex];

    if (!current) return;

    const otherMeanings = match
      .filter((_, index) => index !== matchIndex)
      .map((item) => item.meaning)
      .filter(Boolean);

    const options = shuffleArray([
      current.meaning,
      ...shuffleArray(otherMeanings).slice(0, 3),
    ]);

    setMatchOptions(options);
    setMatchSelected(null);
    setMatchCorrect(false);
  }, [stage, matchIndex, match]);

  /* =======================================================
     GRAMMAR QUESTIONS
     
     الأسئلة تُبنى من practice_verbs الموجودة
     في Supabase.
  ======================================================= */

  const grammarQuestions = useMemo<GrammarQuestion[]>(() => {
    const practiceVerbs = Array.isArray(
      grammar.practice_verbs
    )
      ? grammar.practice_verbs
      : [];

    const pastData: Record<
      string,
      {
        answer: string;
        options: string[];
      }
    > = {
      arrive: {
        answer: "arrived",
        options: [
          "arrived",
          "arrive",
          "arriving",
          "arriven",
        ],
      },

      buy: {
        answer: "bought",
        options: [
          "buyed",
          "bought",
          "buys",
          "buying",
        ],
      },

      catch: {
        answer: "caught",
        options: [
          "catched",
          "caught",
          "catches",
          "catching",
        ],
      },

      earn: {
        answer: "earned",
        options: [
          "earned",
          "earnt",
          "earning",
          "earns",
        ],
      },

      help: {
        answer: "helped",
        options: [
          "helped",
          "help",
          "helping",
          "helps",
        ],
      },

      keep: {
        answer: "kept",
        options: [
          "keeped",
          "kept",
          "keeps",
          "keeping",
        ],
      },

      live: {
        answer: "lived",
        options: [
          "lived",
          "live",
          "living",
          "lives",
        ],
      },

      run: {
        answer: "ran",
        options: [
          "runned",
          "ran",
          "runs",
          "running",
        ],
      },

      visit: {
        answer: "visited",
        options: [
          "visited",
          "visit",
          "visiting",
          "visits",
        ],
      },

      win: {
        answer: "won",
        options: [
          "winned",
          "won",
          "wins",
          "winning",
        ],
      },
    };

    return practiceVerbs.map((verb) => {
      const cleanVerb = String(verb)
        .toLowerCase()
        .trim();

      const info = pastData[cleanVerb] || {
        answer: `${cleanVerb}ed`,
        options: [
          `${cleanVerb}ed`,
          cleanVerb,
          `${cleanVerb}ing`,
          `${cleanVerb}s`,
        ],
      };

      return {
        question:
          `What is the past tense of "${cleanVerb}"?`,
        answer: info.answer,
        options: shuffleArray(info.options),
      };
    });
  }, [grammar.practice_verbs]);

  const currentGrammar =
    grammarQuestions[grammarIndex];

  /* =======================================================
     START MATCH
  ======================================================= */

  const startMatch = () => {
    setMatchIndex(0);
    setMatchScore(0);
    setMatchSelected(null);
    setMatchCorrect(false);

    setStage("match");
  };

  /* =======================================================
     MATCH ANSWER
  ======================================================= */

  const answerMatch = (answer: string) => {
    if (matchSelected !== null) return;

    const current = match[matchIndex];

    if (!current) return;

    setMatchSelected(answer);

    const correct =
      answer === current.meaning;

    setMatchCorrect(correct);

    if (correct) {
      setMatchScore((previous) => previous + 1);
    }
  };

  /* =======================================================
     NEXT MATCH
  ======================================================= */

  const nextMatch = () => {
    if (matchIndex < match.length - 1) {
      setMatchIndex((previous) => previous + 1);
      return;
    }

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
  };

  /* =======================================================
     GRAMMAR ANSWER
  ======================================================= */

  const answerGrammar = (answer: string) => {
    if (grammarAnswer !== null) return;

    if (!currentGrammar) return;

    setGrammarAnswer(answer);

    if (answer === currentGrammar.answer) {
      setGrammarScore((previous) => previous + 1);
    }
  };

  /* =======================================================
     NEXT GRAMMAR
  ======================================================= */

  const nextGrammar = () => {
    if (
      grammarIndex <
      grammarQuestions.length - 1
    ) {
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

  /* =======================================================
     CHALLENGE ANSWER
  ======================================================= */

  const answerChallenge = (answer: string) => {
    if (challengeAnswer !== null) return;

    const current =
      challenge[challengeIndex];

    if (!current) return;

    setChallengeAnswer(answer);

    if (answer === current.answer) {
      setChallengeScore(
        (previous) => previous + 1
      );
    }
  };

  /* =======================================================
     NEXT CHALLENGE
  ======================================================= */

  const nextChallenge = () => {
    if (
      challengeIndex <
      challenge.length - 1
    ) {
      setChallengeIndex((previous) => previous + 1);
      setChallengeAnswer(null);
      return;
    }

    setStage("result");
  };

  /* =======================================================
     RESULT
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
     STAGES
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
     RESTART
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
     RENDER
  ======================================================= */

  return (
    <div>

      {/* =================================================
          BACK
      ================================================= */}

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

      {/* =================================================
          PROGRESS
      ================================================= */}

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
              opacity:
                index <= currentStageIndex
                  ? 1
                  : 0.45,
            }}
          >
            <div
              style={{
                height: "5px",
                borderRadius: "5px",
                backgroundColor:
                  index <= currentStageIndex
                    ? "#3b82f6"
                    : "#334155",
                marginBottom: "5px",
              }}
            />

            <div
              style={{
                fontSize: "10px",
                color:
                  index === currentStageIndex
                    ? "#fbbf24"
                    : "#94a3b8",
                whiteSpace: "nowrap",
              }}
            >
              {item.icon} {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* =================================================
          MAIN CARD
      ================================================= */}

      <div
        style={{
          backgroundColor: "#1e293b",
          borderRadius: "12px",
          padding: "18px",
          border: "1px solid #334155",
        }}
      >

        {/* HEADER */}

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

            {data.learn?.paragraphs?.map(
              (paragraph, index) => (
                <p
                  key={index}
                  style={{
                    color: "#e2e8f0",
                    lineHeight: 1.8,
                    marginBottom: "14px",
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

                {vocab[vocabIndex]?.example && (
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#94a3b8",
                      fontStyle: "italic",
                      lineHeight: 1.7,
                    }}
                  >
                    {vocab[vocabIndex].example}
                  </div>
                )}

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
            VOCABULARY EMPTY
        ================================================= */}

        {stage === "vocabulary" &&
          vocab.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "25px",
              }}
            >
              <div style={{ fontSize: "40px" }}>
                🧠
              </div>

              <p
                style={{
                  color: "#cbd5e1",
                }}
              >
                لا توجد مفردات لهذا الدرس.
              </p>

              <button
                type="button"
                onClick={() =>
                  match.length > 0
                    ? startMatch()
                    : setStage("grammar")
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "#3b82f6",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                متابعة ➡️
              </button>
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
                  backgroundColor: "#0f172a",
                  borderRadius: "12px",
                  padding: "24px 15px",
                  textAlign: "center",
                  border: "1px solid #334155",
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
                  {match[matchIndex]?.term}
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
                      matchSelected === option;

                    const isCorrect =
                      matchSelected !== null &&
                      option ===
                        match[matchIndex]
                          ?.meaning;

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
                            matchSelected !== null
                              ? "default"
                              : "pointer",
                        }}
                      >
                        {option}

                        {isCorrect && " ✅"}

                        {isSelected &&
                          !isCorrect &&
                          " ❌"}
                      </button>
                    );
                  }
                )}

              </div>

              {matchSelected !== null && (
                <>
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
                      : `الإجابة الصحيحة: ${match[matchIndex]?.meaning}`}
                  </div>

                  <button
                    type="button"
                    onClick={nextMatch}
                    style={{
                      marginTop: "14px",
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#8b5cf6",
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
                </>
              )}

            </div>
          )}

        {/* =================================================
            MATCH EMPTY
        ================================================= */}

        {stage === "match" &&
          match.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "25px",
              }}
            >
              <div style={{ fontSize: "35px" }}>
                🧩
              </div>

              <p
                style={{
                  color: "#cbd5e1",
                }}
              >
                لا توجد كلمات للمطابقة لهذا الدرس.
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
                }}
              >
                متابعة 🎯
              </button>
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
                  (option, index) => {
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
                        onClick={() =>
                          answerGrammar(option)
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
              {percentage >= 80
                ? "أحسنت!"
                : percentage >= 50
                ? "عمل رائع!"
                : "استمر في المحاولة!"}
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
                total={grammarQuestions.length}
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

  const options =
    currentChallenge.type === "true_false"
      ? ["True", "False"]
      : currentChallenge.options || [];

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
          border: "1px solid #334155",
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

      <div
        style={{
          display: "flex",
          flexDirection:
            options.length === 2
              ? "row"
              : "column",
          gap: "9px",
        }}
      >

        {options.map(
          (option, index) => {
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
                onClick={() =>
                  answerChallenge(option)
                }
                style={{
                  flex: 1,
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

      {challengeAnswer !== null && (
        <>
          <div
            style={{
              marginTop: "14px",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor:
                challengeAnswer ===
                currentChallenge.answer
                  ? "#14532d"
                  : "#450a0a",
              color: "#fff",
              textAlign: "center",
              fontSize: "13px",
            }}
          >
            {challengeAnswer ===
            currentChallenge.answer
              ? "ممتاز! إجابة صحيحة 🎉"
              : `الإجابة الصحيحة: ${currentChallenge.answer}`}
          </div>

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
            challengeLength - 1
              ? "السؤال التالي ➡️"
              : "عرض النتيجة 🏆"}
          </button>
        </>
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
        backgroundColor: "#172554",
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
