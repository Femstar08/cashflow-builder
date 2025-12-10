import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { AiRecommendation } from "@/types/database";

type RecommendationPanelProps = {
  recommendations: AiRecommendation[];
  onAccept?: (id: string) => void;
  onAddToModel?: (recommendation: AiRecommendation) => void;
};

const categoryLabels: Record<string, string> = {
  revenue: "Revenue Suggestions",
  expense: "Expense Suggestions",
  tax: "Tax Optimizations",
  "working-capital": "Working Capital",
  general: "General Recommendations",
};

export function RecommendationPanel({ recommendations, onAccept, onAddToModel }: RecommendationPanelProps) {
  // Group recommendations by category
  const groupedRecommendations = useMemo(() => {
    const groups: Record<string, AiRecommendation[]> = {};
    const uncategorized: AiRecommendation[] = [];

    recommendations.forEach((rec) => {
      const category = rec.metadata?.category || "general";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(rec);
    });

    return { groups, uncategorized };
  }, [recommendations]);

  if (!recommendations.length) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
        No recommendations yet. Run a scenario or tweak assumptions to generate insights.
      </div>
    );
  }

  const categoryOrder: (string | undefined)[] = ["revenue", "expense", "tax", "working-capital", "general"];

  return (
    <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Recommendations</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-300">Historical hints + next actions</p>
      </div>

      {categoryOrder.map((category) => {
        const items = groupedRecommendations.groups[category || "general"] || [];
        if (items.length === 0) return null;

        const canAddToModel = items.some(
          (item) => !item.accepted && (item.metadata?.suggested_type === "revenue" || item.metadata?.suggested_type === "cogs" || item.metadata?.suggested_type === "opex")
        );

        return (
          <div key={category || "general"} className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {categoryLabels[category || "general"] || "Recommendations"}
            </h3>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="rounded-xl border border-neutral-100 p-3 dark:border-neutral-800">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{item.summary}</p>
                  {item.detail && <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{item.detail}</p>}
                  {!item.accepted && (
                    <div className="mt-3 flex items-center gap-2">
                      {canAddToModel && item.metadata?.suggested_type && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs bg-[#53E9C5] text-white hover:bg-[#45D9B3]"
                          onClick={() => onAddToModel?.(item)}
                        >
                          Add to Model
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => onAccept?.(item.id)}
                      >
                        Mark as applied
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

