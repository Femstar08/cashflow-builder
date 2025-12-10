import { NextResponse } from "next/server";
import { processFiles } from "@/lib/ai/file-processor";

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

async function instantRequest(endpoint: string, options: RequestInit = {}) {
  if (!INSTANT_APP_ID || !INSTANT_ADMIN_TOKEN) {
    return { data: null };
  }

  // InstantDB REST API endpoint (adjust based on actual InstantDB API docs)
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

    if (!profileId || !files || files.length === 0) {
      return NextResponse.json(
        { error: "Profile ID and files are required" },
        { status: 400 }
      );
    }

    // Process files to extract text
    const processedFiles = await processFiles(files);

    // Store documents in database
    const documents = await Promise.all(
      processedFiles.map(async (processedFile, index) => {
        const file = files[index];
        const base64Data = file.content.includes(",")
          ? file.content.split(",")[1]
          : file.content;
        const buffer = Buffer.from(base64Data, "base64");
        const fileSize = buffer.length;

        // For large files, we'd store in external storage (S3, etc.)
        // For now, store base64 for files under 5MB
        const shouldStoreBase64 = fileSize < 5 * 1024 * 1024; // 5MB limit

        const documentData = {
          profile_id: profileId,
          uploaded_by: uploadedBy,
          uploaded_by_role: uploadedByRole,
          file_name: processedFile.name,
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
        const documentId = crypto.randomUUID();
        const result = await instantRequest("/transact", {
          method: "POST",
          body: JSON.stringify({
            operations: [
              {
                type: "insert",
                table: "profile_documents",
                data: {
                  ...documentData,
                  id: documentId,
                },
              },
            ],
          }),
        });

        return {
          id: documentId,
          ...documentData,
        };
      })
    );

    // Create activity log entry (non-blocking)
    instantRequest("/transact", {
      method: "POST",
      body: JSON.stringify({
        operations: [
          {
            type: "insert",
            table: "profile_activities",
            data: {
              id: crypto.randomUUID(),
              profile_id: profileId,
              user_id: uploadedBy,
              activity_type: "document_uploaded",
              description: `Uploaded ${files.length} document(s): ${files.map((f) => f.name).join(", ")}`,
              metadata: {
                document_count: files.length,
                file_names: files.map((f) => f.name),
              },
              created_at: new Date().toISOString(),
            },
          },
        ],
      }),
    }).catch((error) => {
      console.error("Error creating activity log:", error);
      // Don't fail the request if activity log fails
    });

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
    console.error("Error uploading documents:", error);
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
    const result = await instantRequest("/query", {
      method: "POST",
      body: JSON.stringify({
        query: {
          profile_documents: {
            $: {
              where: {
                profile_id: profileId,
                is_deleted: { $ne: true },
              },
            },
            id: true,
            file_name: true,
            file_type: true,
            file_size: true,
            extracted_text: true,
            extraction_notes: true,
            uploaded_by: true,
            uploaded_by_role: true,
            created_at: true,
            metadata: true,
          },
        },
      }),
    });

    const documents = (result.data?.profile_documents || []).map((doc: any) => ({
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

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch documents",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

