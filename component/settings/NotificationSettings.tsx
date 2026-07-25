"use client";

import { useEffect, useState } from "react";
import { Bell, Mail, Smartphone, Settings, ChevronRight, ChevronDown } from "lucide-react";

type SettingItem = {
  key: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: any;
};

const DEFAULT_SETTINGS: SettingItem[] = [
  { key: "push", title: "Push Notifications", description: "Receive push alerts on your device", enabled: true, icon: Bell },
  { key: "email", title: "Email Notifications", description: "Get notified via email", enabled: true, icon: Mail },
  { key: "sms", title: "SMS Notifications", description: "Receive text message alerts", enabled: false, icon: Smartphone },
];

const STORAGE_KEY = "notificationSettings";

const NotificationSettings = () => {
  const [items, setItems] = useState<SettingItem[]>(DEFAULT_SETTINGS);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: { key: string; enabled: boolean }[] = JSON.parse(raw);
        const merged = DEFAULT_SETTINGS.map((d) => ({
          ...d,
          enabled: saved.find((s) => s.key === d.key)?.enabled ?? d.enabled,
        }));
        setItems(merged);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const toSave = items.map((i) => ({ key: i.key, enabled: i.enabled }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      // ignore
    }
  }, [items]);

  function toggle(key: string) {
    setItems((prev) => prev.map((p) => (p.key === key ? { ...p, enabled: !p.enabled } : p)));
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 text-lg font-bold text-gray-900 sm:text-xl">Notification Settings</h2>

      <div className="space-y-4 sm:space-y-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="flex w-full items-center justify-between rounded-lg p-1">
              <div className="flex items-center gap-3 sm:gap-4">
                <Icon className="h-5 w-5 text-gray-500 sm:h-6 sm:w-6" />

                <div>
                  <p className="text-sm font-medium text-gray-900 sm:text-base">{item.title}</p>
                  {showPreferences && (
                    <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <span className={`text-xs font-medium sm:text-base ${item.enabled ? "text-primary" : "text-gray-500"}`}>
                  {item.enabled ? "Enabled" : "Disabled"}
                </span>

                <button
                  onClick={() => toggle(item.key)}
                  aria-pressed={item.enabled}
                  className={`h-6 w-10 rounded-full p-0.5 transition ${item.enabled ? "bg-primary" : "bg-gray-200"}`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white transform transition ${item.enabled ? "translate-x-4" : "translate-x-0"}`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="my-4 border-t border-gray-200 sm:my-5" />

      <button
        onClick={() => setShowPreferences((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg p-1 transition hover:bg-gray-50 active:scale-[0.99]"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <Settings className="h-5 w-5 text-gray-500 sm:h-6 sm:w-6" />

          <div className="text-left">
            <h3 className="text-sm font-medium text-gray-900 sm:text-base">Manage Preferences</h3>

            <p className="text-xs text-gray-500 sm:text-sm">Choose what you want to receive</p>
          </div>
        </div>

        {showPreferences ? (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-400" />
        )}
      </button>
    </div>
  );
};

export default NotificationSettings;