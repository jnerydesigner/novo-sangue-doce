import { redirect } from "next/navigation";
import { getCurrentAuth } from "@/lib/current-auth";

export async function requireAdmin() {
  const { accessToken, profile } = await getCurrentAuth();

  if (!accessToken || !profile) {
    redirect("/login");
  }

  if (profile.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return {
    accessToken,
    profile,
  };
}
