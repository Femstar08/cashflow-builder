import { NextResponse } from "next/server";
import { listProfiles, createProfile } from "@/lib/data/profile-service";
import type { BusinessProfileInsert } from "@/types/database";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ownerId = searchParams.get("ownerId");

  if (!ownerId) {
    return NextResponse.json({ error: "ownerId query param required" }, { status: 400 });
  }

  try {
    const data = await listProfiles(ownerId);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<BusinessProfileInsert>;

  if (!body?.owner_id || !body?.name) {
    return NextResponse.json({ error: "owner_id and name are required" }, { status: 400 });
  }

  try {
    const data = await createProfile({
      raw_profile_json: {},
      ...body,
    } as BusinessProfileInsert);

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

