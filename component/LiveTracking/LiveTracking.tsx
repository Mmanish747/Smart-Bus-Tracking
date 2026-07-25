'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import RouteSidebar from './RouteSidebar';
import { useLiveTracking } from '@/hooks/useLiveTracking';
import { NamedStop, fetchStopsByRoute } from '@/utils/api';
import { useLanguage } from '@/context/LanguageContext';

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-2xl bg-gray-100 animate-pulse lg:w-2/3" />
  ),
});

const LiveTracking = () => {
  const { t } = useLanguage();
  const { routes, loadingRoutes, trackingByRouteId } = useLiveTracking();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [namedStops, setNamedStops] = useState<NamedStop[]>([]);

  const sidebarRoutes = useMemo(() => {
    return routes.map((r, idx) => {
      const tracking = trackingByRouteId.get(r._id);

      return {
        number: r.routeNo,
        route: `${r.from} → ${r.to}`,
        frequency: `Every ${r.frequency}`,
        status: tracking?.status || r.status,
        color: r.color || 'bg-primary text-white',
        active: idx === selectedIndex,
        hasTracking: !!tracking,
      };
    });
  }, [routes, selectedIndex, trackingByRouteId]);

  const activeRoute = routes[selectedIndex];
  const activeRouteCoords = activeRoute?.pathCoordinates || [];
  const activeTracking = activeRoute
    ? trackingByRouteId.get(activeRoute._id)
    : undefined;

  useEffect(() => {
    if (!activeRoute?._id) return;

    fetchStopsByRoute(activeRoute._id)
      .then((data) => {
        setNamedStops(data?.stops || []);
      })
      .catch(console.error);
  }, [activeRoute?._id]);

  const mapCenter: [number, number] | undefined = activeTracking
    ? [activeTracking.latitude, activeTracking.longitude]
    : activeRouteCoords.length > 0
    ? activeRouteCoords[0]
    : undefined;

  return (
    <section className="bg-surface py-12 transition-colors">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            {loadingRoutes ? (
              <div className="flex h-[600px] w-full items-center justify-center rounded-2xl bg-card shadow-md lg:w-1/3 animate-pulse">
                <span className="text-gray-500 font-medium">
                  {t('common.loading')}
                </span>
              </div>
            ) : (
              <RouteSidebar
                routes={sidebarRoutes}
                title={t('tracking.title')}
                description={t('tracking.subtitle')}
                showSearch={true}
                onSelect={setSelectedIndex}
              />
            )}
          </div>

          <div className="lg:col-span-2 min-w-0 h-[600px]">
            <MapView
              center={mapCenter}
              routeCoordinates={activeRouteCoords}
              namedStops={namedStops}
              routeLabel={
                activeRoute
                  ? `${activeRoute.from} → ${activeRoute.to}`
                  : undefined
              }
              showBus={!!activeTracking}
              busPosition={
                activeTracking
                  ? [activeTracking.latitude, activeTracking.longitude]
                  : undefined
              }
              busName={activeTracking?.bus?.busNumber || 'Bus'}
              speed={activeTracking?.speed}
              eta={activeTracking?.eta}
              nextStop={activeTracking?.nextStop}
              stopETAs={activeTracking?.stopETAs}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveTracking;