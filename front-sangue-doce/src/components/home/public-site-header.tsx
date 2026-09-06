import { getCurrentAuth } from "@/lib/current-auth";
import { SiteHeader } from "./site-header";

export async function PublicSiteHeader({ opaque = false }: { opaque?: boolean } = {}) {
  const { profile } = await getCurrentAuth();

  return (
    <SiteHeader
      isAuthenticated={Boolean(profile)}
      opaque={opaque}
      position="sticky"
      profile={profile}
    />
  );
}
