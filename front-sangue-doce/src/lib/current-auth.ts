import { cookies } from "next/headers";
import { api } from "./api";
import { AUTH_COOKIE_NAME } from "./auth-cookie";
import { getBetterAuthProfile } from "./better-auth-server";

function serializeCookies(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

export async function getCurrentAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
  const cookieHeader = serializeCookies(cookieStore);
  const betterAuthProfile = await getBetterAuthProfile(cookieHeader).catch(() => null);
  const legacyProfile = accessToken ? await api.auth.profile(accessToken).catch(() => null) : null;

  return {
    accessToken,
    profile: betterAuthProfile ?? legacyProfile,
  };
}
