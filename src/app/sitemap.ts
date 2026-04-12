import type { MetadataRoute } from "next";

const locales = ["en", "tr", "de", "es", "ar", "zh"];
const baseUrl = "https://taskativeapp.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/privacy", "/terms"];

  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    // Default locale (en) — no prefix
    entries.push({
      url: `${baseUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: page === "" ? "weekly" : "monthly",
      priority: page === "" ? 1 : 0.5,
      alternates: {
        languages: Object.fromEntries(
          locales.map((locale) => [
            locale,
            locale === "en" ? `${baseUrl}${page}` : `${baseUrl}/${locale}${page}`,
          ])
        ),
      },
    });
  }

  return entries;
}
