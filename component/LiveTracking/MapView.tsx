"use client";

import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import { haversineKm, formatDistance, calculateETA } from "@/utils/haversine";
import { Home, Minus, Plus } from "lucide-react";
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet"; // Importing polyline for route mapping
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchRoadRoute } from "@/utils/routing";
import { initLeafletIcons } from "@/utils/leaflet";

const busIcon = L.divIcon({
  html: `
    <div style="
      font-size:30px;
    ">
      🚌
    </div>
  `,
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// ==========================
// Fit Route
// ==========================
const FitBounds = ({ positions }: { positions: LatLngExpression[] }) => {
  const map = useMap();

  useEffect(() => {
    if (positions.length >= 2) {
      map.fitBounds(positions as any, {
        padding: [40, 40],
      });
    }
  }, [positions, map]);

  return null;
};

// ==========================
// Center On Bus
// ==========================
const CenterOnBus = ({
  center,
}: {
  center: [number, number];
}) => {
  const map = useMap();

  useEffect(() => {
    map.panTo(center);
  }, [center, map]);

  return null;
};

// ==========================
// Follow Device Location (unused but kept for future use)
// ==========================
const FollowDevice = ({
  location,
}: {
  location: [number, number] | null;
}) => {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(location, map.getZoom(), {
        animate: true,
        duration: 1,
      });
    }
  }, [location, map]);

  return null;
};

// ==========================
// Zoom Controls
// ==========================
const defaultCenter: [number, number] = [27.7172, 85.324];

const ZoomControls = ({
  deviceLocation,
}: {
  deviceLocation: [number, number] | null;
}) => {
  const map = useMap();

  return (
    <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
      <button
        onClick={() => map.zoomIn()}
        className="rounded-lg bg-card text-card-foreground p-2 shadow hover:bg-muted"
      >
        <Plus size={18} />
      </button>

      <button
        onClick={() => map.zoomOut()}
        className="rounded-lg bg-card text-card-foreground p-2 shadow hover:bg-muted"
      >
        <Minus size={18} />
      </button>

      <button
        onClick={() =>
          map.flyTo(deviceLocation ?? defaultCenter, 16)
        }
        className="rounded-lg bg-card text-card-foreground p-2 shadow hover:bg-muted"
      >
        <Home size={18} />
      </button>
    </div>
  );
};

// ==========================
// MapView Props
// ==========================
interface MapViewProps {
  center?: [number, number];
  routeCoordinates?: [number, number][];

  namedStops?: {
    name: string;
    lat?: number;
    lng?: number;
  }[];

  busPosition?: [number, number];
  busName?: string;
  routeLabel?: string;
  eta?: string;
  speed?: number;
  nextStop?: string;
  showBus?: boolean;
  fullScreen?: boolean;
  // stopETAs from backend kept for API compatibility;
  // frontend now calculates distances live via Haversine
  stopETAs?: { name: string; distance: number; eta: string }[];
}

