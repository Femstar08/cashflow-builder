"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
import type { BusinessProfile } from "@/types/database";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { MetricsBar } from "@/components/dashboard/metrics-bar";

// Mock data - replace with API calls
const mockProfile: BusinessProfile = {
  id: "profile-1",
  owner_id: "user-client-1",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  name: "Tech Startup Ltd",
  url: "https://example.com",
  industry: "Technology",
  description: "SaaS platform for small businesses",
  headquarters: "London, UK",
  revenue_model: "Subscription",
  notes: null,
  raw_profile_json: {},
  ai_confidence: 0.85,
  status: "active",
  quick_questions: null,
  entity_type: "limited_company",
  accounting_basis: "accrual",
  vat_enabled: true,
  vat_basis: "accrual",
  include_corporation_tax: true,
  include_paye_nic: true,
  include_dividends: true,
  debtor_days: 30,
  creditor_days: 14,
  director_salary: 50000,
  dividend_payout_ratio: 0.5,
};

type ForecastHorizon = "1Y" | "3Y" | "5Y" | "10Y";

export default function ProfileViewPage() {
  const router = useRouter();
  const params = useParams();
  const user = useUserStore((state) => state.user);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [horizon, setHorizon] = useState<ForecastHorizon>("1Y");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Load profile - in production, this would be an API call
    setProfile(mockProfile);
  }, [user, router, params.profileId]);

  if (!user || !profile) {
    return null;
  }

  const canEdit = user.id === profile.owner_id || user.role === "admin" || user.role === "accountant";

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/hub" className="text-[#5C6478] hover:text-[#15213C]">
              ← Back to profiles
            </Link>
            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-3xl font-bold text-[#15213C]">{profile.name}</h1>
              <span className="rounded-full bg-[#E1E4EA] px-3 py-1 text-sm text-[#5C6478]">
                {profile.entity_type === "limited_company" ? "Limited Company" : "Sole Trader"}
              </span>
              {profile.vat_enabled && (
                <span className="rounded-full bg-[#E1E4EA] px-3 py-1 text-sm text-[#5C6478]">
                  VAT Registered
                </span>
              )}
            </div>
            <p className="mt-1 text-[#5C6478]">
              {profile.industry} • {profile.headquarters}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#5C6478]">Forecast:</span>
              <div className="flex rounded-lg border border-[#E1E4EA]">
                {(["1Y", "3Y", "5Y", "10Y"] as ForecastHorizon[]).map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorizon(h)}
                    className={`px-3 py-1 text-sm font-medium transition-colors ${
                      horizon === h
                        ? "bg-[#53E9C5] text-[#15213C]"
                        : "text-[#5C6478] hover:bg-[#F5F6F8]"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/presenter/${profile.id}`}>Presenter Mode</Link>
            </Button>
            <Button variant="outline">Export Excel</Button>
          </div>
        </div>

        {/* Side-by-Side Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Panel - Business Profile Summary */}
          <div className="space-y-6">
            <Card>
              <h2 className="mb-4 text-xl font-semibold text-[#15213C]">Business Overview</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-[#5C6478]">Description:</span>
                  <p className="mt-1 text-[#15213C]">{profile.description || "No description"}</p>
                </div>
                <div>
                  <span className="text-[#5C6478]">Industry:</span>
                  <span className="ml-2 text-[#15213C]">{profile.industry || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-[#5C6478]">Headquarters:</span>
                  <span className="ml-2 text-[#15213C]">{profile.headquarters || "Not specified"}</span>
                </div>
                {profile.url && (
                  <div>
                    <span className="text-[#5C6478]">Website:</span>
                    <a
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-[#53E9C5] hover:underline"
                    >
                      {profile.url}
                    </a>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-xl font-semibold text-[#15213C]">Revenue Streams</h2>
              <div className="space-y-2">
                <p className="text-sm text-[#5C6478]">Revenue streams will be listed here</p>
                {/* In production, load and display revenue line items */}
              </div>
              {canEdit && (
                <Button variant="outline" size="sm" className="mt-4">
                  Add Revenue Stream
                </Button>
              )}
            </Card>

            <Card>
              <h2 className="mb-4 text-xl font-semibold text-[#15213C]">Cost Categories</h2>
              <div className="space-y-2">
                <p className="text-sm text-[#5C6478]">Cost categories will be listed here</p>
                {/* In production, load and display expense line items */}
              </div>
              {canEdit && (
                <Button variant="outline" size="sm" className="mt-4">
                  Add Cost Category
                </Button>
              )}
            </Card>

            <Card>
              <h2 className="mb-4 text-xl font-semibold text-[#15213C]">Tax Settings</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#5C6478]">VAT Enabled:</span>
                  <span className="font-medium text-[#15213C]">
                    {profile.vat_enabled ? "Yes" : "No"}
                  </span>
                </div>
                {profile.vat_enabled && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#5C6478]">VAT Basis:</span>
                    <span className="font-medium text-[#15213C]">
                      {profile.vat_basis === "accrual" ? "Accrual" : "Cash"}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#5C6478]">Corporation Tax:</span>
                  <span className="font-medium text-[#15213C]">
                    {profile.include_corporation_tax ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5C6478]">PAYE/NIC:</span>
                  <span className="font-medium text-[#15213C]">
                    {profile.include_paye_nic ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5C6478]">Accounting Basis:</span>
                  <span className="font-medium text-[#15213C]">
                    {profile.accounting_basis === "accrual" ? "Accrual" : "Cash"}
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-xl font-semibold text-[#15213C]">Working Capital</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#5C6478]">Debtor Days:</span>
                  <span className="font-medium text-[#15213C]">{profile.debtor_days || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5C6478]">Creditor Days:</span>
                  <span className="font-medium text-[#15213C]">{profile.creditor_days || 0}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-xl font-semibold text-[#15213C]">Key Events</h2>
              <div className="space-y-2">
                <p className="text-sm text-[#5C6478]">Events timeline will be displayed here</p>
                {/* In production, load and display events */}
              </div>
              {canEdit && (
                <Button variant="outline" size="sm" className="mt-4">
                  Add Event
                </Button>
              )}
            </Card>
          </div>

          {/* Right Panel - Forecast Dashboard */}
          <div className="space-y-6">
            <Card>
              <h2 className="mb-4 text-xl font-semibold text-[#15213C]">Net Cashflow</h2>
              <div className="h-64">
                <CashflowChart profileId={profile.id} horizon={horizon} />
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-xl font-semibold text-[#15213C]">Revenue vs Expenses</h2>
              <div className="h-64">
                {/* Revenue vs Expenses chart would go here */}
                <p className="text-sm text-[#5C6478]">Chart placeholder</p>
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-xl font-semibold text-[#15213C]">Key Metrics</h2>
              <MetricsBar profileId={profile.id} horizon={horizon} />
            </Card>

            {/* Collaboration Status */}
            <Card>
              <h2 className="mb-4 text-xl font-semibold text-[#15213C]">Collaboration</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#5C6478]">Status:</span>
                  <span className="font-medium text-[#15213C]">
                    {isEditing ? "Accountant is editing" : "Available"}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Share / Invite Collaborator
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  View Activity Log
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

