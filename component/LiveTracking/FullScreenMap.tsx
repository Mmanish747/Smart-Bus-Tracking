"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { X, Search } from "lucide-react";
import { useLiveTracking } from "@/hooks/useLiveTracking";
import { RouteData } from "@/utils/api";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse" />,
});

type FullScreenMapProps = {
  onClose: () => void;
  initialRouteIndex?: number;
};

const FullScreenMap = ({ onClose, initialRouteIndex = 0 }: FullScreenMapProps) => {
  const { routes, trackingByRouteId } = useLiveTracking();
  const [selectedIndex, setSelectedIndex] = useState(initialRouteIndex);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSelectedIndex(initialRouteIndex);
  }, [initialRouteIndex]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

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

  const filteredRoutes = routes.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.routeNo.toLowerCase().includes(q) ||
      r.from.toLowerCase().includes(q) ||
      r.to.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-[1000] flex bg-white">
      <div className="flex h-full w-[360px] flex-col border-r border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold">Live Bus Tracking</h2>
            <p className="text-xs text-gray-500">Select a route to view on map</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Close map"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search route or stop..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-4 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            All Routes
          </h4>
          <div className="space-y-2">
            {filteredRoutes.map((route) => {
              const originalIndex = routes.indexOf(route);
              const isActive = originalIndex === selectedIndex;
              const t = trackingByRouteId.get(route._id);

              return (
                <div
                  key={route._id}
                  onClick={() => setSelectedIndex(originalIndex)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl p-3.5 transition-all ${
                    isActive
                      ? "border-2 border-primary bg-green-50"
                      : "border border-gray-100 hover:border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${route.color}`}
                    >
                      {route.routeNo}
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold">
                        {route.from} → {route.to}
                      </h5>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Every {route.frequency}
                      </p>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="rounded border border-primary/20 bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                      {t?.status || "Live"}
                    </span>
                  ) : t ? (
                    <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                      {t.status || "Live"}
                    </span>
                  ) : null}
                </div>
              );
            })}
            {filteredRoutes.length === 0 && (
              <p className="text-center text-sm text-gray-400">No routes found.</p>
            )}
          </div>
        </div>

        {activeTracking && (
          <div className="border-t border-gray-100 px-5 py-4">
            <div className="rounded-xl bg-green-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">
                  {activeTracking.bus?.busNumber || "Bus"}
                </h3>
                <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  LIVE
                </span>
              </div>
              <p className="mb-3 text-xs text-gray-500">
                {activeRoute?.from} → {activeRoute?.to}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Next Stop</span>
                  <span className="font-medium">{activeTracking.nextStop || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-primary">{activeTracking.eta || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Speed</span>
                  <span className="font-medium">{activeTracking.speed || 0} km/h</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative flex-1">
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
          fullScreen
        />
      </div>
    </div>
  );
};

export default FullScreenMap;
