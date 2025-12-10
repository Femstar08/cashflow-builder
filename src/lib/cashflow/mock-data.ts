import type {
  AiRecommendation,
  BusinessProfile,
  CashflowScenario,
  LineItem,
  LineItemType,
} from "@/types/database";

const now = new Date().toISOString();

const makeLineItem = (opts: {
  id: string;
  label: string;
  type: LineItemType;
  monthly_values: number[];
}): LineItem => ({
  id: opts.id,
  scenario_id: "scenario-base",
  created_at: now,
  type: opts.type,
  label: opts.label,
  formula: null,
  metadata: {},
  monthly_values: opts.monthly_values,
});

export const mockProfile: BusinessProfile = {
  id: "profile-demo",
  owner_id: "demo-owner",
  created_at: now,
  updated_at: now,
  name: "Northwind Analytics",
  url: "https://northwind.ai",
  industry: "B2B SaaS",
  description:
    "Workflow automation platform powering FP&A teams with AI-driven insights across revenue, expenses, and runway.",
  headquarters: "Remote",
  revenue_model: "Subscription",
  notes: "Focus on expanding enterprise logos while maintaining capital efficiency. Keep ARR-to-cash conversion above 90%.",
  raw_profile_json: {
    segments: ["Mid-market SaaS", "Fintech", "Industrial tech"],
    price_bands: ["$2K ACV", "$10K ACV", "$50K ACV"],
    collaborators: [
      { email: "cfo@northwind.ai", role: "CFO" },
      { email: "accountant@firm.com", role: "Accountant" },
    ],
  },
  ai_confidence: 0.82,
  status: "active",
  quick_questions: null,
  // Business settings fields
  entity_type: "limited_company",
  accounting_basis: "accrual",
  vat_enabled: true,
  vat_basis: "accrual",
  include_corporation_tax: true,
  include_paye_nic: true,
  include_dividends: true,
  debtor_days: 30,
  creditor_days: 45,
  director_salary: 50000,
  dividend_payout_ratio: 0.5,
};

export const mockScenario: CashflowScenario = {
  id: "scenario-base",
  profile_id: mockProfile.id,
  created_at: now,
  updated_at: now,
  name: "Base Case",
  horizon: "3y",
  status: "draft",
  base_assumptions: {
    growth: 0.24,
    churn: 0.09,
  },
  user_overrides: {},
};

const revenue = makeLineItem({
  id: "rev-001",
  label: "Subscription revenue",
  type: "revenue",
  monthly_values: [120, 126, 135, 142, 150, 158, 166, 175, 184, 194, 205, 216],
});

const services = makeLineItem({
  id: "rev-002",
  label: "Services revenue",
  type: "revenue",
  monthly_values: [15, 15, 16, 16, 17, 18, 18, 19, 20, 20, 21, 22],
});

const cogs = makeLineItem({
  id: "cogs-001",
  label: "Hosting & infra",
  type: "cogs",
  monthly_values: [25, 26, 27, 28, 30, 31, 32, 33, 35, 36, 37, 38],
});

const rAndD = makeLineItem({
  id: "opex-001",
  label: "R&D",
  type: "opex",
  monthly_values: [40, 41, 42, 43, 44, 45, 46, 47, 49, 50, 51, 52],
});

const sales = makeLineItem({
  id: "opex-002",
  label: "Sales & marketing",
  type: "opex",
  monthly_values: [35, 36, 38, 39, 41, 42, 44, 45, 47, 48, 50, 52],
});

const gna = makeLineItem({
  id: "opex-003",
  label: "G&A",
  type: "opex",
  monthly_values: [18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23],
});

export const mockLineItems: LineItem[] = [revenue, services, cogs, rAndD, sales, gna];

export const mockRecommendations: AiRecommendation[] = [
  {
    id: "rec-1",
    scenario_id: mockScenario.id,
    line_item_id: "opex-002",
    created_at: now,
    summary: "S&M spend grows slower than ARR after month 8",
    detail: "Consider raising paid acquisition budget by 10% to maintain pipeline velocity.",
    accepted: false,
    source: "insight",
  },
  {
    id: "rec-2",
    scenario_id: mockScenario.id,
    line_item_id: null,
    created_at: now,
    summary: "Gross margin stabilizes at 72%",
    detail: "Add infra optimizations or vendor renegotiations to target 75%+ GM for Series B readiness.",
    accepted: false,
    source: "profile",
  },
];

