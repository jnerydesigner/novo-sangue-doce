"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import type {
  CreatePostPayload,
  Post,
  PostAuthor,
  PostCategory,
  PostContentBlock,
  PostStatus,
  PostTag,
} from "@/lib/api";
import { DRAFT_POST_STORAGE_KEY, type DraftPostPreview } from "@/lib/draft-post";
import { resolvePublicImageUrl, toPublicImagePath } from "@/lib/public-image-url";
import { CoverImageField } from "./cover-image-field";
import { PostContentEditor } from "./post-content-editor";

const EMPTY_COVER_IMAGE_URL = "/images/sensor.png";

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

function createSlug(value: string) {
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

function normalizeContentImagePaths(content: PostContentBlock[]): PostContentBlock[] {
  return content.map((block) =>
    block.type === "image" ? { ...block, src: toPublicImagePath(block.src) } : block,
  );
}

type NewPostFormProps = {
  authors: PostAuthor[];
  categories: PostCategory[];
  initialPost?: Post | null;
  tags: PostTag[];
};

function parseInitialRelation<T extends { id: string }>(value: unknown, items: T[]): T | null {
  if (!value || typeof value !== "object" || !("id" in value)) return null;

  const id = String(value.id);

  return items.find((item) => item.id === id) ?? null;
}

function mapPostToDraft(post: Post): DraftPostPreview {
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

export function NewPostForm({ authors, categories, initialPost, tags }: NewPostFormProps) {
  const initialDraft = initialPost ? mapPostToDraft(initialPost) : null;

  return (
    <NewPostFormFields
      authors={authors}
      categories={categories}
      initialDraft={initialDraft}
      key={initialDraft?.id ?? initialDraft?.savedAt ?? "empty-draft"}
      tags={tags}
    />
  );
}

function NewPostFormFields({
  authors,
  categories,
  initialDraft,
  tags,
}: {
  authors: PostAuthor[];
  categories: PostCategory[];
  initialDraft: DraftPostPreview | null;
  tags: PostTag[];
}) {
  const [title, setTitle] = useState(initialDraft?.title ?? "");
  const [slug, setSlug] = useState(initialDraft?.slug ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialDraft?.coverImageUrl === EMPTY_COVER_IMAGE_URL
      ? ""
      : (initialDraft?.coverImageUrl ?? ""),
  );
  const [coverImageAlt, setCoverImageAlt] = useState(initialDraft?.coverImageAlt ?? "");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(
    initialDraft?.coverImageUrl === EMPTY_COVER_IMAGE_URL
      ? ""
      : (initialDraft?.coverImageUrl ?? ""),
  );
  const [coverFileName, setCoverFileName] = useState("");
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [draftId, setDraftId] = useState(initialDraft?.id ?? "");
  const formRef = useRef<HTMLFormElement | null>(null);
  const [currentStatus, setCurrentStatus] = useState<PostStatus>(initialDraft?.status ?? "DRAFT");
  const [savedAt, setSavedAt] = useState<string | null>(initialDraft?.savedAt ?? null);
  const [submitMessage, setSubmitMessage] = useState<{
    tone: "error" | "success";
    text: string;
  } | null>(null);
  const [submittingAction, setSubmittingAction] = useState<PostStatus | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [bannerGenerationStatus, setBannerGenerationStatus] = useState<
    "idle" | "saving" | "queued" | "processing" | "error"
  >("idle");
  const [bannerGenerationMessage, setBannerGenerationMessage] = useState("");
  const initialAuthor = parseInitialRelation(initialDraft?.author, authors);
  const initialCategory = parseInitialRelation(initialDraft?.category, categories);
  const [selectedAuthorId, setSelectedAuthorId] = useState(initialAuthor?.id ?? "");
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialCategory?.id ?? categories[0]?.id ?? "",
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    Array.isArray(initialDraft?.tags) ? initialDraft.tags.map((tag) => tag.id) : [],
  );

  useEffect(() => {
    return () => {
      if (coverPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  function selectCoverImage(file: File) {
    if (coverPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreviewUrl);
    }

    setSelectedCoverFile(file);
    setCoverFileName(file.name);
    setCoverPreviewUrl(URL.createObjectURL(file));
  }

  function removeCoverImage() {
    if (coverPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreviewUrl);
    }

    setCoverImageUrl("");
    setCoverPreviewUrl("");
    setCoverFileName("");
    setSelectedCoverFile(null);
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    setSlug(createSlug(value));
  }

  function getSelectedAuthor() {
    return authors.find((author) => author.id === selectedAuthorId) ?? null;
  }

  function getSelectedCategory() {
    return categories.find((category) => category.id === selectedCategoryId) ?? null;
  }

  function getSelectedTags(tagIds: string[]) {
    return tags.filter((tag) => tagIds.includes(tag.id));
  }

  function buildDraft(form: HTMLFormElement): DraftPostPreview {
    const formData = new FormData(form);
    const readingMinutes = Number(getValue(formData, "tempo-de-leitura"));
    const titleValue = getValue(formData, "titulo") || title.trim() || "Materia em rascunho";
    const slugValue = createSlug(titleValue) || "rascunho";
    const tagIds = formData
      .getAll("tagIds")
      .filter((value): value is string => typeof value === "string");
    const now = new Date().toISOString();
    const draft: DraftPostPreview = {
      id: draftId || undefined,
      author: getSelectedAuthor(),
      category: getSelectedCategory(),
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
      tags: getSelectedTags(tagIds),
      title: titleValue,
    };

    setSlug(slugValue);

    return draft;
  }

  function savePreviewDraft(draft: DraftPostPreview, post?: Post) {
    const savedAtValue = new Date().toISOString();
    const previewDraft: DraftPostPreview = {
      ...draft,
      author: post?.author ?? draft.author,
      category: post?.category ?? draft.category,
      id: post?.id ?? draft.id,
      savedAt: savedAtValue,
      status: post?.status ?? draft.status,
      tags: post?.tags ?? draft.tags,
    };

    if (post?.id) {
      setDraftId(post.id);
    }

    if (post?.coverImageUrl && post.coverImageUrl !== EMPTY_COVER_IMAGE_URL) {
      setCoverImageUrl(post.coverImageUrl);
      setCoverPreviewUrl(post.coverImageUrl);
      setCoverFileName("");
      setSelectedCoverFile(null);
    }

    if (post?.status) {
      setCurrentStatus(post.status);
    }

    setSavedAt(savedAtValue);

    try {
      localStorage.setItem(DRAFT_POST_STORAGE_KEY, JSON.stringify(previewDraft));
    } catch {
      // A persistencia real do rascunho fica na API; esta copia serve apenas para a previa.
    }
  }

  function buildPostPayload(
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

  async function savePost(
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
      const error = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      throw new Error(error?.message ?? "Nao foi possivel salvar a materia.");
    }

    return (await response.json()) as Post;
  }

  async function uploadCoverImage(postId: string): Promise<string | null> {
    if (!selectedCoverFile) {
      return null;
    }

    const formData = new FormData();
    formData.append("postId", postId);
    formData.append("image", selectedCoverFile);

    const response = await fetch("/api/uploads/post/cover", {
      body: formData,
      method: "POST",
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      throw new Error(error?.message ?? "Nao foi possivel enviar a imagem de capa.");
    }

    const upload = (await response.json()) as { coverUrl: string };

    return upload.coverUrl;
  }

  async function ensurePostIdForContentImage(): Promise<string> {
    if (draftId) {
      return draftId;
    }

    if (!formRef.current) {
      throw new Error("Nao foi possivel preparar o rascunho para enviar a imagem.");
    }

    const draft = buildDraft(formRef.current);
    const post = await savePost(draft, "DRAFT");
    const uploadedCoverUrl = await uploadCoverImage(post.id);
    const savedPost = uploadedCoverUrl ? { ...post, coverImageUrl: uploadedCoverUrl } : post;

    savePreviewDraft(draft, savedPost);

    return savedPost.id;
  }

  async function uploadPostContentImage(file: File): Promise<string> {
    const postId = await ensurePostIdForContentImage();
    const formData = new FormData();
    formData.append("postId", postId);
    formData.append("image", file);

    const response = await fetch("/api/uploads/post/images", {
      body: formData,
      method: "POST",
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      throw new Error(error?.message ?? "Nao foi possivel enviar a imagem da materia.");
    }

    const upload = (await response.json()) as { imageUrl: string };

    return upload.imageUrl;
  }

  async function generateBanner() {
    if (!formRef.current) return;

    setBannerGenerationMessage("");
    setBannerGenerationStatus("saving");

    try {
      const draft = buildDraft(formRef.current);
      const post = await savePost(draft, "DRAFT");
      savePreviewDraft(draft, post);

      const response = await fetch("/api/admin/post-banners", {
        body: JSON.stringify({ postId: post.id }),
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

      setBannerGenerationStatus("queued");

      for (;;) {
        await new Promise((resolve) => window.setTimeout(resolve, 2_000));
        const statusResponse = await fetch(`/api/admin/post-banners/${queued.jobId}`);
        const job = (await statusResponse.json().catch(() => null)) as {
          status?: "queued" | "processing" | "completed" | "failed";
          result?: { coverImageAlt?: string; coverImageUrl?: string };
          message?: string;
        } | null;

        if (!statusResponse.ok) {
          throw new Error(job?.message ?? "Nao foi possivel acompanhar a geracao do banner.");
        }

        if (job?.status === "processing") setBannerGenerationStatus("processing");
        if (job?.status === "failed") {
          throw new Error(job.message ?? "Nao foi possivel gerar o banner.");
        }

        if (job?.status === "completed" && job.result?.coverImageUrl) {
          setCoverImageUrl(job.result.coverImageUrl);
          setCoverPreviewUrl(job.result.coverImageUrl);
          if (job.result.coverImageAlt) setCoverImageAlt(job.result.coverImageAlt);
          setCoverFileName("");
          setSelectedCoverFile(null);
          setBannerGenerationStatus("idle");
          setBannerGenerationMessage("Banner gerado e salvo na materia.");
          return;
        }
      }
    } catch (error) {
      setBannerGenerationStatus("error");
      setBannerGenerationMessage(
        error instanceof Error ? error.message : "Nao foi possivel gerar o banner.",
      );
    }
  }

  async function persistPost(
    draft: DraftPostPreview,
    status: Extract<PostStatus, "DRAFT" | "PUBLISHED">,
  ) {
    setSubmitMessage(null);
    setSubmittingAction(status);

    try {
      const post = await savePost(draft, status);
      const uploadedCoverUrl = await uploadCoverImage(post.id);
      const savedPost = uploadedCoverUrl ? { ...post, coverImageUrl: uploadedCoverUrl } : post;

      savePreviewDraft(draft, savedPost);

      if (status === "PUBLISHED") {
        setSubmitMessage({
          text: "Materia publicada com sucesso.",
          tone: "success",
        });
        return;
      }

      setSubmitMessage({
        text: "Rascunho salvo no banco.",
        tone: "success",
      });
    } catch (error) {
      setSubmitMessage({
        text: error instanceof Error ? error.message : "Nao foi possivel salvar a materia.",
        tone: "error",
      });
    } finally {
      setSubmittingAction(null);
    }
  }

  async function saveAndPreview(draft: DraftPostPreview) {
    setSubmitMessage(null);
    setPreviewing(true);

    try {
      const status = currentStatus === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
      const post = await savePost(draft, status);
      const uploadedCoverUrl = await uploadCoverImage(post.id);
      const savedPost = uploadedCoverUrl ? { ...post, coverImageUrl: uploadedCoverUrl } : post;

      savePreviewDraft(draft, savedPost);
      window.location.href =
        status === "PUBLISHED"
          ? `/materias/${savedPost.slug}`
          : `/admin/posts/preview?id=${savedPost.id}`;
    } catch (error) {
      setSubmitMessage({
        text: error instanceof Error ? error.message : "Nao foi possivel salvar a materia.",
        tone: "error",
      });
      setPreviewing(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void persistPost(buildDraft(event.currentTarget), "DRAFT");
  }

  function handlePreview(form: HTMLFormElement | null) {
    if (!form) return;

    void saveAndPreview(buildDraft(form));
  }

  const previewButtonText = currentStatus === "PUBLISHED" ? "Ver site" : "Ver previa";
  const previewingButtonText =
    currentStatus === "PUBLISHED" ? "Abrindo site..." : "Salvando previa...";

  return (
    <form
      className="grid gap-5 rounded-lg border border-line bg-card p-5 md:grid-cols-2"
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <label className="grid gap-2 text-sm font-bold text-inkSoft">
        Titulo
        <input
          className="h-12 rounded-lg border border-line bg-paper px-4 text-base font-medium text-ink outline-none transition focus:border-green"
          name="titulo"
          onChange={(event) => handleTitleChange(event.target.value)}
          type="text"
          value={title}
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-inkSoft">
        Slug
        <input name="slug" type="hidden" value={slug} />
        <input
          className="h-12 cursor-not-allowed rounded-lg border border-line bg-paper2 px-4 text-base font-medium text-inkSoft outline-none"
          disabled
          type="text"
          value={slug || createSlug(title)}
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-inkSoft">
        Resumo
        <input
          className="h-12 rounded-lg border border-line bg-paper px-4 text-base font-medium text-ink outline-none transition focus:border-green"
          defaultValue={initialDraft?.excerpt}
          name="resumo"
          type="text"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-inkSoft">
        Categoria
        <select
          className="h-12 rounded-lg border border-line bg-paper px-4 text-base font-medium text-ink outline-none transition focus:border-green"
          name="categoria"
          onChange={(event) => setSelectedCategoryId(event.target.value)}
          value={selectedCategoryId}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid content-start gap-2 text-sm font-bold text-inkSoft">
        Autor
        <select
          className="h-12 rounded-lg border border-line bg-paper px-4 text-base font-medium text-ink outline-none transition focus:border-green"
          name="autor"
          onChange={(event) => setSelectedAuthorId(event.target.value)}
          value={selectedAuthorId}
        >
          <option value="">Selecione um autor</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name}
            </option>
          ))}
        </select>
        {getSelectedAuthor() && (
          <div className="flex items-center gap-3 rounded-lg border border-line bg-paper2 px-3 py-2.5">
            {resolvePublicImageUrl(getSelectedAuthor()?.avatarUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={getSelectedAuthor()?.name ?? ""}
                className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
                height={36}
                loading="lazy"
                src={resolvePublicImageUrl(getSelectedAuthor()?.avatarUrl)}
                title={getSelectedAuthor()?.name ?? ""}
                width={36}
              />
            ) : (
              <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-lineStrong bg-paper text-xs font-bold text-greenDeep">
                {(getSelectedAuthor()?.name ?? "")
                  .split(" ")
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-ink">
                {getSelectedAuthor()?.name}
              </div>
              <div className="truncate text-xs font-normal text-muted">
                {getSelectedAuthor()?.role}
              </div>
            </div>
          </div>
        )}
      </div>
      <label className="grid content-start gap-2 text-sm font-bold text-inkSoft">
        Tempo de leitura
        <input
          className="h-12 rounded-lg border border-line bg-paper px-4 text-base font-medium text-ink outline-none transition focus:border-green"
          defaultValue={initialDraft?.readingMinutes}
          name="tempo-de-leitura"
          type="text"
        />
      </label>
      <div className="grid gap-2 text-sm font-bold text-inkSoft md:col-span-2">
        <CoverImageField
          altText={coverImageAlt}
          fileName={coverFileName}
          imageUrl={coverPreviewUrl}
          onAltTextChange={setCoverImageAlt}
          onRemoveImage={removeCoverImage}
          onSelectImage={selectCoverImage}
          onGenerateImage={() => void generateBanner()}
          generationStatus={bannerGenerationStatus}
          generationMessage={bannerGenerationMessage}
        />
      </div>
      <div className="grid gap-2 text-sm font-bold text-inkSoft md:col-span-2">
        Tags
        <div className="flex flex-wrap gap-2 rounded-lg border border-line bg-paper p-3">
          {tags.map((tag) => {
            const checked = selectedTagIds.includes(tag.id);

            return (
              <label
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                  checked
                    ? "border-green/30 bg-green/10 text-greenDeep"
                    : "border-lineStrong text-inkSoft"
                }`}
                key={tag.id}
              >
                <input
                  checked={checked}
                  className="sr-only"
                  name="tagIds"
                  onChange={(event) => {
                    setSelectedTagIds((current) =>
                      event.target.checked
                        ? Array.from(new Set([...current, tag.id]))
                        : current.filter((id) => id !== tag.id),
                    );
                  }}
                  type="checkbox"
                  value={tag.id}
                />
                {tag.name}
              </label>
            );
          })}
        </div>
      </div>
      <div className="grid gap-2 text-sm font-bold text-inkSoft md:col-span-2">
        <span>Conteudo</span>
        <PostContentEditor
          initialContent={initialDraft?.content}
          onUploadImage={uploadPostContentImage}
        />
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3 md:col-span-2">
        {savedAt && (
          <span className="mr-auto text-sm text-inkSoft">
            Rascunho salvo as{" "}
            {new Date(savedAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
        {submitMessage ? (
          <span
            className={`mr-auto text-sm font-semibold ${
              submitMessage.tone === "error" ? "text-tomato" : "text-greenDeep"
            }`}
          >
            {submitMessage.text}
          </span>
        ) : null}
        <button
          className="rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold text-inkSoft transition hover:-translate-y-px hover:bg-paper2"
          disabled={submittingAction !== null || previewing}
          onClick={(event) => handlePreview(event.currentTarget.form)}
          type="button"
        >
          {previewing ? previewingButtonText : previewButtonText}
        </button>
        <Link
          className="rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold text-inkSoft transition hover:-translate-y-px hover:bg-paper2"
          href="/admin"
        >
          Cancelar
        </Link>
        <button
          className="rounded-lg bg-green px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-greenDeep"
          disabled={submittingAction !== null || previewing}
          type="submit"
        >
          {submittingAction === "DRAFT" ? "Salvando..." : "Salvar rascunho"}
        </button>
        <button
          className="rounded-lg bg-tomato px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#a94735]"
          disabled={submittingAction !== null || previewing}
          onClick={(event) => {
            event.preventDefault();
            if (!event.currentTarget.form) return;

            void persistPost(buildDraft(event.currentTarget.form), "PUBLISHED");
          }}
          type="button"
        >
          {submittingAction === "PUBLISHED" ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </form>
  );
}
