"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

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

      <div className="overflow-x-auto">
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
            {posts.map((post) => {
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
    </div>
  );
}
