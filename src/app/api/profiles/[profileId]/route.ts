import { NextResponse } from "next/server";
import { getProfile } from "@/lib/instantdb/service";

type RouteParams = {
  params: Promise<{ profileId: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const { profileId } = await params;

  if (!profileId) {
    return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
  }

  try {
    const profile = await getProfile(profileId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch profile", message: (error as Error).message },
      { status: 500 }
    );
  }
}

