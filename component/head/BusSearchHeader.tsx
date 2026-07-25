"use client";

import { useState } from "react";
import { Search, ChevronDown, Map } from "lucide-react";
import type { RouteData } from "@/utils/api";

type SearchProps = {
  searchTitle?: string;
  tileFirst?: string;
  firstOption?: string;
  titleSecond?: string;
  secondOption?: string;
  routes?: RouteData[];
  onSearch?: (query: string) => void;
  onRouteFilter?: (route: string) => void;
  onViewMap?: () => void;
};

const BusSearchHeader = ({
  searchTitle = "Search Bus / Stop",
  tileFirst = "Select Route",
  firstOption = "All Routes",
  titleSecond = "Direction",
  secondOption = "All Directions",
  routes = [],
  onSearch,
  onRouteFilter,
  onViewMap,
}: SearchProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(firstOption);
  const [selectedDirection, setSelectedDirection] = useState(secondOption);

  const hasDynamicRoutes = onRouteFilter && routes.length > 0;

  const routeOptions = hasDynamicRoutes
    ? [
        firstOption,
        ...routes.map((r) => `${r.routeNo} - ${r.from} → ${r.to}`),
      ]
    : [firstOption, "Route 12A", "Route 7B", "Route 9C"];

  const directionOptions = hasDynamicRoutes
    ? [
        secondOption,
        ...routes.map((r) => `${r.from} → ${r.to}`),
        ...routes.map((r) => `${r.to} → ${r.from}`),
      ]
    : [secondOption, "City Center → Airport", "Airport → City Center"];

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleRouteChange = (value: string) => {
    setSelectedRoute(value);
    if (onRouteFilter) {
      if (value === firstOption) {
        onRouteFilter("All Routes");
      } else {
        const routeNo = value.split(" - ")[0];
        onRouteFilter(routeNo);
      }
    }
  };

  const handleDirectionChange = (value: string) => {
    setSelectedDirection(value);
    if (value !== secondOption) {
      onSearch?.(value);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col items-end gap-4 lg:flex-row">
        <div className="w-full flex-1">
          <label className="mb-2 block text-sm font-medium text-gray-800">
            {searchTitle}
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Enter bus number or stop name"
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-4 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="w-full lg:w-52">
          <label className="mb-2 block text-sm font-medium text-gray-800">
            {tileFirst}
          </label>
          <div className="relative">
            <select
              value={selectedRoute}
              onChange={(e) => handleRouteChange(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {routeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="w-full lg:w-52">
          <label className="mb-2 block text-sm font-medium text-gray-800">
            {titleSecond}
          </label>
          <div className="relative">
            <select
              value={selectedDirection}
              onChange={(e) => handleDirectionChange(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {directionOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <button
          onClick={() => onViewMap?.()}
          className="flex h-10.5 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-white transition hover:bg-green-700 lg:w-auto"
        >
          <Map className="h-4 w-4" />
          View on Map
        </button>
      </div>
    </div>
  );
};

export default BusSearchHeader;
