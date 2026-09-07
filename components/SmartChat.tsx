"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

type Msg = { role: "user" | "bot"; text: string; sources?: any[]; provider?: string };

export default function SmartChat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "أهلاً بك في **المساعد الذكي** للشهادة السودانية! 🇸🇩\n\nأنا أبحث الآن في **كتبك ودروسك الحقيقية** وأجاوبك منها.\n\nجرّب تسأل:\n• اشرح لي درس المصفوفات\n• ما قانون نيوتن الثاني؟\n• عايز نموذج امتحان إنجليزي\n• اشرح لي قواعد اللغة العربية",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Msg = { role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ");

      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: data.answer,
          sources: data.sources,
          provider: data.provider,
        },
      ]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: "⚠️ عذراً، حدث خطأ مؤقت. تأكد من الاتصال وحاول مرة أخرى. إذا لم يكن لديك مفتاح AI، سأعمل في الوضع التجريبي.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "12px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "520px",
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
            width: "36px",
            height: "36px",
            borderRadius: "999px",
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          🤖
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: "bold", fontSize: "13px" }}>
            المساعد الذكي — يجيب من كتبك ودروسك
          </div>
          <div style={{ color: "#22c55e", fontSize: "11px" }}>● متصل • يبحث في Supabase</div>
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "#94a3b8",
            backgroundColor: "#334155",
            padding: "4px 8px",
            borderRadius: "999px",
          }}
        >
          ذكي
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
          gap: "12px",
          backgroundColor: "#0f172a",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div
              className="chat-markdown"
              style={{
                maxWidth: "86%",
                padding: "11px 13px",
                borderRadius: m.role === "user" ? "14px 14px 0 14px" : "14px 14px 14px 0",
                backgroundColor: m.role === "user" ? "#2563eb" : "#1e293b",
                color: m.role === "user" ? "#fff" : "#e2e8f0",
                fontSize: "13px",
                lineHeight: 1.7,
                border: m.role === "bot" ? "1px solid #334155" : "none",
                boxShadow: m.role === "bot" ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
              }}
            >
              {m.role === "bot" ? (
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {m.text}
                </ReactMarkdown>
              ) : (
                <span style={{ whiteSpace: "pre-wrap" }}>{m.text}</span>
              )}
            </div>
            {m.sources && m.sources.length > 0 && (
              <div style={{ maxWidth: "86%", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {m.sources.map((s: any, idx: number) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: "10px",
                      backgroundColor: "#172554",
                      border: "1px solid #3b82f6",
                      color: "#93c5fd",
                      padding: "4px 8px",
                      borderRadius: "999px",
                    }}
                  >
                    📖 {s.title} • {s.unit}
                  </span>
                ))}
              </div>
            )}
            {m.provider && (
              <div style={{ fontSize: "10px", color: "#64748b", padding: "0 4px" }}>
                {m.provider === "groq" && "⚡ عبر Groq"}
                {m.provider === "gemini" && "✨ عبر Gemini"}
                {m.provider === "openai" && "🧠 عبر OpenAI"}
                {m.provider === "fallback" && "🔧 وضع تجريبي — الذكاء الاصطناعي غير متاح حالياً"}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div
            style={{
              alignSelf: "flex-start",
              padding: "10px 14px",
              borderRadius: "12px",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            ⏳ يبحث في الكتب والدروس...
          </div>
        )}
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
          placeholder="اكتب سؤالك من أي مادة..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: "999px",
            border: "1px solid #334155",
            backgroundColor: "#1e293b",
            color: "#fff",
            fontSize: "13px",
            outline: "none",
            opacity: loading ? 0.6 : 1,
          }}
        />
        <button
          onClick={send}
          disabled={loading}
          style={{
            padding: "0 20px",
            borderRadius: "999px",
            border: "none",
            backgroundColor: loading ? "#475569" : "#2563eb",
            color: "#fff",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "..." : "إرسال"}
        </button>
      </div>
    </div>
  );
}
