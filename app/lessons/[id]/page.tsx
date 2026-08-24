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

  const id = String(params?.id || "").trim();

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
      if (!id) {
        setError(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        /*
         * ==========================================
         * جلب الدرس المحدد مباشرة من جدول lessons
         * باستخدام الـ ID لضمان دقة وسرعة الاستعلام
         * ==========================================
         */

        const { data, error } = await supabase
          .from("lessons")
          .select(
            "id, subject_id, unit_title, lesson_title, content_json"
          )
          .eq("id", id)
          .single();

        if (error || !data) {
          console.error(
            "Supabase lesson error:",
            error
          );

          setError(true);
          setLoading(false);
          return;
        }

        const found = data;

        /*
         * ==========================================
         * تجهيز content_json
         * ==========================================
         */

        let contentJson = found.content_json;

        /*
         * Supabase قد يرجع JSON كنص حسب نوع العمود.
         * لذلك نتأكد من تحويله إلى Object.
         */

        if (typeof contentJson === "string") {
          try {
            contentJson =
              JSON.parse(contentJson);
          } catch (parseError) {
            console.error(
              "Invalid content_json:",
              parseError
            );

            contentJson = {};
          }
        }

        /*
         * ==========================================
         * تجهيز الدرس
         * ==========================================
         */

        const normalizedLesson: Lesson = {
          id: found.id,

          subject_id:
            found.subject_id,

          unit_title:
            found.unit_title,

          lesson_title:
            found.lesson_title,

          content_json:
            contentJson || {},
        };

        /*
         * ==========================================
         * حفظ الدرس
         * ==========================================
         */

        setLesson(
          normalizedLesson
        );

        setLoading(false);

      } catch (err) {
        console.error(
          "Unexpected lesson error:",
          err
        );

        setError(true);
        setLoading(false);
      }
    }

    loadLesson();
  }, [id]);

  /*
   * ==========================================
   * Loading
   * ==========================================
   */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: "#0f172a",
          color: "#fff",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            📖
          </div>

          <p style={{ color: "#cbd5e1" }}>
            جاري تحميل الدرس...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ==========================================
   * Error
   * ==========================================
   */

  if (error || !lesson) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: "#0f172a",
          color: "#fff",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "448px",
            padding: "32px",
            textAlign: "center",
            backgroundColor: "#1e293b",
            borderRadius: "12px",
            border: "1px solid rgba(239,68,68,0.3)",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            😔
          </div>

          <p
            style={{
              color: "#f87171",
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            عذراً، هذا الدرس غير متوفر حالياً!
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#2563eb",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            ➡️ العودة
          </button>
        </div>
      </div>
    );
  }

  /*
   * ==========================================
   * Interactive Lesson
   * ==========================================
   */

  return (
    <div
      style={{
        minHeight: "100dvh",
        padding: "8px",
        backgroundColor: "#0f172a",
        color: "#e2e8f0",
      }}
    >
      <div style={{ width: "100%", maxWidth: "768px", margin: "0 auto" }}>
        <InteractiveLesson
          key={String(lesson.id)}
          lesson={lesson}
          stage={stage}
          setStage={setStage}
          vocabIndex={vocabIndex}
          setVocabIndex={setVocabIndex}
          onExit={() => router.back()}
        />
      </div>
    </div>
  );
}
