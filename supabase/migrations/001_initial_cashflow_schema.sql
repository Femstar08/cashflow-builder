-- Cashflow Builder Schema Migration
-- All table names are lowercase with cf_ prefix

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (created first, practice_id added later)
CREATE TABLE IF NOT EXISTS cf_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    role TEXT NOT NULL CHECK (role IN ('client', 'accountant', 'admin')),
    practice_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- Practices/Teams table
CREATE TABLE IF NOT EXISTS cf_practices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES cf_users(id) ON DELETE CASCADE
);

-- Add foreign key constraint for practice_id after practices table exists
ALTER TABLE cf_users 
ADD CONSTRAINT fk_practice 
FOREIGN KEY (practice_id) REFERENCES cf_practices(id) ON DELETE SET NULL;

-- Business Profiles table
CREATE TABLE IF NOT EXISTS cf_business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    url TEXT,
    industry TEXT,
    description TEXT,
    headquarters TEXT,
    revenue_model TEXT,
    notes TEXT,
    raw_profile_json JSONB,
    ai_confidence NUMERIC,
    status TEXT CHECK (status IN ('active', 'archived')),
    -- Business settings fields
    entity_type TEXT CHECK (entity_type IN ('limited_company', 'sole_trader')),
    accounting_basis TEXT CHECK (accounting_basis IN ('accrual', 'cash')),
    vat_enabled BOOLEAN,
    vat_basis TEXT CHECK (vat_basis IN ('accrual', 'cash')),
    include_corporation_tax BOOLEAN,
    include_paye_nic BOOLEAN,
    include_dividends BOOLEAN,
    debtor_days INTEGER,
    creditor_days INTEGER,
    director_salary NUMERIC,
    dividend_payout_ratio NUMERIC CHECK (dividend_payout_ratio >= 0 AND dividend_payout_ratio <= 1),
    -- Quick questions answers (for AI flow)
    quick_questions JSONB,
    CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES cf_users(id) ON DELETE CASCADE
);

-- Profile sharing and collaboration
CREATE TABLE IF NOT EXISTS cf_profile_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL,
    user_id UUID NOT NULL,
    shared_by UUID NOT NULL,
    permission TEXT NOT NULL CHECK (permission IN ('view', 'edit', 'comment')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('pending', 'accepted', 'revoked')),
    CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES cf_business_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES cf_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_shared_by FOREIGN KEY (shared_by) REFERENCES cf_users(id) ON DELETE CASCADE
);

-- Activity log for profiles
CREATE TABLE IF NOT EXISTS cf_profile_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL,
    user_id UUID NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'created', 'updated', 'shared', 'archived', 'event_added', 
        'assumption_changed', 'forecast_recalculated', 'comment_added',
        'document_uploaded', 'document_extracted', 'assumption_added'
    )),
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES cf_business_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES cf_users(id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE IF NOT EXISTS cf_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    profile_id UUID,
    type TEXT NOT NULL CHECK (type IN (
        'profile_shared', 'assumption_changed', 'event_added',
        'forecast_recalculated', 'cash_runway_red'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES cf_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES cf_business_profiles(id) ON DELETE CASCADE
);

-- Cashflow scenarios
CREATE TABLE IF NOT EXISTS cf_cashflow_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    horizon TEXT NOT NULL CHECK (horizon IN ('1Y', '3Y', '5Y', '10Y')),
    status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
    base_assumptions JSONB,
    user_overrides JSONB,
    CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES cf_business_profiles(id) ON DELETE CASCADE
);

-- Line items
CREATE TABLE IF NOT EXISTS cf_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type TEXT NOT NULL CHECK (type IN ('revenue', 'cogs', 'opex', 'financing', 'capex')),
    label TEXT NOT NULL,
    formula TEXT,
    metadata JSONB,
    monthly_values JSONB NOT NULL,
    CONSTRAINT fk_scenario FOREIGN KEY (scenario_id) REFERENCES cf_cashflow_scenarios(id) ON DELETE CASCADE
);

