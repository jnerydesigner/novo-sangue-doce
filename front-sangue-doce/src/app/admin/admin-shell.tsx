import { UserMenu } from "@/components/home/user-menu";
import type React from "react";
import { DashboardSidebar } from "../dashboard/components/dashboard-sidebar";
import { DateTimeCard } from "../dashboard/components/date-time-card";

type AdminShellProps = {
  active:
    | "overview"
    | "posts"
    | "recipes"
    | "social-publications"
    | "institutional-publications"
    | "taxonomy"
    | "users"
    | "authors";
  children: React.ReactNode;
  subtitle?: string;
  title?: string;
  userAvatarUrl?: string;
  userName?: string;
  userRole?: string;
};

const pageTitles: Record<
  AdminShellProps["active"],
  { title: string; subtitle: string }
> = {
  overview: {
    title: "Bom te ver por aqui",
    subtitle:
      "Ola, acompanhe sua rotina e as ferramentas de gestao no mesmo lugar.",
  },
  posts: {
    title: "Materias",
    subtitle: "Publicacao, rascunhos e organizacao editorial.",
  },
  recipes: {
    title: "Receitas",
    subtitle: "Preparo, nutricao e publicacao editorial.",
  },
  "social-publications": {
    title: "Publicacoes sociais",
    subtitle: "Acompanhe textos e imagens preparados para as redes.",
  },
  "institutional-publications": {
    title: "Publicacoes institucionais",
    subtitle:
      "Crie posts manuais com imagem propria para publicar no LinkedIn.",
  },
  taxonomy: {
    title: "Tags e Categorias",
    subtitle: "Organizacao editorial para materias e filtros.",
  },
  users: {
    title: "Usuarios",
    subtitle: "Contas cadastradas e papeis de acesso.",
  },
  authors: {
    title: "Autores",
    subtitle: "Perfis editoriais vinculados a usuarios.",
  },
};

export function AdminShell({
  active,
  children,
  subtitle,
  title,
  userAvatarUrl,
  userName,
  userRole,
}: AdminShellProps) {
  const pageTitle = {
    subtitle: subtitle ?? pageTitles[active].subtitle,
    title: title ?? pageTitles[active].title,
  };
  return (
    <main className="dashboard-shell bg-paper text-ink">
      <div className="dashboard-grid lg:grid-cols-[248px_1fr]">
        <DashboardSidebar
          navLabel="Menu administrativo"
          showAdminItems
          footer={
            <div className="mt-auto rounded-lg border border-line bg-paper p-4">
              <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                Acesso
              </span>
              <p className="mt-2 text-sm font-semibold text-ink">
                {userName ?? "Painel"}
              </p>
              {userRole ? (
                <span className="mt-3 inline-flex rounded-full border border-green/30 bg-green/10 px-3 py-1 text-xs font-bold text-greenDeep">
                  {userRole}
                </span>
              ) : null}
            </div>
          }
        />

        <section className="min-w-0 overflow-x-hidden overflow-y-auto px-[clamp(18px,4vw,42px)] pb-6 pt-28 lg:py-6">
          <header className="border-b border-line pb-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-sm font-semibold text-muted">
                  {pageTitle.subtitle}
                </span>
                <h1 className="font-serif text-[clamp(2rem,4vw,3.1rem)] font-medium leading-[1.04] tracking-normal">
                  {pageTitle.title}
                </h1>
              </div>

              <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
                {userName ? (
                  <div className="order-first w-full md:order-last md:w-auto">
                    <UserMenu
                      className="w-full"
                      actionLabel="Ver site"
                      avatarUrl={userAvatarUrl}
                      dashboardHref="/"
                      name={userName}
                      sectionLabel="Site publico"
                      statusLabel="Sangue Doce"
                    />
                  </div>
                ) : null}

                <div className="w-full md:w-auto">
                  <DateTimeCard className="w-full" />
                </div>
              </div>
            </div>

          </header>

          <div className="mt-5">{children}</div>
        </section>
      </div>
    </main>
  );
}
