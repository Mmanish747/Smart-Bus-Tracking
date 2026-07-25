"use client";

import { useEffect, useState } from "react";
import { IoArrowForward, IoChevronDown, IoEyeOutline } from "react-icons/io5";
import { useLanguage } from "@/context/LanguageContext";
import type { ScheduleData, SchedulesResponse } from "@/utils/api";
import { fetchApi } from "@/utils/api";

type Props = {
  onSelectSchedule?: (schedule: ScheduleData) => void;
  selectedId?: string | null;
  routeFilterId?: string | null;
};

const BusScheduleTable = ({
  onSelectSchedule,
  selectedId,
  routeFilterId,
}: Props) => {
  const { t } = useLanguage();
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchApi<SchedulesResponse>("/schedules")
      .then((data) => {
        if (data.success && data.schedules) setSchedules(data.schedules);
      })
      .catch((err) => console.error("Failed to load schedules:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredSchedules = routeFilterId
    ? schedules.filter((schedule) => schedule.route?._id === routeFilterId)
    : schedules;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card transition-colors">
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-lg font-bold text-foreground">
          {t("schedule_page.bus_schedules")}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-border bg-background">
            <tr className="text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-6 py-3 font-medium">Route</th>
              <th className="px-6 py-3 font-medium">Bus Number</th>
              <th className="px-6 py-3 font-medium">First Bus</th>
              <th className="px-6 py-3 font-medium">Last Bus</th>
              <th className="px-6 py-3 font-medium">Frequency</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 text-center font-medium">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border text-sm">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-6 text-center text-muted-foreground"
                >
                  {t("schedule_page.loading")}
                </td>
              </tr>
            ) : filteredSchedules.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-6 text-center text-muted-foreground"
                >
                  {t("schedule_page.empty")}
                </td>
              </tr>
            ) : (
              filteredSchedules.map((schedule) => (
                <tr
                  key={schedule._id}
                  onClick={() => onSelectSchedule?.(schedule)}
                  className={`cursor-pointer transition-colors hover:bg-muted/20 ${
                    selectedId === schedule._id
                      ? "bg-primary/10 ring-1 ring-inset ring-primary/30"
                      : schedule.active
                        ? "bg-success/10"
                        : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded font-bold text-white ${
                          schedule.route?.color || "bg-success"
                        }`}
                      >
                        {schedule.route?.routeNo}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                          <span>{schedule.route?.from}</span>
                          <IoArrowForward className="text-xs text-muted-foreground" />
                          <span>{schedule.route?.to}</span>
                        </div>

                        {schedule.route?.via && (
                          <p className="text-xs text-muted-foreground">
                            via {schedule.route.via}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-foreground">
                    {schedule.bus?.busNumber || "-"}
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {schedule.firstBus || "-"}
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {schedule.lastBus || "-"}
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {schedule.frequency || "-"}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-md bg-muted px-3 py-1 text-xs font-medium text-foreground">
                      {schedule.status || "N/A"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSchedule?.(schedule);
                      }}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                        selectedId === schedule._id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                      }`}
                    >
                      <IoEyeOutline />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center border-t border-border p-4">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted/10"
        >
          {t("schedule_page.view_more")}
          <IoChevronDown className="text-xs" />
        </button>
      </div>
    </div>
  );
};

export default BusScheduleTable;
