"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AuthorSocialMedia, PostAuthor } from "@/lib/api";

type AuthorProfileFormProps = {
  author: PostAuthor;
};

type FormState = {
  bio: string;
  role: string;
  socialMedia: AuthorSocialMedia[];
};

const emptySocialMedia = (): AuthorSocialMedia => ({
  name: "",
  slug: "",
  url: "",
});

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
    return "Nao foi possivel atualizar o perfil de autor.";
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

export function AuthorProfileForm({ author }: AuthorProfileFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    bio: author.bio ?? "",
    role: author.role,
    socialMedia: author.socialMedia?.length ? author.socialMedia : [emptySocialMedia()],
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = <Field extends keyof FormState>(field: Field, value: FormState[Field]) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const updateSocialMedia = (
    index: number,
    field: keyof AuthorSocialMedia,
    value: string,
  ) => {
    setFormState((current) => ({
      ...current,
      socialMedia: current.socialMedia.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        const next = { ...item, [field]: value };

        if (field === "name") {
          next.slug = slugify(value);
        }

        if (field === "slug") {
          next.slug = slugify(value);
        }

        return next;
      }),
    }));
  };

  const addSocialMedia = () => {
    setFormState((current) => ({
      ...current,
      socialMedia: [...current.socialMedia, emptySocialMedia()],
    }));
  };

  const removeSocialMedia = (index: number) => {
    setFormState((current) => ({
      ...current,
      socialMedia: current.socialMedia.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/authors/me", {
        body: JSON.stringify({
          bio: formState.bio.trim() || null,
          role: formState.role,
          socialMedia: formState.socialMedia
            .map((item, index) => ({
              name: item.name.trim(),
              slug: slugify(item.slug),
              url: item.url.trim(),
              position: index,
            }))
            .filter((item) => item.name && item.slug && item.url),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setSuccessMessage("Perfil de autor atualizado.");
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="mt-6 grid gap-5" onSubmit={submitForm}>
      <label className="block text-[13px] font-semibold text-muted" htmlFor="authorRole">
        Tagline / cargo editorial
        <input
          className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
          id="authorRole"
          minLength={2}
          name="authorRole"
          onChange={(event) => updateField("role", event.target.value)}
          required
          type="text"
          value={formState.role}
        />
      </label>

      <label className="block text-[13px] font-semibold text-muted" htmlFor="authorBio">
        Bio
        <textarea
          className="mt-2 min-h-36 block w-full resize-y rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base leading-7 text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
          id="authorBio"
          minLength={10}
          name="authorBio"
          onChange={(event) => updateField("bio", event.target.value)}
          placeholder="Conte um pouco sobre sua experiencia, foco editorial e relacao com o Sangue Doce."
          value={formState.bio}
        />
      </label>

      <fieldset className="grid gap-3 rounded-lg border border-lineStrong bg-paper p-4">
        <legend className="px-1 text-[13px] font-semibold text-muted">Redes sociais</legend>
        {formState.socialMedia.map((item, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_1.5fr_auto]">
            <input
              aria-label="Nome da rede social"
              className="block w-full rounded-lg border border-lineStrong bg-card px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
              onChange={(event) => updateSocialMedia(index, "name", event.target.value)}
              placeholder="Linkedin"
              type="text"
              value={item.name}
            />
            <input
              aria-label="Slug da rede social"
              className="block w-full rounded-lg border border-lineStrong bg-card px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
              onChange={(event) => updateSocialMedia(index, "slug", event.target.value)}
              placeholder="linkedin"
              type="text"
              value={item.slug}
            />
            <input
              aria-label="URL da rede social"
              className="block w-full rounded-lg border border-lineStrong bg-card px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
              onChange={(event) => updateSocialMedia(index, "url", event.target.value)}
              placeholder="https://linkedin.com/in/..."
              type="url"
              value={item.url}
            />
            <button
              className="rounded-lg border border-lineStrong px-4 py-3 text-sm font-semibold text-inkSoft transition hover:border-muted hover:bg-subtle"
              onClick={() => removeSocialMedia(index)}
              type="button"
            >
              Remover
            </button>
          </div>
        ))}
        <button
          className="w-fit rounded-lg border border-lineStrong px-4 py-2 text-sm font-semibold text-navy transition hover:border-muted hover:bg-subtle"
          onClick={addSocialMedia}
          type="button"
        >
          Adicionar rede
        </button>
      </fieldset>

      {errorMessage ? (
        <p className="rounded-lg border border-tomato/30 bg-tomato/10 px-4 py-3 text-[14px] font-semibold text-tomato">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-lg border border-green/30 bg-green/10 px-4 py-3 text-[14px] font-semibold text-greenDeep">
          {successMessage}
        </p>
      ) : null}

      <button
        className="btn btn-primary w-full sm:w-fit disabled:cursor-not-allowed disabled:opacity-65"
        disabled={submitting}
        type="submit"
      >
        {submitting ? "Salvando..." : "Salvar perfil de autor"}
      </button>
    </form>
  );
}
