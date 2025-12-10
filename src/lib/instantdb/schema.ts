// InstantDB schema definition
// Note: The exact API may vary - check InstantDB documentation for the correct schema format
export const appSchema = {
  // Users and authentication
  users: {
    id: { type: "id" },
    email: { type: "string" },
    name: { type: "string", optional: true },
    role: { type: "string" }, // "client" | "accountant" | "admin"
    practice_id: { type: "string", optional: true }, // For accountants/admins
    created_at: { type: "string" },
    updated_at: { type: "string", optional: true },
    last_login: { type: "string", optional: true },
    is_active: { type: "boolean", optional: true },
  },
  // Practices/Teams
  practices: {
    id: { type: "id" },
    name: { type: "string" },
    owner_id: { type: "string" }, // Admin user ID
    created_at: { type: "string" },
    updated_at: { type: "string", optional: true },
  },
  business_profiles: {
    id: { type: "id" },
    owner_id: { type: "string" },
    created_at: { type: "string" },
    updated_at: { type: "string", optional: true },
    name: { type: "string" },
    url: { type: "string", optional: true },
    industry: { type: "string", optional: true },
    description: { type: "string", optional: true },
    headquarters: { type: "string", optional: true },
    revenue_model: { type: "string", optional: true },
    notes: { type: "string", optional: true },
    raw_profile_json: { type: "json", optional: true },
    ai_confidence: { type: "number", optional: true },
    status: { type: "string", optional: true }, // "active" | "archived"
    // Business settings fields
    entity_type: { type: "string", optional: true }, // "limited_company" | "sole_trader"
    accounting_basis: { type: "string", optional: true }, // "accrual" | "cash"
    vat_enabled: { type: "boolean", optional: true },
    vat_basis: { type: "string", optional: true }, // "accrual" | "cash"
    include_corporation_tax: { type: "boolean", optional: true },
    include_paye_nic: { type: "boolean", optional: true },
    include_dividends: { type: "boolean", optional: true },
    debtor_days: { type: "number", optional: true },
    creditor_days: { type: "number", optional: true },
    director_salary: { type: "number", optional: true },
    dividend_payout_ratio: { type: "number", optional: true }, // 0-1
    // Quick questions answers (for AI flow)
    quick_questions: { type: "json", optional: true },
  },
  // Profile sharing and collaboration
  profile_shares: {
    id: { type: "id" },
    profile_id: { type: "string" },
    user_id: { type: "string" },
    shared_by: { type: "string" }, // User who shared
    permission: { type: "string" }, // "view" | "edit" | "comment"
    created_at: { type: "string" },
    accepted_at: { type: "string", optional: true },
    status: { type: "string", optional: true }, // "pending" | "accepted" | "revoked"
  },
  // Activity log for profiles
  profile_activities: {
    id: { type: "id" },
    profile_id: { type: "string" },
    user_id: { type: "string" },
    activity_type: { type: "string" }, // "created" | "updated" | "shared" | "archived" | "event_added" | "assumption_changed"
    description: { type: "string" },
    metadata: { type: "json", optional: true },
    created_at: { type: "string" },
  },
  // Notifications
  notifications: {
    id: { type: "id" },
    user_id: { type: "string" },
    profile_id: { type: "string", optional: true },
    type: { type: "string" }, // "profile_shared" | "assumption_changed" | "event_added" | "forecast_recalculated" | "cash_runway_red"
    title: { type: "string" },
    message: { type: "string" },
    read: { type: "boolean", optional: true },
    created_at: { type: "string" },
    metadata: { type: "json", optional: true },
  },
  cashflow_scenarios: {
    id: { type: "id" },
    profile_id: { type: "id" },
    created_at: { type: "string" },
    updated_at: { type: "string", optional: true },
    name: { type: "string" },
    horizon: { type: "string" },
    status: { type: "string" },
    base_assumptions: { type: "json", optional: true },
    user_overrides: { type: "json", optional: true },
  },
  line_items: {
    id: { type: "id" },
    scenario_id: { type: "id" },
    created_at: { type: "string" },
    type: { type: "string" },
    label: { type: "string" },
    formula: { type: "string", optional: true },
    metadata: { type: "json", optional: true },
    monthly_values: { type: "json" },
  },
  ai_recommendations: {
    id: { type: "id" },
    scenario_id: { type: "id" },
    line_item_id: { type: "id", optional: true },
    created_at: { type: "string" },
    summary: { type: "string" },
    detail: { type: "string", optional: true },
    accepted: { type: "boolean" },
    source: { type: "string" },
    metadata: { type: "json", optional: true }, // For category and other structured data
  },
  events: {
    id: { type: "id" },
    profile_id: { type: "id" },
    created_at: { type: "string" },
    event_name: { type: "string" },
    event_month: { type: "number" }, // 1-120
    event_type: { type: "string" }, // "funding" | "hire" | "client_win" | "price_increase"
    amount: { type: "number", optional: true },
    percent_change: { type: "number", optional: true },
    target: { type: "string", optional: true },
  },
  // Documents attached to business profiles
  profile_documents: {
    id: { type: "id" },
    profile_id: { type: "id" },
    uploaded_by: { type: "string" }, // User ID
    uploaded_by_role: { type: "string" }, // "client" | "accountant" | "admin"
    file_name: { type: "string" },
    file_type: { type: "string" }, // MIME type
    file_size: { type: "number" }, // bytes
    file_url: { type: "string", optional: true }, // Storage URL if stored externally
    file_content_base64: { type: "string", optional: true }, // Base64 content for small files
    extracted_text: { type: "string", optional: true }, // Extracted text content
    extraction_notes: { type: "string", optional: true }, // Notes on what was extracted
    metadata: { type: "json", optional: true }, // Additional file metadata
    created_at: { type: "string" },
    updated_at: { type: "string", optional: true },
    deleted_at: { type: "string", optional: true }, // Soft delete timestamp
    is_deleted: { type: "boolean", optional: true }, // Soft delete flag
  },
  // Assumption log for business profiles
  profile_assumptions: {
    id: { type: "id" },
    profile_id: { type: "id" },
    assumption: { type: "string" }, // The assumption text
    reason: { type: "string", optional: true }, // Why the assumption was made
    category: { type: "string", optional: true }, // "staffing" | "revenue" | "costs" | "tax" | "working_capital" | "events" | "other"
    status: { type: "string", optional: true }, // "active" | "updated" | "superseded"
    updated_by_assumption_id: { type: "string", optional: true }, // ID of assumption that replaced this one
    created_at: { type: "string" },
    created_by: { type: "string", optional: true }, // "agent" | user_id
  },
} as const;

export type AppSchema = typeof appSchema;

