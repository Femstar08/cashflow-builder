import { NextResponse } from "next/server";
import { listScenarios, createScenario } from "@/lib/data/scenario-service";
import type { CashflowScenarioInsert } from "@/types/database";

export async function GET(request: Request) {
  const profileId = new URL(request.url).searchParams.get("profileId");

  if (!profileId) {
    return NextResponse.json({ error: "profileId query param required" }, { status: 400 });
  }

  try {
    const data = await listScenarios(profileId);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CashflowScenarioInsert>;

  if (!body?.profile_id || !body?.name || !body?.horizon) {
    return NextResponse.json({ error: "profile_id, name, and horizon are required" }, { status: 400 });
  }

  try {
    const data = await createScenario({
      status: "draft",
      base_assumptions: body.base_assumptions ?? {},
      user_overrides: body.user_overrides ?? {},
      ...body,
    } as CashflowScenarioInsert);

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

