"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
type DocumentItem = {
  id: string;
  name: string;
  type: string;
  size: number;
  extractedText?: string;
  extractionNotes?: string;
  uploadedBy?: string;
  uploadedByRole?: string;
  uploadedAt?: string;
  metadata?: Record<string, unknown>;
};

type DocumentsPanelProps = {
  profileId: string;
  documents: DocumentItem[];
  onDocumentUploaded: () => void;
  canEdit: boolean;
};

export function DocumentsPanel({
  profileId,
  documents,
  onDocumentUploaded,
  canEdit,
}: DocumentsPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useUserStore((state) => state.user);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && canEdit) {
      await uploadFiles(files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && canEdit) {
      await uploadFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFiles = async (files: File[]) => {
    if (!user) return;

    setIsUploading(true);
    try {
      // Convert files to base64
      const fileDataPromises = files.map(async (file) => {
        return new Promise<{ name: string; type: string; content: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              name: file.name,
              type: file.type,
              content: reader.result as string,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const fileData = await Promise.all(fileDataPromises);

      const response = await fetch("/api/profile/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          files: fileData,
          uploadedBy: user.id,
          uploadedByRole: (user.role as "client" | "accountant" | "admin") || "client",
        }),
      });

      if (response.ok) {
        onDocumentUploaded();
      } else {
        const error = await response.json();
        console.error("Upload failed:", error);
        alert("Failed to upload documents. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload documents. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("excel") || type.includes("spreadsheet")) return "📊";
    if (type.includes("image")) return "🖼️";
    return "📎";
  };

  const getTags = (doc: DocumentItem): string[] => {
    // Extract tags from metadata or infer from filename
    if (doc.metadata && typeof doc.metadata === "object" && "tags" in doc.metadata) {
      const tags = (doc.metadata as any).tags;
      if (Array.isArray(tags)) return tags;
    }
    
    // Infer tags from filename
    const name = doc.name.toLowerCase();
    const inferredTags: string[] = [];
    if (name.includes("plan") || name.includes("business plan")) inferredTags.push("Business plan");
    if (name.includes("pricing") || name.includes("price")) inferredTags.push("Pricing");
    if (name.includes("bank") || name.includes("statement")) inferredTags.push("Bank statements");
    if (name.includes("invoice") || name.includes("invoice")) inferredTags.push("Invoices");
    if (name.includes("contract") || name.includes("agreement")) inferredTags.push("Contracts");
    if (name.includes("financial") || name.includes("forecast")) inferredTags.push("Financial");
    
    return inferredTags;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Upload Area */}
      {canEdit && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? "border-[#53E9C5] bg-[#53E9C5]/10"
              : "border-[#E1E4EA] hover:border-[#53E9C5]/50"
          }`}
        >
          <p className="text-sm text-[#5C6478] mb-2">
            Drag and drop files here, or click to select
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className="inline-block cursor-pointer"
          >
            <Button
              size="sm"
              disabled={isUploading}
              className="bg-[#53E9C5] text-[#15213C] hover:bg-[#45D9B3]"
            >
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </label>
          <p className="text-xs text-[#5C6478] mt-2">
            Supported: PDF, Word, Excel, CSV, Images
          </p>
        </div>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-[#5C6478]">No documents uploaded yet</p>
          {canEdit && (
            <p className="text-sm text-[#5C6478] mt-2">
              Upload business plans, spreadsheets, or notes to get started
            </p>
          )}
        </Card>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const tags = getTags(doc);
            const uploadedDate = doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }) : "Unknown date";

            return (
              <Card key={doc.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getFileIcon(doc.type)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[#15213C] truncate">{doc.name}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#5C6478]">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>•</span>
                      <span>{uploadedDate}</span>
                      {doc.uploadedByRole && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{doc.uploadedByRole}</span>
                        </>
                      )}
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-xs bg-[#E1E4EA] text-[#5C6478] rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {doc.extractedText && (
                      <p className="text-xs text-[#53E9C5] mt-1">✓ Text extracted</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

