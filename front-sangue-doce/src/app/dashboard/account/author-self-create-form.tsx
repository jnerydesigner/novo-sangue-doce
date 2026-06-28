"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AuthProfile } from "@/lib/api";

type AuthorSelfCreateFormProps = {
  profile: AuthProfile;
};

type FormState = {
  bio: string;
  name: string;
  role: string;
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
    return "Nao foi possivel criar o perfil de autor.";
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

export function AuthorSelfCreateForm({ profile }: AuthorSelfCreateFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    bio: "",
    name: profile.name,
    role: "Colunista",
    slug: slugify(profile.name),
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = <Field extends keyof FormState>(field: Field, value: FormState[Field]) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/authors", {
        body: JSON.stringify({
          bio: formState.bio.trim() || null,
          email: profile.email,
          name: formState.name.trim(),
          role: formState.role.trim(),
          slug: formState.slug.trim(),
          userId: profile.sub,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setSuccessMessage("Perfil de autor criado.");
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="mt-6 grid gap-4" onSubmit={submitForm}>
      <label className="block text-[13px] font-semibold text-muted" htmlFor="selfAuthorRole">
        Tagline / cargo editorial
        <input
          className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
          id="selfAuthorRole"
          minLength={2}
          name="selfAuthorRole"
          onChange={(event) => updateField("role", event.target.value)}
          required
          type="text"
          value={formState.role}
        />
      </label>

      <label className="block text-[13px] font-semibold text-muted" htmlFor="selfAuthorName">
        Nome publico
        <input
          className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
          id="selfAuthorName"
          minLength={2}
          name="selfAuthorName"
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

      <label className="block text-[13px] font-semibold text-muted" htmlFor="selfAuthorSlug">
        Slug
        <input
          className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
          id="selfAuthorSlug"
          name="selfAuthorSlug"
          onChange={(event) => updateField("slug", slugify(event.target.value))}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          required
          type="text"
          value={formState.slug}
        />
      </label>

      <label className="block text-[13px] font-semibold text-muted" htmlFor="selfAuthorBio">
        Bio
        <textarea
          className="mt-2 min-h-32 block w-full resize-y rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base leading-7 text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
          id="selfAuthorBio"
          minLength={10}
          name="selfAuthorBio"
          onChange={(event) => updateField("bio", event.target.value)}
          placeholder="Conte seu foco editorial e como seu nome deve aparecer nas materias."
          value={formState.bio}
        />
      </label>

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
        {submitting ? "Criando..." : "Criar perfil de autor"}
      </button>
    </form>
  );
}
