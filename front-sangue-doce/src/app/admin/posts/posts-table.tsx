"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { CreatePostPayload, Post, PostStatus } from "@/lib/api";
import { formatPostDate } from "@/lib/posts";
import { toPublicImagePath } from "@/lib/public-image-url";

type PostsTableProps = {
  posts: Post[];
};

const statusLabels: Record<PostStatus, string> = {
  ARCHIVED: "Arquivado",
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
};

const statusClasses: Record<PostStatus, string> = {
  ARCHIVED: "border-lineStrong bg-paper2 text-muted",
  DRAFT: "border-tomato/30 bg-[#f7e9e4] text-tomato",
  PUBLISHED: "border-green/30 bg-green/10 text-greenDeep",
};

function optionalString(value: string | null | undefined): string | undefined {
  return value?.trim() || undefined;
}

function buildPayload(post: Post, status: PostStatus): CreatePostPayload {
  return {
    authorId: post.authorId,
    categoryId: post.categoryId,
    content: post.content.map((block) =>
      block.type === "image" ? { ...block, src: toPublicImagePath(block.src) } : block,
    ),
    coverCaption: optionalString(post.coverCaption),
    coverImageAlt: optionalString(post.coverImageAlt),
    coverImageUrl: toPublicImagePath(post.coverImageUrl),
    excerpt: post.excerpt,
    featured: post.featured,
    metaDescription: optionalString(post.metaDescription),
    metaTitle: optionalString(post.metaTitle),
    publishedAt:
      status === "PUBLISHED" ? (post.publishedAt ?? new Date().toISOString()) : undefined,
    readingMinutes: post.readingMinutes,
    slug: post.slug,
    status,
    tagIds: post.tags.map((tag) => tag.id),
    title: post.title,
    verticalImageUrl: post.verticalImageUrl ? toPublicImagePath(post.verticalImageUrl) : undefined,
  };
}

