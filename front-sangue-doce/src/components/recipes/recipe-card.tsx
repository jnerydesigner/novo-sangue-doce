import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "@/lib/api";
import { resolvePublicImageUrl } from "@/lib/public-image-url";
import { totalRecipeMinutes } from "@/lib/recipes";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <article className="group overflow-hidden rounded-xl bg-surface shadow-editorial">
      <Link className="block" href={`/receitas/${recipe.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-subtle">
          <Image
            alt={recipe.coverImageAlt ?? recipe.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025] motion-reduce:transition-none"
            height={420}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            src={resolvePublicImageUrl(recipe.coverImageUrl)}
            width={560}
          />
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-semibold text-muted">
            <span>{totalRecipeMinutes(recipe)} min</span>
            <span>{recipe.servings} porções</span>
            {recipe.carbohydratesGrams != null ? (
              <span>{recipe.carbohydratesGrams} g carboidratos/porção</span>
            ) : null}
          </div>
          <h2 className="mt-3 text-balance font-serif text-[1.65rem] font-medium leading-[1.12] text-ink transition group-hover:text-navy">
            {recipe.title}
          </h2>
          <p className="mt-3 line-clamp-3 text-pretty text-[15px] leading-relaxed text-inkSoft">
            {recipe.excerpt}
          </p>
        </div>
      </Link>
    </article>
  );
}
