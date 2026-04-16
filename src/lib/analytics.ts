export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export const CONSENT_KEY = "taskative_consent_v1";

export type Consent = "granted" | "denied" | null;

export type DownloadSource =
  | "hero"
  | "header"
  | "cta"
  | "platforms"
  | "footer"
  | "guide"
  | "one-pager"
  | "login";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function getConsent(): Consent {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === "granted" || v === "denied" ? v : null;
}

export function setConsent(value: "granted" | "denied"): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new Event("taskative:consent_change"));
}

export function trackDownload(source: DownloadSource): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "click_download", { source });
}
