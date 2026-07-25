"use client";

import { TriangleAlert, Construction } from "lucide-react";
import { NotificationData } from "@/utils/api";

type Props = {
  notifications?: NotificationData[];
  onViewAllAlerts?: () => void;
};

function timeAgo(dateStr?: string) {
  if (!dateStr) return "just now";
  const d = new Date(dateStr).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

const DEFAULT_ALERTS = [
  {
    title: "Delay on Route 9C",
    description: "15 min delay",
    time: "5 min ago",
    icon: TriangleAlert,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    title: "Road Closure on Airport Road",
    description: "Jun 2 - Jun 4",
    time: "1 hour ago",
    icon: Construction,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
];

const NotificationAlerts = ({ notifications, onViewAllAlerts }: Props) => {
  const alerts = (notifications && notifications.length)
    ? notifications
        .filter((n) => (n.badge || "").toLowerCase() === "alert")
        .slice(0, 3)
        .map((n) => ({
          title: n.title,
          description: n.description,
          time: timeAgo(n.createdAt),
          icon: (n.icon === "TriangleAlert" ? TriangleAlert : TriangleAlert),
          iconBg: n.iconBg || "bg-red-100",
          iconColor: n.iconColor || "text-red-600",
        }))
    : DEFAULT_ALERTS;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold sm:text-lg">Active Alerts</h3>

        <button
          onClick={onViewAllAlerts}
          className="text-xs font-medium text-primary hover:underline sm:text-sm"
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {alerts.map((alert, index) => {
          const Icon = alert.icon;

          return (
            <div key={index} className="flex items-start gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${alert.iconBg} ${alert.iconColor}`}>
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-semibold">{alert.title}</h4>

                <div className="mt-1 flex justify-between gap-4 text-xs text-gray-500">
                  <span>{alert.description}</span>

                  <span>{alert.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onViewAllAlerts}
        className="mt-4 w-full rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 active:scale-[0.98]"
      >
        View All Alerts
      </button>
    </div>
  );
};

export default NotificationAlerts;