"use client";

import { useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Trash2, Undo2 } from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMapEvents,
} from "react-leaflet";

import { NamedStop } from "@/utils/api";

// ── Leaflet icon fix ──────────────────────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const defaultCenter: [number, number] = [27.7172, 85.324];

// ── Stop type label helper ────────────────────────────────────────────────────
function stopTypeLabel(index: number, total: number): "start" | "stop" | "end" {
  if (index === 0) return "start";
  if (index === total - 1 && total > 1) return "end";
  return "stop";
}

function badgeColor(type: "start" | "stop" | "end") {
  if (type === "start") return "bg-blue-600 text-white";
  if (type === "end") return "bg-red-600 text-white";
  return "bg-gray-600 text-white";
}

// ── Pending click state ───────────────────────────────────────────────────────
interface PendingPoint {
  lat: number;
  lng: number;
}

// ── Click handler inner component ─────────────────────────────────────────────
function ClickHandler({
  onPendingPoint,
}: {
  onPendingPoint: (p: PendingPoint) => void;
}) {
  useMapEvents({
    click(e) {
      onPendingPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface RouteMapPickerProps {
  value: NamedStop[];
  onChange: (stops: NamedStop[]) => void;
  readOnly?: boolean;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RouteMapPicker({ value, onChange }: RouteMapPickerProps) {
  const [pending, setPending] = useState<PendingPoint | null>(null);
  const [stopName, setStopName] = useState("");
  const [nameError, setNameError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Fired when user clicks the map
  const handlePendingPoint = (p: PendingPoint) => {
    setPending(p);
    setStopName("");
    setNameError("");
    // Focus the input after render
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  // Confirm the stop name and add to list
  const confirmStop = () => {
    const trimmed = stopName.trim();
    if (!trimmed) {
      setNameError("Please enter a stop name.");
      return;
    }
    if (!pending) return;

    const newStop: NamedStop = {
      name: trimmed,
      lat: pending.lat,
      lng: pending.lng,
    };

    onChange([...value, newStop]);
    setPending(null);
    setStopName("");
    setNameError("");
  };

  const cancelPending = () => {
    setPending(null);
    setStopName("");
    setNameError("");
  };

  const undo = () => {
    if (value.length === 0) return;
    onChange(value.slice(0, -1));
  };

  const clear = () => {
    onChange([]);
    setPending(null);
  };

  const polylinePositions: [number, number][] = value.map((s) => [s.lat, s.lng]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Route Builder</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={value.length === 0}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-40"
          >
            <Undo2 size={14} /> Undo
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={value.length === 0 && !pending}
            className="inline-flex items-center gap-1 rounded-lg border border-red-500 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 disabled:opacity-40"
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Click anywhere on the map to add a named stop to the route.
      </p>

      {/* Stop-name modal — shown above the map when a click is pending */}
      {pending && (
        <div className="rounded-xl border border-blue-300 bg-blue-50 p-4 shadow-md">
          <div className="mb-1 flex items-center gap-2">
            <MapPin size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">
              Name this stop&nbsp;
              <span className="font-normal text-blue-600">
                ({pending.lat.toFixed(5)}, {pending.lng.toFixed(5)})
              </span>
            </span>
          </div>

          <div className="flex gap-2 mt-2">
            <input
              ref={inputRef}
              type="text"
              value={stopName}
              onChange={(e) => {
                setStopName(e.target.value);
                setNameError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmStop();
                }
                if (e.key === "Escape") cancelPending();
              }}
              placeholder="e.g. Balkumari Chowk"
              className="flex-1 rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={confirmStop}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={cancelPending}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>

          {nameError && (
            <p className="mt-1 text-xs text-red-600">{nameError}</p>
          )}
        </div>
      )}

      {/* Map */}
      <div className="overflow-hidden rounded-xl border">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          className="h-[420px] w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickHandler onPendingPoint={handlePendingPoint} />

          {/* Confirmed route polyline */}
          {polylinePositions.length > 1 && (
            <Polyline
              positions={polylinePositions}
              pathOptions={{ color: "#16a34a", weight: 5 }}
            />
          )}

          {/* Confirmed stop markers */}
          {value.map((stop, index) => {
            const type = stopTypeLabel(index, value.length);
            return (
              <Marker key={`stop-${index}`} position={[stop.lat, stop.lng]}>
                <Popup>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">{stop.name}</p>
                    <p className="text-gray-500 capitalize">{type}</p>
                    <p>
                      <strong>Lat:</strong> {stop.lat.toFixed(6)}
                    </p>
                    <p>
                      <strong>Lng:</strong> {stop.lng.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Ghost marker for pending click */}
          {pending && (
            <Marker
              position={[pending.lat, pending.lng]}
              opacity={0.5}
            >
              <Popup>Pending — enter a name above</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Stop list */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Stops added ({value.length})
          </p>
          <ol className="space-y-1">
            {value.map((stop, index) => {
              const type = stopTypeLabel(index, value.length);
              return (
                <li
                  key={index}
                  className="flex items-center gap-3 rounded-lg border bg-gray-50 px-3 py-2 text-sm"
                >
                  <span
                    className={`inline-flex h-5 min-w-[2rem] items-center justify-center rounded px-1.5 text-xs font-bold ${badgeColor(type)}`}
                  >
                    {index + 1}
                  </span>
                  <span className="flex-1 font-medium">{stop.name}</span>
                  <span className="capitalize text-gray-400 text-xs">{type}</span>
                  <span className="text-gray-400 text-xs">
                    {stop.lat.toFixed(5)}, {stop.lng.toFixed(5)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange(value.filter((_, i) => i !== index))
                    }
                    className="text-red-400 hover:text-red-600"
                    title="Remove stop"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}