import { describe, it, expect } from "vitest";
import { buildProfileDraftPrompt, buildRecommendationPrompt } from "@/lib/ai/prompts";
import { mockProfile, mockScenario, mockLineItems } from "@/lib/cashflow/mock-data";

describe("AI prompt builders", () => {
  it("buildProfileDraftPrompt includes url and optional hints", () => {
    const prompt = buildProfileDraftPrompt("https://example.com", "Fintech", "Automation tools");
    expect(prompt).toContain("https://example.com");
    expect(prompt).toContain("Fintech");
    expect(prompt).toContain("Automation tools");
  });

  it("buildRecommendationPrompt serializes data for the LLM", () => {
    const prompt = buildRecommendationPrompt({
      profile: mockProfile,
      scenario: mockScenario,
      lineItems: mockLineItems.slice(0, 2),
    });

    expect(prompt).toContain(mockProfile.name);
    expect(prompt).toContain(mockScenario.name ?? "Base");
    expect(prompt).toContain(mockLineItems[0].label);
  });
});

