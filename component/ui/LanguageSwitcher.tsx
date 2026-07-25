"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage("en")}
        className={`rounded-md px-2 py-1 text-xs font-semibold ${
          language === "en"
            ? "bg-primary text-white"
            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        } transition-colors`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("ne")}
        className={`rounded-md px-2 py-1 text-xs font-semibold ${
          language === "ne"
            ? "bg-primary text-white"
            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        } transition-colors`}
      >
        ने
      </button>
    </div>
  );
}
