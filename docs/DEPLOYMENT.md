# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Supabase project created
- OpenAI API key
- Vercel account (or other hosting platform)

## Environment Variables

Set the following environment variables in your hosting platform:

### Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Optional

```env
OPENAI_MODEL=gpt-4o-mini
INTERNAL_ONLY_MODE=false
INTERNAL_API_KEY=your_internal_api_key
```

## Database Setup

### 1. Run Migrations

Execute the SQL migrations in your Supabase project:

1. Go to Supabase Dashboard → SQL Editor
2. Run migrations in order:
   - `supabase/migrations/001_initial_cashflow_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_sync_auth_users.sql`

### 2. Verify RLS Policies

Ensure Row Level Security is enabled on all tables:
- Go to Supabase Dashboard → Authentication → Policies
- Verify policies are active

### 3. Test Database Connection

Use the health check endpoint after deployment:
```bash
curl https://your-domain.com/api/health
```

## Deployment Steps

### Vercel

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Vercel will auto-detect Next.js

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables listed above

3. **Deploy**
   - Push to main branch (auto-deploys)
   - Or manually trigger deployment

4. **Verify Deployment**
   - Check build logs for errors
   - Test health endpoint: `/api/health`
   - Test critical user flows

### Other Platforms

For other platforms (Railway, Render, etc.):

1. Set environment variables
2. Run `npm install`
3. Run `npm run build`
4. Run `npm start`
5. Configure reverse proxy if needed

## Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations completed
- [ ] RLS policies enabled
- [ ] Health check endpoint working
- [ ] Error pages display correctly
- [ ] Rate limiting working (test with multiple requests)
- [ ] File uploads working
- [ ] AI agent responding
- [ ] Monitoring/alerting configured

## Monitoring

### Health Checks

Set up uptime monitoring to ping:
- `https://your-domain.com/api/health`

### Error Tracking

Integrate error tracking service:
1. Sign up for Sentry (or similar)
2. Add DSN to environment variables
3. Update `src/lib/logger.ts` to send errors to Sentry

### Performance Monitoring

- Enable Vercel Analytics (if using Vercel)
- Set up performance monitoring
- Monitor API response times

## Troubleshooting

### Build Fails

- Check environment variables are set
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### Database Connection Issues

- Verify Supabase URL and keys are correct
- Check RLS policies allow access
- Verify network connectivity

### Rate Limiting Too Strict

- Adjust limits in `src/lib/rate-limit.ts`
- Consider using Redis for distributed rate limiting

### File Uploads Failing

- Check file size limits
- Verify file type whitelist
- Check Supabase storage configuration

## Rollback Procedure

1. Revert to previous deployment in Vercel
2. Or rollback database migrations if needed:
   ```sql
   -- Manually revert changes if necessary
   ```

## Security Checklist

- [ ] All secrets in environment variables (not in code)
- [ ] RLS policies enabled on all tables
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints
- [ ] CORS configured if needed
- [ ] HTTPS enabled
- [ ] Security headers configured

