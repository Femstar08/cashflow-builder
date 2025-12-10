import { NextResponse } from "next/server";
import { processFiles } from "@/lib/ai/file-processor";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import type { ProfileDocumentInsert } from "@/types/database";
import { logger } from "@/lib/logger";
import { validateUUID, validateFileName, validateFileType, validateFileSize } from "@/lib/validation";
import { getCacheHeaders } from "@/lib/cache";

type DocumentUploadRequest = {
  profileId: string;
  files: Array<{
    name: string;
    type: string;
    content: string; // base64 data URL
  }>;
  uploadedBy: string;
  uploadedByRole: "client" | "accountant" | "admin";
};

export async function POST(request: Request) {
  try {
    const body: DocumentUploadRequest = await request.json();
    const { profileId, files, uploadedBy, uploadedByRole } = body;

    // Validate input
    if (!profileId || !files || files.length === 0) {
      return NextResponse.json(
        { error: "Profile ID and files are required" },
        { status: 400 }
      );
    }

    // Validate profileId is a valid UUID
    try {
      validateUUID(profileId, 'profileId');
    } catch (error) {
      logger.warn('Invalid profileId in document upload', { profileId });
      return NextResponse.json(
        { error: "Invalid profile ID format" },
        { status: 400 }
      );
    }

    // Validate file count limit
    if (files.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 files allowed per upload" },
        { status: 400 }
      );
    }

    // Process files to extract text
    const processedFiles = await processFiles(files);

    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];

    const maxFileSize = 10 * 1024 * 1024; // 10MB

    // Store documents in database
    const documents = await Promise.all(
      processedFiles.map(async (processedFile, index) => {
        const file = files[index];
        
        // Validate file name
        let fileName: string;
        try {
          fileName = validateFileName(file.name);
        } catch (error) {
          logger.warn('Invalid file name', { fileName: file.name });
          throw new Error(`Invalid file name: ${file.name}`);
        }

        // Validate file type
        try {
          validateFileType(file.type, allowedTypes);
        } catch (error) {
          logger.warn('Invalid file type', { fileType: file.type, fileName: file.name });
          throw new Error(`File type ${file.type} is not allowed`);
        }

        const base64Data = file.content.includes(",")
          ? file.content.split(",")[1]
          : file.content;
        const buffer = Buffer.from(base64Data, "base64");
        const fileSize = buffer.length;

        // Validate file size
        try {
          validateFileSize(fileSize, maxFileSize);
        } catch (error) {
          logger.warn('File size exceeded', { fileSize, fileName: file.name });
          throw error;
        }

        // For large files, we'd store in external storage (S3, etc.)
        // For now, store base64 for files under 5MB
        const shouldStoreBase64 = fileSize < 5 * 1024 * 1024; // 5MB limit

        const documentData = {
          profile_id: profileId,
          uploaded_by: uploadedBy,
          uploaded_by_role: uploadedByRole,
          file_name: fileName, // Use validated file name
          file_type: processedFile.type,
          file_size: fileSize,
          file_content_base64: shouldStoreBase64 ? base64Data : undefined,
          extracted_text: processedFile.extractedText || undefined,
          extraction_notes: processedFile.success
            ? "Text extracted successfully"
            : `Extraction error: ${processedFile.error || "Unknown error"}`,
          created_at: new Date().toISOString(),
          is_deleted: false,
        };

        // Insert into database
        const admin = getSupabaseAdmin();
        const { data: insertedDoc, error: insertError } = await admin
          .from("cf_profile_documents")
          .insert({
            ...documentData,
            id: crypto.randomUUID(),
          } as ProfileDocumentInsert)
          .select()
          .single();

        if (insertError) {
          logger.error('Failed to insert document', insertError, { profileId, fileName });
          throw new Error(`Failed to insert document: ${insertError.message}`);
        }

        return {
          id: insertedDoc.id,
          ...documentData,
        };
      })
    );

    // Create activity log entry (non-blocking)
    const admin = getSupabaseAdmin();
    (async () => {
      try {
        await admin
          .from("cf_profile_activities")
          .insert({
            id: crypto.randomUUID(),
            profile_id: profileId,
            user_id: uploadedBy,
            activity_type: "document_uploaded",
            description: `Uploaded ${files.length} document(s): ${files.map((f) => f.name).join(", ")}`,
            metadata: {
              document_count: files.length,
              file_names: files.map((f) => f.name),
            },
          });
      } catch (error: unknown) {
        logger.error("Error creating activity log", error, { profileId });
        // Don't fail the request if activity log fails
      }
    })();

    return NextResponse.json({
      success: true,
      documents: documents.map((doc) => ({
        id: doc.id,
        name: doc.file_name,
        type: doc.file_type,
        size: doc.file_size,
        extracted: doc.extracted_text ? true : false,
      })),
    });
  } catch (error) {
    logger.error("Error uploading documents", error);
    return NextResponse.json(
      {
        error: "Failed to upload documents",
        message: (error as Error).message,
      },
      { status: 500 }
    );
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

    // Fetch documents for the profile
    const admin = getSupabaseAdmin();
    const { data: documentsData, error } = await admin
      .from("cf_profile_documents")
      .select("*")
      .eq("profile_id", profileId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error('Failed to fetch documents', error, { profileId });
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    const documents = (documentsData || []).map((doc: any) => ({
      id: doc.id,
      name: doc.file_name,
      type: doc.file_type,
      size: doc.file_size,
      extractedText: doc.extracted_text,
      extractionNotes: doc.extraction_notes,
      uploadedBy: doc.uploaded_by,
      uploadedByRole: doc.uploaded_by_role,
      uploadedAt: doc.created_at,
      metadata: doc.metadata,
    }));

    return NextResponse.json(
      { documents },
      { headers: getCacheHeaders(60) } // Cache for 60 seconds
    );
  } catch (error) {
    logger.error("Error fetching documents", error);
    return NextResponse.json(
      {
        error: "Failed to fetch documents",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

