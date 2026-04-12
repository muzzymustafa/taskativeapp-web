"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

const languages = [
  { code: "en", label: "EN" },
  { code: "tr", label: "TR" },
  { code: "de", label: "DE" },
  { code: "es", label: "ES" },
  { code: "ar", label: "عر" },
  { code: "zh", label: "中" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/").filter(Boolean);
    const currentLocaleInPath = languages.some((l) => l.code === segments[0]);
    if (currentLocaleInPath) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    const newPath = newLocale === "en" ? "/" : `/${newLocale}`;
    router.push(newPath);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-surface-1 border border-outline" style={{ boxShadow: 'var(--shadow-2)' }}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => switchLocale(lang.code)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
              locale === lang.code
                ? "bg-primary text-white"
                : "text-text-muted hover:text-text hover:bg-surface-2"
            }`}
            style={{ transitionDuration: 'var(--dur-1)' }}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
