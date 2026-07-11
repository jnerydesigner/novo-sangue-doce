"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CreatePostPayload, Post } from "@/lib/api";
import { toPublicImagePath } from "@/lib/public-image-url";

type PublishPostButtonProps = {
  post: Post;
};

function optionalString(value: string | null | undefined): string | undefined {
  return value?.trim() || undefined;
}

function buildPublishPayload(post: Post): CreatePostPayload {
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
    publishedAt: post.publishedAt ?? new Date().toISOString(),
    readingMinutes: post.readingMinutes,
    slug: post.slug,
    status: "PUBLISHED",
    tagIds: post.tags.map((tag) => tag.id),
    title: post.title,
    verticalImageUrl: post.verticalImageUrl ? toPublicImagePath(post.verticalImageUrl) : undefined,
  };
}

export function PublishPostButton({ post }: PublishPostButtonProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function publishPost() {
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/posts/${post.id}`, {
        body: JSON.stringify(buildPublishPayload(post)),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { message?: string } | null;

        throw new Error(error?.message ?? "Nao foi possivel publicar a materia.");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel publicar.");
    } finally {
      setSubmitting(false);
    }
  }

  if (post.status === "PUBLISHED") {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {errorMessage ? (
        <span className="text-sm font-semibold text-tomato">{errorMessage}</span>
      ) : null}
      <button
        className="rounded-lg bg-green px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-greenDeep disabled:cursor-not-allowed disabled:opacity-60"
        disabled={submitting}
        onClick={publishPost}
        type="button"
      >
        {submitting ? "Publicando..." : "Publicar"}
      </button>
    </div>
  );
}
