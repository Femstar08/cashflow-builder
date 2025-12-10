import {withSentryConfig} from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Note: Next.js 16 with Turbopack shows a deprecation warning about middleware.
  // This is a known Turbopack quirk - middleware.ts is still the correct and
  // supported way to implement middleware in Next.js. The warning can be safely ignored.
};

// Check if Sentry auth token is available for source map uploads
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
const hasSentryAuth = Boolean(sentryAuthToken);

// Sentry configuration
// Note: Error tracking works without SENTRY_AUTH_TOKEN (uses DSN).
// Source map uploads require the auth token. If missing, we completely skip
// the wrapper to prevent build failures, but error tracking will still work at runtime.
const sentryConfig = {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: hasSentryAuth ? "beacon-ledger" : "", // Empty org disables uploads
  project: hasSentryAuth ? "javascript-nextjs" : "", // Empty project disables uploads

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
};

// Warn if token is missing (only in production to avoid noise in dev)
if (!hasSentryAuth && process.env.NODE_ENV === 'production') {
  console.warn(
    '⚠️  SENTRY_AUTH_TOKEN not set. Source map uploads disabled. ' +
    'Add SENTRY_AUTH_TOKEN to your Vercel environment variables to enable source map uploads. ' +
    'Error tracking will still work without source maps.'
  );
}

// Always apply Sentry wrapper, but with empty org/project when token is missing
// This prevents the plugin from trying to upload source maps
// Error tracking at runtime still works via DSN in sentry.*.config.ts files
export default withSentryConfig(nextConfig, sentryConfig);