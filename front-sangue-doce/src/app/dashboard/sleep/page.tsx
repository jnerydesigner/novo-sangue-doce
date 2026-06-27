import { requireDashboardUser } from "../_lib/require-dashboard-user";
import { DashboardHeader } from "../components/dashboard-header";
import { DashboardSidebar } from "../components/dashboard-sidebar";

export const dynamic = "force-dynamic";

export default async function SleepPage() {
  const { profile } = await requireDashboardUser();

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <DashboardSidebar showAdminItems={profile.role === "ADMIN"} />

        <section className="min-w-0 px-[clamp(18px,4vw,42px)] py-6">
          <DashboardHeader
            avatarUrl={profile.avatarUrl}
            subtitle="Area para atualizar dados de descanso e rotina."
            title="Sono"
            userName={profile.name}
          />

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <article className="rounded-lg border border-line bg-card p-5">
              <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
                Ultima noite
              </span>
              <strong className="mt-3 block font-serif text-[2.35rem] font-medium leading-none">
                7h10
              </strong>
              <p className="mt-3 text-sm leading-6 text-inkSoft">
                Registro base para acompanhar descanso e glicemia ao acordar.
              </p>
            </article>
            <article className="rounded-lg border border-line bg-card p-5">
              <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
                Meta
              </span>
              <strong className="mt-3 block font-serif text-[2.35rem] font-medium leading-none">
                7h30
              </strong>
              <p className="mt-3 text-sm leading-6 text-inkSoft">
                Ajuste fino para perceber padroes de energia e recuperacao.
              </p>
            </article>
            <article className="rounded-lg border border-line bg-card p-5">
              <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
                Status
              </span>
              <strong className="mt-3 block font-serif text-[2.35rem] font-medium leading-none">
                Em dia
              </strong>
              <p className="mt-3 text-sm leading-6 text-inkSoft">
                Em breve, esta area recebe edicao e historico completo.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
