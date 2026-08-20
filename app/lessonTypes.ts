
export type LessonStage =
  | "learn"
  | "vocabulary"
  | "match"
  | "grammar"
  | "challenge"
  | "result";

export type VocabularyItem = {
  word: string;
  meaning: string;
  example: string;
};

export type MatchItem = {
  term: string;
  meaning: string;
};

export type GrammarData = {
  title?: string;
  practice_verbs?: string[];
};

export type ChallengeItem = {
  type: "mcq" | "true_false" | string;
  question: string;
  options?: string[];
  answer: string;
};

export type LessonContent = {
  learn?: {
    intro?: string;
    paragraphs?: string[];
  };

  vocabulary?: VocabularyItem[];

  match?: MatchItem[];

  grammar?: GrammarData;

  challenge?: ChallengeItem[];
};

export type Lesson = {
  id?: string;
  lesson_title: string;
  unit_title?: string;

  content_json: LessonContent;
};
