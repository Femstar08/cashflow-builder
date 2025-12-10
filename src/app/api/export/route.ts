import { NextResponse } from "next/server";
import * as profileService from "@/lib/data/profile-service";
import * as scenarioService from "@/lib/data/scenario-service";
import * as lineItemService from "@/lib/data/line-item-service";
import * as eventService from "@/lib/data/event-service";
import {
  mockLineItems,
  mockProfile,
  mockScenario,
} from "@/lib/cashflow/mock-data";
import { buildCashflowWorkbook } from "@/lib/export/excel";

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
    if (!profile) {
      throw new Error("Profile not found");
    }

    const scenarios = await scenarioService.listScenarios(profileId);
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) {
      throw new Error("Scenario not found");
    }

    const lineItems = await lineItemService.listLineItems(scenarioId);
    if (!lineItems) {
      throw new Error("Line items not found");
    }

    const events = await eventService.listEvents(profileId);

    const buffer = await buildCashflowWorkbook({ profile, scenario, lineItems, events });
    return buildExcelResponse(buffer, scenario.name);
  } catch (error) {
    const buffer = await buildCashflowWorkbook({
      profile: mockProfile,
      scenario: mockScenario,
      lineItems: mockLineItems,
      events: [],
    });

    return buildExcelResponse(buffer, mockScenario.name, (error as Error).message);
  }
}

function buildExcelResponse(buffer: ArrayBuffer, scenarioName: string, warning?: string) {
  const res = new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${scenarioName.replace(/\s+/g, "-").toLowerCase()}-cashflow.xlsx"`,
    },
  });

  if (warning) {
    res.headers.set("X-Export-Warning", warning);
  }

  return res;
}

