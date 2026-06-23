import Link from "next/link";
import { AdminShell } from "./admin-shell";
import { requireAdmin } from "./_lib/require-admin";

export const dynamic = "force-dynamic";

const adminActions = [
  {
    title: "Materias",
    description: "Publicar, revisar rascunhos e gerenciar a linha editorial.",
    href: "/admin/posts",
  },
  {
    title: "Usuarios",
    description: "Ver contas cadastradas e acompanhar quem usa a plataforma.",
    href: "/admin/usuarios",
  },
  {
    title: "Autores",
    description: "Gerenciar autores, perfis editoriais e vinculos com usuarios.",
    href: "/admin/autores",
  },
];

export default async function AdminPage() {
  const { profile } = await requireAdmin();

  return (
    <AdminShell active="overview" userName={profile.name} userRole={profile.role}>
      <section>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="max-w-[62ch] text-[1.05rem] leading-relaxed text-inkSoft">
              Ola, {profile.name}. Esta area separa as ferramentas de gestao do painel de usuario.
            </p>
          </div>
          <span className="rounded-full border border-green/30 bg-green/10 px-4 py-2 text-sm font-bold text-greenDeep">
            {profile.role}
          </span>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {adminActions.map((action) => (
            <Link
              className="rounded-lg border border-line bg-card p-5 transition hover:-translate-y-1 hover:border-lineStrong hover:shadow-editorial"
              href={action.href}
              key={action.title}
            >
              <h2 className="font-serif text-2xl font-medium tracking-normal text-ink">
                {action.title}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-inkSoft">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
