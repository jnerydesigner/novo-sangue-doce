import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/home/article-card";
import { ArrowIcon } from "@/components/home/icons";
import { PublicSiteHeader } from "@/components/home/public-site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { api } from "@/lib/api";
import { mapPostToArticle } from "@/lib/posts";
import { resolvePublicImageUrl } from "@/lib/public-image-url";
import { SITE_NAME, SITE_URL, truncateMetaTitle } from "@/lib/seo";

type AuthorPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await api.authors.getBySlug(slug).catch(() => null);

  if (!author) {
    return {};
  }

  const title = truncateMetaTitle(`${author.name} | ${SITE_NAME}`);
  const description = author.bio ?? `${author.name}, ${author.role} no ${SITE_NAME}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/autores/${author.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/autores/${author.slug}`,
      siteName: SITE_NAME,
      images: author.avatarUrl
        ? [
            {
              url: resolvePublicImageUrl(author.avatarUrl),
              alt: author.name,
            },
          ]
        : undefined,
    },
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = await api.authors.getBySlug(slug).catch(() => null);

  if (!author) {
    notFound();
  }

  const posts = await api.posts
    .listByAuthor(author.id)
    .then((items) => items.map(mapPostToArticle))
    .catch(() => []);
  const avatarUrl = resolvePublicImageUrl(author.avatarUrl);

  return (
    <>
      <PublicSiteHeader />
      <main>
        <section className="wrap py-[clamp(48px,7vw,88px)]">
          <nav
            aria-label="Trilha"
            className="mb-8 flex flex-wrap items-center gap-2 text-[13.5px] font-medium text-muted"
          >
            <Link className="transition hover:text-navy" href="/">
              Inicio
            </Link>
            <span>/</span>
            <Link className="transition hover:text-navy" href="/materias">
              Materias
            </Link>
            <span>/</span>
            <span>{author.name}</span>
          </nav>

          <div className="grid gap-8 rounded-xl border border-line bg-surface p-[clamp(24px,4vw,44px)] md:grid-cols-[132px_1fr]">
            {avatarUrl ? (
              <Image
                alt={author.name}
                className="h-[132px] w-[132px] rounded-full border border-lineStrong bg-subtle object-cover"
                height={132}
                priority
                src={avatarUrl}
                title={author.name}
                width={132}
              />
            ) : (
              <div className="h-[132px] w-[132px] rounded-full border border-lineStrong bg-subtle" />
            )}

            <div className="max-w-[70ch]">
              <span className="eyebrow">Autor</span>
              <h1 className="mt-3 text-balance font-serif text-[clamp(2.1rem,4.8vw,4rem)] font-medium leading-[1.04] tracking-normal text-ink">
                {author.name}
              </h1>
              <p className="mt-2 text-[1rem] font-semibold text-navy">{author.role}</p>
              {author.bio ? (
                <p className="mt-5 text-pretty text-[1.08rem] leading-8 text-inkSoft">{author.bio}</p>
              ) : null}

              {author.socialMedia.length ? (
                <div className="mt-7 flex flex-wrap gap-2.5">
                  {author.socialMedia.map((social) => (
                    <a
                      key={social.slug}
                      className="inline-flex items-center gap-2 rounded-lg border border-lineStrong bg-card px-3 py-2 text-sm font-semibold text-inkSoft transition hover:border-muted hover:bg-subtle"
                      href={social.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <img
                        alt=""
                        className="h-5 w-5 object-contain"
                        height={20}
                        src={`/${social.slug}.png`}
                        width={20}
                      />
                      {social.name}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="border-t border-line bg-subtle py-[clamp(56px,8vw,88px)]">
          <div className="wrap">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
              <div>
                <span className="eyebrow">Publicacoes</span>
                <h2 className="mt-3 font-serif text-[clamp(1.8rem,3.2vw,2.5rem)] font-medium leading-[1.05] tracking-normal text-ink">
                  Materias de {author.name}
                </h2>
              </div>
              <Link
                className="inline-flex items-center gap-2 text-[15px] font-semibold text-navy transition hover:gap-3"
                href="/materias"
              >
                Todas as materias
                <span className="h-4 w-4">
                  <ArrowIcon />
                </span>
              </Link>
            </div>

            {posts.length ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {posts.map((item, index) => (
                  <ArticleCard key={item.slug} article={item} seq={index + 1} />
                ))}
              </div>
            ) : (
              <p className="max-w-[60ch] rounded-xl border border-line bg-surface p-6 text-inkSoft">
                Este autor ainda nao possui materias publicadas.
              </p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
