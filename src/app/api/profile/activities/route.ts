import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import { validateUUID } from "@/lib/validation";
import { getCacheHeaders } from "@/lib/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      );
    }

    // Validate profileId is a valid UUID
    try {
      validateUUID(profileId, 'profileId');
    } catch (error) {
      logger.warn('Invalid profileId in activities GET', { profileId });
      return NextResponse.json(
        { error: "Invalid profile ID format" },
        { status: 400 }
      );
    }

    // Fetch activities for the profile
    const admin = getSupabaseAdmin();
    const { data: activitiesData, error } = await admin
      .from("cf_profile_activities")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      logger.error('Failed to fetch activities', error, { profileId });
      throw new Error(`Failed to fetch activities: ${error.message}`);
    }

    const activities = (activitiesData || []).map((activity: any) => ({
      id: activity.id,
      profile_id: activity.profile_id,
      user_id: activity.user_id,
      activity_type: activity.activity_type,
      description: activity.description,
      metadata: activity.metadata,
      created_at: activity.created_at,
    }));

    return NextResponse.json(
      { activities },
      { headers: getCacheHeaders(30) } // Cache for 30 seconds (activities change frequently)
    );
  } catch (error) {
    logger.error("Error fetching activities", error);
    return NextResponse.json(
      {
        error: "Failed to fetch activities",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

