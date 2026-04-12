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
  openGraph: {
    title: "Taskative — Group Task Management Made Simple",
    description:
      "Manage tasks with your team effortlessly. Group tasks, smart reminders, and real-time collaboration.",
    url: "https://taskativeapp.com",
    siteName: "Taskative",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taskative — Group Task Management Made Simple",
    description:
      "Manage tasks with your team effortlessly. Free to start.",
  },
  robots: {
    index: true,
    follow: true,
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
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
