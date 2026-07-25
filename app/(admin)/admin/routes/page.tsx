"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Route as RouteIcon, Milestone, Gauge, MapPin } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { fetchApi, RouteData, RouteResponse, NamedStop, RouteStop, BusData, BusesResponse } from "@/utils/api";
import PageHeader from "@/component/ui/PageHeader";
import Modal from "@/component/ui/Modal";
import ConfirmDialog from "@/component/ui/ConfirmDialog";
import LoadingSpinner from "@/component/ui/LoadingSpinner";
import StatsCard from "@/component/ui/StatsCard";
import RouteMapPicker from "@/component/admin/RouteMapPicker";
import RouteCards from "@/component/admin/RouteCards";

const routeSchema = z.object({
  routeNo: z.string().min(1, "Route number is required"),
  from: z.string().min(1, "From is required"),
  to: z.string().min(1, "To is required"),
  via: z.string().optional(),
  frequency: z.string().min(1, "Frequency is required"),
  status: z.string(),
  active: z.boolean(),
  assignedBuses: z.array(z.string()).default([]),
});

type RouteFormData = z.input<typeof routeSchema>;

export default function RoutesPage() {
  const { token } = useAuth();
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteData | null>(null);
  const [namedStops, setNamedStops] = useState<NamedStop[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [viewingRoute, setViewingRoute] = useState<RouteData | null>(null);
  const [deletingRoute, setDeletingRoute] = useState<RouteData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, watch, control } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: { active: true, assignedBuses: [] },
  });

  const assignedBuses = watch("assignedBuses");

  const fetchData = async () => {
    try {
      const [rRes, bRes] = await Promise.all([
         fetchApi<{ routes: RouteData[] }>("/routes", {}, token ?? undefined),
         fetchApi<BusesResponse>("/buses", {}, token ?? undefined)
      ]);
      setRoutes(rRes.routes);
      setBuses(bRes.buses || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [token]);

  const openCreate = () => {
    setEditingRoute(null);
    setNamedStops([]);
    reset({ routeNo: "", from: "", to: "", frequency: "", status: "On Time", active: true, assignedBuses: [] });
    setShowModal(true);
  };

  const openEdit = (route: RouteData) => {
    setEditingRoute(route);
    setNamedStops([]); // Wait for map interaction
    reset({
      routeNo: route.routeNo,
      from: route.from,
      to: route.to,
      via: route.via ?? "",
      frequency: route.frequency,
      status: route.status ?? "On Time",
      active: route.active,
      assignedBuses: (route.assignedBuses || (route.assignedBus ? [route.assignedBus] : [])).map((b) =>
        typeof b === "string" ? b : (b as any)._id
      ),
    });
    setShowModal(true);
  };

  const openView = (route: RouteData) => {
  setViewingRoute(route);
};

const confirmDelete = (route: RouteData) => {
  setDeletingRoute(route);
};

const deleteRoute = async () => {
  if (!deletingRoute) return;

  setDeleting(true);

    try {
      await fetchApi(
        `/routes/${deletingRoute._id}`,
        {
          method: "DELETE",
        },
        token ?? undefined
      );

      setDeletingRoute(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete route");
    } finally {
      setDeleting(false);
    }
  };

  const onSubmit = async (data: RouteFormData) => {
    if (namedStops.length < 2 && !editingRoute) {
      alert("Please add at least 2 named stops on the map.");
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        ...data,
        assignedBuses: data.assignedBuses || [],
      };

      if (namedStops.length >= 2) {
          payload.pathCoordinates = namedStops.map((s) => [s.lat, s.lng]);
          payload.stops = namedStops.map((s, i) => ({ name: s.name, lat: s.lat, lng: s.lng, type: i === 0 ? "start" : i === namedStops.length - 1 ? "end" : "stop" }));
          payload.namedStops = payload.stops;
      }

      if (editingRoute) {
        await fetchApi(`/routes/${editingRoute._id}`, { method: "PUT", body: JSON.stringify(payload) }, token ?? undefined);
      } else {
        await fetchApi("/routes", { method: "POST", body: JSON.stringify(payload) }, token ?? undefined);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };
  
  const availableBuses = buses.filter((b) => {
    if (!b.routeAssigned) return true;
    if (!editingRoute) return false;
    const currentRouteBusIds = (editingRoute.assignedBuses || (editingRoute.assignedBus ? [editingRoute.assignedBus] : [])).map((bus) =>
      typeof bus === "string" ? bus : (bus as any)._id
    );
    return currentRouteBusIds.includes(b._id);
  });

  const activeBusCount = (routeId: string) => {
    const route = routes.find((r) => r._id === routeId);
    const assigned = (route?.assignedBuses || (route?.assignedBus ? [route.assignedBus] : [])) as any[];
    return assigned.filter((bus) => bus && (typeof bus === "string" ? true : true)).length;
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Route Network"
        title="Routes"
        action={
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> Add Route
          </button>
        }
      />

      <RouteCards routes={routes} activeBusCount={activeBusCount} onView={openView} onEdit={openEdit} onDelete={confirmDelete} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingRoute ? "Edit Route" : "Add Route"} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="block text-sm">Route No</label><input {...register("routeNo")} className="mt-1 w-full rounded-lg border p-2" /></div>
            <div><label className="block text-sm">Frequency</label><input {...register("frequency")} className="mt-1 w-full rounded-lg border p-2" /></div>
            <div><label className="block text-sm">From</label><input {...register("from")} className="mt-1 w-full rounded-lg border p-2" /></div>
            <div><label className="block text-sm">To</label><input {...register("to")} className="mt-1 w-full rounded-lg border p-2" /></div>
          </div>
          
          <div className="p-3 border rounded-lg bg-muted/10 space-y-3">
            <label className="block text-sm font-semibold">Assign buses</label>
            <select
              {...register("assignedBuses")}
              multiple
              className="h-32 w-full rounded-lg border p-2 text-sm"
            >
              {availableBuses.map((bus) => (
                <option key={bus._id} value={bus._id}>
                  {bus.busNumber} ({bus.capacity ?? "—"} seats)
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Select one or more buses that will operate on this route.</p>
          </div>

          <div>
             <RouteMapPicker value={namedStops} onChange={setNamedStops} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">{submitting ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!viewingRoute}
        onClose={() => setViewingRoute(null)}
        title={
          viewingRoute
            ? `${viewingRoute.from} → ${viewingRoute.to}`
            : "Route"
        }
        size="lg"
      >
        {viewingRoute && (
          <div className="space-y-4">

            <div className="rounded-xl overflow-hidden border">
              <RouteMapPicker
                value={
                  viewingRoute.stops
                    ?.filter((stop): stop is RouteStop & NamedStop => typeof stop.lat === "number" && typeof stop.lng === "number")
                    .map((stop) => ({
                      name: stop.name,
                      lat: stop.lat as number,
                      lng: stop.lng as number,
                    })) || []
                }
                onChange={() => {}}
                readOnly
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">

              <div>
                <span className="font-semibold">Route No:</span>
                <p>{viewingRoute.routeNo}</p>
              </div>

              <div>
                <span className="font-semibold">Status:</span>
                <p>{viewingRoute.status}</p>
              </div>

              <div>
                <span className="font-semibold">Frequency:</span>
                <p>{viewingRoute.frequency}</p>
              </div>

              <div>
                <span className="font-semibold">Stops:</span>
                <p>{viewingRoute.stops?.length || 0}</p>
              </div>

            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog
        isOpen={!!deletingRoute}
        onClose={() => setDeletingRoute(null)}
        onConfirm={deleteRoute}
        title="Delete Route"
        message={
          deletingRoute
            ? `Are you sure you want to delete Route ${deletingRoute.routeNo}?`
            : ""
        }
      />
    </div>
  );
}
