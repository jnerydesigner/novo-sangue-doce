"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type SubmitEvent, useRef, useState } from "react";
import type {
  CreateRecipePayload,
  PostAuthor,
  PostCategory,
  PostContentBlock,
  PostStatus,
  PostTag,
  Recipe,
  RecipeImportPreview,
  RecipeIngredient,
  RecipeInstruction,
} from "@/lib/api";
import { CoverImageField } from "../../posts/novo/cover-image-field";
import { PostContentEditor } from "../../posts/novo/post-content-editor";

const fieldClass =
  "h-12 rounded-lg border border-line bg-paper px-4 text-base font-medium text-ink outline-none transition focus:border-green";
const labelClass = "grid content-start gap-2 text-sm font-bold text-inkSoft";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function numberOrUndefined(value: FormDataEntryValue | null) {
  if (!value || !String(value).trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export function RecipeForm({
  authors,
  categories,
  tags,
  initialRecipe,
}: {
  authors: PostAuthor[];
  categories: PostCategory[];
  tags: PostTag[];
  initialRecipe: Recipe | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const post = initialRecipe;
  const [title, setTitle] = useState(post?.title ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? "/no-image.png");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(post?.coverImageUrl ?? "/no-image.png");
  const [coverImageAlt, setCoverImageAlt] = useState(post?.coverImageAlt ?? "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverFileName, setCoverFileName] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    initialRecipe?.ingredients ?? [{ quantity: null, unit: "", name: "", note: "" }],
  );
  const [instructions, setInstructions] = useState<RecipeInstruction[]>(
    initialRecipe?.instructions ?? [{ description: "" }],
  );
  const [busy, setBusy] = useState<PostStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);

  function updateIngredient(index: number, patch: Partial<RecipeIngredient>) {
    setIngredients((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
  }

  function updateInstruction(index: number, description: string) {
    setInstructions((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, description } : item)),
    );
  }

  function setFormValue(name: string, value: string | number | null | undefined) {
    const field = formRef.current?.elements.namedItem(name);
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
      field.value = value == null ? "" : String(value);
    }
  }

  async function importRecipe() {
    if (!importUrl.trim()) return;
    setImporting(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/recipes/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl.trim() }),
      });
      const result = (await response.json().catch(() => null)) as
        | RecipeImportPreview
        | { message?: string }
        | null;
      if (!response.ok || !result) {
        throw new Error(
          result && "message" in result
            ? result.message
            : "Nao foi possivel importar a receita.",
        );
      }
      const preview = result as RecipeImportPreview;
      const imported = preview.recipe;
      setTitle(imported.title);
      setFormValue("excerpt", imported.excerpt);
      setFormValue("prepMinutes", imported.prepMinutes);
      setFormValue("cookMinutes", imported.cookMinutes);
      setFormValue("servings", imported.servings);
      setFormValue("servingSize", imported.servingSize);
      setIngredients(
        imported.ingredients.map((item) => ({
          quantity: item.quantity,
          unit: item.unit,
          name: item.name,
          note: item.note,
        })),
      );
      setInstructions(imported.instructions);
      setFormValue("caloriesKcal", imported.nutrition?.caloriesKcal);
      setFormValue("carbohydratesGrams", imported.nutrition?.carbohydratesGrams);
      setFormValue("fiberGrams", imported.nutrition?.fiberGrams);
      setFormValue("proteinGrams", imported.nutrition?.proteinGrams);
      setFormValue("fatGrams", imported.nutrition?.fatGrams);
      setFormValue("sodiumMg", imported.nutrition?.sodiumMg);
      setMessage(
        preview.warnings.length
          ? `Importada para revisao: ${preview.warnings.join(" ")}`
          : "Receita importada. Revise os dados antes de salvar.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel importar a receita.");
    } finally {
      setImporting(false);
    }
  }

  function buildPayload(form: HTMLFormElement, status: PostStatus): CreateRecipePayload {
    const data = new FormData(form);
    const content = JSON.parse(String(data.get("conteudo") || "[]")) as PostContentBlock[];
    return {
      title: String(data.get("title") || "").trim(),
      slug: String(data.get("slug") || "").trim(),
      excerpt: String(data.get("excerpt") || "").trim(),
      content,
      status,
      featured: false,
      readingMinutes: Number(data.get("readingMinutes") || 5),
      coverImageUrl,
      coverImageAlt: coverImageAlt.trim() || undefined,
      metaTitle: String(data.get("metaTitle") || "").trim() || undefined,
      metaDescription: String(data.get("metaDescription") || "").trim() || undefined,
      publishedAt:
        status === "PUBLISHED" ? (post?.publishedAt ?? new Date().toISOString()) : undefined,
      authorId: String(data.get("authorId") || ""),
      categoryId: String(data.get("categoryId") || ""),
      tagIds: data.getAll("tagIds").map(String),
      prepMinutes: Number(data.get("prepMinutes") || 0),
      cookMinutes: Number(data.get("cookMinutes") || 0),
      servings: Number(data.get("servings") || 1),
      servingSize: String(data.get("servingSize") || "").trim() || undefined,
      difficulty: String(data.get("difficulty") || "EASY") as CreateRecipePayload["difficulty"],
      ingredients: ingredients.filter((item) => item.name.trim()),
      instructions: instructions.filter((item) => item.description.trim()),
      caloriesKcal: numberOrUndefined(data.get("caloriesKcal")),
      carbohydratesGrams: numberOrUndefined(data.get("carbohydratesGrams")),
      fiberGrams: numberOrUndefined(data.get("fiberGrams")),
      proteinGrams: numberOrUndefined(data.get("proteinGrams")),
      fatGrams: numberOrUndefined(data.get("fatGrams")),
      sodiumMg: numberOrUndefined(data.get("sodiumMg")),
    };
  }

  async function save(form: HTMLFormElement, status: PostStatus) {
    setBusy(status);
    setMessage(null);
    try {
      const response = await fetch(
        initialRecipe ? `/api/admin/recipes/${initialRecipe.id}` : "/api/admin/recipes",
        {
          method: initialRecipe ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(form, status)),
        },
      );
      const result = (await response.json().catch(() => null)) as
        | Recipe
        | { message?: string }
        | null;
      if (!response.ok)
        throw new Error(
          result && "message" in result ? result.message : "Nao foi possivel salvar a receita.",
        );
      const recipe = result as Recipe;
      if (coverFile) {
        const uploadData = new FormData();
        uploadData.append("recipeId", recipe.id);
        uploadData.append("image", coverFile);
        const uploadResponse = await fetch("/api/uploads/recipe/cover", {
          body: uploadData,
          method: "POST",
        });
        const uploadResult = (await uploadResponse.json().catch(() => null)) as {
          coverUrl?: string;
          message?: string;
        } | null;
        if (!uploadResponse.ok || !uploadResult?.coverUrl) {
          throw new Error(
            uploadResult?.message ?? "A receita foi salva, mas nao foi possivel enviar a capa.",
          );
        }
        setCoverImageUrl(uploadResult.coverUrl);
        setCoverPreviewUrl(uploadResult.coverUrl);
        setCoverFile(null);
        setCoverFileName("");
      }
      setMessage(status === "PUBLISHED" ? "Receita publicada." : "Rascunho salvo.");
      router.replace(`/admin/receitas/nova?id=${recipe.id}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel salvar a receita.");
    } finally {
      setBusy(null);
    }
  }

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    void save(event.currentTarget, "DRAFT");
  }

  return (
    <form className="grid gap-5" onSubmit={submit} ref={formRef}>
      <section className="rounded-lg border border-line bg-card p-5">
        <h2 className="font-serif text-2xl font-medium">Importar de uma URL</h2>
        <p className="mt-1 max-w-[70ch] text-sm text-muted">
          Cole o endereço de uma receita com dados estruturados. O conteúdo será preenchido como
          rascunho para revisão; a imagem externa não é copiada automaticamente.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="recipe-import-url">
            URL da receita
          </label>
          <input
            className={`${fieldClass} min-w-0 flex-1`}
            id="recipe-import-url"
            onChange={(event) => setImportUrl(event.target.value)}
            placeholder="https://site.com/receita"
            type="url"
            value={importUrl}
          />
          <button
            className="rounded-lg bg-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-azure disabled:cursor-wait disabled:opacity-60"
            disabled={importing || !importUrl.trim()}
            onClick={() => void importRecipe()}
            type="button"
          >
            {importing ? "Importando..." : "Buscar receita"}
          </button>
        </div>
      </section>
      <section className="grid gap-5 rounded-lg border border-line bg-card p-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="font-serif text-2xl font-medium">Base editorial</h2>
          <p className="mt-1 text-sm text-muted">
            Os mesmos campos usados nas materias, agora dentro da feature de receitas.
          </p>
        </div>
        <label className={labelClass}>
          Titulo
          <input
            className={fieldClass}
            name="title"
            onChange={(event) => setTitle(event.target.value)}
            required
            value={title}
          />
        </label>
        <label className={labelClass}>
          Slug
          <input
            className={fieldClass}
            name="slug"
            required
            value={post?.slug ?? slugify(title)}
            readOnly
          />
        </label>
        <label className={`${labelClass} md:col-span-2`}>
          Resumo
          <textarea
            className="min-h-24 rounded-lg border border-line bg-paper px-4 py-3 text-base outline-none focus:border-green"
            defaultValue={post?.excerpt}
            name="excerpt"
            required
          />
        </label>
        <label className={labelClass}>
          Autor
          <select
            className={fieldClass}
            defaultValue={post?.authorId ?? ""}
            name="authorId"
            required
          >
            <option value="">Selecione</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Categoria
          <select
            className={fieldClass}
            defaultValue={post?.categoryId ?? categories[0]?.id}
            name="categoryId"
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Tempo de leitura
          <input
            className={fieldClass}
            defaultValue={post?.readingMinutes ?? 5}
            min="1"
            name="readingMinutes"
            type="number"
          />
        </label>
        <div className="md:col-span-2">
          <CoverImageField
            altText={coverImageAlt}
            fileName={coverFileName}
            generationStatus="idle"
            imageUrl={coverPreviewUrl}
            onAltTextChange={setCoverImageAlt}
            onRemoveImage={() => {
              setCoverFile(null);
              setCoverFileName("");
              setCoverImageUrl("/no-image.png");
              setCoverPreviewUrl("/no-image.png");
            }}
            onSelectImage={(file) => {
              setCoverFile(file);
              setCoverFileName(file.name);
              setCoverPreviewUrl(URL.createObjectURL(file));
            }}
          />
        </div>
        <fieldset className="md:col-span-2">
          <legend className="mb-2 text-sm font-bold text-inkSoft">Tags</legend>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <label
                className="rounded-full border border-lineStrong px-3 py-1.5 text-sm font-semibold"
                key={tag.id}
              >
                <input
                  className="mr-2"
                  defaultChecked={post?.tags.some((item) => item.id === tag.id)}
                  name="tagIds"
                  type="checkbox"
                  value={tag.id}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="grid gap-5 rounded-lg border border-line bg-card p-5 md:grid-cols-4">
        <div className="md:col-span-4">
          <h2 className="font-serif text-2xl font-medium">Ficha da receita</h2>
          <p className="mt-1 text-sm text-muted">
            Tempos e rendimento ajudam o leitor a decidir e planejar.
          </p>
        </div>
        <label className={labelClass}>
          Preparo (min)
          <input
            className={fieldClass}
            defaultValue={initialRecipe?.prepMinutes ?? 10}
            min="0"
            name="prepMinutes"
            type="number"
          />
        </label>
        <label className={labelClass}>
          Cozimento (min)
          <input
            className={fieldClass}
            defaultValue={initialRecipe?.cookMinutes ?? 0}
            min="0"
            name="cookMinutes"
            type="number"
          />
        </label>
        <label className={labelClass}>
          Porcoes
          <input
            className={fieldClass}
            defaultValue={initialRecipe?.servings ?? 2}
            min="1"
            name="servings"
            type="number"
          />
        </label>
        <label className={labelClass}>
          Dificuldade
          <select
            className={fieldClass}
            defaultValue={initialRecipe?.difficulty ?? "EASY"}
            name="difficulty"
          >
            <option value="EASY">Facil</option>
            <option value="MEDIUM">Media</option>
            <option value="HARD">Avancada</option>
          </select>
        </label>
        <label className={`${labelClass} md:col-span-2`}>
          Tamanho da porcao
          <input
            className={fieldClass}
            defaultValue={initialRecipe?.servingSize ?? ""}
            name="servingSize"
            placeholder="Ex.: 1 prato (250 g)"
          />
        </label>
      </section>

      <section className="rounded-lg border border-line bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-medium">Ingredientes</h2>
            <p className="mt-1 text-sm text-muted">
              Informe quantidades referentes ao rendimento total.
            </p>
          </div>
          <button
            className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-bold"
            onClick={() =>
              setIngredients((items) => [
                ...items,
                { quantity: null, unit: "", name: "", note: "" },
              ])
            }
            type="button"
          >
            Adicionar
          </button>
        </div>
        <div className="mt-5 grid gap-3">
          {ingredients.map((item, index) => (
            <div
              className="grid gap-2 rounded-lg bg-paper2 p-3 md:grid-cols-[110px_150px_1fr_1fr_auto]"
              key={`ingredient-${index}`}
            >
              <input
                aria-label="Quantidade"
                className={fieldClass}
                min="0"
                onChange={(event) =>
                  updateIngredient(index, {
                    quantity: event.target.value ? Number(event.target.value) : null,
                  })
                }
                placeholder="Qtd."
                step="0.01"
                type="number"
                value={item.quantity ?? ""}
              />
              <input
                aria-label="Unidade"
                className={fieldClass}
                onChange={(event) => updateIngredient(index, { unit: event.target.value })}
                placeholder="Unidade"
                value={item.unit ?? ""}
              />
              <input
                aria-label="Ingrediente"
                className={fieldClass}
                onChange={(event) => updateIngredient(index, { name: event.target.value })}
                placeholder="Ingrediente"
                value={item.name}
              />
              <input
                aria-label="Observacao"
                className={fieldClass}
                onChange={(event) => updateIngredient(index, { note: event.target.value })}
                placeholder="Ex.: picado"
                value={item.note ?? ""}
              />
              <button
                aria-label={`Remover ingrediente ${index + 1}`}
                className="px-3 text-sm font-bold text-tomato"
                onClick={() =>
                  setIngredients((items) => items.filter((_, itemIndex) => itemIndex !== index))
                }
                type="button"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-medium">Modo de preparo</h2>
            <p className="mt-1 text-sm text-muted">
              Uma acao clara por etapa facilita acompanhar durante o preparo.
            </p>
          </div>
          <button
            className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-bold"
            onClick={() => setInstructions((items) => [...items, { description: "" }])}
            type="button"
          >
            Adicionar etapa
          </button>
        </div>
        <ol className="mt-5 grid gap-3">
          {instructions.map((item, index) => (
            <li
              className="grid grid-cols-[36px_1fr_auto] items-center gap-3"
              key={`instruction-${index}`}
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-sm font-bold text-white">
                {index + 1}
              </span>
              <textarea
                aria-label={`Etapa ${index + 1}`}
                className="min-h-20 rounded-lg border border-line bg-paper px-4 py-3 outline-none focus:border-green"
                onChange={(event) => updateInstruction(index, event.target.value)}
                value={item.description}
              />
              <button
                className="px-2 text-sm font-bold text-tomato"
                onClick={() =>
                  setInstructions((items) => items.filter((_, itemIndex) => itemIndex !== index))
                }
                type="button"
              >
                Remover
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 rounded-lg border border-line bg-card p-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <h2 className="font-serif text-2xl font-medium">Nutricao por porcao</h2>
          <p className="mt-1 text-sm text-muted">
            Preencha apenas valores revisados. Campos vazios nao serao publicados.
          </p>
        </div>
        {[
          ["caloriesKcal", "Calorias (kcal)"],
          ["carbohydratesGrams", "Carboidratos (g)"],
          ["fiberGrams", "Fibras (g)"],
          ["proteinGrams", "Proteinas (g)"],
          ["fatGrams", "Gorduras (g)"],
          ["sodiumMg", "Sodio (mg)"],
        ].map(([name, label]) => (
          <label className={labelClass} key={name}>
            {label}
            <input
              className={fieldClass}
              defaultValue={(initialRecipe?.[name as keyof Recipe] as number) ?? ""}
              min="0"
              name={name}
              step="0.01"
              type="number"
            />
          </label>
        ))}
      </section>

      <section className="rounded-lg border border-line bg-card p-5">
        <h2 className="font-serif text-2xl font-medium">Conteudo complementar</h2>
        <p className="mb-4 mt-1 text-sm text-muted">
          Use o mesmo editor de blocos das materias para contexto, substituicoes e dicas.
        </p>
        <PostContentEditor initialContent={post?.content} />
      </section>

      <section className="grid gap-4 rounded-lg border border-line bg-card p-5 md:grid-cols-2">
        <label className={labelClass}>
          Titulo SEO
          <input className={fieldClass} defaultValue={post?.metaTitle ?? ""} name="metaTitle" />
        </label>
        <label className={labelClass}>
          Descricao SEO
          <input
            className={fieldClass}
            defaultValue={post?.metaDescription ?? ""}
            name="metaDescription"
          />
        </label>
      </section>

      <div className="sticky bottom-3 flex flex-wrap items-center justify-end gap-3 rounded-lg border border-line bg-card p-4 shadow-editorial">
        {message ? (
          <p aria-live="polite" className="mr-auto text-sm font-semibold text-inkSoft">
            {message}
          </p>
        ) : null}
        <Link
          className="rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold"
          href="/admin/receitas"
        >
          Cancelar
        </Link>
        <button
          className="rounded-lg bg-green px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          disabled={busy !== null}
          type="submit"
        >
          {busy === "DRAFT" ? "Salvando..." : "Salvar rascunho"}
        </button>
        <button
          className="rounded-lg bg-tomato px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          disabled={busy !== null}
          onClick={(event) => {
            event.preventDefault();
            if (event.currentTarget.form) void save(event.currentTarget.form, "PUBLISHED");
          }}
          type="button"
        >
          {busy === "PUBLISHED" ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </form>
  );
}
