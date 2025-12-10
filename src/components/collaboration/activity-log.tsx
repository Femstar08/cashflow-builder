"use client";

import { Card } from "@/components/ui/card";
import type { ProfileActivity } from "@/types/database";

type ActivityLogProps = {
  profileId: string;
  activities: ProfileActivity[];
};

export function ActivityLog({ activities }: ActivityLogProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (type: ProfileActivity["activity_type"]) => {
    // Return empty string - no emojis for clean, professional look
    return "";
  };

  return (
    <Card>
      <h2 className="mb-4 text-xl font-semibold text-[#15213C]">Activity Log</h2>
      {activities.length === 0 ? (
        <p className="text-sm text-[#5C6478]">No activity yet</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3 border-b border-[#E1E4EA] pb-3 last:border-0">
              <div className="flex-1">
                <p className="text-sm text-[#15213C]">{activity.description}</p>
                <p className="mt-1 text-xs text-[#5C6478]">{formatDate(activity.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

