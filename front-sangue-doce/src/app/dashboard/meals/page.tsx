import { requireDashboardUser } from "../_lib/require-dashboard-user";
import { DashboardHeader } from "../components/dashboard-header";
import { DashboardSidebar } from "../components/dashboard-sidebar";

export const dynamic = "force-dynamic";

export default async function MealsPage() {
  const { profile } = await requireDashboardUser();

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <DashboardSidebar showAdminItems={profile.role === "ADMIN"} />

        <section className="min-w-0 px-[clamp(18px,4vw,42px)] py-6">
          <DashboardHeader
            avatarUrl={profile.avatarUrl}
            subtitle="Area para atualizar refeicoes e contexto alimentar."
            title="Refeicoes"
            userName={profile.name}
          />

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <article className="rounded-lg border border-line bg-card p-5">
              <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
                Hoje
              </span>
              <strong className="mt-3 block font-serif text-[2.35rem] font-medium leading-none">
                2
              </strong>
              <p className="mt-3 text-sm leading-6 text-inkSoft">
                Refeicoes registradas para cruzar com as leituras do dia.
              </p>
            </article>
            <article className="rounded-lg border border-line bg-card p-5">
              <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
                Carboidratos
              </span>
              <strong className="mt-3 block font-serif text-[2.35rem] font-medium leading-none">
                77g
              </strong>
              <p className="mt-3 text-sm leading-6 text-inkSoft">
                Estimativa atual para orientar o acompanhamento.
              </p>
            </article>
            <article className="rounded-lg border border-line bg-card p-5">
              <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
                Proximo passo
              </span>
              <strong className="mt-3 block font-serif text-[2.35rem] font-medium leading-none">
                Diario
              </strong>
              <p className="mt-3 text-sm leading-6 text-inkSoft">
                Em breve, esta area recebe formulario e historico alimentar.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
