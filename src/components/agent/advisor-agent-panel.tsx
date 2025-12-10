"use client";

import { useState } from "react";
import { AgentChat } from "./agent-chat";
import type {
  BusinessProfileDraft,
  CashflowAssumptions,
} from "@/lib/ai/agent-prompt";

const MinimizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export function AdvisorAgentPanel() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const handleProfileComplete = async (
    profile: BusinessProfileDraft,
    assumptions: CashflowAssumptions
  ) => {
    // Profile is complete
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`h-full flex flex-col rounded-xl border border-[#5C6478]/30 bg-gradient-to-br from-[#15213C] to-[#1a2a4a] overflow-hidden transition-all duration-300 ${isMinimized ? 'h-auto' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#5C6478]/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#53E9C5]/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5 text-[#53E9C5]"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">Advisor Agent</h3>
            <p className="text-xs text-[#5C6478]">Expert Accountant • Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-[#5C6478] hover:text-white transition-colors p-1"
            aria-label={isMinimized ? "Expand" : "Minimize"}
          >
            <MinimizeIcon />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#5C6478] hover:text-white transition-colors p-1"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Chat Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-hidden">
          <AgentChat onProfileComplete={handleProfileComplete} />
        </div>
      )}
    </div>
  );
}

