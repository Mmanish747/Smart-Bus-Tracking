"use client";

import { useState } from "react";
import { Search, Gauge } from "lucide-react";
import type { TrackingData } from "@/utils/api";
import StatusBadge from "@/component/ui/StatusBadge";

interface TrackingSidebarProps {
  tracking: TrackingData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function TrackingSidebar({ tracking, selectedId, onSelect }: TrackingSidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = tracking.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.bus?.busNumber?.toLowerCase().includes(q) ||
      t.route?.routeNo?.toLowerCase().includes(q) ||
      t.route?.from?.toLowerCase().includes(q) ||
      t.route?.to?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-base font-bold text-foreground">Tracked Vehicles</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Select a bus to focus the map on its live position.
      </p>

      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bus or route..."
          className="w-full rounded-lg border border-border bg-muted/60 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="scrollbar-thin mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No tracked buses found.</p>
        ) : (
          filtered.map((t) => (
            <button
              key={t._id}
              onClick={() => onSelect(t._id)}
              className={`w-full rounded-xl border p-3 text-left transition-all ${
                selectedId === t._id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  {t.bus?.busNumber || "Bus"}
                </span>
                <StatusBadge
                  label={t.status || "Live"}
                  tone={t.status?.toLowerCase().includes("delay") ? "warning" : "success"}
                  pulse
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t.route?.routeNo} • {t.route?.from} → {t.route?.to}
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Gauge className="h-3.5 w-3.5" />
                {t.speed?.toFixed(0) ?? 0} km/h
                {t.eta && <span>• ETA {t.eta}</span>}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
