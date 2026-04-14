"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

const CHROME_STORE_URL = "https://chromewebstore.google.com/detail/iflpolhmmeknhcnmdbekogkfjjoofiop";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.taskative";

export function Platforms() {
  const t = useTranslations("platforms");

  return (
    <section id="platforms" className="py-20 sm:py-28 bg-surface-2/30">
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text mb-4" style={{ letterSpacing: "-0.3px" }}>
            {t("title")} <span className="text-primary">{t("title2")}</span>
          </h2>
          <p className="max-w-xl mx-auto text-text-2 text-lg leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* 3 platform cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* MOBILE */}
          <PlatformCard
            imageSrc="/images/screen-tasks.webp"
            imageAlt="Taskative Android app"
            imageClassName="object-contain bg-gradient-to-br from-primary/5 to-warmth/5 p-8"
            badge={{ label: "Google Play", color: "bg-primary/10 text-primary" }}
            title={t("mobile")}
            description={t("mobileDesc")}
            cta={t("mobileCta")}
            href={PLAY_STORE_URL}
            external
          />

          {/* WEB */}
          <PlatformCard
            imageSrc="/images/web-showcase.webp"
            imageAlt="Taskative web dashboard"
            imageClassName="object-cover"
            badge={{ label: "Web App", color: "bg-warmth/15 text-warmth-deep" }}
            title={t("web")}
            description={t("webDesc")}
            cta={t("webCta")}
            href="/login"
          />

          {/* EXTENSION */}
          <PlatformCard
            imageSrc="/images/extension-showcase.webp"
            imageAlt="Taskative browser extension"
            imageClassName="object-cover"
            badge={{ label: "Chrome Extension", color: "bg-info/10 text-info" }}
            title={t("extension")}
            description={t("extensionDesc")}
            cta={t("extensionCta")}
            href={CHROME_STORE_URL}
            external
          />
        </div>
      </div>
    </section>
  );
}

interface PlatformCardProps {
  imageSrc: string;
  imageAlt: string;
  imageClassName: string;
  badge: { label: string; color: string };
  title: string;
  description: string;
  cta: string;
  href: string;
  external?: boolean;
}

function PlatformCard({ imageSrc, imageAlt, imageClassName, badge, title, description, cta, href, external }: PlatformCardProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex flex-col rounded-3xl bg-surface-1 border border-outline overflow-hidden hover:border-primary/40 transition-all"
      style={{ boxShadow: "var(--shadow-1)", transitionDuration: "var(--dur-2)", transitionTimingFunction: "var(--ease)" }}
    >
      {/* Hero image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-surface-2">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className={`transition-transform duration-500 group-hover:scale-105 ${imageClassName}`}
          sizes="(max-width: 768px) 100vw, 400px"
        />
        {/* Badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${badge.color} backdrop-blur-sm`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6">
        <h3 className="text-xl font-bold text-text mb-2">{title}</h3>
        <p className="text-sm text-text-muted leading-relaxed mb-6 flex-1">{description}</p>

        {/* CTA */}
        <div className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold group-hover:gap-2.5 transition-all">
          {cta}
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </a>
  );
}
