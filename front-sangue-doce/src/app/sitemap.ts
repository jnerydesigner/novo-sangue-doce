import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const baseUrl = SITE_URL.replace(/\/$/, "");

async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<{ data: T[]; meta: { hasNextPage: boolean } }>,
  limit: number,
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;

  do {
    const result = await fetchPage(page);
    items.push(...result.data);
    page += 1;

    if (!result.meta.hasNextPage) return items;
  } while (page <= Math.ceil(10000 / limit));

  return items;
}

function newestDate(items: { updatedAt: string }[]) {
  const newestTimestamp = items.reduce((newest, item) => {
    const timestamp = new Date(item.updatedAt).getTime();

    return Number.isNaN(timestamp) ? newest : Math.max(newest, timestamp);
  }, 0);

  return newestTimestamp ? new Date(newestTimestamp) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchAllPages((page) => api.posts.list({ page, limit: 50 }), 50).catch(
    () => [],
  );
  const recipes = await fetchAllPages((page) => api.recipes.list({ page, limit: 100 }), 100).catch(
    () => [],
  );
  const newestPostDate = newestDate(posts);
  const newestRecipeDate = newestDate(recipes);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    {
      url: `${baseUrl}/articles`,
      lastModified: newestPostDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/recipes`,
      lastModified: newestRecipeDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides/before-appointment`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/at-the-market`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/after-exercise`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/data-deletion`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/articles/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const authorsBySlug = new Map<string, { updatedAt: string }>();

  for (const post of posts) {
    const current = authorsBySlug.get(post.author.slug);

    if (!current || new Date(post.updatedAt) > new Date(current.updatedAt)) {
      authorsBySlug.set(post.author.slug, {
        updatedAt: post.updatedAt,
      });
    }
  }

  const authorRoutes: MetadataRoute.Sitemap = Array.from(authorsBySlug.entries()).map(
    ([slug, author]) => ({
      url: `${baseUrl}/authors/${slug}`,
      lastModified: new Date(author.updatedAt),
      changeFrequency: "monthly",
      priority: 0.5,
    }),
  );

  const recipeRoutes: MetadataRoute.Sitemap = recipes.map((recipe) => ({
    url: `${baseUrl}/recipes/${recipe.slug}`,
    lastModified: new Date(recipe.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...postRoutes, ...authorRoutes, ...recipeRoutes];
}
