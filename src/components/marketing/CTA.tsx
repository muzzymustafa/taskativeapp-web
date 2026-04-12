"use client";

import { useTranslations } from "next-intl";

export function CTA() {
  const t = useTranslations("cta");

  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div
          className="relative overflow-hidden rounded-3xl bg-surface-1 border border-outline p-12 sm:p-16 text-center"
          style={{ boxShadow: 'var(--shadow-2)' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary-light rounded-full blur-[100px] opacity-80 pointer-events-none" />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text mb-4" style={{ letterSpacing: '-0.3px' }}>
              {t("title")}
            </h2>
            <p className="max-w-md mx-auto text-text-2 text-lg mb-8 leading-relaxed">
              {t("subtitle")}
            </p>

            <a
              href="https://play.google.com/store/apps/details?id=com.taskative"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-white font-semibold text-base hover:bg-primary-hover transition-colors"
              style={{ boxShadow: '0 4px 20px rgba(46, 139, 52, 0.25)', transitionDuration: 'var(--dur-2)' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 0 1 0 1.38l-2.302 2.302L15.395 13l2.302-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z" />
              </svg>
              {t("button")}
            </a>

            <p className="mt-6 text-sm text-text-dim">{t("webAppSoon")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
