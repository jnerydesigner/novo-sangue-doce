import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

export async function requireDashboardUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const profile = await api.auth.profile(accessToken).catch(() => null);

  if (!profile) {
    redirect("/login");
  }

  if (profile.passwordSetupRequired) {
    redirect("/dashboard/account/password");
  }

  return { accessToken, profile };
}
