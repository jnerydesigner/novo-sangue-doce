import type { Metadata } from "next";
import Link from "next/link";
import { PublicSiteHeader } from "@/components/home/public-site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { api } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Receitas saudáveis",
  description:
    "Receitas práticas com porções, preparo e informações nutricionais para uma rotina mais consciente.",
  alternates: { canonical: `${SITE_URL}/receitas` },
};

const PER_PAGE = 9;

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const value = Number((await searchParams).pagina ?? 1);
  const requestedPage = Number.isInteger(value) && value > 0 ? value : 1;
  const recipes = await api.recipes.list({ page: requestedPage, limit: PER_PAGE });
  return (
    <>
      <PublicSiteHeader opaque />
      <main>
        <section className="border-b border-line bg-navy py-[clamp(64px,9vw,112px)] text-white">
          <div className="wrap grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-spark">Cozinha Sangue Doce</p>
              <h1 className="mt-4 max-w-[13ch] text-balance font-serif text-[clamp(2.8rem,6vw,5.2rem)] font-medium leading-[1.01] tracking-[-0.025em]">
                Receitas para comer bem, com mais clareza
              </h1>
            </div>
            <p className="max-w-[36rem] text-pretty text-[1.08rem] leading-relaxed text-white/80">
              Ingredientes acessíveis, preparo direto e informações por porção. Sem promessas
              milagrosas — só escolhas que cabem na vida real.
            </p>
          </div>
        </section>
        <section className="py-[clamp(52px,8vw,92px)]">
          <div className="wrap">
            {recipes.data.length ? (
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {recipes.data.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="border-y border-line py-16 text-center">
                <h2 className="font-serif text-3xl font-medium">
                  As primeiras receitas estão no forno
                </h2>
                <p className="mt-3 text-inkSoft">Volte em breve para conhecer a nova seleção.</p>
              </div>
            )}
            {recipes.meta.totalPages > 1 ? (
              <nav aria-label="Paginação de receitas" className="mt-12 flex justify-center gap-3">
                <Link
                  aria-disabled={!recipes.meta.hasPreviousPage}
                  className="rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  href={`/receitas?pagina=${Math.max(1, recipes.meta.page - 1)}`}
                >
                  Anterior
                </Link>
                <span className="px-3 py-2.5 text-sm text-muted">
                  Página {recipes.meta.page} de {recipes.meta.totalPages}
                </span>
                <Link
                  aria-disabled={!recipes.meta.hasNextPage}
                  className="rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  href={`/receitas?pagina=${Math.min(recipes.meta.totalPages, recipes.meta.page + 1)}`}
                >
                  Próxima
                </Link>
              </nav>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
