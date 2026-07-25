"use client";

import { useEffect, useState, useMemo } from "react";
import {
  fetchApi,
  RoutesResponse,
  RouteData,
  TrackingResponse,
  TrackingData,
} from "@/utils/api";

const POLL_INTERVAL_MS = 5000;

export function useLiveTracking() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [tracking, setTracking] = useState<TrackingData[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [loadingTracking, setLoadingTracking] = useState(true);

  useEffect(() => {
    fetchApi<RoutesResponse>("/routes")
      .then((data) => {
        if (data.success && data.routes) setRoutes(data.routes);
      })
      .catch((err) => console.error("Failed to load routes:", err))
      .finally(() => setLoadingRoutes(false));
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchTracking = () => {
      fetchApi<TrackingResponse>("/tracking")
        .then((data) => {
          if (!mounted) return;
          if (data.success && data.tracking) setTracking(data.tracking);
        })
        .catch((err) => console.error("Failed to load tracking:", err))
        .finally(() => {
          if (mounted) setLoadingTracking(false);
        });
    };

    fetchTracking();
    const id = setInterval(fetchTracking, POLL_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const trackingByRouteId = useMemo(() => {
    const map = new Map<string, TrackingData>();

    for (const t of tracking) {
      const routeId = typeof t.route === "string" ? t.route : t.route?._id;
      if (routeId) {
        map.set(routeId, t);
      }
    }

    return map;
  }, [tracking]);
  return {
    routes,
    tracking,
    loadingRoutes,
    loadingTracking,
    trackingByRouteId,
  };
}
