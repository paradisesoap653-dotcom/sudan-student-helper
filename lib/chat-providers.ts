import { AI_PROVIDER_ORDER, getAIConfig, type AIProvider, type ProviderConfig } from "./ai-config";

export type ChatMessage = { role: "user" | "bot"; text: string };
export const MAX_MESSAGE_LENGTH = 8_000;
const PROVIDER_TIMEOUT_MS = 15_000;

type CompletionResponse = {
  choices?: { message?: { content?: unknown } }[];
};
type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: unknown; thought?: boolean }[] } }[];
};

export function normalizeHistory(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (message): message is ChatMessage =>
        message != null &&
        (message.role === "user" || message.role === "bot") &&
        typeof message.text === "string" &&
        Boolean(message.text.trim())
    )
    .slice(-6)
    .map((message) => ({
      role: message.role,
      text: message.text.trim().slice(0, MAX_MESSAGE_LENGTH),
    }));
}

async function requestJSON<T>(provider: AIProvider, url: string, init: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    });
    if (!response.ok) {
      // Never log response bodies, API keys, URLs with credentials, or student prompts.
      console.error(`[chat] ${provider} request failed (HTTP ${response.status})`);
      return null;
    }
    return await response.json();
  } catch {
    console.error(`[chat] ${provider} request failed or timed out`);
    return null;
  }
}

function systemPrompt(context: string) {
  return `أنت مساعد الشهادة السودانية 🇸🇩. أستاذ خبير تشرح ببساطة باللهجة السودانية والعربية الفصحى المبسطة، مع أمثلة وحلول خطوة بخطوة. تلتزم بالمنهج السوداني. تذكر المصادر (اسم الكتاب/الدرس) عند الإجابة من السياق.

السياق من قاعدة البيانات:
${context}

قواعد:
- أجب بالعربية (اسمح بالإنجليزية عند شرح الإنجليزية)
- بسّط الشرح، استخدم نقاط وترقيم
- إذا كان السؤال عن حل مسألة، اشرح الخطوات
- لا تخترع مراجع غير موجودة
- إذا لا تعرف، قل بصراحة واقترح مراجعة الكتاب
- عند كتابة أي معادلة أو رمز رياضي، استخدم صيغة $ للمعادلة داخل السطر (مثل $x^2$) وصيغة $$ للمعادلة في سطر منفصل (مثل $$x = \\frac{-b}{2a}$$). لا تستخدم الأقواس المربعة [ ] أو \\( \\) لكتابة المعادلات أبداً.
- داخل خلايا الجداول (Markdown tables)، لا تستخدم وسم <br> للفصل بين النقاط؛ استخدم فاصلة (،) أو فاصلة منقوطة (؛) بدلاً من ذلك، لأن الجدول لا يدعم وسوم HTML لفواصل الأسطر.`;
}

async function callCompletion(
  provider: "groq" | "openai",
  config: ProviderConfig,
  prompt: string,
  context: string,
  history: ChatMessage[]
): Promise<string | null> {
  const messages = [
    { role: "system", content: systemPrompt(context) },
    ...history.map((message) => ({
      role: message.role === "bot" ? "assistant" : "user",
      content: message.text,
    })),
    { role: "user", content: prompt },
  ];
  const json = await requestJSON<CompletionResponse>(
    provider,
    provider === "groq"
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0.7,
        ...(provider === "groq"
          ? {
              max_completion_tokens: 2_048,
              // GPT-OSS needs a budget for reasoning as well as the final answer.
              ...(config.model.startsWith("openai/gpt-oss-")
                ? { reasoning_effort: "low", include_reasoning: false }
                : {}),
            }
          : { max_tokens: 900 }),
      }),
    }
  );
  const text = json?.choices?.[0]?.message?.content;
  return typeof text === "string" ? text.trim() || null : null;
}

async function callGemini(
  config: ProviderConfig,
  prompt: string,
  context: string,
  history: ChatMessage[]
): Promise<string | null> {
  const historyText = history
    .slice(-4)
    .map((message) => `${message.role === "bot" ? "المساعد" : "الطالب"}: ${message.text}`)
    .join("\n");
  const json = await requestJSON<GeminiResponse>(
    "gemini",
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent`,
    {
      method: "POST",
      // Keep the key out of URLs, access logs, and error messages.
      headers: { "Content-Type": "application/json", "x-goog-api-key": config.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt(context) }] },
        contents: [
          {
            role: "user",
            parts: [{ text: `سجل المحادثة:\n${historyText}\n\nسؤال الطالب الحالي: ${prompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 900,
          // With a short output budget, 2.5 Flash thinking can consume all tokens
          // before producing an answer. Don't send this option to other models.
          ...(config.model === "gemini-2.5-flash" || config.model === "gemini-2.5-flash-lite"
            ? { thinkingConfig: { thinkingBudget: 0 } }
            : {}),
        },
      }),
    }
  );
  const parts = json?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;
  return parts
    .filter((part) => part && !part.thought && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim() || null;
}

export async function generateChatAnswer(
  prompt: string,
  context: string,
  history: ChatMessage[]
): Promise<{ answer: string; provider: AIProvider } | null> {
  const config = getAIConfig();
  for (const provider of AI_PROVIDER_ORDER) {
    if (!config[provider].apiKey) continue;
    const answer = provider === "gemini"
      ? await callGemini(config[provider], prompt, context, history)
      : await callCompletion(provider, config[provider], prompt, context, history);
    if (answer) return { answer, provider };
  }
  return null;
          }
