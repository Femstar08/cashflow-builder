import { NextResponse } from "next/server";
import * as profileService from "@/lib/data/profile-service";
import * as scenarioService from "@/lib/data/scenario-service";
import * as lineItemService from "@/lib/data/line-item-service";
import * as recommendationService from "@/lib/data/recommendation-service";
import * as eventService from "@/lib/data/event-service";
import {
  mockProfile,
  mockScenario,
  mockLineItems,
  mockRecommendations,
} from "@/lib/cashflow/mock-data";

export async function GET(request: Request) {
  const profileId = new URL(request.url).searchParams.get("profileId") ?? mockProfile.id;

  try {
    const profile = await profileService.getProfile(profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const scenarios = await scenarioService.listScenarios(profileId);
    if (!scenarios.length) {
      throw new Error("No scenarios found");
    }

    const scenarioId = scenarios[0].id;
    const lineItems = await lineItemService.listLineItems(scenarioId);
    const recommendations = await recommendationService.listRecommendations(scenarioId);
    const events = await eventService.listEvents(profileId);

    return NextResponse.json({
      data: {
        profile,
        scenario: scenarios[0],
        lineItems,
        recommendations,
        events,
      },
      fallback: false,
    });
  } catch (error) {
    console.warn("[dashboard-route] Falling back to mock data:", (error as Error).message);

    return NextResponse.json({
      data: {
        profile: mockProfile,
        scenario: mockScenario,
        lineItems: mockLineItems,
        recommendations: mockRecommendations,
        events: [],
      },
      fallback: true,
    });
  }
}

