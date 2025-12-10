"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RevenueExpensePanels } from "@/components/cashflow/revenue-expense-panels";
import { SMARTGoalsPanel, type SMARTGoal } from "@/components/goals/smart-goals-panel";
import { AIChatPanel } from "@/components/ai/ai-chat-panel";
import { ScenarioManager } from "@/components/scenarios/scenario-manager";
import { MetricsBar } from "@/components/dashboard/metrics-bar";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { CashflowGrid } from "@/components/cashflow/cashflow-grid";
import { BusinessSettingsForm } from "@/components/profile/business-settings-form";
import { PresenterMode } from "@/components/presenter/presenter-mode";
import { EventTree } from "@/components/events/event-tree";
import * as eventService from "@/lib/data/event-service";
import { updateProfileSettings } from "@/app/profile/new/actions";
import type {
  AiRecommendation,
  BusinessProfile,
  CashflowScenario,
  LineItem,
  Event,
  LineItemType,
} from "@/types/database";
import type { HorizonId } from "@/lib/utils";

type DashboardPayload = {
  profile: BusinessProfile;
  scenario: CashflowScenario;
  lineItems: LineItem[];
  recommendations: AiRecommendation[];
  events: Event[];
};

async function fetchDashboard(profileId: string) {
  const response = await fetch(`/api/dashboard?profileId=${profileId}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to load dashboard data");
  }
  const body = (await response.json()) as { data: DashboardPayload; fallback: boolean };
  return body.data;
}

type EnhancedDashboardProps = {
  profileId: string;
};

export function EnhancedDashboard({ profileId }: EnhancedDashboardProps) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", profileId],
    queryFn: () => fetchDashboard(profileId),
  });

  const [scenarios, setScenarios] = useState<CashflowScenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [goals, setGoals] = useState<SMARTGoal[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isPresenterMode, setIsPresenterMode] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [activeTab, setActiveTab] = useState<"forecast" | "scenarios" | "goals" | "insights">("forecast");

  useEffect(() => {
    if (data) {
      setScenarios([data.scenario]);
      setActiveScenarioId(data.scenario.id);
      setLineItems(data.lineItems);
      setEvents(data.events || []);
      loadGoals();
    }
  }, [data, profileId]);

  const loadGoals = async () => {
    try {
      const response = await fetch(`/api/goals?profileId=${profileId}`);
      if (response.ok) {
        const { goals: loadedGoals } = await response.json();
        setGoals(loadedGoals || []);
      }
    } catch (error) {
      console.error("Failed to load goals:", error);
    }
  };

  const handleAddLineItem = async (type: LineItemType, label: string, monthlyValues: number[]) => {
    if (!activeScenarioId) return;

    try {
      const response = await fetch("/api/line-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_id: activeScenarioId,
          type,
          label,
          monthly_values: monthlyValues,
        }),
      });

      if (!response.ok) throw new Error("Failed to add line item");

      const { data: newItem } = await response.json();
      setLineItems((prev) => [...prev, newItem]);
      queryClient.invalidateQueries({ queryKey: ["dashboard", profileId] });
    } catch (error) {
      console.error("Failed to add line item:", error);
    }
  };

  const handleDeleteLineItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/line-items?id=${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete line item");

      setLineItems((prev) => prev.filter((item) => item.id !== itemId));
      queryClient.invalidateQueries({ queryKey: ["dashboard", profileId] });
    } catch (error) {
      console.error("Failed to delete line item:", error);
    }
  };

  const handleAISuggest = async (type: "revenue" | "expense") => {
    if (!data || !activeScenarioId) return;

    setIsSuggesting(true);
    try {
      const response = await fetch("/api/recommendations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: data.profile.id, scenarioId: activeScenarioId }),
      });

      if (!response.ok) throw new Error("Unable to generate suggestions");

      const { recommendations } = await response.json();
      
      // Filter recommendations by type and show first one
      const filtered = recommendations.filter((rec: AiRecommendation) => {
        const suggestedType = rec.metadata?.suggested_type;
        return type === "revenue" ? suggestedType === "revenue" : suggestedType === "cogs" || suggestedType === "opex";
      });

      if (filtered.length > 0) {
        const rec = filtered[0];
        if (rec.metadata?.suggested_type && rec.metadata?.suggested_label && rec.metadata?.suggested_values) {
          await handleAddLineItem(
            rec.metadata.suggested_type as LineItemType,
            rec.metadata.suggested_label,
            rec.metadata.suggested_values
          );
        }
      }
    } catch (error) {
      console.error("Failed to get AI suggestions:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAddGoal = async (goal: SMARTGoal) => {
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, goal }),
      });

      if (!response.ok) throw new Error("Failed to create goal");

      const { goal: newGoal } = await response.json();
      setGoals((prev) => [...prev, newGoal]);
    } catch (error) {
      console.error("Failed to add goal:", error);
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<SMARTGoal>) => {
    try {
      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, goalId, updates }),
      });

      if (!response.ok) throw new Error("Failed to update goal");

      const { goal: updatedGoal } = await response.json();
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updatedGoal : g)));
    } catch (error) {
      console.error("Failed to update goal:", error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals?profileId=${profileId}&goalId=${goalId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete goal");

      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  const handleAIGenerateGoal = async () => {
    // This would call an AI endpoint to generate a SMART goal
    // For now, we'll create a placeholder
    const aiGeneratedGoal: SMARTGoal = {
      id: `goal-${Date.now()}`,
      specific: "Increase monthly recurring revenue by 20%",
      measurable: "Track MRR growth from current baseline",
      achievable: "Based on current growth trajectory and market conditions",
      relevant: "Critical for achieving profitability and scaling the business",
      timeBound: "Within the next 6 months",
      status: "draft",
      createdAt: new Date().toISOString(),
    };
    await handleAddGoal(aiGeneratedGoal);
  };

  const handleAIChat = async (message: string): Promise<string> => {
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          profileId,
          scenarioId: activeScenarioId,
          lineItems,
        }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const { response: aiResponse } = await response.json();
      return aiResponse;
    } catch (error) {
      console.error("AI chat error:", error);
      return "Sorry, I encountered an error. Please try again.";
    }
  };

  const handleCreateScenario = async (name: string, horizon: HorizonId) => {
    if (!data) return;

    try {
      const response = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: data.profile.id,
          name,
          horizon,
        }),
      });

      if (!response.ok) throw new Error("Failed to create scenario");

      const { data: newScenario } = await response.json();
      setScenarios((prev) => [...prev, newScenario]);
      setActiveScenarioId(newScenario.id);
    } catch (error) {
      console.error("Failed to create scenario:", error);
    }
  };

  const handleCloneScenario = async (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;

    await handleCreateScenario(`${scenario.name} Copy`, scenario.horizon);
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    try {
      const response = await fetch(`/api/scenarios?id=${scenarioId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete scenario");

      setScenarios((prev) => prev.filter((s) => s.id !== scenarioId));
      if (activeScenarioId === scenarioId && scenarios.length > 1) {
        setActiveScenarioId(scenarios.find((s) => s.id !== scenarioId)?.id || null);
      }
    } catch (error) {
      console.error("Failed to delete scenario:", error);
    }
  };

  if (isLoading || !data || !activeScenarioId) {
    return (
      <div className="rounded-2xl border border-dashed border-[#5C6478]/30 p-8 text-center text-sm text-[#5C6478]">
        Loading dashboard...
      </div>
    );
  }

  if (isPresenterMode) {
    return (
      <PresenterMode
        profile={data.profile}
        lineItems={lineItems}
        events={events}
        onExit={() => setIsPresenterMode(false)}
        onExport={async () => {
          if (!data || !activeScenarioId) return;
          
          try {
            const response = await fetch("/api/export", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ profileId: data.profile.id, scenarioId: activeScenarioId }),
            });

            if (!response.ok) throw new Error("Failed to export");

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `${data.scenario.name.toLowerCase().replace(/\s+/g, "-")}-cashflow.xlsx`;
            anchor.click();
            URL.revokeObjectURL(url);
          } catch (error) {
            console.error("Export error:", error);
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-[#E1E4EA] bg-[#15213C] p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{data.profile.name}</h1>
            <p className="mt-1 text-sm text-white/70">{data.profile.description || "Cashflow forecast"}</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              Settings
            </Button>
            <Button
              onClick={() => setIsPresenterMode(true)}
            >
              Presenter Mode
            </Button>
          </div>
        </div>
      </div>

      {showSettings && (
        <BusinessSettingsForm
          profile={data.profile}
          onSave={async (settings) => {
            await updateProfileSettings({
              profileId: data.profile.id,
              settings: settings as any,
            });
            setShowSettings(false);
            queryClient.invalidateQueries({ queryKey: ["dashboard", profileId] });
          }}
          onCancel={() => setShowSettings(false)}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E1E4EA]">
        {[
          { id: "forecast", label: "Forecast" },
          { id: "scenarios", label: "Scenarios" },
          { id: "goals", label: "Goals" },
          { id: "insights", label: "AI Insights" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`relative px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-[#15213C]"
                : "text-[#5C6478] hover:text-[#15213C]"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#53E9C5] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "forecast" && (
        <div className="space-y-6">
          <RevenueExpensePanels
            lineItems={lineItems}
            onAddItem={handleAddLineItem}
            onEditItem={(item) => {
              // Edit logic - could open a modal
              console.log("Edit item:", item);
            }}
            onDeleteItem={handleDeleteLineItem}
            onAISuggest={handleAISuggest}
            isSuggesting={isSuggesting}
          />

          <MetricsBar 
            lineItems={lineItems} 
            profile={data.profile}
            events={events}
            openingBalance={0}
          />

          <Card>
            <h3 className="mb-4 text-lg font-semibold text-[#15213C]">Detailed Forecast Grid</h3>
            <CashflowGrid
              lineItems={lineItems}
              onLineItemsChange={(updated) => {
                setLineItems(updated);
                queryClient.invalidateQueries({ queryKey: ["dashboard", profileId] });
              }}
            />
          </Card>

          <CashflowChart 
            lineItems={lineItems} 
            profile={data.profile}
            events={events}
            openingBalance={0}
          />

          <EventTree
            profileId={profileId}
            events={events}
            onEventsChange={async () => {
              const updatedEvents = await eventService.listEvents(profileId);
              setEvents(updatedEvents);
              queryClient.invalidateQueries({ queryKey: ["dashboard", profileId] });
            }}
          />
        </div>
      )}

      {activeTab === "scenarios" && (
        <ScenarioManager
          scenarios={scenarios}
          activeScenarioId={activeScenarioId}
          onSelectScenario={setActiveScenarioId}
          onCreateScenario={handleCreateScenario}
          onCloneScenario={handleCloneScenario}
          onDeleteScenario={handleDeleteScenario}
        />
      )}

      {activeTab === "goals" && (
        <SMARTGoalsPanel
          goals={goals}
          onAddGoal={handleAddGoal}
          onUpdateGoal={handleUpdateGoal}
          onDeleteGoal={handleDeleteGoal}
          onAIGenerate={handleAIGenerateGoal}
        />
      )}

      {activeTab === "insights" && (
        <AIChatPanel onSendMessage={handleAIChat} />
      )}
    </div>
  );
}

