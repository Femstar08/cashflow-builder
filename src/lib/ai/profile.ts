import { getOpenAIClient, getOpenAIModel } from "@/lib/ai/client";
import { buildProfileDraftPrompt } from "@/lib/ai/prompts";

type DraftResponse = {
  name: string;
  industry: string;
  description: string;
  headquarters: string;
  revenue_model: string;
};

export async function generateProfileDraft(input: {
  url?: string;
  textInput?: string;
  hint?: string;
  description?: string;
}) {
  const prompt = buildProfileDraftPrompt(input.url, input.hint, input.description, input.textInput);
  const openai = getOpenAIClient();

  if (!openai) {
    return buildFallbackDraft(input.url, input.textInput, input.hint, input.description);
  }

  try {
    const model = getOpenAIModel();
    const response = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are an FP&A copilot. Respond in JSON only." },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return buildFallbackDraft(input.url, input.textInput, input.hint, input.description);
    }

    try {
      const parsed = JSON.parse(content) as DraftResponse;
      return parsed;
    } catch {
      return buildFallbackDraft(input.url, input.textInput, input.hint, input.description);
    }
  } catch (error) {
    // Handle 403 (model access) or other API errors gracefully
    console.warn("[ai] OpenAI API error, using fallback:", (error as Error).message);
    return buildFallbackDraft(input.url, input.textInput, input.hint, input.description);
  }
}

function buildFallbackDraft(url?: string, textInput?: string, hint?: string, description?: string): DraftResponse {
  let inferredName = "New Company";

  if (url) {
    try {
      const hostname = new URL(url).hostname.replace("www.", "");
      inferredName = hostname.split(".")[0]?.replace(/[-_]/g, " ") ?? "New Company";
    } catch {
      // Invalid URL, try to extract from textInput
    }
  }

  if (textInput && inferredName === "New Company") {
    // Try to extract company name from text input
    const lines = textInput.split("\n");
    const firstLine = lines[0]?.trim();
    if (firstLine && firstLine.length < 100) {
      inferredName = firstLine;
    } else {
      // Look for common patterns like "Company Name is..." or "About Company Name"
      const nameMatch = textInput.match(/(?:^|\s)([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Ltd|Corp|Corporation|Company)?)/);
      if (nameMatch) {
        inferredName = nameMatch[1].trim();
      }
    }
  }

  // Use description if provided, otherwise use textInput (truncated if too long), otherwise use default
  let finalDescription = description;
  if (!finalDescription && textInput) {
    // Truncate textInput if it's very long to use as description
    finalDescription = textInput.length > 500 ? textInput.substring(0, 500) + "..." : textInput;
  }
  if (!finalDescription) {
    finalDescription = `${capitalizeWords(inferredName)} delivers intelligent automations for finance and operations teams.`;
  }

  return {
    name: capitalizeWords(inferredName),
    industry: hint ?? "SaaS",
    description: finalDescription,
    headquarters: "Remote",
    revenue_model: "Subscription",
  };
}

function capitalizeWords(input: string) {
  return input.replace(/\b\w/g, (char) => char.toUpperCase());
}

