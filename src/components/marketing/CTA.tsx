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

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
              <a
                href="https://play.google.com/store/apps/details?id=com.taskative"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors"
                style={{ boxShadow: '0 4px 20px rgba(46, 139, 52, 0.25)', transitionDuration: 'var(--dur-2)' }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 0 1 0 1.38l-2.302 2.302L15.395 13l2.302-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z" />
                </svg>
                {t("button")}
              </a>
              <a
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-outline-strong text-text-2 font-medium text-sm hover:border-primary hover:text-primary transition-all"
                style={{ transitionDuration: 'var(--dur-1)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                </svg>
                Open Web App
              </a>
              <a
                href="https://chromewebstore.google.com/detail/iflpolhmmeknhcnmdbekogkfjjoofiop"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-outline-strong text-text-2 font-medium text-sm hover:border-primary hover:text-primary transition-all"
                style={{ transitionDuration: 'var(--dur-1)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.369 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.659-.663 47.703 47.703 0 00-.31-4.82M16.5 10.5h.008v.008H16.5V10.5z" />
                </svg>
                {t("installExtension")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
