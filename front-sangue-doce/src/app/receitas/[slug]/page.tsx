import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostContentBlocks } from "@/components/articles/post-content-blocks";
import { PublicSiteHeader } from "@/components/home/public-site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { JsonLd } from "@/components/json-ld";
import { api } from "@/lib/api";
import { formatPostDate } from "@/lib/posts";
import { resolvePublicImageUrl } from "@/lib/public-image-url";
import { difficultyLabels, formatIngredient, isoDuration, totalRecipeMinutes } from "@/lib/recipes";
import { SITE_NAME, SITE_URL, truncateMetaTitle } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipe = await api.recipes.getBySlug((await params).slug).catch(() => null);
  if (!recipe) return {};
  const post = recipe;
  const url = `${SITE_URL}/receitas/${post.slug}`;
  const image = resolvePublicImageUrl(post.coverImageUrl);
  return {
    title: truncateMetaTitle(post.metaTitle ?? post.title),
    description: post.metaDescription ?? post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.metaTitle ?? post.title,
      description: post.metaDescription ?? post.excerpt,
      url,
      type: "article",
      siteName: SITE_NAME,
      images: [{ url: image, alt: post.coverImageAlt ?? post.title }],
    },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default async function RecipePage({ params }: Props) {
  const recipe = await api.recipes.getBySlug((await params).slug).catch(() => null);
  if (!recipe) notFound();
  const post = recipe;
  const image = resolvePublicImageUrl(post.coverImageUrl);
  const nutrition = [
    { label: "Energia", value: recipe.caloriesKcal, unit: "kcal" },
    { label: "Carboidratos", value: recipe.carbohydratesGrams, unit: "g" },
    { label: "Fibras", value: recipe.fiberGrams, unit: "g" },
    { label: "Proteínas", value: recipe.proteinGrams, unit: "g" },
    { label: "Gorduras", value: recipe.fatGrams, unit: "g" },
    { label: "Sódio", value: recipe.sodiumMg, unit: "mg" },
  ].filter((item) => item.value != null);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: post.title,
    description: post.metaDescription ?? post.excerpt,
    image: [image],
    author: { "@type": "Person", name: post.author.name },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    prepTime: isoDuration(recipe.prepMinutes),
    cookTime: isoDuration(recipe.cookMinutes),
    totalTime: isoDuration(totalRecipeMinutes(recipe)),
    recipeYield: `${recipe.servings} porções`,
    recipeIngredient: recipe.ingredients.map(formatIngredient),
    recipeInstructions: recipe.instructions.map((step) => ({
      "@type": "HowToStep",
      name: step.title,
      text: step.description,
    })),
    ...(nutrition.length
      ? {
          nutrition: {
            "@type": "NutritionInformation",
            servingSize: recipe.servingSize ?? `1 de ${recipe.servings} porções`,
            calories: recipe.caloriesKcal != null ? `${recipe.caloriesKcal} kcal` : undefined,
            carbohydrateContent:
              recipe.carbohydratesGrams != null ? `${recipe.carbohydratesGrams} g` : undefined,
            fiberContent: recipe.fiberGrams != null ? `${recipe.fiberGrams} g` : undefined,
            proteinContent: recipe.proteinGrams != null ? `${recipe.proteinGrams} g` : undefined,
            fatContent: recipe.fatGrams != null ? `${recipe.fatGrams} g` : undefined,
            sodiumContent: recipe.sodiumMg != null ? `${recipe.sodiumMg} mg` : undefined,
          },
        }
      : {}),
  };
  return (
    <>
      <JsonLd data={jsonLd} />
      <PublicSiteHeader opaque />
      <main>
        <article className="wrap">
          <header className="py-8 md:py-12">
            <nav aria-label="Trilha" className="text-sm font-medium text-muted">
              <Link href="/">Início</Link>
              <span className="mx-2">/</span>
              <Link href="/receitas">Receitas</Link>
            </nav>
            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="rounded-2xl bg-surface p-6 sm:p-8">
                <span className="inline-flex rounded-full bg-energy10 px-3 py-1 text-xs font-bold text-energy">
                  {post.category.name}
                </span>
                <h1 className="mt-5 text-balance font-serif text-[clamp(2.25rem,4.5vw,3.6rem)] font-medium leading-[1.05] tracking-[-0.02em]">
                  {post.title}
                </h1>
              </div>
              <div className="grid grid-cols-2 gap-px rounded-2xl bg-surface p-4 sm:p-6">
                <Fact label="Tempo total" value={`${totalRecipeMinutes(recipe)} min`} />
                <Fact label="Rendimento" value={`${recipe.servings} porções`} />
                <Fact label="Dificuldade" value={difficultyLabels[recipe.difficulty]} />
                <Fact label="Porção" value={recipe.servingSize ?? "Ver rendimento"} />
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-surface p-6 sm:p-8">
              <p className="text-pretty font-serif text-[clamp(1.05rem,1.6vw,1.25rem)] leading-relaxed text-inkSoft">
                {post.excerpt}
              </p>
            </div>
          </header>
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl bg-subtle">
            <Image
              alt={post.coverImageAlt ?? post.title}
              className="h-full w-full object-cover"
              fetchPriority="high"
              height={720}
              priority
              sizes="(min-width: 1240px) 1112px, 100vw"
              src={image}
              width={1280}
            />
          </div>
          <div className="grid gap-12 py-[clamp(48px,7vw,84px)] lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.4fr)]">
            <aside>
              <div className="lg:sticky lg:top-28">
                <h2 className="font-serif text-3xl font-medium">Ingredientes</h2>
                <p className="mt-2 text-sm text-muted">Para {recipe.servings} porções</p>
                <ul className="mt-6 divide-y divide-line border-y border-line">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li
                      className="py-3.5 text-[1.02rem] text-inkSoft"
                      key={`${ingredient.name}-${index}`}
                    >
                      {formatIngredient(ingredient)}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
            <div>
              <h2 className="font-serif text-3xl font-medium">Modo de preparo</h2>
              <ol className="mt-7 grid gap-7">
                {recipe.instructions.map((step, index) => (
                  <li
                    className="grid grid-cols-[44px_1fr] gap-4"
                    key={`${step.description}-${index}`}
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-navy font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      {step.title ? <h3 className="font-semibold text-ink">{step.title}</h3> : null}
                      <p className="text-pretty text-[1.08rem] leading-relaxed text-inkSoft">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              {nutrition.length ? (
                <section className="mt-12 border-y border-line py-8">
                  <h2 className="font-serif text-3xl font-medium">Informação nutricional</h2>
                  <p className="mt-2 text-sm text-muted">
                    Valores por porção: {recipe.servingSize ?? `1 de ${recipe.servings} porções`}.
                  </p>
                  <dl className="mt-6 grid grid-cols-2 gap-x-6 sm:grid-cols-3">
                    {nutrition.map((item) => (
                      <div className="border-t border-line py-4" key={item.label}>
                        <dt className="text-sm text-muted">{item.label}</dt>
                        <dd className="mt-1 text-xl font-semibold text-ink">
                          {item.value} {item.unit}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ) : null}
              <div className="article-prose mt-12 text-[1.12rem] leading-[1.72] text-inkSoft">
                <PostContentBlocks blocks={post.content} />
              </div>
              <aside className="mt-12 rounded-xl bg-navy px-6 py-5 text-white">
                <h2 className="font-semibold">Uma nota importante</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  Estas informações são educativas e não substituem orientação individual de
                  nutricionista ou equipe de saúde. Necessidades de carboidratos e resposta
                  glicêmica variam entre pessoas.
                </p>
              </aside>
              <p className="mt-6 text-sm text-muted">
                Receita por {post.author.name} · Publicada em{" "}
                {formatPostDate(post.publishedAt ?? undefined)}
              </p>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="mt-1 font-serif text-xl font-medium leading-tight text-ink">{value}</p>
    </div>
  );
}
