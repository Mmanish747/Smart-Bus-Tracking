"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Radio, Gauge, TrendingUp, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import {
  fetchApi,
  TrackingData,
  TrackingResponse,
  BusData,
  RouteData,
  RoutesResponse,
} from "@/utils/api";
import DataTable, { Column } from "@/component/ui/DataTable";
import PageHeader from "@/component/ui/PageHeader";
import Modal from "@/component/ui/Modal";
import ConfirmDialog from "@/component/ui/ConfirmDialog";
import LoadingSpinner from "@/component/ui/LoadingSpinner";
import StatsCard from "@/component/ui/StatsCard";
import StatusBadge from "@/component/ui/StatusBadge";
import MapView from "@/component/LiveTracking/MapView";
import TrackingSidebar from "@/component/admin/TrackingSidebar";

const trackingSchema = z.object({
  bus: z.string().min(1, "Bus is required"),
  route: z.string().min(1, "Route is required"),
});

type TrackingFormData = z.infer<typeof trackingSchema>;

export default function TrackingPage() {
  const { token } = useAuth();
  const [tracking, setTracking] = useState<TrackingData[]>([]);
  const [buses, setBuses] = useState<BusData[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingTracking, setDeletingTracking] = useState<TrackingData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TrackingFormData>({
    resolver: zodResolver(trackingSchema),
  });

  const fetchAll = async () => {
    try {
      const [trackRes, busRes, routeRes] = await Promise.all([
        fetchApi<TrackingResponse>("/tracking", {}, token ?? undefined),
        fetchApi<{ success: boolean; buses: BusData[] }>("/buses", {}, token ?? undefined),
        fetchApi<RoutesResponse>("/routes", {}, token ?? undefined),
      ]);
      setTracking(trackRes.tracking);
      setBuses(busRes.buses);
      setRoutes(routeRes.routes);
      setSelectedId((prev) => prev ?? trackRes.tracking[0]?._id ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const openCreate = () => {
    reset({ bus: "", route: "" });
    setShowModal(true);
  };

  const onSubmit = async (data: TrackingFormData) => {
    setSubmitting(true);
    try {
      await fetchApi(
        "/tracking/initialize",
        { method: "POST", body: JSON.stringify(data) },
        token ?? undefined
      );
      setShowModal(false);
      reset();
      fetchAll();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (item: TrackingData) => {
    setDeletingTracking(item);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deletingTracking) return;
    try {
      await fetchApi(`/tracking/${deletingTracking._id}`, { method: "DELETE" }, token ?? undefined);
      setShowDeleteConfirm(false);
      setDeletingTracking(null);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const summary = useMemo(() => {
    const avgSpeed =
      tracking.length > 0
        ? Math.round(tracking.reduce((sum, t) => sum + (t.speed || 0), 0) / tracking.length)
        : 0;
    const delayed = tracking.filter((t) => t.status?.toLowerCase().includes("delay")).length;
    const onTimePercent =
      tracking.length > 0 ? Math.round(((tracking.length - delayed) / tracking.length) * 100) : 100;
    return { avgSpeed, delayed, onTimePercent };
  }, [tracking]);

  const selected = tracking.find((t) => t._id === selectedId) ?? tracking[0];
  const selectedRoute = selected
    ? routes.find((r) => r._id === selected.route?._id)
    : undefined;
  const routeCoords = selectedRoute?.pathCoordinates ?? [];

  const columns: Column<TrackingData & Record<string, unknown>>[] = [
    {
      key: "bus",
      label: "Bus",
      searchable: true,
      render: (item) => (item as unknown as TrackingData).bus?.busNumber || "N/A",
    },
    {
      key: "route",
      label: "Route",
      render: (item) => {
        const t = item as unknown as TrackingData;
        return `${t.route?.routeNo || ""} ${t.route?.from || ""} → ${t.route?.to || ""}`;
      },
    },
    {
      key: "speed",
      label: "Speed",
      render: (item) => `${(item as unknown as TrackingData).speed} km/h`,
    },
    { key: "nextStop", label: "Next Stop" },
    { key: "eta", label: "ETA" },
    {
      key: "status",
      label: "Status",
      render: (item) => {
        const t = item as unknown as TrackingData;
        const isDelayed = t.status?.toLowerCase().includes("delay");
        return <StatusBadge label={t.status || "Live"} tone={isDelayed ? "warning" : "success"} pulse />;
      },
    },
  ];

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Live Operations"
        title="Tracking"
        description="Watch your fleet move in real time and manage tracking sessions."
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Initialize Tracking
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={Radio} label="Active Trackings" value={tracking.length} tone="primary" />
        <StatsCard icon={Gauge} label="Average Speed" value={`${summary.avgSpeed} km/h`} tone="accent" />
        <StatsCard icon={TrendingUp} label="On-Time" value={`${summary.onTimePercent}%`} tone="info" />
        <StatsCard icon={AlertTriangle} label="Delayed" value={summary.delayed} tone="warning" />
      </div>

      {/* Live dashboard: selector + map */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TrackingSidebar
            tracking={tracking}
            selectedId={selected?._id ?? null}
            onSelect={setSelectedId}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar lg:col-span-2">
          <div className="h-[420px]">
            <MapView
              center={
                selected ? [selected.latitude, selected.longitude] : routeCoords[0]
              }
              routeCoordinates={routeCoords}
              routeLabel={
                selectedRoute ? `${selectedRoute.from} → ${selectedRoute.to}` : undefined
              }
              showBus={!!selected}
              busPosition={selected ? [selected.latitude, selected.longitude] : undefined}
              busName={selected?.bus?.busNumber || "Bus"}
              speed={selected?.speed}
              eta={selected?.eta}
              nextStop={selected?.nextStop}
              namedStops={selectedRoute?.stops}
              stopETAs={selected?.stopETAs}
            />
          </div>
          {tracking.length === 0 && (
            <div className="flex items-center justify-center p-6 text-sm text-sidebar-muted">
              No active tracking sessions. Initialize one to see it live here.
            </div>
          )}
        </div>
      </div>

      {/* Full list */}
      <DataTable
        data={tracking as unknown as (TrackingData & Record<string, unknown>)[]}
        columns={columns}
        onDelete={(item) => confirmDelete(item as unknown as TrackingData)}
        searchPlaceholder="Search by bus number..."
        emptyMessage="No tracking sessions yet."
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Initialize Tracking">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Bus</label>
            <select
              {...register("bus")}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Select a bus</option>
              {buses.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.busNumber}
                </option>
              ))}
            </select>
            {errors.bus && <p className="mt-1 text-xs text-danger">{errors.bus.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Route</label>
            <select
              {...register("route")}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Select a route</option>
              {routes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.routeNo} - {r.from} → {r.to}
                </option>
              ))}
            </select>
            {errors.route && <p className="mt-1 text-xs text-danger">{errors.route.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? "Initializing..." : "Initialize"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Tracking"
        message="Are you sure you want to delete this tracking entry? This action cannot be undone."
      />
    </div>
  );
}
