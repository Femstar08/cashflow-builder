# Supabase Migration Summary

## ✅ What Was Created

### 1. SQL Migration Files
- `supabase/migrations/001_initial_cashflow_schema.sql` - Creates all 12 tables
- `supabase/migrations/002_rls_policies.sql` - Row Level Security policies
- `supabase/migrations/003_sync_auth_users.sql` - Auth user sync triggers

### 2. Supabase Client Setup
- `src/lib/supabase/client.ts` - Supabase client configuration

### 3. Documentation
- `SUPABASE_MIGRATION.md` - Complete migration guide
- `supabase/README.md` - Migration directory documentation
- `.env.local.example` - Environment variables template

### 4. Package Updates
- Updated `package.json` to include `@supabase/supabase-js`

## 📋 Tables Created (all lowercase with `cf_` prefix)

1. `cf_users` - User accounts
2. `cf_practices` - Accounting practices/teams  
3. `cf_business_profiles` - Business profile data
4. `cf_profile_shares` - Profile sharing
5. `cf_profile_activities` - Activity log
6. `cf_notifications` - Notifications
7. `cf_cashflow_scenarios` - Forecast scenarios
8. `cf_line_items` - Revenue/expense items
9. `cf_ai_recommendations` - AI recommendations
10. `cf_events` - Event tree
11. `cf_profile_documents` - Uploaded documents
12. `cf_profile_assumptions` - Assumption tracking

## 🔧 Next Steps

### 1. Update .env.local

Add these variables to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uxweskdolfgtlztbsyfn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Keep existing OpenAI and app config
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**To get your Supabase keys:**
1. Go to https://supabase.com/dashboard/project/uxweskdolfgtlztbsyfn
2. Settings → API
3. Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy "service_role" key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Migrations

**Option A: Supabase Dashboard (Easiest)**
1. Go to SQL Editor in Supabase dashboard
2. Copy/paste and run `001_initial_cashflow_schema.sql`
3. Copy/paste and run `002_rls_policies.sql`
4. Copy/paste and run `003_sync_auth_users.sql`

**Option B: Supabase CLI**
```bash
npm install -g supabase
supabase login
supabase link --project-ref uxweskdolfgtlztbsyfn
supabase db push
```

### 4. Verify Tables

Run this in Supabase SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'cf_%'
ORDER BY table_name;
```

Should return 12 tables.

## 📝 Important Notes

- All table names are **lowercase** with `cf_` prefix
- Tables use UUID primary keys
- RLS (Row Level Security) is enabled on all tables
- Foreign key constraints ensure data integrity
- Indexes are created for performance
- Auth users automatically sync with `cf_users` table

## 🔄 Code Migration Status

✅ Database schema created
✅ Supabase client setup
⏳ API routes need updating (from InstantDB to Supabase)
⏳ Service layer needs updating
⏳ Components need updating

See `SUPABASE_MIGRATION.md` for detailed migration instructions.

