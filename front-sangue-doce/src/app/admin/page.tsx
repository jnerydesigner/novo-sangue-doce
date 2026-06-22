import Link from "next/link";
import { Brand } from "@/components/home/brand";
import { requireAdmin } from "./_lib/require-admin";

export const dynamic = "force-dynamic";

const adminActions = [
  {
    title: "Criar materia",
    description: "Publicar posts, organizar conteúdo e preparar chamadas editoriais.",
    href: "/admin/posts/novo",
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
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-card">
        <div className="wrap flex min-h-[76px] flex-wrap items-center justify-between gap-4 py-4">
          <div className="text-greenDeep">
            <Brand />
          </div>
          <Link
            className="rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold text-inkSoft transition hover:-translate-y-px hover:bg-paper2"
            href="/"
          >
            Ver site
          </Link>
        </div>
      </header>

      <section className="wrap py-[clamp(48px,8vw,90px)]">
        <span className="eyebrow">Admin</span>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="max-w-[14ch] text-balance font-serif text-[clamp(2.4rem,5vw,4.2rem)] font-medium leading-[1.04] tracking-normal">
              Area administrativa
            </h1>
            <p className="mt-4 max-w-[56ch] text-[1.05rem] leading-relaxed text-inkSoft">
              Ola, {profile.name}. Esta area separa as ferramentas de gestao do painel de usuario.
            </p>
          </div>
          <span className="rounded-full border border-green/30 bg-green/10 px-4 py-2 text-sm font-bold text-greenDeep">
            {profile.role}
          </span>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {adminActions.map((action) => (
            <Link
              className="rounded-lg border border-line bg-card p-6 transition hover:-translate-y-1 hover:border-lineStrong hover:shadow-editorial"
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
    </main>
  );
}
