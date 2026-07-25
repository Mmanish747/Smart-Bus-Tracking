"use client";

import Image from "next/image";
import { MapPin, Clock, Bell } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface AuthLeftPanelProps {
  heading: React.ReactNode;
  description: string;
  features: Feature[];
}

function BusIllustration() {
  return (
    <div className="relative my-8 flex justify-center">
      <div className="relative w-full max-w-md">
        {/* Sky / Background */}
        <div className="absolute inset-x-0 top-0 h-48 rounded-3xl bg-gradient-to-b from-green-100 via-green-50 to-transparent" />

        {/* Trees */}
        <div className="absolute bottom-24 left-4 text-3xl opacity-60">🌳</div>
        <div className="absolute bottom-28 left-14 text-2xl opacity-40">🌲</div>
        <div className="absolute bottom-24 right-8 text-3xl opacity-60">🌳</div>
        <div className="absolute bottom-28 right-20 text-2xl opacity-40">🌲</div>

        {/* Road */}
        <div className="absolute bottom-16 inset-x-0 h-3 rounded-full bg-gray-300" />
        <div className="absolute bottom-[67px] inset-x-8 h-[2px] border-t-2 border-dashed border-gray-400" />

        {/* Bus */}
        <div className="relative z-10 mx-auto w-64">
          <div className="rounded-3xl bg-gradient-to-br from-primary to-green-600 p-6 shadow-2xl shadow-green-200">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl">
                🚌
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">SmartBus</h4>
                <p className="text-xs text-green-100">Live Tracking Active</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              <span className="text-xs font-medium text-white">City Center → Airport • On Time</span>
            </div>
          </div>
        </div>

        {/* Bus Stop */}
        <div className="absolute bottom-20 right-6 z-20 flex flex-col items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs text-white">🚏</div>
          <div className="h-6 w-0.5 bg-gray-400" />
        </div>
      </div>
    </div>
  );
}

export default function AuthLeftPanel({ heading, description, features }: AuthLeftPanelProps) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-white to-green-50/80 p-10 lg:p-12">
      {/* Decorative circles */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-100/40" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-green-100/30" />

      <div className="relative z-10">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-xl">
            🚌
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">SmartBus</h1>
            <p className="text-xs text-gray-500">Tracking System</p>
          </div>
        </div>

        {/* Heading */}
        <h2 className="mb-3 text-3xl font-extrabold leading-tight text-gray-900 lg:text-4xl">
          {heading}
        </h2>

        {/* Description */}
        <p className="max-w-md text-base leading-relaxed text-gray-500">
          {description}
        </p>
      </div>

      {/* Bus Illustration */}
      <BusIllustration />

      {/* Feature cards */}
      <div className="relative z-10 grid grid-cols-3 gap-3">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-green-100 bg-white/70 p-4 backdrop-blur-sm"
          >
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-primary">
              {feature.icon}
            </div>
            <h4 className="text-xs font-bold text-gray-900">{feature.title}</h4>
            <p className="mt-0.5 text-[11px] leading-tight text-gray-500">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
