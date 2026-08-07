"use server";

import { requireDashboardUser } from "../_lib/require-dashboard-user";
import { MealsClient } from "./meals-client";

export default async function MealsPage() {
  const { profile } = await requireDashboardUser();

  return (
    <MealsClient
      avatarUrl={profile.avatarUrl}
      showAdminItems={profile.role === "ADMIN"}
      userName={profile.name}
    />
  );
}
