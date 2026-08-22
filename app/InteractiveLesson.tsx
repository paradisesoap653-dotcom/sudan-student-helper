"use client";

import React, { useEffect, useMemo, useState } from "react";

type InteractiveLessonProps = {
  lesson: any;
  stage: string;
  setStage: (stage: any) => void;
  vocabIndex: number;
  setVocabIndex: (index: number) => void;
  onExit: () => void;
};

function InteractiveLesson({
  lesson,
  stage,
  setStage,
  vocabIndex,
  setVocabIndex,
  onExit,
}: InteractiveLessonProps) {
  /* =========================================================
     DATA
  ========================================================= */

  const data = lesson?.content_json || {};

  const vocab = Array.isArray(data.vocabulary)
    ? data.vocabulary
    : [];

  const match = Array.isArray(data.match)
    ? data.match.filter(
        (item: any) =>
          item &&
          typeof item.term === "string" &&
          typeof item.meaning === "string"
      )
    : [];

  const grammar = data.grammar || {};

  const challenge = Array.isArray(data.challenge)
    ? data.challenge.filter(
        (item: any) =>
          item &&
          typeof item.question === "string" &&
          typeof item.answer === "string"
      )
    : [];

  /* =========================================================
     SHUFFLE
  ========================================================= */

  function shuffleArray<T>(items: T[]): T[] {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [result[i], result[j]] = [
        result[j],
        result[i],
      ];
    }

    return result;
  }

  /* =========================================================
     MATCH STATE
  ========================================================= */

  const [matchWords, setMatchWords] = useState<any[]>([]);
  const [matchMeanings, setMatchMeanings] = useState<any[]>([]);

  const [selectedWord, setSelectedWord] =
    useState<string | null>(null);

  const [selectedMeaning, setSelectedMeaning] =
    useState<string | null>(null);

  const [matchedWords, setMatchedWords] =
    useState<string[]>([]);

  const [matchWrong, setMatchWrong] =
    useState(false);

  const [matchScore, setMatchScore] =
    useState(0);

  const [matchStarted, setMatchStarted] =
    useState(false);

  /* =========================================================
     GRAMMAR STATE
  ========================================================= */

  const [grammarIndex, setGrammarIndex] =
    useState(0);

  const [grammarAnswer, setGrammarAnswer] =
    useState<string | null>(null);

  const [grammarScore, setGrammarScore] =
    useState(0);

  /* =========================================================
     CHALLENGE STATE
  ========================================================= */

  const [challengeIndex, setChallengeIndex] =
    useState(0);

  const [challengeAnswer, setChallengeAnswer] =
    useState<string | null>(null);

  const [challengeScore, setChallengeScore] =
    useState(0);

  /* =========================================================
     PREPARE MATCH
  ========================================================= */

  const prepareMatch = () => {
    setMatchWords(shuffleArray(match));
    setMatchMeanings(shuffleArray(match));

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
     START MATCH
  ========================================================= */

  const startMatch = () => {
    prepareMatch();
    setStage("match");
  };

  /* =========================================================
     CHOOSE MATCH WORD
  ========================================================= */

  const chooseWord = (term: string) => {
    if (matchedWords.includes(term)) {
      return;
    }

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
     CHOOSE MATCH MEANING
  ========================================================= */

  const chooseMeaning = (meaning: string) => {
    const matchedMeaning = match.some(
      (item: any) =>
        matchedWords.includes(item.term) &&
        item.meaning === meaning
    );

    if (matchedMeaning) {
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
     CHECK MATCH
  ========================================================= */

  const checkMatch = (
    term: string,
    meaning: string
  ) => {
    const correct = match.find(
      (item: any) =>
        item.term === term &&
        item.meaning === meaning
    );

    if (correct) {
      setMatchedWords((prev) =>
        prev.includes(term)
          ? prev
          : [...prev, term]
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

  /* =========================================================
     MOVE FROM MATCH TO GRAMMAR
  ========================================================= */

  useEffect(() => {
    if (!matchCompleted) {
      return;
    }

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
  }, [matchCompleted]);

  /* =========================================================
     GRAMMAR
  ========================================================= */

  const practiceVerbs = Array.isArray(
    grammar.practice_verbs
  )
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
    become: "became",
    use: "used",
    translate: "translated",
    recognise: "recognised",
    recognize: "recognized",
    publish: "published",
    sell: "sold",
    write: "wrote",
    die: "died",
    succeed: "succeeded",
    gain: "gained",
    learn: "learned",
    develop: "developed",
    go: "went",
    need: "needed",
    acquire: "acquired",
    teach: "taught",
    find: "found",
    make: "made",
    take: "took",
    give: "gave",
    see: "saw",
    know: "knew",
    think: "thought",
    tell: "told",
    leave: "left",
    feel: "felt",
    bring: "brought",
    begin: "began",
    speak: "spoke",
    read: "read",
    hear: "heard",
    meet: "met",
    pay: "paid",
    build: "built",
    send: "sent",
    spend: "spent",
    study: "studied",
    play: "played",
    watch: "watched",
    want: "wanted",
    work: "worked",
    open: "opened",
    close: "closed",
    start: "started",
    stop: "stopped",
    change: "changed",
    move: "moved",
    show: "showed",
    ask: "asked",
    answer: "answered",
    explain: "explained",
    describe: "described",
    discover: "discovered",
    invent: "invented",
    create: "created",
    improve: "improved",
    increase: "increased",
    decrease: "decreased",
    remember: "remembered",
    forget: "forgot",
    understand: "understood",
    decide: "decided",
    choose: "chose",
    lose: "lost",
    grow: "grew",
    plant: "planted",
    protect: "protected",
    save: "saved",
    provide: "provided",
    produce: "produced",
    reduce: "reduced",
    prevent: "prevented",
    cause: "caused",
    solve: "solved",
    achieve: "achieved",
    reach: "reached",
    continue: "continued",
    return: "returned",
    receive: "received",
    offer: "offered",
    suggest: "suggested",
    encourage: "encouraged",
    support: "supported",
    require: "required",
    allow: "allowed",
    enable: "enabled",
    prepare: "prepared",
    organise: "organised",
    organize: "organized",
    manage: "managed",
    lead: "led",
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
    become: ["becomed", "became", "becomes", "becoming"],
    use: ["used", "use", "using", "uses"],
    translate: [
      "translated",
      "translate",
      "translating",
      "translates",
    ],
    recognise: [
      "recognised",
      "recognise",
      "recognising",
      "recognises",
    ],
    publish: [
      "published",
      "publish",
      "publishing",
      "publishes",
    ],
    sell: ["selled", "sold", "sells", "selling"],
    write: ["writed", "wrote", "writes", "writing"],
    die: ["died", "die", "dying", "dies"],
    succeed: [
      "succeeded",
      "succeed",
      "succeeding",
      "succeeds",
    ],
    gain: ["gained", "gain", "gaining", "gains"],
    learn: [
      "learned",
      "learnt",
      "learning",
      "learns",
    ],
    develop: [
      "developed",
      "develop",
      "developing",
      "develops",
    ],
    go: ["goed", "went", "goes", "going"],
    need: ["needed", "need", "needing", "needs"],
    acquire: [
      "acquired",
      "acquire",
      "acquiring",
      "acquires",
    ],
    teach: ["teached", "taught", "teaches", "teaching"],
    find: ["finded", "found", "finds", "finding"],
  };

  const grammarQuestions = useMemo(() => {
    if (
      Array.isArray(grammar.questions) &&
      grammar.questions.length > 0
    ) {
      return grammar.questions.map((item: any) => ({
        question: item.question,
        answer: item.answer,
        options: shuffleArray(
          Array.isArray(item.options)
            ? item.options
            : [
                item.answer,
                "None",
                "Not sure",
                "Try again",
              ]
        ),
      }));
    }

    return practiceVerbs.map((verb: string) => {
      const answer =
        pastTenses[verb] || `${verb}ed`;

      return {
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
      };
    });
  }, [grammar.questions, practiceVerbs]);

  const currentGrammar =
    grammarQuestions[grammarIndex];

  /* =========================================================
     ANSWER GRAMMAR
  ========================================================= */

  const answerGrammar = (answer: string) => {
    if (
      grammarAnswer !== null ||
      !currentGrammar
    ) {
      return;
    }

    setGrammarAnswer(answer);

    if (answer === currentGrammar.answer) {
      setGrammarScore((prev) => prev + 1);
    }
  };

  /* =========================================================
     NEXT GRAMMAR
  ========================================================= */

  const nextGrammar = () => {
    if (
      grammarIndex <
      grammarQuestions.length - 1
    ) {
      setGrammarIndex(
        (prev) => prev + 1
      );

      setGrammarAnswer(null);
    } else {
      setChallengeIndex(0);
      setChallengeAnswer(null);
      setChallengeScore(0);

      if (challenge.length > 0) {
        setStage("challenge");
      } else {
        setStage("result");
      }
    }
  };

  /* =========================================================
     CURRENT CHALLENGE
  ========================================================= */

  const currentChallenge =
    challenge[challengeIndex];

  /* =========================================================
     ANSWER CHALLENGE
  ========================================================= */

  const answerChallenge = (
    answer: string
  ) => {
    if (
      challengeAnswer !== null ||
      !currentChallenge
    ) {
      return;
    }

    setChallengeAnswer(answer);

    if (
      answer === currentChallenge.answer
    ) {
      setChallengeScore(
        (prev) => prev + 1
      );
    }
  };

  /* =========================================================
     NEXT CHALLENGE
  ========================================================= */

  const nextChallenge = () => {
    if (
      challengeIndex <
      challenge.length - 1
    ) {
      setChallengeIndex(
        (prev) => prev + 1
      );

      setChallengeAnswer(null);
    } else {
      setStage("result");
    }
  };

  /* =========================================================
     TOTAL SCORE
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
      ? Math.round(
          (totalScore /
            totalQuestions) *
            100
        )
      : 0;

  /* =========================================================
     STAGES
  ========================================================= */

  const stages = [
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

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div dir="ltr">
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

      {/* PROGRESS */}
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

      {/* MAIN CARD */}
      <div
        style={{
          backgroundColor: "#1e293b",
          borderRadius: "12px",
          padding: "18px",
          border: "1px solid #334155",
        }}
      >
        {/* UNIT */}
        <div
          style={{
            fontSize: "12px",
            color: "#fbbf24",
            marginBottom: "8px",
          }}
        >
          {lesson?.unit_title}
        </div>

        {/* TITLE */}
        <h3
          style={{
            color: "#fff",
            margin: "0 0 16px",
            fontSize: "20px",
            lineHeight: 1.5,
          }}
        >
          {lesson?.lesson_title ||
            lesson?.title}
        </h3>

        {/* =====================================================
            LEARN
        ===================================================== */}

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

            {Array.isArray(
              data.learn?.paragraphs
            ) &&
              data.learn.paragraphs.map(
                (paragraph: string, index: number) => (
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
                setStage(
                  vocab.length > 0
                    ? "vocabulary"
                    : match.length > 0
                    ? "match"
                    : grammarQuestions.length > 0
                    ? "grammar"
                    : challenge.length > 0
                    ? "challenge"
                    : "result"
                );
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

        {/* =====================================================
            VOCABULARY
        ===================================================== */}

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
                {vocabIndex + 1}/
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
                    ابدأ المطابقة 🧩
                  </button>
                )}
              </div>
            </div>
          )}

        {/* =====================================================
            MATCH
        ===================================================== */}

        {stage === "match" &&
          match.length > 0 && (
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
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  backgroundColor: "#0f172a",
                  borderRadius: "10px",
                  padding: "10px 13px",
                  marginBottom: "15px",
                  border:
                    "1px solid #334155",
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
                  {matchedWords.length} /{" "}
                  {match.length} ✅
                </strong>
              </div>

              {matchWrong && (
                <div
                  style={{
                    backgroundColor: "#450a0a",
                    border:
                      "1px solid #ef4444",
                    color: "#fecaca",
                    borderRadius: "9px",
                    padding: "10px",
                    textAlign: "center",
                    marginBottom: "12px",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  ❌ ليست المطابقة الصحيحة،
                  حاول مرة أخرى
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "10px",
                  alignItems: "start",
                }}
              >
                {/* WORDS */}
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
                      flexDirection:
                        "column",
                      gap: "8px",
                    }}
                  >
                    {matchWords.map(
                      (item: any) => {
                        const matched =
                          matchedWords.includes(
                            item.term
                          );

                        const selected =
                          selectedWord ===
                          item.term;

                        return (
                          <button
                            key={item.term}
                            type="button"
                            disabled={matched}
                            onClick={() =>
                              chooseWord(
                                item.term
                              )
                            }
                            style={{
                              width: "100%",
                              minHeight:
                                "52px",
                              padding:
                                "9px 6px",
                              border: `1px solid ${
                                matched
                                  ? "#22c55e"
                                  : selected
                                  ? "#f59e0b"
                                  : "#334155"
                              }`,
                              borderRadius:
                                "9px",
                              backgroundColor:
                                matched
                                  ? "#14532d"
                                  : selected
                                  ? "#78350f"
                                  : "#0f172a",
                              color:
                                matched
                                  ? "#86efac"
                                  : "#fff",
                              fontWeight:
                                "bold",
                              fontSize:
                                "13px",
                              cursor:
                                matched
                                  ? "default"
                                  : "pointer",
                            }}
                          >
                            {item.term}
                            {matched &&
                              " ✅"}
                            {selected &&
                              !matched &&
                              " 👆"}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* MEANINGS */}
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
                      flexDirection:
                        "column",
                      gap: "8px",
                    }}
                  >
                    {matchMeanings.map(
                      (item: any) => {
                        const matched =
                          matchedWords.includes(
                            item.term
                          );

                        const selected =
                          selectedMeaning ===
                          item.meaning;

                        return (
                          <button
                            key={item.meaning}
                            type="button"
                            disabled={matched}
                            onClick={() =>
                              chooseMeaning(
                                item.meaning
                              )
                            }
                            style={{
                              width: "100%",
                              minHeight:
                                "52px",
                              padding:
                                "9px 6px",
                              border: `1px solid ${
                                matched
                                  ? "#22c55e"
                                  : selected
                                  ? "#f59e0b"
                                  : "#334155"
                              }`,
                              borderRadius:
                                "9px",
                              backgroundColor:
                                matched
                                  ? "#14532d"
                                  : selected
                                  ? "#78350f"
                                  : "#0f172a",
                              color:
                                matched
                                  ? "#86efac"
                                  : "#fff",
                              fontWeight:
                                "bold",
                              fontSize:
                                "13px",
                              cursor:
                                matched
                                  ? "default"
                                  : "pointer",
                            }}
                          >
                            {item.meaning}
                            {matched &&
                              " ✅"}
                            {selected &&
                              !matched &&
                              " 👆"}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>

              {matchCompleted && (
                <div
                  style={{
                    marginTop: "18px",
                    backgroundColor: "#14532d",
                    border:
                      "1px solid #22c55e",
                    borderRadius: "12px",
                    padding: "16px",
                    textAlign: "center",
                    color: "#fff",
                  }}
                >
                  <div
                    style={{
                      fontSize: "30px",
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
                    النتيجة:{" "}
                    {matchScore} /{" "}
                    {match.length}
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#86efac",
                      marginTop: "8px",
                    }}
                  >
                    جاري الانتقال...
                  </div>
                </div>
              )}
            </div>
          )}

        {/* =====================================================
            MATCH EMPTY
        ===================================================== */}

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
                onClick={() => {
                  if (
                    grammarQuestions.length >
                    0
                  ) {
                    setStage("grammar");
                  } else if (
                    challenge.length > 0
                  ) {
                    setChallengeIndex(0);
                    setChallengeAnswer(null);
                    setChallengeScore(0);
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

        {/* =====================================================
            GRAMMAR
        ===================================================== */}

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
                — السؤال{" "}
                {grammarIndex + 1} من{" "}
                {grammarQuestions.length}
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
                  flexDirection:
                    "column",
                  gap: "9px",
                }}
              >
                {currentGrammar?.options.map(
                  (
                    option: string,
                    index: number
                  ) => {
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
                          borderRadius:
                            "9px",
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
                          fontWeight:
                            "bold",
                          cursor:
                            grammarAnswer !==
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
                  grammarQuestions.length - 1
                    ? "التالي ➡️"
                    : "انتقل إلى التحدي ⚡"}
                </button>
              )}
            </div>
          )}

        {/* =====================================================
            GRAMMAR EMPTY
        ===================================================== */}

        {stage === "grammar" &&
          grammarQuestions.length === 0 && (
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
                🎯
              </div>

              <p
                style={{
                  color: "#cbd5e1",
                }}
              >
                لا توجد تدريبات قواعد
                لهذا الدرس.
              </p>

              <button
                type="button"
                onClick={() => {
                  setChallengeIndex(0);
                  setChallengeAnswer(null);
                  setChallengeScore(0);

                  if (
                    challenge.length > 0
                  ) {
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
                  backgroundColor:
                    "#3b82f6",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                متابعة ⚡
              </button>
            </div>
          )}

        {/* =====================================================
            CHALLENGE
        ===================================================== */}

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

              {/* QUESTION NUMBER */}
              <div
                style={{
                  fontSize: "13px",
                  color: "#fbbf24",
                  fontWeight: "bold",
                  marginBottom: "12px",
                  textAlign: "center",
                }}
              >
                السؤال{" "}
                {challengeIndex + 1} من{" "}
                {challenge.length}
              </div>

              {/* QUESTION */}
              <div
                style={{
                  backgroundColor: "#0f172a",
                  borderRadius: "12px",
                  padding: "22px 15px",
                  border:
                    "1px solid #334155",
                  marginBottom: "15px",
                }}
              >
                <div
                  style={{
                    color: "#fff",
                    fontSize: "18px",
                    fontWeight: "bold",
                    lineHeight: 1.8,
                    textAlign: "center",
                  }}
                >
                  {currentChallenge?.question}
                </div>
              </div>

              {/* TRUE / FALSE */}
              {currentChallenge?.type ===
              "true_false" ? (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  {[
                    "True",
                    "False",
                  ].map((option) => {
                    const correct =
                      challengeAnswer !==
                        null &&
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
                          padding:
                            "14px 8px",
                          borderRadius:
                            "9px",
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
                          fontWeight:
                            "bold",
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
                  })}
                </div>
              ) : (
                /* MULTIPLE CHOICE */
                <div
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                    gap: "9px",
                  }}
                >
                  {(currentChallenge?.options ||
                    []
                  ).map(
                    (
                      option: string,
                      index: number
                    ) => {
                      const correct =
                        challengeAnswer !==
                          null &&
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
                            padding: "14px",
                            borderRadius:
                              "9px",
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
                            fontWeight:
                              "bold",
                            cursor:
                              challengeAnswer !==
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
              )}

              {/* EXPLANATION */}
              {challengeAnswer !==
                null &&
                currentChallenge?.explanation && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "11px",
                      borderRadius: "8px",
                      backgroundColor:
                        "#172554",
                      color: "#cbd5e1",
                      fontSize: "12px",
                      lineHeight: 1.7,
                    }}
                  >
                    💡{" "}
                    {
                      currentChallenge.explanation
                    }
                  </div>
                )}

              {/* NEXT BUTTON */}
              {challengeAnswer !==
                null && (
                <button
                  type="button"
                  onClick={
                    nextChallenge
                  }
                  style={{
                    marginTop: "16px",
                    width: "100%",
                    padding: "14px",
                    borderRadius: "9px",
                    border: "none",
                    backgroundColor:
                      "#f59e0b",
                    color: "#111827",
                    fontWeight: "900",
                    fontSize: "15px",
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

        {/* =====================================================
            CHALLENGE EMPTY
        ===================================================== */}

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
                لا توجد أسئلة تحدي
                لهذا الدرس.
              </p>

              <button
                type="button"
                onClick={() =>
                  setStage("result")
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor:
                    "#f59e0b",
                  color: "#111827",
                  fontWeight: "bold",
                }}
              >
                عرض النتيجة 🏆
              </button>
            </div>
          )}

        {/* =====================================================
            RESULT
        ===================================================== */}

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
              {lesson?.lesson_title ||
                lesson?.title}
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
              <div
                style={{
                  backgroundColor:
                    "#172554",
                  padding:
                    "10px 5px",
                  borderRadius: "9px",
                }}
              >
                <div>🧩</div>

                <div
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  {matchScore}/
                  {match.length}
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
                  backgroundColor:
                    "#172554",
                  padding:
                    "10px 5px",
                  borderRadius: "9px",
                }}
              >
                <div>🎯</div>

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
                  backgroundColor:
                    "#172554",
                  padding:
                    "10px 5px",
                  borderRadius: "9px",
                }}
              >
                <div>⚡</div>

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

            {/* RETRY */}
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

            {/* EXIT */}
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
      </div>
    </div>
  );
}

export default InteractiveLesson;
