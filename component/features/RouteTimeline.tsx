"use client";

import React from "react";
import type { RouteStop } from "@/utils/api";

type Props = {
  stops?: RouteStop[];
  firstBus?: string;
};

function computeTime(baseTime: string, offsetMin: number): string {
  const [time, period] = baseTime.split(" ");
  let [h, m] = time.split(":").map(Number);
  m += offsetMin;
  while (m >= 60) {
    h += 1;
    m -= 60;
  }
  while (m < 0) {
    h -= 1;
    m += 60;
  }
  let newPeriod = period;
  if (h >= 12) {
    newPeriod = "PM";
    if (h > 12) h -= 12;
  } else if (h === 0) {
    h = 12;
    newPeriod = "AM";
  } else {
    newPeriod = period;
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${newPeriod}`;
}

const RouteTimeline = ({ stops, firstBus = "05:30 AM" }: Props) => {
  if (!stops || stops.length === 0) {
    return (
      <div className="p-5">
        <h4 className="mb-5 text-sm font-bold text-gray-900">Route Stops</h4>
        <p className="text-sm text-gray-400">Select a schedule to view stops</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h4 className="mb-5 text-sm font-bold text-gray-900">Route Stops</h4>

      <div className="relative">
        {stops.map((stop, index) => (
          <div key={stop._id || index} className="relative flex gap-4 pb-8">
            <div className="relative flex flex-col items-center">
              {index !== stops.length - 1 && (
                <div className="absolute top-5 h-full w-0.5 bg-gray-200"></div>
              )}

              {stop.type === "start" || stop.type === "end" ? (
                <div className="z-10 h-4 w-4 rounded-full border-4 border-green-600 bg-white"></div>
              ) : (
                <div className="z-10 flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-700">
                  {index}
                </div>
              )}
            </div>

            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm ${
                    stop.type === "start" || stop.type === "end"
                      ? "font-semibold text-gray-900"
                      : "text-gray-800"
                  }`}
                >
                  {stop.name}
                </span>

                {stop.type === "start" && (
                  <span className="rounded bg-green-50 px-2 py-0.5 text-[10px] font-medium uppercase text-green-700">
                    Start
                  </span>
                )}

                {stop.type === "end" && (
                  <span className="rounded border border-green-100 bg-green-50 px-2 py-0.5 text-[10px] font-medium uppercase text-green-700">
                    End
                  </span>
                )}
              </div>

              <span className="text-sm text-gray-600">
                {computeTime(firstBus, stop.timeOffset ?? 0)}
              </span>
            </div>
          </div>
        ))}

        <div className="ml-1.75 mt-1 flex flex-col gap-1">
          <div className="h-1 w-1 rounded-full bg-gray-300"></div>
          <div className="h-1 w-1 rounded-full bg-gray-300"></div>
          <div className="h-1 w-1 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
};

export default RouteTimeline;