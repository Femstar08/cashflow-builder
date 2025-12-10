# Environment Variables Setup Guide

This guide explains how to set up environment variables for the Cashflow Builder application.

## Quick Start

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual values in `.env.local`

3. Restart your development server

## Required Variables

### Supabase (Required)

These are required for database functionality:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**How to get:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

### OpenAI (Required for AI features)

```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini  # Optional
```

**How to get:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key to `OPENAI_API_KEY`

**Model Options:**
- `gpt-4o-mini` (recommended, cost-effective)
- `gpt-4` (more capable, more expensive)
- `gpt-3.5-turbo` (faster, less capable)

### Application URL (Required for production)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Development
NEXT_PUBLIC_APP_URL=https://your-domain.com  # Production
```

This is used for:
- Generating absolute URLs in API responses
- OAuth redirects
- Email links

## Optional Variables

### Sentry (Error Tracking)

```env
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
```

See `docs/SENTRY_INTEGRATION.md` for detailed setup.

### Internal Access Control

```env
INTERNAL_ONLY_MODE=false
INTERNAL_API_KEY=your-secret-key
```

If `INTERNAL_ONLY_MODE=true`, the app will require an API key in:
- Header: `x-api-key: your-secret-key`
- Or cookie: `internal_api_key=your-secret-key`

## Environment-Specific Setup

### Development

Create `.env.local` (gitignored):

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### Production (Vercel)

1. Go to your Vercel project
2. Navigate to **Settings** > **Environment Variables**
3. Add all required variables
4. Set environment to **Production**, **Preview**, and **Development** as needed
5. Redeploy

### Production (Other Platforms)

Set environment variables in your hosting platform's dashboard or via CLI.

## Validation

The application validates required environment variables:

- **Development**: Warns if missing but allows app to start
- **Production**: Throws error if required variables are missing

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use different keys for dev/staging/prod**
3. **Rotate keys regularly**
4. **Don't expose service role keys** - Only use server-side
5. **Use Vercel/Platform secrets** - Don't hardcode in code

## Troubleshooting

### "Missing Supabase environment variables"

- Check `.env.local` exists
- Verify variable names are correct (case-sensitive)
- Restart your dev server after changes
- Check for typos in URLs/keys

### "OpenAI API key not configured"

- Verify `OPENAI_API_KEY` is set
- Check the key is valid (not expired/revoked)
- Ensure no extra spaces in the value

### Variables not loading

1. Restart your development server
2. Clear Next.js cache: `rm -rf .next`
3. Verify file is named `.env.local` (not `.env`)
4. Check for syntax errors (no spaces around `=`)

## Example `.env.local`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=sk-proj-abc123...
OPENAI_MODEL=gpt-4o-mini

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Need Help?

- Check `PRODUCTION_READINESS.md` for deployment checklist
- See `docs/DEPLOYMENT.md` for deployment instructions
- See `docs/SENTRY_INTEGRATION.md` for Sentry setup

