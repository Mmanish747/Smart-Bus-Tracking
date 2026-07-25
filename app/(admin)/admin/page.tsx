"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Zap,
  Bus,
  Shield,
  Calendar,
  TrendingUp,
  Gauge,
  Navigation,
  User,
  Bell,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchApi, StatsData, NotificationData, NotificationsResponse } from "@/utils/api";
import LoadingSpinner from "@/component/ui/LoadingSpinner";
import MapView from "@/component/LiveTracking/MapView";
import { useLiveTracking } from "@/hooks/useLiveTracking";
import DashboardCards from "@/component/admin/DashboardCards";
import AnalyticsCharts from "@/component/admin/AnalyticsCharts";
import QuickActions from "@/component/admin/QuickActions";
import SystemHealth from "@/component/admin/SystemHealth";
import RealtimeLogs from "@/component/admin/RealtimeLogs";

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<StatsData["stats"] | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const { routes, trackingByRouteId, tracking } = useLiveTracking();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    Promise.all([
      fetchApi<StatsData>("/dashboard/stats", {}, token ?? undefined),
      fetchApi<NotificationsResponse>("/notifications?limit=5", {}, token ?? undefined),
    ])
      .then(([statsRes, notifRes]) => {
        setStats(statsRes.stats);
        setNotifications(notifRes.notifications || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!stats) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">Failed to load dashboard stats.</p>
      </div>
    );
  }

  const activeBusPercent =
    stats.totalBuses > 0
      ? Math.round((stats.activeBuses / stats.totalBuses) * 100)
      : 0;
  const onTimePercent =
    stats.totalBuses > 0
      ? Math.round(
          ((stats.totalBuses - stats.delaysCount) / stats.totalBuses) * 100
        )
      : 100;
  const trackingPercent =
    stats.totalBuses > 0
      ? Math.round((stats.activeTracking / stats.totalBuses) * 100)
      : 0;
  const schedulePercent =
    stats.totalRoutes > 0
      ? Math.round((stats.totalSchedules / stats.totalRoutes) * 100)
      : 0;

  const healthMetrics = [
    {
      label: "Active Buses",
      value: activeBusPercent,
      detail: `${stats.activeBuses} / ${stats.totalBuses} fleet utilization`,
    },
    {
      label: "On-Time Performance",
      value: onTimePercent,
      detail: `${stats.delaysCount} delayed out of ${stats.totalBuses} buses`,
    },
    {
      label: "Live Tracking",
      value: trackingPercent,
      detail: `${stats.activeTracking} buses currently tracked`,
    },
    {
      label: "Schedule Coverage",
      value: schedulePercent,
      detail: `${stats.totalSchedules} schedules for ${stats.totalRoutes} routes`,
    },
  ];

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good Morning"
      : now.getHours() < 17
      ? "Good Afternoon"
      : "Good Evening";
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const activeRoute = routes[selectedIndex];
  const activeRouteCoords = activeRoute?.pathCoordinates || [];
  const activeTracking = activeRoute
    ? trackingByRouteId.get(activeRoute._id)
    : undefined;

  const mapCenter: [number, number] | undefined = activeTracking
    ? [activeTracking.latitude, activeTracking.longitude]
    : activeRouteCoords.length > 0
    ? activeRouteCoords[0]
    : undefined;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-strong via-primary to-accent p-6 text-white shadow-lg sm:p-8">
        <div className="relative z-10">
          <p className="text-sm font-medium text-white/80">{dateStr}</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {greeting}, {user?.name || "Admin"} 👋
          </h1>
          <p className="mt-2 max-w-lg text-sm text-white/85">
            Here&apos;s what&apos;s happening with your fleet today.
            {stats.alertNotifications > 0 && (
              <span className="ml-1 font-semibold text-white">
                You have {stats.alertNotifications} alert
                {stats.alertNotifications > 1 ? "s" : ""} that need attention.
              </span>
            )}
          </p>
          <Link
            href="/admin/tracking"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
          >
            <MapPin className="h-4 w-4" />
            View Live Tracking
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute right-20 top-8 h-20 w-20 rounded-full bg-white/5" />
      </div>

      {/* Live Fleet Map */}
      <section className="w-full overflow-hidden rounded-3xl border border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="h-72 sm:h-105">
          <MapView
            center={mapCenter}
            routeCoordinates={activeRouteCoords}
            routeLabel={
              activeRoute ? `${activeRoute.from} → ${activeRoute.to}` : undefined
            }
            showBus={!!activeTracking}
            busPosition={
              activeTracking
                ? [activeTracking.latitude, activeTracking.longitude]
                : undefined
            }
            busName={activeTracking?.bus?.busNumber || "Bus"}
            speed={activeTracking?.speed}
            eta={activeTracking?.eta}
            nextStop={activeTracking?.nextStop}
            namedStops={activeRoute?.stops}
            stopETAs={activeTracking?.stopETAs}
          />
        </div>

        <div className="p-6">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-sidebar-muted">Current Focus</p>
              <h2 className="text-2xl font-bold">
                {activeRoute ? `${activeRoute.from} → ${activeRoute.to}` : "Kathmandu Valley Routes"}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-accent">
                <span className="live-dot h-2 w-2 rounded-full bg-accent" />
                {tracking.length} vehicle{tracking.length === 1 ? "" : "s"} active • On-time
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {routes.slice(0, 5).map((r, idx) => (
                <button
                  key={r._id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    idx === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : "bg-white/5 text-sidebar-muted hover:bg-white/10"
                  }`}
                >
                  {r.routeNo}
                </button>
              ))}
              <Link
                href="/admin/tracking"
                className="rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition hover:brightness-110"
              >
                View Details
              </Link>
            </div>
          </div>

          {/* New Active Route details section */}
          {activeRoute && (
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="space-y-2 rounded-xl bg-white/5 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sidebar-muted">Route Config</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-sidebar-muted">Via:</span> {activeRoute.via || "Direct"}</p>
                  <p><span className="text-sidebar-muted">Frequency:</span> {activeRoute.frequency}</p>
                  <p><span className="text-sidebar-muted">Total Stops:</span> {activeRoute.stops?.length || 0}</p>
                </div>
              </div>

              <div className="space-y-2 rounded-xl bg-white/5 p-4 col-span-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sidebar-muted">Live Bus Info</h4>
                {activeTracking ? (
                  <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5"><Bus className="h-4 w-4 text-primary" /> <span className="text-sidebar-muted">Bus No:</span>  {activeTracking.bus?.busNumber || "Bus"}</p>
                      <p className="flex items-center gap-1.5"><User className="h-4 w-4 text-accent" /> <span className="text-sidebar-muted">Driver:</span> {activeTracking.driverName}</p>
                      <p className="flex items-center gap-1.5"><Gauge className="h-4 w-4 text-info" /> <span className="text-sidebar-muted">Speed:</span> {activeTracking.speed?.toFixed(0) || 0} km/h</p>
                    </div>
                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5"><Navigation className="h-4 w-4 text-success" /> <span className="text-sidebar-muted">Next Stop:</span> {activeTracking.nextStop || "N/A"}</p>
                      <p className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-warning" /> <span className="text-sidebar-muted">ETA:</span> {activeTracking.eta || "N/A"}</p>
                      <p className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-primary" /> <span className="text-sidebar-muted">Status:</span> <span className="text-green-400 font-semibold">{activeTracking.status}</span></p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-sidebar-muted flex items-center gap-2 py-2">
                    <AlertTriangle className="h-4 w-4" /> No bus is currently running live on this route.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats Grid */}
      <DashboardCards stats={stats} />

      {/* Analytics Visualizations */}
      <AnalyticsCharts stats={stats} />

      {/* Middle Row: System Overview + Quick Actions + Recent Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SystemHealth metrics={healthMetrics} />
        
        {/* Recent System Alerts */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Recent System Alerts</h2>
              <Bell className="h-5 w-5 text-muted-foreground/50" />
            </div>
            
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No recent alerts or logs.</p>
              ) : (
                notifications.slice(0, 4).map((notif) => (
                  <div key={notif._id} className="flex gap-3 text-sm pb-2 border-b border-border/40 last:border-0">
                    <div className={`mt-0.5 rounded-lg p-1.5 h-fit ${notif.iconBg || "bg-yellow-500/10"}`}>
                      <AlertTriangle className={`h-4 w-4 ${notif.iconColor || "text-yellow-600"}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{notif.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{notif.description}</p>
                      <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <Link href="/admin/notifications" className="mt-4 text-center text-xs font-semibold text-primary hover:underline block pt-2">
            View All Notifications
          </Link>
        </div>

        <QuickActions />
      </div>

      {/* Bottom Row: Fleet Status + Realtime Log */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fleet Status Cards */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Fleet Status</h2>
            <Link
              href="/admin/buses"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-info/10 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-info" />
                <span className="text-sm font-medium text-info">Active</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{stats.activeBuses}</p>
            </div>

            <div className="rounded-xl bg-warning/10 p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                <span className="text-sm font-medium text-warning">Delayed</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{stats.delaysCount}</p>
            </div>

            <div className="rounded-xl bg-primary/10 p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">On Route</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{stats.activeTracking}</p>
            </div>

            <div className="rounded-xl bg-muted p-4">
              <div className="flex items-center gap-2">
                <Bus className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Inactive</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {stats.totalBuses - stats.activeBuses}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted p-3 text-center">
              <Shield className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
              <p className="text-lg font-bold text-foreground">{stats.totalUsers}</p>
              <p className="text-[10px] text-muted-foreground">Users</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <Calendar className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
              <p className="text-lg font-bold text-foreground">{stats.totalSchedules}</p>
              <p className="text-[10px] text-muted-foreground">Schedules</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <TrendingUp className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
              <p className="text-lg font-bold text-foreground">{onTimePercent}%</p>
              <p className="text-[10px] text-muted-foreground">On Time</p>
            </div>
          </div>
        </div>

        {/* Realtime Tracking Log */}
        <RealtimeLogs tracking={tracking} />
      </div>
    </div>
  );
}