const MapView = ({
  center = defaultCenter,
  routeCoordinates = [],
  namedStops = [],
  busPosition,
  busName = "Bus",
  routeLabel = "Route",
  eta = "N/A",
  speed = 0,
  nextStop = "N/A",
  showBus = false,
  fullScreen = false,
  stopETAs: _stopETAs = [], // accepted but calculation done client-side
}: MapViewProps) => {

  useEffect(() => {
    initLeafletIcons();
  }, []);

  // ==========================
  // Live distance & ETA via Haversine (memoized, updates only on bus movement)
  // ==========================
  const dynamicStopData = useMemo(() => {
    if (!busPosition || !namedStops || namedStops.length === 0) return null;

    // Filter to stops that have non-empty name and valid GPS coordinates
    const validStops = namedStops.filter(
      (s): s is { name: string; lat: number; lng: number } =>
        Boolean(s) && Boolean(s.name) && typeof s.lat === "number" && typeof s.lng === "number"
    );
    if (validStops.length === 0) return null;

    let closestDist = Infinity;
    let closestStop = validStops[0].name;

    const stopData = validStops.map(stop => {
      const distKm = haversineKm(busPosition, [stop.lat, stop.lng]);
      if (distKm < closestDist && distKm > 0.03) {
        closestDist = distKm;
        closestStop = stop.name;
      }
      return {
        name: stop.name || "Stop",
        distKm,
        distanceStr: formatDistance(distKm),
        etaStr: calculateETA(distKm, speed ?? 0)
      };
    });

    // Prefer backend's nextStop if it matches a valid stop, otherwise use closest
    const activeNextStopName = nextStop && nextStop !== "N/A" ? nextStop : closestStop;
    const activeNextStop = (activeNextStopName ? stopData.find(s => s.name === activeNextStopName) : undefined) ?? stopData[0];

    if (!activeNextStop) return null;

    return {
      stops: stopData,
      nextStopName: activeNextStop.name || "Next Stop",
      nextStopDistance: activeNextStop.distanceStr,
      nextStopEta: activeNextStop.etaStr
    };
  }, [busPosition, namedStops, speed, nextStop]);

  const [roadPath, setRoadPath] =
    useState<LatLngExpression[] | null>(null);

  const [deviceLocation, setDeviceLocation] =
    useState<[number, number] | null>(null);

  const watchId = useRef<number | null>(null);

  // ==========================
  // Watch Device GPS
  // ==========================
  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        setDeviceLocation([
          position.coords.latitude,
          position.coords.longitude,
        ]);
      },
      (error) => {
        console.warn("Geolocation error:", error.message || error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  // ==========================
  // Road Route via OSRM uses polyline mapping to show the green route in the map
  // ==========================
  useEffect(() => {
    if (routeCoordinates.length < 2) {
      setRoadPath(null);
      return;
    }

    let cancelled = false;

    fetchRoadRoute(routeCoordinates).then((road) => {
      if (!cancelled && road) {
        setRoadPath(
          road.map((c) => [c[0], c[1]] as LatLngExpression)
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [routeCoordinates]);

  const routePolyline =
    roadPath ??
    routeCoordinates.map(
      (coord) =>
        [coord[0], coord[1]] as LatLngExpression
    );

  const busKey = busPosition
    ? `${busPosition[0]},${busPosition[1]}`
    : "bus";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border shadow ${
        fullScreen ? "h-full w-full" : "h-full w-full min-h-[400px]"
      }`}
      style={{ height: "100%", width: "100%" }}
    >
      <MapContainer
        center={center}
        zoom={15}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* <FollowDevice location={deviceLocation} /> */}

        {showBus && busPosition ? (
          <CenterOnBus center={busPosition} />
        ) : routePolyline.length >= 2 ? (
          <FitBounds positions={routePolyline} /> // Fitting the boundary points using the poly line algorith
        ) : null}

        <ZoomControls deviceLocation={deviceLocation} />

        {routePolyline.length > 0 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{
              color: "#22c55e",
              weight: 6,
            }}
          />
        )}

        {/* Stop Markers — rich popups with live distance & ETA */}
        {namedStops.map((stop, index) => {
          // Skip stops without valid GPS coordinates
          if (typeof stop.lat !== "number" || typeof stop.lng !== "number") return null;
          const sData = dynamicStopData?.stops.find((s) => s.name === stop.name);
          return (
            <Marker key={index} position={[stop.lat, stop.lng]}>
              <Popup>
                <div className="space-y-1">
                  <h3 className="font-bold text-base">{stop.name}</h3>
                  {sData ? (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-800 mb-1">Bus Distance:</p>
                      <p>{sData.distanceStr}</p>
                      <p className="font-medium text-gray-800 mt-2 mb-1">Arrival Time:</p>
                      <p className={sData.etaStr === "Arrived" ? "text-green-600 font-semibold" : ""}>
                        {sData.etaStr}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Bus not active on this route</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Bus Marker — rich popup on click */}
        {showBus && busPosition && (
          <Marker
            key={busKey}
            position={busPosition}
            icon={busIcon}
          >
            <Popup minWidth={180}>
              <div className="space-y-1 text-sm">
                <h3 className="font-bold text-base">Bus: {busName}</h3>
                <p className="text-gray-500">{routeLabel}</p>
                <div className="mt-2 space-y-1">
                  {dynamicStopData ? (
                    <>
                      <p>
                        <span className="font-semibold">Distance: </span>
                        {dynamicStopData.nextStopDistance} ({dynamicStopData.nextStopEta})
                      </p>
                      <p>
                        <span className="font-semibold">Next Stop: </span>
                        {dynamicStopData.nextStopName}
                      </p>
                    </>
                  ) : null}
                  <p>
                    <span className="font-semibold">Speed: </span>
                    {!speed || speed === 0 ? "Stopped" : `${speed} km/h`}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Device Location Marker */}
        {deviceLocation && (
          <Marker position={deviceLocation}>
            <Popup>
              <div className="space-y-1">
                <h3 className="font-semibold">📍 Your Current Location</h3>
                <p>
                  <strong>Latitude:</strong>{" "}
                  {deviceLocation[0].toFixed(6)}
                </p>
                <p>
                  <strong>Longitude:</strong>{" "}
                  {deviceLocation[1].toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Device Location Overlay Card */}
      {deviceLocation && (
        <div className="absolute left-5 bottom-5 z-[1001] w-72 rounded-xl bg-card text-card-foreground p-4 shadow-xl border">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">
              📍 Current Device Location
            </h2>
            <span className="text-success font-semibold text-sm">
              LIVE
            </span>
          </div>

          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Latitude</span>
              <span className="font-medium text-foreground">
                {deviceLocation[0].toFixed(6)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Longitude</span>
              <span className="font-medium text-foreground">
                {deviceLocation[1].toFixed(6)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bus Info Card — Top-Left Overlay */}
      {showBus && (
        <div className="absolute left-5 top-5 z-[1001] w-64 rounded-xl bg-card text-card-foreground p-4 shadow-xl border">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-foreground">Bus: {busName}</h2>
            <span className="flex items-center gap-1 text-xs font-semibold text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
              LIVE
            </span>
          </div>

          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">Route:</p>
              <p>{routeLabel}</p>
            </div>

            {dynamicStopData && (
              <>
                <div>
                  <p className="font-semibold text-foreground">Distance:</p>
                  <p>{dynamicStopData.nextStopDistance} ({dynamicStopData.nextStopEta})</p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">Next Stop:</p>
                  <p>{dynamicStopData.nextStopName}</p>
                </div>
              </>
            )}

            <div>
              <p className="font-semibold text-foreground">Speed:</p>
              <p>{!speed || speed === 0 ? "Stopped" : `${speed} km/h`}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;