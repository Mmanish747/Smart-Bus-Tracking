"use client";

import { Milestone, MapPinned, Pencil, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { RouteData } from "@/utils/api";
import RouteMiniMap from "./RouteMiniMap";
import StatusBadge from "@/component/ui/StatusBadge";

import { haversineKm, routeDistanceKm } from "@/utils/haversine";

function statusTone(status: string) {
  const s = status?.toLowerCase() || "";
  if (s.includes("delay")) return "warning" as const;
  if (s.includes("stop") || s.includes("inactive")) return "danger" as const;
  return "success" as const;
}

interface RouteCardsProps {
  routes: RouteData[];
  activeBusCount: (routeId: string) => number;
  onView: (route: RouteData) => void;
  onEdit: (route: RouteData) => void;
  onDelete: (route: RouteData) => void;
}

export default function RouteCards({
  routes,
  activeBusCount,
  onView,
  onEdit,
  onDelete,
}: RouteCardsProps) {
  if (routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-16 text-center">
        <Milestone className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No routes match this search yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {routes.map((route) => {
        const distance = routeDistanceKm(route.pathCoordinates);
        const buses = activeBusCount(route._id);

        return (
          <div
            key={route._id}
            className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative p-3 pb-0">
              <RouteMiniMap coordinates={route.pathCoordinates} active={route.active} />
              <div className="absolute left-5 top-5 rounded-lg bg-black/40 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
                #{route.routeNo}
              </div>
              <div className="absolute right-5 top-5">
                <StatusBadge label={route.status || "Unknown"} tone={statusTone(route.status)} pulse={route.active} />
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-base font-bold text-foreground">
                {route.from} <span className="text-muted-foreground">→</span> {route.to}
              </h3>
              {route.via && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">via {route.via}</p>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-muted p-2">
                  <p className="text-sm font-bold text-foreground">
                    {distance > 0 ? `${distance.toFixed(1)}` : "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">km</p>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <p className="text-sm font-bold text-foreground">{buses}</p>
                  <p className="text-[10px] text-muted-foreground">active buses</p>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <p className="text-sm font-bold text-foreground">{route.stops?.length ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground">stops</p>
                </div>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Every {route.frequency} • {route.active ? "Active" : "Suspended"}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => onView(route)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:brightness-110"
                >
                  <MapPinned className="h-3.5 w-3.5" />
                  View Map
                </button>

                <button
                  onClick={() => onEdit(route)}
                  className="inline-flex items-center justify-center rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-primary"
                  title="Edit route"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    toast.info(`Route optimization for ${route.routeNo} is coming soon`)
                  }
                  className="inline-flex items-center justify-center rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-accent-foreground dark:hover:text-accent"
                  title="Optimize route"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(route)}
                  className="inline-flex items-center justify-center rounded-lg border border-border p-2 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                  title="Delete route"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
