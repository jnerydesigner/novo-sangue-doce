import { cookies } from "next/headers";
import { api } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { SiteHeader } from "./site-header";

export async function PublicSiteHeader({ opaque = false }: { opaque?: boolean } = {}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const profile = accessToken ? await api.auth.profile(accessToken).catch(() => null) : null;

  return <SiteHeader isAuthenticated={Boolean(profile)} opaque={opaque} position="sticky" profile={profile} />;
}
