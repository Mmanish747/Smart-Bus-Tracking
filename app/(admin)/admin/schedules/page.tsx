"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Calendar, CheckCircle2, Route as RouteIcon, Bus as BusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DataTable, { Column } from "@/component/ui/DataTable";
import Modal from "@/component/ui/Modal";
import ConfirmDialog from "@/component/ui/ConfirmDialog";
import PageHeader from "@/component/ui/PageHeader";
import StatsCard from "@/component/ui/StatsCard";
import StatusBadge from "@/component/ui/StatusBadge";
import ScheduleTimeline from "@/component/admin/ScheduleTimeline";
import { useAuth } from "@/context/AuthContext";
import {
  fetchApi,
  SchedulesResponse,
  ScheduleData,
  BusesResponse,
  BusData,
  RoutesResponse,
  RouteData,
} from "@/utils/api";

const scheduleSchema = z.object({
  route: z.string().min(1, "Route is required"),
  bus: z.string().min(1, "Bus is required"),
  firstBus: z.string().min(1, "First bus time is required"),
  lastBus: z.string().min(1, "Last bus time is required"),
  frequency: z.string().min(1, "Frequency is required"),
  active: z.boolean(),
});

type ScheduleForm = z.infer<typeof scheduleSchema>;

export default function SchedulesPage() {
  const { token } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [buses, setBuses] = useState<BusData[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ScheduleData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState<ScheduleData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { active: false },
  });

  const fetchData = async () => {
    try {
      const [schedulesRes, busesRes, routesRes] = await Promise.all([
        fetchApi<SchedulesResponse>("/schedules", {}, token),
        fetchApi<BusesResponse>("/buses", {}, token),
        fetchApi<RoutesResponse>("/routes", {}, token),
      ]);
      if (schedulesRes.success) setSchedules(schedulesRes.schedules);
      if (busesRes.success) setBuses(busesRes.buses);
      if (routesRes.success) setRoutes(routesRes.routes);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const openCreate = () => {
    setEditing(null);
    reset({ route: "", bus: "", firstBus: "", lastBus: "", frequency: "", active: false });
    setShowModal(true);
  };

  const openEdit = (schedule: ScheduleData) => {
    setEditing(schedule);
    reset({
      route: schedule.route?._id || "",
      bus: schedule.bus?._id || "",
      firstBus: schedule.firstBus,
      lastBus: schedule.lastBus,
      frequency: schedule.frequency,
      active: schedule.active,
    });
    setShowModal(true);
  };

  const onSubmit = async (data: ScheduleForm) => {
    setSubmitting(true);
    try {
      if (editing) {
        await fetchApi(`/schedules/${editing._id}`, { method: "PUT", body: JSON.stringify(data) }, token);
      } else {
        await fetchApi("/schedules", { method: "POST", body: JSON.stringify(data) }, token);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Failed to save schedule:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await fetchApi(`/schedules/${deleting._id}`, { method: "DELETE" }, token);
      setShowDeleteConfirm(false);
      setDeleting(null);
      fetchData();
    } catch (err) {
      console.error("Failed to delete schedule:", err);
    }
  };

  const summary = useMemo(() => {
    const active = schedules.filter((s) => s.active).length;
    const routesCovered = new Set(schedules.map((s) => s.route?._id).filter(Boolean)).size;
    const busesAssigned = new Set(schedules.map((s) => s.bus?._id).filter(Boolean)).size;
    return { active, routesCovered, busesAssigned };
  }, [schedules]);

  const columns: Column<ScheduleData & Record<string, unknown>>[] = [
    {
      key: "route",
      label: "Route",
      searchable: true,
      render: (item) => {
        const s = item as unknown as ScheduleData;
        return (
          <span className="font-semibold text-foreground">
            {s.route?.routeNo} {s.route?.from} → {s.route?.to}
          </span>
        );
      },
    },
    {
      key: "bus",
      label: "Bus",
      render: (item) => (item as unknown as ScheduleData).bus?.busNumber || "N/A",
    },
    { key: "firstBus", label: "First Bus" },
    { key: "lastBus", label: "Last Bus" },
    { key: "frequency", label: "Frequency" },
    {
      key: "status",
      label: "Status",
      render: (item) => {
        const s = item as unknown as ScheduleData;
        return <StatusBadge label={s.status} tone={s.status === "On Time" ? "success" : "warning"} />;
      },
    },
    {
      key: "active",
      label: "Active",
      render: (item) => {
        const s = item as unknown as ScheduleData;
        return s.active ? (
          <CheckCircle2 size={16} className="text-primary" />
        ) : (
          <span className="text-xs text-muted-foreground">Inactive</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Timetables"
        title="Schedule Management"
        description="Manage bus schedules, service windows and frequency."
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            <Plus size={16} />
            Add Schedule
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={Calendar} label="Total Schedules" value={schedules.length} tone="primary" />
        <StatsCard icon={CheckCircle2} label="Active" value={summary.active} tone="accent" />
        <StatsCard icon={RouteIcon} label="Routes Covered" value={summary.routesCovered} tone="info" />
        <StatsCard icon={BusIcon} label="Buses Assigned" value={summary.busesAssigned} tone="neutral" />
      </div>

      <ScheduleTimeline schedules={schedules} />

      <DataTable
        data={schedules as unknown as (ScheduleData & Record<string, unknown>)[]}
        columns={columns}
        onEdit={(item) => openEdit(item as unknown as ScheduleData)}
        onDelete={(item) => {
          setDeleting(item as unknown as ScheduleData);
          setShowDeleteConfirm(true);
        }}
        loading={loading}
        emptyMessage="No schedules found"
        searchPlaceholder="Search by route..."
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Schedule" : "Add Schedule"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Route</label>
            <select
              {...register("route")}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Select route</option>
              {routes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.routeNo} - {r.from} → {r.to}
                </option>
              ))}
            </select>
            {errors.route && <p className="mt-1 text-xs text-danger">{errors.route.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Bus</label>
            <select
              {...register("bus")}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Select bus</option>
              {buses.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.busNumber}
                </option>
              ))}
            </select>
            {errors.bus && <p className="mt-1 text-xs text-danger">{errors.bus.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">First Bus</label>
              <input
                {...register("firstBus")}
                placeholder="e.g. 6:00 AM"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              {errors.firstBus && <p className="mt-1 text-xs text-danger">{errors.firstBus.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Last Bus</label>
              <input
                {...register("lastBus")}
                placeholder="e.g. 10:00 PM"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              {errors.lastBus && <p className="mt-1 text-xs text-danger">{errors.lastBus.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Frequency</label>
            <input
              {...register("frequency")}
              placeholder="e.g. Every 15 min"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            {errors.frequency && <p className="mt-1 text-xs text-danger">{errors.frequency.message}</p>}
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("active")}
              className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
            />
            <span className="text-sm text-foreground">Active</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Schedule"
        message="Are you sure you want to delete this schedule? This action cannot be undone."
      />
    </div>
  );
}
