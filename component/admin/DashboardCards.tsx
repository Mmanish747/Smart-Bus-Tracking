"use client";

import { Bus, Route, Users, AlertTriangle } from "lucide-react";
import StatsCard from "@/component/ui/StatsCard";
import type { StatsData } from "@/utils/api";

interface DashboardCardsProps {
  stats: StatsData["stats"];
}

export default function DashboardCards({ stats }: DashboardCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        icon={Bus}
        label="Total Buses"
        value={stats.totalBuses}
        tone="primary"
        subtitle={`${stats.activeBuses} active`}
      />
      <StatsCard
        icon={Route}
        label="Total Routes"
        value={stats.totalRoutes}
        tone="accent"
        subtitle={`${stats.totalSchedules} schedules`}
      />
      <StatsCard
        icon={Users}
        label="Total Users"
        value={stats.totalUsers}
        tone="info"
        subtitle={`${stats.activeTracking} tracked`}
      />
      <StatsCard
        icon={AlertTriangle}
        label="Active Alerts"
        value={stats.alertNotifications}
        tone="warning"
        subtitle={`${stats.delaysCount} delays`}
      />
    </div>
  );
}
