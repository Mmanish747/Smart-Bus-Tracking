"use client";

import { useMemo } from "react";
import { PieChart, BarChart3, TrendingUp, HelpCircle } from "lucide-react";
import type { StatsData } from "@/utils/api";

interface AnalyticsChartsProps {
  stats: StatsData["stats"];
}

export default function AnalyticsCharts({ stats }: AnalyticsChartsProps) {
  const { totalBuses, activeBuses, delaysCount, activeTracking } = stats;
  const inactiveBuses = Math.max(0, totalBuses - activeBuses);

  // --- Donut Chart Math ---
  const donutData = useMemo(() => {
    const active = activeBuses - delaysCount;
    const delayed = delaysCount;
    const inactive = inactiveBuses;
    const total = totalBuses || 1;

    const activePct = (active / total) * 100;
    const delayedPct = (delayed / total) * 100;
    const inactivePct = (inactive / total) * 100;

    const radius = 50;
    const circumference = 2 * Math.PI * radius; // ~314.16

    const activeStroke = (activePct / 100) * circumference;
    const delayedStroke = (delayedPct / 100) * circumference;
    const inactiveStroke = (inactivePct / 100) * circumference;

    return {
      activePct,
      delayedPct,
      inactivePct,
      activeOffset: 0,
      delayedOffset: activeStroke,
      inactiveOffset: activeStroke + delayedStroke,
      circumference,
      activeStroke,
      delayedStroke,
      inactiveStroke,
    };
  }, [activeBuses, delaysCount, inactiveBuses, totalBuses]);

  // --- Bar Chart Data (Mocking Transit load over time) ---
  const hourlyLoad = [
    { hour: "06:00", load: 35 },
    { hour: "09:00", load: 85 }, // peak morning
    { hour: "12:00", load: 50 },
    { hour: "15:00", load: 60 },
    { hour: "18:00", load: 90 }, // peak evening
    { hour: "21:00", load: 25 },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Donut Chart */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Fleet Distribution</h3>
          </div>
          
          <div className="flex flex-col items-center justify-center py-6 sm:flex-row sm:gap-8">
            {/* SVG Donut */}
            <div className="relative h-36 w-36">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="fill-none stroke-muted"
                  strokeWidth="12"
                />
                {totalBuses > 0 && (
                  <>
                    {/* Inactive Circle Segment */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      className="fill-none stroke-gray-400 dark:stroke-gray-600 transition-all duration-500"
                      strokeWidth="12"
                      strokeDashoffset={donutData.circumference - donutData.inactiveStroke}
                      strokeDasharray={`${donutData.inactiveStroke} ${donutData.circumference}`}
                      transform={`rotate(${(donutData.inactiveOffset / donutData.circumference) * 360} 60 60)`}
                    />
                    {/* Delayed Circle Segment */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      className="fill-none stroke-warning transition-all duration-500"
                      strokeWidth="12"
                      strokeDashoffset={donutData.circumference - donutData.delayedStroke}
                      strokeDasharray={`${donutData.delayedStroke} ${donutData.circumference}`}
                      transform={`rotate(${(donutData.delayedOffset / donutData.circumference) * 360} 60 60)`}
                    />
                    {/* Active (On Time) Circle Segment */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      className="fill-none stroke-info transition-all duration-500"
                      strokeWidth="12"
                      strokeDashoffset={donutData.circumference - donutData.activeStroke}
                      strokeDasharray={`${donutData.activeStroke} ${donutData.circumference}`}
                      transform={`rotate(${(donutData.activeOffset / donutData.circumference) * 360} 60 60)`}
                    />
                  </>
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-foreground">{totalBuses}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Fleet</span>
              </div>
            </div>

            {/* Labels */}
            <div className="mt-4 space-y-2 sm:mt-0 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-info" />
                <span className="text-muted-foreground">Active (On Time)</span>
                <span className="font-semibold text-foreground ml-auto">
                  {Math.round(donutData.activePct)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-muted-foreground">Delayed</span>
                <span className="font-semibold text-foreground ml-auto">
                  {Math.round(donutData.delayedPct)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-gray-400 dark:bg-gray-600" />
                <span className="text-muted-foreground">Inactive / Depot</span>
                <span className="font-semibold text-foreground ml-auto">
                  {Math.round(donutData.inactivePct)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart (CSS-based) */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-bold text-foreground">Fleet Load Forecast</h3>
          </div>

          <div className="flex h-36 items-end gap-3 border-b border-border pb-2 pt-6">
            {hourlyLoad.map((item, idx) => (
              <div key={idx} className="group flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
                <div className="relative w-full">
                  <div
                    style={{ height: `${item.load}%` }}
                    className="w-full rounded-t-md bg-accent/80 hover:bg-accent transition-all duration-500 relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background opacity-0 group-hover:opacity-100 transition-opacity font-bold whitespace-nowrap z-10 shadow">
                      {item.load}% load
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{item.hour}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-success" /> Peak times: 09:00 & 18:00</span>
            <span className="flex items-center gap-1 text-info"><HelpCircle className="h-3 w-3" /> Average Load: ~57%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
