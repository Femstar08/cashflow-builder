import { getOpenAIClient, getOpenAIModel } from "@/lib/ai/client";
import { buildRecommendationPrompt } from "@/lib/ai/prompts";
import type { BusinessProfile, CashflowScenario, LineItem } from "@/types/database";
import { mockRecommendations } from "@/lib/cashflow/mock-data";

export async function generateScenarioRecommendations(input: {
  profile: BusinessProfile;
  scenario: CashflowScenario;
  lineItems: LineItem[];
}) {
  const openai = getOpenAIClient();
  const prompt = buildRecommendationPrompt(input);

  if (!openai) {
    return mockRecommendations;
  }

  try {
    const model = getOpenAIModel();
    const response = await openai.chat.completions.create({
      model,
      temperature: 0.3,
      messages: [
        { role: "system", content: "You analyze cashflow tables and output JSON suggestions." },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return mockRecommendations;
    }

    try {
      const parsed = JSON.parse(content) as {
        suggested_revenue_items?: Array<{
          label: string;
          monthly_values: number[];
          explanation: string;
        }>;
        suggested_expense_items?: Array<{
          label: string;
          type: "cogs" | "opex";
          monthly_values: number[];
          explanation: string;
        }>;
        suggested_working_capital?: {
          debtor_days?: number;
          creditor_days?: number;
          explanation: string;
        };
        suggested_tax_switches?: {
          vat_enabled?: boolean;
          include_corporation_tax?: boolean;
          include_paye_nic?: boolean;
          include_dividends?: boolean;
          explanation: string;
        };
        missing_cost_categories?: string[];
        missing_revenue_categories?: string[];
        recommendations?: Array<{
          summary: string;
          detail?: string;
          source: "profile" | "line-item" | "insight" | "tax-optimization" | "working-capital";
          category?: "revenue" | "expense" | "tax" | "working-capital" | "general";
          suggested_type?: "revenue" | "cogs" | "opex";
          suggested_label?: string;
          suggested_values?: number[];
        }>;
      };

      // Convert structured format to recommendation array format
      const recommendations: Array<{
        id: string;
        scenario_id: string;
        line_item_id: null;
        created_at: string;
        accepted: boolean;
        summary: string;
        detail: string | null;
        source: string;
        metadata: any;
      }> = [];

      // Add revenue item recommendations
      if (parsed.suggested_revenue_items) {
        parsed.suggested_revenue_items.forEach((item, index) => {
          recommendations.push({
            id: `ai-${Date.now()}-rev-${index}`,
            scenario_id: input.scenario.id,
            line_item_id: null,
            created_at: new Date().toISOString(),
            accepted: false,
            summary: `Add revenue: ${item.label}`,
            detail: item.explanation,
            source: "line-item",
            metadata: {
              category: "revenue",
              suggested_type: "revenue",
              suggested_label: item.label,
              suggested_values: item.monthly_values,
            },
          });
        });
      }

      // Add expense item recommendations
      if (parsed.suggested_expense_items) {
        parsed.suggested_expense_items.forEach((item, index) => {
          recommendations.push({
            id: `ai-${Date.now()}-exp-${index}`,
            scenario_id: input.scenario.id,
            line_item_id: null,
            created_at: new Date().toISOString(),
            accepted: false,
            summary: `Add ${item.type}: ${item.label}`,
            detail: item.explanation,
            source: "line-item",
            metadata: {
              category: "expense",
              suggested_type: item.type,
              suggested_label: item.label,
              suggested_values: item.monthly_values,
            },
          });
        });
      }

      // Add working capital recommendation
      if (parsed.suggested_working_capital) {
        recommendations.push({
          id: `ai-${Date.now()}-wc`,
          scenario_id: input.scenario.id,
          line_item_id: null,
          created_at: new Date().toISOString(),
          accepted: false,
          summary: "Optimize working capital settings",
          detail: parsed.suggested_working_capital.explanation,
          source: "working-capital",
          metadata: {
            category: "working-capital",
            suggested_working_capital: {
              debtor_days: parsed.suggested_working_capital.debtor_days,
              creditor_days: parsed.suggested_working_capital.creditor_days,
            },
          },
        });
      }

      // Add tax switches recommendation
      if (parsed.suggested_tax_switches) {
        recommendations.push({
          id: `ai-${Date.now()}-tax`,
          scenario_id: input.scenario.id,
          line_item_id: null,
          created_at: new Date().toISOString(),
          accepted: false,
          summary: "Review tax settings",
          detail: parsed.suggested_tax_switches.explanation,
          source: "tax-optimization",
          metadata: {
            category: "tax",
            suggested_tax_switches: {
              vat_enabled: parsed.suggested_tax_switches.vat_enabled,
              include_corporation_tax: parsed.suggested_tax_switches.include_corporation_tax,
              include_paye_nic: parsed.suggested_tax_switches.include_paye_nic,
              include_dividends: parsed.suggested_tax_switches.include_dividends,
            },
          },
        });
      }

      // Add missing categories recommendations
      if (parsed.missing_revenue_categories && parsed.missing_revenue_categories.length > 0) {
        recommendations.push({
          id: `ai-${Date.now()}-missing-rev`,
          scenario_id: input.scenario.id,
          line_item_id: null,
          created_at: new Date().toISOString(),
          accepted: false,
          summary: `Missing revenue categories: ${parsed.missing_revenue_categories.join(", ")}`,
          detail: "Consider adding these revenue categories to improve forecast completeness.",
          source: "insight",
          metadata: {
            category: "revenue",
            missing_categories: parsed.missing_revenue_categories,
          },
        });
      }

      if (parsed.missing_cost_categories && parsed.missing_cost_categories.length > 0) {
        recommendations.push({
          id: `ai-${Date.now()}-missing-cost`,
          scenario_id: input.scenario.id,
          line_item_id: null,
          created_at: new Date().toISOString(),
          accepted: false,
          summary: `Missing cost categories: ${parsed.missing_cost_categories.join(", ")}`,
          detail: "Consider adding these cost categories to improve forecast completeness.",
          source: "insight",
          metadata: {
            category: "expense",
            missing_categories: parsed.missing_cost_categories,
          },
        });
      }

      // Add any additional recommendations from the recommendations array
      if (parsed.recommendations) {
        parsed.recommendations.forEach((item, index) => {
          recommendations.push({
            id: `ai-${Date.now()}-${index}`,
            scenario_id: input.scenario.id,
            line_item_id: null,
            created_at: new Date().toISOString(),
            accepted: false,
            summary: item.summary,
            detail: item.detail ?? null,
            source: item.source,
            metadata: item.category || item.suggested_type
              ? {
                  category: item.category,
                  suggested_type: item.suggested_type,
                  suggested_label: item.suggested_label,
                  suggested_values: item.suggested_values,
                }
              : null,
          });
        });
      }

      return recommendations.length > 0 ? recommendations : mockRecommendations;
    } catch {
      return mockRecommendations;
    }
  } catch (error) {
    // Handle 403 (model access) or other API errors gracefully
    console.warn("[ai] OpenAI API error, using fallback:", (error as Error).message);
    return mockRecommendations;
  }
}

