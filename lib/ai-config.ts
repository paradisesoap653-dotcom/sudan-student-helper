// Server-side configuration shared by /api/chat and /api/health.
// Read at request time so health never reports build-time environment values.
export const AI_PROVIDER_ORDER = ["groq", "gemini", "openai"] as const;
export type AIProvider = (typeof AI_PROVIDER_ORDER)[number];
export type ProviderConfig = { apiKey: string; model: string };

export function getAIConfig(): Record<AIProvider, ProviderConfig> {
  return {
    groq: {
      apiKey: process.env.GROQ_API_KEY?.trim() || "",
      model: process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-20b",
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY?.trim() || "",
      model: (process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash").replace(/^models\//, ""),
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY?.trim() || "",
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    },
  };
}

// Only these explicitly selected, non-secret fields may be returned to clients.
// "configured" means a key is present, not that an upstream request succeeded.
export function getAIStatus() {
  const config = getAIConfig();
  const preferredProvider = AI_PROVIDER_ORDER.find((name) => config[name].apiKey);

  return {
    mode: preferredProvider ? "ai" : "fallback",
    preferredProvider: preferredProvider || "fallback",
    providerOrder: AI_PROVIDER_ORDER,
    providers: Object.fromEntries(
      AI_PROVIDER_ORDER.map((name) => [
        name,
        { configured: Boolean(config[name].apiKey), model: config[name].model },
      ])
    ),
  };
}
