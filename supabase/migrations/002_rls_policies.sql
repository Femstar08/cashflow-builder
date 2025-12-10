-- Row Level Security Policies for Cashflow Builder
-- These policies assume you're using Supabase Auth with auth.uid()

-- Drop existing policies if they exist (for idempotent migrations)
DROP POLICY IF EXISTS "Users can read own data" ON cf_users;
DROP POLICY IF EXISTS "Users can update own data" ON cf_users;
DROP POLICY IF EXISTS "Users can read practices they belong to" ON cf_practices;
DROP POLICY IF EXISTS "Users can read own profiles" ON cf_business_profiles;
DROP POLICY IF EXISTS "Users can create own profiles" ON cf_business_profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON cf_business_profiles;
DROP POLICY IF EXISTS "Users can read shares for their profiles" ON cf_profile_shares;
DROP POLICY IF EXISTS "Profile owners can create shares" ON cf_profile_shares;
DROP POLICY IF EXISTS "Users can read activities for accessible profiles" ON cf_profile_activities;
DROP POLICY IF EXISTS "Users can create activities for accessible profiles" ON cf_profile_activities;
DROP POLICY IF EXISTS "Users can read own notifications" ON cf_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON cf_notifications;
DROP POLICY IF EXISTS "Users can read scenarios for accessible profiles" ON cf_cashflow_scenarios;
DROP POLICY IF EXISTS "Users can create scenarios for accessible profiles" ON cf_cashflow_scenarios;
DROP POLICY IF EXISTS "Users can read line items for accessible scenarios" ON cf_line_items;
DROP POLICY IF EXISTS "Users can read recommendations for accessible scenarios" ON cf_ai_recommendations;
DROP POLICY IF EXISTS "Users can read events for accessible profiles" ON cf_events;
DROP POLICY IF EXISTS "Users can read documents for accessible profiles" ON cf_profile_documents;
DROP POLICY IF EXISTS "Users can upload documents to accessible profiles" ON cf_profile_documents;
DROP POLICY IF EXISTS "Users can read assumptions for accessible profiles" ON cf_profile_assumptions;
DROP POLICY IF EXISTS "Users can create assumptions for accessible profiles" ON cf_profile_assumptions;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON cf_users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON cf_users
    FOR UPDATE USING (auth.uid() = id);

-- Practices policies
CREATE POLICY "Users can read practices they belong to" ON cf_practices
    FOR SELECT USING (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM cf_users WHERE practice_id = cf_practices.id AND id = auth.uid())
    );

-- Business Profiles policies
CREATE POLICY "Users can read own profiles" ON cf_business_profiles
    FOR SELECT USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM cf_profile_shares
            WHERE profile_id = cf_business_profiles.id
            AND user_id = auth.uid()
            AND status = 'accepted'
        )
    );

CREATE POLICY "Users can create own profiles" ON cf_business_profiles
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own profiles" ON cf_business_profiles
    FOR UPDATE USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM cf_profile_shares
            WHERE profile_id = cf_business_profiles.id
            AND user_id = auth.uid()
            AND permission IN ('edit', 'admin')
            AND status = 'accepted'
        )
    );

-- Profile Shares policies
CREATE POLICY "Users can read shares for their profiles" ON cf_profile_shares
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cf_business_profiles
            WHERE id = cf_profile_shares.profile_id
            AND owner_id = auth.uid()
        ) OR
        user_id = auth.uid()
    );

CREATE POLICY "Profile owners can create shares" ON cf_profile_shares
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cf_business_profiles
            WHERE id = cf_profile_shares.profile_id
            AND owner_id = auth.uid()
        )
    );

-- Profile Activities policies
CREATE POLICY "Users can read activities for accessible profiles" ON cf_profile_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cf_business_profiles
            WHERE id = cf_profile_activities.profile_id
            AND (owner_id = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM cf_profile_shares
                     WHERE profile_id = cf_profile_activities.profile_id
                     AND user_id = auth.uid()
                     AND status = 'accepted'
                 ))
        )
    );

CREATE POLICY "Users can create activities for accessible profiles" ON cf_profile_activities
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM cf_business_profiles
            WHERE id = cf_profile_activities.profile_id
            AND (owner_id = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM cf_profile_shares
                     WHERE profile_id = cf_profile_activities.profile_id
                     AND user_id = auth.uid()
                     AND status = 'accepted'
                 ))
        )
    );

