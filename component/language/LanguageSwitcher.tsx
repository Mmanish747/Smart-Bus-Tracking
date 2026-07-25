'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-md text-sm ${
          language === 'en'
            ? 'bg-primary text-white'
            : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
        }`}
      >
        English
      </button>

      <button
        onClick={() => setLanguage('ne')}
        className={`px-3 py-1 rounded-md text-sm ${
          language === 'ne'
            ? 'bg-primary text-white'
            : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
        }`}
      >
        नेपाली
      </button>
    </div>
  );
}