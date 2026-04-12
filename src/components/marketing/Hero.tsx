"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary-light rounded-full blur-[120px] opacity-60 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-2 border border-outline text-sm text-text-muted mb-8">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            {t("badge")}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text leading-[1.1] mb-6" style={{ letterSpacing: '-0.5px' }}>
            {t("title1")}
            <br />
            <span className="text-primary">{t("title2")}</span>
          </h1>

          <p className="max-w-xl mx-auto text-lg sm:text-xl text-text-2 leading-relaxed mb-10">
            {t("subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
              {t("cta")}
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-outline-strong text-text-2 font-medium text-base hover:border-primary hover:text-primary transition-all"
              style={{ transitionDuration: 'var(--dur-1)' }}
            >
              {t("seeFeatures")}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-text-muted">
            <div className="flex items-center gap-1.5">
              <span className="text-warmth">★★★★★</span>
              <span>{t("stars")}</span>
            </div>
            <div className="w-px h-4 bg-outline hidden sm:block" />
            <div>{t("languages")}</div>
            <div className="w-px h-4 bg-outline hidden sm:block" />
            <div className="hidden sm:block">{t("free")}</div>
          </div>
        </div>

        <div className="flex items-end justify-center gap-4 sm:gap-6 max-w-3xl mx-auto">
          <div className="hidden sm:block w-48 rounded-2xl overflow-hidden border border-outline opacity-80 -rotate-3" style={{ boxShadow: 'var(--shadow-2)' }}>
            <Image src="/images/screen-teams.webp" alt="Team collaboration" width={400} height={800} className="w-full h-auto" />
          </div>
          <div className="w-56 sm:w-64 rounded-2xl overflow-hidden border border-outline relative z-10" style={{ boxShadow: 'var(--shadow-3)' }}>
            <Image src="/images/screen-tasks.webp" alt="Task management" width={400} height={800} className="w-full h-auto" priority />
          </div>
          <div className="hidden sm:block w-48 rounded-2xl overflow-hidden border border-outline opacity-80 rotate-3" style={{ boxShadow: 'var(--shadow-2)' }}>
            <Image src="/images/screen-notifications.webp" alt="Smart notifications" width={400} height={800} className="w-full h-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
