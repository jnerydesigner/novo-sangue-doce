"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PostAccentColor } from "@/lib/api";

type TaxonomyFormProps = {
  type: "category" | "tag";
};

type FormState = {
  color: PostAccentColor;
  name: string;
  slug: string;
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

export function TaxonomyForm({ type }: TaxonomyFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    color: "GREEN",
    name: "",
    slug: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isCategory = type === "category";

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      const response = await fetch(
        isCategory ? "/api/admin/taxonomy/categories" : "/api/admin/taxonomy/tags",
        {
          body: JSON.stringify({
            color: formState.color,
            name: formState.name.trim(),
            slug: formState.slug.trim(),
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setSuccessMessage(isCategory ? "Categoria criada." : "Tag criada.");
      setFormState({ color: "GREEN", name: "", slug: "" });
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="rounded-lg border border-line bg-card p-5" onSubmit={submitForm}>
      <span className="eyebrow">{isCategory ? "Nova categoria" : "Nova tag"}</span>
      <h2 className="mt-3 font-serif text-2xl font-medium tracking-normal text-ink">
        {isCategory ? "Criar categoria" : "Criar tag"}
      </h2>

      <div className="mt-5 grid gap-4">
        <label className="block text-[13px] font-semibold text-muted" htmlFor={`${type}Name`}>
          Nome
          <input
            className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
            id={`${type}Name`}
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

        <label className="block text-[13px] font-semibold text-muted" htmlFor={`${type}Slug`}>
          Slug
          <input
            className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
            id={`${type}Slug`}
            onChange={(event) =>
              setFormState((current) => ({ ...current, slug: slugify(event.target.value) }))
            }
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
            type="text"
            value={formState.slug}
          />
        </label>

        {isCategory ? (
          <label className="block text-[13px] font-semibold text-muted" htmlFor="categoryColor">
            Cor
            <select
              className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition focus:border-green"
              id="categoryColor"
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
        {submitting ? "Salvando..." : isCategory ? "Criar categoria" : "Criar tag"}
      </button>
    </form>
  );
}
