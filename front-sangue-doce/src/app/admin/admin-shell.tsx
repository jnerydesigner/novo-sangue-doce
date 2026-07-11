import Link from "next/link";
import type React from "react";
import { Brand } from "@/components/home/brand";
import { UserMenu } from "@/components/home/user-menu";
import { adminSidebarItems, dashboardSidebarItems } from "../dashboard/dashboard.data";

type AdminShellProps = {
  active: "overview" | "posts" | "social-publications" | "taxonomy" | "users" | "authors";
  children: React.ReactNode;
  subtitle?: string;
  title?: string;
  userAvatarUrl?: string;
  userName?: string;
  userRole?: string;
};

const adminActiveByHref = {
  "/admin": "overview",
  "/admin/posts": "posts",
  "/admin/publicacoes-sociais": "social-publications",
  "/admin/taxonomia": "taxonomy",
  "/admin/usuarios": "users",
  "/admin/autores": "authors",
} as const;

const navItems = [...adminSidebarItems, ...dashboardSidebarItems];

const pageTitles: Record<AdminShellProps["active"], { title: string; subtitle: string }> = {
  overview: {
    title: "Bom te ver por aqui",
    subtitle: "Ola, acompanhe sua rotina e as ferramentas de gestao no mesmo lugar.",
  },
  posts: {
    title: "Materias",
    subtitle: "Publicacao, rascunhos e organizacao editorial.",
  },
  "social-publications": {
    title: "Publicacoes sociais",
    subtitle: "Acompanhe textos e imagens preparados para as redes.",
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
    <main className="min-h-screen bg-paper text-ink">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <aside className="hidden border-r border-line bg-card px-5 py-7 lg:flex lg:flex-col">
          <div className="mb-8 px-2 text-greenDeep">
            <Brand />
          </div>

          <nav aria-label="Menu administrativo">
            <ul className="grid gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.href in adminActiveByHref &&
                  active === adminActiveByHref[item.href as keyof typeof adminActiveByHref];
                const mark =
                  "mark" in item && typeof item.mark === "string"
                    ? item.mark
                    : item.label.slice(0, 1);

                return (
                  <li key={item.label}>
                    <Link
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[15px] font-semibold transition ${
                        isActive
                          ? "bg-green/10 text-greenDeep"
                          : "text-inkSoft hover:bg-paper2 hover:text-ink"
                      }`}
                      href={item.href}
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-paper text-sm">
                        {mark}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto rounded-lg border border-line bg-paper p-4">
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
              Acesso
            </span>
            <p className="mt-2 text-sm font-semibold text-ink">{userName ?? "Painel"}</p>
            {userRole ? (
              <span className="mt-3 inline-flex rounded-full border border-green/30 bg-green/10 px-3 py-1 text-xs font-bold text-greenDeep">
                {userRole}
              </span>
            ) : null}
          </div>
        </aside>

        <section className="min-w-0 px-[clamp(18px,4vw,42px)] py-6">
          <header className="border-b border-line pb-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-sm font-semibold text-muted">{pageTitle.subtitle}</span>
                <h1 className="font-serif text-[clamp(2rem,4vw,3.1rem)] font-medium leading-[1.04] tracking-normal">
                  {pageTitle.title}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                {userName ? (
                  <UserMenu
                    actionLabel="Ver site"
                    avatarUrl={userAvatarUrl}
                    dashboardHref="/"
                    name={userName}
                    sectionLabel="Site publico"
                    statusLabel="Sangue Doce"
                  />
                ) : null}
              </div>
            </div>

            <nav
              aria-label="Atalhos administrativos"
              className="mt-5 flex flex-wrap gap-2 lg:hidden"
            >
              {adminSidebarItems.map((item) => (
                <Link
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    active === adminActiveByHref[item.href as keyof typeof adminActiveByHref]
                      ? "border-green/30 bg-green/10 text-greenDeep"
                      : "border-lineStrong text-inkSoft hover:bg-paper2"
                  }`}
                  href={item.href}
                  key={item.label}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          <div className="mt-5">{children}</div>
        </section>
      </div>
    </main>
  );
}
