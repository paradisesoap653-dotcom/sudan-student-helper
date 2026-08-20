/* =========================================================
   Lesson Types
   نظام الدروس التفاعلية
========================================================= */

/* =========================================================
   Lesson Stages
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

export type GrammarExample = {
  past?: string;
  verb?: string;
  future?: string;
  present?: string;
};

export type GrammarData = {
  title?: string;

  example?: GrammarExample;

  practice_verbs?: string[];

  /*
   * يسمح بإضافة أسئلة Grammar مباشرة من Supabase
   * مستقبلاً بدون الحاجة لتعديل الكود.
   */
  questions?: GrammarQuestion[];
};

export type GrammarQuestion = {
  question: string;
  options: string[];
  answer: string;
};

/* =========================================================
   Challenge
========================================================= */

export type ChallengeType =
  | "mcq"
  | "true_false"
  | "multiple_choice"
  | "fill_blank"
  | "short_answer"
  | string;

export type ChallengeItem = {
  type: ChallengeType;

  question: string;

  options?: string[];

  answer: string;

  /*
   * شرح اختياري يظهر بعد الإجابة.
   */
  explanation?: string;

  /*
   * يسمح بإضافة صورة للسؤال مستقبلاً.
   */
  image?: string;
};

/* =========================================================
   Learn
========================================================= */

export type LearnData = {
  intro?: string;

  paragraphs?: string[];

  /*
   * عنوان اختياري لجزء القراءة.
   */
  title?: string;

  /*
   * نص إضافي اختياري.
   */
  note?: string;
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

  /*
   * يسمح بإضافة أجزاء جديدة من Supabase
   * بدون كسر النظام الحالي.
   */
  [key: string]: unknown;
};

/* =========================================================
   Lesson
========================================================= */

export type Lesson = {
  /*
   * المعرف الأساسي للدرس.
   */
  id: string | number;

  /*
   * المادة المرتبط بها الدرس.
   */
  subject_id?: string | number | null;

  /*
   * العنوان العام.
   */
  title?: string | null;

  /*
   * عنوان الدرس المستخدم في النظام التفاعلي.
   */
  lesson_title?: string | null;

  /*
   * عنوان الوحدة.
   */
  unit_title?: string | null;

  /*
   * المحتوى النصي القديم.
   */
  content?: string | null;

  /*
   * محتوى HTML القديم.
   */
  content_html?: string | null;

  /*
   * المحتوى التفاعلي الجديد.
   */
  content_json?: LessonContent | null;
};
