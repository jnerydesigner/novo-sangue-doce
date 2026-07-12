"use client";

import { useRef } from "react";
import Link from "next/link";
import type { Recipe } from "@/lib/api";
import { RecipeCard } from "@/components/recipes/recipe-card";

export function RecipesCarouselSection({ recipes }: { recipes: Recipe[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function move(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-recipe-card]");
    track.scrollBy({
      left: direction * ((card?.offsetWidth ?? track.clientWidth) + 24),
      behavior: "smooth",
    });
  }

  if (recipes.length === 0) {
    return (
      <section className="border-b border-line bg-surface py-[clamp(48px,7vw,76px)]" aria-labelledby="recipes-coming-title">
        <div className="wrap flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-azure">Cozinha Sangue Doce</p>
            <h2 id="recipes-coming-title" className="mt-3 max-w-[18ch] text-balance font-serif text-[clamp(1.9rem,3.4vw,2.7rem)] font-medium leading-[1.08] text-ink">
              As primeiras receitas estão sendo preparadas
            </h2>
            <p className="mt-4 max-w-[62ch] text-pretty text-inkSoft">
              Em breve, pratos com porções, preparo claro e informações nutricionais para ajudar nas escolhas do dia a dia.
            </p>
          </div>
          <Link className="inline-flex shrink-0 items-center justify-center rounded-lg border border-lineStrong px-5 py-3 text-sm font-bold text-navy transition hover:bg-subtle" href="/materias">
            Enquanto isso, veja as matérias
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-line bg-surface py-[clamp(52px,8vw,88px)]" aria-labelledby="home-recipes-title">
      <div className="wrap">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-azure">Cozinha Sangue Doce</p>
            <h2 id="home-recipes-title" className="mt-2 text-balance font-serif text-[clamp(1.9rem,3.4vw,2.7rem)] font-medium leading-[1.08] text-ink">
              Receitas para a rotina
            </h2>
            <p className="mt-3 max-w-[62ch] text-pretty text-inkSoft">
              Preparo direto, rendimento e informações por porção para você revisar com calma.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Ver receitas anteriores" className="grid h-11 w-11 place-items-center rounded-full border border-lineStrong text-xl text-navy transition hover:border-azure hover:bg-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure" onClick={() => move(-1)} type="button">
              <span aria-hidden="true">←</span>
            </button>
            <button aria-label="Ver próximas receitas" className="grid h-11 w-11 place-items-center rounded-full border border-lineStrong text-xl text-navy transition hover:border-azure hover:bg-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure" onClick={() => move(1)} type="button">
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <div ref={trackRef} className="-mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:-mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
          {recipes.map((recipe) => (
            <div className="w-[84vw] max-w-[390px] shrink-0 snap-start sm:w-[360px] lg:w-[calc((100%_-_3rem)/3)] lg:max-w-none" data-recipe-card key={recipe.id}>
              <RecipeCard recipe={recipe} />
            </div>
          ))}
          <div className="flex min-h-[420px] w-[72vw] max-w-[310px] shrink-0 snap-start flex-col justify-end rounded-xl bg-navy p-6 text-white sm:w-[280px]">
            <p className="text-sm font-semibold text-spark">Continue explorando</p>
            <h3 className="mt-3 text-balance font-serif text-2xl font-medium leading-tight">Encontre uma receita para o próximo preparo</h3>
            <Link className="mt-6 inline-flex w-fit items-center rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-navy transition hover:bg-spark" href="/receitas">
              Ver todas as receitas
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
