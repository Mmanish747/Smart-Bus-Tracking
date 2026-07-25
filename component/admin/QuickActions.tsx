"use client";

import Link from "next/link";
import { Bus, Route, Calendar, MapPin, Bell, Users, ArrowRight, type LucideIcon } from "lucide-react";

interface Action {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const actions: Action[] = [
  { label: "Add Bus", description: "Register a new vehicle", href: "/admin/buses", icon: Bus },
  { label: "Add Route", description: "Map a new path", href: "/admin/routes", icon: Route },
  { label: "New Schedule", description: "Plan departures", href: "/admin/schedules", icon: Calendar },
  { label: "Live Tracking", description: "Watch the fleet", href: "/admin/tracking", icon: MapPin },
  { label: "Send Alert", description: "Notify passengers", href: "/admin/notifications", icon: Bell },
  { label: "Manage Users", description: "Drivers & riders", href: "/admin/users", icon: Users },
];

export default function QuickActions() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-bold text-foreground">Quick Actions</h2>
      <div className="space-y-2.5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center gap-3 rounded-xl border border-transparent p-2.5 transition-all hover:border-border hover:bg-muted/60"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{action.label}</p>
                <p className="truncate text-xs text-muted-foreground">{action.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