-- AI recommendations
CREATE TABLE IF NOT EXISTS cf_ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID NOT NULL,
    line_item_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    summary TEXT NOT NULL,
    detail TEXT,
    accepted BOOLEAN NOT NULL DEFAULT false,
    source TEXT NOT NULL CHECK (source IN ('profile', 'line-item', 'insight', 'tax-optimization', 'working-capital')),
    metadata JSONB,
    CONSTRAINT fk_scenario FOREIGN KEY (scenario_id) REFERENCES cf_cashflow_scenarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_line_item FOREIGN KEY (line_item_id) REFERENCES cf_line_items(id) ON DELETE SET NULL
);

-- Events
CREATE TABLE IF NOT EXISTS cf_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_name TEXT NOT NULL,
    event_month INTEGER NOT NULL CHECK (event_month >= 1 AND event_month <= 120),
    event_type TEXT NOT NULL CHECK (event_type IN ('funding', 'hire', 'client_win', 'price_increase')),
    amount NUMERIC,
    percent_change NUMERIC,
    target TEXT,
    CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES cf_business_profiles(id) ON DELETE CASCADE
);

-- Documents attached to business profiles
CREATE TABLE IF NOT EXISTS cf_profile_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL,
    uploaded_by UUID NOT NULL,
    uploaded_by_role TEXT NOT NULL CHECK (uploaded_by_role IN ('client', 'accountant', 'admin')),
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT,
    file_content_base64 TEXT,
    extracted_text TEXT,
    extraction_notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT false,
    CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES cf_business_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES cf_users(id) ON DELETE CASCADE
);

-- Assumption log for business profiles
CREATE TABLE IF NOT EXISTS cf_profile_assumptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL,
    assumption TEXT NOT NULL,
    reason TEXT,
    category TEXT CHECK (category IN ('staffing', 'revenue', 'costs', 'tax', 'working_capital', 'events', 'other')),
    status TEXT CHECK (status IN ('active', 'updated', 'superseded')),
    updated_by_assumption_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT,
    CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES cf_business_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_updated_by FOREIGN KEY (updated_by_assumption_id) REFERENCES cf_profile_assumptions(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cf_users_email ON cf_users(email);
CREATE INDEX IF NOT EXISTS idx_cf_users_practice_id ON cf_users(practice_id);
CREATE INDEX IF NOT EXISTS idx_cf_business_profiles_owner_id ON cf_business_profiles(owner_id);
CREATE INDEX IF NOT EXISTS idx_cf_business_profiles_status ON cf_business_profiles(status);
CREATE INDEX IF NOT EXISTS idx_cf_profile_shares_profile_id ON cf_profile_shares(profile_id);
CREATE INDEX IF NOT EXISTS idx_cf_profile_shares_user_id ON cf_profile_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_cf_profile_activities_profile_id ON cf_profile_activities(profile_id);
CREATE INDEX IF NOT EXISTS idx_cf_profile_activities_created_at ON cf_profile_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cf_notifications_user_id ON cf_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_cf_notifications_read ON cf_notifications(read);
CREATE INDEX IF NOT EXISTS idx_cf_cashflow_scenarios_profile_id ON cf_cashflow_scenarios(profile_id);
CREATE INDEX IF NOT EXISTS idx_cf_line_items_scenario_id ON cf_line_items(scenario_id);
CREATE INDEX IF NOT EXISTS idx_cf_ai_recommendations_scenario_id ON cf_ai_recommendations(scenario_id);
CREATE INDEX IF NOT EXISTS idx_cf_events_profile_id ON cf_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_cf_events_event_month ON cf_events(event_month);
CREATE INDEX IF NOT EXISTS idx_cf_profile_documents_profile_id ON cf_profile_documents(profile_id);
CREATE INDEX IF NOT EXISTS idx_cf_profile_documents_is_deleted ON cf_profile_documents(is_deleted);
CREATE INDEX IF NOT EXISTS idx_cf_profile_assumptions_profile_id ON cf_profile_assumptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_cf_profile_assumptions_status ON cf_profile_assumptions(status);

-- Enable Row Level Security (RLS)
ALTER TABLE cf_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_profile_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_profile_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_cashflow_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_profile_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_profile_assumptions ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies should be created separately based on your authentication setup
-- Example policies would check auth.uid() against owner_id, shared users, etc.

