import type { Metadata } from "next";
import { cookies } from "next/headers";
import { JsonLd } from "@/components/json-ld";
import { api } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { buildWebsiteJsonLd, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import { HomePage } from "../components/home-page";

export const metadata: Metadata = {
  title: `${SITE_NAME} | Cuidado diário para viver melhor com diabetes`,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_NAME} | Cuidado diário para viver melhor com diabetes`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    type: "website",
  },
};

export default async function Page() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const profile = accessToken ? await api.auth.profile(accessToken).catch(() => null) : null;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const recentReadings =
    accessToken && profile
      ? await api.measurements
          .today({ accessToken, timeZone })
          .then((measurements) => measurements.slice(0, 4))
          .catch(() => [])
      : [];

  return (
    <>
      <JsonLd data={buildWebsiteJsonLd()} />
      <HomePage
        isAuthenticated={Boolean(profile)}
        profile={profile}
        recentReadings={recentReadings}
      />
    </>
  );
}
