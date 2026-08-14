import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { formatPostDate } from "@/lib/posts";
import { AdminShell } from "../../admin-shell";
import { requireAdmin } from "../../_lib/require-admin";

export const dynamic = "force-dynamic";

export default async function RecipePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { accessToken, profile } = await requireAdmin();
  const { id } = await searchParams;
  const recipe = id ? await api.recipes.get(id, { accessToken }).catch(() => null) : null;
  if (!recipe) notFound();

  return (
    <AdminShell
      active="recipes"
      subtitle="Prévia administrativa da receita."
      title={recipe.title}
      userAvatarUrl={profile.avatarUrl}
      userName={profile.name}
      userRole={profile.role}
    >
      <article className="mx-auto grid max-w-4xl gap-8 rounded-xl border border-line bg-card p-5 sm:p-8">
        <header className="border-b border-line pb-6">
          <span className="inline-flex rounded-full border border-lineStrong px-3 py-1 text-xs font-bold text-inkSoft">
            {recipe.status === "PUBLISHED" ? "Publicada" : recipe.status === "ARCHIVED" ? "Arquivada" : "Rascunho"}
          </span>
          <h1 className="mt-4 font-serif text-3xl font-medium text-ink">{recipe.title}</h1>
          <p className="mt-2 text-inkSoft">{recipe.excerpt}</p>
          <p className="mt-3 text-sm text-muted">Atualizada em {formatPostDate(recipe.updatedAt)}</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <Fact label="Tempo total" value={`${recipe.prepMinutes + recipe.cookMinutes} min`} />
          <Fact label="Porções" value={String(recipe.servings)} />
          <Fact label="Categoria" value={recipe.category.name} />
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl font-medium">Ingredientes</h2>
            <ul className="mt-4 grid gap-2 text-inkSoft">
              {recipe.ingredients.map((ingredient, index) => (
                <li className="border-b border-line pb-2" key={`${ingredient.name}-${index}`}>
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-2xl font-medium">Modo de preparo</h2>
            <ol className="mt-4 grid gap-4 text-inkSoft">
              {recipe.instructions.map((step, index) => (
                <li key={`${step.description}-${index}`}>
                  <strong className="text-ink">{index + 1}. {step.title}</strong>
                  <p className="mt-1">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <Link className="w-fit rounded-lg border border-lineStrong px-4 py-2 text-sm font-semibold text-inkSoft hover:bg-paper2" href={`/admin/receitas/nova?id=${recipe.id}`}>
          Voltar para edição
        </Link>
      </article>
    </AdminShell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-paper p-4">
      <span className="text-xs font-bold uppercase tracking-wide text-muted">{label}</span>
      <strong className="mt-2 block text-lg text-ink">{value}</strong>
    </div>
  );
}
