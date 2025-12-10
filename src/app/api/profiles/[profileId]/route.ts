import { NextResponse } from "next/server";
import { getProfile } from "@/lib/supabase/service";
import { logger } from "@/lib/logger";
import { validateUUID } from "@/lib/validation";
import { getCacheHeaders } from "@/lib/cache";

type RouteParams = {
  params: Promise<{ profileId: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { profileId } = await params;

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    // Validate profileId is a valid UUID
    try {
      validateUUID(profileId, 'profileId');
    } catch (error) {
      logger.warn('Invalid profileId in profiles GET', { profileId });
      return NextResponse.json(
        { error: "Invalid profile ID format" },
        { status: 400 }
      );
    }

    const profile = await getProfile(profileId);
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404, headers: getCacheHeaders(60) }
      );
    }

    return NextResponse.json(
      { profile },
      { headers: getCacheHeaders(60) } // Cache for 60 seconds
    );
  } catch (error) {
    logger.error("Error fetching profile", error);
    return NextResponse.json(
      { error: "Failed to fetch profile", message: (error as Error).message },
      { status: 500 }
    );
  }
}

