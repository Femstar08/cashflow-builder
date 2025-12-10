import { create } from "zustand";
import type {
  BusinessProfileDraft,
  CashflowAssumptions,
  AgentStage,
} from "@/lib/ai/agent-prompt";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type AgentState = {
  // Conversation state
  messages: ChatMessage[];
  isProcessing: boolean;
  stage: AgentStage;

  // Profile building state
  currentProfile: Partial<BusinessProfileDraft> | null;
  currentAssumptions: Partial<CashflowAssumptions> | null;

  // UI state
  showProfilePreview: boolean;
  showAssumptionsPreview: boolean;

  // Actions
  addMessage: (role: "user" | "assistant", content: string) => void;
  setProcessing: (processing: boolean) => void;
  setStage: (stage: AgentStage) => void;
  updateProfile: (profile: Partial<BusinessProfileDraft>) => void;
  updateAssumptions: (assumptions: Partial<CashflowAssumptions>) => void;
  reset: () => void;
  toggleProfilePreview: () => void;
  toggleAssumptionsPreview: () => void;
};

const initialState = {
  messages: [],
  isProcessing: false,
  stage: "initial" as AgentStage,
  currentProfile: null,
  currentAssumptions: null,
  showProfilePreview: false,
  showAssumptionsPreview: false,
};

export const useAgentStore = create<AgentState>((set) => ({
  ...initialState,

  addMessage: (role, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `msg-${Date.now()}-${Math.random()}`,
          role,
          content,
          timestamp: new Date(),
        },
      ],
    })),

  setProcessing: (processing) => set({ isProcessing: processing }),

  setStage: (stage) => set({ stage }),

  updateProfile: (profile) =>
    set((state) => ({
      currentProfile: { ...state.currentProfile, ...profile },
    })),

  updateAssumptions: (assumptions) =>
    set((state) => ({
      currentAssumptions: { ...state.currentAssumptions, ...assumptions },
    })),

  reset: () => set(initialState),

  toggleProfilePreview: () =>
    set((state) => ({ showProfilePreview: !state.showProfilePreview })),

  toggleAssumptionsPreview: () =>
    set((state) => ({ showAssumptionsPreview: !state.showAssumptionsPreview })),
}));

