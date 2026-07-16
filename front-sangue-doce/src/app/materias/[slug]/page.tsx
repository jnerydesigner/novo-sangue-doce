import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostContentBlocks } from "@/components/articles/post-content-blocks";
import { ArticleCard } from "@/components/home/article-card";
import { ArrowIcon } from "@/components/home/icons";
import { PublicSiteHeader } from "@/components/home/public-site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { JsonLd } from "@/components/json-ld";
import { api } from "@/lib/api";
import { formatPostDate, mapPostToArticle } from "@/lib/posts";
import { resolvePublicImageUrl } from "@/lib/public-image-url";
import {
  buildArticleJsonLd,
  SITE_NAME,
  SITE_URL,
  truncateMetaTitle,
} from "@/lib/seo";
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

  const canonicalUrl = `${SITE_URL}/materias/${post.slug}`;
  const coverImageUrl = resolvePublicImageUrl(post.coverImageUrl);
  const metaTitle = truncateMetaTitle(post.metaTitle ?? post.title);

  return {
    title: metaTitle,
    description: post.metaDescription ?? post.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.metaTitle ?? post.title,
      description: post.metaDescription ?? post.excerpt,
      url: canonicalUrl,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      siteName: SITE_NAME,
      images: [
        {
          url: coverImageUrl,
          alt: post.coverImageAlt ?? post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle ?? post.title,
      description: post.metaDescription ?? post.excerpt,
      images: [coverImageUrl],
    },
  };
}

function tagClass(color: string) {
  if (color === "tomato") {
    return "bg-[#FEF0E4] text-energy";
  }

  if (color === "blue") {
    return "bg-[#E6F2FB] text-azure";
  }

  return "bg-[#E4F8FC] text-navy";
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
  const publishedDate = formatPostDate(post.publishedAt ?? undefined);
  const authorAvatarUrl = resolvePublicImageUrl(post.author.avatarUrl);
  const coverImageUrl = resolvePublicImageUrl(post.coverImageUrl);
  const authorHref = `/autores/${post.author.slug}`;

  return (
    <>
      <JsonLd data={buildArticleJsonLd(post)} />
      <ReadingProgress />
      <PublicSiteHeader />

      <main>
        <article>
          <div className="wrap pt-8">
            <nav
              className="flex flex-wrap items-center gap-2 text-[13.5px] font-medium text-muted"
              aria-label="Trilha"
            >
              <Link href="/" className="transition hover:text-navy">
                Inicio
              </Link>
              <span>/</span>
              <Link href="/materias" className="transition hover:text-navy">
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

              <div className="mx-auto mt-8 flex w-fit flex-wrap items-center justify-center gap-4 text-left">
                <Link
                  href={authorHref}
                  className="flex items-center gap-4 rounded-xl px-3 py-2 transition hover:bg-surface focus:outline-none focus:ring-2 focus:ring-azure/40"
                >
                  {authorAvatarUrl ? (
                    <Image
                      width={50}
                      height={50}
                      src={authorAvatarUrl}
                      alt={post.author.name}
                      className="h-[50px] w-[50px] rounded-full border border-lineStrong bg-subtle object-cover"
                      loading="eager"
                      title={post.author.name}
                    />
                  ) : (
                    <div className="h-[50px] w-[50px] rounded-full border border-lineStrong bg-subtle" />
                  )}
                  <div>
                    <div className="text-[15.5px] font-semibold text-ink">
                      {post.author.name}
                    </div>
                    <div className="text-[13.5px] text-muted">
                      {post.author.role}
                    </div>
                  </div>
                </Link>

                {post.author.socialMedia.length ? (
                  <div className="flex items-center gap-1.5">
                    {post.author.socialMedia.map((social) => (
                      <Link
                        key={social.slug}
                        aria-label={social.name}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-lineStrong bg-surface transition hover:border-muted hover:bg-white focus:outline-none focus:ring-2 focus:ring-azure/40"
                        href={social.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <Image
                          alt={social.name}
                          className="h-5 w-5 object-contain"
                          height={20}
                          src={`/${social.slug}.png`}
                          width={20}
                        />
                      </Link>
                    ))}
                  </div>
                ) : null}

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
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-subtle md:aspect-[21/9]">
                <Image
                  src={coverImageUrl}
                  alt={post.coverImageAlt ?? post.title}
                  width={1112}
                  height={477}
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                  loading="eager"
                  sizes="(min-width: 1240px) 1112px, 100vw"
                  title={post.coverImageAlt ?? post.title}
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
              <PostContentBlocks blocks={post.content} />

              <div className="mt-11 flex flex-wrap gap-2.5">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href="/materias"
                    className="rounded-full border border-lineStrong px-4 py-1.5 text-[13px] font-medium text-inkSoft transition hover:border-muted hover:bg-subtle"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>

            <div />
          </div>

          <div className="wrap">
            <aside className="relative mx-auto mt-2 grid max-w-[720px] gap-6 rounded-xl border border-line bg-surface p-8 transition hover:border-lineStrong hover:bg-white sm:grid-cols-[84px_1fr]">
              <Link
                aria-label={`Ver perfil de ${post.author.name}`}
                className="absolute inset-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-azure/40"
                href={authorHref}
              />
              <div className="relative">
                {authorAvatarUrl ? (
                  <Image
                    width={84}
                    height={84}
                    src={authorAvatarUrl}
                    alt={post.author.name}
                    className="h-[84px] w-[84px] rounded-full border border-lineStrong bg-subtle object-cover"
                    loading="lazy"
                    title={post.author.name}
                  />
                ) : (
                  <div className="h-[84px] w-[84px] rounded-full border border-lineStrong bg-subtle" />
                )}
              </div>
              <div className="relative">
                <span className="eyebrow mb-2">Sobre o autor</span>
                <h2 className="m-0 font-serif text-2xl font-medium tracking-normal text-ink">
                  {post.author.name}
                </h2>
                <p className="mb-3 mt-1 text-sm text-muted">
                  {post.author.role}
                </p>
                <p className="m-0 text-[15.5px] leading-relaxed text-inkSoft">
                  {post.author.bio}
                </p>
                {post.author.socialMedia.length ? (
                  <div className="relative z-10 mt-5 flex flex-wrap gap-2">
                    {post.author.socialMedia.map((social) => (
                      <a
                        key={social.slug}
                        aria-label={social.name}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-lineStrong bg-card transition hover:border-muted hover:bg-subtle"
                        href={social.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <Image
                          alt=""
                          className="h-5 w-5 object-contain"
                          height={20}
                          src={`/${social.slug}.png`}
                          width={20}
                        />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </article>

        <section className="mt-[clamp(64px,8vw,96px)] border-t border-line bg-subtle py-[clamp(56px,8vw,88px)]">
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
                className="inline-flex items-center gap-2 text-[15px] font-semibold text-navy transition hover:gap-3"
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
