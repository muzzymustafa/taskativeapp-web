"use client";

import { useTranslations } from "next-intl";

export function Stats() {
  const t = useTranslations("stats");

  const stats = [
    { value: "50+", label: t("tasks"), color: "text-primary" },
    { value: "6", label: t("languages"), color: "text-warmth" },
    { value: "0", label: t("ads"), color: "text-success" },
  ];

  return (
    <section className="py-14 border-y border-outline">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-3 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${stat.color}`} style={{ letterSpacing: '-0.5px' }}>
                {stat.value}
              </div>
              <div className="mt-1.5 text-xs sm:text-sm uppercase tracking-wider text-text-dim font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
