"use client";

import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface NotificationItemsProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge: string;
  time: string;
  iconBg?: string;
  iconColor?: string;
  badgeBg?: string;
  badgeColor?: string;
  read?: boolean;
  onMarkRead?: () => void;
}

const NotificationItems = ({
  icon: Icon,
  title,
  description,
  badge,
  time,
  iconBg = "bg-red-100",
  iconColor = "text-red-500",
  badgeBg = "bg-red-100",
  badgeColor = "text-red-600",
  read = false,
  onMarkRead,
}: NotificationItemsProps) => {
  const { t } = useLanguage();
  return (
    <section
      className={`w-full rounded-lg border border-gray-200 bg-white p-4 ${read ? "opacity-60" : ""}`}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>

            <span className="text-xs text-gray-400">{time}</span>
          </div>

          <p className="mt-1 text-sm text-gray-500 leading-6">{description}</p>

          <div className="mt-3 flex items-center gap-3">
            <span
              className={`inline-flex rounded-md px-3 py-1 text-xs font-medium ${badgeBg} ${badgeColor}`}
            >
              {badge}
            </span>

            {!read && onMarkRead && (
              <button
                type="button"
                onClick={onMarkRead}
                className="ml-2 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
              >
                {t("notifications.mark_as_read")}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotificationItems;
