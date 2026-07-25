"use client";

import { Activity } from "lucide-react";

interface HealthMetric {
  label: string;
  value: number;
  detail: string;
}

interface SystemHealthProps {
  metrics: HealthMetric[];
}

export default function SystemHealth({ metrics }: SystemHealthProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">System Overview</h2>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <span className="live-dot h-2 w-2 rounded-full bg-accent" />
          <Activity className="h-3.5 w-3.5" />
          Live
        </span>
      </div>

      <div className="space-y-5">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{metric.label}</span>
              <span className="text-muted-foreground">{metric.value}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                style={{ width: `${Math.min(100, Math.max(0, metric.value))}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground/80">{metric.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
