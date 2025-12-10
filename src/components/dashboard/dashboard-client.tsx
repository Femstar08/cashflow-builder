"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CashflowGrid } from "@/components/cashflow/cashflow-grid";
import { MetricsBar } from "@/components/dashboard/metrics-bar";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { RecommendationPanel } from "@/components/dashboard/recommendation-panel";
import { CollaboratorPanel } from "@/components/dashboard/collaborator-panel";
import { PresenterMode } from "@/components/presenter/presenter-mode";
import { EventTree } from "@/components/events/event-tree";
import { BusinessSettingsForm } from "@/components/profile/business-settings-form";
import * as eventService from "@/lib/data/event-service";
import { updateProfileSettings } from "@/app/profile/new/actions";
type CollaboratorMeta = {
  email: string;
  role?: string;
  status?: "pending" | "accepted";
};
import type {
  AiRecommendation,
  BusinessProfile,
  CashflowScenario,
  LineItem,
  Event,
} from "@/types/database";

type DashboardPayload = {
  profile: BusinessProfile;
  scenario: CashflowScenario;
  lineItems: LineItem[];
  recommendations: AiRecommendation[];
};

async function fetchDashboard(profileId: string) {
  const response = await fetch(`/api/dashboard?profileId=${profileId}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Unable to load dashboard data");
  }

  const body = (await response.json()) as { data: DashboardPayload; fallback: boolean };
  return body.data;
}

type DashboardClientProps = {
  profileId: string;
};

export function DashboardClient({ profileId }: DashboardClientProps) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", profileId],
    queryFn: () => fetchDashboard(profileId),
  });

  const [scenarios, setScenarios] = useState<CashflowScenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPresenterMode, setIsPresenterMode] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [recalculationKey, setRecalculationKey] = useState(0);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Trigger recalculation by invalidating queries and updating key
  const triggerRecalculation = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["dashboard", profileId] });
    setRecalculationKey((prev) => prev + 1);
  }, [queryClient, profileId]);

  useEffect(() => {
    if (data) {
      setScenarios([data.scenario]);
      setActiveScenarioId(data.scenario.id);
      setLineItems(data.lineItems);
      setRecommendations(data.recommendations);
      // Load events
      eventService.listEvents(profileId).then(setEvents).catch(console.error);
    }
  }, [data, profileId]);

  // Handle line items changes from grid
  const handleLineItemsChange = useCallback(
    (updatedLineItems: LineItem[]) => {
      setLineItems(updatedLineItems);
      // Trigger recalculation
      setRecalculationKey((prev) => prev + 1);
    },
    []
  );

  if (isLoading || !data || !activeScenarioId) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-300">
        Loading dashboard...
      </div>
    );
  }

  const activeScenario = scenarios.find((scenario) => scenario.id === activeScenarioId) ?? data.scenario;

  const handleCloneScenario = () => {
    const nextScenario: CashflowScenario = {
      ...activeScenario,
      id: `scenario-${Date.now()}`,
      name: `${activeScenario.name} Copy`,
      status: "draft",
      created_at: new Date().toISOString(),
    };

    setScenarios((prev) => [...prev, nextScenario]);
    setActiveScenarioId(nextScenario.id);
  };

  const handleAcceptRecommendation = (id: string) => {
    setRecommendations((prev) => prev.map((item) => (item.id === id ? { ...item, accepted: true } : item)));
  };

  const handleAddToModel = async (recommendation: AiRecommendation) => {
    if (!recommendation.metadata?.suggested_type || !activeScenarioId) return;

    const { suggested_type, suggested_label, suggested_values } = recommendation.metadata;
    const months = lineItems[0]?.monthly_values.length ?? 12;

    try {
      const response = await fetch("/api/line-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_id: activeScenarioId,
          type: suggested_type,
          label: suggested_label || recommendation.summary,
          monthly_values: suggested_values || Array(months).fill(0),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add line item");
      }

      const newLineItem = (await response.json()) as { data: LineItem };
      setLineItems((prev) => [...prev, newLineItem.data]);
      setRecommendations((prev) => prev.map((item) => (item.id === recommendation.id ? { ...item, accepted: true } : item)));
      triggerRecalculation();
    } catch (error) {
      console.error("Failed to add recommendation to model:", error);
    }
  };

  const handleRefreshRecommendations = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/recommendations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: data.profile.id, scenarioId: activeScenario.id }),
      });

      if (!response.ok) {
        throw new Error("Unable to refresh recommendations");
      }

      const body = (await response.json()) as { recommendations: AiRecommendation[] };
      setRecommendations(body.recommendations);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportWorkbook = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: data.profile.id, scenarioId: activeScenario.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to export workbook");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${activeScenario.name.toLowerCase().replace(/\s+/g, "-")}-cashflow.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      setExportError((error as Error).message || "Failed to export workbook");
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  // If presenter mode, show presenter view
  if (isPresenterMode) {
    return (
      <PresenterMode
        profile={data.profile}
        lineItems={lineItems}
        events={events}
        onExit={() => setIsPresenterMode(false)}
        onExport={handleExportWorkbook}
      />
    );
  }

  return (
    <div className="space-y-8">
      <JourneyBreadcrumb activeStep={2} />
      <ProfileHeader profile={data.profile} />
      <ScenarioToolbar
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onSelect={setActiveScenarioId}
        onClone={handleCloneScenario}
        onExport={handleExportWorkbook}
        exporting={isExporting}
      />
      {exportSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          Excel file downloaded successfully!
        </div>
      )}
      {exportError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          Export failed: {exportError}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Cashflow Forecast</h2>
          <p className="mt-1 text-sm text-slate-600">
            Click any cell in the grid below to enter or edit revenue and expense values. Changes save automatically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
            {showSettings ? "Hide" : "Show"} Settings
          </Button>
          <Button onClick={() => setIsPresenterMode(true)} className="bg-[#53E9C5] text-white hover:bg-[#45D9B3]">
            Presenter Mode
          </Button>
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
            // Trigger recalculation
            triggerRecalculation();
          }}
          onCancel={() => setShowSettings(false)}
        />
      )}
      <MetricsBar lineItems={lineItems} profile={data.profile} events={events} />
      <CashflowGrid lineItems={lineItems} onLineItemsChange={handleLineItemsChange} />
      <CashflowChart lineItems={lineItems} profile={data.profile} events={events} />
      <EventTree
        profileId={profileId}
        events={events}
        onEventsChange={async () => {
          const updatedEvents = await eventService.listEvents(profileId);
          setEvents(updatedEvents);
          // Trigger recalculation when events change
          triggerRecalculation();
        }}
      />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">AI insights</p>
          <Button size="sm" variant="outline" onClick={handleRefreshRecommendations} disabled={isRefreshing}>
            {isRefreshing ? "Refreshing..." : "Refresh suggestions"}
          </Button>
        </div>
        <RecommendationPanel
          recommendations={recommendations}
          onAccept={handleAcceptRecommendation}
          onAddToModel={handleAddToModel}
        />
      </div>
      <CollaboratorPanel
        profileName={data.profile.name}
        initialCollaborators={extractCollaborators(data.profile.raw_profile_json)}
      />
    </div>
  );
}

function ProfileHeader({ profile }: { profile: BusinessProfile }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Profile</p>
      <div className="mt-3 flex flex-wrap items-center gap-6">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">{profile.name}</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-300">{profile.description}</p>
        </div>
        <dl className="flex flex-wrap gap-6 text-sm text-neutral-600 dark:text-neutral-300">
          <div>
            <dt className="text-xs uppercase tracking-[0.2em] text-neutral-400">Industry</dt>
            <dd className="font-medium">{profile.industry}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.2em] text-neutral-400">Revenue model</dt>
            <dd className="font-medium">{profile.revenue_model}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.2em] text-neutral-400">HQ</dt>
            <dd className="font-medium">{profile.headquarters}</dd>
          </div>
        </dl>
      </div>
      {profile.notes && (
        <div className="mt-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-200">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Collaboration notes</p>
          <p className="mt-2 whitespace-pre-wrap">{profile.notes}</p>
        </div>
      )}
    </div>
  );
}

const journeySteps = [
  { label: "Profile", href: "/profile/new" },
  { label: "Cashflow", href: "/dashboard/profile-demo" },
  { label: "Review & Export", href: "/exports" },
];

function JourneyBreadcrumb({ activeStep }: { activeStep: number }) {
  return (
    <nav className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
      {journeySteps.map((step, index) => (
        <span key={step.label} className="flex items-center gap-3">
          <a
            href={step.href}
            className={index + 1 === activeStep ? "text-neutral-900 dark:text-white" : ""}
          >
            {index + 1}. {step.label}
          </a>
          {index < journeySteps.length - 1 && <span className="text-neutral-300">→</span>}
        </span>
      ))}
    </nav>
  );
}

function extractCollaborators(metadata: Record<string, unknown>): CollaboratorMeta[] {
  const possible = (metadata as { collaborators?: unknown }).collaborators;
  if (!Array.isArray(possible)) {
    return [];
  }

  return possible.filter((entry): entry is CollaboratorMeta => typeof entry?.email === "string");
}

type ScenarioToolbarProps = {
  scenarios: CashflowScenario[];
  activeScenarioId: string;
  onSelect: (id: string) => void;
  onClone: () => void;
  onExport: () => void;
  exporting: boolean;
};

function ScenarioToolbar({
  scenarios,
  activeScenarioId,
  onSelect,
  onClone,
  onExport,
  exporting,
}: ScenarioToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              scenario.id === activeScenarioId
                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                : "border-neutral-200 text-neutral-600 hover:bg-white dark:border-neutral-800 dark:text-neutral-300"
            }`}
            onClick={() => onSelect(scenario.id)}
          >
            {scenario.name}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onClone}>
          Clone scenario
        </Button>
        <Button size="sm" onClick={onExport} disabled={exporting}>
          {exporting ? "Exporting..." : "Export to Excel"}
        </Button>
      </div>
    </div>
  );
}

