/* =========================================================
   Lesson Types
========================================================= */

export type LessonStage =
  | "learn"
  | "vocabulary"
  | "match"
  | "grammar"
  | "challenge"
  | "result";

/* =========================================================
   Vocabulary
========================================================= */

export type VocabularyItem = {
  word: string;
  meaning: string;
  example?: string;
};

/* =========================================================
   Match
========================================================= */

export type MatchItem = {
  term: string;
  meaning: string;
};

/* =========================================================
   Grammar
========================================================= */

export type GrammarData = {
  title?: string;
  practice_verbs?: string[];
};

/* =========================================================
   Challenge
========================================================= */

export type ChallengeItem = {
  type: "mcq" | "true_false" | string;
  question: string;
  options?: string[];
  answer: string;
};

/* =========================================================
   Learn
========================================================= */

export type LearnData = {
  intro?: string;
  paragraphs?: string[];
};

/* =========================================================
   Content JSON
========================================================= */

export type LessonContent = {
  learn?: LearnData;

  vocabulary?: VocabularyItem[];

  match?: MatchItem[];

  grammar?: GrammarData;

  challenge?: ChallengeItem[];

  [key: string]: unknown;
};

/* =========================================================
   Lesson
========================================================= */

export type Lesson = {
  id: string | number;

  subject_id?: string | number | null;

  title?: string | null;

  lesson_title?: string | null;

  unit_title?: string | null;

  content?: string | null;

  content_html?: string | null;

  content_json?: LessonContent | null;
};
