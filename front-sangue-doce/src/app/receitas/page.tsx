import type { Metadata } from "next";
import Image from "next/image";
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
const RECIPES_HERO_IMAGE_URL =
  "https://sangue-doce.s3.us-east-1.amazonaws.com/public/capa/comida-saudavel-capa.jpg";

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
        <section className="relative isolate overflow-hidden border-b border-line bg-navy py-[clamp(72px,10vw,128px)] text-white">
          <Image
            alt="Prato equilibrado com vegetais, proteina e carboidratos integrais"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
            fetchPriority="high"
            height={1280}
            loading="eager"
            sizes="100vw"
            src={RECIPES_HERO_IMAGE_URL}
            title="Comida saudavel para rotina com diabetes"
            width={1920}
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,24,36,.94)_0%,rgba(10,24,36,.78)_40%,rgba(26,56,104,.48)_70%,rgba(26,56,104,.28)_100%),linear-gradient(to_top,rgba(10,24,36,.86)_0%,rgba(10,24,36,.36)_58%,rgba(10,24,36,.20)_100%)]" />
          <div className="wrap grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-spark">Cozinha Sangue Doce</p>
              <h1 className="mt-4 max-w-[13ch] text-balance font-serif text-[clamp(2.8rem,6vw,5.2rem)] font-medium leading-[1.01] tracking-[-0.025em]">
                Receitas para comer bem, com mais clareza
              </h1>
            </div>
            <div className="max-w-[36rem] lg:justify-self-end">
              <p className="text-pretty text-[1.08rem] leading-relaxed text-white/80">
                Ingredientes acessíveis, preparo direto e informações por porção. Sem promessas
                milagrosas — só escolhas que cabem na vida real.
              </p>
              <div className="mt-6 grid grid-cols-3 divide-x divide-white/20 overflow-hidden rounded-lg border border-white/25 bg-white/10">
                <div className="flex min-h-[86px] flex-col items-center justify-center px-3 py-3 text-center">
                  <span className="text-[11.5px] font-semibold uppercase tracking-[0.13em] text-white/70">Total</span>
                  <strong className="mt-1 font-serif text-[2rem] font-normal leading-none tabular-nums">{recipes.meta.total}</strong>
                </div>
                <div className="flex min-h-[86px] flex-col items-center justify-center px-3 py-3 text-center">
                  <span className="text-[11.5px] font-semibold uppercase tracking-[0.13em] text-white/70">Página</span>
                  <strong className="mt-1 font-serif text-[2rem] font-normal leading-none tabular-nums">{recipes.meta.page}</strong>
                </div>
                <div className="flex min-h-[86px] flex-col items-center justify-center px-3 py-3 text-center">
                  <span className="text-[11.5px] font-semibold uppercase tracking-[0.13em] text-white/70">Série</span>
                  <strong className="mt-1 font-serif text-[2rem] font-normal leading-none tabular-nums">{recipes.meta.totalPages}</strong>
                </div>
              </div>
            </div>
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
            <nav aria-label="Paginação de receitas" className="mx-auto mt-12 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  aria-disabled={!recipes.meta.hasPreviousPage}
                  className="w-full rounded-lg border border-lineStrong px-4 py-2.5 text-center text-sm font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-50 sm:w-auto"
                  href={`/receitas?pagina=${Math.max(1, recipes.meta.page - 1)}`}
                >
                  Anterior
                </Link>
                <span className="order-first px-3 py-2.5 text-center text-sm text-muted sm:order-none">
                  Página {recipes.meta.page} de {recipes.meta.totalPages}
                </span>
                <Link
                  aria-disabled={!recipes.meta.hasNextPage}
                  className="w-full rounded-lg border border-lineStrong px-4 py-2.5 text-center text-sm font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-50 sm:w-auto"
                  href={`/receitas?pagina=${Math.min(recipes.meta.totalPages, recipes.meta.page + 1)}`}
                >
                  Próxima
                </Link>
            </nav>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
