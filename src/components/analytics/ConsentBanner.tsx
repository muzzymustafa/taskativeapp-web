"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { GA_ID, getConsent, setConsent, type Consent } from "@/lib/analytics";

export function ConsentBanner() {
  const [consent, setConsentState] = useState<Consent>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsentState(getConsent());
    const handler = () => setConsentState(getConsent());
    window.addEventListener("taskative:consent_change", handler);
    return () => window.removeEventListener("taskative:consent_change", handler);
  }, []);

  if (!mounted) return null;

  const showGA = consent === "granted" && GA_ID;
  const showBanner = consent === null;

  return (
    <>
      {showGA && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_ID}', { anonymize_ip: true });`}
          </Script>
        </>
      )}

      {showBanner && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-[60] bg-surface-1 border border-outline rounded-2xl p-4 shadow-2xl"
          style={{ boxShadow: "var(--shadow-3)" }}
        >
          <p className="text-sm text-text-2 leading-relaxed mb-3">
            We use analytics cookies to understand how the site is used and improve it.
            No ads, no third-party tracking.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConsent("granted")}
              className="flex-1 px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
              style={{ transitionDuration: "var(--dur-1)" }}
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => setConsent("denied")}
              className="flex-1 px-4 py-2 rounded-full border border-outline-strong text-text-muted text-sm font-medium hover:border-primary hover:text-primary transition-colors"
              style={{ transitionDuration: "var(--dur-1)" }}
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </>
  );
}
