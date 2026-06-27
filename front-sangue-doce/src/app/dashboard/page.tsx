import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { DashboardCta } from "./components/dashboard-cta";
import { DashboardHeader } from "./components/dashboard-header";
import { DashboardSidebar } from "./components/dashboard-sidebar";
import { GlucosePanel } from "./components/glucose-panel";
import { RecentReadings } from "./components/recent-readings";
import { SummaryTiles } from "./components/summary-tiles";
import { TimelineCard } from "./components/timeline-card";
import { type SummaryTile, summaryTiles } from "./dashboard.data";
import { mapDashboardData } from "./dashboard.mapper";
import { formatMeasurementTime } from "./dashboard.utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const userData = await api.auth.profile(accessToken).catch(() => null);

  if (!userData) {
    redirect("/login");
  }

  if (userData.passwordSetupRequired) {
    redirect("/dashboard/account/password");
  }

  const today = new Date();
  const [monthlyReport, recentReadings] = await Promise.all([
    api.measurements.monthlyReport({
      accessToken,
      year: today.getFullYear(),
      month: today.getMonth() + 1,
    }),
    api.measurements.list({ accessToken }).catch(() => []),
  ]);

  const dashboardData = mapDashboardData({ monthlyReport });
  const lastMedition = dashboardData.lastMedition;
  const dashboardSummaryTiles: SummaryTile[] = summaryTiles.map((tile) => {
    if (tile.label !== "Glicemia") {
      return tile;
    }

    return {
      ...tile,
      detail: lastMedition
        ? `Ultima leitura em ${formatMeasurementTime(lastMedition.measuredAt)}`
        : "Sem leituras registradas",
      tone: lastMedition && lastMedition.glucoseValueMgDl > 140 ? "tomato" : "green",
      value: lastMedition ? String(lastMedition.glucoseValueMgDl) : "--",
    };
  });

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <DashboardSidebar showAdminItems={userData.role === "ADMIN"} />

        <section className="min-w-0 px-[clamp(18px,4vw,42px)] py-6">
          <DashboardHeader avatarUrl={userData.avatarUrl} userName={userData.name} />
          <SummaryTiles tiles={dashboardSummaryTiles} />

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
            <GlucosePanel />
            <RecentReadings measurements={recentReadings} />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <TimelineCard />
            <DashboardCta />
          </div>
        </section>
      </div>
    </main>
  );
}
