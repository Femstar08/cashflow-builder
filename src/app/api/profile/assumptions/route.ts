import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import type { ProfileAssumptionInsert } from "@/types/database";
import { logger } from "@/lib/logger";
import { validateUUID, validateString } from "@/lib/validation";
import { getCacheHeaders } from "@/lib/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    const status = searchParams.get("status"); // "active" | "all"

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
      logger.warn('Invalid profileId in assumptions GET', { profileId });
      return NextResponse.json(
        { error: "Invalid profile ID format" },
        { status: 400 }
      );
    }

    // Validate status parameter if provided
    if (status && status !== "active" && status !== "all") {
      return NextResponse.json(
        { error: "Status must be 'active' or 'all'" },
        { status: 400 }
      );
    }

    // Fetch assumptions for the profile
    const admin = getSupabaseAdmin();
    let query = admin
      .from("cf_profile_assumptions")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (status === "active") {
      query = query.neq("status", "superseded");
    }

    const { data: assumptionsData, error } = await query;

    if (error) {
      logger.error('Failed to fetch assumptions', error, { profileId, status });
      throw new Error(`Failed to fetch assumptions: ${error.message}`);
    }

    const assumptions = (assumptionsData || []).map((assumption: any) => ({
      id: assumption.id,
      profile_id: assumption.profile_id,
      assumption: assumption.assumption,
      reason: assumption.reason,
      category: assumption.category,
      status: assumption.status || "active",
      updated_by_assumption_id: assumption.updated_by_assumption_id,
      created_at: assumption.created_at,
      created_by: assumption.created_by,
    }));

    return NextResponse.json(
      { assumptions },
      { headers: getCacheHeaders(60) } // Cache for 60 seconds
    );
  } catch (error) {
    logger.error("Error fetching assumptions", error);
    return NextResponse.json(
      {
        error: "Failed to fetch assumptions",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, assumption, reason, category, createdBy } = body;

    if (!profileId || !assumption) {
      return NextResponse.json(
        { error: "Profile ID and assumption are required" },
        { status: 400 }
      );
    }

    // Validate inputs
    try {
      validateUUID(profileId, 'profileId');
      validateString(assumption, { 
        fieldName: 'assumption', 
        minLength: 1, 
        maxLength: 1000 
      });
      if (reason) {
        validateString(reason, { 
          fieldName: 'reason', 
          minLength: 1, 
          maxLength: 500,
          required: false 
        });
      }
      if (category) {
        validateString(category, { 
          fieldName: 'category', 
          minLength: 1, 
          maxLength: 50,
          required: false 
        });
      }
    } catch (error) {
      logger.warn('Invalid input in assumptions POST', { profileId, error });
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }

    const assumptionId = crypto.randomUUID();
    const admin = getSupabaseAdmin();

    // Insert assumption
    const { data: insertedAssumption, error: insertError } = await admin
      .from("cf_profile_assumptions")
      .insert({
        id: assumptionId,
        profile_id: profileId,
        assumption,
        reason: reason || null,
        category: category || null,
        status: "active",
        created_by: createdBy || "agent",
      } as ProfileAssumptionInsert)
      .select()
      .single();

    if (insertError) {
      logger.error('Failed to insert assumption', insertError, { profileId, assumptionId });
      throw new Error(`Failed to insert assumption: ${insertError.message}`);
    }

    // Create activity log entry
    (async () => {
      try {
        await admin
          .from("cf_profile_activities")
          .insert({
            id: crypto.randomUUID(),
            profile_id: profileId,
            user_id: createdBy || "system",
            activity_type: "assumption_added",
            description: `Assumption added: ${assumption}`,
            metadata: {
              assumption_id: assumptionId,
              category: category || "other",
            },
          });
      } catch (error: unknown) {
        logger.error("Error creating activity log", error, { profileId, assumptionId });
      }
    })();

    return NextResponse.json({
      success: true,
      assumption: {
        id: assumptionId,
        profile_id: profileId,
        assumption,
        reason,
        category,
        status: "active",
        created_at: new Date().toISOString(),
        created_by: createdBy || "agent",
      },
    });
  } catch (error) {
    logger.error("Error creating assumption", error);
    return NextResponse.json(
      {
        error: "Failed to create assumption",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { assumptionId, status, updatedByAssumptionId } = body;

    if (!assumptionId || !status) {
      return NextResponse.json(
        { error: "Assumption ID and status are required" },
        { status: 400 }
      );
    }

    // Validate inputs
    try {
      validateUUID(assumptionId, 'assumptionId');
      const validStatuses = ['active', 'updated', 'superseded'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
      }
      if (updatedByAssumptionId) {
        validateUUID(updatedByAssumptionId, 'updatedByAssumptionId');
      }
    } catch (error) {
      logger.warn('Invalid input in assumptions PATCH', { assumptionId, status, error });
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }

    // Update assumption status
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("cf_profile_assumptions")
      .update({
        status,
        updated_by_assumption_id: updatedByAssumptionId || null,
      })
      .eq("id", assumptionId);

    if (error) {
      logger.error('Failed to update assumption', error, { assumptionId, status });
      throw new Error(`Failed to update assumption: ${error.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error updating assumption", error);
    return NextResponse.json(
      {
        error: "Failed to update assumption",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

