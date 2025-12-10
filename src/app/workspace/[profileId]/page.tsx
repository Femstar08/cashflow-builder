"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { DocumentsPanel } from "@/components/workspace/documents-panel";
import { ProfileSummaryPanel } from "@/components/workspace/profile-summary-panel";
import { AgentChat } from "@/components/agent/agent-chat";
import { MiniForecastSummary } from "@/components/workspace/mini-forecast-summary";
import { ActivityLog } from "@/components/collaboration/activity-log";
import { AssumptionsPanel } from "@/components/workspace/assumptions-panel";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
import type { BusinessProfile, ProfileActivity } from "@/types/database";

type DocumentItem = {
  id: string;
  name: string;
  type: string;
  size: number;
  extractedText?: string;
  extractionNotes?: string;
  uploadedBy?: string;
  uploadedByRole?: string;
  uploadedAt?: string;
  metadata?: Record<string, unknown>;
};

type ForecastHorizon = "1Y" | "3Y" | "5Y" | "10Y";

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const profileId = params.profileId as string;
  
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activities, setActivities] = useState<ProfileActivity[]>([]);
  const [activeLeftTab, setActiveLeftTab] = useState<"documents" | "profile" | "assumptions">("documents");
  const [horizon, setHorizon] = useState<ForecastHorizon>("1Y");
  const [showActivityLog, setShowActivityLog] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    loadProfile();
    loadDocuments();
    loadActivities();
  }, [profileId, user, router]);

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/profiles/${profileId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await fetch(`/api/profile/documents?profileId=${profileId}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
    }
  };

  const loadActivities = async () => {
    try {
      const response = await fetch(`/api/profile/activities?profileId=${profileId}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Failed to load activities:", error);
    }
  };

  const handleDocumentUploaded = () => {
    loadDocuments();
    loadActivities();
  };

  if (!user || !profile) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-screen">
          <p className="text-[#5C6478]">Loading...</p>
        </div>
      </AppShell>
    );
  }

  const canEdit = user.id === profile.owner_id || user.role === "admin" || user.role === "accountant";
  const isAccountant = user.role === "accountant" || user.role === "admin";

  return (
    <AppShell>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-[#E1E4EA] bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#15213C]">{profile.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-[#5C6478]">
                    {profile.entity_type === "limited_company" ? "Limited Company" : 
                     profile.entity_type === "sole_trader" ? "Sole Trader" : 
                     profile.entity_type || "Unknown"}
                  </span>
                  <div className="flex gap-1">
                    {(["1Y", "3Y", "5Y", "10Y"] as ForecastHorizon[]).map((h) => (
                      <button
                        key={h}
                        onClick={() => setHorizon(h)}
                        className={`px-2 py-1 text-xs rounded ${
                          horizon === h
                            ? "bg-[#53E9C5] text-[#15213C] font-semibold"
                            : "bg-[#E1E4EA] text-[#5C6478] hover:bg-[#D1D4DA]"
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowActivityLog(!showActivityLog)}
              >
                Activity
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/${profileId}`)}
              >
                Full Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Collaboration Banner */}
        {isAccountant && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-2">
            <p className="text-sm text-blue-800">
              <strong>{user.name || "Accountant"}</strong> is editing. Clients can upload documents and leave comments.
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column */}
          <div className="w-96 border-r border-[#E1E4EA] bg-white flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-[#E1E4EA]">
              <button
                onClick={() => setActiveLeftTab("documents")}
                className={`flex-1 px-3 py-3 text-xs font-medium ${
                  activeLeftTab === "documents"
                    ? "text-[#15213C] border-b-2 border-[#53E9C5]"
                    : "text-[#5C6478] hover:text-[#15213C]"
                }`}
              >
                Documents {documents.length > 0 && `(${documents.length})`}
              </button>
              <button
                onClick={() => setActiveLeftTab("profile")}
                className={`flex-1 px-3 py-3 text-xs font-medium ${
                  activeLeftTab === "profile"
                    ? "text-[#15213C] border-b-2 border-[#53E9C5]"
                    : "text-[#5C6478] hover:text-[#15213C]"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveLeftTab("assumptions")}
                className={`flex-1 px-3 py-3 text-xs font-medium ${
                  activeLeftTab === "assumptions"
                    ? "text-[#15213C] border-b-2 border-[#53E9C5]"
                    : "text-[#5C6478] hover:text-[#15213C]"
                }`}
              >
                Assumptions
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeLeftTab === "documents" && (
                <DocumentsPanel
                  profileId={profileId}
                  documents={documents}
                  onDocumentUploaded={handleDocumentUploaded}
                  canEdit={canEdit}
                />
              )}
              {activeLeftTab === "profile" && (
                <ProfileSummaryPanel profile={profile} />
              )}
              {activeLeftTab === "assumptions" && (
                <div className="p-4">
                  <AssumptionsPanel profileId={profileId} />
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top: Agent Chat */}
            <div className="flex-1 border-b border-[#E1E4EA]">
              <AgentChat profileId={profileId} />
            </div>

            {/* Bottom: Mini Forecast */}
            <div className="h-64 border-t border-[#E1E4EA]">
              <MiniForecastSummary profileId={profileId} horizon={horizon} />
            </div>
          </div>
        </div>

        {/* Activity Log Modal */}
        {showActivityLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold text-[#15213C]">Activity Log</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActivityLog(false)}
                >
                  ×
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <ActivityLog profileId={profileId} activities={activities} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

