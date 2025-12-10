import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import { validateUUID } from "@/lib/validation";

type RouteParams = {
  params: Promise<{ documentId: string }>;
};

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { documentId } = await params;
    
    // Validate documentId
    try {
      validateUUID(documentId, 'documentId');
    } catch (error) {
      logger.warn('Invalid documentId in extract POST', { documentId });
      return NextResponse.json(
        { error: "Invalid document ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { tags, extractedEvents, profileId } = body;

    // Validate profileId if provided
    if (profileId) {
      try {
        validateUUID(profileId, 'profileId');
      } catch (error) {
        logger.warn('Invalid profileId in extract POST', { profileId });
        return NextResponse.json(
          { error: "Invalid profile ID format" },
          { status: 400 }
        );
      }
    }

    // Get document info
    const admin = getSupabaseAdmin();
    const { data: doc, error: getError } = await admin
      .from("cf_profile_documents")
      .select("id, profile_id, file_name, metadata")
      .eq("id", documentId)
      .single();

    if (getError || !doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const docProfileId = profileId || doc.profile_id;

    // Update document tags if provided
    if (tags && Array.isArray(tags)) {
      const existingMetadata = (doc.metadata as Record<string, unknown>) || {};
      const updatedMetadata = {
        ...existingMetadata,
        tags,
      };

      const { error: updateError } = await admin
        .from("cf_profile_documents")
        .update({
          metadata: updatedMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId);

      if (updateError) {
        logger.error("Error updating document tags", updateError, { documentId });
      }
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

      (async () => {
        try {
          await admin
            .from("cf_profile_activities")
            .insert({
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
            });
        } catch (error: unknown) {
          logger.error("Error creating activity log", error, { documentId, profileId: docProfileId });
        }
      })();
    }

    return NextResponse.json({ success: true, tags, extractedEvents });
  } catch (error) {
    logger.error("Error processing document extraction", error);
    return NextResponse.json(
      {
        error: "Failed to process document extraction",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

