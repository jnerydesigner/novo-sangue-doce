"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Recipe } from "@/lib/api";
import { formatPostDate } from "@/lib/posts";

export function RecipesTable({ recipes }: { recipes: Recipe[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(recipes.length / pageSize));
  const visibleRecipes = useMemo(
    () => recipes.slice((page - 1) * pageSize, page * pageSize),
    [page, recipes],
  );

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, pageCount));
  }, [pageCount]);

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
      <div className="hidden overflow-x-auto lg:block">
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
            {visibleRecipes.map((recipe) => (
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
                    <Link
                      className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold hover:bg-paper2"
                      href={`/admin/receitas/preview?id=${recipe.id}`}
                    >
                      Ver prévia
                    </Link>
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

      {pageCount > 1 ? (
        <RecipePagination className="hidden border-t border-line px-4 py-4 lg:flex" page={page} pageCount={pageCount} setPage={setPage} />
      ) : null}

      <div className="grid min-w-0 gap-4 p-4 lg:hidden">
        {visibleRecipes.map((recipe) => (
          <article className="min-w-0 overflow-hidden rounded-lg border border-line bg-card p-4" key={recipe.id}>
            <div className="border-b border-line pb-4">
              <h2 className="break-words font-serif text-xl font-medium leading-tight text-ink">
                {recipe.title}
              </h2>
              <p className="mt-1 truncate text-sm text-muted">/{recipe.slug}</p>
            </div>

            <dl className="grid gap-3 py-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="font-bold text-muted">Status</dt>
                <dd>
                  <span className="inline-flex rounded-full border border-lineStrong px-3 py-1 text-xs font-bold text-inkSoft">
                    {recipe.status === "PUBLISHED"
                      ? "Publicada"
                      : recipe.status === "ARCHIVED"
                        ? "Arquivada"
                        : "Rascunho"}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="font-bold text-muted">Tempo</dt>
                <dd className="text-right text-inkSoft">{recipe.prepMinutes + recipe.cookMinutes} min</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="font-bold text-muted">Porções</dt>
                <dd className="text-right text-inkSoft">{recipe.servings}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="font-bold text-muted">Atualizada</dt>
                <dd className="text-right text-muted">{formatPostDate(recipe.updatedAt)}</dd>
              </div>
            </dl>

            <div className="grid gap-2 border-t border-line pt-4 sm:grid-cols-2">
              <Link
                className="w-full rounded-lg border border-lineStrong px-3 py-2 text-center text-sm font-semibold hover:bg-paper2"
                href={`/admin/receitas/nova?id=${recipe.id}`}
              >
                Editar
              </Link>
              <Link
                className="w-full rounded-lg border border-lineStrong px-3 py-2 text-center text-sm font-semibold hover:bg-paper2"
                href={`/admin/receitas/preview?id=${recipe.id}`}
              >
                Ver prévia
              </Link>
              <button
                className="w-full rounded-lg bg-tomato px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
                disabled={busyId === recipe.id}
                onClick={() => void remove(recipe)}
                type="button"
              >
                Excluir
              </button>
            </div>
          </article>
        ))}
        {pageCount > 1 ? (
          <RecipePagination className="flex pt-2" page={page} pageCount={pageCount} setPage={setPage} />
        ) : null}
      </div>
    </div>
  );
}

function RecipePagination({
  className,
  page,
  pageCount,
  setPage,
}: {
  className: string;
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
}) {
  return (
    <nav aria-label="Paginação de receitas" className={`flex-wrap items-center justify-center gap-2 ${className}`}>
      <button
        className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold text-inkSoft disabled:opacity-40"
        disabled={page === 1}
        onClick={() => setPage(Math.max(1, page - 1))}
        type="button"
      >
        Anterior
      </button>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
        <button
          aria-current={page === pageNumber ? "page" : undefined}
          className={`grid h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm font-bold ${page === pageNumber ? "border-green bg-green/10 text-greenDeep" : "border-lineStrong text-inkSoft hover:bg-paper2"}`}
          key={pageNumber}
          onClick={() => setPage(pageNumber)}
          type="button"
        >
          {pageNumber}
        </button>
      ))}
      <button
        className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold text-inkSoft disabled:opacity-40"
        disabled={page === pageCount}
        onClick={() => setPage(Math.min(pageCount, page + 1))}
        type="button"
      >
        Próxima
      </button>
    </nav>
  );
}
