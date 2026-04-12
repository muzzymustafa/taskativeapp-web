"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "./Logo";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-outline py-12 bg-surface-1">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo size="sm" />

          <div className="flex items-center gap-6 text-sm text-text-muted">
            <Link href="/privacy" className="hover:text-primary transition-colors" style={{ transitionDuration: 'var(--dur-1)' }}>
              {t("privacy")}
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors" style={{ transitionDuration: 'var(--dur-1)' }}>
              {t("terms")}
            </Link>
            <a href="mailto:principlesofmik@gmail.com" className="hover:text-primary transition-colors" style={{ transitionDuration: 'var(--dur-1)' }}>
              {t("contact")}
            </a>
          </div>

          <p className="text-xs text-text-dim">
            &copy; {new Date().getFullYear()} Taskative. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
