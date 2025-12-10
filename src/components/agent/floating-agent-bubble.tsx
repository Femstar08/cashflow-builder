"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AgentChat } from "./agent-chat";
import type {
  BusinessProfileDraft,
  CashflowAssumptions,
} from "@/lib/ai/agent-prompt";

// Using simple SVG icons instead of lucide-react
const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export function FloatingAgentBubble() {
  const [isOpen, setIsOpen] = useState(false);

  const handleProfileComplete = async (
    profile: BusinessProfileDraft,
    assumptions: CashflowAssumptions
  ) => {
    // Profile is complete, could show a notification or auto-close
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="h-16 w-16 rounded-full bg-[#53E9C5] text-[#15213C] hover:bg-[#45D9B3] shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
            aria-label="Open Agent"
          >
            <MessageIcon />
          </Button>
        </div>
      )}

      {/* Chat Panel Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Panel */}
          <div className="relative w-full max-w-2xl h-[85vh] max-h-[800px] bg-white dark:bg-neutral-950 rounded-t-2xl shadow-2xl pointer-events-auto flex flex-col border-2 border-[#53E9C5]/30 m-4 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-[#15213C] to-[#1a2a4a] rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#53E9C5] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-[#15213C]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Beacon Cashflow Builder Agent</h3>
                  <p className="text-white/70 text-xs">Accounting assistant</p>
                </div>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                aria-label="Close chat"
              >
                <CloseIcon />
              </Button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
              <AgentChat onProfileComplete={handleProfileComplete} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

