import type { HorizonId } from "@/lib/utils";

export type UUID = string;

export type EntityType = "limited_company" | "sole_trader";
export type AccountingBasis = "accrual" | "cash";
export type VatBasis = "accrual" | "cash";
export type EventType = "funding" | "hire" | "client_win" | "price_increase";

export type BusinessProfile = {
  id: UUID;
  owner_id: UUID;
  created_at: string;
  updated_at: string | null;
  name: string;
  url: string | null;
  industry: string | null;
  description: string | null;
  headquarters: string | null;
  revenue_model: string | null;
  notes: string | null;
  raw_profile_json: Record<string, unknown>;
  ai_confidence: number | null;
  status: BusinessProfileStatus | null;
  quick_questions: QuickQuestions | null;
  // Business settings fields
  entity_type: EntityType | null;
  accounting_basis: AccountingBasis | null;
  vat_enabled: boolean | null;
  vat_basis: VatBasis | null;
  include_corporation_tax: boolean | null;
  include_paye_nic: boolean | null;
  include_dividends: boolean | null;
  debtor_days: number | null;
  creditor_days: number | null;
  director_salary: number | null;
  dividend_payout_ratio: number | null; // 0-1
};

export type BusinessProfileInsert = Partial<Omit<BusinessProfile, "id" | "owner_id" | "created_at">> & {
  owner_id: UUID;
  name: string;
  raw_profile_json?: Record<string, unknown>;
};

export type CashflowScenario = {
  id: UUID;
  profile_id: UUID;
  created_at: string;
  updated_at: string | null;
  name: string;
  horizon: HorizonId;
  status: "draft" | "published";
  base_assumptions: Record<string, unknown>;
  user_overrides: Record<string, unknown>;
};

export type CashflowScenarioInsert = Partial<Omit<CashflowScenario, "id" | "profile_id" | "created_at">> & {
  profile_id: UUID;
  name: string;
  horizon: HorizonId;
};

export type LineItemType = "revenue" | "cogs" | "opex" | "financing" | "capex";

export type LineItem = {
  id: UUID;
  scenario_id: UUID;
  created_at: string;
  type: LineItemType;
  label: string;
  formula: string | null;
  metadata: Record<string, unknown>;
  monthly_values: number[];
};

export type LineItemInsert = Partial<Omit<LineItem, "id" | "scenario_id" | "created_at">> & {
  scenario_id: UUID;
  type: LineItemType;
  label: string;
};

export type AiRecommendation = {
  id: UUID;
  scenario_id: UUID;
  line_item_id: UUID | null;
  created_at: string;
  summary: string;
  detail: string | null;
  accepted: boolean;
  source: "profile" | "line-item" | "insight" | "tax-optimization" | "working-capital";
  metadata?: {
    category?: "revenue" | "expense" | "tax" | "working-capital" | "general";
    suggested_type?: "revenue" | "cogs" | "opex";
    suggested_label?: string;
    suggested_values?: number[];
  } | null;
};

export type AiRecommendationInsert = Partial<Omit<AiRecommendation, "id" | "scenario_id" | "created_at">> & {
  scenario_id: UUID;
  summary: string;
  source: AiRecommendation["source"];
};

export type Event = {
  id: UUID;
  profile_id: UUID;
  created_at: string;
  event_name: string;
  event_month: number; // 1-120
  event_type: EventType;
  amount: number | null;
  percent_change: number | null;
  target: string | null;
};

export type EventInsert = Partial<Omit<Event, "id" | "profile_id" | "created_at">> & {
  profile_id: UUID;
  event_name: string;
  event_month: number;
  event_type: EventType;
};

// User and authentication types
export type UserRole = "client" | "accountant" | "admin";

export type User = {
  id: UUID;
  email: string;
  name: string | null;
  role: UserRole;
  practice_id: UUID | null;
  created_at: string;
  updated_at: string | null;
  last_login: string | null;
  is_active: boolean | null;
};

export type UserInsert = Partial<Omit<User, "id" | "created_at">> & {
  email: string;
  role: UserRole;
};

// Practice/Team types
export type Practice = {
  id: UUID;
  name: string;
  owner_id: UUID;
  created_at: string;
  updated_at: string | null;
};

export type PracticeInsert = Partial<Omit<Practice, "id" | "created_at">> & {
  name: string;
  owner_id: UUID;
};

// Profile sharing types
export type ProfileSharePermission = "view" | "edit" | "comment";
export type ProfileShareStatus = "pending" | "accepted" | "revoked";

export type ProfileShare = {
  id: UUID;
  profile_id: UUID;
  user_id: UUID;
  shared_by: UUID;
  permission: ProfileSharePermission;
  created_at: string;
  accepted_at: string | null;
  status: ProfileShareStatus | null;
};

export type ProfileShareInsert = Partial<Omit<ProfileShare, "id" | "created_at">> & {
  profile_id: UUID;
  user_id: UUID;
  shared_by: UUID;
  permission: ProfileSharePermission;
};

// Activity log types
export type ActivityType =
  | "created"
  | "updated"
  | "shared"
  | "archived"
  | "event_added"
  | "assumption_changed"
  | "forecast_recalculated"
  | "comment_added"
  | "document_uploaded"
  | "document_extracted"
  | "assumption_added";

export type ProfileActivity = {
  id: UUID;
  profile_id: UUID;
  user_id: UUID;
  activity_type: ActivityType;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type ProfileActivityInsert = Partial<Omit<ProfileActivity, "id" | "created_at">> & {
  profile_id: UUID;
  user_id: UUID;
  activity_type: ActivityType;
  description: string;
};

// Notification types
export type NotificationType =
  | "profile_shared"
  | "assumption_changed"
  | "event_added"
  | "forecast_recalculated"
  | "cash_runway_red"
  | "comment_added"
  | "invitation_received";

export type Notification = {
  id: UUID;
  user_id: UUID;
  profile_id: UUID | null;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
};

export type NotificationInsert = Partial<Omit<Notification, "id" | "created_at">> & {
  user_id: UUID;
  type: NotificationType;
  title: string;
  message: string;
};

// Updated BusinessProfile with status
export type BusinessProfileStatus = "active" | "archived";

export type QuickQuestions = {
  payment_terms?: string;
  vat_registered?: boolean;
  starting_balance?: number;
  planned_events?: string;
  monthly_sales_target?: number;
};

// Profile document types
export type ProfileDocument = {
  id: UUID;
  profile_id: UUID;
  uploaded_by: UUID;
  uploaded_by_role: UserRole;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string | null;
  file_content_base64: string | null;
  extracted_text: string | null;
  extraction_notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  is_deleted: boolean | null;
};

export type ProfileDocumentInsert = Partial<Omit<ProfileDocument, "id" | "created_at">> & {
  profile_id: UUID;
  uploaded_by: UUID;
  uploaded_by_role: UserRole;
  file_name: string;
  file_type: string;
  file_size: number;
};

// Profile assumption types
export type ProfileAssumption = {
  id: UUID;
  profile_id: UUID;
  assumption: string;
  reason: string | null;
  category: string | null; // "staffing" | "revenue" | "costs" | "tax" | "working_capital" | "events" | "other"
  status: string | null; // "active" | "updated" | "superseded"
  updated_by_assumption_id: string | null;
  created_at: string;
  created_by: string | null;
};

export type ProfileAssumptionInsert = Partial<Omit<ProfileAssumption, "id" | "created_at">> & {
  profile_id: UUID;
  assumption: string;
};

