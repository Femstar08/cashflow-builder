# Supabase Migrations

This directory contains SQL migration files for the Cashflow Builder database schema.

## Migration Order

Run migrations in this order:

1. **001_initial_cashflow_schema.sql** - Creates all tables, indexes, and constraints
2. **002_rls_policies.sql** - Sets up Row Level Security policies
3. **003_sync_auth_users.sql** - Creates triggers to sync Supabase Auth with cf_users table

## Running Migrations

See the main [SUPABASE_MIGRATION.md](../SUPABASE_MIGRATION.md) file for detailed instructions.

## Table Structure

All tables use:
- UUID primary keys (using `uuid_generate_v4()`)
- `cf_` prefix for cashflow-related tables
- Lowercase naming convention
- Timestamps with timezone (TIMESTAMPTZ)
- JSONB for flexible JSON data
- Foreign key constraints
- Indexes for performance

## Notes

- Tables are designed to work with Supabase Auth
- RLS policies assume `auth.uid()` is available
- All timestamps use `NOW()` as default
- Soft deletes are supported where needed (e.g., `is_deleted` flag)

