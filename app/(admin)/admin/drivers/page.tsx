"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, UserCheck, CheckCircle2, PauseCircle, Award, Bus as BusIcon, Eye, Mail, Phone, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { fetchApi, DriverData, DriversResponse, DriverResponse, BusData, BusesResponse } from "@/utils/api";
import DataTable, { Column } from "@/component/ui/DataTable";
import PageHeader from "@/component/ui/PageHeader";
import Modal from "@/component/ui/Modal";
import ConfirmDialog from "@/component/ui/ConfirmDialog";
import LoadingSpinner from "@/component/ui/LoadingSpinner";
import StatsCard from "@/component/ui/StatsCard";
import StatusBadge from "@/component/ui/StatusBadge";

const driverSchema = z.object({
  name: z.string().min(1, "Driver name is required"),
  age: z
    .number({ message: "Age must be a number" })
    .int()
    .min(19, "Age must be greater than 18"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  licenseNumber: z.string().min(1, "License number is required"),
  experienceYears: z
    .number({ message: "Experience must be a number" })
    .min(0, "Experience cannot be negative"),
  active: z.boolean(),
});

type DriverFormData = z.infer<typeof driverSchema>;

const statusFilters = ["All", "Active", "Inactive"] as const;

function statusTone(active: boolean) {
  return active ? ("success" as const) : ("neutral" as const);
}

function toCsv(rows: DriverData[]) {
  const header = [
    "Driver ID",
    "Name",
    "Age",
    "Phone",
    "Email",
    "License Number",
    "Experience (Years)",
    "Assigned Buses",
    "Status",
  ];
  const lines = rows.map((d) =>
    [
      d.driverId,
      d.name,
      d.age,
      d.phoneNumber,
      d.email,
      d.licenseNumber,
      d.experienceYears,
      (d.assignedBuses || []).map((b) => b.busNumber).join("; "),
      d.active ? "Active" : "Inactive",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

function downloadCsv(rows: DriverData[]) {
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "drivers.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function DriversPage() {
  const { token } = useAuth();
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverData | null>(null);

  // Detail view modal state
  const [viewingDriver, setViewingDriver] = useState<DriverData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Delete modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingDriver, setDeletingDriver] = useState<DriverData | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("All");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: { active: true, experienceYears: 0 },
  });

  const fetchDrivers = async () => {
    try {
      const res = await fetchApi<DriversResponse>("/drivers", {}, token ?? undefined);
      setDrivers(res.drivers || []);
    } catch (err) {
      console.error("Failed to fetch drivers:", err);
    }
  };

  const fetchBuses = async () => {
    try {
      const res = await fetchApi<BusesResponse>("/buses", {}, token ?? undefined);
      setBuses(res.buses || []);
    } catch (err) {
      console.error("Failed to fetch buses:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDrivers(), fetchBuses()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const openCreate = () => {
    setEditingDriver(null);
    setApiError(null);
    reset({
      name: "",
      age: 25,
      phoneNumber: "",
      email: "",
      licenseNumber: "",
      experienceYears: 1,
      active: true,
    });
    setShowModal(true);
  };

  const openEdit = (driver: DriverData) => {
    setEditingDriver(driver);
    setApiError(null);
    reset({
      name: driver.name,
      age: driver.age,
      phoneNumber: driver.phoneNumber,
      email: driver.email,
      licenseNumber: driver.licenseNumber,
      experienceYears: driver.experienceYears,
      active: driver.active,
    });
    setShowModal(true);
  };

  const openView = (driver: DriverData) => {
    setViewingDriver(driver);
    setShowDetailModal(true);
  };

  const onSubmit = async (data: DriverFormData) => {
    setSubmitting(true);
    setApiError(null);
    try {
      if (editingDriver) {
        await fetchApi<DriverResponse>(
          `/drivers/${editingDriver._id}`,
          { method: "PUT", body: JSON.stringify(data) },
          token ?? undefined
        );
      } else {
        await fetchApi<DriverResponse>(
          "/drivers",
          { method: "POST", body: JSON.stringify(data) },
          token ?? undefined
        );
      }
      setShowModal(false);
      reset();
      fetchDrivers();
    } catch (err: any) {
      setApiError(err?.message || "Failed to save driver information.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (driver: DriverData) => {
    setDeletingDriver(driver);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deletingDriver) return;
    try {
      await fetchApi(`/drivers/${deletingDriver._id}`, { method: "DELETE" }, token ?? undefined);
      setShowDeleteConfirm(false);
      setDeletingDriver(null);
      fetchDrivers();
    } catch (err) {
      console.error(err);
    }
  };

  const summary = useMemo(() => {
    const activeCount = drivers.filter((d) => d.active).length;
    const inactiveCount = drivers.filter((d) => !d.active).length;
    const avgExp =
      drivers.length > 0
        ? Math.round(
            (drivers.reduce((sum, d) => sum + (d.experienceYears || 0), 0) / drivers.length) * 10
          ) / 10
        : 0;
    return { total: drivers.length, activeCount, inactiveCount, avgExp };
  }, [drivers]);

  const filteredDrivers = useMemo(() => {
    if (statusFilter === "Active") return drivers.filter((d) => d.active);
    if (statusFilter === "Inactive") return drivers.filter((d) => !d.active);
    return drivers;
  }, [drivers, statusFilter]);

  const columns: Column<DriverData & Record<string, unknown>>[] = [
    {
      key: "driverId",
      label: "Driver ID",
      searchable: true,
      render: (item) => {
        const d = item as unknown as DriverData;
        return (
          <span className="font-mono text-xs font-semibold text-primary">
            {d.driverId}
          </span>
        );
      },
    },
    {
      key: "name",
      label: "Driver Name",
      searchable: true,
      render: (item) => {
        const d = item as unknown as DriverData;
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 font-bold text-accent">
              {d.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground">{d.name}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "age",
      label: "Age",
      render: (item) => `${(item as unknown as DriverData).age} yrs`,
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
      searchable: true,
      render: (item) => (item as unknown as DriverData).phoneNumber,
    },
    {
      key: "email",
      label: "Email",
      searchable: true,
      render: (item) => (item as unknown as DriverData).email,
    },
    {
      key: "licenseNumber",
      label: "License Number",
      searchable: true,
      render: (item) => (
        <span className="font-mono text-xs text-muted-foreground">
          {(item as unknown as DriverData).licenseNumber}
        </span>
      ),
    },
    {
      key: "experienceYears",
      label: "Experience",
      render: (item) => `${(item as unknown as DriverData).experienceYears} yrs`,
    },
    {
      key: "assignedBuses",
      label: "Assigned Buses",
      render: (item) => {
        const d = item as unknown as DriverData;
        const assigned = d.assignedBuses || [];
        if (assigned.length === 0) {
          return <span className="text-xs text-muted-foreground">No buses</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {assigned.map((bus) => (
              <span
                key={bus._id}
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
              >
                <BusIcon className="h-3 w-3" />
                {bus.busNumber}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "active",
      label: "Status",
      render: (item) => {
        const d = item as unknown as DriverData;
        return (
          <StatusBadge
            label={d.active ? "Active" : "Inactive"}
            tone={statusTone(d.active)}
            pulse={d.active}
          />
        );
      },
    },
  ];

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fleet Personnel"
        title="Driver Management"
        description="Manage system drivers, license details, assigned buses and active statuses."
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Add Driver
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={UserCheck} label="Total Drivers" value={summary.total} tone="primary" />
        <StatsCard icon={CheckCircle2} label="Active Drivers" value={summary.activeCount} tone="accent" />
        <StatsCard icon={PauseCircle} label="Inactive Drivers" value={summary.inactiveCount} tone="neutral" />
        <StatsCard
          icon={Award}
          label="Avg Experience"
          value={`${summary.avgExp} yrs`}
          tone="warning"
        />
      </div>

      <DataTable
        data={filteredDrivers as unknown as (DriverData & Record<string, unknown>)[]}
        columns={columns}
        onView={(item) => openView(item as unknown as DriverData)}
        onEdit={(item) => openEdit(item as unknown as DriverData)}
        onDelete={(item) => confirmDelete(item as unknown as DriverData)}
        onExport={(rows) => downloadCsv(rows as unknown as DriverData[])}
        searchPlaceholder="Search by ID, name, email, or license..."
        emptyMessage="No drivers found."
        filters={
          <div className="flex flex-wrap gap-1.5">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        }
      />

      {/* Add / Edit Driver Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingDriver ? "Edit Driver" : "Add New Driver"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {apiError && (
            <div className="rounded-lg bg-danger/10 p-3 text-xs font-semibold text-danger">
              {apiError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground">Driver Name *</label>
            <input
              {...register("name")}
              placeholder="e.g. Ram Bahadur"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground">Age *</label>
              <input
                type="number"
                {...register("age", { valueAsNumber: true })}
                placeholder="Must be > 18"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              {errors.age && <p className="mt-1 text-xs text-danger">{errors.age.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Experience (Years) *</label>
              <input
                type="number"
                {...register("experienceYears", { valueAsNumber: true })}
                placeholder="e.g. 5"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              {errors.experienceYears && (
                <p className="mt-1 text-xs text-danger">{errors.experienceYears.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Phone Number *</label>
            <input
              {...register("phoneNumber")}
              placeholder="e.g. +977 9801234567"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-danger">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Email Address *</label>
            <input
              type="email"
              {...register("email")}
              placeholder="e.g. driver@smartbus.com"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">License Number *</label>
            <input
              {...register("licenseNumber")}
              placeholder="e.g. DL-04-1234567"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            {errors.licenseNumber && (
              <p className="mt-1 text-xs text-danger">{errors.licenseNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Status</label>
            <select
              {...register("active", {
                setValueAs: (v) => v === "true" || v === true,
              })}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
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
              {submitting ? "Saving..." : editingDriver ? "Update Driver" : "Add Driver"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Driver Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Driver Profile & Information"
      >
        {viewingDriver && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-xl bg-muted/40 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20 text-xl font-bold text-accent">
                {viewingDriver.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">{viewingDriver.name}</h3>
                  <StatusBadge
                    label={viewingDriver.active ? "Active" : "Inactive"}
                    tone={statusTone(viewingDriver.active)}
                  />
                </div>
                <p className="font-mono text-xs font-semibold text-primary">
                  ID: {viewingDriver.driverId}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border/80 p-3">
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="font-semibold text-foreground">{viewingDriver.age} years</p>
              </div>
              <div className="rounded-lg border border-border/80 p-3">
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="font-semibold text-foreground">{viewingDriver.experienceYears} years</p>
              </div>
              <div className="col-span-2 rounded-lg border border-border/80 p-3">
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="font-semibold text-foreground">{viewingDriver.phoneNumber}</p>
              </div>
              <div className="col-span-2 rounded-lg border border-border/80 p-3">
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="font-semibold text-foreground">{viewingDriver.email}</p>
              </div>
              <div className="col-span-2 rounded-lg border border-border/80 p-3">
                <p className="text-xs text-muted-foreground">License Number</p>
                <p className="font-mono font-semibold text-foreground">{viewingDriver.licenseNumber}</p>
              </div>
            </div>

            {/* Assigned Buses Section */}
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Assigned Buses ({viewingDriver.assignedBuses?.length || 0})
              </h4>
              {viewingDriver.assignedBuses && viewingDriver.assignedBuses.length > 0 ? (
                <div className="grid gap-2">
                  {viewingDriver.assignedBuses.map((b) => (
                    <div
                      key={b._id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <BusIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{b.busNumber}</p>
                          <p className="text-xs text-muted-foreground">{b.modelName || "Standard Bus"}</p>
                        </div>
                      </div>
                      <StatusBadge
                        label={b.status}
                        tone={b.status === "Active" ? "success" : "neutral"}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  No buses assigned
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Driver"
        message={`Are you sure you want to delete driver "${deletingDriver?.name}" (${deletingDriver?.driverId})? This action cannot be undone.`}
      />
    </div>
  );
}