-- Notifications policies
CREATE POLICY "Users can read own notifications" ON cf_notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON cf_notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Cashflow Scenarios policies
CREATE POLICY "Users can read scenarios for accessible profiles" ON cf_cashflow_scenarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cf_business_profiles
            WHERE id = cf_cashflow_scenarios.profile_id
            AND (owner_id = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM cf_profile_shares
                     WHERE profile_id = cf_cashflow_scenarios.profile_id
                     AND user_id = auth.uid()
                     AND status = 'accepted'
                 ))
        )
    );

CREATE POLICY "Users can create scenarios for accessible profiles" ON cf_cashflow_scenarios
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cf_business_profiles
            WHERE id = cf_cashflow_scenarios.profile_id
            AND (owner_id = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM cf_profile_shares
                     WHERE profile_id = cf_cashflow_scenarios.profile_id
                     AND user_id = auth.uid()
                     AND permission IN ('edit', 'admin')
                     AND status = 'accepted'
                 ))
        )
    );

-- Line Items policies (inherit from scenarios)
CREATE POLICY "Users can read line items for accessible scenarios" ON cf_line_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cf_cashflow_scenarios
            JOIN cf_business_profiles ON cf_cashflow_scenarios.profile_id = cf_business_profiles.id
            WHERE cf_cashflow_scenarios.id = cf_line_items.scenario_id
            AND (cf_business_profiles.owner_id = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM cf_profile_shares
                     WHERE profile_id = cf_business_profiles.id
                     AND user_id = auth.uid()
                     AND status = 'accepted'
                 ))
        )
    );

-- AI Recommendations policies (inherit from scenarios)
CREATE POLICY "Users can read recommendations for accessible scenarios" ON cf_ai_recommendations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cf_cashflow_scenarios
            JOIN cf_business_profiles ON cf_cashflow_scenarios.profile_id = cf_business_profiles.id
            WHERE cf_cashflow_scenarios.id = cf_ai_recommendations.scenario_id
            AND (cf_business_profiles.owner_id = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM cf_profile_shares
                     WHERE profile_id = cf_business_profiles.id
                     AND user_id = auth.uid()
                     AND status = 'accepted'
                 ))
        )
    );

-- Events policies
CREATE POLICY "Users can read events for accessible profiles" ON cf_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cf_business_profiles
            WHERE id = cf_events.profile_id
            AND (owner_id = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM cf_profile_shares
                     WHERE profile_id = cf_events.profile_id
                     AND user_id = auth.uid()
                     AND status = 'accepted'
                 ))
        )
    );

-- Profile Documents policies
CREATE POLICY "Users can read documents for accessible profiles" ON cf_profile_documents
    FOR SELECT USING (
        is_deleted = false AND
        EXISTS (
            SELECT 1 FROM cf_business_profiles
            WHERE id = cf_profile_documents.profile_id
            AND (owner_id = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM cf_profile_shares
                     WHERE profile_id = cf_profile_documents.profile_id
                     AND user_id = auth.uid()
                     AND status = 'accepted'
                 ))
        )
    );

CREATE POLICY "Users can upload documents to accessible profiles" ON cf_profile_documents
    FOR INSERT WITH CHECK (
        uploaded_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM cf_business_profiles
            WHERE id = cf_profile_documents.profile_id
            AND (owner_id = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM cf_profile_shares
                     WHERE profile_id = cf_profile_documents.profile_id
                     AND user_id = auth.uid()
                     AND permission IN ('edit', 'admin')
                     AND status = 'accepted'
                 ))
        )
    );

-- Profile Assumptions policies
CREATE POLICY "Users can read assumptions for accessible profiles" ON cf_profile_assumptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cf_business_profiles
            WHERE id = cf_profile_assumptions.profile_id
            AND (owner_id = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM cf_profile_shares
                     WHERE profile_id = cf_profile_assumptions.profile_id
                     AND user_id = auth.uid()
                     AND status = 'accepted'
                 ))
        )
    );

CREATE POLICY "Users can create assumptions for accessible profiles" ON cf_profile_assumptions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cf_business_profiles
            WHERE id = cf_profile_assumptions.profile_id
            AND (owner_id = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM cf_profile_shares
                     WHERE profile_id = cf_profile_assumptions.profile_id
                     AND user_id = auth.uid()
                     AND permission IN ('edit', 'admin')
                     AND status = 'accepted'
                 ))
        )
    );

