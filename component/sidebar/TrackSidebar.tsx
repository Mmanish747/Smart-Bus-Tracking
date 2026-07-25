"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bus,
  House,
  Route,
  Calendar,
  Bell,
  CircleHelp,
  Headset,
  MapPin,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";

const menuItems = [
  { title: "Home", href: "/", icon: House },
  { title: "Track Bus", href: "/track-bus", icon: Bus },
  { title: "Routes", href: "/routes", icon: Route },
  { title: "Schedule", href: "/schedule", icon: Calendar },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "About Us", href: "/about", icon: CircleHelp },
];

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
};

const TrackSidebar = ({ isOpen = false, onClose }: Props) => {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between overflow-y-auto border-r border-gray-200 bg-white transition-transform duration-200 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex h-20 items-center justify-between border-b border-gray-200 px-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Image
                  src="/Logo.png"
                  alt="logo"
                  width={24}
                  height={24}
                  className="h-5 w-5 text-white"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">SmartBus</h1>
                <p className="text-xs text-gray-500">Tracking System</p>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-6 space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg border-l-4 px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "border-primary bg-green-50 text-primary"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-black"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-6 px-4 pb-6">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
            <h3 className="text-sm font-semibold">Download Our App</h3>
            <p className="mt-1 text-xs text-gray-500">
              Track your bus on the go
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Image
                src="/google-play.png"
                alt="Google Play"
                width={90}
                height={28}
              />
              <Image
                src="/app-store.png"
                alt="App Store"
                width={90}
                height={28}
              />
            </div>
            <div className="mt-5 flex justify-center overflow-hidden">
              <div className="relative h-32 w-20 rounded-t-[20px] border-[5px] border-gray-800 bg-white shadow-lg">
                <div className="absolute left-1/2 top-0 h-3 w-8 -translate-x-1/2 rounded-b-xl bg-gray-800"></div>
                <div className="mt-4 h-full bg-green-50">
                  <div className="flex h-full items-center justify-center">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
              <Headset className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs font-medium">Need Help?</p>
              <Link
                href="/support"
                className="text-xs text-primary hover:underline"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default TrackSidebar;
