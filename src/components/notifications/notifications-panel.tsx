"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/types/database";

type NotificationsPanelProps = {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => Promise<void>;
  onDismiss: (notificationId: string) => Promise<void>;
};

export function NotificationsPanel({
  notifications,
  onMarkAsRead,
  onDismiss,
}: NotificationsPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    // Return empty string - no emojis for clean, professional look
    return "";
  };

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#15213C]">Notifications</h2>
        {unreadCount > 0 && (
          <span className="rounded-full bg-[#53E9C5] px-2 py-1 text-xs font-medium text-[#15213C]">
            {unreadCount} new
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-sm text-[#5C6478]">No notifications</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg border p-3 ${
                notification.read
                  ? "border-[#E1E4EA] bg-white"
                  : "border-[#53E9C5] bg-[#53E9C5]/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-[#15213C]">{notification.title}</p>
                      <p className="mt-1 text-sm text-[#5C6478]">{notification.message}</p>
                      <p className="mt-1 text-xs text-[#5C6478]">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => onMarkAsRead(notification.id)}
                          className="text-xs text-[#5C6478] hover:text-[#15213C]"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => onDismiss(notification.id)}
                        className="text-xs text-[#5C6478] hover:text-[#15213C]"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

