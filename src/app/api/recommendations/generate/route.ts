import { NextResponse } from "next/server";
import * as profileService from "@/lib/data/profile-service";
import * as scenarioService from "@/lib/data/scenario-service";
import * as lineItemService from "@/lib/data/line-item-service";
import {
  mockLineItems,
  mockProfile,
  mockScenario,
} from "@/lib/cashflow/mock-data";
import { generateScenarioRecommendations } from "@/lib/ai/recommendations";

export async function POST(request: Request) {
  const { profileId, scenarioId } = (await request.json()) as {
    profileId?: string;
    scenarioId?: string;
  };

  try {
    if (!profileId || !scenarioId) {
      throw new Error("profileId and scenarioId required");
    }

    const profile = await profileService.getProfile(profileId);
    if (!profile) throw new Error("Profile missing");

    const scenarios = await scenarioService.listScenarios(profileId);
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) throw new Error("Scenario missing");

    const lineItems = await lineItemService.listLineItems(scenarioId);

    const recommendations = await generateScenarioRecommendations({
      profile,
      scenario,
      lineItems: lineItems ?? [],
    });

    return NextResponse.json({ recommendations, fallback: false });
  } catch (error) {
    const recommendations = await generateScenarioRecommendations({
      profile: mockProfile,
      scenario: mockScenario,
      lineItems: mockLineItems,
    });

    return NextResponse.json({
      recommendations,
      fallback: true,
      error: (error as Error).message,
    });
  }
}

