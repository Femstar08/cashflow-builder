import { NextResponse } from "next/server";

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

async function instantRequest(endpoint: string, options: RequestInit = {}) {
  if (!INSTANT_APP_ID || !INSTANT_ADMIN_TOKEN) {
    return { data: null };
  }

  const url = `https://api.instant.dev/v1/${INSTANT_APP_ID}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${INSTANT_ADMIN_TOKEN}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.warn("[InstantDB] Request failed:", error);
    return { data: null };
  }
}

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

    // Fetch assumptions for the profile
    const result = await instantRequest("/query", {
      method: "POST",
      body: JSON.stringify({
        query: {
          profile_assumptions: {
            $: {
              where: {
                profile_id: profileId,
                ...(status === "active" ? { status: { $ne: "superseded" } } : {}),
              },
              orderBy: { created_at: "desc" },
            },
            id: true,
            profile_id: true,
            assumption: true,
            reason: true,
            category: true,
            status: true,
            updated_by_assumption_id: true,
            created_at: true,
            created_by: true,
          },
        },
      }),
    });

    const assumptions = (result.data?.profile_assumptions || []).map((assumption: any) => ({
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

    return NextResponse.json({ assumptions });
  } catch (error) {
    console.error("Error fetching assumptions:", error);
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

    const assumptionId = crypto.randomUUID();

    // Insert assumption
    await instantRequest("/transact", {
      method: "POST",
      body: JSON.stringify({
        operations: [
          {
            type: "insert",
            table: "profile_assumptions",
            data: {
              id: assumptionId,
              profile_id: profileId,
              assumption,
              reason: reason || undefined,
              category: category || undefined,
              status: "active",
              created_at: new Date().toISOString(),
              created_by: createdBy || "agent",
            },
          },
        ],
      }),
    });

    // Create activity log entry
    await instantRequest("/transact", {
      method: "POST",
      body: JSON.stringify({
        operations: [
          {
            type: "insert",
            table: "profile_activities",
            data: {
              id: crypto.randomUUID(),
              profile_id: profileId,
              user_id: createdBy || "system",
              activity_type: "assumption_added",
              description: `Assumption added: ${assumption}`,
              metadata: {
                assumption_id: assumptionId,
                category: category || "other",
              },
              created_at: new Date().toISOString(),
            },
          },
        ],
      }),
    }).catch((error) => {
      console.error("Error creating activity log:", error);
    });

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
    console.error("Error creating assumption:", error);
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

    // Update assumption status
    await instantRequest("/transact", {
      method: "POST",
      body: JSON.stringify({
        operations: [
          {
            type: "update",
            table: "profile_assumptions",
            id: assumptionId,
            data: {
              status,
              updated_by_assumption_id: updatedByAssumptionId || undefined,
            },
          },
        ],
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating assumption:", error);
    return NextResponse.json(
      {
        error: "Failed to update assumption",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

