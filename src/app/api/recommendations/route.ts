import { NextResponse } from "next/server";
import { listRecommendations, createRecommendation } from "@/lib/data/recommendation-service";
import type { AiRecommendationInsert } from "@/types/database";

export async function GET(request: Request) {
  const scenarioId = new URL(request.url).searchParams.get("scenarioId");

  if (!scenarioId) {
    return NextResponse.json({ error: "scenarioId query param required" }, { status: 400 });
  }

  try {
    const data = await listRecommendations(scenarioId);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AiRecommendationInsert>;

  if (!body?.scenario_id || !body?.summary || !body?.source) {
    return NextResponse.json({ error: "scenario_id, summary, and source are required" }, { status: 400 });
  }

  try {
    const data = await createRecommendation({
      accepted: false,
      ...body,
    } as AiRecommendationInsert);

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

