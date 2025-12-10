import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  if (client) return client;

  const apiKey = process.env.OPENAI_API_KEY;
  const projectId = process.env.OPENAI_PROJECT_ID || "proj_JLWAk4cZN1C4i2H4uxTGzJFT";

  if (!apiKey) {
    console.warn("[ai] OPENAI_API_KEY is not configured. Falling back to mock responses.");
    return null;
  }

  client = new OpenAI({ 
    apiKey,
    defaultHeaders: {
      "OpenAI-Project": projectId,
    },
  });
  return client;
}

export function getOpenAIModel(): string {
  // Allow model to be configured via environment variable
  // Default to gpt-4o which is commonly available
  // Available models: gpt-5.1, gpt-5-mini, gpt-5-nano, gpt-4.1, gpt-4.1-mini, gpt-4.1-nano, o3, o4-mini, gpt-4o, gpt-4o-realtime-preview
  return process.env.OPENAI_MODEL || "gpt-4o";
}

