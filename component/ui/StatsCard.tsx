"use client";

import { type LucideIcon } from "lucide-react";

type Tone = "primary" | "accent" | "info" | "warning" | "danger" | "neutral";

const toneStyles: Record<Tone, { icon: string; ring: string }> = {
  primary: { icon: "bg-primary/12 text-primary", ring: "from-primary/10" },
  accent: { icon: "bg-accent/15 text-accent-foreground dark:text-accent", ring: "from-accent/10" },
  info: { icon: "bg-info/12 text-info", ring: "from-info/10" },
  warning: { icon: "bg-warning/12 text-warning", ring: "from-warning/10" },
  danger: { icon: "bg-danger/12 text-danger", ring: "from-danger/10" },
  neutral: { icon: "bg-muted text-muted-foreground", ring: "from-muted" },
};

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  tone?: Tone;
  subtitle?: string;
}

export default function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  tone = "primary",
  subtitle,
}: StatsCardProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${styles.ring} to-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground/80">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-xs font-semibold ${
                  trendUp === false ? "text-danger" : "text-primary"
                }`}
              >
                {trendUp === false ? "\u2193" : "\u2191"} {trend}
              </span>
              <span className="text-xs text-muted-foreground/70">vs last month</span>
            </div>
          )}
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${styles.icon}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-foreground/[0.03]" />
    </div>
  );
}
