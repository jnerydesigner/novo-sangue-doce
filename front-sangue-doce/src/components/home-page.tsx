import type { Measurement } from "@/lib/api";
import { EditorialSection } from "./home/editorial-section";
import { GlucoseEntrySection } from "./home/glucose-entry-section";
import { GuidesSection } from "./home/guides-section";
import { HeroSection } from "./home/hero-section";
import { NewsletterSection } from "./home/newsletter-section";
import { SiteFooter } from "./home/site-footer";
import { SiteHeader } from "./home/site-header";

type HomePageProps = {
  isAuthenticated: boolean;
  recentReadings: Measurement[];
};

export function HomePage({ isAuthenticated, recentReadings }: HomePageProps) {
  const glucoseEntryKey = `${isAuthenticated}-${recentReadings.map((reading) => reading.id).join("-")}`;

  return (
    <>
      <SiteHeader isAuthenticated={isAuthenticated} />
      <main>
        <HeroSection />
        <EditorialSection />
        <GlucoseEntrySection
          isAuthenticated={isAuthenticated}
          key={glucoseEntryKey}
          recentReadings={recentReadings}
        />
        <GuidesSection />
        <NewsletterSection />
      </main>
      <SiteFooter />
    </>
  );
}