export function PostsTable({ posts }: PostsTableProps) {
  const router = useRouter();
  const [busyPostId, setBusyPostId] = useState<string | null>(null);
  const [generatingPostId, setGeneratingPostId] = useState<string | null>(null);
  const [desktopPage, setDesktopPage] = useState(1);
  const [mobilePage, setMobilePage] = useState(1);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const mobilePageSize = 5;
  const desktopPageSize = 5;
  const desktopPageCount = Math.max(1, Math.ceil(posts.length / desktopPageSize));
  const mobilePageCount = Math.max(1, Math.ceil(posts.length / mobilePageSize));
  const currentDesktopPage = Math.min(desktopPage, desktopPageCount);
  const currentMobilePage = Math.min(mobilePage, mobilePageCount);
  const desktopPosts = useMemo(
    () =>
      posts.slice((currentDesktopPage - 1) * desktopPageSize, currentDesktopPage * desktopPageSize),
    [currentDesktopPage, posts],
  );
  const mobilePosts = useMemo(
    () => posts.slice((currentMobilePage - 1) * mobilePageSize, currentMobilePage * mobilePageSize),
    [currentMobilePage, posts],
  );

  async function updateStatus(post: Post, status: PostStatus) {
    setBusyPostId(post.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/posts/${post.id}`, {
        body: JSON.stringify(buildPayload(post, status)),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;

        throw new Error(error?.message ?? "Nao foi possivel atualizar a materia.");
      }

      router.refresh();
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Nao foi possivel atualizar a materia.",
      });
    } finally {
      setBusyPostId(null);
    }
  }

  async function generateSocialPublication(post: Post) {
    setGeneratingPostId(post.id);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/social-publications", {
        body: JSON.stringify({ postId: post.id }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;

        throw new Error(error?.message ?? "Nao foi possivel gerar a publicacao social.");
      }

      setMessage({
        tone: "success",
        text: `Publicacao social de “${post.title}” enviada para geracao.`,
      });
    } catch (error) {
      setMessage({
        tone: "error",
        text:
          error instanceof Error ? error.message : "Nao foi possivel gerar a publicacao social.",
      });
    } finally {
      setGeneratingPostId(null);
    }
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-card p-6">
        <h2 className="font-serif text-2xl font-medium tracking-normal text-ink">
          Nenhuma materia cadastrada
        </h2>
        <p className="mt-2 text-inkSoft">
          Crie o primeiro rascunho para comecar a organizar o editorial.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-card">
      {message ? (
        <div
          aria-live="polite"
          className={`border-b border-line px-4 py-3 text-sm font-semibold ${
            message.tone === "success" ? "bg-green/10 text-greenDeep" : "bg-[#f7e9e4] text-tomato"
          }`}
          role="status"
        >
          {message.text}
        </div>
      ) : null}

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-[980px] w-full border-collapse text-left">
          <thead className="bg-paper2 text-[12px] uppercase tracking-[0.08em] text-muted">
            <tr>
              <th className="px-4 py-3 font-bold">Materia</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Categoria</th>
              <th className="px-4 py-3 font-bold">Autor</th>
              <th className="px-4 py-3 font-bold">Atualizado</th>
              <th className="px-4 py-3 text-right font-bold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {desktopPosts.map((post) => {
              const busy = busyPostId === post.id;
              const generating = generatingPostId === post.id;
              const rowBusy = busy || generating;

              return (
                <tr className="align-top" key={post.id}>
                  <td className="max-w-[340px] px-4 py-4">
                    <div className="font-serif text-[1.2rem] font-medium leading-tight text-ink">
                      {post.title}
                    </div>
                    <div className="mt-1 truncate text-sm text-muted">/{post.slug}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClasses[post.status]}`}
                    >
                      {statusLabels[post.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-inkSoft">
                    {post.category.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-inkSoft">{post.author.name}</td>
                  <td className="px-4 py-4 text-sm text-muted">{formatPostDate(post.updatedAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold text-inkSoft transition hover:bg-paper2"
                        href={`/admin/posts/novo?id=${post.id}`}
                      >
                        Editar
                      </Link>
                      {post.status === "PUBLISHED" ? (
                        <>
                          <Link
                            className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold text-inkSoft transition hover:bg-paper2"
                            href={`/materias/${post.slug}`}
                          >
                            Ver site
                          </Link>
                          <button
                            className="rounded-lg border border-green px-3 py-2 text-sm font-bold text-greenDeep transition hover:bg-green/10 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={rowBusy}
                            onClick={() => generateSocialPublication(post)}
                            type="button"
                          >
                            {generating ? "Gerando..." : "Gerar para redes"}
                          </button>
                        </>
                      ) : (
                        <Link
                          className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold text-inkSoft transition hover:bg-paper2"
                          href={`/admin/posts/preview?id=${post.id}`}
                        >
                          Previa
                        </Link>
                      )}
                      <button
                        className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold text-inkSoft transition hover:bg-paper2 disabled:opacity-50"
                        disabled={rowBusy}
                        onClick={() =>
                          updateStatus(post, post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")
                        }
                        type="button"
                      >
                        {post.status === "PUBLISHED" ? "Rascunho" : "Publicar"}
                      </button>
                      {post.status !== "ARCHIVED" ? (
                        <button
                          className="rounded-lg bg-tomato px-3 py-2 text-sm font-bold text-white transition hover:bg-[#a94735] disabled:opacity-50"
                          disabled={rowBusy}
                          onClick={() => updateStatus(post, "ARCHIVED")}
                          type="button"
                        >
                          Arquivar
                        </button>
                      ) : (
                        <button
                          className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold text-inkSoft transition hover:bg-paper2 disabled:opacity-50"
                          disabled={rowBusy}
                          onClick={() => updateStatus(post, "DRAFT")}
                          type="button"
                        >
                          Restaurar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {desktopPageCount > 1 ? (
        <Pagination
          className="hidden border-t border-line px-4 py-4 lg:flex"
          page={currentDesktopPage}
          pageCount={desktopPageCount}
          setPage={setDesktopPage}
        />
      ) : null}

      <div className="grid min-w-0 gap-4 p-4 lg:hidden">
        {mobilePosts.map((post) => {
          const busy = busyPostId === post.id;
          const generating = generatingPostId === post.id;
          const rowBusy = busy || generating;

          return (
            <article
              className="min-w-0 overflow-hidden rounded-lg border border-line bg-card p-4"
              key={post.id}
            >
              <div className="border-b border-line pb-4">
                <h2 className="break-words font-serif text-xl font-medium leading-tight text-ink">
                  {post.title}
                </h2>
                <p className="mt-1 truncate text-sm text-muted">/{post.slug}</p>
              </div>

              <dl className="grid gap-3 py-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-bold text-muted">Status</dt>
                  <dd>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClasses[post.status]}`}
                    >
                      {statusLabels[post.status]}
                    </span>
                  </dd>
                </div>
                <div className="flex min-w-0 items-start justify-between gap-4">
                  <dt className="font-bold text-muted">Categoria</dt>
                  <dd className="min-w-0 break-words text-right font-semibold text-inkSoft">
                    {post.category.name}
                  </dd>
                </div>
                <div className="flex min-w-0 items-center justify-between gap-4">
                  <dt className="font-bold text-muted">Autor</dt>
                  <dd className="min-w-0 break-words text-right text-inkSoft">
                    {post.author.name}
                  </dd>
                </div>
                <div className="flex min-w-0 items-center justify-between gap-4">
                  <dt className="font-bold text-muted">Atualizado</dt>
                  <dd className="shrink-0 text-right text-muted">
                    {formatPostDate(post.updatedAt)}
                  </dd>
                </div>
              </dl>

              <div className="grid min-w-0 gap-2 border-t border-line pt-4 sm:grid-cols-2">
                <Link
                  className="w-full min-w-0 whitespace-normal break-words rounded-lg border border-lineStrong px-3 py-2 text-center text-sm font-semibold text-inkSoft transition hover:bg-paper2"
                  href={`/admin/posts/novo?id=${post.id}`}
                >
                  Editar
                </Link>
                {post.status === "PUBLISHED" ? (
                  <>
                    <Link
                      className="w-full min-w-0 whitespace-normal break-words rounded-lg border border-lineStrong px-3 py-2 text-center text-sm font-semibold text-inkSoft transition hover:bg-paper2"
                      href={`/materias/${post.slug}`}
                    >
                      Ver site
                    </Link>
                    <button
                      className="w-full min-w-0 whitespace-normal break-words rounded-lg border border-green px-3 py-2 text-sm font-bold text-greenDeep transition hover:bg-green/10 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={rowBusy}
                      onClick={() => generateSocialPublication(post)}
                      type="button"
                    >
                      {generating ? "Gerando..." : "Gerar para redes"}
                    </button>
                  </>
                ) : (
                  <Link
                    className="w-full min-w-0 whitespace-normal break-words rounded-lg border border-lineStrong px-3 py-2 text-center text-sm font-semibold text-inkSoft transition hover:bg-paper2"
                    href={`/admin/posts/preview?id=${post.id}`}
                  >
                    Previa
                  </Link>
                )}
                <button
                  className="w-full min-w-0 whitespace-normal break-words rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold text-inkSoft transition hover:bg-paper2 disabled:opacity-50"
                  disabled={rowBusy}
                  onClick={() =>
                    updateStatus(post, post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")
                  }
                  type="button"
                >
                  {post.status === "PUBLISHED" ? "Rascunho" : "Publicar"}
                </button>
                <button
                  className="w-full min-w-0 whitespace-normal break-words rounded-lg bg-tomato px-3 py-2 text-sm font-bold text-white transition hover:bg-[#a94735] disabled:opacity-50"
                  disabled={rowBusy}
                  onClick={() =>
                    updateStatus(post, post.status === "ARCHIVED" ? "DRAFT" : "ARCHIVED")
                  }
                  type="button"
                >
                  {post.status === "ARCHIVED" ? "Restaurar" : "Arquivar"}
                </button>
              </div>
            </article>
          );
        })}

        {mobilePageCount > 1 ? (
          <Pagination
            className="flex pt-2 lg:hidden"
            page={currentMobilePage}
            pageCount={mobilePageCount}
            setPage={setMobilePage}
          />
        ) : null}
      </div>
    </div>
  );
}

function Pagination({
  className,
  page,
  pageCount,
  setPage,
}: {
  className: string;
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
}) {
  return (
    <nav
      aria-label="Paginação de matérias"
      className={`flex-wrap items-center justify-center gap-2 ${className}`}
    >
      <button
        className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold text-inkSoft disabled:cursor-not-allowed disabled:opacity-40"
        disabled={page === 1}
        onClick={() => setPage(Math.max(1, page - 1))}
        type="button"
      >
        Anterior
      </button>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
        <button
          aria-current={page === pageNumber ? "page" : undefined}
          className={`grid h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm font-bold ${
            page === pageNumber
              ? "border-green bg-green/10 text-greenDeep"
              : "border-lineStrong text-inkSoft hover:bg-paper2"
          }`}
          key={pageNumber}
          onClick={() => setPage(pageNumber)}
          type="button"
        >
          {pageNumber}
        </button>
      ))}
      <button
        className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold text-inkSoft disabled:cursor-not-allowed disabled:opacity-40"
        disabled={page === pageCount}
        onClick={() => setPage(Math.min(pageCount, page + 1))}
        type="button"
      >
        Próxima
      </button>
    </nav>
  );
}
