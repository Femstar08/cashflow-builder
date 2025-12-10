"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type SMARTGoal = {
  id: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  status: "draft" | "active" | "completed";
  createdAt: string;
};

type SMARTGoalsPanelProps = {
  goals: SMARTGoal[];
  onAddGoal: (goal: SMARTGoal) => Promise<void>;
  onUpdateGoal: (goalId: string, goal: Partial<SMARTGoal>) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  onAIGenerate: () => Promise<void>;
  isGenerating?: boolean;
};

export function SMARTGoalsPanel({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onAIGenerate,
  isGenerating = false,
}: SMARTGoalsPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<SMARTGoal>>({
    specific: "",
    measurable: "",
    achievable: "",
    relevant: "",
    timeBound: "",
    status: "draft",
  });

  const handleAddGoal = async () => {
    if (!newGoal.specific || !newGoal.measurable || !newGoal.achievable || !newGoal.relevant || !newGoal.timeBound) {
      return;
    }

    const goal: SMARTGoal = {
      id: `goal-${Date.now()}`,
      specific: newGoal.specific!,
      measurable: newGoal.measurable!,
      achievable: newGoal.achievable!,
      relevant: newGoal.relevant!,
      timeBound: newGoal.timeBound!,
      status: "draft",
      createdAt: new Date().toISOString(),
    };

    await onAddGoal(goal);
    setNewGoal({
      specific: "",
      measurable: "",
      achievable: "",
      relevant: "",
      timeBound: "",
      status: "draft",
    });
    setShowAddForm(false);
  };

  return (
    <Card
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span>SMART Goals</span>
          </div>
        </div>
      }
      className="border-2 border-[#53E9C5]/30 bg-gradient-to-br from-white to-[#53E9C5]/5"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={onAIGenerate}
            disabled={isGenerating}
            variant="outline"
            className="flex-1 border-[#53E9C5]/30 text-[#5C6478] hover:bg-[#53E9C5]/10"
          >
            <span className="mr-2">✨</span>
            {isGenerating ? "Generating..." : "AI Generate Goal"}
          </Button>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 bg-[#53E9C5] text-[#15213C] hover:bg-[#45D9B3]"
          >
            <span className="mr-2">+</span>
            Add Goal
          </Button>
        </div>

        {showAddForm && (
          <div className="rounded-xl border-2 border-[#53E9C5]/30 bg-white p-4 space-y-3">
            <div className="grid gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-[#15213C]">S - Specific</span>
                <input
                  type="text"
                  value={newGoal.specific}
                  onChange={(e) => setNewGoal({ ...newGoal, specific: e.target.value })}
                  placeholder="What exactly do you want to achieve?"
                  className="rounded-lg border-2 border-[#5C6478]/20 px-3 py-2 text-sm outline-none focus:border-[#53E9C5]"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-[#15213C]">M - Measurable</span>
                <input
                  type="text"
                  value={newGoal.measurable}
                  onChange={(e) => setNewGoal({ ...newGoal, measurable: e.target.value })}
                  placeholder="How will you measure success?"
                  className="rounded-lg border-2 border-[#5C6478]/20 px-3 py-2 text-sm outline-none focus:border-[#53E9C5]"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-[#15213C]">A - Achievable</span>
                <input
                  type="text"
                  value={newGoal.achievable}
                  onChange={(e) => setNewGoal({ ...newGoal, achievable: e.target.value })}
                  placeholder="Is this goal realistic and attainable?"
                  className="rounded-lg border-2 border-[#5C6478]/20 px-3 py-2 text-sm outline-none focus:border-[#53E9C5]"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-[#15213C]">R - Relevant</span>
                <input
                  type="text"
                  value={newGoal.relevant}
                  onChange={(e) => setNewGoal({ ...newGoal, relevant: e.target.value })}
                  placeholder="Why is this goal important?"
                  className="rounded-lg border-2 border-[#5C6478]/20 px-3 py-2 text-sm outline-none focus:border-[#53E9C5]"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-[#15213C]">T - Time-bound</span>
                <input
                  type="text"
                  value={newGoal.timeBound}
                  onChange={(e) => setNewGoal({ ...newGoal, timeBound: e.target.value })}
                  placeholder="When will you achieve this goal?"
                  className="rounded-lg border-2 border-[#5C6478]/20 px-3 py-2 text-sm outline-none focus:border-[#53E9C5]"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddGoal}
                className="flex-1 bg-[#53E9C5] text-[#15213C] hover:bg-[#45D9B3]"
              >
                Create Goal
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false);
                  setNewGoal({
                    specific: "",
                    measurable: "",
                    achievable: "",
                    relevant: "",
                    timeBound: "",
                    status: "draft",
                  });
                }}
                variant="outline"
                className="border-[#5C6478]/30"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {goals.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[#5C6478]/30 bg-[#5C6478]/5 p-8 text-center">
            <p className="text-sm font-semibold text-[#5C6478] mb-2">No goals set yet</p>
            <p className="text-xs text-[#5C6478]/70">Create a SMART goal to track your progress!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => (
              <SMARTGoalCard
                key={goal.id}
                goal={goal}
                onUpdate={onUpdateGoal}
                onDelete={onDeleteGoal}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

type SMARTGoalCardProps = {
  goal: SMARTGoal;
  onUpdate: (goalId: string, goal: Partial<SMARTGoal>) => Promise<void>;
  onDelete: (goalId: string) => Promise<void>;
};

function SMARTGoalCard({ goal, onUpdate, onDelete }: SMARTGoalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border-2 border-[#53E9C5]/30 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-[#15213C]">{goal.specific}</h4>
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
              goal.status === "completed" 
                ? "bg-green-100 text-green-700"
                : goal.status === "active"
                ? "bg-[#53E9C5]/20 text-[#15213C]"
                : "bg-[#5C6478]/10 text-[#5C6478]"
            }`}>
              {goal.status}
            </span>
          </div>
          <p className="text-sm text-[#5C6478] mb-2">{goal.measurable}</p>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-[#53E9C5] hover:underline"
          >
            {isExpanded ? "Show less" : "Show details"}
          </button>
          {isExpanded && (
            <div className="mt-3 space-y-2 text-sm">
              <div>
                <span className="font-semibold text-[#15213C]">Achievable: </span>
                <span className="text-[#5C6478]">{goal.achievable}</span>
              </div>
              <div>
                <span className="font-semibold text-[#15213C]">Relevant: </span>
                <span className="text-[#5C6478]">{goal.relevant}</span>
              </div>
              <div>
                <span className="font-semibold text-[#15213C]">Time-bound: </span>
                <span className="text-[#5C6478]">{goal.timeBound}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onUpdate(goal.id, { status: goal.status === "active" ? "completed" : "active" })}
            className="rounded-lg p-2 text-[#5C6478] hover:bg-[#5C6478]/10"
            title="Toggle status"
          >
            {goal.status === "completed" ? "✓" : "→"}
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
            title="Delete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

