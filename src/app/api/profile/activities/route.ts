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

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      );
    }

    // Fetch activities for the profile
    const result = await instantRequest("/query", {
      method: "POST",
      body: JSON.stringify({
        query: {
          profile_activities: {
            $: {
              where: {
                profile_id: profileId,
              },
              orderBy: { created_at: "desc" },
              limit: 50,
            },
            id: true,
            profile_id: true,
            user_id: true,
            activity_type: true,
            description: true,
            metadata: true,
            created_at: true,
          },
        },
      }),
    });

    const activities = (result.data?.profile_activities || []).map((activity: any) => ({
      id: activity.id,
      profile_id: activity.profile_id,
      user_id: activity.user_id,
      activity_type: activity.activity_type,
      description: activity.description,
      metadata: activity.metadata,
      created_at: activity.created_at,
    }));

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch activities",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

