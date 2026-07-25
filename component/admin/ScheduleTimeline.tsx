"use client";

import { Clock } from "lucide-react";
import type { ScheduleData } from "@/utils/api";

interface ScheduleTimelineProps {
  schedules: ScheduleData[];
}

function parseTimeToMinutes(time: string): number | null {
  if (!time) return null;
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

const HOUR_MARKS = [0, 4, 8, 12, 16, 20, 24];

export default function ScheduleTimeline({ schedules }: ScheduleTimelineProps) {
  const rows = schedules
    .map((s) => {
      const start = parseTimeToMinutes(s.firstBus);
      const end = parseTimeToMinutes(s.lastBus);
      return { schedule: s, start, end };
    })
    .filter((r) => r.start !== null && r.end !== null) as {
    schedule: ScheduleData;
    start: number;
    end: number;
  }[];

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-12 text-center">
        <Clock className="mb-2 h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No schedules with a readable first/last bus time yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Daily Service Timeline</h2>
        <p className="text-xs text-muted-foreground">First bus → last bus, by route</p>
      </div>

      {/* Hour ruler */}
      <div className="relative ml-36 mb-2 h-5 border-b border-border text-[10px] text-muted-foreground sm:ml-44">
        {HOUR_MARKS.map((h) => (
          <span
            key={h}
            className="absolute -translate-x-1/2"
            style={{ left: `${(h / 24) * 100}%` }}
          >
            {h === 24 ? "12am" : h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`}
          </span>
        ))}
      </div>

      <div className="scrollbar-thin max-h-96 space-y-2.5 overflow-y-auto pr-1">
        {rows.map(({ schedule, start, end }) => {
          const left = (start / (24 * 60)) * 100;
          const width = Math.max(((end - start + (end < start ? 24 * 60 : 0)) / (24 * 60)) * 100, 1.5);

          return (
            <div key={schedule._id} className="flex items-center gap-3">
              <div className="w-32 shrink-0 truncate text-xs font-medium text-foreground sm:w-40">
                {schedule.route?.routeNo}
                <span className="block truncate text-[10px] font-normal text-muted-foreground">
                  {schedule.bus?.busNumber || "Unassigned"}
                </span>
              </div>
              <div className="relative h-6 flex-1 rounded-md bg-muted">
                <div
                  className={`absolute h-full rounded-md ${
                    schedule.active
                      ? "bg-gradient-to-r from-primary to-accent"
                      : "bg-muted-foreground/30"
                  }`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`${schedule.firstBus} – ${schedule.lastBus}`}
                />
              </div>
              <div className="hidden w-28 shrink-0 text-right text-[11px] text-muted-foreground sm:block">
                {schedule.firstBus} – {schedule.lastBus}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
