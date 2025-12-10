import type { BusinessProfile, CashflowScenario, LineItem } from "@/types/database";

export function buildProfileDraftPrompt(url?: string, hint?: string, description?: string, textInput?: string) {
  const parts: string[] = ["You are an FP&A analyst."];

  if (textInput) {
    parts.push("Analyze the following business information and extract structured data:");
    parts.push(`\n${textInput}\n`);
    parts.push("Summarize this business into JSON with keys: name, industry, description, headquarters, revenue_model.");
  } else if (url) {
    parts.push(`Summarize the business behind ${url} into JSON with keys: name, industry, description, headquarters, revenue_model.`);
  } else {
    parts.push("Summarize the business into JSON with keys: name, industry, description, headquarters, revenue_model.");
  }

  if (url && textInput) {
    parts.push(`Additional context: Website URL is ${url}.`);
  }

  if (hint) {
    parts.push(`Industry context: ${hint}.`);
  }

  if (description) {
    parts.push(`User provided description: ${description}.`);
  }

  parts.push("Answer ONLY with valid JSON.");

  return parts.filter(Boolean).join("\n");
}

export function buildRecommendationPrompt(params: {
  profile: BusinessProfile;
  scenario: CashflowScenario;
  lineItems: LineItem[];
}) {
  const revenueItems = params.lineItems.filter((item) => item.type === "revenue");
  const expenseItems = params.lineItems.filter((item) => item.type === "cogs" || item.type === "opex");
  
  const businessContext = {
    name: params.profile.name,
    industry: params.profile.industry,
    revenue_model: params.profile.revenue_model,
    entity_type: params.profile.entity_type || "limited_company",
    accounting_basis: params.profile.accounting_basis || "accrual",
    vat_enabled: params.profile.vat_enabled || false,
    vat_basis: params.profile.vat_basis,
    include_corporation_tax: params.profile.include_corporation_tax || false,
    include_paye_nic: params.profile.include_paye_nic || false,
    include_dividends: params.profile.include_dividends || false,
    debtor_days: params.profile.debtor_days,
    creditor_days: params.profile.creditor_days,
  };

  return `
You are an expert FP&A analyst analyzing a cashflow forecast for ${params.profile.name}.

BUSINESS CONTEXT:
${JSON.stringify(businessContext, null, 2)}

CURRENT REVENUE ITEMS:
${revenueItems.map((item) => `- ${item.label}: ${item.monthly_values.slice(0, 3).join(", ")}...`).join("\n") || "None"}

CURRENT EXPENSE ITEMS:
${expenseItems.map((item) => `- ${item.label} (${item.type}): ${item.monthly_values.slice(0, 3).join(", ")}...`).join("\n") || "None"}

SCENARIO ASSUMPTIONS:
${JSON.stringify(params.scenario.base_assumptions || {}, null, 2)}

ANALYSIS REQUIREMENTS:
1. Consider the entity type (${businessContext.entity_type}) - ${businessContext.entity_type === "sole_trader" ? "Sole traders cannot have corporation tax or dividends" : "Limited companies can have CT and dividends"}
2. Consider accounting basis (${businessContext.accounting_basis}) - ${businessContext.accounting_basis === "cash" ? "Cash basis means immediate cash recognition, no working capital adjustments" : "Accrual basis allows working capital timing adjustments"}
3. Consider tax settings - VAT: ${businessContext.vat_enabled ? "Enabled" : "Disabled"}, CT: ${businessContext.include_corporation_tax ? "Enabled" : "Disabled"}, PAYE/NIC: ${businessContext.include_paye_nic ? "Enabled" : "Disabled"}
4. Consider industry patterns for ${businessContext.industry || "this industry"}
5. Identify missing revenue categories typical for this business model
6. Identify missing expense categories (COGS, OPEX) typical for this industry
7. Suggest appropriate working capital settings if accrual basis
8. Suggest tax optimizations based on entity type and current settings

Return a JSON object with the following structure:
{
  "suggested_revenue_items": [
    {
      "label": "Item name",
      "monthly_values": [array of numbers, same length as forecast horizon],
      "explanation": "Why this revenue item is recommended"
    }
  ],
  "suggested_expense_items": [
    {
      "label": "Item name",
      "type": "cogs" or "opex",
      "monthly_values": [array of numbers, same length as forecast horizon],
      "explanation": "Why this expense item is recommended"
    }
  ],
  "suggested_working_capital": {
    "debtor_days": number (if applicable),
    "creditor_days": number (if applicable),
    "explanation": "Why these working capital settings are recommended"
  },
  "suggested_tax_switches": {
    "vat_enabled": boolean (if change recommended),
    "include_corporation_tax": boolean (if change recommended),
    "include_paye_nic": boolean (if change recommended),
    "include_dividends": boolean (if change recommended),
    "explanation": "Why these tax settings are recommended"
  },
  "missing_cost_categories": ["category1", "category2"],
  "missing_revenue_categories": ["category1", "category2"]
}

Also return a "recommendations" array (for UI display) with 3-5 recommendation objects. Each object should have:
- summary: Brief recommendation title (max 60 chars)
- detail: Detailed explanation of the recommendation
- source: One of "profile", "line-item", "insight", "tax-optimization", "working-capital"
- category: One of "revenue", "expense", "tax", "working-capital", "general"
- suggested_type: (optional) If suggesting a new line item: "revenue", "cogs", or "opex"
- suggested_label: (optional) Suggested label for the new line item
- suggested_values: (optional) Array of monthly values for the new line item (same length as forecast horizon)

Focus on actionable, specific recommendations that improve forecast accuracy.
`;
}

