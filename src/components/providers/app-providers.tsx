"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useState, useEffect } from "react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

// Track if modules are registered to avoid duplicate registration
let modulesRegistered = false;

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());

  // Register AG Grid modules once on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !modulesRegistered) {
      try {
        ModuleRegistry.registerModules([AllCommunityModule]);
        modulesRegistered = true;
      } catch (e) {
        // Ignore registration errors
        console.warn("AG Grid module registration warning:", e);
      }
    }
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

