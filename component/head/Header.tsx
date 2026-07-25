
"use client";

import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/component/ui/ThemeToggle";
import LanguageSwitcher from "@/component/ui/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import PublicActions from "./HeaderActions/PublicActions";

const Header = () => {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-9999 flex items-center justify-between border-b border-border bg-background px-6 py-4 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Image
            src="/Logo.png"
            alt="Smart Bus Logo"
            width={24}
            height={24}
            className="h-6 w-6"
            priority
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold leading-tight dark:text-white">
            <span className="text-primary">Smart </span>
            <span className="text-primary">Bus</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tracking System
          </p>
        </div>
      </div>
   
      <nav className="hidden items-center gap-8 lg:flex">
        <Link
          href="/"
          className="border-primary text-primary border-b-2 pb-1 font-medium"
        >
          {t("nav.home")}
        </Link>
        <Link
          href="/track-bus"
          className="text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          {t("nav.track_bus")}
        </Link>
        <Link
          href="/routes"
          className="text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          {t("nav.routes")}
        </Link>
        <Link
          href="/schedule"
          className="text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          {t("nav.schedule")}
        </Link>
        <Link
          href="/notifications"
          className="text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          {t("nav.notifications")}
        </Link>
        <Link
          href="/about"
          className="text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          {t("nav.about")}
        </Link>
      </nav>
      
      <div className="flex items-center gap-4">
        <PublicActions/>
      </div>
    </header>
  );
};

export default Header;