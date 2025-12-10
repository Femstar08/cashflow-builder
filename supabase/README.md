# Supabase Migration Guide

This directory contains SQL migrations for the Cashflow Builder application.

## Migration Files

1. **001_initial_cashflow_schema.sql** - Creates all tables with proper constraints and indexes
2. **002_rls_policies.sql** - Sets up Row Level Security policies for data access control

## Table Naming Convention

All tables use the `cf_` prefix (cashflow) and are lowercase:
- `cf_users`
- `cf_practices`
- `cf_business_profiles`
- `cf_profile_shares`
- `cf_profile_activities`
- `cf_notifications`
- `cf_cashflow_scenarios`
- `cf_line_items`
- `cf_ai_recommendations`
- `cf_events`
- `cf_profile_documents`
- `cf_profile_assumptions`

## Running Migrations

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `001_initial_cashflow_schema.sql`
4. Run the migration
5. Repeat for `002_rls_policies.sql`

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref uxweskdolfgtlztbsyfn

# Run migrations
supabase db push
```

### Option 3: Using psql

```bash
psql -h db.uxweskdolfgtlztbsyfn.supabase.co -U postgres -d postgres -f supabase/migrations/001_initial_cashflow_schema.sql
psql -h db.uxweskdolfgtlztbsyfn.supabase.co -U postgres -d postgres -f supabase/migrations/002_rls_policies.sql
```

## Environment Variables

Update your `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://uxweskdolfgtlztbsyfn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

You can find these values in your Supabase project settings under API.

## Authentication Setup

The RLS policies assume you're using Supabase Auth. Make sure:

1. Supabase Auth is enabled in your project
2. Users are created through Supabase Auth (not directly in `cf_users` table)
3. The `cf_users` table should sync with `auth.users` (you may want to add a trigger)

## Next Steps

1. Run the migrations
2. Set up authentication (if not already done)
3. Update your application code to use the Supabase client instead of InstantDB
4. Test the migrations with sample data

