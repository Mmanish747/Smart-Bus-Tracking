"use client";

import { useEffect, useState } from "react";
import BusSearchHeader from "@/component/head/BusSearchHeader";
import dynamic from "next/dynamic";

const MapView = dynamic(
  () => import("@/component/LiveTracking/MapView"),
  { ssr: false }
);

import RouteSidebar from "@/component/LiveTracking/RouteSidebar";
import Stats from "@/component/stats/Stats";
import TrackLayout from "@/component/track-layout/TrackLayout";
import { fetchApi, RoutesResponse, RouteData } from "@/utils/api";

export default function Page() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedRouteFilter, setSelectedRouteFilter] = useState("All Routes");

  useEffect(() => {
    fetchApi<RoutesResponse>("/routes")
      .then((data) => {
        if (data.success && data.routes) {
          setRoutes(data.routes);
        }
      })
      .catch((err) => {
        console.error("Failed to load routes:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const activeRoute = routes[selectedIndex];
  const activeRouteCoords = activeRoute?.pathCoordinates || [];

  const mapCenter =
    activeRouteCoords.length > 0
      ? activeRouteCoords[0]
      : undefined;

  const sidebarRoutes = routes.map((r, idx) => ({
    number: r.routeNo,
    route: `${r.from} → ${r.to}`,
    frequency: `Every ${r.frequency}`,
    status: r.status,
    color: r.color || "bg-primary text-white",
    active: idx === selectedIndex,
  }));
    const handleRouteFilter = (route: string) => {
    setSelectedRouteFilter(route);
    if (route !== "All Routes") {
      const idx = routes.findIndex(
        (r) => r.routeNo === route || `${r.from} → ${r.to}` === route
      );
      if (idx >= 0) setSelectedIndex(idx);
    }
  };

  return (
    <TrackLayout>
      <BusSearchHeader
  searchTitle="Search Routes"
  searchPlaceholder="Enter route number or route name"
  tileFirst="Select Route"
  firstOption="All Routes"
  titleSecond="Sort by"
  secondOption="Route Number"
  routes={routes}
  onRouteFilter={handleRouteFilter}
/>

      <div className="flex flex-col gap-4 p-5 lg:flex-row">
        {loading ? (
          <div className="flex h-[600px] w-full items-center justify-center rounded-2xl bg-white shadow-md lg:w-1/3 animate-pulse">
            <span className="text-gray-500 font-medium">
              Loading Routes...
            </span>
          </div>
        ) : (
          <RouteSidebar
            routes={sidebarRoutes}
            title="Available Routes"
            description="Select a route to display its path and stops on the map."
            showSearch={false}
            onSelect={setSelectedIndex}
          />
        )}

        <div className="w-full lg:w-2/3 h-[600px]">
          <MapView
            center={mapCenter}
            routeCoordinates={activeRouteCoords}
            routeLabel={
              activeRoute
                ? `${activeRoute.from} → ${activeRoute.to}`
                : undefined
            }
            namedStops={activeRoute?.stops}
            showBus={false}
          />
        </div>
      </div>

      <Stats />
    </TrackLayout>
  );
}