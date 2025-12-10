"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
import type { BusinessProfile } from "@/types/database";

// Mock data - replace with real API calls
const mockProfiles: BusinessProfile[] = [
  {
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
  },
];

type ViewMode = "grid" | "list";

export default function HubPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "archived">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push("/login");
      return;
    }

    // Load profiles - filter based on user role
    // In production, this would be an API call
    let filteredProfiles = mockProfiles;
    
    if (user.role === "client") {
      // Clients see: profiles they own + profiles shared with them
      filteredProfiles = mockProfiles.filter((p) => p.owner_id === user.id);
    } else if (user.role === "accountant") {
      // Accountants see: profiles assigned to them
      filteredProfiles = mockProfiles.filter((p) => p.owner_id !== user.id); // Mock: assigned profiles
    } else if (user.role === "admin") {
      // Admins see all profiles
      filteredProfiles = mockProfiles;
    }

    // Apply filters
    if (filterStatus !== "all") {
      filteredProfiles = filteredProfiles.filter((p) => p.status === filterStatus);
    }

    // Apply search
    if (searchQuery) {
      filteredProfiles = filteredProfiles.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.industry?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setProfiles(filteredProfiles);
  }, [user, router, filterStatus, searchQuery]);

  const getCashRunwayStatus = (profile: BusinessProfile): { status: "green" | "amber" | "red"; label: string } => {
    // Mock calculation - in production, calculate from forecast
    return { status: "green", label: "12 months" };
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!user) {
    return null; // Will redirect
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#15213C]">My Business Profiles</h1>
            <p className="mt-1 text-[#5C6478]">
              {profiles.length} {profiles.length === 1 ? "profile" : "profiles"}
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/hub/new">Create new business profile</Link>
          </Button>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <input
              type="text"
              placeholder="Search profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-lg border border-[#E1E4EA] px-4 py-2 text-[#15213C] focus:border-[#53E9C5] focus:outline-none"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="rounded-lg border border-[#E1E4EA] px-4 py-2 text-[#15213C] focus:border-[#53E9C5] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-[#53E9C5] text-[#15213C]"
                  : "bg-white text-[#5C6478] hover:bg-[#F5F6F8]"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-[#53E9C5] text-[#15213C]"
                  : "bg-white text-[#5C6478] hover:bg-[#F5F6F8]"
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Profiles Display */}
        {profiles.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="mb-4 text-lg text-[#5C6478]">No profiles found</p>
            <Button asChild>
              <Link href="/hub/new">Create your first business profile</Link>
            </Button>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => {
              const runway = getCashRunwayStatus(profile);
              return (
                <Card
                  key={profile.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => router.push(`/hub/${profile.id}`)}
                >
                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-[#15213C]">{profile.name}</h3>
                        <p className="mt-1 text-sm text-[#5C6478]">{profile.industry || "No industry"}</p>
                      </div>
                      <span className="rounded-full bg-[#E1E4EA] px-2 py-1 text-xs text-[#5C6478]">
                        {profile.entity_type === "limited_company" ? "Ltd" : "Sole Trader"}
                      </span>
                    </div>

                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            runway.status === "green"
                              ? "bg-green-500"
                              : runway.status === "amber"
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                        />
                        <span className="text-[#5C6478]">Cash runway: {runway.label}</span>
                      </div>
                      <div className="text-sm text-[#5C6478]">
                        Last updated: {formatDate(profile.updated_at)}
                      </div>
                      <div className="text-sm text-[#5C6478]">
                        Status: <span className="font-medium">{profile.status || "active"}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {profile.vat_enabled && (
                        <span className="rounded-full bg-[#E1E4EA] px-2 py-1 text-xs text-[#5C6478]">
                          VAT registered
                        </span>
                      )}
                      {profile.status === "archived" && (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">
                          Archived
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Share would go here
                        }}
                        className="flex-1 rounded-lg border border-[#E1E4EA] px-3 py-2 text-xs text-[#5C6478] hover:bg-[#F5F6F8]"
                        title="Share"
                      >
                        Share
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newStatus = profile.status === "archived" ? "active" : "archived";
                          setProfiles((prev) =>
                            prev.map((p) =>
                              p.id === profile.id ? { ...p, status: newStatus as typeof profile.status } : p
                            )
                          );
                        }}
                        className="flex-1 rounded-lg border border-[#E1E4EA] px-3 py-2 text-xs text-[#5C6478] hover:bg-[#F5F6F8]"
                        title={profile.status === "archived" ? "Unarchive" : "Archive"}
                      >
                        {profile.status === "archived" ? "Unarchive" : "Archive"}
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[#E1E4EA]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#15213C]">Business Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#15213C]">Industry</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#15213C]">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#15213C]">Last Updated</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#15213C]">Cash Runway</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#15213C]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => {
                    const runway = getCashRunwayStatus(profile);
                    return (
                      <tr
                        key={profile.id}
                        className="cursor-pointer border-b border-[#E1E4EA] hover:bg-[#F5F6F8]"
                        onClick={() => router.push(`/hub/${profile.id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-[#15213C]">{profile.name}</div>
                          <div className="text-sm text-[#5C6478]">
                            {profile.entity_type === "limited_company" ? "Limited Company" : "Sole Trader"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#5C6478]">{profile.industry || "—"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              profile.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {profile.status || "active"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#5C6478]">
                          {formatDate(profile.updated_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                runway.status === "green"
                                  ? "bg-green-500"
                                  : runway.status === "amber"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                            />
                            <span className="text-sm text-[#5C6478]">{runway.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Share/invite would go here
                              }}
                              className="text-[#5C6478] hover:text-[#15213C] text-sm"
                              title="Share"
                            >
                              Share
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Archive would go here
                                const newStatus = profile.status === "archived" ? "active" : "archived";
                                // In production, call API to update status
                                setProfiles((prev) =>
                                  prev.map((p) =>
                                    p.id === profile.id ? { ...p, status: newStatus as typeof profile.status } : p
                                  )
                                );
                              }}
                              className="text-[#5C6478] hover:text-[#15213C] text-sm"
                              title={profile.status === "archived" ? "Unarchive" : "Archive"}
                            >
                              {profile.status === "archived" ? "Unarchive" : "Archive"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Activity log would go here
                              }}
                              className="text-[#5C6478] hover:text-[#15213C]"
                              title="Activity Log"
                            >
                              📋
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

