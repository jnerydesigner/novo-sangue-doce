import type {
  CreatePostPayload,
  Post,
  PostAuthor,
  PostCategory,
  PostContentBlock,
  PostStatus,
  PostTag,
} from "@/lib/api";
import type { DraftPostPreview } from "@/lib/draft-post";
import { toPublicImagePath } from "@/lib/public-image-url";

export const EMPTY_COVER_IMAGE_URL = "/images/sensor.png";

export type PostBannerJob = {
  message?: string;
  result?: { coverImageAlt?: string; coverImageUrl?: string };
  status?: "queued" | "processing" | "completed" | "failed";
};

type BuildDraftPostPreviewParams = {
  coverImageAlt: string;
  coverImageUrl: string;
  currentStatus: PostStatus;
  draftId: string;
  form: HTMLFormElement;
  selectedAuthor: PostAuthor | null;
  selectedCategory: PostCategory | null;
  tags: PostTag[];
  title: string;
};

export function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseInitialRelation<T extends { id: string }>(
  value: unknown,
  items: T[],
): T | null {
  if (!value || typeof value !== "object" || !("id" in value)) return null;

  const id = String(value.id);

  return items.find((item) => item.id === id) ?? null;
}

export function mapPostToDraft(post: Post): DraftPostPreview {
  return {
    author: post.author,
    category: post.category,
    content: post.content,
    coverImageAlt: post.coverImageAlt ?? "",
    coverImageUrl: post.coverImageUrl,
    excerpt: post.excerpt,
    id: post.id,
    readingMinutes: post.readingMinutes,
    savedAt: post.updatedAt,
    slug: post.slug,
    status: post.status,
    tags: post.tags,
    title: post.title,
  };
}

