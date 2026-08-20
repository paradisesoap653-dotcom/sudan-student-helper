"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { supabase } from "../../../supabaseClient";
import InteractiveLesson from "../../InteractiveLesson";

import type {
  Lesson,
  LessonStage,
} from "../../lessonTypes";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();

  const id = String(params?.id || "");

  const [lesson, setLesson] =
    useState<Lesson | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const [stage, setStage] =
    useState<LessonStage>("learn");

  const [vocabIndex, setVocabIndex] =
    useState(0);

  useEffect(() => {
    async function loadLesson() {
      if (!id) return;

      setLoading(true);
      setError(false);

      /*
       * ==========================================
       * جلب الدروس من Supabase
       * ==========================================
       */

      const { data, error } = await supabase
        .from("lessons")
        .select(
          "id, subject_id, title, content, content_html, content_json, unit_title, lesson_title"
        );

      if (error || !data) {
        console.error(
          "Supabase lesson error:",
          error
        );

        setError(true);
        setLoading(false);
        return;
      }

      /*
       * ==========================================
       * البحث المرن عن الدرس
       * ==========================================
       */

      const requestedId = id
        .toLowerCase()
        .trim();

      const found = data.find((item) => {
        const itemId = String(
          item.id ?? ""
        )
          .toLowerCase()
          .trim();

        const subjectId = String(
          item.subject_id ?? ""
        )
          .toLowerCase()
          .trim();

        const title = String(
          item.title ?? ""
        )
          .toLowerCase()
          .trim();

        const lessonTitle = String(
          item.lesson_title ?? ""
        )
          .toLowerCase()
          .trim();

        return (
          itemId === requestedId ||
          subjectId === requestedId ||
          title === requestedId ||
          lessonTitle === requestedId ||
          requestedId.includes(subjectId)
        );
      });

      /*
       * ==========================================
       * الدرس غير موجود
       * ==========================================
       */

      if (!found) {
        console.error(
          "Lesson not found:",
          id
        );

        setError(true);
        setLoading(false);
        return;
      }

      /*
       * ==========================================
       * تجهيز الدرس للنظام التفاعلي
       * ==========================================
       */

      const normalizedLesson: Lesson = {
        id: found.id,

        subject_id:
          found.subject_id,

        title:
          found.title,

        lesson_title:
          found.lesson_title ||
          found.title ||
          "Lesson",

        unit_title:
          found.unit_title ||
          "Unit 1: Chapter One - Trees",

        content:
          found.content,

        content_html:
          found.content_html,

        content_json:
          found.content_json || {},
      };

      setLesson(
        normalizedLesson
      );

      setLoading(false);
    }

    loadLesson();
  }, [id]);

  /*
   * ==========================================
   * شاشة التحميل
   * ==========================================
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">

        <div className="text-center">

          <div className="text-5xl mb-4">
            📖
          </div>

          <p className="text-slate-300">
            جاري تحميل الدرس...
          </p>

        </div>

      </div>
    );
  }

  /*
   * ==========================================
   * شاشة الخطأ
   * ==========================================
   */

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">

        <div className="text-center p-8 bg-slate-900 rounded-xl border border-red-500/30 max-w-md w-full">

          <div className="text-5xl mb-4">
            😔
          </div>

          <p className="text-red-400 font-bold text-lg mb-4">
            عذراً، هذا الدرس غير متوفر حالياً!
          </p>

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="px-5 py-3 rounded-lg bg-blue-600 text-white font-bold"
          >
            ➡️ العودة
          </button>

        </div>

      </div>
    );
  }

  /*
   * ==========================================
   * تشغيل الدرس التفاعلي
   * ==========================================
   */

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-6">

      <div className="max-w-3xl mx-auto">

        <InteractiveLesson
          lesson={lesson}
          stage={stage}
          setStage={setStage}
          vocabIndex={vocabIndex}
          setVocabIndex={
            setVocabIndex
          }
          onExit={() =>
            router.back()
          }
        />

      </div>

    </div>
  );
}
