export type Track =
  | "scientific"
  | "literary"
  | "vocational";

export type LessonStage =
  | "learn"
  | "vocabulary"
  | "match"
  | "grammar"
  | "challenge"
  | "result";

export type FileItem = {
  title: string;
  size: string;
  url: string;
};

export type ContentItem = {
  books: FileItem[];
  exams: FileItem[];
};

export type Lesson = {
  id: string | number;
  subject_id: string;
  unit_title: string;
  lesson_title: string;
  content: string | null;
  content_json?: LessonContent;
};

export type Subject = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type VocabularyItem = {
  word: string;
  example: string;
  meaning: string;
};

export type MatchItem = {
  term: string;
  meaning: string;
};

export type GrammarData = {
  title?: string;
  example?: {
    past?: string;
    verb?: string;
    future?: string;
    present?: string;
  };
  practice_verbs?: string[];
};

export type ChallengeItem = {
  type: "mcq" | "true_false" | "fill" | string;
  question: string;
  answer: string;
  options?: string[];
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
