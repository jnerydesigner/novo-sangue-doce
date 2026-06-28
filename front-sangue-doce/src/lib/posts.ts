import type { Post, PostAccentColor } from "./api";
import { resolvePublicImageUrl } from "./public-image-url";

export type ArticleSummary = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  color: "green" | "tomato" | "blue";
  meta: string;
  image: string;
  imageVertical: string;
};

const colorMap: Record<PostAccentColor, ArticleSummary["color"]> = {
  BLUE: "blue",
  GREEN: "green",
  TOMATO: "tomato",
};

export function mapPostToArticle(post: Post): ArticleSummary {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    tag: post.category.name,
    color: colorMap[post.category.color],
    meta: `Por ${post.author.name} | ${post.readingMinutes} min de leitura`,
    image: resolvePublicImageUrl(post.coverImageUrl),
    imageVertical: resolvePublicImageUrl(post.verticalImageUrl ?? post.coverImageUrl),
  };
}

export function formatPostDate(value?: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
