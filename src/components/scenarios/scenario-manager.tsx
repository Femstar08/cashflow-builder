"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CashflowScenario } from "@/types/database";
import type { HorizonId } from "@/lib/utils";

type ScenarioManagerProps = {
  scenarios: CashflowScenario[];
  activeScenarioId: string | null;
  onSelectScenario: (scenarioId: string) => void;
  onCreateScenario: (name: string, horizon: HorizonId) => Promise<void>;
  onCloneScenario: (scenarioId: string) => Promise<void>;
  onDeleteScenario: (scenarioId: string) => Promise<void>;
  onCompareScenarios?: (scenarioIds: string[]) => void;
};

export function ScenarioManager({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onCreateScenario,
  onCloneScenario,
  onDeleteScenario,
  onCompareScenarios,
}: ScenarioManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");
  const [newScenarioHorizon, setNewScenarioHorizon] = useState<HorizonId>("1y");

  const handleCreateScenario = async () => {
    if (!newScenarioName.trim()) return;
    await onCreateScenario(newScenarioName, newScenarioHorizon);
    setNewScenarioName("");
    setShowCreateForm(false);
  };

  return (
    <Card
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span>Scenarios</span>
          </div>
        </div>
      }
      className="border-2 border-[#53E9C5]/30 bg-gradient-to-br from-white to-[#53E9C5]/5"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex-1 bg-[#53E9C5] text-[#15213C] hover:bg-[#45D9B3]"
          >
            <span className="mr-2">+</span>
            Create Scenario
          </Button>
          {onCompareScenarios && scenarios.length > 1 && (
            <Button
              onClick={() => onCompareScenarios(scenarios.map((s) => s.id))}
              variant="outline"
              className="border-[#53E9C5]/30 text-[#5C6478] hover:bg-[#53E9C5]/10"
            >
              Compare
            </Button>
          )}
        </div>

        {showCreateForm && (
          <div className="rounded-xl border-2 border-[#53E9C5]/30 bg-white p-4 space-y-3">
            <input
              type="text"
              placeholder="Scenario name (e.g., Base Case, Optimistic, Pessimistic)"
              value={newScenarioName}
              onChange={(e) => setNewScenarioName(e.target.value)}
              className="w-full rounded-lg border-2 border-[#5C6478]/20 px-3 py-2 text-sm outline-none focus:border-[#53E9C5]"
            />
            <select
              value={newScenarioHorizon}
              onChange={(e) => setNewScenarioHorizon(e.target.value as HorizonId)}
              className="w-full rounded-lg border-2 border-[#5C6478]/20 px-3 py-2 text-sm outline-none focus:border-[#53E9C5]"
            >
              <option value="1y">1 Year</option>
              <option value="3y">3 Years</option>
              <option value="5y">5 Years</option>
              <option value="10y">10 Years</option>
            </select>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateScenario}
                className="flex-1 bg-[#53E9C5] text-[#15213C] hover:bg-[#45D9B3]"
              >
                Create
              </Button>
              <Button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewScenarioName("");
                }}
                variant="outline"
                className="border-[#5C6478]/30"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {scenarios.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[#5C6478]/30 bg-[#5C6478]/5 p-8 text-center">
            <p className="text-sm font-semibold text-[#5C6478] mb-2">No scenarios created yet</p>
            <p className="text-xs text-[#5C6478]/70">Create your first scenario to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`rounded-xl border-2 p-4 transition-all ${
                  scenario.id === activeScenarioId
                    ? "border-[#53E9C5] bg-[#53E9C5]/10"
                    : "border-[#5C6478]/20 bg-white hover:border-[#53E9C5]/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-[#15213C]">{scenario.name}</h4>
                      <span className="rounded-full bg-[#5C6478]/10 px-2 py-1 text-xs text-[#5C6478]">
                        {scenario.horizon}
                      </span>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        scenario.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-[#5C6478]/10 text-[#5C6478]"
                      }`}>
                        {scenario.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#5C6478]">
                      Created {new Date(scenario.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {scenario.id !== activeScenarioId && (
                      <button
                        onClick={() => onSelectScenario(scenario.id)}
                        className="rounded-lg px-3 py-1 text-xs font-semibold bg-[#53E9C5] text-[#15213C] hover:bg-[#45D9B3]"
                      >
                        Select
                      </button>
                    )}
                    <button
                      onClick={() => onCloneScenario(scenario.id)}
                      className="rounded-lg p-2 text-[#5C6478] hover:bg-[#5C6478]/10"
                      title="Clone"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => onDeleteScenario(scenario.id)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

