import { cookies } from "next/headers";
import { api } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { HomePage } from "../components/home-page";

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

  return <HomePage isAuthenticated={Boolean(profile)} recentReadings={recentReadings} />;
}
