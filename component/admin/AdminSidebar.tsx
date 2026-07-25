"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bus,
  UserCheck,
  Route,
  Calendar,
  Bell,
  Users,
  MapPin,
  Image as ImageIcon,
  UsersRound,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Buses", href: "/admin/buses", icon: Bus },
  { title: "Drivers", href: "/admin/drivers", icon: UserCheck },
  { title: "Routes", href: "/admin/routes", icon: Route },
  { title: "Schedules", href: "/admin/schedules", icon: Calendar },
  { title: "Tracking", href: "/admin/tracking", icon: MapPin },
  { title: "Notifications", href: "/admin/notifications", icon: Bell },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Team", href: "/admin/team", icon: UsersRound },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Faint route-stitch accent along the right edge */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px route-stitch [background-size:1px_14px] [background-repeat:repeat-y]" />

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-5">
          <Link href="/admin" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary-strong">
              <Image
                src="/Logo.png"
                alt="SmartBus"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <span className="live-dot absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent" />
            </div>
            <div className="leading-tight">
              <h1 className="text-[15px] font-bold tracking-tight text-white">
                SmartBus
              </h1>
              <p className="text-[11px] font-medium text-sidebar-muted">
                Fleet Control
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-muted hover:bg-white/5 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
            Operations
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={onClose}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sidebar-active text-white"
                    : "text-sidebar-muted hover:bg-white/5 hover:text-white"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 h-5 w-1 -translate-x-3 rounded-full bg-accent" />
                )}
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 ${
                    isActive ? "text-accent" : ""
                  }`}
                />
                <span className="flex-1">{item.title}</span>
                {isActive && (
                  <ChevronRight className="h-3.5 w-3.5 text-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name || "Guest"}
              </p>
              <p className="truncate text-xs text-sidebar-muted">
                {user?.email || "guest@smartbus.com"}
              </p>
            </div>
            <button
              onClick={logout}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sidebar-muted transition-colors hover:bg-danger/15 hover:text-danger"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
