import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/home/article-card";
import { Brand } from "@/components/home/brand";
import { ArrowIcon } from "@/components/home/icons";
import { SiteFooter } from "@/components/home/site-footer";
import { api, type PostContentBlock } from "@/lib/api";
import { formatPostDate, mapPostToArticle } from "@/lib/posts";
import { ArticleActions, ReadingProgress } from "./article-actions";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await api.posts.getBySlug(slug).catch(() => null);

  if (!post) {
    return {};
  }

  return {
    title: post.metaTitle ?? `${post.title} | Sangue Doce`,
    description: post.metaDescription ?? post.excerpt,
  };
}

function tagClass(color: string) {
  if (color === "tomato") {
    return "bg-[#f7e9e4] text-tomato";
  }

  if (color === "blue") {
    return "bg-[#e7eef5] text-blue";
  }

  return "bg-[#eaf1e8] text-greenDeep";
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await api.posts.getBySlug(slug).catch(() => null);

  if (!post) {
    notFound();
  }

  const article = mapPostToArticle(post);
  const related = await api.posts
    .list({ limit: 4 })
    .then((page) =>
      page.data
        .filter((item) => item.slug !== post.slug)
        .slice(0, 3)
        .map(mapPostToArticle),
    )
    .catch(() => []);
  const publishedDate = formatPostDate(post.publishedAt);

  return (
    <>
      <ReadingProgress />
      <header className="sticky top-0 z-[100] border-b border-line bg-paper/90 shadow-sm backdrop-blur-xl">
        <div className="wrap flex h-[76px] items-center justify-between gap-6">
          <div className="text-greenDeep">
            <Brand />
          </div>
          <nav className="flex items-center gap-5" aria-label="Materia">
            <Link
              href="/materias"
              className="text-[14px] font-semibold text-inkSoft transition hover:text-ink"
            >
              Materias
            </Link>
            <Link
              href="/login"
              className="hidden rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold text-inkSoft transition hover:-translate-y-px hover:bg-paper2 sm:inline-flex"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <article>
          <div className="wrap pt-8">
            <nav
              className="flex flex-wrap items-center gap-2 text-[13.5px] font-medium text-muted"
              aria-label="Trilha"
            >
              <Link href="/" className="transition hover:text-greenDeep">
                Inicio
              </Link>
              <span>/</span>
              <Link
                href="/materias"
                className="transition hover:text-greenDeep"
              >
                Materias
              </Link>
              <span>/</span>
              <span>{post.category.name}</span>
            </nav>

            <div className="mx-auto max-w-[880px] py-8 text-center md:py-10">
              <span
                className={`inline-block rounded-full px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.07em] ${tagClass(article.color)}`}
              >
                {article.tag}
              </span>
              <h1 className="mx-auto mt-5 max-w-[20ch] text-balance font-serif text-[clamp(2.1rem,4.6vw,3.6rem)] font-medium leading-[1.05] tracking-normal text-ink">
                {article.title}
              </h1>
              <p className="mx-auto mt-5 max-w-[56ch] text-pretty font-serif text-[clamp(1.18rem,2.1vw,1.5rem)] leading-[1.5] text-inkSoft">
                {article.excerpt}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                {post.author.avatarUrl ? (
                  <Image
                    width={50}
                    height={50}
                    src={post.author.avatarUrl}
                    alt=""
                    className="h-[50px] w-[50px] rounded-full border border-lineStrong bg-paper2 object-cover"
                  />
                ) : (
                  <div className="h-[50px] w-[50px] rounded-full border border-lineStrong bg-paper2" />
                )}
                <div className="text-left">
                  <div className="text-[15.5px] font-semibold text-ink">
                    {post.author.name}
                  </div>
                  <div className="text-[13.5px] text-muted">
                    {post.author.role}
                  </div>
                </div>
                <span className="hidden h-8 w-px bg-lineStrong sm:block" />
                <div className="flex items-center gap-2 text-[13.5px] text-muted">
                  <span>{publishedDate}</span>
                  <span className="h-[3px] w-[3px] rounded-full bg-lineStrong" />
                  <span>{post.readingMinutes} min de leitura</span>
                </div>
              </div>
            </div>
          </div>

          <div className="wrap">
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-paper2 md:aspect-[21/9]">
                <Image
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt ?? ""}
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 1240px) 1112px, 100vw"
                />
              </div>
              {post.coverCaption ? (
                <figcaption className="mt-3 flex gap-2 text-[13px] text-muted">
                  <b className="font-semibold text-inkSoft">Na pratica.</b>
                  <span>{post.coverCaption}</span>
                </figcaption>
              ) : null}
            </figure>
          </div>

          <div className="wrap grid gap-10 py-[clamp(48px,7vw,84px)] md:grid-cols-[1fr_minmax(0,720px)_1fr]">
            <aside className="hidden justify-self-end md:block">
              <ArticleActions title={article.title} />
            </aside>

            <div className="article-prose text-[1.16rem] leading-[1.72] text-inkSoft">
              {post.content.map((block: PostContentBlock, index) => {
                if (block.type === "heading" && block.level === 2) {
                  return (
                    <h2
                      key={`${block.type}-${index}`}
                      className="mb-4 mt-12 font-serif text-[clamp(1.6rem,2.6vw,2.05rem)] font-medium leading-[1.15] tracking-normal text-ink"
                    >
                      {block.content}
                    </h2>
                  );
                }

                if (block.type === "heading" && block.level === 3) {
                  return (
                    <h3
                      key={`${block.type}-${index}`}
                      className="mb-3 mt-9 font-serif text-[1.32rem] font-semibold text-ink"
                    >
                      {block.content}
                    </h3>
                  );
                }

                if (block.type === "quote") {
                  return (
                    <blockquote
                      key={`${block.type}-${index}`}
                      className="my-11 border-l-[3px] border-tomato py-1 pl-7 font-serif text-[clamp(1.5rem,2.8vw,2rem)] font-medium italic leading-[1.3] text-ink"
                    >
                      &quot;{block.content}&quot;
                    </blockquote>
                  );
                }

                if (block.type === "list") {
                  return (
                    <ul
                      key={`${block.type}-${index}`}
                      className="mb-7 grid list-none gap-3 p-0"
                    >
                      {block.items.map((item) => (
                        <li
                          key={item}
                          className="relative pl-8 before:absolute before:left-1 before:top-[0.72em] before:h-2 before:w-2 before:rounded-full before:bg-green"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                }

                if (block.type === "image") {
                  return (
                    <figure key={`${block.type}-${index}`} className="my-10">
                      <div className="relative aspect-video overflow-hidden rounded-[10px] bg-paper2">
                        <Image
                          src={block.src}
                          alt={block.alt ?? ""}
                          fill
                          className="object-cover"
                          sizes="720px"
                        />
                      </div>
                      {block.caption ? (
                        <figcaption className="mt-3 text-[13px] text-muted">
                          {block.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  );
                }

                if (block.type === "callout") {
                  return (
                    <div
                      key={`${block.type}-${index}`}
                      className="my-10 rounded-[10px] border border-green/25 bg-[#eaf1e8] px-7 py-6 text-[1.02rem]"
                    >
                      <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.06em] text-greenDeep">
                        {block.title}
                      </div>
                      <p className="m-0 text-inkSoft">{block.content}</p>
                    </div>
                  );
                }

                if (block.type !== "paragraph") {
                  return null;
                }

                return (
                  <p
                    key={`${block.type}-${index}`}
                    className={`mb-7 text-pretty ${index === 0 ? "first-letter:float-left first-letter:pr-3 first-letter:pt-2 first-letter:font-serif first-letter:text-[4.6rem] first-letter:font-medium first-letter:leading-[0.82] first-letter:text-tomato" : ""}`}
                  >
                    {block.content}
                  </p>
                );
              })}

              <div className="mt-11 flex flex-wrap gap-2.5">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href="/materias"
                    className="rounded-full border border-lineStrong px-4 py-1.5 text-[13px] font-medium text-inkSoft transition hover:border-muted hover:bg-paper2"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>

            <div />
          </div>

          <div className="wrap">
            <aside className="mx-auto mt-2 grid max-w-[720px] gap-6 rounded-xl border border-line bg-card p-8 sm:grid-cols-[84px_1fr]">
              {post.author.avatarUrl ? (
                <Image
                  width={84}
                  height={84}
                  src={post.author.avatarUrl}
                  alt=""
                  className="h-[84px] w-[84px] rounded-full border border-lineStrong bg-paper2 object-cover"
                />
              ) : (
                <div className="h-[84px] w-[84px] rounded-full border border-lineStrong bg-paper2" />
              )}
              <div>
                <span className="eyebrow mb-2">Sobre a autor (a)</span>
                <h2 className="m-0 font-serif text-2xl font-medium tracking-normal text-ink">
                  {post.author.name}
                </h2>
                <p className="mb-3 mt-1 text-sm text-muted">
                  {post.author.role}
                </p>
                <p className="m-0 text-[15.5px] leading-relaxed text-inkSoft">
                  {post.author.bio}
                </p>
              </div>
            </aside>
          </div>
        </article>

        <section className="mt-[clamp(64px,8vw,96px)] border-t border-line bg-paper2 py-[clamp(56px,8vw,88px)]">
          <div className="wrap">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
              <div>
                <span className="eyebrow">Leia tambem</span>
                <h2 className="mt-3 font-serif text-[clamp(1.8rem,3.2vw,2.5rem)] font-medium leading-[1.05] tracking-normal text-ink">
                  Continue o cuidado
                </h2>
              </div>
              <Link
                href="/materias"
                className="inline-flex items-center gap-2 text-[15px] font-semibold text-greenDeep transition hover:gap-3"
              >
                Todas as materias
                <span className="h-4 w-4">
                  <ArrowIcon />
                </span>
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {related.map((item, index) => (
                <ArticleCard key={item.slug} article={item} seq={index + 2} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
