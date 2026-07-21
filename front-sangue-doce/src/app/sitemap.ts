import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    {
      url: `${SITE_URL}/materias`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/receitas`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/guias/antes-da-consulta`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guias/no-mercado`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guias/depois-do-exercicio`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/sobre`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/contato`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacidade`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/termos-de-servico`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/exclusao-de-dados`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const posts = await fetchAllPages((page) => api.posts.list({ page, limit: 50 }), 50)
    .catch(() => []);

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/materias/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const authorsBySlug = new Map(posts.map((post) => [post.author.slug, post.author]));
  const authorRoutes: MetadataRoute.Sitemap = Array.from(authorsBySlug.values()).map((author) => ({
    url: `${SITE_URL}/autores/${author.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const recipes = await fetchAllPages((page) => api.recipes.list({ page, limit: 100 }), 100)
    .catch(() => []);

  const recipeRoutes: MetadataRoute.Sitemap = recipes.map((recipe) => ({
    url: `${SITE_URL}/receitas/${recipe.slug}`,
    lastModified: new Date(recipe.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...postRoutes, ...authorRoutes, ...recipeRoutes];
}
