"use client";

import { AppShell } from "@/components/layout/app-shell";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import { AdvisorAgentPanel } from "@/components/agent/advisor-agent-panel";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Central Dashboard Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">

            {/* Dashboard Header */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#53E9C5]/20 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-[#53E9C5]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Cashflow Dashboard</h1>
                <p className="text-[#5C6478] mt-1">Where would you like to start today?</p>
              </div>
            </div>

            {/* Dashboard Cards */}
            <DashboardCards />
          </div>
        </div>

        {/* Right Chat Panel */}
        <div className="w-96 flex-shrink-0">
          <AdvisorAgentPanel />
        </div>
      </div>
    </AppShell>
  );
}
