import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import { validateUUID } from "@/lib/validation";

type RouteParams = {
  params: Promise<{ documentId: string }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { documentId } = await params;
    const body = await request.json();
    const { tags } = body;

    // Validate inputs
    try {
      validateUUID(documentId, 'documentId');
    } catch (error) {
      logger.warn('Invalid documentId in tags PATCH', { documentId });
      return NextResponse.json(
        { error: "Invalid document ID format" },
        { status: 400 }
      );
    }

    if (!Array.isArray(tags)) {
      return NextResponse.json(
        { error: "Tags must be an array" },
        { status: 400 }
      );
    }

    // Validate tags array
    if (tags.length > 20) {
      return NextResponse.json(
        { error: "Maximum 20 tags allowed" },
        { status: 400 }
      );
    }

    for (const tag of tags) {
      if (typeof tag !== 'string' || tag.length > 50) {
        return NextResponse.json(
          { error: "Each tag must be a string with max 50 characters" },
          { status: 400 }
        );
      }
    }

    // First, get the current document to preserve existing metadata
    const admin = getSupabaseAdmin();
    const { data: existingDoc, error: getError } = await admin
      .from("cf_profile_documents")
      .select("metadata")
      .eq("id", documentId)
      .single();

    if (getError) {
      logger.error('Failed to fetch document for tags update', getError, { documentId });
      throw new Error(`Failed to fetch document: ${getError.message}`);
    }

    const existingMetadata = (existingDoc?.metadata as Record<string, unknown>) || {};

    // Update metadata with tags
    const updatedMetadata = {
      ...existingMetadata,
      tags,
    };

    // Update the document
    const { error: updateError } = await admin
      .from("cf_profile_documents")
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    if (updateError) {
      logger.error('Failed to update document tags', updateError, { documentId });
      throw new Error(`Failed to update document: ${updateError.message}`);
    }

    return NextResponse.json({ success: true, tags });
  } catch (error) {
    logger.error("Error updating document tags", error);
    return NextResponse.json(
      {
        error: "Failed to update document tags",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

