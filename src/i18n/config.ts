export const locales = ['en', 'tr', 'de', 'es', 'ar', 'zh'] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number];
