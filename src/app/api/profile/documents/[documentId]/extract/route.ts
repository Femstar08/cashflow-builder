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

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { documentId } = await params;
    const body = await request.json();
    const { tags, extractedEvents, profileId } = body;

    // Get document info
    const getResult = await instantRequest("/query", {
      method: "POST",
      body: JSON.stringify({
        query: {
          profile_documents: {
            $: { where: { id: documentId } },
            id: true,
            profile_id: true,
            file_name: true,
            metadata: true,
          },
        },
      }),
    });

    const doc = getResult.data?.profile_documents?.[0];
    if (!doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const docProfileId = profileId || doc.profile_id;

    // Update document tags if provided
    if (tags && Array.isArray(tags)) {
      const existingMetadata = doc.metadata || {};
      const updatedMetadata = {
        ...existingMetadata,
        tags,
      };

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
    }

    // Create activity log entry for extraction
    if (extractedEvents && Array.isArray(extractedEvents) && extractedEvents.length > 0) {
      const eventDescriptions = extractedEvents.map((e: any) => {
        if (e.type === "funding") return `Funding £${e.amount?.toLocaleString() || "?"} (Month ${e.month})`;
        if (e.type === "hire") return `New hire (Month ${e.month})`;
        if (e.type === "client_win") return `Client win (Month ${e.month})`;
        if (e.type === "price_increase") return `Price increase ${e.percent_change || "?"}% (Month ${e.month})`;
        return `Event: ${e.name || "Unknown"} (Month ${e.month})`;
      }).join(", ");

      await instantRequest("/transact", {
        method: "POST",
        body: JSON.stringify({
          operations: [
            {
              type: "insert",
              table: "profile_activities",
              data: {
                id: crypto.randomUUID(),
                profile_id: docProfileId,
                user_id: "system", // Agent extraction
                activity_type: "document_extracted",
                description: `Agent extracted ${extractedEvents.length} event(s) from '${doc.file_name}': ${eventDescriptions}`,
                metadata: {
                  document_id: documentId,
                  document_name: doc.file_name,
                  extracted_events: extractedEvents,
                  tags: tags || [],
                },
                created_at: new Date().toISOString(),
              },
            },
          ],
        }),
      }).catch((error) => {
        console.error("Error creating activity log:", error);
      });
    }

    return NextResponse.json({ success: true, tags, extractedEvents });
  } catch (error) {
    console.error("Error processing document extraction:", error);
    return NextResponse.json(
      {
        error: "Failed to process document extraction",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