function getValue(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function parseContent(value: string): PostContentBlock[] {
  try {
    const content = JSON.parse(value);

    return Array.isArray(content) ? content : [];
  } catch {
    return [];
  }
}

function normalizeContentImagePaths(content: PostContentBlock[]): PostContentBlock[] {
  return content.map((block) =>
    block.type === "image" ? { ...block, src: toPublicImagePath(block.src) } : block,
  );
}

function getReadableBlockText(block: PostContentBlock) {
  if (block.type === "list" || block.type === "ordered-list") {
    return block.items.join(" ");
  }

  if (block.type === "link") {
    return [block.label, block.text].filter(Boolean).join(" ");
  }

  if (block.type === "image") {
    return [block.alt, block.caption].filter(Boolean).join(" ");
  }

  if (block.type === "callout") {
    return [block.title, block.content].filter(Boolean).join(" ");
  }

  return block.content;
}

export function calculateReadingMinutes(content: PostContentBlock[], wordsPerMinute = 200) {
  const text = content.map(getReadableBlockText).join(" ");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  if (wordCount === 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function buildDraftPostPreview({
  coverImageAlt,
  coverImageUrl,
  currentStatus,
  draftId,
  form,
  selectedAuthor,
  selectedCategory,
  tags,
  title,
}: BuildDraftPostPreviewParams): { draft: DraftPostPreview; slug: string } {
  const formData = new FormData(form);
  const readingMinutes = Number(getValue(formData, "tempo-de-leitura"));
  const titleValue = getValue(formData, "titulo") || title.trim() || "Materia em rascunho";
  const slugValue = createSlug(titleValue) || "rascunho";
  const tagIds = formData
    .getAll("tagIds")
    .filter((value): value is string => typeof value === "string");
  const now = new Date().toISOString();

  return {
    draft: {
      id: draftId || undefined,
      author: selectedAuthor,
      category: selectedCategory,
      content: parseContent(getValue(formData, "conteudo")),
      coverImageAlt: coverImageAlt.trim() || undefined,
      coverImageUrl: coverImageUrl || EMPTY_COVER_IMAGE_URL,
      excerpt:
        getValue(formData, "resumo") ||
        "Resumo da materia em rascunho para validar chamada e leitura.",
      readingMinutes: Number.isFinite(readingMinutes) && readingMinutes > 0 ? readingMinutes : 5,
      savedAt: now,
      slug: slugValue,
      status: currentStatus,
      tags: tags.filter((tag) => tagIds.includes(tag.id)),
      title: titleValue,
    },
    slug: slugValue,
  };
}

export function createPreviewDraft(
  draft: DraftPostPreview,
  post: Post | undefined,
  savedAt: string,
) {
  return {
    ...draft,
    author: post?.author ?? draft.author,
    category: post?.category ?? draft.category,
    id: post?.id ?? draft.id,
    savedAt,
    status: post?.status ?? draft.status,
    tags: post?.tags ?? draft.tags,
  } satisfies DraftPostPreview;
}

export function buildPostPayload(
  draft: DraftPostPreview,
  status: Extract<PostStatus, "DRAFT" | "PUBLISHED">,
): CreatePostPayload {
  if (!draft.author?.id) {
    throw new Error("Selecione um autor antes de salvar.");
  }

  if (!draft.category?.id) {
    throw new Error("Selecione uma categoria antes de salvar.");
  }

  return {
    authorId: draft.author.id,
    categoryId: draft.category.id,
    content: normalizeContentImagePaths(draft.content),
    coverImageAlt: draft.coverImageAlt,
    coverImageUrl: toPublicImagePath(draft.coverImageUrl),
    excerpt: draft.excerpt,
    publishedAt: status === "PUBLISHED" ? new Date().toISOString() : undefined,
    readingMinutes: draft.readingMinutes,
    slug: draft.slug,
    status,
    tagIds: draft.tags.map((tag) => tag.id),
    title: draft.title,
  };
}

export async function saveAdminPost(
  draft: DraftPostPreview,
  status: Extract<PostStatus, "DRAFT" | "PUBLISHED">,
): Promise<Post> {
  const url = draft.id ? `/api/admin/posts/${draft.id}` : "/api/admin/posts";
  const method = draft.id ? "PATCH" : "POST";
  const response = await fetch(url, {
    body: JSON.stringify(buildPostPayload(draft, status)),
    headers: {
      "Content-Type": "application/json",
    },
    method,
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { message?: string } | null;

    throw new Error(error?.message ?? "Nao foi possivel salvar a materia.");
  }

  return (await response.json()) as Post;
}

export async function uploadAdminPostCoverImage(postId: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("postId", postId);
  formData.append("image", file);

  const response = await fetch("/api/uploads/post/cover", {
    body: formData,
    method: "POST",
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { message?: string } | null;

    throw new Error(error?.message ?? "Nao foi possivel enviar a imagem de capa.");
  }

  const upload = (await response.json()) as { coverUrl: string };

  return upload.coverUrl;
}

export async function uploadAdminPostContentImage(postId: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("postId", postId);
  formData.append("image", file);

  const response = await fetch("/api/uploads/post/images", {
    body: formData,
    method: "POST",
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { message?: string } | null;

    throw new Error(error?.message ?? "Nao foi possivel enviar a imagem da materia.");
  }

  const upload = (await response.json()) as { imageUrl: string };

  return upload.imageUrl;
}

export async function queueAdminPostBanner(postId: string): Promise<string> {
  const response = await fetch("/api/admin/post-banners", {
    body: JSON.stringify({ postId }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const queued = (await response.json().catch(() => null)) as {
    jobId?: string;
    message?: string;
  } | null;

  if (!response.ok || !queued?.jobId) {
    throw new Error(queued?.message ?? "Nao foi possivel adicionar o banner a fila.");
  }

  return queued.jobId;
}

export async function getAdminPostBannerJob(jobId: string): Promise<PostBannerJob> {
  const response = await fetch(`/api/admin/post-banners/${jobId}`);
  const job = (await response.json().catch(() => null)) as PostBannerJob | null;

  if (!response.ok) {
    throw new Error(job?.message ?? "Nao foi possivel acompanhar a geracao do banner.");
  }

  return job ?? {};
}
