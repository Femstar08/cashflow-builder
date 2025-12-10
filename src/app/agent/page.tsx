"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { AgentChat } from "@/components/agent/agent-chat";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAgentStore } from "@/stores/agent-store";
import type {
  BusinessProfileDraft,
  CashflowAssumptions,
} from "@/lib/ai/agent-prompt";

export default function AgentPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentProfile, currentAssumptions, stage } = useAgentStore();

  const handleProfileComplete = async (
    profile: BusinessProfileDraft,
    assumptions: CashflowAssumptions
  ) => {
    // This will be called when the agent marks the profile as complete
    // The user can then click "Generate Forecast" to create the actual profile
  };

  const handleGenerateForecast = async () => {
    if (!currentProfile || !currentAssumptions) {
      setError("Profile and assumptions are required to generate forecast");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/agent/generate-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessProfile: currentProfile,
          cashflowAssumptions: currentAssumptions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate profile");
      }

      // Redirect to dashboard
      router.push(`/dashboard/${data.profileId}`);
    } catch (err) {
      console.error("Failed to generate profile:", err);
      setError((err as Error).message || "Failed to generate forecast");
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = stage === "complete" && currentProfile && currentAssumptions;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl border-2 border-[#53E9C5]/30 bg-gradient-to-br from-[#15213C] to-[#1a2a4a] p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold md:text-3xl">Beacon Cashflow Builder Agent</h1>
          </div>
          <p className="mt-2 text-white/90">
            I'm your accounting assistant. I'll guide you through creating a comprehensive
            business profile and cashflow forecast by asking intelligent questions about your business.
          </p>
        </div>

        {/* Status Card */}
        {canGenerate && (
          <Card
            title="Profile Complete!"
            description="Your business profile and cashflow assumptions are ready. Generate your forecast to continue."
            className="border-2 border-green-200 bg-green-50"
          >
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-600">
                <p>✓ Business profile created</p>
                <p>✓ Cashflow assumptions generated</p>
                <p>✓ Ready to generate forecast</p>
              </div>
              <Button
                onClick={handleGenerateForecast}
                disabled={isGenerating}
                className="bg-[#53E9C5] text-[#15213C] hover:bg-[#45D9B3] px-8"
              >
                {isGenerating ? "Generating..." : "Generate Forecast →"}
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}
          </Card>
        )}

        {/* Chat Interface */}
        <Card className="border-2 border-[#53E9C5]/30 h-[700px] flex flex-col p-0 overflow-hidden">
          <AgentChat onProfileComplete={handleProfileComplete} />
        </Card>

        {/* Info Section */}
        <Card
          title="How It Works"
          description="The agent will guide you through the process step by step"
          className="border-2 border-[#5C6478]/20"
        >
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <div className="p-4 rounded-lg bg-slate-50">
              <div className="text-2xl mb-2 font-bold text-[#15213C]">1</div>
              <h3 className="font-semibold text-slate-900 mb-1">Tell Me About Your Business</h3>
              <p className="text-sm text-slate-600">
                Share what your business does, how it makes money, and its legal structure.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <div className="text-2xl mb-2 font-bold text-[#15213C]">2</div>
              <h3 className="font-semibold text-slate-900 mb-1">Answer My Questions</h3>
              <p className="text-sm text-slate-600">
                I'll ask targeted questions to fill in any gaps needed for accurate forecasting.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <div className="text-2xl mb-2 font-bold text-[#15213C]">3</div>
              <h3 className="font-semibold text-slate-900 mb-1">Get Your Forecast</h3>
              <p className="text-sm text-slate-600">
                I'll generate a complete business profile and cashflow forecast ready for analysis.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

