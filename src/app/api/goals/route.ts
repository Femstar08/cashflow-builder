import { NextResponse } from "next/server";
import type { SMARTGoal } from "@/components/goals/smart-goals-panel";

// In a real app, this would use InstantDB
// For now, we'll use a simple in-memory store
const goalsStore = new Map<string, SMARTGoal[]>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");

  if (!profileId) {
    return NextResponse.json({ error: "profileId is required" }, { status: 400 });
  }

  const goals = goalsStore.get(profileId) || [];
  return NextResponse.json({ goals }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, goal } = body;

    if (!profileId || !goal) {
      return NextResponse.json({ error: "profileId and goal are required" }, { status: 400 });
    }

    const goals = goalsStore.get(profileId) || [];
    goals.push(goal);
    goalsStore.set(profileId, goals);

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create goal" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { profileId, goalId, updates } = body;

    if (!profileId || !goalId) {
      return NextResponse.json({ error: "profileId and goalId are required" }, { status: 400 });
    }

    const goals = goalsStore.get(profileId) || [];
    const index = goals.findIndex((g) => g.id === goalId);

    if (index === -1) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    goals[index] = { ...goals[index], ...updates };
    goalsStore.set(profileId, goals);

    return NextResponse.json({ goal: goals[index] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update goal" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    const goalId = searchParams.get("goalId");

    if (!profileId || !goalId) {
      return NextResponse.json({ error: "profileId and goalId are required" }, { status: 400 });
    }

    const goals = goalsStore.get(profileId) || [];
    const filtered = goals.filter((g) => g.id !== goalId);
    goalsStore.set(profileId, filtered);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to delete goal" },
      { status: 500 }
    );
  }
}

