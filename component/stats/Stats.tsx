"use client";

import { useEffect, useState } from "react";
import { Bus, Route, Users, Clock3 } from "lucide-react";
import { fetchApi, StatsData } from "../../utils/api";
import { useLanguage } from "@/context/LanguageContext";

const Stats = () => {
  const { t } = useLanguage();
  const [statsData, setStatsData] = useState({
    activeBuses: "0",
    totalRoutes: "0",
    activeTracking: "0",
    onTimePerformance: "0%",
  });

  useEffect(() => {
    fetchApi<StatsData>("/dashboard/stats")
      .then((data) => {
        if (data.success && data.stats) {
          const s = data.stats;
          const onTime =
            s.totalBuses > 0
              ? `${Math.round(((s.totalBuses - s.delaysCount) / s.totalBuses) * 100)}%`
              : "0%";
          setStatsData({
            activeBuses: `${s.activeBuses}`,
            totalRoutes: `${s.totalRoutes}`,
            activeTracking: `${s.activeTracking}`,
            onTimePerformance: onTime,
          });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard stats:", err);
      });
  }, []);

  const stats = [
    {
      value: statsData.activeBuses,
      label: t("stats.active_buses"),
      icon: Bus,
    },
    {
      value: statsData.totalRoutes,
      label: t("stats.routes"),
      icon: Route,
    },
    {
      value: statsData.activeTracking,
      label: t("stats.live_tracking"),
      icon: Users,
    },
    {
      value: statsData.onTimePerformance,
      label: t("stats.on_time_performance"),
      icon: Clock3,
    },
  ];

  return (
    <section className="border-y border-border bg-surface py-10 transition-colors">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-8 lg:justify-between">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div key={index} className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-primary/20 text-primary">
                  <Icon className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>

                {index !== stats.length - 1 && (
                  <div className="ml-6 hidden h-12 w-px bg-gray-200 dark:bg-gray-700 lg:block"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;