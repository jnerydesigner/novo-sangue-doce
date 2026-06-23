import type { Post } from "./api";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sanguedoce.com.br";
export const SITE_NAME = "Sangue Doce";
export const SITE_DESCRIPTION =
  "Jornalismo e cuidado sobre diabetes, prevenção, alimentação e saúde metabólica para o dia a dia.";

// Max chars for the %s part of "%s | Sangue Doce" to stay within the 65-char limit
const TITLE_CONTENT_MAX = 65 - SITE_NAME.length - 3; // 3 = " | "

export function truncateMetaTitle(title: string): string {
  if (title.length <= TITLE_CONTENT_MAX) return title;

  return (
    title
      .slice(0, TITLE_CONTENT_MAX - 1)
      .replace(/\s+\S*$/, "")
      .trimEnd() + "…"
  );
}

export function buildArticleJsonLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        image: post.coverImageUrl,
        datePublished: post.publishedAt ?? post.createdAt,
        dateModified: post.updatedAt,
        author: {
          "@type": "Person",
          name: post.author.name,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/sangue-doce-logo.png`,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${SITE_URL}/materias/${post.slug}`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Matérias",
            item: `${SITE_URL}/materias`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: `${SITE_URL}/materias/${post.slug}`,
          },
        ],
      },
    ],
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
      },
      {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/sangue-doce-logo.png`,
        },
      },
    ],
  };
}
