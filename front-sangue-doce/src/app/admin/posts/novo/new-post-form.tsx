"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Post, PostAuthor, PostCategory, PostStatus, PostTag } from "@/lib/api";
import { DRAFT_POST_STORAGE_KEY, type DraftPostPreview } from "@/lib/draft-post";
import {
  buildDraftPostPreview,
  createPreviewDraft,
  createSlug,
  EMPTY_COVER_IMAGE_URL,
  getAdminPostBannerJob,
  mapPostToDraft,
  parseInitialRelation,
  queueAdminPostBanner,
  saveAdminPost,
  uploadAdminPostContentImage,
  uploadAdminPostCoverImage,
} from "@/lib/post/new-post-form";
import type { NewPostFormProps } from "@/types/new-post-form-props";
import { CoverImageField } from "./cover-image-field";
import { PostAuthorField } from "./post-author-field";
import { PostContentEditor } from "./post-content-editor";
import { PostTagsField } from "./post-tags-field";

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
  const [readingMinutes, setReadingMinutes] = useState(initialDraft?.readingMinutes ?? 0);
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

  function buildDraft(form: HTMLFormElement): DraftPostPreview {
    const { draft, slug: nextSlug } = buildDraftPostPreview({
      coverImageAlt,
      coverImageUrl,
      currentStatus,
      draftId,
      form,
      selectedAuthor: getSelectedAuthor(),
      selectedCategory: getSelectedCategory(),
      tags,
      title,
    });

    setSlug(nextSlug);

    return draft;
  }

  function savePreviewDraft(draft: DraftPostPreview, post?: Post) {
    const savedAtValue = new Date().toISOString();
    const previewDraft = createPreviewDraft(draft, post, savedAtValue);

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

  async function uploadCoverImage(postId: string): Promise<string | null> {
    if (!selectedCoverFile) {
      return null;
    }

    return uploadAdminPostCoverImage(postId, selectedCoverFile);
  }

  async function ensurePostIdForContentImage(): Promise<string> {
    if (draftId) {
      return draftId;
    }

    if (!formRef.current) {
      throw new Error("Nao foi possivel preparar o rascunho para enviar a imagem.");
    }

    const draft = buildDraft(formRef.current);
    const post = await saveAdminPost(draft, "DRAFT");
    const uploadedCoverUrl = await uploadCoverImage(post.id);
    const savedPost = uploadedCoverUrl ? { ...post, coverImageUrl: uploadedCoverUrl } : post;

    savePreviewDraft(draft, savedPost);

    return savedPost.id;
  }

  async function uploadPostContentImage(file: File): Promise<string> {
    const postId = await ensurePostIdForContentImage();

    return uploadAdminPostContentImage(postId, file);
  }

  async function generateBanner() {
    if (!formRef.current) return;

    setBannerGenerationMessage("");
    setBannerGenerationStatus("saving");

    try {
      const draft = buildDraft(formRef.current);
      const post = await saveAdminPost(draft, "DRAFT");
      savePreviewDraft(draft, post);

      const jobId = await queueAdminPostBanner(post.id);

      setBannerGenerationStatus("queued");

      for (;;) {
        await new Promise((resolve) => window.setTimeout(resolve, 2_000));
        const job = await getAdminPostBannerJob(jobId);

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
          toast.success("Banner gerado e salvo na materia.");
          return;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel gerar o banner.";
      setBannerGenerationStatus("error");
      setBannerGenerationMessage(message);
      toast.error(message);
    }
  }

  async function persistPost(
    draft: DraftPostPreview,
    status: Extract<PostStatus, "DRAFT" | "PUBLISHED">,
  ) {
    setSubmitMessage(null);
    setSubmittingAction(status);

    try {
      const post = await saveAdminPost(draft, status);
      const uploadedCoverUrl = await uploadCoverImage(post.id);
      const savedPost = uploadedCoverUrl ? { ...post, coverImageUrl: uploadedCoverUrl } : post;

      savePreviewDraft(draft, savedPost);

      if (status === "PUBLISHED") {
        setSubmitMessage({
          text: "Materia publicada com sucesso.",
          tone: "success",
        });
        toast.success("Materia publicada com sucesso.");
        return;
      }

      setSubmitMessage({
        text: "Rascunho salvo no banco.",
        tone: "success",
      });
      toast.success("Rascunho salvo no banco.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel salvar a materia.";
      setSubmitMessage({
        text: message,
        tone: "error",
      });
      toast.error(message);
    } finally {
      setSubmittingAction(null);
    }
  }

  async function saveAndPreview(draft: DraftPostPreview) {
    setSubmitMessage(null);
    setPreviewing(true);

    try {
      const status = currentStatus === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
      const post = await saveAdminPost(draft, status);
      const uploadedCoverUrl = await uploadCoverImage(post.id);
      const savedPost = uploadedCoverUrl ? { ...post, coverImageUrl: uploadedCoverUrl } : post;

      savePreviewDraft(draft, savedPost);
      window.location.href =
        status === "PUBLISHED"
          ? `/materias/${savedPost.slug}`
          : `/admin/posts/preview?id=${savedPost.id}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel salvar a materia.";
      setSubmitMessage({
        text: message,
        tone: "error",
      });
      toast.error(message);
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
      <PostAuthorField
        authors={authors}
        onAuthorChange={setSelectedAuthorId}
        selectedAuthorId={selectedAuthorId}
      />
      <label className="grid content-start gap-2 text-sm font-bold text-inkSoft">
        Tempo de leitura
        <input
          className="h-12 cursor-not-allowed rounded-lg border border-line bg-paper2 px-4 text-base font-medium text-inkSoft outline-none"
          name="tempo-de-leitura"
          readOnly
          type="text"
          value={readingMinutes || 1}
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
      <PostTagsField
        onSelectedTagIdsChange={setSelectedTagIds}
        selectedTagIds={selectedTagIds}
        tags={tags}
      />
      <div className="grid gap-2 text-sm font-bold text-inkSoft md:col-span-2">
        <span>Conteudo</span>
        <PostContentEditor
          initialContent={initialDraft?.content}
          onReadingMinutesChange={setReadingMinutes}
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
