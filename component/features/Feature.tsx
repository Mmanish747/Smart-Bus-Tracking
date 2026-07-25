'use client';

import {
  MapPin,
  Route,
  Clock3,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const Feature = () => {
  const { t } = useLanguage();

  const features = [
    {
      title: t('features.live_tracking.title'),
      description: t('features.live_tracking.description'),
      icon: MapPin,
    },
    {
      title: t('features.route_information.title'),
      description: t('features.route_information.description'),
      icon: Route,
    },
    {
      title: t('features.bus_schedule.title'),
      description: t('features.bus_schedule.description'),
      icon: Clock3,
    },
    {
      title: t('features.notifications.title'),
      description: t('features.notifications.description'),
      icon: Bell,
    },
    {
      title: t('features.safe_reliable.title'),
      description: t('features.safe_reliable.description'),
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-2">
      <section className="w-full py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="flex gap-4 p-5 bg-card rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-blue-100 dark:bg-primary/20 p-3 rounded-lg h-fit">
                  <Icon className="w-6 h-6 text-primary" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
};

export default Feature;