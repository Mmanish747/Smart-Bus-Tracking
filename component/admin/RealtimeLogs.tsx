"use client";

import { useEffect, useRef, useState } from "react";
import { Radio, Gauge, MapPinned } from "lucide-react";
import type { TrackingData } from "@/utils/api";

interface LogEntry {
  id: string;
  time: string;
  text: string;
  kind: "move" | "stop" | "alert";
}

interface RealtimeLogsProps {
  tracking: TrackingData[];
}

export default function RealtimeLogs({ tracking }: RealtimeLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const seen = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (tracking.length === 0) return;

    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour12: false });
    const next: LogEntry[] = [];

    tracking.forEach((t) => {
      const prevSpeed = seen.current.get(t._id);
      seen.current.set(t._id, t.speed);
      const busNumber = t.bus?.busNumber || "Bus";
      const route = t.route ? `${t.route.from} → ${t.route.to}` : "route";

      if (prevSpeed === undefined) {
        next.push({
          id: `${t._id}-${now.getTime()}`,
          time,
          text: `${busNumber} came online on ${route}`,
          kind: "move",
        });
      } else if (t.speed < 3 && prevSpeed >= 3) {
        next.push({
          id: `${t._id}-${now.getTime()}-stop`,
          time,
          text: `${busNumber} stopped near ${t.nextStop || "a stop"}`,
          kind: "stop",
        });
      } else if (t.status?.toLowerCase().includes("delay")) {
        next.push({
          id: `${t._id}-${now.getTime()}-alert`,
          time,
          text: `${busNumber} reported a delay on ${route}`,
          kind: "alert",
        });
      } else {
        next.push({
          id: `${t._id}-${now.getTime()}-move`,
          time,
          text: `${busNumber} at ${t.speed.toFixed(0)} km/h, ETA ${t.eta || "—"}`,
          kind: "move",
        });
      }
    });

    setLogs((prev) => [...next, ...prev].slice(0, 30));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Live Tracking Log</h2>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <span className="live-dot h-2 w-2 rounded-full bg-accent" />
          Streaming
        </span>
      </div>

      <div className="scrollbar-thin max-h-72 space-y-2 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Radio className="mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Waiting for buses to report their position…
            </p>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="log-enter flex items-start gap-3 rounded-lg border border-transparent px-2 py-1.5 text-sm hover:border-border hover:bg-muted/50"
            >
              <span className="mt-0.5 shrink-0 font-mono text-[11px] text-muted-foreground/70">
                {log.time}
              </span>
              {log.kind === "alert" ? (
                <MapPinned className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              ) : log.kind === "stop" ? (
                <Gauge className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" />
              ) : (
                <span className="live-dot mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              )}
              <span className="text-foreground/90">{log.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
