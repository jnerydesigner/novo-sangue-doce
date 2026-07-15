import type { AuthProfile, Measurement, Recipe } from "@/lib/api";
import { EditorialSection } from "./home/editorial-section";
import { GlucoseEntrySection } from "./home/glucose-entry-section";
import { GuidesSection } from "./home/guides-section";
import { HeroSection } from "./home/hero-section";
import { NewsletterSection } from "./home/newsletter-section";
import { RecipesCarouselSection } from "./home/recipes-carousel-section";
import { SiteFooter } from "./home/site-footer";
import { SiteHeader } from "./home/site-header";

type HomePageProps = {
  isAuthenticated: boolean;
  profile: AuthProfile | null;
  recentReadings: Measurement[];
  recipes: Recipe[];
};

export function HomePage({
  isAuthenticated,
  profile,
  recentReadings,
  recipes,
}: HomePageProps) {
  const glucoseEntryKey = `${isAuthenticated}-${recentReadings.map((reading) => reading.id).join("-")}`;

  return (
    <>
      <SiteHeader isAuthenticated={isAuthenticated} profile={profile} />
      <main>
        <HeroSection />
        <EditorialSection />
        <RecipesCarouselSection recipes={recipes} />

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
