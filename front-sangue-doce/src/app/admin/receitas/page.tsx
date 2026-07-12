import Link from "next/link";
import { api } from "@/lib/api";
import { requireAdmin } from "../_lib/require-admin";
import { AdminShell } from "../admin-shell";
import { RecipesTable } from "./recipes-table";

export const dynamic = "force-dynamic";

export default async function AdminRecipesPage() {
  const { accessToken, profile } = await requireAdmin();
  const recipes = await api.recipes.adminList({ accessToken, limit: 50 });

  return (
    <AdminShell
      active="recipes"
      userAvatarUrl={profile.avatarUrl}
      userName={profile.name}
      userRole={profile.role}
    >
      <section className="grid gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-[64ch] text-[1.02rem] leading-relaxed text-inkSoft">
            Organize receitas com ingredientes, preparo, rendimento e informacoes nutricionais por
            porcao.
          </p>
          <Link
            className="rounded-lg bg-green px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-greenDeep"
            href="/admin/receitas/nova"
          >
            Nova receita
          </Link>
        </div>
        <RecipesTable recipes={recipes.data} />
      </section>
    </AdminShell>
  );
}
