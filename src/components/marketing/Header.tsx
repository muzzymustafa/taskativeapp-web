"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function Header() {
  const t = useTranslations("header");

  return (
    <header className="sticky top-0 z-50 bg-surface-1/85 backdrop-blur-xl backdrop-saturate-150 border-b border-outline">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo-icon.png"
            alt="Taskative"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="font-semibold text-lg tracking-tight text-text">
            Taskative
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-8 text-sm text-text-muted">
          <a href="#features" className="hover:text-primary transition-colors" style={{ transitionDuration: 'var(--dur-1)' }}>
            {t("features")}
          </a>
          <a href="#pricing" className="hover:text-primary transition-colors" style={{ transitionDuration: 'var(--dur-1)' }}>
            {t("pricing")}
          </a>
        </div>

        <a
          href="https://play.google.com/store/apps/details?id=com.taskative"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm"
          style={{ transitionDuration: 'var(--dur-1)' }}
        >
          {t("download")}
        </a>
      </nav>
    </header>
  );
}
