"use client";

import { Bell } from "lucide-react";

const NotificationBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-green-100 p-6">
    
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-bl-full bg-white/40"></div>

      
      <div className="absolute right-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
          <Bell className="h-5 w-5 text-primary" />
        </div>
      </div>

     
      <div className="relative z-10 pr-20">
        <h3 className="mb-2 text-lg font-bold text-gray-900">
          Stay Informed, Stay Ahead
        </h3>

        <p className="mb-8 text-sm leading-6 text-gray-600">
          Allow notifications to get real-time updates about your buses and
          important alerts.
        </p>

    
        <div className="flex gap-3">
          <button className="flex-1 rounded-lg border border-gray-200 bg-white py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            Not Now
          </button>

          <button className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white transition hover:bg-green-700">
            Enable
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;