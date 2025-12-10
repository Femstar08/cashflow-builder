import { NextResponse } from "next/server";
import { getOpenAIClient, getOpenAIModel } from "@/lib/ai/client";
import { processFiles } from "@/lib/ai/file-processor";
import {
  buildAgentPrompt,
  parseAgentResponse,
  getAgentStartupMessage,
  type AgentStage,
  type BusinessProfileDraft,
  type CashflowAssumptions,
} from "@/lib/ai/agent-prompt";
import { logger } from "@/lib/logger";
import { validateUUID, validateString } from "@/lib/validation";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type FileAttachment = {
  name: string;
  type: string;
  content: string; // base64 data URL
};

type AgentChatRequest = {
  message?: string;
  conversationHistory?: ChatMessage[];
  currentProfile?: Partial<BusinessProfileDraft>;
  currentAssumptions?: Partial<CashflowAssumptions>;
  stage?: AgentStage;
  isInitial?: boolean;
  attachments?: FileAttachment[];
  profileId?: string; // For storing documents
  userId?: string; // For storing documents
  userRole?: "client" | "accountant" | "admin"; // For storing documents
};

export async function POST(request: Request) {
  try {
    const body: AgentChatRequest = await request.json();
    const {
      message,
      conversationHistory = [],
      currentProfile,
      currentAssumptions,
      stage = "gathering",
      isInitial = false,
      attachments = [],
      profileId,
      userId,
      userRole = "client",
    } = body;

    // Validate inputs
    if (profileId) {
      try {
        validateUUID(profileId, 'profileId');
      } catch (error) {
        logger.warn('Invalid profileId in agent chat', { profileId });
        return NextResponse.json(
          { error: "Invalid profile ID format" },
          { status: 400 }
        );
      }
    }

    if (userId) {
      try {
        validateUUID(userId, 'userId');
      } catch (error) {
        logger.warn('Invalid userId in agent chat', { userId });
        return NextResponse.json(
          { error: "Invalid user ID format" },
          { status: 400 }
        );
      }
    }

    if (message) {
      try {
        validateString(message, { fieldName: 'message', minLength: 1, maxLength: 10000 });
      } catch (error) {
        logger.warn('Invalid message in agent chat', { messageLength: message.length });
        return NextResponse.json(
          { error: (error as Error).message },
          { status: 400 }
        );
      }
    }

    const openai = getOpenAIClient();
    if (!openai) {
      logger.warn('OpenAI client not configured');
      return NextResponse.json(
        {
          response: "AI service is not configured. Please set OPENAI_API_KEY in your environment variables.",
          businessProfile: currentProfile,
          cashflowAssumptions: currentAssumptions,
          questions: [],
          commentary: "AI service unavailable.",
        },
        { status: 200 }
      );
    }

    // Handle initial message
    if (isInitial || conversationHistory.length === 0) {
      // If we have an existing profile, create a contextual greeting
      let startupMessage = getAgentStartupMessage();
      
      if (profileId && currentProfile) {
        // Fetch assumptions for contextual greeting
        let assumptionsList: string[] = [];
        try {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
          const assumptionsResponse = await fetch(`${baseUrl}/api/profile/assumptions?profileId=${profileId}&status=active`);
          if (assumptionsResponse.ok) {
            const assumptionsData = await assumptionsResponse.json();
            const assumptions = assumptionsData.assumptions || [];
            assumptionsList = assumptions.slice(0, 5).map((a: any) => a.assumption);
          }
        } catch (error) {
          logger.error("Error fetching assumptions for greeting", error, { profileId });
        }
        
        // Build contextual greeting based on existing profile
        const profileDetails: string[] = [];
        if (currentProfile.business_name) {
          profileDetails.push(`business profile for ${currentProfile.business_name}`);
        }
        if (currentProfile.entity_type && currentProfile.entity_type !== "unknown") {
          profileDetails.push(`${currentProfile.entity_type.replace("_", " ")} entity`);
        }
        if (currentProfile.tax_settings?.vat_enabled) {
          profileDetails.push("VAT registered");
        }
        if (currentProfile.staff && (currentProfile.staff.employees > 0 || currentProfile.staff.contractors > 0)) {
          const staffCount = (currentProfile.staff.employees || 0) + (currentProfile.staff.contractors || 0);
          profileDetails.push(`${staffCount} staff member${staffCount !== 1 ? "s" : ""}`);
        }
        
        if (profileDetails.length > 0 || assumptionsList.length > 0) {
          let message = "Welcome back.";
          if (profileDetails.length > 0) {
            message += ` We've already got a profile here with ${profileDetails.join(", ")}.`;
          }
          if (assumptionsList.length > 0) {
            message += `\n\nPreviously, we made these assumptions:\n${assumptionsList.map(a => `• ${a}`).join("\n")}`;
          }
          message += `\n\nWould you like to:\n- Review or update the assumptions, or\n- Upload any new documents before we continue?`;
          startupMessage = message;
        }
      }
      
      return NextResponse.json({
        response: startupMessage,
        businessProfile: currentProfile,
        cashflowAssumptions: currentAssumptions,
        questions: [],
        commentary: "",
        stage: "initial",
      });
    }

    // Fetch previously stored documents and assumptions for this profile to include in context
    let storedDocumentsContext = "";
    let storedAssumptionsContext = "";
    if (profileId) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        
        // Fetch documents
        const docsResponse = await fetch(`${baseUrl}/api/profile/documents?profileId=${profileId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (docsResponse.ok) {
          const docsData = await docsResponse.json();
          const documents = docsData.documents || [];
          
          if (documents.length > 0) {
            storedDocumentsContext = `\n\n[PREVIOUSLY STORED DOCUMENTS FOR THIS PROFILE:\n`;
            for (const doc of documents.slice(0, 5)) { // Limit to 5 most recent
              storedDocumentsContext += `\n--- ${doc.name} (uploaded ${new Date(doc.uploadedAt).toLocaleDateString()}) ---\n`;
              if (doc.extractedText) {
                const text = doc.extractedText.length > 2000 
                  ? doc.extractedText.substring(0, 2000) + "\n[... truncated ...]"
                  : doc.extractedText;
                storedDocumentsContext += text + "\n";
              }
            }
            storedDocumentsContext += `]\n\nUse information from these stored documents when building assumptions. Reference them when asking questions to avoid redundancy.`;
          }
        }
        
        // Fetch assumptions
        const assumptionsResponse = await fetch(`${baseUrl}/api/profile/assumptions?profileId=${profileId}&status=active`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (assumptionsResponse.ok) {
          const assumptionsData = await assumptionsResponse.json();
          const assumptions = assumptionsData.assumptions || [];
          
          if (assumptions.length > 0) {
            storedAssumptionsContext = `\n\n[PREVIOUSLY STORED ASSUMPTIONS FOR THIS PROFILE:\n`;
            for (const assumption of assumptions) {
              storedAssumptionsContext += `\n- ${assumption.assumption}`;
              if (assumption.reason) {
                storedAssumptionsContext += ` (${assumption.reason})`;
              }
            }
            storedAssumptionsContext += `]\n\nWhen revisiting this profile, reference these assumptions. Ask the user if they want to update any of them. Use phrases like "Previously we assumed X - would you like to update that now?"`;
          }
        }
      } catch (error) {
        logger.error("Error fetching stored context", error, { profileId });
        // Continue even if fetch fails
      }
    }

    // Build conversation messages
    const messages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];

    // Add system prompt
    let systemPrompt = buildAgentPrompt(stage, conversationHistory, currentProfile, currentAssumptions);
    
    // Add stored documents and assumptions context if available
    if (storedDocumentsContext) {
      systemPrompt += storedDocumentsContext;
    }
    if (storedAssumptionsContext) {
      systemPrompt += storedAssumptionsContext;
    }
    
    messages.push({ role: "system", content: systemPrompt });

    // Add conversation history (last 10 messages to avoid token limits)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }

    // Add current user message if provided
    let userMessageContent = message || "";
    
    // Process file attachments, store them, and extract text
    let storedDocumentIds: string[] = [];
    if (attachments && attachments.length > 0) {
      try {
        const processedFiles = await processFiles(attachments);
        
        // Store documents in database if profileId is provided
        if (profileId && userId) {
          try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            const storeResponse = await fetch(`${baseUrl}/api/profile/documents`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                profileId,
                files: attachments,
                uploadedBy: userId,
                uploadedByRole: userRole,
              }),
            });
            
            if (storeResponse.ok) {
              const storeData = await storeResponse.json();
              storedDocumentIds = storeData.documents?.map((d: any) => d.id) || [];
            }
          } catch (storeError) {
            logger.error("Error storing documents", storeError, { profileId, userId });
            // Continue even if storage fails
          }
        }
        
        let fileContent = `\n\n[User attached ${attachments.length} file(s):\n`;
        
        for (const file of processedFiles) {
          fileContent += `\n--- File: ${file.name} ---\n`;
          if (file.success && file.extractedText) {
            // Limit extracted text to avoid token limits (first 5000 characters)
            const text = file.extractedText.length > 5000 
              ? file.extractedText.substring(0, 5000) + "\n[... content truncated ...]"
              : file.extractedText;
            fileContent += text;
          } else {
            fileContent += `[Unable to process file: ${file.error || "Unknown error"}]`;
          }
          fileContent += "\n";
        }
        
        fileContent += "]";
        if (storedDocumentIds.length > 0) {
          fileContent += `\n\n[Note: These files have been stored in the business profile's Documents section.]`;
        }
        userMessageContent += fileContent;
      } catch (error) {
        logger.error("Error processing files", error, { 
          profileId, 
          fileCount: attachments.length,
          fileNames: attachments.map(f => f.name)
        });
        const fileList = attachments.map((file) => `- ${file.name} (${file.type})`).join("\n");
        userMessageContent += `\n\n[User attached ${attachments.length} file(s), but encountered an error processing them:\n${fileList}\nPlease provide a summary of the key information from these files.]`;
      }
    }
    
    if (userMessageContent) {
      messages.push({ role: "user", content: userMessageContent });
    }

    // Call OpenAI
    const model = getOpenAIModel();
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7, // Slightly higher for more conversational responses
      max_tokens: 2000,
    });

    const agentResponse = completion.choices[0]?.message?.content || "";

    // Parse the response to extract structured data
    const parsed = parseAgentResponse(agentResponse);

    // Store assumptions if any were extracted
    if (parsed.assumptions && parsed.assumptions.length > 0 && profileId) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        for (const assumption of parsed.assumptions) {
          await fetch(`${baseUrl}/api/profile/assumptions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              profileId,
              assumption: assumption.assumption,
              reason: assumption.reason,
              category: assumption.category,
              createdBy: userId || "agent",
            }),
          }).catch((error) => {
            logger.error("Error storing assumption", error, { profileId, assumption: assumption.assumption });
            // Continue even if storage fails
          });
        }
      } catch (error) {
        logger.error("Error storing assumptions", error, { profileId, assumptionCount: parsed.assumptions.length });
        // Continue even if storage fails
      }
    }

    // Determine next stage based on response
    let nextStage: AgentStage = stage;
    if (parsed.businessProfile && Object.keys(parsed.businessProfile).length > 3) {
      if (parsed.questions && parsed.questions.length > 0) {
        nextStage = "questioning";
      } else if (parsed.cashflowAssumptions) {
        nextStage = "finalizing";
      } else {
        nextStage = "building";
      }
    }

    if (parsed.businessProfile && parsed.cashflowAssumptions && (!parsed.questions || parsed.questions.length === 0)) {
      nextStage = "complete";
    }

    return NextResponse.json({
      response: agentResponse,
      businessProfile: parsed.businessProfile || currentProfile,
      cashflowAssumptions: parsed.cashflowAssumptions || currentAssumptions,
      questions: parsed.questions || [],
      commentary: parsed.commentary || "",
      assumptions: parsed.assumptions || [],
      stage: nextStage,
    });
  } catch (error) {
    logger.error("Agent chat error", error, { 
      profileId, 
      userId, 
      stage,
      hasAttachments: attachments.length > 0
    });
    
    const errorMessage = (error as Error).message || "Failed to generate agent response";
    const isModelAccessError = errorMessage.includes("does not have access to model") || 
                               errorMessage.includes("403") ||
                               errorMessage.includes("model_not_found");
    
    let userFriendlyMessage = "I apologize, but I encountered an error. Please try again.";
    
    if (isModelAccessError) {
      const model = getOpenAIModel();
      userFriendlyMessage = `I'm unable to access the AI model "${model}". Please check your OpenAI API configuration. You may need to:\n\n1. Set the OPENAI_MODEL environment variable to a model you have access to (e.g., "gpt-4o-mini", "gpt-4", "gpt-3.5-turbo")\n2. Ensure your OpenAI API key has access to the selected model\n3. Check your OpenAI account billing and model access settings`;
    }
    
    return NextResponse.json(
      {
        error: errorMessage,
        response: userFriendlyMessage,
      },
      { status: 500 }
    );
  }
}

