import { IoChevronForward } from "react-icons/io5";

interface Departure {
  id: number;
  from: string;
  time: string;
  dueIn: string;
  isNext: boolean;
}

const departures: Departure[] = [
  {
    id: 1,
    from: "City Center",
    time: "05:30 AM",
    dueIn: "Due in 2 min",
    isNext: true,
  },
  {
    id: 2,
    from: "City Center",
    time: "05:40 AM",
    dueIn: "Due in 12 min",
    isNext: false,
  },
  {
    id: 3,
    from: "City Center",
    time: "05:50 AM",
    dueIn: "Due in 22 min",
    isNext: false,
  },
];

const NextDepartures = () => {
  return (
    <div className="border-b border-gray-100 p-5">
      {/* Section Title */}
      <h4 className="mb-4 text-sm font-bold text-gray-900">
        Next Bus Departures
      </h4>

      {/* Departure List */}
      <div className="space-y-4">
        {departures.map((departure) => (
          <div
            key={departure.id}
            className="flex items-center justify-between"
          >
            {/* Left */}
            <div className="text-sm text-gray-600">
              From{" "}
              <span className="font-semibold text-gray-900">
                {departure.from}
              </span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-medium ${
                  departure.isNext
                    ? "font-semibold text-green-600"
                    : "text-gray-900"
                }`}
              >
                {departure.time}
              </span>

              <span
                className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${
                  departure.isNext
                    ? "border-green-100 bg-green-50 text-green-700"
                    : "border-gray-200 bg-gray-50 text-gray-600"
                }`}
              >
                {departure.dueIn}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* View Timetable */}
      <button className="mt-5 flex w-full items-center justify-between text-sm font-medium text-green-600 transition hover:text-green-700">
        <span>View Full Timetable</span>

        <IoChevronForward className="text-xs" />
      </button>
    </div>
  );
};

export default NextDepartures;