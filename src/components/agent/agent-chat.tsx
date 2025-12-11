"use client";

import { useState, useRef, useEffect } from "react";
import { useAgentStore } from "@/stores/agent-store";
import { useUserStore } from "@/stores/user-store";
import type {
  BusinessProfileDraft,
  CashflowAssumptions,
} from "@/lib/ai/agent-prompt";

type AgentChatProps = {
  onProfileComplete?: (profile: BusinessProfileDraft, assumptions: CashflowAssumptions) => void;
  profileId?: string; // Optional - if provided, files will be stored against this profile
};

export function AgentChat({ onProfileComplete, profileId }: AgentChatProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);
  const user = useUserStore((state) => state.user);

  const {
    messages,
    isProcessing,
    stage,
    currentProfile,
    currentAssumptions,
    addMessage,
    setProcessing,
    setStage,
    updateProfile,
    updateAssumptions,
  } = useAgentStore();

  // Initialize conversation on mount (only once)
  useEffect(() => {
    if (!hasInitialized.current && messages.length === 0 && !isProcessing) {
      hasInitialized.current = true;
      initializeConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, isProcessing]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeConversation = async () => {
    try {
      setProcessing(true);

      // If profileId exists, load profile context for contextual greeting
      let profileContext = null;
      if (profileId) {
        try {
          const profileResponse = await fetch(`/api/profiles/${profileId}`);
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            profileContext = profileData.profile;
          }
        } catch (error) {
          console.error("Failed to load profile context:", error);
          // Continue without profile context
        }
      }

      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isInitial: true,
          profileId: profileId || undefined,
          userId: user?.id || undefined,
          userRole: (user?.role as "client" | "accountant" | "admin") || "client",
          currentProfile: profileContext ? {
            business_name: profileContext.name,
            entity_type: profileContext.entity_type || "unknown",
            industry: profileContext.industry || "",
            business_model: profileContext.revenue_model || "",
            revenue_streams: [],
            cost_categories: [],
            staff: { employees: 0, contractors: 0 },
            tax_settings: {
              accounting_basis: profileContext.accounting_basis || "accrual",
              vat_enabled: profileContext.vat_enabled || false,
              vat_basis: profileContext.vat_basis || "accrual",
              include_corporation_tax: profileContext.include_corporation_tax || false,
              include_paye_nic: profileContext.include_paye_nic || false,
              include_dividends: profileContext.include_dividends || false,
            },
            working_capital: {
              debtor_days: profileContext.debtor_days || 0,
              creditor_days: profileContext.creditor_days || 0,
            },
            startup_stage: "trading",
            events: [],
            forecast_period_months: 12,
          } : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error" }));
        addMessage("assistant", errorData.response || errorData.error || "I encountered an error initializing. Please refresh the page.");
        return;
      }

      const data = await response.json();
      addMessage("assistant", data.response);
      setStage(data.stage || "initial");
    } catch (error) {
      console.error("Failed to initialize agent:", error);
      addMessage("assistant", "I apologize, but I encountered an error initializing. Please refresh the page.");
    } finally {
      setProcessing(false);
    }
  };

  const sendMessage = async () => {
    if ((!inputMessage.trim() && attachedFiles.length === 0) || isProcessing) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Show user message or indicate files are being sent
    if (userMessage) {
      addMessage("user", userMessage);
    } else if (attachedFiles.length > 0) {
      addMessage("user", `[Sent ${attachedFiles.length} file${attachedFiles.length > 1 ? "s" : ""}: ${attachedFiles.map(f => f.name).join(", ")}]`);
    }

    try {
      setProcessing(true);

      // Build conversation history including the current user message for full context
      // The API will use conversationHistory for context and message for the current turn
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Convert files to base64 for transmission
      const fileDataPromises = attachedFiles.map(async (file) => {
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

      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: conversationHistory, // Includes all messages including the current user message
          currentProfile,
          currentAssumptions,
          stage,
          attachments: fileData.length > 0 ? fileData : undefined,
          profileId: profileId || undefined, // Only include if provided
          userId: user?.id || undefined,
          userRole: (user?.role as "client" | "accountant" | "admin") || "client",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error" }));
        addMessage("assistant", errorData.response || errorData.error || "I encountered an error. Please try again.");
        return;
      }

      const data = await response.json();

      if (data.error) {
        addMessage("assistant", data.response || data.error);
      } else {
        addMessage("assistant", data.response);

        // Update state with parsed data
        if (data.businessProfile) {
          updateProfile(data.businessProfile);
        }
        if (data.cashflowAssumptions) {
          updateAssumptions(data.cashflowAssumptions);
        }
        if (data.stage) {
          setStage(data.stage);
        }

        // Check if profile is complete
        if (data.stage === "complete" && data.businessProfile && data.cashflowAssumptions) {
          if (onProfileComplete) {
            onProfileComplete(
              data.businessProfile as BusinessProfileDraft,
              data.cashflowAssumptions as CashflowAssumptions
            );
          }
        }
      }

      // Clear attached files after successful send
      setAttachedFiles([]);
    } catch (error) {
      console.error("Failed to send message:", error);
      addMessage("assistant", "I apologize, but I encountered an error. Please try again.");
    } finally {
      setProcessing(false);
      inputRef.current?.focus();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachedFiles((prev) => [...prev, ...files]);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent">
        {messages.length === 0 && (
          <div className="text-center text-[#5C6478] py-8">
            <p>Starting conversation with agent...</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 ${message.role === "user"
                  ? "bg-[#53E9C5] text-[#15213C] rounded-2xl rounded-tr-sm"
                  : "bg-[#1a2a4a] text-white border border-[#5C6478]/30 rounded-2xl rounded-tl-sm"
                }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-[#1a2a4a] border border-[#5C6478]/30 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#53E9C5] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#53E9C5] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 bg-[#53E9C5] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#5C6478]/30 p-4 bg-transparent">
        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border border-[#5C6478]/30 bg-[#1a2a4a] px-3 py-1.5 text-sm text-white"
              >
                <span className="text-[#5C6478]">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-[#5C6478] hover:text-white"
                  type="button"
                  aria-label="Remove file"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1 flex flex-col gap-2">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full min-h-[60px] max-h-[120px] px-4 py-2 pr-10 border border-[#5C6478]/30 rounded-lg bg-white text-[#15213C] placeholder-[#5C6478] focus:outline-none focus:ring-2 focus:ring-[#53E9C5]/50 resize-none"
                style={{ color: '#15213C' }}
                disabled={isProcessing}
              />
              <button
                onClick={sendMessage}
                disabled={(!inputMessage.trim() && attachedFiles.length === 0) || isProcessing}
                className="absolute right-2 bottom-2 p-2 text-[#53E9C5] hover:text-[#45D9B3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer rounded-lg border border-[#5C6478]/30 bg-[#15213C] px-3 py-1.5 text-sm text-white hover:bg-[#1a2a4a] hover:border-[#53E9C5]/50 transition-colors"
              >
                Attach File
              </label>
              {attachedFiles.length > 0 && (
                <span className="text-xs text-[#5C6478]">{attachedFiles.length} file{attachedFiles.length > 1 ? "s" : ""} attached</span>
              )}
            </div>
          </div>
        </div>
        {stage === "complete" && (
          <div className="mt-2 text-xs text-[#53E9C5] font-medium">
            ✓ Profile complete! You can now generate your cashflow forecast.
          </div>
        )}
      </div>
    </div>
  );
}

