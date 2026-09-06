import type { Metadata } from "next";
import GabsterEmbedded from "@/components/GabsterEmbedded";
import LocalChatFallback from "@/components/LocalChatFallback";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الدردشة - مساعد الشهادة السودانية",
  description: "دردشة مساعد الطالب - اسأل عن أي مادة",
};

export default function ChatPage() {
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
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                color: "#cbd5e1",
                padding: "5px 10px",
                borderRadius: "999px",
              }}
            >
              🤖 Gabster
            </span>
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

        {/* لوحة Gabster المضمنة */}
        <div style={{ marginBottom: "6px" }}>
          <div
            style={{
              fontSize: "13px",
              color: "#94a3b8",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🟦</span> لوحة Gabster المضمّنة (داخل الصفحة)
          </div>
          <GabsterEmbedded />
        </div>

        {/* دردشة بديلة محلية */}
        <div style={{ marginTop: "18px" }}>
          <div
            style={{
              fontSize: "13px",
              color: "#94a3b8",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🟩</span> دردشة بديلة (تظهر فوراً حتى لو Gabster محجوب)
          </div>
          <LocalChatFallback />
        </div>

        {/* ملاحظة */}
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "10px",
            fontSize: "12px",
            color: "#94a3b8",
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: "#fbbf24" }}>💡 ملاحظة:</strong> لوحة Gabster تحتاج أن يكون
          الدومين مسموح في إعدادات Gabster. إذا لم تظهر، تأكد من إضافة دومين Vercel الخاص بك
          (مثلاً <code style={{ color: "#38bdf8" }}>*.vercel.app</code>) في لوحة تحكم Gabster.
          <br />
          الدردشة البديلة تعمل دائماً بدون إعداد إضافي.
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
