"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Bus as BusIcon, CheckCircle2, Wrench, PauseCircle, UserCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { fetchApi, BusData, BusResponse, BusesResponse, DriverData, DriversResponse, RouteData } from "@/utils/api";
import DataTable, { Column } from "@/component/ui/DataTable";
import PageHeader from "@/component/ui/PageHeader";
import Modal from "@/component/ui/Modal";
import ConfirmDialog from "@/component/ui/ConfirmDialog";
import LoadingSpinner from "@/component/ui/LoadingSpinner";
import StatsCard from "@/component/ui/StatsCard";
import StatusBadge from "@/component/ui/StatusBadge";

const busSchema = z.object({
  busNumber: z.string().min(1, "Bus number is required"),
  modelName: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  status: z.enum(["Active", "Maintenance", "Inactive"]),
  assignedDrivers: z.array(z.string()).default([]),
  routeAssigned: z.boolean().default(false),
  assignedRoute: z.string().nullable().optional(),
});

type BusFormData = z.input<typeof busSchema>;

const statusFilters = ["All", "Active", "Maintenance", "Inactive"] as const;

function statusTone(status: string) {
  if (status === "Active" || status === "active") return "success" as const;
  if (status === "Maintenance" || status === "maintenance") return "warning" as const;
  return "neutral" as const;
}

