import Image from "next/image";
import Link from "next/link";
import { PostContentBlocks } from "@/components/articles/post-content-blocks";
import type { Post } from "@/lib/api";
import { formatPostDate } from "@/lib/posts";
import { resolvePublicImageUrl } from "@/lib/public-image-url";
import { PublishPostButton } from "./publish-post-button";

type DraftPreviewProps = {
  post: Post | null;
};

const statusCopy = {
  ARCHIVED: {
    className: "border-lineStrong bg-paper2 text-muted",
    label: "Arquivado",
    meta: "Arquivado",
  },
  DRAFT: {
    className: "border-tomato/30 bg-[#f7e9e4] text-tomato",
    label: "Rascunho",
    meta: "Previa",
  },
  PUBLISHED: {
    className: "border-green/30 bg-green/10 text-greenDeep",
    label: "Publicado",
    meta: "Publicado",
  },
} as const;

export function DraftPreview({ post }: DraftPreviewProps) {
  if (!post) {
    return (
      <div className="rounded-lg border border-line bg-card p-6">
        <h2 className="font-serif text-2xl font-medium tracking-normal">
          Nenhum rascunho encontrado
        </h2>
        <p className="mt-2 text-inkSoft">
          Crie uma materia e salve a previa para visualizar antes de publicar.
        </p>
        <Link
          className="mt-5 inline-flex rounded-lg bg-green px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-greenDeep"
          href="/admin/posts/novo"
        >
          Criar materia
        </Link>
      </div>
    );
  }

  const status = statusCopy[post.status];
  const authorAvatarUrl = resolvePublicImageUrl(post.author?.avatarUrl);
  const coverImageUrl = resolvePublicImageUrl(post.coverImageUrl);

  return (
    <article className="overflow-hidden rounded-lg border border-line bg-paper">
      <div className="border-b border-line bg-card px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span
              className={`rounded-full border px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.07em] ${status.className}`}
            >
              {status.label}
            </span>
            <span className="ml-3 text-sm text-muted">
              Salvo em {formatPostDate(post.updatedAt)}
            </span>
            <span className="ml-3 text-sm font-semibold text-inkSoft">/{post.slug}</span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <PublishPostButton post={post} />
            <Link
              className="rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold text-inkSoft transition hover:-translate-y-px hover:bg-paper2"
              href={`/admin/posts/novo?id=${post.id}`}
            >
              Editar
            </Link>
          </div>
        </div>
      </div>

      <div className="px-[clamp(18px,5vw,56px)] py-8">
        <div className="mx-auto max-w-[880px] text-center">
          <span className="inline-block rounded-full bg-[#eaf1e8] px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.07em] text-greenDeep">
            {post.category?.name ?? "Sem categoria"}
          </span>
          <h1 className="mx-auto mt-5 max-w-[20ch] text-balance font-serif text-[clamp(2.1rem,4.6vw,3.6rem)] font-medium leading-[1.05] tracking-normal text-ink">
            {post.title}
          </h1>
          <p className="mx-auto mt-5 max-w-[56ch] text-pretty font-serif text-[clamp(1.18rem,2.1vw,1.5rem)] leading-[1.5] text-inkSoft">
            {post.excerpt}
          </p>
          {post.tags?.length ? (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {post.tags.map((tag) => (
                <span
                  className="rounded-full border border-lineStrong px-3 py-1 text-[12px] font-semibold text-inkSoft"
                  key={tag.id}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {authorAvatarUrl ? (
              <Image
                alt={post.author.name}
                className="rounded-full border border-lineStrong object-cover"
                height={50}
                loading="lazy"
                src={authorAvatarUrl}
                title={post.author.name}
                width={50}
              />
            ) : (
              <div className="grid h-[50px] w-[50px] place-items-center rounded-full border border-lineStrong bg-paper2 text-sm font-bold text-greenDeep">
                {(post.author?.name ?? "?")
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part.charAt(0))
                  .join("")
                  .toUpperCase()}
              </div>
            )}
            <div className="text-left">
              <div className="text-[15.5px] font-semibold text-ink">
                {post.author?.name ?? "Autor desconhecido"}
              </div>
              <div className="text-[13.5px] text-muted">{post.author?.role ?? "Editorial"}</div>
            </div>
            <span className="hidden h-8 w-px bg-lineStrong sm:block" />
            <div className="flex items-center gap-2 text-[13.5px] text-muted">
              <span>{status.meta}</span>
              <span className="h-[3px] w-[3px] rounded-full bg-lineStrong" />
              <span>{post.readingMinutes} min de leitura</span>
            </div>
          </div>
        </div>

        <figure className="mt-9">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-paper2 md:aspect-[21/9]">
            <Image
              src={coverImageUrl}
              alt={post.coverImageAlt ?? ""}
              width={1112}
              height={477}
              className="h-full w-full object-cover"
              fetchPriority="high"
              loading="eager"
              sizes="(min-width: 1240px) 1112px, 100vw"
              title={post.coverImageAlt ?? post.title}
            />
          </div>
        </figure>

        <div className="mx-auto max-w-[720px] py-[clamp(48px,7vw,76px)]">
          <div className="article-prose text-[1.16rem] leading-[1.72] text-inkSoft">
            <PostContentBlocks blocks={post.content} />
          </div>
        </div>
      </div>
    </article>
  );
}
