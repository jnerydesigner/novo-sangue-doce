import { redirect } from "next/navigation";
import { getCurrentAuth } from "@/lib/current-auth";

export async function requireDashboardUser() {
  const { accessToken, profile } = await getCurrentAuth();

  if (!accessToken || !profile) {
    redirect("/login");
  }

  if (profile.passwordSetupRequired) {
    redirect("/dashboard/account/password");
  }

  return { accessToken, profile };
}
