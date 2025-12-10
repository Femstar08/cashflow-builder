"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getActiveAssumptions, groupAssumptionsByCategory, type ProfileAssumption } from "@/lib/ai/assumption-tracking";

type AssumptionsPanelProps = {
  profileId: string;
};

const categoryLabels: Record<string, string> = {
  staffing: "Staffing",
  revenue: "Revenue",
  costs: "Costs",
  tax: "Tax & Accounting",
  working_capital: "Working Capital",
  events: "Events",
  other: "Other",
};

export function AssumptionsPanel({ profileId }: AssumptionsPanelProps) {
  const [assumptions, setAssumptions] = useState<ProfileAssumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAssumptions();
  }, [profileId]);

  const loadAssumptions = async () => {
    try {
      const response = await fetch(`/api/profile/assumptions?profileId=${profileId}&status=active`);
      if (response.ok) {
        const data = await response.json();
        const activeAssumptions = getActiveAssumptions(data.assumptions || []);
        setAssumptions(activeAssumptions);
        
        // Expand all categories by default
        const categories = new Set(activeAssumptions.map(a => a.category || "other"));
        setExpandedCategories(categories);
      }
    } catch (error) {
      console.error("Failed to load assumptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <Card className="p-4">
        <p className="text-sm text-[#5C6478]">Loading assumptions...</p>
      </Card>
    );
  }

  if (assumptions.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold text-[#15213C] mb-2">Assumptions</h3>
        <p className="text-sm text-[#5C6478]">No assumptions recorded yet</p>
      </Card>
    );
  }

  const grouped = groupAssumptionsByCategory(assumptions);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#15213C]">Assumptions</h3>
        <span className="text-xs text-[#5C6478]">{assumptions.length} active</span>
      </div>

      <div className="space-y-3">
        {Object.entries(grouped).map(([category, categoryAssumptions]) => {
          if (categoryAssumptions.length === 0) return null;
          
          const isExpanded = expandedCategories.has(category);
          const label = categoryLabels[category] || category;

          return (
            <div key={category} className="border border-[#E1E4EA] rounded-lg">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-[#F5F7FA] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-[#15213C]">{label}</span>
                  <span className="text-xs text-[#5C6478] bg-[#E1E4EA] px-2 py-0.5 rounded">
                    {categoryAssumptions.length}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-[#5C6478] transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-2 border-t border-[#E1E4EA]">
                  {categoryAssumptions.map((assumption) => (
                    <div
                      key={assumption.id}
                      className="pt-2 text-sm text-[#15213C]"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-[#53E9C5] mt-0.5">•</span>
                        <div className="flex-1">
                          <p>{assumption.assumption}</p>
                          {assumption.reason && (
                            <p className="text-xs text-[#5C6478] mt-1 ml-4">
                              {assumption.reason}
                            </p>
                          )}
                          <p className="text-xs text-[#5C6478] mt-1">
                            {new Date(assumption.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

