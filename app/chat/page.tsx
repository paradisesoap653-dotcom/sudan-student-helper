import type { Metadata } from "next";
import SmartChat from "@/components/SmartChat";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الدردشة - مساعد الشهادة السودانية",
  description: "دردشة مساعد الطالب - اسأل عن أي مادة",
};

export default function ChatPage({
  searchParams,
}: {
  searchParams: { subject?: string };
}) {
  const subjectId = searchParams?.subject || null;

  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100dvh",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        fontFamily: "Arial, sans-serif",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {/* رأس الصفحة */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#38bdf8",
              textDecoration: "none",
              fontSize: "14px",
              padding: "8px 0",
            }}
          >
            ➡️ العودة للرئيسية
          </Link>
        </div>

        <div
          style={{
            backgroundColor: "#1e293b",
            borderRadius: "16px",
            padding: "16px",
            border: "1px solid #334155",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>💬</div>
          <h1 style={{ margin: 0, fontSize: "20px", color: "#fff" }}>
            دردشة مساعد الشهادة السودانية
          </h1>
          <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "13px", lineHeight: 1.6 }}>
            اسأل عن أي مادة — الرياضيات، الفيزياء، الكيمياء، اللغة العربية والإنجليزية
          </p>
          <div
            style={{
              marginTop: "10px",
              display: "inline-flex",
              gap: "6px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                backgroundColor: "#14532d",
                border: "1px solid #22c55e",
                color: "#bbf7d0",
                padding: "5px 10px",
                borderRadius: "999px",
              }}
            >
              ● متاح 24/7
            </span>
          </div>
        </div>

        {/* المساعد الذكي - يجيب من كتبك ودروسك */}
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              fontSize: "13px",
              color: "#fbbf24",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: "bold",
            }}
          >
            <span>⭐</span> المساعد الذكي — يجيب من كتبك ودروسك
          </div>
          <SmartChat subjectId={subjectId} />
        </div>

        {/* طريقة التضمين كتبويب رابع */}
        <div
          style={{
            marginTop: "16px",
            display: "flex",
            gap: "8px",
            flexDirection: "column",
          }}
        >
          <Link
            href="/"
            style={{
              textAlign: "center",
              padding: "12px",
              borderRadius: "10px",
              backgroundColor: "#334155",
              color: "#fff",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "13px",
            }}
          >
            العودة للمواد والكتب 📚
          </Link>
        </div>
      </div>
    </main>
  );
}