export default function BusesPage() {
  const { token } = useAuth();
  const [buses, setBuses] = useState<BusData[]>([]);
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState<BusData | null>(null);
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);

  const [viewingBus, setViewingBus] = useState<BusData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingBus, setDeletingBus] = useState<BusData | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("All");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BusFormData>({
    resolver: zodResolver(busSchema),
    defaultValues: { status: "Active", assignedDrivers: [], routeAssigned: false, assignedRoute: null },
  });
  
  const isRouteAssigned = watch("routeAssigned");

  const fetchData = async () => {
    try {
      const [busRes, drvRes, routeRes] = await Promise.all([
        fetchApi<BusesResponse>("/buses", {}, token ?? undefined),
        fetchApi<DriversResponse>("/drivers", {}, token ?? undefined),
        fetchApi<{ routes: RouteData[] }>("/routes", {}, token ?? undefined)
      ]);
      setBuses(busRes.buses || []);
      setDrivers(drvRes.drivers || []);
      setRoutes(routeRes.routes || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [token]);

  const openCreate = () => {
    setEditingBus(null);
    setSelectedDriverIds([]);
    reset({ busNumber: "", modelName: "", capacity: undefined, status: "Active", assignedDrivers: [], routeAssigned: false, assignedRoute: "" });
    setShowModal(true);
  };

  const openEdit = (bus: BusData) => {
    setEditingBus(bus);
    const existingDriverIds = (bus.assignedDrivers || []).map((d) => d._id);
    setSelectedDriverIds(existingDriverIds);
    reset({
      busNumber: bus.busNumber,
      modelName: bus.modelName ?? "",
      capacity: bus.capacity,
      status: (bus.status === "active" ? "Active" : bus.status === "inactive" ? "Inactive" : bus.status === "maintenance" ? "Maintenance" : bus.status) as any,
      assignedDrivers: existingDriverIds,
      routeAssigned: bus.routeAssigned || !!bus.assignedRoute,
      assignedRoute: bus.assignedRoute ? (typeof bus.assignedRoute === 'string' ? bus.assignedRoute : (bus.assignedRoute as any)._id) : "",
    });
    setShowModal(true);
  };

  const openView = (bus: BusData) => {
    setViewingBus(bus);
    setShowDetailModal(true);
  };

  const toggleDriverSelection = (driverId: string) => {
    const next = selectedDriverIds.includes(driverId)
      ? selectedDriverIds.filter((id) => id !== driverId)
      : [...selectedDriverIds, driverId];
    setSelectedDriverIds(next);
    setValue("assignedDrivers", next);
  };

  const onSubmit = async (data: BusFormData) => {
    setSubmitting(true);
    
    // Format payload cleanly for assignment
    const payload = {
      ...data,
      assignedDrivers: selectedDriverIds,
      assignedRoute: data.routeAssigned ? data.assignedRoute : null
    };

    try {
      if (editingBus) {
        await fetchApi<BusResponse>(
          `/buses/${editingBus._id}`,
          { method: "PUT", body: JSON.stringify(payload) },
          token ?? undefined
        );
      } else {
        await fetchApi<BusResponse>(
          "/buses",
          { method: "POST", body: JSON.stringify(payload) },
          token ?? undefined
        );
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (bus: BusData) => {
    setDeletingBus(bus);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deletingBus) return;
    try {
      await fetchApi(`/buses/${deletingBus._id}`, { method: "DELETE" }, token ?? undefined);
      setShowDeleteConfirm(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const summary = useMemo(() => {
    const active = buses.filter((b) => b.status === "Active" || b.status === "active").length;
    const maintenance = buses.filter((b) => b.status === "Maintenance" || b.status === "maintenance").length;
    const inactive = buses.filter((b) => b.status === "Inactive" || b.status === "inactive").length;
    return { active, maintenance, inactive, avgCapacity: 0 };
  }, [buses]);

  const filteredBuses = useMemo(
    () => statusFilter === "All" ? buses : buses.filter((b) => b.status.toLowerCase() === statusFilter.toLowerCase()),
    [buses, statusFilter]
  );
  
  const availableRoutes = routes.filter((r) => {
    if (!r.assignedBuses?.length) return true;
    if (!editingBus) return false;
    const currentRouteId = typeof editingBus.assignedRoute === "string" ? editingBus.assignedRoute : (editingBus.assignedRoute as any)?._id;
    return r._id === currentRouteId;
  });

  const columns: Column<any>[] = [
    {
      key: "busNumber",
      label: "Bus Number",
      searchable: true,
      render: (item: any) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BusIcon className="h-4 w-4" />
          </div>
          <span className="font-semibold text-foreground">{item.busNumber}</span>
        </div>
      ),
    },
    {
      key: "modelName",
      label: "Model",
      render: (item: any) => item.modelName ?? "—",
    },
    {
      key: "assignedRoute",
      label: "Route",
      render: (item: any) => {
        const route = item.assignedRoute;

        if (!route) {
          return (
            <span className="text-xs text-muted-foreground">
              Unassigned
            </span>
          );
        }

        return (
          <span className="font-semibold text-primary">
            {route.routeNo} ({route.from} → {route.to})
          </span>
        );
      },
    },
    {
      key: "assignedDrivers",
      label: "Drivers",
      render: (item: any) => {
        if (!item.assignedDrivers?.length) {
          return (
            <span className="text-xs text-muted-foreground">
              Unassigned
            </span>
          );
        }

        return (
          <div className="flex flex-col">
            {item.assignedDrivers.map((driver: any) => (
              <span key={driver._id}>
                {driver.name}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (item: any) => {
        const normalized = item.status === "active" ? "Active" : item.status === "inactive" ? "Inactive" : item.status === "maintenance" ? "Maintenance" : item.status;
        return <StatusBadge label={normalized} tone={statusTone(normalized)} pulse={normalized === "Active"} />;
      },
    },
  ];

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fleet Management"
        title="Buses"
        description="Manage every vehicle in your fleet and assign them to specific routes."
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Add Bus
          </button>
        }
      />

      <DataTable
        data={filteredBuses}
        columns={columns}
        onView={openView}
        onEdit={openEdit}
        onDelete={confirmDelete}
        searchPlaceholder="Search by bus number..."
        emptyMessage="No buses match this filter yet."
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingBus ? "Edit Bus" : "Add Bus"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Bus Number *</label>
            <input
              {...register("busNumber")}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Model</label>
              <input
                {...register("modelName")}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Capacity (Seats)</label>
              <input
                type="number"
                {...register("capacity", { valueAsNumber: true })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Status</label>
            <select
              {...register("status")}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          
          <div className="p-3 border rounded-lg bg-muted/10 space-y-3">
             <label className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer">
                <input type="checkbox" {...register("routeAssigned")} className="h-4 w-4 text-primary rounded" />
                Assign Route
             </label>
             {isRouteAssigned && (
                 <div>
                    <select {...register("assignedRoute")} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none">
                        <option value="">Select an available route...</option>
                        {availableRoutes.map(route => (
                            <option key={route._id} value={route._id}>{route.from} - {route.to}</option>
                        ))}
                    </select>
                 </div>
             )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Assigned Drivers</label>
            <div className="max-h-40 overflow-y-auto rounded-lg border p-2 space-y-1.5 bg-muted/20">
              {drivers.map((driver) => {
                const isChecked = selectedDriverIds.includes(driver._id);
                return (
                  <label key={driver._id} className="flex items-center gap-2 p-2 cursor-pointer">
                    <input type="checkbox" checked={isChecked} onChange={() => toggleDriverSelection(driver._id)} />
                    <span className="text-sm">{driver.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">{submitting ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Bus Overview">
          <div className="p-4"><h3>{viewingBus?.busNumber}</h3></div>
      </Modal>

      <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} title="Delete Bus" message="Are you sure?" />
    </div>
  );
}
