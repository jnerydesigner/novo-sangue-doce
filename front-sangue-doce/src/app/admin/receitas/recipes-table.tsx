"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Recipe } from "@/lib/api";
import { formatPostDate } from "@/lib/posts";

export function RecipesTable({ recipes }: { recipes: Recipe[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function remove(recipe: Recipe) {
    if (!window.confirm(`Excluir definitivamente “${recipe.title}”?`)) return;
    setBusyId(recipe.id);
    const response = await fetch(`/api/admin/recipes/${recipe.id}`, { method: "DELETE" });
    setBusyId(null);
    if (response.ok) router.refresh();
  }

  if (!recipes.length) {
    return (
      <div className="rounded-lg border border-line bg-card p-6">
        <h2 className="font-serif text-2xl font-medium text-ink">Nenhuma receita cadastrada</h2>
        <p className="mt-2 text-inkSoft">
          Comece com um rascunho e revise os dados antes de publicar.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] border-collapse text-left">
          <thead className="bg-paper2 text-xs uppercase tracking-[0.08em] text-muted">
            <tr>
              <th className="px-4 py-3">Receita</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tempo</th>
              <th className="px-4 py-3">Porcoes</th>
              <th className="px-4 py-3">Atualizada</th>
              <th className="px-4 py-3 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {recipes.map((recipe) => (
              <tr key={recipe.id}>
                <td className="px-4 py-4">
                  <strong className="font-serif text-lg font-medium">{recipe.title}</strong>
                  <div className="text-sm text-muted">/{recipe.slug}</div>
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full border border-lineStrong px-3 py-1 text-xs font-bold text-inkSoft">
                    {recipe.status === "PUBLISHED"
                      ? "Publicada"
                      : recipe.status === "ARCHIVED"
                        ? "Arquivada"
                        : "Rascunho"}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-inkSoft">
                  {recipe.prepMinutes + recipe.cookMinutes} min
                </td>
                <td className="px-4 py-4 text-sm text-inkSoft">{recipe.servings}</td>
                <td className="px-4 py-4 text-sm text-muted">{formatPostDate(recipe.updatedAt)}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold hover:bg-paper2"
                      href={`/admin/receitas/nova?id=${recipe.id}`}
                    >
                      Editar
                    </Link>
                    {recipe.status === "PUBLISHED" ? (
                      <Link
                        className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold hover:bg-paper2"
                        href={`/receitas/${recipe.slug}`}
                      >
                        Ver site
                      </Link>
                    ) : null}
                    <button
                      className="rounded-lg bg-tomato px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
                      disabled={busyId === recipe.id}
                      onClick={() => void remove(recipe)}
                      type="button"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
