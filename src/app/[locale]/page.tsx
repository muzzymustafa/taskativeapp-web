import { Header } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { Platforms } from "@/components/marketing/Platforms";
import { Stats } from "@/components/marketing/Stats";
import { Pricing } from "@/components/marketing/Pricing";
import { CTA } from "@/components/marketing/CTA";
import { Footer } from "@/components/marketing/Footer";
import { LanguageSwitcher } from "@/components/marketing/LanguageSwitcher";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Platforms />
        <Pricing />
        <CTA />
      </main>
      <Footer />
      <LanguageSwitcher />
    </>
  );
}
