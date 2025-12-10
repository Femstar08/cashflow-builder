import { NextResponse } from "next/server";
import { listLineItems, createLineItem, deleteLineItem } from "@/lib/data/line-item-service";
import type { LineItemInsert } from "@/types/database";

export async function GET(request: Request) {
  const scenarioId = new URL(request.url).searchParams.get("scenarioId");

  if (!scenarioId) {
    return NextResponse.json({ error: "scenarioId query param required" }, { status: 400 });
  }

  try {
    const data = await listLineItems(scenarioId);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<LineItemInsert>;

  if (!body?.scenario_id || !body?.type || !body?.label) {
    return NextResponse.json({ error: "scenario_id, type, and label are required" }, { status: 400 });
  }

  try {
    const data = await createLineItem({
      monthly_values: body.monthly_values ?? [],
      metadata: body.metadata ?? {},
      ...body,
    } as LineItemInsert);

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }

  try {
    await deleteLineItem(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

