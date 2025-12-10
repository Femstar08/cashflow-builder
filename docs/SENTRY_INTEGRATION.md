# Sentry Integration Guide

This guide explains how to integrate Sentry for error tracking and monitoring in production.

## Prerequisites

- Sentry account (sign up at https://sentry.io)
- Sentry project created
- DSN (Data Source Name) from your Sentry project

## Installation

1. Install the Sentry Next.js SDK:

```bash
npm install @sentry/nextjs
```

2. Initialize Sentry in your project:

```bash
npx @sentry/wizard@latest -i nextjs
```

This will:
- Create `sentry.client.config.ts`
- Create `sentry.server.config.ts`
- Create `sentry.edge.config.ts`
- Update `next.config.js` with Sentry configuration
- Create `.sentryclirc` (optional, for releases)

## Manual Setup (Alternative)

If you prefer manual setup:

1. Install the package:
```bash
npm install @sentry/nextjs
```

2. Create `sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // Adjust based on traffic
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
});
```

3. Create `sentry.server.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
});
```

4. Update `next.config.js`:
```javascript
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  // Your existing config
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: "your-org",
  project: "your-project",
});
```

## Environment Variables

Add to your `.env.local` and production environment:

```env
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token  # For releases (optional)
```

## Update Logger

Update `src/lib/logger.ts` to send errors to Sentry:

```typescript
import * as Sentry from "@sentry/nextjs";

class Logger {
  // ... existing code ...

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };

    const formatted = this.formatMessage('error', message, errorContext);
    console.error(formatted);

    // Send to Sentry in production
    if (this.isProduction) {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          extra: errorContext,
          tags: context,
        });
      } else {
        Sentry.captureMessage(message, {
          level: 'error',
          extra: errorContext,
        });
      }
    }
  }

  warn(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('warn', message, context);
    console.warn(formatted);

    if (this.isProduction) {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: context,
      });
    }
  }
}
```

## Error Boundaries

Sentry automatically captures errors from React error boundaries. The existing error boundaries (`src/app/error.tsx` and `src/app/global-error.tsx`) will automatically send errors to Sentry once configured.

## Performance Monitoring

Sentry automatically tracks:
- API route performance
- Page load times
- Database query times (if configured)

To add custom performance monitoring:

```typescript
import * as Sentry from "@sentry/nextjs";

// In your API route
const transaction = Sentry.startTransaction({
  op: "api",
  name: "GET /api/profiles",
});

try {
  // Your code
  transaction.setStatus("ok");
} catch (error) {
  transaction.setStatus("internal_error");
  throw error;
} finally {
  transaction.finish();
}
```

## User Context

Add user context to Sentry for better debugging:

```typescript
import * as Sentry from "@sentry/nextjs";

// When user logs in
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});

// When user logs out
Sentry.setUser(null);
```

## Releases

Track releases in Sentry:

1. Add to your deployment script:
```bash
npx @sentry/cli releases new $VERSION
npx @sentry/cli releases set-commits $VERSION --auto
npx @sentry/cli releases finalize $VERSION
```

2. Or use the Sentry GitHub Action in CI/CD

## Testing

Test Sentry integration:

1. Create a test error endpoint:
```typescript
// src/app/api/test-error/route.ts
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    throw new Error("Test error for Sentry");
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Test error sent to Sentry" });
  }
}
```

2. Visit `/api/test-error` and check your Sentry dashboard

## Configuration Options

### Sample Rates

Adjust sample rates based on traffic:

```typescript
tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod
replaysOnErrorSampleRate: 1.0, // Always capture replays on errors
replaysSessionSampleRate: 0.1, // 10% of sessions
```

### Filtering

Filter out sensitive data or known errors:

```typescript
Sentry.init({
  // ... other config
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.authorization;
    }
    
    // Ignore specific errors
    if (event.exception?.values?.[0]?.value?.includes('Known error')) {
      return null;
    }
    
    return event;
  },
});
```

## Monitoring

Once integrated, monitor:
- Error rates and trends
- Performance metrics
- User impact
- Release health

## Best Practices

1. **Don't log sensitive data**: Filter PII, passwords, tokens
2. **Use appropriate log levels**: error, warning, info
3. **Add context**: Include user ID, request ID, etc.
4. **Set up alerts**: Configure alerts for critical errors
5. **Review regularly**: Check Sentry dashboard for new issues
6. **Tag errors**: Use tags to categorize errors
7. **Track releases**: Associate errors with releases

## Troubleshooting

### Errors not appearing in Sentry

1. Check DSN is correct
2. Verify environment variables are set
3. Check browser console for Sentry errors
4. Verify `tracesSampleRate` is > 0
5. Check Sentry project settings

### Performance impact

- Reduce `tracesSampleRate` in production
- Use `beforeSend` to filter unnecessary events
- Disable replay in development

## Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Best Practices](https://docs.sentry.io/product/best-practices/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)

