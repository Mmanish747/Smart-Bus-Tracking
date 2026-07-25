"use client";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClasses: Record<Tone, string> = {
  success: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-info",
  neutral: "bg-muted text-muted-foreground",
};

const dotClasses: Record<Tone, string> = {
  success: "bg-primary",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-muted-foreground",
};

interface StatusBadgeProps {
  label: string;
  tone: Tone;
  pulse?: boolean;
}

export default function StatusBadge({ label, tone, pulse }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone]} ${pulse ? "live-dot" : ""}`}
      />
      {label}
    </span>
  );
}
