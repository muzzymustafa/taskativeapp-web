"use client";

import { useTranslations } from "next-intl";

export function Pricing() {
  const t = useTranslations("pricing");

  const plans = [
    {
      name: t("free"),
      price: "$0",
      period: t("forever"),
      description: t("freeDesc"),
      features: [
        t("tasksPerMonth"), t("groups3"), t("templates3"),
        t("calendarView"), t("basicReminders"), t("homeWidget"),
      ],
      limitations: [t("noAdvancedReminders"), t("noActivityLogs"), t("archiveDays")],
      cta: t("startFree"),
      highlight: false,
    },
    {
      name: t("pro"),
      price: "$2.99",
      period: t("perMonth"),
      description: t("proDesc"),
      features: [
        t("unlimitedTasks"), t("unlimitedGroups"), t("unlimitedTemplates"),
        t("advancedReminders"), t("activityLogs"), t("notificationSettings"),
        t("unlimitedArchive"), t("prioritySupport"),
      ],
      limitations: [],
      cta: t("goPro"),
      highlight: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-surface-2/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text mb-4" style={{ letterSpacing: '-0.3px' }}>
            {t("title1")} <span className="text-warmth">{t("title2")}</span> {t("title3")}
          </h2>
          <p className="max-w-lg mx-auto text-text-2 text-lg leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl border transition-all ${
                plan.highlight ? "bg-surface-1 border-primary/40" : "bg-surface-1 border-outline"
              }`}
              style={{ boxShadow: plan.highlight ? 'var(--shadow-2)' : 'var(--shadow-1)', transitionDuration: 'var(--dur-2)' }}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-xs font-semibold">
                  {t("popular")}
                </div>
              )}

              <h3 className="text-xl font-bold text-text mb-1">{plan.name}</h3>
              <p className="text-sm text-text-dim mb-6">{plan.description}</p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className={`text-4xl font-extrabold tracking-tight ${plan.highlight ? "text-primary" : "text-text"}`} style={{ letterSpacing: '-0.5px' }}>
                  {plan.price}
                </span>
                <span className="text-text-dim text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <svg className="w-5 h-5 text-success shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-text-2">{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation) => (
                  <li key={limitation} className="flex items-start gap-3 text-sm">
                    <svg className="w-5 h-5 text-text-dim shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-text-dim">{limitation}</span>
                  </li>
                ))}
              </ul>

              <a
                href="https://play.google.com/store/apps/details?id=com.taskative"
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center py-3.5 rounded-full font-semibold text-sm transition-colors ${
                  plan.highlight ? "bg-primary text-white hover:bg-primary-hover" : "bg-surface-3 text-text hover:bg-outline-strong"
                }`}
                style={{ transitionDuration: 'var(--dur-1)' }}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
