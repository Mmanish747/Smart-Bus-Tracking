"use client";

import Image from "next/image";
import {
  MapPin,
  Clock3,
  Bell,
  Smile,
} from "lucide-react";

const features = [
  {
    title: "Real-time Tracking",
    description: "Live location of buses",
    icon: MapPin,
  },
  {
    title: "Accurate Predictions",
    description: "Know when your bus arrives",
    icon: Clock3,
  },
  {
    title: "Instant Updates",
    description: "Alerts and notifications",
    icon: Bell,
  },
  {
    title: "Better Experience",
    description: "Built for commuters",
    icon: Smile,
  },
];

const AboutUsHero = () => {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center gap-8 lg:flex-row">
        {/* Left Image */}
        <div className="w-full lg:w-1/2">
          <Image
            src="/hero.png"
            alt="Smart Bus"
            width={700}
            height={450}
            className="aspect-video w-full rounded-xl object-cover shadow-sm"
          />
        </div>

        {/* Right Content */}
        <div className="w-full space-y-5 lg:w-1/2">
          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary">
              About Smart Bus
            </span>

            <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
              Smarter Journeys. Better Cities.
            </h1>
          </div>

          <p className="text-sm leading-7 text-gray-600">
            Smart Bus Tracking System is an intelligent real-time tracking
            solution designed to make public transportation more reliable,
            efficient, and user-friendly.
          </p>

          <p className="text-sm leading-7 text-gray-600">
            We empower commuters with live bus tracking, accurate arrival
            predictions, and instant updates—so you can plan better, wait less,
            and travel smarter.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-5 pt-4 sm:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="flex items-start gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-900">
                      {feature.title}
                    </h4>

                    <p className="mt-1 text-[10px] text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsHero;