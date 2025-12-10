# Update .env.local Instructions

Since `.env.local` is gitignored for security, please manually update it with the following variables.

## Required Variables to Add/Update

Add or update these variables in your `.env.local` file:

```env
# ============================================
# SUPABASE (Required)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# OPENAI (Required for AI features)
# ============================================
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini

# ============================================
# APPLICATION (Required for production)
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================
# SENTRY (Optional - for error tracking)
# ============================================
# Uncomment and fill when ready to integrate Sentry
# NEXT_PUBLIC_SENTRY_DSN=
# SENTRY_ORG=your-org-name
# SENTRY_PROJECT=your-project-name
# SENTRY_AUTH_TOKEN=your-auth-token

# ============================================
# INTERNAL ACCESS CONTROL (Optional)
# ============================================
# Only needed if you want to restrict access
# INTERNAL_ONLY_MODE=false
# INTERNAL_API_KEY=your-internal-api-key
```

## Quick Update Commands

### Windows PowerShell

To add missing variables (if they don't exist):

```powershell
# Add NEXT_PUBLIC_APP_URL if missing
if (-not (Select-String -Path .env.local -Pattern "NEXT_PUBLIC_APP_URL")) {
    Add-Content -Path .env.local -Value "`nNEXT_PUBLIC_APP_URL=http://localhost:3000"
}

# Add OPENAI_MODEL if missing
if (-not (Select-String -Path .env.local -Pattern "OPENAI_MODEL")) {
    Add-Content -Path .env.local -Value "`nOPENAI_MODEL=gpt-4o-mini"
}
```

### Manual Update

1. Open `.env.local` in your editor
2. Ensure all required variables are present (see list above)
3. Fill in your actual values
4. Save the file
5. Restart your development server

## Verification

After updating, verify your setup:

1. Check health endpoint: `http://localhost:3000/api/health`
2. Look for any console warnings about missing variables
3. Test a database operation (e.g., create a profile)

## Reference Files

- `.env.example` - Template with all variables documented
- `docs/ENVIRONMENT_SETUP.md` - Detailed setup guide
- `docs/SENTRY_INTEGRATION.md` - Sentry setup (when ready)

