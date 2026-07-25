"use client";

import { useState } from "react";
import { IoChevronForward } from "react-icons/io5";

const scheduleDays = [
  {
    id: 1,
    label: "Today, May 31",
  },
  {
    id: 2,
    label: "Sun, Jun 1",
  },
  {
    id: 3,
    label: "Mon, Jun 2",
  },
  {
    id: 4,
    label: "Tue, Jun 3",
  },
  {
    id: 5,
    label: "Wed, Jun 4",
  },
  {
    id: 6,
    label: "Thu, Jun 5",
  },
  {
    id: 7,
    label: "Fri, Jun 6",
  },
];

const ScheduleDay = () => {
  const [activeDay, setActiveDay] = useState(1);

  const handleDayClick = (id: number) => {
    setActiveDay(id);
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-2">
      <div className="flex gap-1 overflow-x-auto">
        {scheduleDays.map((day) => (
          <button
            key={day.id}
            onClick={() => handleDayClick(day.id)}
            className={`whitespace-nowrap rounded-lg px-5 py-2 text-sm font-medium transition-colors duration-200 ${
              activeDay === day.id
                ? "bg-green-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      <button className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100">
        <IoChevronForward className="text-sm" />
      </button>
    </div>
  );
};

export default ScheduleDay;