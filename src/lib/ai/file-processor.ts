/**
 * File processing utilities for extracting text from various file types
 */

import mammoth from "mammoth";

type ProcessedFile = {
  name: string;
  type: string;
  extractedText: string;
  success: boolean;
  error?: string;
};

/**
 * Extract text from a base64-encoded file
 */
export async function processFile(
  name: string,
  type: string,
  base64Content: string
): Promise<ProcessedFile> {
  try {
    // Remove data URL prefix if present (e.g., "data:application/pdf;base64,")
    const base64Data = base64Content.includes(",")
      ? base64Content.split(",")[1]
      : base64Content;

    const buffer = Buffer.from(base64Data, "base64");

    // Handle text-based files
    if (type.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".csv")) {
      const text = buffer.toString("utf-8");
      return {
        name,
        type,
        extractedText: text,
        success: true,
      };
    }

    // Handle JSON files
    if (type === "application/json" || name.endsWith(".json")) {
      const text = buffer.toString("utf-8");
      try {
        const json = JSON.parse(text);
        return {
          name,
          type,
          extractedText: JSON.stringify(json, null, 2),
          success: true,
        };
      } catch {
        return {
          name,
          type,
          extractedText: text,
          success: true,
        };
      }
    }

    // Handle Word documents (.docx) using mammoth
    if (name.endsWith(".docx")) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value.trim();
        
        if (text && text.length > 0) {
          // Return the extracted text directly - the agent will process it
          return {
            name,
            type,
            extractedText: text,
            success: true,
          };
        }
      } catch (error) {
        console.error("Error extracting text from .docx:", error);
        return {
          name,
          type,
          extractedText: `[Unable to fully extract text from ${name}. Please provide key information: business details, revenue streams, costs, financial projections, and any other relevant cashflow information.]`,
          success: false,
          error: (error as Error).message,
        };
      }
    }

    // Handle other binary files (PDF, PowerPoint, Excel, old .doc)
    if (
      name.endsWith(".doc") ||
      name.endsWith(".pdf") ||
      name.endsWith(".pptx") ||
      name.endsWith(".ppt") ||
      name.endsWith(".xlsx") ||
      name.endsWith(".xls")
    ) {
      // For these file types, we'll provide guidance
      // In production, you'd add libraries like pdf-parse, xlsx, etc.
      return {
        name,
        type,
        extractedText: `[File: ${name} - ${getFileTypeDescription(name)}]\n\nI've received your ${getFileTypeDescription(name)}. To help me build your cashflow forecast, please provide the key information from this file:\n- Business details (industry, revenue streams, cost categories)\n- Financial information (budgets, projections, regular expenses)\n- Key dates or milestones\n- Number of employees/contractors\n- VAT registration status\n- Any other relevant details for forecasting]`,
        success: true,
      };
    }

    // For unknown file types, return a generic message
    return {
      name,
      type,
      extractedText: `[File: ${name} (${type}). Unable to automatically extract text. Please provide a summary of the key information.]`,
      success: true,
    };
  } catch (error) {
    return {
      name,
      type,
      extractedText: "",
      success: false,
      error: (error as Error).message,
    };
  }
}

function getFileTypeDescription(filename: string): string {
  if (filename.endsWith(".docx") || filename.endsWith(".doc")) {
    return "Word document";
  }
  if (filename.endsWith(".pdf")) {
    return "PDF document";
  }
  if (filename.endsWith(".pptx") || filename.endsWith(".ppt")) {
    return "PowerPoint presentation";
  }
  if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
    return "Excel spreadsheet";
  }
  return "document";
}

/**
 * Process multiple files and return extracted text
 */
export async function processFiles(
  files: Array<{ name: string; type: string; content: string }>
): Promise<ProcessedFile[]> {
  const results = await Promise.all(
    files.map((file) => processFile(file.name, file.type, file.content))
  );
  return results;
}

