import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Taskative — Group Task Management Made Simple",
  description:
    "Manage tasks with your team effortlessly. Group tasks, smart reminders, templates, and real-time collaboration. Free to start.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  keywords: [
    "task management",
    "group tasks",
    "team collaboration",
    "todo app",
    "görev yönetimi",
    "ekip görev takibi",
  ],
  metadataBase: new URL("https://taskativeapp.com"),
  alternates: {
    canonical: "https://taskativeapp.com",
    languages: {
      en: "https://taskativeapp.com",
      tr: "https://taskativeapp.com/tr",
      de: "https://taskativeapp.com/de",
      es: "https://taskativeapp.com/es",
      ar: "https://taskativeapp.com/ar",
      zh: "https://taskativeapp.com/zh",
    },
  },
  openGraph: {
    title: "Taskative — Group Task Management Made Simple",
    description:
      "Manage tasks with your team effortlessly. Group tasks, smart reminders, and real-time collaboration.",
    url: "https://taskativeapp.com",
    siteName: "Taskative",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/screen-tasks.webp",
        width: 1080,
        height: 2340,
        alt: "Taskative App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Taskative — Group Task Management Made Simple",
    description:
      "Manage tasks with your team effortlessly. Free to start.",
    images: ["/images/screen-tasks.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Taskative",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Android",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Group task management app with smart reminders, templates, and real-time collaboration.",
  url: "https://taskativeapp.com",
  downloadUrl:
    "https://play.google.com/store/apps/details?id=com.taskative",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    ratingCount: "10",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
