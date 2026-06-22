import Link from "next/link";
import { Brand } from "@/components/home/brand";
import { requireAdmin } from "../../_lib/require-admin";

export const dynamic = "force-dynamic";

const fields = [
  "Titulo",
  "Slug",
  "Resumo",
  "Categoria",
  "Autor",
  "Tempo de leitura",
];

export default async function NewAdminPostPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-card">
        <div className="wrap flex min-h-[76px] flex-wrap items-center justify-between gap-4 py-4">
          <div className="text-greenDeep">
            <Brand />
          </div>
          <Link
            className="rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold text-inkSoft transition hover:-translate-y-px hover:bg-paper2"
            href="/admin"
          >
            Admin
          </Link>
        </div>
      </header>

      <section className="wrap py-[clamp(40px,7vw,78px)]">
        <span className="eyebrow">Admin</span>
        <h1 className="mt-4 font-serif text-[clamp(2.2rem,4vw,3.8rem)] font-medium leading-[1.04] tracking-normal">
          Nova materia
        </h1>

        <form className="mt-8 grid gap-5 rounded-lg border border-line bg-card p-5 md:grid-cols-2">
          {fields.map((field) => (
            <label className="grid gap-2 text-sm font-bold text-inkSoft" key={field}>
              {field}
              <input
                className="h-12 rounded-lg border border-line bg-paper px-4 text-base font-medium text-ink outline-none transition focus:border-green"
                name={field.toLowerCase().replaceAll(" ", "-")}
                type="text"
              />
            </label>
          ))}
          <label className="grid gap-2 text-sm font-bold text-inkSoft md:col-span-2">
            Conteudo
            <textarea
              className="min-h-52 rounded-lg border border-line bg-paper px-4 py-3 text-base font-medium text-ink outline-none transition focus:border-green"
              name="conteudo"
            />
          </label>
          <div className="flex flex-wrap justify-end gap-3 md:col-span-2">
            <Link
              className="rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold text-inkSoft transition hover:-translate-y-px hover:bg-paper2"
              href="/admin"
            >
              Cancelar
            </Link>
            <button
              className="rounded-lg bg-green px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-greenDeep"
              type="button"
            >
              Salvar rascunho
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
