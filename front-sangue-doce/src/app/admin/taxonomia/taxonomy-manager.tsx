"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PostAccentColor, PostCategory, PostTag } from "@/lib/api";

type TaxonomyItem =
  | (PostCategory & {
      type: "category";
    })
  | (PostTag & {
      type: "tag";
      color?: never;
    });

type TaxonomyManagerProps = {
  categories: PostCategory[];
  tags: PostTag[];
};

type ModalState =
  | {
      mode: "create";
      type: TaxonomyItem["type"];
      item?: never;
    }
  | {
      mode: "edit";
      type: TaxonomyItem["type"];
      item: TaxonomyItem;
    };

type FormState = {
  color: PostAccentColor;
  name: string;
  slug: string;
};

const colorLabel: Record<PostAccentColor, string> = {
  BLUE: "Azul",
  GREEN: "Verde",
  TOMATO: "Tomate",
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Nao foi possivel salvar.";
  }

  try {
    const parsed = JSON.parse(error.message) as {
      message?: string | string[];
    };

    if (Array.isArray(parsed.message)) {
      return parsed.message.join(" ");
    }

    return parsed.message ?? error.message;
  } catch {
    return error.message;
  }
}

export function TaxonomyManager({ categories, tags }: TaxonomyManagerProps) {
  const router = useRouter();
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [formState, setFormState] = useState<FormState>({ color: "GREEN", name: "", slug: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openModal = (nextModalState: ModalState) => {
    setErrorMessage("");
    setSuccessMessage("");
    setModalState(nextModalState);
    setFormState({
      color: nextModalState.item?.color ?? "GREEN",
      name: nextModalState.item?.name ?? "",
      slug: nextModalState.item?.slug ?? "",
    });
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setModalState(null);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!modalState) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    const isCategory = modalState.type === "category";
    const path =
      modalState.mode === "edit"
        ? `/api/admin/taxonomy/${isCategory ? "categories" : "tags"}/${modalState.item.id}`
        : `/api/admin/taxonomy/${isCategory ? "categories" : "tags"}`;

    try {
      const response = await fetch(path, {
        body: JSON.stringify({
          color: formState.color,
          name: formState.name.trim(),
          slug: formState.slug.trim(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: modalState.mode === "edit" ? "PATCH" : "POST",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setSuccessMessage(isCategory ? "Categoria salva." : "Tag salva.");
      router.refresh();
      setTimeout(() => {
        setModalState(null);
        setSuccessMessage("");
      }, 450);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-lg border border-line bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="font-serif text-2xl font-medium tracking-normal text-ink">
                Categorias
              </h2>
              <p className="mt-1 text-sm text-inkSoft">
                {categories.length} categorias cadastradas
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => openModal({ mode: "create", type: "category" })}
              type="button"
            >
              Nova categoria
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-paper2 text-[12px] uppercase tracking-[0.08em] text-muted">
                  <th className="px-5 py-3 font-bold">Nome</th>
                  <th className="px-5 py-3 font-bold">Slug</th>
                  <th className="px-5 py-3 font-bold">Cor</th>
                  <th className="px-5 py-3 text-right font-bold">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr className="border-b border-line last:border-b-0" key={category.id}>
                    <td className="px-5 py-4 font-semibold text-ink">{category.name}</td>
                    <td className="px-5 py-4 text-inkSoft">{category.slug}</td>
                    <td className="px-5 py-4 text-inkSoft">{colorLabel[category.color]}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-bold text-greenDeep transition hover:-translate-y-px hover:bg-paper2"
                        onClick={() =>
                          openModal({
                            item: { ...category, type: "category" },
                            mode: "edit",
                            type: "category",
                          })
                        }
                        type="button"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="font-serif text-2xl font-medium tracking-normal text-ink">Tags</h2>
              <p className="mt-1 text-sm text-inkSoft">{tags.length} tags cadastradas</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => openModal({ mode: "create", type: "tag" })}
              type="button"
            >
              Nova tag
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-paper2 text-[12px] uppercase tracking-[0.08em] text-muted">
                  <th className="px-5 py-3 font-bold">Nome</th>
                  <th className="px-5 py-3 font-bold">Slug</th>
                  <th className="px-5 py-3 text-right font-bold">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag) => (
                  <tr className="border-b border-line last:border-b-0" key={tag.id}>
                    <td className="px-5 py-4 font-semibold text-ink">{tag.name}</td>
                    <td className="px-5 py-4 text-inkSoft">{tag.slug}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-bold text-greenDeep transition hover:-translate-y-px hover:bg-paper2"
                        onClick={() =>
                          openModal({
                            item: { ...tag, type: "tag" },
                            mode: "edit",
                            type: "tag",
                          })
                        }
                        type="button"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {modalState ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-ink/35 px-4 py-6"
          role="dialog"
        >
          <form
            className="w-full max-w-xl rounded-lg border border-line bg-card p-5 shadow-editorial"
            onSubmit={submitForm}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="eyebrow">
                  {modalState.type === "category" ? "Categoria" : "Tag"}
                </span>
                <h2 className="mt-3 font-serif text-2xl font-medium tracking-normal text-ink">
                  {modalState.mode === "edit" ? "Editar" : "Criar"}{" "}
                  {modalState.type === "category" ? "categoria" : "tag"}
                </h2>
              </div>
              <button
                className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-bold text-inkSoft transition hover:bg-paper2 hover:text-ink"
                onClick={closeModal}
                type="button"
              >
                Fechar
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="block text-[13px] font-semibold text-muted" htmlFor="taxonomyName">
                Nome
                <input
                  className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
                  id="taxonomyName"
                  minLength={2}
                  onChange={(event) => {
                    const value = event.target.value;

                    setFormState((current) => ({
                      ...current,
                      name: value,
                      slug: slugify(value),
                    }));
                  }}
                  required
                  type="text"
                  value={formState.name}
                />
              </label>

              <label className="block text-[13px] font-semibold text-muted" htmlFor="taxonomySlug">
                Slug
                <input
                  className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
                  id="taxonomySlug"
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, slug: slugify(event.target.value) }))
                  }
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  required
                  type="text"
                  value={formState.slug}
                />
              </label>

              {modalState.type === "category" ? (
                <label
                  className="block text-[13px] font-semibold text-muted"
                  htmlFor="taxonomyColor"
                >
                  Cor
                  <select
                    className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition focus:border-green"
                    id="taxonomyColor"
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        color: event.target.value as PostAccentColor,
                      }))
                    }
                    value={formState.color}
                  >
                    <option value="GREEN">Verde</option>
                    <option value="TOMATO">Tomate</option>
                    <option value="BLUE">Azul</option>
                  </select>
                </label>
              ) : null}
            </div>

            {errorMessage ? (
              <p className="mt-4 rounded-lg border border-tomato/30 bg-tomato/10 px-4 py-3 text-[14px] font-semibold text-tomato">
                {errorMessage}
              </p>
            ) : null}

            {successMessage ? (
              <p className="mt-4 rounded-lg border border-green/30 bg-green/10 px-4 py-3 text-[14px] font-semibold text-greenDeep">
                {successMessage}
              </p>
            ) : null}

            <button
              className="btn btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-65"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Salvando..." : "Salvar"}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
