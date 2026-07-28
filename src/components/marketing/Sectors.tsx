"use client";

import { useTranslations } from "next-intl";

const sectorIcons = [
  // storefront — retail & hospitality
  <svg key="retail" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>,
  // sparkle-broom — cleaning & facility
  <svg key="cleaning" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>,
  // wrench — maintenance & technical
  <svg key="maintenance" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>,
  // briefcase — agencies
  <svg key="agency" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.075c0 1.313-.938 2.44-2.234 2.643a60.108 60.108 0 01-12.032 0c-1.296-.203-2.234-1.33-2.234-2.643V14.15M16.5 6.75V5.25a2.25 2.25 0 00-2.25-2.25h-4.5A2.25 2.25 0 007.5 5.25v1.5M2.25 10.5v.75c0 .414.336.75.75.75h18a.75.75 0 00.75-.75v-.75a3.75 3.75 0 00-3.75-3.75H6a3.75 3.75 0 00-3.75 3.75z" /></svg>,
  // truck — logistics & field ops
  <svg key="logistics" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
  // home — households & study groups
  <svg key="home" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
];

const sectorKeys = [
  { key: "retail", chips: ["chipTemplates", "chipCalendar"] },
  { key: "cleaning", chips: ["chipRecurring", "chipChecklists"] },
  { key: "maintenance", chips: ["chipComments", "chipReminders"] },
  { key: "agency", chips: ["chipGroups", "chipTimeline"] },
  { key: "logistics", chips: ["chipOffline", "chipWidget"] },
  { key: "household", chips: ["chipGroups", "chipReminders"] },
];

export function Sectors() {
  const t = useTranslations("sectors");

  return (
    <section id="sectors" className="py-20 sm:py-28 bg-surface-2/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text mb-4" style={{ letterSpacing: '-0.3px' }}>
            {t("title1")}{" "}
            <span className="text-warmth">{t("title2")}</span>
          </h2>
          <p className="max-w-xl mx-auto text-text-2 text-lg leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectorKeys.map((sector, i) => (
            <div
              key={sector.key}
              className="group flex flex-col p-6 rounded-2xl bg-surface-1 border border-outline hover:border-warmth/40 transition-all"
              style={{ boxShadow: 'var(--shadow-1)', transitionDuration: 'var(--dur-2)', transitionTimingFunction: 'var(--ease)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-warmth-soft flex items-center justify-center text-warmth-deep shrink-0 group-hover:scale-105 transition-transform" style={{ transitionDuration: 'var(--dur-2)' }}>
                  {sectorIcons[i]}
                </div>
                <h3 className="text-base font-semibold text-text">{t(sector.key)}</h3>
              </div>

              <p className="text-sm text-text-muted leading-relaxed mb-5 flex-1">
                {t(`${sector.key}Desc`)}
              </p>

              <div className="flex flex-wrap gap-2">
                {sector.chips.map((chip) => (
                  <span
                    key={chip}
                    className="px-2.5 py-1 rounded-full bg-surface-3 text-text-2 text-xs font-medium"
                  >
                    {t(chip)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-text-dim mt-10">
          {t("footnote")}
        </p>
      </div>
    </section>
  );
}
