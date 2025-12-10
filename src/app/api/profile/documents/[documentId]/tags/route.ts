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

type RouteParams = {
  params: Promise<{ documentId: string }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { documentId } = await params;
    const body = await request.json();
    const { tags } = body;

    if (!Array.isArray(tags)) {
      return NextResponse.json(
        { error: "Tags must be an array" },
        { status: 400 }
      );
    }

    // First, get the current document to preserve existing metadata
    const getResult = await instantRequest("/query", {
      method: "POST",
      body: JSON.stringify({
        query: {
          profile_documents: {
            $: { where: { id: documentId } },
            id: true,
            metadata: true,
          },
        },
      }),
    });

    const existingDoc = getResult.data?.profile_documents?.[0];
    const existingMetadata = existingDoc?.metadata || {};

    // Update metadata with tags
    const updatedMetadata = {
      ...existingMetadata,
      tags,
    };

    // Update the document
    await instantRequest("/transact", {
      method: "POST",
      body: JSON.stringify({
        operations: [
          {
            type: "update",
            table: "profile_documents",
            id: documentId,
            data: {
              metadata: updatedMetadata,
              updated_at: new Date().toISOString(),
            },
          },
        ],
      }),
    });

    return NextResponse.json({ success: true, tags });
  } catch (error) {
    console.error("Error updating document tags:", error);
    return NextResponse.json(
      {
        error: "Failed to update document tags",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

