"use client";

import { useState, useRef, useEffect } from "react";

type Msg = { role: "user" | "bot"; text: string };

const BOT_REPLIES: Record<string, string> = {
  مرحبا: "مرحباً بك! 👋 أنا مساعد الشهادة السودانية. كيف أساعدك اليوم؟ يمكنك سؤالي عن الرياضيات، الفيزياء، اللغة العربية، أو أي مادة.",
  سلام: "وعليكم السلام ورحمة الله! كيف أقدر أساعدك في المذاكرة؟",
  رياضيات: "الرياضيات المتخصصة فيها جزئين. هل تريد شرح قوانين التفاضل، التكامل، المصفوفات، أم حل مسائل؟",
  فيزياء: "الفيزياء 4 أجزاء. أي فصل تريد؟ الحركة، الكهرباء، الضوء، أم النووية؟",
  كيمياء: "الكيمياء — هل تحتاج شرح المعادلات، التحليل، أم العضوية؟",
  انجليزي: "اللغة الإنجليزية — عندنا 5 نماذج امتحانات كاملة مع الحلول. هل تريد نبدأ بدرس تفاعلي؟",
  عربي: "اللغة العربية — فيها 5 كتب: اللغة العربية، المطالعة والأدب، البلاغة، القواعد، الدراسات اللغوية. أي كتاب تريد؟",
};

function getBotReply(input: string): string {
  const lower = input.trim().toLowerCase();
  for (const key in BOT_REPLIES) {
    if (lower.includes(key)) return BOT_REPLIES[key];
  }
  if (lower.includes("امتحان") || lower.includes("نموذج")) {
    return "عندنا نماذج امتحانات 2027 للغة الإنجليزية (5 نماذج + الحلول). تقدر تلقاها في تبويب الامتحانات داخل أي مادة. هل تريد أفتحها لك؟";
  }
  if (lower.includes("مساعدة") || lower.includes("ساعدني")) {
    return "أكيد! قل لي المادة والدرس، وأنا أشرح لك خطوة بخطوة. مثلاً: 'اشرح لي التفاضل' أو 'حل لي مسألة فيزياء'.";
  }
  return "شكراً لسؤالك! 🙏 أنا مساعد تجريبي يعمل بدون إنترنت. في النسخة الحقيقية المرتبطة بـ Gabster سأكون أذكى وأجاوب من كتب الوزارة مباشرة. جرب تسأل: 'مرحبا' أو 'رياضيات' أو 'فيزياء'.";
}

export default function LocalChatFallback() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "أهلاً بك في دردشة مساعد الشهادة السودانية! 🇸🇩\n\nهذه دردشة بديلة تعمل حتى لو كان Gabster محجوب في المعاينة. بعد النشر ستعمل دردشة Gabster الحقيقية.\n\nجرب ترسل: مرحبا، رياضيات، فيزياء، انجليزي" },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Msg = { role: "user", text };
    const botMsg: Msg = { role: "bot", text: getBotReply(text) };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTimeout(() => setMessages((m) => [...m, botMsg]), 500);
  };

  return (
    <div
      style={{
        marginTop: "16px",
        backgroundColor: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "12px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "420px",
      }}
    >
      <div
        style={{
          padding: "12px 14px",
          backgroundColor: "#0f172a",
          borderBottom: "1px solid #334155",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "999px",
            backgroundColor: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
          }}
        >
          🤖
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: "bold", fontSize: "13px" }}>
            مساعد الشهادة (بديل محلي)
          </div>
          <div style={{ color: "#22c55e", fontSize: "11px" }}>● متصل الآن</div>
        </div>
        <div
          style={{
            marginRight: "auto",
            fontSize: "10px",
            color: "#94a3b8",
            backgroundColor: "#334155",
            padding: "4px 8px",
            borderRadius: "999px",
          }}
        >
          تجريبي
        </div>
      </div>

      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "82%",
              padding: "10px 12px",
              borderRadius: m.role === "user" ? "12px 12px 0 12px" : "12px 12px 12px 0",
              backgroundColor: m.role === "user" ? "#2563eb" : "#0f172a",
              color: m.role === "user" ? "#fff" : "#e2e8f0",
              fontSize: "13px",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              border: m.role === "bot" ? "1px solid #334155" : "none",
            }}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div
        style={{
          padding: "10px",
          backgroundColor: "#0f172a",
          borderTop: "1px solid #334155",
          display: "flex",
          gap: "8px",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="اكتب سؤالك هنا..."
          style={{
            flex: 1,
            padding: "11px 12px",
            borderRadius: "999px",
            border: "1px solid #334155",
            backgroundColor: "#1e293b",
            color: "#fff",
            fontSize: "13px",
            outline: "none",
          }}
        />
        <button
          onClick={send}
          style={{
            padding: "0 18px",
            borderRadius: "999px",
            border: "none",
            backgroundColor: "#2563eb",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          إرسال
        </button>
      </div>
    </div>
  );
}
