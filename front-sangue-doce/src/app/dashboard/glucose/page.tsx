import { QuickGlucoseForm } from "@/app/admin/_lib/quick-glucose-form";
import { api } from "@/lib/api";
import { requireDashboardUser } from "../_lib/require-dashboard-user";
import { DashboardHeader } from "../components/dashboard-header";
import { DashboardSidebar } from "../components/dashboard-sidebar";
import { GlucosePanel } from "../components/glucose-panel";
import { RecentReadings } from "../components/recent-readings";

export const dynamic = "force-dynamic";

export default async function GlucosePage() {
  const { accessToken, profile } = await requireDashboardUser();
  const recentReadings = await api.measurements.list({ accessToken }).catch(() => []);

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
            <div className="flex justify-end xl:col-span-2">
              <QuickGlucoseForm
                triggerClassName="rounded-lg bg-green px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-greenDeep"
                triggerLabel="+ Nova leitura"
              />
            </div>
            <GlucosePanel />
            <RecentReadings measurements={recentReadings} />
          </div>
        </section>
      </div>
    </main>
  );
}
