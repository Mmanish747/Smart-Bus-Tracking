"use client";

import { useEffect, useState } from "react";
import BusSearchHeader from "@/component/head/BusSearchHeader";
import dynamic from "next/dynamic";
const MapView = dynamic(() => import("@/component/LiveTracking/MapView"), { ssr: false });
import RouteSidebar from "@/component/LiveTracking/RouteSidebar";
import Stats from "@/component/stats/Stats";
import TrackLayout from "@/component/track-layout/TrackLayout";
import { fetchApi, RoutesResponse, RouteData } from "@/utils/api";

const Page = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchApi<RoutesResponse>("/routes")
      .then((data) => {
        if (data.success && data.routes) {
          setRoutes(data.routes);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load routes from API:", err);
        setLoading(false);
      });
  }, []);

  const sidebarRoutes = routes.map((r, idx) => ({
    number: r.routeNo,
    route: `${r.from} → ${r.to}`,
    frequency: `Every ${r.frequency}`,
    status: r.status,
    color: r.color || "bg-primary text-white",
    active: idx === selectedIndex,
  }));

  const activeRoute = routes[selectedIndex];
  const activeCoordinates = activeRoute?.pathCoordinates || [];
  const mapCenter = activeCoordinates.length > 0 ? activeCoordinates[0] : undefined;

  return (
    <TrackLayout>
      <BusSearchHeader 
        tileFirst="Filter by Areas"
        firstOption="All Areas"
        titleSecond="Sort by"
        secondOption="Route Number"
      />
      <div className="flex gap-4 p-5 flex-col lg:flex-row">
        {loading ? (
          <div className="flex h-[600px] w-full items-center justify-center rounded-2xl bg-white shadow-md lg:w-1/3 animate-pulse">
            <span className="text-gray-500 font-medium">Loading Routes...</span>
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
        <MapView 
          center={mapCenter} 
          routeCoordinates={activeCoordinates}
          routeLabel={activeRoute ? `${activeRoute.from} → ${activeRoute.to}` : undefined}
        />
      </div>
      <Stats />
    </TrackLayout>
  );
};

export default Page;