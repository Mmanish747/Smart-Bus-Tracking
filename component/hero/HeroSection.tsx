'use client'
import Image from "next/image";
import { Clock, Map, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

const HeroSection = () => {
   const router = useRouter();
   const { t } = useLanguage();
   
  return (
    <section className="relative flex min-h-170 items-center overflow-hidden px-8 py-20 lg:px-16  transition-colors">
      
      <div className="absolute inset-0 -z-10 ">
        <Image
          src="/hero.png"
          alt="City with Bus"
          fill
          className="object-cover object-bottom-right opacity-90 dark:opacity-80"
          priority
        />

        <div className="absolute inset-0 bg-linear-to-r from-white/35 via-white/15 to-transparent dark:from-black/75 dark:via-black/45"></div>
      </div>

    
      <div className="max-w-2xl relative z-10">
        <h1 className="mb-4 text-5xl font-extrabold leading-tight lg:text-6xl dark:text-white">
          {t("hero.title1")}
          <br />
          <span className="text-primary">{t("hero.title2")}</span>
        </h1>

        <p className="mb-8 max-w-md text-lg leading-relaxed text-muted-foreground">
          {t("hero.subtitle")}
        </p>

      
        <div className="mb-8 flex flex-wrap gap-4">
          <button  onClick={() => router.push("/track-bus")}
           className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white hover:opacity-90">
            <Navigation size={18} />
            {t("hero.track_btn")}
          </button>

          <button  onClick={() => router.push("/routes")}
          className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-3 font-medium dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Map size={18} />
            {t("hero.routes_btn")}
          </button>
        </div>

       
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>{t("hero.live_updates")}</span>
          </div>

          <span>•</span>

          <span>{t("hero.accurate_tracking")}</span>

          <span>•</span>

          <span>{t("hero.better_commute")}</span>
        </div>
      </div>

    
      <div className="absolute bottom-10 right-10 hidden max-w-xs items-center gap-6 rounded-2xl border border-border bg-card p-5 shadow-xl lg:flex transition-colors z-10">

<section>
  <div className="mb-1 flex items-center gap-2">
    <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>

    <span className="text-xs font-bold uppercase text-primary">
      {t("hero.live_bus")}
    </span>
  </div>

  <h2 className="text-3xl font-bold text-foreground">12A</h2>

  <p className="text-xs text-muted-foreground">
    City Center → Airport
  </p>
</section>

<div className="h-12 w-px bg-border"></div>

<section>
  <p className="text-xs text-muted-foreground">{t("hero.next_stop")}</p>

  <h3 className="font-bold text-foreground">Green Street</h3>

  <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-primary">
    <Navigation size={16} />
    <span>2 min {t("hero.away")}</span>
  </div>
</section>

</div>
    </section>
  );
};

export default HeroSection;
