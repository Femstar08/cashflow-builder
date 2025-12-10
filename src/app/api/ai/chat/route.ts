import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai/chat";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, profileId, scenarioId, lineItems } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await generateAIResponse({
      message,
      profileId,
      scenarioId,
      lineItems,
    });

    return NextResponse.json({ response }, { status: 200 });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to generate AI response" },
      { status: 500 }
    );
  }
}

