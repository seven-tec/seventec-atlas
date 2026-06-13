export type AiProvider = "openrouter" | "openai";

export type AiProviderConfig = {
  provider: AiProvider;
  apiKey: string | null;
  model: string;
  isConfigured: boolean;
  label: string;
};

export function getAiProviderConfig(): AiProviderConfig {
  const provider = (process.env.AI_PROVIDER || "openrouter") as AiProvider;

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY || null;
    return {
      provider,
      apiKey,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      isConfigured: !!apiKey && apiKey !== "replace-me",
      label: "OpenAI",
    };
  }

  const apiKey = process.env.OPENROUTER_API_KEY || null;
  return {
    provider: "openrouter",
    apiKey,
    model: process.env.OPENROUTER_MODEL || "openrouter/auto",
    isConfigured: !!apiKey && apiKey !== "replace-me",
    label: "OpenRouter",
  };
}
