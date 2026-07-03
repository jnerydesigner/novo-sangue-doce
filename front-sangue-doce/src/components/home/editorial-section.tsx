import Link from "next/link";
import { api } from "@/lib/api";
import { mapPostToArticle } from "@/lib/posts";
import { ArticleCard } from "./article-card";
import { ArrowIcon } from "./icons";

export async function EditorialSection() {
  const posts = await api.posts.list({ limit: 3 });
  const articles = posts.data.map(mapPostToArticle);

  if (articles.length < 3) {
    return null;
  }

  return (
    <section className="py-[clamp(64px,9vw,110px)]" id="materias">
      <div className="wrap">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow">Em destaque</span>
            <h2 className="mt-3 max-w-[18ch] text-balance font-serif text-[clamp(1.9rem,3.4vw,2.7rem)] font-normal leading-[1.05] tracking-[-0.015em] text-ink">
              O que esta movendo o cuidado esta semana
            </h2>
          </div>
          <Link
            className="group inline-flex items-center gap-2 text-[15px] font-semibold text-navy"
            href="/materias"
          >
            Todas as materias
            <ArrowIcon />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          <ArticleCard article={articles[0]} seq={1} />
          <div className="grid gap-6 lg:grid-rows-2">
            <ArticleCard article={articles[1]} seq={2} compact />
            <ArticleCard article={articles[2]} seq={3} compact />
          </div>
        </div>
      </div>
    </section>
  );
}
