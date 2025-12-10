"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service in production
    Sentry.captureException(error);
    import("@/lib/logger").then(({ logger }) => {
      logger.error("Application error", error, {
        digest: error.digest,
        pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      });
    });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold text-[#15213C]">Something went wrong</h1>
        <p className="text-[#5C6478]">
          We encountered an unexpected error. Please try again.
        </p>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-[#5C6478]">
              Error details (development only)
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-[#E1E4EA] p-4 text-xs">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}

