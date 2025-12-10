"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProfileSharePermission } from "@/types/database";

type ShareProfileModalProps = {
  profileId: string;
  profileName: string;
  onClose: () => void;
  onShare: (email: string, permission: ProfileSharePermission) => Promise<void>;
};

export function ShareProfileModal({ profileId, profileName, onShare, onClose }: ShareProfileModalProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<ProfileSharePermission>("view");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onShare(email, permission);
      setEmail("");
      // Don't close immediately - show success message
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to share profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <h2 className="mb-2 text-xl font-semibold text-[#15213C]">Share Profile</h2>
          <p className="mb-4 text-sm text-[#5C6478]">
            Share "{profileName}" with a collaborator
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#15213C]">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#E1E4EA] px-4 py-2 text-[#15213C] focus:border-[#53E9C5] focus:outline-none"
                placeholder="collaborator@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#15213C]">
                Permission Level
              </label>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value as ProfileSharePermission)}
                className="w-full rounded-lg border border-[#E1E4EA] px-4 py-2 text-[#15213C] focus:border-[#53E9C5] focus:outline-none"
              >
                <option value="view">View Only</option>
                <option value="comment">Comment</option>
                <option value="edit">Edit</option>
              </select>
              <p className="mt-1 text-xs text-[#5C6478]">
                {permission === "view" && "Can view the profile and forecast"}
                {permission === "comment" && "Can view and add comments"}
                {permission === "edit" && "Can view, comment, and make edits"}
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Sharing..." : "Send Invitation"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

