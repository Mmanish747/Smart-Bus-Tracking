"use client";
import { Smartphone, Users, Earth, ShieldCheck, Bell } from "lucide-react";
import { useEffect } from "react";
import { Marker, Polyline, Popup, TileLayer, MapContainer } from "react-leaflet";
import L from "leaflet";
import { useLanguage } from "@/context/LanguageContext";

import { initLeafletIcons } from "@/utils/leaflet";

const features = [
  {
    title: "why_choose.save_time.title",
    description: "why_choose.save_time.description",
    icon: Smartphone,
  },
  {
    title: "why_choose.travel_smart.title",
    description: "why_choose.travel_smart.description",
    icon: Users,
  },
  {
    title: "why_choose.eco_friendly.title",
    description: "why_choose.eco_friendly.description",
    icon: Earth,
  },
  {
    title: "why_choose.secure_reliable.title",
    description: "why_choose.secure_reliable.description",
    icon: ShieldCheck,
  },
];

const WhyChoose = () => {
  const { t } = useLanguage();

  useEffect(() => {
    initLeafletIcons();
  }, []);
  return (
    <section className="py-20 px-6 lg:px-16 bg-background text-foreground relative transition-colors">
      <div className="mx-auto flex flex-col lg:flex-row items-center gap-16">
       
        <div className="w-full lg:w-1/2 p-10">
          <h2 className="text-3xl lg:text-4xl font-bold mb-2 dark:text-primary">
            {t("why_choose.title")}
          </h2>

          <div className="w-16 h-1 bg-primary mb-10"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold mb-2 dark:text-primary">
                      {t(feature.title)}
                    </h4>

                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {t(feature.description)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

       
        <div className="w-full lg:w-1/2 flex justify-center relative">
          <div className="relative w-75 h-137.5 overflow-visible">
           
            <div className="absolute inset-0 bg-white rounded-[40px] border-8 border-gray-900 shadow-2xl overflow-visible">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl"></div>

              <div className="relative h-full bg-gray-100">
              
                <MapContainer
                  center={[27.7172, 85.324]}
                  zoom={14}
                  zoomControl={false}
                  dragging={false}
                  scrollWheelZoom={false}
                  doubleClickZoom={false}
                  touchZoom={false}
                  keyboard={false}
                  attributionControl={false}
                  className="h-full w-full"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                  <Polyline
                    positions={[
                      [27.7172, 85.324],
                      [27.7205, 85.329],
                      [27.724, 85.334],
                    ]}
                    pathOptions={{
                      color: "#22c55e", 
                      weight: 5,
                    }}
                  />

                  <Marker position={[27.724, 85.334]}>
                    <Popup>Bus 12A</Popup>
                  </Marker>
                </MapContainer>

                <div className="absolute top-12 left-4 right-4 z-20 rounded-xl bg-white p-4 shadow-md">
                  <h3 className="text-xl font-bold">12A</h3>

                  <p className="text-xs text-gray-500 border-b pb-3 mb-3">
                    City Center → Airport
                  </p>

                  <p className="text-[10px] text-gray-500">Next Stop</p>

                  <h4 className="text-sm font-bold">Green Street</h4>

                  <p className="text-primary text-xs font-semibold">
                    2 min away
                  </p>
                </div>
              </div>
            </div>

           
            <div className="absolute top-24 -right-10 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-xl">
              <Bell className="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
