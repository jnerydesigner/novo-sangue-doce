import { DashboardHeader } from "../components/dashboard-header";
import { DashboardSidebar } from "../components/dashboard-sidebar";
import { GlucosePanel } from "../components/glucose-panel";
import { RecentReadings } from "../components/recent-readings";
import { requireDashboardUser } from "../_lib/require-dashboard-user";

export const dynamic = "force-dynamic";

export default async function GlucosePage() {
  const { profile } = await requireDashboardUser();

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <DashboardSidebar showAdminItems={profile.role === "ADMIN"} />

        <section className="min-w-0 px-[clamp(18px,4vw,42px)] py-6">
          <DashboardHeader
            avatarUrl={profile.avatarUrl}
            subtitle="Area para atualizar e acompanhar suas leituras."
            title="Glicemia"
            userName={profile.name}
          />

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
            <GlucosePanel />
            <RecentReadings />
          </div>
        </section>
      </div>
    </main>
  );
}
