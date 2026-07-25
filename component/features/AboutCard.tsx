"use client";

import {
  Target,
  Eye,
  Gem,
  CircleCheck,
} from "lucide-react";

const aboutCards = [
  {
    title: "Our Mission",
    description:
      "To revolutionize public transportation through innovative technology and data-driven solutions, making every commute safer, easier, and smarter.",
    icon: Target,
    bgColor: "bg-green-50",
    iconColor: "text-primary",
  },
  {
    title: "Our Vision",
    description:
      "To build a connected transportation ecosystem where real-time information empowers people and contributes to smarter, sustainable cities.",
    icon: Eye,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    title: "Our Values",
    icon: Gem,
    bgColor: "bg-purple-50",
    iconColor: "text-purple-500",
    values: [
      "Customer First",
      "Transparency",
      "Innovation",
      "Sustainability",
      "Reliability",
      "Teamwork",
    ],
  },
];

const AboutCards = () => {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {aboutCards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className={`rounded-2xl border border-gray-200 p-6 ${card.bgColor}`}
          >
           
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>

              <h3 className="text-lg font-bold text-gray-900">
                {card.title}
              </h3>
            </div>

          
            {card.description && (
              <p className="text-sm leading-7 text-gray-600">
                {card.description}
              </p>
            )}

           
            {card.values && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-3 text-sm text-gray-600">
                {card.values.map((value) => (
                  <div
                    key={value}
                    className="flex items-center gap-2"
                  >
                    <CircleCheck className="h-4 w-4 text-purple-500" />

                    <span>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};

export default AboutCards;