import { api } from "@/lib/api";
import { requireAdmin } from "../../_lib/require-admin";
import { AdminShell } from "../../admin-shell";
import { RecipeForm } from "./recipe-form";

export const dynamic = "force-dynamic";

export default async function RecipeEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { accessToken, profile } = await requireAdmin();
  const { id } = await searchParams;
  const [authors, categories, tags, recipe] = await Promise.all([
    api.recipes.authors(),
    api.recipes.categories(),
    api.recipes.tags(),
    id ? api.recipes.get(id, { accessToken }).catch(() => null) : Promise.resolve(null),
  ]);
  return (
    <AdminShell
      active="recipes"
      title={recipe ? "Editar receita" : "Nova receita"}
      subtitle="Use a base editorial e informe o preparo por porcao."
      userAvatarUrl={profile.avatarUrl}
      userName={profile.name}
      userRole={profile.role}
    >
      <RecipeForm authors={authors} categories={categories} initialRecipe={recipe} tags={tags} />
    </AdminShell>
  );
}
