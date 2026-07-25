"use client";

import type { LucideIcon } from "lucide-react";
import {
  BusFront,
  CircleX,
  Construction,
  Gift,
  Megaphone,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useState } from "react";
import NotificationHeader from "@/component/head/NotificationHeader";
import NotificationAlerts from "@/component/notification/NotificationAlerts";
import NotificationBanner from "@/component/notification/NotificationBanner";
import NotificationItems from "@/component/notification/NotificationItems";
import NotificationSettings from "@/component/settings/NotificationSettings";
import TrackLayout from "@/component/track-layout/TrackLayout";
import { useLanguage } from "@/context/LanguageContext";
import type { NotificationData, NotificationsResponse } from "@/utils/api";
import { fetchApi } from "@/utils/api";

const ICON_MAP: Record<string, LucideIcon> = {
  TriangleAlert,
  CircleX,
  BusFront,
  Megaphone,
  Gift,
  Construction,
};

const Page = () => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    fetchApi<NotificationsResponse>("/notifications")
      .then((data) => {
        if (data.success && data.notifications)
          setNotifications(data.notifications);
      })
      .catch((err) => console.error("Failed to load notifications:", err))
      .finally(() => setLoading(false));
  }, []);

  async function markAllAsRead() {
    try {
      await fetchApi<{ success: boolean; message?: string }>(
        "/notifications/mark-all-read",
        { method: "POST" },
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      window.dispatchEvent(new CustomEvent("notifications:updated"));
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  }

  async function markAsRead(id: string) {
    try {
      await fetchApi<{ success: boolean }>(`/notifications/${id}/read`, {
        method: "PATCH",
        body: JSON.stringify({ read: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      window.dispatchEvent(new CustomEvent("notifications:updated"));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <TrackLayout>
      <div className="flex flex-col gap-6 p-4 sm:p-5 lg:flex-row lg:gap-10">
        <div className="flex w-full flex-col gap-3 lg:w-2/3">
          <div>
            <NotificationHeader
              notifications={notifications}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              onMarkAllRead={markAllAsRead}
            />
          </div>

          <div>
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                {t("notifications.loading")}
              </div>
            ) : (
              (() => {
                const filtered = notifications.filter((n) => {
                  if (activeCategory === "All") return true;
                  if (activeCategory === "Alerts")
                    return (n.badge || "").toLowerCase() === "alert";
                  if (activeCategory === "Service Updates")
                    return (n.badge || "").toLowerCase() === "service update";
                  if (activeCategory === "Promotions")
                    return (n.badge || "").toLowerCase() === "promotion";
                  if (activeCategory === "General")
                    return (n.badge || "").toLowerCase() === "general";
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-6 text-center text-gray-500">
                      {t("notifications.empty")}
                    </div>
                  );
                }

                return filtered.map((n) => {
                  const Icon = ICON_MAP[n.icon] || TriangleAlert;
                  return (
                    <NotificationItems
                      key={n._id}
                      icon={Icon}
                      title={n.title}
                      description={n.description}
                      badge={n.badge}
                      time={new Date(n.createdAt).toLocaleString()}
                      iconBg={n.iconBg}
                      iconColor={n.iconColor}
                      badgeBg={n.badgeBg}
                      badgeColor={n.badgeColor}
                      read={!!n.read}
                      onMarkRead={() => markAsRead(n._id)}
                    />
                  );
                });
              })()
            )}

            <div className="p-4 border-t border-brand-lightgray text-center">
              <button
                type="button"
                className="text-brand-darkgreen font-medium text-sm hover:underline flex items-center justify-center gap-2 mx-auto"
              >
                {t("notifications.load_more") ?? "Load More"}{" "}
                <i className="fa-solid fa-chevron-down text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-1/3">
          <div>
            <NotificationAlerts
              notifications={notifications}
              onViewAllAlerts={() => {
                setActiveCategory("Alerts");
                scrollToTop();
              }}
            />
          </div>
          <div>
            <NotificationSettings />
          </div>
          <div>
            <NotificationBanner />
          </div>
        </div>
      </div>
    </TrackLayout>
  );
};

export default Page;
