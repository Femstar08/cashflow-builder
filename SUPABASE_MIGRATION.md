# Supabase Migration Guide

This document outlines the migration from InstantDB to Supabase for the Cashflow Builder application.

## Overview

The application has been migrated from InstantDB to Supabase PostgreSQL database. All table names use the `cf_` prefix and are lowercase to match your existing naming convention.

## Database Schema

### Tables Created

All tables are prefixed with `cf_` (cashflow):

1. **cf_users** - User accounts
2. **cf_practices** - Accounting practices/teams
3. **cf_business_profiles** - Business profile data
4. **cf_profile_shares** - Profile sharing and collaboration
5. **cf_profile_activities** - Activity log
6. **cf_notifications** - User notifications
7. **cf_cashflow_scenarios** - Forecast scenarios
8. **cf_line_items** - Revenue/expense line items
9. **cf_ai_recommendations** - AI-generated recommendations
10. **cf_events** - Event tree (funding, hires, etc.)
11. **cf_profile_documents** - Uploaded documents
12. **cf_profile_assumptions** - Assumption tracking

## Migration Steps

### 1. Install Supabase Dependencies

```bash
npm install @supabase/supabase-js
```

### 2. Update Environment Variables

Create or update `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uxweskdolfgtlztbsyfn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration (for AI agent)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Where to find these values:**
- Go to your Supabase project dashboard
- Navigate to Settings > API
- Copy the Project URL and anon/public key
- Copy the service_role key (keep this secret!)

### 3. Run Database Migrations

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/uxweskdolfgtlztbsyfn
2. Navigate to SQL Editor
3. Run each migration file in order:
   - Copy contents of `supabase/migrations/001_initial_cashflow_schema.sql`
   - Paste and execute
   - Repeat for `002_rls_policies.sql`
   - Repeat for `003_sync_auth_users.sql`

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref uxweskdolfgtlztbsyfn

# Push migrations
supabase db push
```

### 4. Verify Tables Created

Run this query in Supabase SQL Editor to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'cf_%'
ORDER BY table_name;
```

You should see all 12 tables listed.

### 5. Update Application Code

The following files need to be updated to use Supabase instead of InstantDB:

- `src/lib/instantdb/service.ts` → Create `src/lib/supabase/service.ts`
- `src/lib/instantdb/client.ts` → Use `src/lib/supabase/client.ts` (already created)
- All API routes that use InstantDB → Update to use Supabase client
- Components using InstantDB hooks → Update to use Supabase queries

## Key Differences: InstantDB vs Supabase

### InstantDB
```typescript
// Client-side
import { useQuery } from "@instantdb/react";
const { data } = useQuery({ users: {} });

// Server-side
const result = await instantRequest("/query", {
  body: JSON.stringify({ query: { users: {} } })
});
```

### Supabase
```typescript
// Client-side
import { supabase } from "@/lib/supabase/client";
const { data } = await supabase.from("cf_users").select("*");

// Server-side
import { getSupabaseAdmin } from "@/lib/supabase/client";
const admin = getSupabaseAdmin();
const { data } = await admin.from("cf_users").select("*");
```

## Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow users to read their own data
- Allow profile owners to manage their profiles
- Allow shared users to read/edit based on permissions
- Restrict access based on `auth.uid()` from Supabase Auth

## Authentication

The migration includes a trigger (`003_sync_auth_users.sql`) that automatically:
- Creates a `cf_users` record when a user signs up via Supabase Auth
- Updates `cf_users` when auth user data changes
- Deactivates `cf_users` when auth user is deleted

## Next Steps

1. ✅ Run migrations
2. ⏳ Update API routes to use Supabase
3. ⏳ Update service layer
4. ⏳ Update components
5. ⏳ Test all functionality
6. ⏳ Remove InstantDB dependencies

## Troubleshooting

### "relation does not exist"
- Make sure migrations ran successfully
- Check table names are lowercase with `cf_` prefix

### "permission denied"
- Check RLS policies are applied
- Verify user is authenticated
- Check user has proper permissions

### "missing environment variables"
- Verify `.env.local` is set up correctly
- Restart dev server after updating env vars

## Support

For issues, check:
- Supabase documentation: https://supabase.com/docs
- Migration files in `supabase/migrations/`
- SQL queries in Supabase dashboard SQL Editor

